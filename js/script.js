document.addEventListener('DOMContentLoaded', () => {
    const bottlesArea = document.getElementById('bottlesArea');
    const submitButton = document.getElementById('submitButton');
    const resetButton = document.getElementById('resetButton');
    const scoreArea = document.getElementById('scoreArea');
    const messageArea = document.getElementById('messageArea');
    const timerArea = document.getElementById('timerArea');
    const startOverlay = document.getElementById('startOverlay');
    const startButton = document.getElementById('startButton');
    const leaderboardEntryOverlay = document.getElementById('leaderboardEntryOverlay');
    const leaderboardDisplayOverlay = document.getElementById('leaderboardDisplayOverlay');
    const finalScoreSpan = document.getElementById('finalScore');
    const playerNameInput = document.getElementById('playerName');
    const submitScoreButton = document.getElementById('submitScoreButton');
    const leaderboardList = document.getElementById('leaderboardList');
    const playAgainButton = document.getElementById('playAgainButton');

    let bottles = []; // Array to hold bottle data { id: number, letters: [{char: 'A', score: 1, id: 'uuid', isGolden: false}, ...], element: DOMElement }
    let draggedBottleIndex = null;
    let goldenLetterId = null; // Unique ID of the one golden letter instance
    let gameTimer = null; // Timer interval
    let gameTimeRemaining = config.gameTime || 60; // Game time in seconds (default 60 if not set in config)
    let isGameActive = false;
    let currentScore = 0;
    let wordsCreated = []; // Track words created during gameplay

    function generateUUID() { // Simple unique ID for letters
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    function initializeGame() {
        bottles = [];
        bottlesArea.innerHTML = ''; // Clear existing bottles
        scoreArea.textContent = 'Score: 0';
        messageArea.textContent = '';
        messageArea.className = ''; // Reset message style
        draggedBottleIndex = null;
        currentScore = 0;
        wordsCreated = [];
        
        // Reset timer display
        gameTimeRemaining = config.gameTime || 60;
        updateTimerDisplay();

        // Use generated or fixed initial letters
        // const initialDistribution = config.initialLetters;
        const initialDistribution = config.generateInitialLetters();

        // Create letter pool for assigning golden letter
        let allLetterObjects = [];

        initialDistribution.forEach((letterChars, index) => {
            const bottleElement = createBottleElement(index);
            const bottleData = {
                id: index,
                letters: [], // Stored bottom-to-top
                element: bottleElement
            };

            letterChars.forEach(char => {
                const letterObj = {
                    char: char.toUpperCase(),
                    score: config.scrabbleScores[char.toUpperCase()] || 0,
                    id: generateUUID(),
                    isGolden: false
                };
                bottleData.letters.push(letterObj);
                allLetterObjects.push(letterObj);
            });

            bottles.push(bottleData);
            bottlesArea.appendChild(bottleElement);
        });

        // Assign one golden letter randomly
        if (allLetterObjects.length > 0) {
            const randomIndex = Math.floor(Math.random() * allLetterObjects.length);
            allLetterObjects[randomIndex].isGolden = true;
            goldenLetterId = allLetterObjects[randomIndex].id;
            console.log(`Golden Letter: ${allLetterObjects[randomIndex].char} (ID: ${goldenLetterId})`);
        } else {
             goldenLetterId = null;
             console.log("No letters to make golden.");
        }


        // Ensure the 4th bottle exists if initialDistribution didn't define it
        while (bottles.length < config.bottleCount) {
             const index = bottles.length;
             const bottleElement = createBottleElement(index);
             const bottleData = { id: index, letters: [], element: bottleElement };
             bottles.push(bottleData);
             bottlesArea.appendChild(bottleElement);
        }

        renderAllBottles();
        addDragDropListeners();
    }

    function createBottleElement(index) {
        const bottleDiv = document.createElement('div');
        bottleDiv.classList.add('bottle');
        bottleDiv.id = `bottle-${index}`;
        bottleDiv.dataset.index = index; // Store index for easy access
        bottleDiv.setAttribute('draggable', 'true');

        // Add bottle structure (optional but nice)
        bottleDiv.innerHTML = `
            <div class="bottle-neck"></div>
            <div class="bottle-body">
                <div class="letter-stack"></div>
            </div>
            <div class="bottle-base"></div>
        `;
        return bottleDiv;
    }

    function renderBottle(bottleData) {
        const stackElement = bottleData.element.querySelector('.letter-stack');
        stackElement.innerHTML = ''; // Clear previous letters

        bottleData.letters.forEach(letterObj => { // Iterate bottom-to-top
            const letterDiv = document.createElement('div');
            letterDiv.classList.add('letter');
            letterDiv.textContent = letterObj.char;
            letterDiv.dataset.letter = letterObj.char;
            letterDiv.dataset.score = letterObj.score;
            letterDiv.dataset.id = letterObj.id; // Add ID for tracking golden
            if (letterObj.isGolden) {
                letterDiv.classList.add('golden');
            }
            stackElement.appendChild(letterDiv); // Append puts it visually on top because of flex-direction: column-reverse
        });

        // Update bottle state classes
        bottleData.element.classList.toggle('full', bottleData.letters.length >= config.maxBottleHeight);
        bottleData.element.classList.toggle('empty-source', bottleData.letters.length === 0);
        bottleData.element.setAttribute('draggable', bottleData.letters.length > 0); // Can only drag non-empty
    }

    function renderAllBottles() {
        bottles.forEach(renderBottle);
    }

    function handlePour(sourceIndex, targetIndex) {
        if (sourceIndex === targetIndex) return; // Cannot pour into self

        const sourceBottle = bottles[sourceIndex];
        const targetBottle = bottles[targetIndex];

        // --- Validation ---
        if (sourceBottle.letters.length === 0) {
            console.log("Source bottle is empty.");
            setMessage("Cannot pour from an empty bottle.", true);
            return;
        }
        if (targetBottle.letters.length >= config.maxBottleHeight) {
            console.log("Target bottle is full.");
            setMessage("Target bottle is full.", true);
            return;
        }

        // --- Logic ---
        const letterToMove = sourceBottle.letters.pop(); // Remove from top (end of array)
        targetBottle.letters.push(letterToMove); // Add to top (end of array)

        console.log(`Poured ${letterToMove.char} from bottle ${sourceIndex} to ${targetIndex}`);
        setMessage(""); // Clear any error message

        // --- Animation (Simple Example) ---
        const targetStack = targetBottle.element.querySelector('.letter-stack');
        const sourceStack = sourceBottle.element.querySelector('.letter-stack');

        // Re-render source immediately
        renderBottle(sourceBottle);

        // Create a temporary visual letter for animation
        const tempLetterDiv = document.createElement('div');
        tempLetterDiv.classList.add('letter', 'pouring'); // Add pouring class
        tempLetterDiv.textContent = letterToMove.char;
        if (letterToMove.isGolden) tempLetterDiv.classList.add('golden');

        // Position temp letter roughly over source bottle top
        const sourceRect = sourceBottle.element.getBoundingClientRect();
        const targetRect = targetBottle.element.getBoundingClientRect();
        const gameRect = bottlesArea.getBoundingClientRect(); // Get container rect for relative positioning

        tempLetterDiv.style.position = 'absolute';
        tempLetterDiv.style.left = `${sourceRect.left - gameRect.left + sourceRect.width / 2 - 15}px`; // Center approx
        tempLetterDiv.style.top = `${sourceRect.top - gameRect.top + 20}px`; // Near top neck
        bottlesArea.appendChild(tempLetterDiv);


        // Force reflow to apply initial state before transition
        void tempLetterDiv.offsetWidth;

        // Calculate target position (approx top of target stack)
        const targetX = targetRect.left - gameRect.left + targetRect.width / 2 - 15;
        const targetY = targetRect.top - gameRect.top + targetRect.height - (targetBottle.letters.length * 32) - 15 ; // Estimate based on letter height + margin

        // Apply animation target state (using transform)
        tempLetterDiv.style.transform = `translate(${targetX - (sourceRect.left - gameRect.left + sourceRect.width / 2 - 15)}px, ${targetY - (sourceRect.top - gameRect.top + 20)}px) scale(1)`;
        tempLetterDiv.style.opacity = '1'; // Fade back in slightly if desired, or keep 0 to fade out

        // Clean up after animation
        setTimeout(() => {
            tempLetterDiv.remove();
            renderBottle(targetBottle); // Render target bottle with the actual letter
        }, 500); // Match CSS transition duration

        // --- Update Draggable States ---
        renderAllBottles(); // Update visual states like 'full', 'empty', draggable
    }

    function addDragDropListeners() {
        bottles.forEach((bottleData, index) => {
            const bottleElement = bottleData.element;

            bottleElement.addEventListener('dragstart', (e) => {
                if (bottleData.letters.length > 0) {
                    draggedBottleIndex = index;
                    e.dataTransfer.setData('text/plain', index); // Necessary for Firefox
                    e.dataTransfer.effectAllowed = 'move';
                    setTimeout(() => bottleElement.classList.add('dragging'), 0); // Style dragging bottle
                    setMessage(""); // Clear messages
                } else {
                    e.preventDefault(); // Don't allow dragging empty bottles
                }
            });

            bottleElement.addEventListener('dragend', () => {
                bottleElement.classList.remove('dragging');
                // Clear drag-over styles from all bottles
                bottles.forEach(b => b.element.classList.remove('drag-over'));
                draggedBottleIndex = null;
            });

            bottleElement.addEventListener('dragover', (e) => {
                e.preventDefault(); // Allow dropping
                const targetIndex = parseInt(bottleElement.dataset.index, 10);
                const targetBottle = bottles[targetIndex];
                 // Add visual cue only if dropping is valid (not full, not self)
                if (draggedBottleIndex !== null && draggedBottleIndex !== targetIndex && targetBottle.letters.length < config.maxBottleHeight) {
                    bottleElement.classList.add('drag-over');
                    e.dataTransfer.dropEffect = 'move';
                } else {
                     e.dataTransfer.dropEffect = 'none'; // Indicate invalid drop
                }
            });

             bottleElement.addEventListener('dragleave', () => {
                bottleElement.classList.remove('drag-over');
            });


            bottleElement.addEventListener('drop', (e) => {
                e.preventDefault();
                bottleElement.classList.remove('drag-over');
                const targetIndex = parseInt(bottleElement.dataset.index, 10);

                if (draggedBottleIndex !== null) {
                    handlePour(draggedBottleIndex, targetIndex);
                }
                draggedBottleIndex = null; // Reset after drop attempt
            });
        });
    }

    function calculateScore() {
        let totalScore = 0;
        let wordsFoundCount = 0;
        let wordsFoundList = [];

        bottles.forEach(bottleData => {
            if (bottleData.letters.length > 1) { // Need at least 2 letters for a word usually
                // Get all the letters in the bottle (top-to-bottom)
                const letters = bottleData.letters.map(l => l.char).reverse();
                
                // Find all valid words in the bottle
                const wordsFound = findAllWordsInBottle(letters, bottleData.letters.slice().reverse());
                
                // Add all found words to our totals
                wordsFound.forEach(({ word, wordScore, usedGolden }) => {
                    wordsFoundCount++;
                    wordsFoundList.push(word);
                    
                    // Apply golden bonus if applicable
                    if (usedGolden) {
                        wordScore *= config.goldenLetterMultiplier;
                        console.log(`Word: ${word}, Base Score: ${wordScore / config.goldenLetterMultiplier}, Golden Bonus Applied! Final: ${wordScore}`);
                    } else {
                        console.log(`Word: ${word}, Score: ${wordScore}`);
                    }
                    
                    totalScore += wordScore;
                });
            }
        });
        
        return { totalScore, wordsFoundCount, wordsFoundList };
    }
    
    // Function to find all valid words in a bottle and calculate their scores
    function findAllWordsInBottle(letters, letterObjects) {
        const wordsFound = [];
        const minWordLength = 2; // Minimum word length to consider
        
        // Try all possible word lengths
        for (let wordLength = minWordLength; wordLength <= letters.length; wordLength++) {
            // Try all possible starting positions
            for (let startPos = 0; startPos <= letters.length - wordLength; startPos++) {
                // Get the consecutive letters for this word
                const wordLetters = letters.slice(startPos, startPos + wordLength);
                const word = wordLetters.join('');
                
                // Check if it's a valid word in our dictionary
                if (window.dictionary.has(word)) {
                    // Get the corresponding letter objects for scoring
                    const wordLetterObjects = letterObjects.slice(startPos, startPos + wordLength);
                    
                    // Calculate the score
                    let wordScore = 0;
                    let usedGolden = false;
                    
                    wordLetterObjects.forEach(letterObj => {
                        wordScore += letterObj.score;
                        if (letterObj.isGolden) {
                            usedGolden = true;
                        }
                    });
                    
                    wordsFound.push({ word, wordScore, usedGolden });
                }
            }
        }
        
        return wordsFound;
    }

    function handleSubmit() {
        const { totalScore, wordsFoundCount, wordsFoundList } = calculateScore();
        currentScore = totalScore; // Update the current score
        scoreArea.textContent = `Score: ${totalScore}`;
        if (wordsFoundCount > 0) {
            // Add any new words to the wordsCreated array
            wordsFoundList.forEach(word => {
                if (!wordsCreated.includes(word)) {
                    wordsCreated.push(word);
                }
            });
            setMessage(`Found ${wordsFoundCount} words: ${wordsFoundList.join(', ')}!`);
            messageArea.className = 'success'; // Optional styling
        } else {
            setMessage("No valid words found in any bottle.");
             messageArea.className = 'error'; // Optional styling
        }
    }

    function setMessage(msg, isError = false) {
        messageArea.textContent = msg;
        if (isError) {
            messageArea.className = 'error';
        } else {
            messageArea.className = 'success'; // Or just remove class if no specific success style
        }
        // Optional: Clear message after a delay
         setTimeout(() => {
             if (messageArea.textContent === msg) { // Only clear if message hasn't changed
                // messageArea.textContent = '';
                // messageArea.className = '';
             }
         }, 3000); // Clear after 3 seconds
    }

    // Game timer functions
    function startGameTimer() {
        // Clear any existing timer
        if (gameTimer) {
            clearInterval(gameTimer);
        }
        
        isGameActive = true;
        gameTimeRemaining = config.gameTime || 60; // Reset to starting time
        updateTimerDisplay();
        
        gameTimer = setInterval(() => {
            gameTimeRemaining--;
            updateTimerDisplay();
            
            if (gameTimeRemaining <= 0) {
                endGame();
            }
        }, 1000);
    }
    
    function updateTimerDisplay() {
        const minutes = Math.floor(gameTimeRemaining / 60);
        const seconds = gameTimeRemaining % 60;
        timerArea.textContent = `Time: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    function endGame() {
        clearInterval(gameTimer);
        isGameActive = false;
        
        // Calculate final score
        const { totalScore } = calculateScore();
        currentScore = totalScore;
        
        // Show leaderboard entry
        finalScoreSpan.textContent = totalScore;
        leaderboardEntryOverlay.style.display = 'flex';
    }

    // Firebase Firestore functions
    async function saveScoreToLeaderboard(playerName, score) {
        try {
            // Access Firestore modules through window object
            const { collection, addDoc } = window.firestoreModules;
            const db = window.db;
            
            // Add score to Firestore - matching the security rules
            const docRef = await addDoc(collection(db, "highScores"), {
                name: playerName,
                score: score,
                wordsCreated: wordsCreated.length, // This matches the 'time' field in your security rules
                wordsList: wordsCreated,
                timestamp: new Date().toISOString()
            });
            
            console.log("Score saved with ID: ", docRef.id);
            return true;
        } catch (error) {
            console.error("Error adding score: ", error);
            return false;
        }
    }
    
    async function loadLeaderboard() {
        try {
            // Access Firestore modules through window object
            const { collection, getDocs, query, orderBy, limit } = window.firestoreModules;
            const db = window.db;
            
            // Get top 10 scores
            const q = query(
                collection(db, "highScores"), 
                orderBy("score", "desc"), 
                limit(5)
            );
            
            const querySnapshot = await getDocs(q);
            const leaderboardData = [];
            
            querySnapshot.forEach((doc) => {
                leaderboardData.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            return leaderboardData;
        } catch (error) {
            console.error("Error getting leaderboard: ", error);
            return [];
        }
    }
    
    async function displayLeaderboard(leaderboardData) {
        leaderboardList.innerHTML = '';
        
        if (leaderboardData.length === 0) {
            leaderboardList.innerHTML = '<div class="leaderboard-entry">No scores yet! Be the first to submit.</div>';
            return;
        }
        
          // Add the Leaderboard title
        const titleElement = document.createElement('h2');
        titleElement.textContent = 'Leaderboard';
        titleElement.style.textAlign = 'center';
        titleElement.style.marginBottom = '20px';
        titleElement.style.color = 'white';
        leaderboardList.appendChild(titleElement);
        
        // Add the tabs
        const tabsContainer = document.createElement('div');
        tabsContainer.className = 'leaderboard-tabs';
        tabsContainer.innerHTML = `
            <button class="leaderboard-tab active">All Time</button>
            <button class="leaderboard-tab">Today</button>
        `;
        leaderboardList.appendChild(tabsContainer);
       
		
		// Create leaderboard header
        const headerElement = document.createElement('div');
        headerElement.classList.add('leaderboard-list-header');
        headerElement.innerHTML = `
            <div>Rank</div>
            <div>Player</div>
            <div>Score</div>
        `;
        leaderboardList.appendChild(headerElement);
        
        // Create top 3 players section if there are at least 3 entries
        if (leaderboardData.length >= 3) {
            const topPlayersSection = document.createElement('div');
            topPlayersSection.classList.add('top-players');
            
            // Get top 3 players
            const topPlayers = leaderboardData.slice(0, 3);
            
            topPlayers.forEach((player, index) => {
                const rank = index + 1;
                const playerElement = document.createElement('div');
                playerElement.classList.add('top-player', `top-player-${rank}`);
                
                // Get player's first initial to display in avatar
                const initial = (player.name || 'A').charAt(0).toUpperCase();
                
                playerElement.innerHTML = `
                    <div class="top-player-rank">${rank}</div>
                    <div class="top-player-avatar">
                        <div class="player-initial">${initial}</div>
                    </div>
                    <div class="top-player-name">${player.name}</div>
                    <div class="top-player-username">${player.wordsCreated || 0} words</div>
                    <div class="top-player-score">${player.score}</div>
                `;
                
                topPlayersSection.appendChild(playerElement);
            });
            
            leaderboardList.appendChild(topPlayersSection);
            
            // Add the rest of the entries starting from 4th place
            leaderboardData.slice(3).forEach((entry, index) => {
                const rank = index + 4;
                addLeaderboardEntry(entry, rank);
            });
        } else {
            // If less than 3 entries, just show all entries in regular format
            leaderboardData.forEach((entry, index) => {
                addLeaderboardEntry(entry, index + 1);
            });
        }
        
        function addLeaderboardEntry(entry, rank) {
            const entryElement = document.createElement('div');
            entryElement.classList.add('leaderboard-entry');
            
            // Calculate the width of the background bar based on score
            // Use the highest score as 100% and scale others accordingly
            const maxScore = leaderboardData[0].score;
            const widthPercentage = Math.max(5, Math.round((entry.score / maxScore) * 100));
            
            // Get initial for avatar
            const initial = (entry.name || 'A').charAt(0).toUpperCase();
            
            // Format date
            const date = new Date(entry.timestamp);
            const dateStr = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
            
            entryElement.innerHTML = `
                <div class="rank">
                    <svg class="rank-trophy" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M5,16 L3,16 L3,8 C3,6.9 3.9,6 5,6 L19,6 C20.1,6 21,6.9 21,8 L21,16 L19,16 L19,14 L5,14 L5,16 Z M19,8 L5,8 L5,12 L19,12 L19,8 Z M12,19 L9,16 L15,16 L12,19 Z"></path>
                    </svg>
                    ${rank}
                </div>
                <div class="name">
                    <div class="player-avatar-small">${initial}</div>
                    ${entry.name}
                </div>
                <div class="score">${entry.score}</div>
                <div class="words">${entry.wordsCreated || 0} words</div>
                <div class="date">${dateStr}</div>
            `;
            
            // Set the width of the background bar
            entryElement.style.setProperty('--score-width', `${widthPercentage}%`);
            
            leaderboardList.appendChild(entryElement);
        }
    }
    
    async function loadStartScreenLeaderboard() {
        const leaderboardData = await loadLeaderboard();
        // Create a leaderboard container in the start overlay
        const startOverlayContent = document.querySelector('#startOverlay .overlay-content');
        
        // Create leaderboard container if it doesn't exist yet
        let startLeaderboardContainer = document.getElementById('startLeaderboardContainer');
        if (!startLeaderboardContainer) {
            startLeaderboardContainer = document.createElement('div');
            startLeaderboardContainer.id = 'startLeaderboardContainer';
            startLeaderboardContainer.className = 'leaderboard-list';
            startLeaderboardContainer.style.marginTop = '20px';
            
            // Add a title for the leaderboard
            const leaderboardTitle = document.createElement('h3');
            leaderboardTitle.textContent = 'Top Players';
            startLeaderboardContainer.appendChild(leaderboardTitle);
            
            startOverlayContent.appendChild(startLeaderboardContainer);
        } else {
            // Clear existing entries if container already exists
            startLeaderboardContainer.innerHTML = '<h3>Top Players</h3>';
        }
        
        // Add tab buttons
        const tabsContainer = document.createElement('div');
        tabsContainer.className = 'leaderboard-tabs';
        tabsContainer.innerHTML = `
            <button class="leaderboard-tab active">All Time</button>
            <button class="leaderboard-tab">Today</button>
        `;
        startLeaderboardContainer.appendChild(tabsContainer);
        
        // Display leaderboard data
        if (leaderboardData.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'leaderboard-entry';
            emptyMessage.textContent = 'No scores yet! Be the first to submit.';
            startLeaderboardContainer.appendChild(emptyMessage);
        } else {
            // Add header row
            const headerRow = document.createElement('div');
            headerRow.className = 'leaderboard-list-header';
            headerRow.innerHTML = `
                <div>Rank</div>
                <div>Player</div>
                <div>Score</div>
            `;
            startLeaderboardContainer.appendChild(headerRow);
            
            // Display only top player in featured style
            if (leaderboardData.length >= 1) {
                const topPlayer = leaderboardData[0];
                const topPlayersSection = document.createElement('div');
                topPlayersSection.classList.add('top-players');
                
                const playerElement = document.createElement('div');
                playerElement.classList.add('top-player', 'top-player-1');
                
                // Get player's first initial
                const initial = (topPlayer.name || 'A').charAt(0).toUpperCase();
                
                playerElement.innerHTML = `
                    <div class="top-player-rank">1</div>
                    <div class="top-player-avatar">
                        <div class="player-initial">${initial}</div>
                    </div>
                    <div class="top-player-name">${topPlayer.name}</div>
                    <div class="top-player-username">${topPlayer.wordsCreated || 0} words</div>
                    <div class="top-player-score">${topPlayer.score}</div>
                `;
                
                topPlayersSection.appendChild(playerElement);
                startLeaderboardContainer.appendChild(topPlayersSection);
                
                // Add 2nd to 5th place in regular format
                const remainingPlayers = leaderboardData.slice(1, 5);
                remainingPlayers.forEach((entry, index) => {
                    const rank = index + 2;
                    const entryElement = document.createElement('div');
                    entryElement.className = 'leaderboard-entry';
                    
                    // Calculate width for visual bar
                    const maxScore = leaderboardData[0].score;
                    const widthPercentage = Math.max(5, Math.round((entry.score / maxScore) * 100));
                    
                    // Get initial for avatar
                    const initial = (entry.name || 'A').charAt(0).toUpperCase();
                    
                    entryElement.innerHTML = `
                        <div class="rank">
                            <svg class="rank-trophy" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M5,16 L3,16 L3,8 C3,6.9 3.9,6 5,6 L19,6 C20.1,6 21,6.9 21,8 L21,16 L19,16 L19,14 L5,14 L5,16 Z M19,8 L5,8 L5,12 L19,12 L19,8 Z M12,19 L9,16 L15,16 L12,19 Z"></path>
                            </svg>
                            ${rank}
                        </div>
                        <div class="name">
                            <div class="player-avatar-small">${initial}</div>
                            ${entry.name}
                        </div>
                        <div class="score">${entry.score}</div>
                    `;
                    
                    entryElement.style.setProperty('--score-width', `${widthPercentage}%`);
                    
                    startLeaderboardContainer.appendChild(entryElement);
                });
            } else {
                // If no players, we've already handled this with empty message above
            }
        }
        
        // Add event listeners for tabs (they don't actually filter in this implementation)
        const tabButtons = startLeaderboardContainer.querySelectorAll('.leaderboard-tab');
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                tabButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
            });
        });
    }

    // Event Listeners
    submitButton.addEventListener('click', handleSubmit);
    resetButton.addEventListener('click', initializeGame);
    
    // Start button event listener
    startButton.addEventListener('click', () => {
        // Hide the start overlay
        startOverlay.style.display = 'none';
        
        // Make sure all other overlays are also hidden
        leaderboardEntryOverlay.style.display = 'none';
        leaderboardDisplayOverlay.style.display = 'none';
        
        // Initialize and start the game
        initializeGame();
        startGameTimer();
    });
    
    // Submit score button event listener
    submitScoreButton.addEventListener('click', async () => {
        const playerName = playerNameInput.value.trim();
        if (playerName) {
            const success = await saveScoreToLeaderboard(playerName, currentScore);
            
            if (success) {
                leaderboardEntryOverlay.style.display = 'none';
                
                // Load and display leaderboard in the usual leaderboard overlay
                const leaderboardData = await loadLeaderboard();
                await displayLeaderboard(leaderboardData);
                leaderboardDisplayOverlay.style.display = 'flex';
                
                // Also update the start screen leaderboard for next time
                await loadStartScreenLeaderboard();
            } else {
                alert("Error saving score. Please try again.");
            }
        } else {
            alert("Please enter your name before submitting.");
        }
    });
    
    // Play again button event listener
    playAgainButton.addEventListener('click', () => {
        // Hide all overlays
        startOverlay.style.display = 'none';
        leaderboardEntryOverlay.style.display = 'none';
        leaderboardDisplayOverlay.style.display = 'none';
        
        // Reset and start the game
        initializeGame();
        startGameTimer();
    });
    
    // Initialize overlay states
    startOverlay.style.display = 'flex'; // Only show the start overlay initially
    leaderboardEntryOverlay.style.display = 'none';
    leaderboardDisplayOverlay.style.display = 'none';
    
    // Load leaderboard when page loads
    loadStartScreenLeaderboard();
});