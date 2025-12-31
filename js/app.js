/**
 * Main Application Controller for WordPour
 * Handles UI, events, and Firebase integration
 */

document.addEventListener('DOMContentLoaded', () => {
    // ==================== DOM ELEMENTS ====================
    const screens = {
        mainMenu: document.getElementById('mainMenu'),
        gameScreen: document.getElementById('gameScreen'),
        resultsScreen: document.getElementById('resultsScreen'),
        leaderboardScreen: document.getElementById('leaderboardScreen')
    };

    const modals = {
        howToPlay: document.getElementById('howToPlayModal'),
        levelComplete: document.getElementById('levelCompleteModal')
    };

    const elements = {
        // Menu
        modeCards: document.querySelectorAll('.mode-card'),
        viewLeaderboardBtn: document.getElementById('viewLeaderboardBtn'),
        howToPlayBtn: document.getElementById('howToPlayBtn'),
        soundToggle: document.getElementById('soundToggle'),
        closeTutorial: document.getElementById('closeTutorial'),

        // Game
        backToMenu: document.getElementById('backToMenu'),
        currentScore: document.getElementById('currentScore'),
        comboCount: document.getElementById('comboCount'),
        comboContainer: document.getElementById('comboContainer'),
        gameTimer: document.getElementById('gameTimer'),
        timerContainer: document.getElementById('timerContainer'),
        modeBadge: document.getElementById('modeBadge'),
        challengeBar: document.getElementById('challengeBar'),
        challengeLevel: document.getElementById('challengeLevel'),
        targetScore: document.getElementById('targetScore'),
        challengeProgress: document.getElementById('challengeProgress'),
        flasksContainer: document.getElementById('flasksContainer'),
        wordsList: document.getElementById('wordsList'),
        submitWords: document.getElementById('submitWords'),
        floatingScore: document.getElementById('floatingScore'),
        comboPopup: document.getElementById('comboPopup'),

        // Power-ups
        shufflePower: document.getElementById('shufflePower'),
        hintPower: document.getElementById('hintPower'),
        freezePower: document.getElementById('freezePower'),
        undoPower: document.getElementById('undoPower'),

        // Results
        resultEmoji: document.getElementById('resultEmoji'),
        resultTitle: document.getElementById('resultTitle'),
        finalScoreNumber: document.getElementById('finalScoreNumber'),
        totalWords: document.getElementById('totalWords'),
        bestCombo: document.getElementById('bestCombo'),
        longestWord: document.getElementById('longestWord'),
        wordsBreakdown: document.getElementById('wordsBreakdown'),
        playerNameInput: document.getElementById('playerNameInput'),
        saveScoreBtn: document.getElementById('saveScoreBtn'),
        playAgainBtn: document.getElementById('playAgainBtn'),
        viewLeaderboardFromResults: document.getElementById('viewLeaderboardFromResults'),
        backToMenuFromResults: document.getElementById('backToMenuFromResults'),

        // Leaderboard
        backFromLeaderboard: document.getElementById('backFromLeaderboard'),
        leaderboardTabs: document.querySelectorAll('.leaderboard-tabs .tab-btn'),
        podium: document.getElementById('podium'),
        leaderboardListContent: document.getElementById('leaderboardListContent'),
        playFromLeaderboard: document.getElementById('playFromLeaderboard'),

        // Level Complete
        completedLevelNum: document.getElementById('completedLevelNum'),
        nextLevelBtn: document.getElementById('nextLevelBtn'),

        // Toast
        toastContainer: document.getElementById('toastContainer')
    };

    // ==================== GAME INSTANCE ====================
    const game = new WordPourGame();
    let currentMode = 'blitz';
    let draggedFlask = null;
    let lastGameResult = null;

    // ==================== SCREEN MANAGEMENT ====================
    function showScreen(screenId) {
        Object.values(screens).forEach(screen => screen.classList.remove('active'));
        if (screens[screenId]) {
            screens[screenId].classList.add('active');
        }
    }

    function showModal(modalId) {
        if (modals[modalId]) {
            modals[modalId].classList.add('active');
        }
    }

    function hideModal(modalId) {
        if (modals[modalId]) {
            modals[modalId].classList.remove('active');
        }
    }

    // ==================== TOAST NOTIFICATIONS ====================
    function showToast(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        const icons = {
            success: '✓',
            error: '✕',
            info: 'ℹ',
            warning: '⚠'
        };

        toast.innerHTML = `
            <span class="toast-icon">${icons[type] || icons.info}</span>
            <span class="toast-message">${message}</span>
        `;

        elements.toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('hiding');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }

    // ==================== FLASK RENDERING ====================
    function renderFlasks(flasks) {
        elements.flasksContainer.innerHTML = '';

        flasks.forEach((flask, index) => {
            const flaskEl = document.createElement('div');
            flaskEl.className = 'flask';
            flaskEl.dataset.index = index;

            if (flask.letters.length === 0) {
                flaskEl.classList.add('empty');
            }
            if (flask.letters.length >= config.maxFlaskHeight) {
                flaskEl.classList.add('full');
            }

            flaskEl.innerHTML = `
                <div class="flask-neck"></div>
                <div class="flask-body">
                    <div class="letter-stack">
                        ${flask.letters.map(letter => `
                            <div class="letter ${letter.isGolden ? 'golden' : ''} ${letter.isRainbow ? 'rainbow' : ''}"
                                 data-id="${letter.id}">
                                ${letter.isRainbow ? '★' : letter.char}
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;

            // Drag and drop events
            flaskEl.draggable = flask.letters.length > 0;

            flaskEl.addEventListener('dragstart', handleDragStart);
            flaskEl.addEventListener('dragend', handleDragEnd);
            flaskEl.addEventListener('dragover', handleDragOver);
            flaskEl.addEventListener('dragleave', handleDragLeave);
            flaskEl.addEventListener('drop', handleDrop);

            // Touch events for mobile
            flaskEl.addEventListener('touchstart', handleTouchStart, { passive: false });
            flaskEl.addEventListener('touchmove', handleTouchMove, { passive: false });
            flaskEl.addEventListener('touchend', handleTouchEnd);

            elements.flasksContainer.appendChild(flaskEl);
        });
    }

    // ==================== DRAG AND DROP ====================
    function handleDragStart(e) {
        const flaskIndex = parseInt(e.currentTarget.dataset.index);
        if (game.isFlaskEmpty(flaskIndex)) {
            e.preventDefault();
            return;
        }

        draggedFlask = flaskIndex;
        e.currentTarget.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';

        window.audio?.click();
    }

    function handleDragEnd(e) {
        e.currentTarget.classList.remove('dragging');
        document.querySelectorAll('.flask').forEach(f => f.classList.remove('drag-over'));
        draggedFlask = null;
    }

    function handleDragOver(e) {
        e.preventDefault();
        const targetIndex = parseInt(e.currentTarget.dataset.index);

        if (draggedFlask !== null && draggedFlask !== targetIndex && !game.isFlaskFull(targetIndex)) {
            e.currentTarget.classList.add('drag-over');
            e.dataTransfer.dropEffect = 'move';
        }
    }

    function handleDragLeave(e) {
        e.currentTarget.classList.remove('drag-over');
    }

    function handleDrop(e) {
        e.preventDefault();
        e.currentTarget.classList.remove('drag-over');

        const targetIndex = parseInt(e.currentTarget.dataset.index);

        if (draggedFlask !== null) {
            performPour(draggedFlask, targetIndex);
        }

        draggedFlask = null;
    }

    // ==================== TOUCH HANDLING ====================
    let touchStartFlask = null;
    let touchClone = null;

    function handleTouchStart(e) {
        const flask = e.currentTarget;
        const flaskIndex = parseInt(flask.dataset.index);

        if (game.isFlaskEmpty(flaskIndex)) return;

        touchStartFlask = flaskIndex;
        flask.classList.add('dragging');

        // Create visual clone
        const rect = flask.getBoundingClientRect();
        touchClone = flask.cloneNode(true);
        touchClone.style.position = 'fixed';
        touchClone.style.left = rect.left + 'px';
        touchClone.style.top = rect.top + 'px';
        touchClone.style.width = rect.width + 'px';
        touchClone.style.height = rect.height + 'px';
        touchClone.style.opacity = '0.8';
        touchClone.style.pointerEvents = 'none';
        touchClone.style.zIndex = '1000';
        document.body.appendChild(touchClone);

        window.audio?.click();
    }

    function handleTouchMove(e) {
        if (touchClone && touchStartFlask !== null) {
            e.preventDefault();
            const touch = e.touches[0];
            touchClone.style.left = (touch.clientX - touchClone.offsetWidth / 2) + 'px';
            touchClone.style.top = (touch.clientY - touchClone.offsetHeight / 2) + 'px';

            // Find flask under touch
            const flaskUnder = document.elementFromPoint(touch.clientX, touch.clientY)?.closest('.flask');
            document.querySelectorAll('.flask').forEach(f => f.classList.remove('drag-over'));

            if (flaskUnder && parseInt(flaskUnder.dataset.index) !== touchStartFlask) {
                flaskUnder.classList.add('drag-over');
            }
        }
    }

    function handleTouchEnd(e) {
        if (touchClone) {
            touchClone.remove();
            touchClone = null;
        }

        document.querySelectorAll('.flask').forEach(f => {
            f.classList.remove('dragging');
            f.classList.remove('drag-over');
        });

        if (touchStartFlask !== null) {
            const touch = e.changedTouches[0];
            const targetFlask = document.elementFromPoint(touch.clientX, touch.clientY)?.closest('.flask');

            if (targetFlask) {
                const targetIndex = parseInt(targetFlask.dataset.index);
                if (targetIndex !== touchStartFlask) {
                    performPour(touchStartFlask, targetIndex);
                }
            }
        }

        touchStartFlask = null;
    }

    // ==================== POURING ====================
    function performPour(sourceIndex, targetIndex) {
        const result = game.pour(sourceIndex, targetIndex);

        if (result.success) {
            window.audio?.pour();
            animatePour(sourceIndex, targetIndex, result.letter);
        } else {
            window.audio?.error();
            showToast(result.error, 'error', 1500);
        }
    }

    function animatePour(sourceIndex, targetIndex, letter) {
        const sourceFlask = elements.flasksContainer.children[sourceIndex];
        const targetFlask = elements.flasksContainer.children[targetIndex];

        if (!sourceFlask || !targetFlask) return;

        const sourceRect = sourceFlask.getBoundingClientRect();
        const targetRect = targetFlask.getBoundingClientRect();

        // Determine pour direction (left or right)
        const pouringLeft = targetRect.left < sourceRect.left;

        // Apply flask tilt animation
        sourceFlask.style.transformOrigin = pouringLeft ? 'bottom right' : 'bottom left';
        sourceFlask.classList.add('pouring-source');
        targetFlask.classList.add('receiving');

        // Calculate pour path
        const sourceX = sourceRect.left + sourceRect.width / 2;
        const sourceY = sourceRect.top + 20;
        const targetX = targetRect.left + targetRect.width / 2;
        const targetY = targetRect.top + 60;

        // Create liquid droplets stream (DOM-based for consistent styling)
        createPourStream(sourceX, sourceY, targetX, targetY, letter);

        // Also use particle system for extra liquid effect
        const particleColor = letter.isGolden ? '#fbbf24' : letter.isRainbow ? '#a855f7' : '#6366f1';
        window.particles?.pourStream(sourceX, sourceY, targetX, targetY, { color: particleColor });

        // Create the main letter element that pours
        const letterEl = document.createElement('div');
        letterEl.className = `pour-letter ${letter.isGolden ? 'golden' : ''} ${letter.isRainbow ? 'rainbow' : ''}`;
        letterEl.textContent = letter.isRainbow ? '★' : letter.char;
        document.body.appendChild(letterEl);

        // Animate letter with physics
        animateLetterPhysics(letterEl, sourceX, sourceY, targetX, targetY, () => {
            // On complete - create splash and update
            createSplash(targetX, targetY, letter);
            addLiquidWave(targetFlask);
            letterEl.remove();
            renderFlasks(game.flasks);
        });

        // Clean up flask animations
        setTimeout(() => {
            sourceFlask.classList.remove('pouring-source');
            targetFlask.classList.remove('receiving');
            sourceFlask.style.transformOrigin = '';
        }, 700);
    }

    function createPourStream(startX, startY, endX, endY, letter) {
        const dropletCount = 12;
        const duration = 500;
        const colorClass = letter.isGolden ? 'golden' : letter.isRainbow ? 'rainbow' : '';

        for (let i = 0; i < dropletCount; i++) {
            setTimeout(() => {
                const droplet = document.createElement('div');
                droplet.className = `pour-droplet ${colorClass}`;
                document.body.appendChild(droplet);

                // Random offset for natural look
                const offsetX = (Math.random() - 0.5) * 20;
                const offsetY = Math.random() * 10;

                // Animate droplet with physics
                animateDroplet(droplet, startX + offsetX, startY + offsetY, endX, endY);
            }, i * 25);
        }
    }

    function animateDroplet(droplet, startX, startY, endX, endY) {
        const duration = 400 + Math.random() * 150;
        const startTime = performance.now();

        // Physics parameters
        const gravity = 0.004;
        const initialVelX = (endX - startX) / duration * 0.7;
        const initialVelY = -0.3; // Start going up slightly

        function updateDroplet(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            if (progress >= 1) {
                droplet.remove();
                return;
            }

            // Quadratic bezier-like motion with gravity
            const t = progress;
            const gravity_effect = gravity * elapsed * elapsed;

            // Horizontal: smooth movement toward target
            const x = startX + (endX - startX) * easeOutQuad(t) + (Math.random() - 0.5) * 3;

            // Vertical: arc up then accelerate down
            const arcHeight = -60 * (1 - t);
            const y = startY + (endY - startY) * t + arcHeight * Math.sin(t * Math.PI) + gravity_effect;

            droplet.style.left = x - 6 + 'px';
            droplet.style.top = y - 6 + 'px';
            droplet.style.opacity = 0.8 - progress * 0.3;
            droplet.style.transform = `scale(${1 - progress * 0.4}) rotate(${progress * 180}deg)`;

            requestAnimationFrame(updateDroplet);
        }

        requestAnimationFrame(updateDroplet);
    }

    function animateLetterPhysics(letterEl, startX, startY, endX, endY, onComplete) {
        const duration = 550;
        const startTime = performance.now();

        // Start position (slightly above source)
        letterEl.style.left = startX - 22 + 'px';
        letterEl.style.top = startY - 22 + 'px';

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            if (progress >= 1) {
                onComplete();
                return;
            }

            // Smooth easing
            const t = easeInOutCubic(progress);

            // Horizontal movement with slight wobble
            const wobble = Math.sin(progress * Math.PI * 4) * 5 * (1 - progress);
            const x = startX + (endX - startX) * t + wobble;

            // Vertical: arc trajectory
            // Start by going up, then fall with acceleration
            const arcProgress = progress < 0.3
                ? -progress / 0.3  // Go up for first 30%
                : (progress - 0.3) / 0.7;  // Then go down

            const arcHeight = 80;
            const verticalArc = progress < 0.3
                ? -arcHeight * easeOutQuad(progress / 0.3)  // Rise up
                : -arcHeight * (1 - easeInQuad((progress - 0.3) / 0.7));  // Fall down

            const y = startY + (endY - startY) * easeInQuad(progress) + verticalArc;

            // Rotation for tumbling effect
            const rotation = Math.sin(progress * Math.PI * 2) * 25 * (1 - progress * 0.5);

            // Scale: slight squeeze during fall
            const scale = 1 + Math.sin(progress * Math.PI) * 0.15;

            letterEl.style.left = x - 22 + 'px';
            letterEl.style.top = y - 22 + 'px';
            letterEl.style.transform = `rotate(${rotation}deg) scale(${scale})`;

            requestAnimationFrame(update);
        }

        requestAnimationFrame(update);
    }

    function createSplash(x, y, letter) {
        const splashCount = 8;
        const colorClass = letter.isGolden ? 'golden' : '';

        for (let i = 0; i < splashCount; i++) {
            const splash = document.createElement('div');
            splash.className = `splash-droplet ${colorClass}`;
            document.body.appendChild(splash);

            const angle = (Math.PI * 2 * i) / splashCount - Math.PI / 2;
            const velocity = 3 + Math.random() * 4;
            const velX = Math.cos(angle) * velocity;
            const velY = Math.sin(angle) * velocity - 2;

            animateSplashDroplet(splash, x, y, velX, velY);
        }

        // Trigger particle system for splash effect
        const splashColor = letter.isGolden ? '#fbbf24' : letter.isRainbow ? '#a855f7' : '#6366f1';
        window.particles?.splash(x, y, { color: splashColor });
    }

    function animateSplashDroplet(droplet, startX, startY, velX, velY) {
        const duration = 400;
        const startTime = performance.now();
        const gravity = 0.015;

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            if (progress >= 1) {
                droplet.remove();
                return;
            }

            const x = startX + velX * elapsed * 0.1;
            const y = startY + velY * elapsed * 0.1 + gravity * elapsed * elapsed * 0.01;

            droplet.style.left = x - 4 + 'px';
            droplet.style.top = y - 4 + 'px';
            droplet.style.opacity = 1 - progress;
            droplet.style.transform = `scale(${1 - progress * 0.5})`;

            requestAnimationFrame(update);
        }

        requestAnimationFrame(update);
    }

    // Easing functions
    function easeOutQuad(t) {
        return t * (2 - t);
    }

    function easeInQuad(t) {
        return t * t;
    }

    function easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function addLiquidWave(flask) {
        const body = flask.querySelector('.flask-body');
        if (!body) return;

        const wave = document.createElement('div');
        wave.className = 'liquid-wave';
        body.appendChild(wave);

        // Add bubbles
        for (let i = 0; i < 4; i++) {
            setTimeout(() => {
                const bubble = document.createElement('div');
                bubble.className = 'pour-bubble';
                bubble.style.left = 20 + Math.random() * 60 + '%';
                bubble.style.bottom = '10px';
                bubble.style.animation = `bubbleUp 0.6s ease-out forwards`;
                body.appendChild(bubble);
                setTimeout(() => bubble.remove(), 600);
            }, i * 80);
        }

        setTimeout(() => wave.remove(), 800);
    }

    // ==================== SCORING ====================
    function handleSubmit() {
        const result = game.submitScore();

        if (result.words.length > 0) {
            // Play sound
            if (result.words.some(w => w.length >= 5)) {
                window.audio?.bigWord();
            } else {
                window.audio?.wordFound();
            }

            // Show floating score
            showFloatingScore(result.newScore);

            // Show combo if applicable
            if (result.combo > 0) {
                showComboPopup(result.combo);
                window.audio?.combo();
            }

            // Add word chips
            result.words.forEach(wordData => {
                addWordChip(wordData);
            });

            // Particle effects
            window.particles?.wordCelebration(window.innerWidth / 2, window.innerHeight / 2);

            // Update UI
            updateScoreDisplay(result.totalScore);
            updateComboDisplay(result.combo);

            // Screen shake for big scores
            if (result.newScore >= 50) {
                document.body.classList.add('screen-shake');
                setTimeout(() => document.body.classList.remove('screen-shake'), 400);
            }
        } else {
            showToast('No new words found!', 'info');
        }
    }

    function showFloatingScore(score) {
        elements.floatingScore.textContent = `+${score}`;
        elements.floatingScore.classList.remove('active');
        void elements.floatingScore.offsetWidth; // Force reflow
        elements.floatingScore.classList.add('active');
    }

    function showComboPopup(combo) {
        const multiplier = config.comboMultipliers[combo] || 1;
        elements.comboPopup.querySelector('.combo-multiplier').textContent = `${multiplier}x`;
        elements.comboPopup.classList.remove('active');
        void elements.comboPopup.offsetWidth;
        elements.comboPopup.classList.add('active');
    }

    function addWordChip(wordData) {
        const chip = document.createElement('div');
        chip.className = 'word-chip';
        chip.innerHTML = `
            ${wordData.word}
            <span class="word-score">+${wordData.score}</span>
        `;
        elements.wordsList.appendChild(chip);
    }

    function updateScoreDisplay(score) {
        elements.currentScore.textContent = score;

        // Update challenge progress
        if (game.mode === 'challenge') {
            const level = config.challengeLevels[game.challengeLevel - 1];
            if (level) {
                const progress = Math.min((score / level.target) * 100, 100);
                elements.challengeProgress.style.width = progress + '%';
            }
        }
    }

    function updateComboDisplay(combo) {
        const multiplier = config.comboMultipliers[combo] || 1;
        elements.comboCount.textContent = `${multiplier}x`;

        if (combo > 0) {
            elements.comboContainer.classList.add('active');
        }
    }

    // ==================== TIMER ====================
    function updateTimerDisplay(seconds) {
        if (seconds === Infinity) {
            elements.timerContainer.style.display = 'none';
            return;
        }

        elements.timerContainer.style.display = 'flex';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        elements.gameTimer.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;

        // Warning states
        elements.timerContainer.classList.remove('warning', 'danger');
        if (seconds <= 10) {
            elements.timerContainer.classList.add('danger');
            window.audio?.timerCritical();
        } else if (seconds <= 30) {
            elements.timerContainer.classList.add('warning');
        }
    }

    // ==================== POWER-UPS ====================
    function updatePowerupDisplay() {
        elements.shufflePower.querySelector('.powerup-count').textContent = game.powerups.shuffle;
        elements.hintPower.querySelector('.powerup-count').textContent = game.powerups.hint;
        elements.freezePower.querySelector('.powerup-count').textContent = game.powerups.freeze;
        elements.undoPower.querySelector('.powerup-count').textContent = '∞';

        elements.shufflePower.disabled = game.powerups.shuffle <= 0;
        elements.hintPower.disabled = game.powerups.hint <= 0;
        elements.freezePower.disabled = game.powerups.freeze <= 0 || game.mode === 'zen';
    }

    elements.shufflePower.addEventListener('click', () => {
        if (game.useShuffle()) {
            window.audio?.shuffle();
            showToast('Letters shuffled!', 'success');
            updatePowerupDisplay();
        }
    });

    elements.hintPower.addEventListener('click', () => {
        const hint = game.useHint();
        if (hint) {
            window.audio?.hint();
            showToast(`Hint: Look for "${hint.word}"`, 'info', 4000);
            updatePowerupDisplay();
        } else {
            showToast('No hints available!', 'warning');
        }
    });

    elements.freezePower.addEventListener('click', () => {
        if (game.useFreeze()) {
            window.audio?.freeze();
            showToast('Time frozen for 10 seconds!', 'success');
            elements.timerContainer.classList.add('frozen');
            setTimeout(() => {
                elements.timerContainer.classList.remove('frozen');
            }, 10000);
            updatePowerupDisplay();
        }
    });

    elements.undoPower.addEventListener('click', () => {
        if (game.undo()) {
            window.audio?.undo();
        } else {
            showToast('Nothing to undo!', 'warning');
        }
    });

    // ==================== GAME LIFECYCLE ====================
    function startGame(mode) {
        currentMode = mode;
        const state = game.init(mode);

        // Update UI
        elements.modeBadge.textContent = mode.charAt(0).toUpperCase() + mode.slice(1);
        elements.wordsList.innerHTML = '';
        elements.currentScore.textContent = '0';
        elements.comboCount.textContent = '1x';

        // Show/hide challenge bar
        if (mode === 'challenge') {
            elements.challengeBar.classList.add('active');
            elements.challengeLevel.textContent = game.challengeLevel;
            elements.targetScore.textContent = config.challengeLevels[game.challengeLevel - 1]?.target || 50;
            elements.challengeProgress.style.width = '0%';
        } else {
            elements.challengeBar.classList.remove('active');
        }

        // Timer visibility
        if (mode === 'zen') {
            elements.timerContainer.style.display = 'none';
        } else {
            elements.timerContainer.style.display = 'flex';
        }

        // Render flasks
        renderFlasks(state.flasks);
        updatePowerupDisplay();
        updateTimerDisplay(state.timeRemaining);

        // Set up game callbacks
        game.onTimeUpdate = updateTimerDisplay;
        game.onScoreUpdate = updateScoreDisplay;
        game.onComboUpdate = updateComboDisplay;
        game.onFlaskUpdate = renderFlasks;
        game.onGameEnd = handleGameEnd;
        game.onLevelComplete = handleLevelComplete;

        showScreen('gameScreen');
    }

    function handleGameEnd(result) {
        lastGameResult = result;

        // Play sound
        if (result.victory || result.score >= 100) {
            window.audio?.victory();
            window.particles?.bigCelebration();
        } else {
            window.audio?.gameOver();
        }

        // Update results screen
        const message = config.getResultMessage(result.score, result.wordCount);
        elements.resultEmoji.textContent = message.emoji;
        elements.resultTitle.textContent = message.title;
        elements.finalScoreNumber.textContent = result.score;
        elements.totalWords.textContent = result.wordCount;
        elements.bestCombo.textContent = `${config.comboMultipliers[result.maxCombo] || 1}x`;
        elements.longestWord.textContent = result.longestWord || '-';

        // Words breakdown
        elements.wordsBreakdown.innerHTML = '';
        result.wordsFound.forEach(word => {
            const chip = document.createElement('div');
            chip.className = 'word-chip';
            chip.textContent = word;
            elements.wordsBreakdown.appendChild(chip);
        });

        // Show results after short delay
        setTimeout(() => {
            showScreen('resultsScreen');
        }, 500);
    }

    function handleLevelComplete(level) {
        window.audio?.levelComplete();
        window.particles?.levelUp();

        elements.completedLevelNum.textContent = level;
        showModal('levelComplete');
    }

    // ==================== FIREBASE INTEGRATION ====================
    async function saveScore(name, score) {
        try {
            const { collection, addDoc } = window.firestoreModules;
            const db = window.db;

            await addDoc(collection(db, "highScores"), {
                name: name,
                score: score,
                wordsCreated: lastGameResult?.wordCount || 0,
                wordsList: lastGameResult?.wordsFound || [],
                mode: currentMode,
                timestamp: new Date().toISOString()
            });

            showToast('Score saved!', 'success');
            return true;
        } catch (error) {
            console.error('Error saving score:', error);
            showToast('Failed to save score', 'error');
            return false;
        }
    }

    async function loadLeaderboard() {
        try {
            const { collection, getDocs, query, orderBy, limit } = window.firestoreModules;
            const db = window.db;

            const q = query(
                collection(db, "highScores"),
                orderBy("score", "desc"),
                limit(10)
            );

            const snapshot = await getDocs(q);
            const data = [];

            snapshot.forEach(doc => {
                data.push({ id: doc.id, ...doc.data() });
            });

            return data;
        } catch (error) {
            console.error('Error loading leaderboard:', error);
            return [];
        }
    }

    function renderLeaderboard(data) {
        // Render podium (top 3)
        elements.podium.innerHTML = '';

        const positions = ['second', 'first', 'third'];
        const topThree = data.slice(0, 3);

        // Reorder for visual display: 2nd, 1st, 3rd
        const displayOrder = [topThree[1], topThree[0], topThree[2]].filter(Boolean);

        displayOrder.forEach((entry, i) => {
            if (!entry) return;

            const actualPosition = i === 0 ? 'second' : i === 1 ? 'first' : 'third';
            const rank = actualPosition === 'first' ? 1 : actualPosition === 'second' ? 2 : 3;

            const place = document.createElement('div');
            place.className = `podium-place ${actualPosition}`;
            place.innerHTML = `
                <div class="podium-avatar">
                    ${entry.name?.charAt(0).toUpperCase() || '?'}
                    <div class="podium-rank">${rank}</div>
                </div>
                <div class="podium-name">${entry.name || 'Anonymous'}</div>
                <div class="podium-score">${entry.score}</div>
                <div class="podium-stand"></div>
            `;
            elements.podium.appendChild(place);
        });

        // Render rest of list
        elements.leaderboardListContent.innerHTML = '';

        data.slice(3).forEach((entry, index) => {
            const el = document.createElement('div');
            el.className = 'leaderboard-entry';
            el.innerHTML = `
                <div class="entry-rank">${index + 4}</div>
                <div class="entry-avatar">${entry.name?.charAt(0).toUpperCase() || '?'}</div>
                <div class="entry-info">
                    <div class="entry-name">${entry.name || 'Anonymous'}</div>
                    <div class="entry-words">${entry.wordsCreated || 0} words</div>
                </div>
                <div class="entry-score">${entry.score}</div>
            `;
            elements.leaderboardListContent.appendChild(el);
        });
    }

    // ==================== EVENT LISTENERS ====================

    // Mode selection
    elements.modeCards.forEach(card => {
        card.addEventListener('click', () => {
            const mode = card.dataset.mode;
            window.audio?.click();
            startGame(mode);
        });
    });

    // How to play
    elements.howToPlayBtn.addEventListener('click', () => {
        window.audio?.click();
        showModal('howToPlay');
    });

    elements.closeTutorial.addEventListener('click', () => {
        hideModal('howToPlay');
    });

    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', () => {
            btn.closest('.modal').classList.remove('active');
        });
    });

    // Sound toggle
    elements.soundToggle.addEventListener('click', () => {
        const enabled = window.audio?.toggle();
        elements.soundToggle.textContent = enabled ? '🔊' : '🔇';
    });

    // Initialize sound button state
    if (window.audio && !window.audio.enabled) {
        elements.soundToggle.textContent = '🔇';
    }

    // Back buttons
    elements.backToMenu.addEventListener('click', () => {
        if (game.isPlaying) {
            if (confirm('Leave the game? Your progress will be lost.')) {
                game.endGame();
                showScreen('mainMenu');
            }
        } else {
            showScreen('mainMenu');
        }
    });

    // Submit words
    elements.submitWords.addEventListener('click', handleSubmit);

    // Results screen
    elements.saveScoreBtn.addEventListener('click', async () => {
        const name = elements.playerNameInput.value.trim();
        if (!name) {
            showToast('Please enter your name!', 'warning');
            return;
        }

        elements.saveScoreBtn.disabled = true;
        const success = await saveScore(name, lastGameResult?.score || 0);
        elements.saveScoreBtn.disabled = false;

        if (success) {
            elements.playerNameInput.value = '';
        }
    });

    elements.playAgainBtn.addEventListener('click', () => {
        startGame(currentMode);
    });

    elements.viewLeaderboardFromResults.addEventListener('click', async () => {
        showScreen('leaderboardScreen');
        const data = await loadLeaderboard();
        renderLeaderboard(data);
    });

    elements.backToMenuFromResults.addEventListener('click', () => {
        showScreen('mainMenu');
    });

    // Leaderboard screen
    elements.viewLeaderboardBtn.addEventListener('click', async () => {
        showScreen('leaderboardScreen');
        const data = await loadLeaderboard();
        renderLeaderboard(data);
    });

    elements.backFromLeaderboard.addEventListener('click', () => {
        showScreen('mainMenu');
    });

    elements.playFromLeaderboard.addEventListener('click', () => {
        startGame('blitz');
    });

    // Level complete modal
    elements.nextLevelBtn.addEventListener('click', () => {
        hideModal('levelComplete');
        renderFlasks(game.flasks);
        elements.challengeLevel.textContent = game.challengeLevel;
        elements.targetScore.textContent = config.challengeLevels[game.challengeLevel - 1]?.target || 50;
        elements.challengeProgress.style.width = '0%';
        elements.wordsList.innerHTML = '';
        updatePowerupDisplay();
    });

    // Click outside modal to close
    Object.values(modals).forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (!game.isPlaying) return;

        if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            handleSubmit();
        } else if (e.key === 'z' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            game.undo();
            window.audio?.undo();
        }
    });

    // ==================== INITIALIZATION ====================
    showScreen('mainMenu');

    // Initialize audio on first interaction
    document.addEventListener('click', () => {
        window.audio?.init();
    }, { once: true });

    console.log('WordPour initialized! 🎮');
});
