/**
 * Game Logic for WordPour
 * Handles core gameplay mechanics
 */

class WordPourGame {
    constructor() {
        this.mode = 'blitz'; // 'zen', 'blitz', 'challenge'
        this.flasks = [];
        this.score = 0;
        this.wordsFound = [];
        this.combo = 0;
        this.maxCombo = 0;
        this.lastWordTime = 0;
        this.timer = null;
        this.timeRemaining = 0;
        this.isPlaying = false;
        this.isPaused = false;
        this.isFrozen = false;

        // Challenge mode
        this.challengeLevel = 1;

        // Power-ups
        this.powerups = { ...config.powerups };

        // Undo history
        this.history = [];
        this.maxHistory = 20;

        // Golden/Rainbow letter tracking
        this.goldenLetterId = null;
        this.rainbowLetterIds = [];

        // Callbacks
        this.onScoreUpdate = null;
        this.onTimeUpdate = null;
        this.onComboUpdate = null;
        this.onWordFound = null;
        this.onGameEnd = null;
        this.onFlaskUpdate = null;
        this.onLevelComplete = null;
    }

    // Generate unique ID
    generateId() {
        return Math.random().toString(36).substr(2, 9);
    }

    // Initialize a new game
    init(mode = 'blitz') {
        this.mode = mode;
        this.score = 0;
        this.wordsFound = [];
        this.combo = 0;
        this.maxCombo = 0;
        this.lastWordTime = 0;
        this.isPlaying = true;
        this.isPaused = false;
        this.isFrozen = false;
        this.history = [];

        // Reset power-ups
        this.powerups = { ...config.powerups };

        // Set timer based on mode
        if (mode === 'blitz') {
            this.timeRemaining = config.blitzTime;
        } else if (mode === 'challenge') {
            this.timeRemaining = config.challengeTime;
        } else {
            this.timeRemaining = Infinity;
        }

        // Generate letters
        const letterCount = mode === 'challenge'
            ? config.challengeLevels[this.challengeLevel - 1]?.letters || 20
            : 20;

        this.generateFlasks(letterCount);

        // Start timer for timed modes
        if (mode !== 'zen') {
            this.startTimer();
        }

        return this.getState();
    }

    // Generate flasks with letters
    generateFlasks(letterCount) {
        const letterDistribution = config.generateInitialState(letterCount);
        this.flasks = [];

        // Track all letter objects for special letter assignment
        const allLetters = [];

        letterDistribution.forEach((letters, flaskIndex) => {
            const flask = {
                id: flaskIndex,
                letters: letters.map(char => {
                    const letterObj = {
                        id: this.generateId(),
                        char: char.toUpperCase(),
                        score: config.scrabbleScores[char.toUpperCase()] || 0,
                        isGolden: false,
                        isRainbow: false
                    };
                    allLetters.push(letterObj);
                    return letterObj;
                })
            };
            this.flasks.push(flask);
        });

        // Assign one golden letter
        if (allLetters.length > 0) {
            const goldenIndex = Math.floor(Math.random() * allLetters.length);
            allLetters[goldenIndex].isGolden = true;
            this.goldenLetterId = allLetters[goldenIndex].id;
        }

        // Maybe assign rainbow letters
        this.rainbowLetterIds = [];
        allLetters.forEach(letter => {
            if (!letter.isGolden && Math.random() < config.rainbowLetterChance) {
                letter.isRainbow = true;
                this.rainbowLetterIds.push(letter.id);
            }
        });
    }

    // Start the game timer
    startTimer() {
        if (this.timer) clearInterval(this.timer);

        this.timer = setInterval(() => {
            if (!this.isPaused && !this.isFrozen && this.timeRemaining > 0) {
                this.timeRemaining--;

                if (this.onTimeUpdate) {
                    this.onTimeUpdate(this.timeRemaining);
                }

                if (this.timeRemaining <= 0) {
                    this.endGame();
                }
            }
        }, 1000);
    }

    // Stop the timer
    stopTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    // Pause/resume the game
    togglePause() {
        this.isPaused = !this.isPaused;
        return this.isPaused;
    }

    // Pour letter from source flask to target flask
    pour(sourceIndex, targetIndex) {
        if (!this.isPlaying) return { success: false, error: 'Game not active' };
        if (sourceIndex === targetIndex) return { success: false, error: 'Same flask' };

        const source = this.flasks[sourceIndex];
        const target = this.flasks[targetIndex];

        if (!source || !target) return { success: false, error: 'Invalid flask' };
        if (source.letters.length === 0) return { success: false, error: 'Source empty' };
        if (target.letters.length >= config.maxFlaskHeight) return { success: false, error: 'Target full' };

        // Save state for undo
        this.saveHistory();

        // Move letter
        const letter = source.letters.pop();
        target.letters.push(letter);

        if (this.onFlaskUpdate) {
            this.onFlaskUpdate(this.flasks);
        }

        return {
            success: true,
            letter: letter,
            sourceIndex,
            targetIndex
        };
    }

    // Save current state for undo
    saveHistory() {
        const state = {
            flasks: this.flasks.map(flask => ({
                id: flask.id,
                letters: flask.letters.map(l => ({ ...l }))
            })),
            score: this.score,
            combo: this.combo
        };

        this.history.push(state);

        if (this.history.length > this.maxHistory) {
            this.history.shift();
        }
    }

    // Undo last pour
    undo() {
        if (this.history.length === 0) return false;

        const state = this.history.pop();
        this.flasks = state.flasks;
        this.score = state.score;
        this.combo = state.combo;

        if (this.onFlaskUpdate) {
            this.onFlaskUpdate(this.flasks);
        }
        if (this.onScoreUpdate) {
            this.onScoreUpdate(this.score);
        }
        if (this.onComboUpdate) {
            this.onComboUpdate(this.combo);
        }

        return true;
    }

    // Find all valid words in a flask
    findWordsInFlask(flask) {
        const words = [];
        const letters = flask.letters;

        if (letters.length < 2) return words;

        // Check all possible consecutive sequences
        for (let start = 0; start < letters.length; start++) {
            for (let end = start + 2; end <= letters.length; end++) {
                const sequence = letters.slice(start, end);
                const word = sequence.map(l => l.isRainbow ? '*' : l.char).join('');

                // For rainbow letters, we need to check all possible substitutions
                const possibleWords = this.expandRainbow(word);

                for (const possibleWord of possibleWords) {
                    if (window.dictionary && window.dictionary.has(possibleWord)) {
                        // Calculate score
                        let wordScore = 0;
                        let hasGolden = false;

                        sequence.forEach(l => {
                            wordScore += l.score;
                            if (l.isGolden) hasGolden = true;
                        });

                        // Apply length bonus
                        const lengthBonus = config.wordLengthBonus[possibleWord.length] ||
                            (possibleWord.length >= 8 ? config.wordLengthBonus[8] : 1);
                        wordScore = Math.floor(wordScore * lengthBonus);

                        // Apply golden bonus
                        if (hasGolden) {
                            wordScore *= config.goldenLetterMultiplier;
                        }

                        words.push({
                            word: possibleWord,
                            score: wordScore,
                            hasGolden,
                            length: possibleWord.length,
                            start,
                            end
                        });
                    }
                }
            }
        }

        return words;
    }

    // Expand rainbow wildcards to all possible letters
    expandRainbow(word) {
        if (!word.includes('*')) return [word];

        const results = [];
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

        const expand = (current, index) => {
            if (index >= current.length) {
                results.push(current);
                return;
            }

            if (current[index] === '*') {
                for (const letter of alphabet) {
                    expand(current.substring(0, index) + letter + current.substring(index + 1), index + 1);
                }
            } else {
                expand(current, index + 1);
            }
        };

        expand(word, 0);
        return results;
    }

    // Calculate and submit score
    submitScore() {
        const allWords = [];
        let totalNewScore = 0;

        this.flasks.forEach((flask, flaskIndex) => {
            const words = this.findWordsInFlask(flask);
            words.forEach(wordData => {
                // Check if word already found
                if (!this.wordsFound.includes(wordData.word)) {
                    this.wordsFound.push(wordData.word);
                    allWords.push(wordData);
                    totalNewScore += wordData.score;
                }
            });
        });

        if (allWords.length > 0) {
            // Update combo
            const now = Date.now();
            if (now - this.lastWordTime < config.comboTimeWindow) {
                this.combo = Math.min(this.combo + allWords.length, config.comboMultipliers.length - 1);
            } else {
                this.combo = Math.min(allWords.length - 1, config.comboMultipliers.length - 1);
            }
            this.lastWordTime = now;
            this.maxCombo = Math.max(this.maxCombo, this.combo);

            // Apply combo multiplier
            const comboMultiplier = config.comboMultipliers[this.combo];
            totalNewScore = Math.floor(totalNewScore * comboMultiplier);

            // Update score
            this.score += totalNewScore;

            // Callbacks
            if (this.onWordFound) {
                this.onWordFound(allWords, totalNewScore, this.combo);
            }
            if (this.onScoreUpdate) {
                this.onScoreUpdate(this.score);
            }
            if (this.onComboUpdate) {
                this.onComboUpdate(this.combo);
            }

            // Check challenge mode completion
            if (this.mode === 'challenge') {
                const level = config.challengeLevels[this.challengeLevel - 1];
                if (level && this.score >= level.target) {
                    this.levelComplete();
                }
            }
        }

        return {
            words: allWords,
            newScore: totalNewScore,
            totalScore: this.score,
            combo: this.combo
        };
    }

    // Complete a challenge level
    levelComplete() {
        if (this.onLevelComplete) {
            this.onLevelComplete(this.challengeLevel);
        }

        // Award bonus hint
        this.powerups.hint++;

        this.challengeLevel++;

        // Check if more levels exist
        if (this.challengeLevel <= config.challengeLevels.length) {
            // Reset for next level
            const newLevel = config.challengeLevels[this.challengeLevel - 1];
            this.generateFlasks(newLevel.letters);
            this.timeRemaining = config.challengeTime;
            this.wordsFound = [];
            this.score = 0;
            this.combo = 0;
        } else {
            // All levels complete!
            this.endGame(true);
        }
    }

    // Power-up: Shuffle all letters
    useShuffle() {
        if (this.powerups.shuffle <= 0) return false;
        this.powerups.shuffle--;

        // Collect all letters
        const allLetters = [];
        this.flasks.forEach(flask => {
            allLetters.push(...flask.letters);
            flask.letters = [];
        });

        // Shuffle
        for (let i = allLetters.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [allLetters[i], allLetters[j]] = [allLetters[j], allLetters[i]];
        }

        // Redistribute (leave one flask empty)
        let flaskIndex = 0;
        allLetters.forEach(letter => {
            if (this.flasks[flaskIndex].letters.length >= config.maxFlaskHeight) {
                flaskIndex = (flaskIndex + 1) % (this.flasks.length - 1);
            }
            this.flasks[flaskIndex].letters.push(letter);
            flaskIndex = (flaskIndex + 1) % (this.flasks.length - 1);
        });

        if (this.onFlaskUpdate) {
            this.onFlaskUpdate(this.flasks);
        }

        return true;
    }

    // Power-up: Show a hint
    useHint() {
        if (this.powerups.hint <= 0) return null;
        this.powerups.hint--;

        // Find best word across all flasks
        let bestWord = null;

        this.flasks.forEach(flask => {
            const words = this.findWordsInFlask(flask);
            words.forEach(word => {
                if (!this.wordsFound.includes(word.word)) {
                    if (!bestWord || word.score > bestWord.score) {
                        bestWord = word;
                    }
                }
            });
        });

        return bestWord;
    }

    // Power-up: Freeze timer
    useFreeze() {
        if (this.mode === 'zen') return false;
        if (this.powerups.freeze <= 0) return false;
        this.powerups.freeze--;

        this.isFrozen = true;

        setTimeout(() => {
            this.isFrozen = false;
        }, 10000); // 10 second freeze

        return true;
    }

    // End the game
    endGame(victory = false) {
        this.isPlaying = false;
        this.stopTimer();

        // Find longest word
        const longestWord = this.wordsFound.reduce((longest, word) =>
            word.length > longest.length ? word : longest, '');

        const result = {
            score: this.score,
            wordsFound: this.wordsFound,
            wordCount: this.wordsFound.length,
            maxCombo: this.maxCombo,
            longestWord,
            victory,
            mode: this.mode,
            challengeLevel: this.mode === 'challenge' ? this.challengeLevel : null
        };

        if (this.onGameEnd) {
            this.onGameEnd(result);
        }

        return result;
    }

    // Get current game state
    getState() {
        return {
            mode: this.mode,
            flasks: this.flasks,
            score: this.score,
            wordsFound: this.wordsFound,
            combo: this.combo,
            maxCombo: this.maxCombo,
            timeRemaining: this.timeRemaining,
            isPlaying: this.isPlaying,
            isPaused: this.isPaused,
            isFrozen: this.isFrozen,
            powerups: { ...this.powerups },
            challengeLevel: this.challengeLevel
        };
    }

    // Get flask by index
    getFlask(index) {
        return this.flasks[index];
    }

    // Check if a flask is empty
    isFlaskEmpty(index) {
        return this.flasks[index]?.letters.length === 0;
    }

    // Check if a flask is full
    isFlaskFull(index) {
        return this.flasks[index]?.letters.length >= config.maxFlaskHeight;
    }
}

// Export for use in app.js
window.WordPourGame = WordPourGame;
