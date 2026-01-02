/**
 * Game Configuration for WordPour
 */

const config = {
    // Flask settings
    flaskCount: 4,
    maxFlaskHeight: 8,

    // Game timing (in seconds)
    blitzTime: 60,
    challengeTime: 90,

    // Scoring
    scrabbleScores: {
        'A': 1, 'B': 3, 'C': 3, 'D': 2, 'E': 1, 'F': 4, 'G': 2, 'H': 4,
        'I': 1, 'J': 8, 'K': 5, 'L': 1, 'M': 3, 'N': 1, 'O': 1, 'P': 3,
        'Q': 10, 'R': 1, 'S': 1, 'T': 1, 'U': 1, 'V': 4, 'W': 4, 'X': 8,
        'Y': 4, 'Z': 10
    },

    // Bonuses
    goldenLetterMultiplier: 2,
    rainbowLetterChance: 0, // Rainbow letters disabled for strategic gameplay

    // Word length bonuses
    wordLengthBonus: {
        5: 1.5,  // 50% bonus for 5-letter words
        6: 2.0,  // 100% bonus for 6-letter words
        7: 2.5,  // 150% bonus for 7-letter words
        8: 3.0,  // 200% bonus for 8+ letter words
    },

    // Combo settings
    comboTimeWindow: 5000, // 5 seconds to keep combo alive
    comboMultipliers: [1, 1.5, 2, 2.5, 3, 4, 5], // Multipliers for combo levels

    // Challenge mode levels
    challengeLevels: [
        { target: 50, letters: 16 },
        { target: 80, letters: 18 },
        { target: 120, letters: 20 },
        { target: 180, letters: 22 },
        { target: 250, letters: 24 },
        { target: 350, letters: 26 },
        { target: 500, letters: 28 },
        { target: 700, letters: 30 },
        { target: 1000, letters: 32 },
        { target: 1500, letters: 34 },
    ],

    // Power-ups (initial counts)
    powerups: {
        shuffle: 2,
        hint: 3,
        freeze: 1,
        undo: Infinity
    },

    // Letter distribution (based on Scrabble but adjusted for gameplay)
    letterPool: "AAAAAAAAABBCCDDDDEEEEEEEEEEEEFFGGGHHIIIIIIIIIJKLLLLMMNNNNNNOOOOOOOOPPQRRRRRRSSSSTTTTTTUUUUVVWWXYYZ",

    // Generate initial letters
    generateLetters: function(count = 8) {
        const pool = this.letterPool.split('');
        const letters = [];

        for (let i = 0; i < count && pool.length > 0; i++) {
            const index = Math.floor(Math.random() * pool.length);
            letters.push(pool.splice(index, 1)[0]);
        }

        return letters;
    },

    // Distribute letters to flasks
    distributeLetters: function(letters, flaskCount = 4) {
        const flasks = Array.from({ length: flaskCount }, () => []);

        // Leave one flask empty for pouring
        const targetFlasks = flaskCount - 1;

        letters.forEach((letter, index) => {
            const flaskIndex = index % targetFlasks;
            if (flasks[flaskIndex].length < this.maxFlaskHeight) {
                flasks[flaskIndex].push(letter);
            }
        });

        return flasks;
    },

    // Generate initial game state
    generateInitialState: function(letterCount = 8) {
        const letters = this.generateLetters(letterCount);
        return this.distributeLetters(letters, this.flaskCount);
    },

    // Result messages based on score
    getResultMessage: function(score, wordCount) {
        if (score >= 500) return { emoji: '🏆', title: 'Legendary!' };
        if (score >= 300) return { emoji: '🌟', title: 'Amazing!' };
        if (score >= 200) return { emoji: '🔥', title: 'On Fire!' };
        if (score >= 100) return { emoji: '✨', title: 'Great Job!' };
        if (score >= 50) return { emoji: '👍', title: 'Nice Work!' };
        if (wordCount > 0) return { emoji: '💪', title: 'Good Try!' };
        return { emoji: '🤔', title: 'Keep Practicing!' };
    }
};
