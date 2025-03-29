const config = {
    bottleCount: 4,
    maxBottleHeight: 8, // Max letters per bottle
    gameTime: 60, // Game time in seconds
    scrabbleScores: {
        'A': 1, 'B': 3, 'C': 3, 'D': 2, 'E': 1, 'F': 4, 'G': 2, 'H': 4,
        'I': 1, 'J': 8, 'K': 5, 'L': 1, 'M': 3, 'N': 1, 'O': 1, 'P': 3,
        'Q': 10, 'R': 1, 'S': 1, 'T': 1, 'U': 1, 'V': 4, 'W': 4, 'X': 8,
        'Y': 4, 'Z': 10
    },
    goldenLetterMultiplier: 2,
    // Example starting letters (adjust distribution for balance)
    // Letters are bottom-to-top in the array
    initialLetters: [
        ['O', 'C', 'B', 'E'],
        ['I', 'E', 'E', 'R', 'D', 'B'],
        ['T', 'Z', 'U', 'O', 'D', 'E', 'S', 'A', 'A'],
        [] // The empty bottle
    ],
     // Or a function to generate random letters
    generateInitialLetters: function() {
        const letterPool = "AAAAAAAAABBCCDDDDEEEEEEEEEEEEFFGGGHHIIIIIIIIIJKLLLLMMNNNNNNOOOOOOOOPPQRRRRRRSSSSTTTTTTUUUUVVWWXYYZ";
        const totalLetters = 20; // Adjust total letters
        let poolArr = letterPool.split('');
        let distributedLetters = [[], [], [], []];
        let allLetters = [];

        // Create initial pool
        for (let i = 0; i < totalLetters; i++) {
            const randomIndex = Math.floor(Math.random() * poolArr.length);
            allLetters.push(poolArr.splice(randomIndex, 1)[0]);
        }

        // Distribute to first 3 bottles somewhat evenly
        let bottleIndex = 0;
        while(allLetters.length > 0) {
            if (distributedLetters[bottleIndex % 3].length < this.maxBottleHeight -1) { // Leave space
                 distributedLetters[bottleIndex % 3].push(allLetters.pop());
            } else {
                 // If a bottle is near full, try the next one, or discard if all full (unlikely with good numbers)
                 allLetters.pop(); // Simplistic handling: discard if no space
            }
           bottleIndex++;
        }
        return distributedLetters;
    }
};

// Example of a very small dictionary (replace with dictionary.js content)
// const dictionary = new Set(['BED', 'CAB', 'SAD', 'SEE', 'ACE', 'ADD']);
// Make sure dictionary.js defines a global 'dictionary' Set object.