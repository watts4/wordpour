/**
 * Audio System for WordPour
 * Handles sound effects using Web Audio API
 */

class AudioSystem {
    constructor() {
        this.enabled = true;
        this.context = null;
        this.masterGain = null;
        this.initialized = false;

        // Try to restore preference from localStorage
        const saved = localStorage.getItem('wordpour_sound');
        if (saved !== null) {
            this.enabled = saved === 'true';
        }
    }

    // Initialize audio context (must be called after user interaction)
    init() {
        if (this.initialized) return;

        try {
            this.context = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.context.createGain();
            this.masterGain.connect(this.context.destination);
            this.masterGain.gain.value = 0.3;
            this.initialized = true;
        } catch (e) {
            console.warn('Web Audio API not supported');
            this.enabled = false;
        }
    }

    toggle() {
        this.enabled = !this.enabled;
        localStorage.setItem('wordpour_sound', this.enabled.toString());
        return this.enabled;
    }

    // Create an oscillator-based sound
    playTone(frequency, duration, type = 'sine', volume = 0.3) {
        if (!this.enabled || !this.initialized) return;

        try {
            const oscillator = this.context.createOscillator();
            const gainNode = this.context.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.masterGain);

            oscillator.frequency.value = frequency;
            oscillator.type = type;

            const now = this.context.currentTime;
            gainNode.gain.setValueAtTime(volume, now);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

            oscillator.start(now);
            oscillator.stop(now + duration);
        } catch (e) {
            // Silently fail
        }
    }

    // Play a sequence of notes
    playSequence(notes, interval = 0.1) {
        notes.forEach((note, i) => {
            setTimeout(() => {
                this.playTone(note.freq, note.duration || 0.15, note.type || 'sine', note.volume || 0.3);
            }, i * interval * 1000);
        });
    }

    // Sound effects
    pour() {
        if (!this.enabled) return;
        this.init();

        // Liquid pouring sound - descending tones
        this.playSequence([
            { freq: 600, duration: 0.08 },
            { freq: 500, duration: 0.08 },
            { freq: 400, duration: 0.1 },
            { freq: 350, duration: 0.12 },
        ], 0.05);
    }

    letterDrop() {
        if (!this.enabled) return;
        this.init();

        this.playTone(300, 0.1, 'sine', 0.2);
    }

    wordFound() {
        if (!this.enabled) return;
        this.init();

        // Happy ascending melody
        this.playSequence([
            { freq: 523, duration: 0.1 },  // C5
            { freq: 659, duration: 0.1 },  // E5
            { freq: 784, duration: 0.15 }, // G5
        ], 0.08);
    }

    bigWord() {
        if (!this.enabled) return;
        this.init();

        // More dramatic ascending melody
        this.playSequence([
            { freq: 392, duration: 0.1 },  // G4
            { freq: 523, duration: 0.1 },  // C5
            { freq: 659, duration: 0.1 },  // E5
            { freq: 784, duration: 0.15 }, // G5
            { freq: 1047, duration: 0.2 }, // C6
        ], 0.08);
    }

    combo() {
        if (!this.enabled) return;
        this.init();

        // Exciting combo sound
        this.playSequence([
            { freq: 440, duration: 0.08, type: 'square', volume: 0.2 },
            { freq: 554, duration: 0.08, type: 'square', volume: 0.2 },
            { freq: 659, duration: 0.08, type: 'square', volume: 0.2 },
            { freq: 880, duration: 0.15, type: 'square', volume: 0.25 },
        ], 0.06);
    }

    powerUp() {
        if (!this.enabled) return;
        this.init();

        // Power-up activation
        this.playSequence([
            { freq: 300, duration: 0.1, type: 'sawtooth', volume: 0.15 },
            { freq: 400, duration: 0.1, type: 'sawtooth', volume: 0.15 },
            { freq: 600, duration: 0.15, type: 'sawtooth', volume: 0.2 },
        ], 0.07);
    }

    error() {
        if (!this.enabled) return;
        this.init();

        // Error/invalid sound
        this.playTone(200, 0.2, 'square', 0.15);
    }

    click() {
        if (!this.enabled) return;
        this.init();

        this.playTone(800, 0.05, 'sine', 0.1);
    }

    timerWarning() {
        if (!this.enabled) return;
        this.init();

        this.playTone(440, 0.1, 'sine', 0.2);
    }

    timerCritical() {
        if (!this.enabled) return;
        this.init();

        this.playSequence([
            { freq: 440, duration: 0.1 },
            { freq: 440, duration: 0.1 },
        ], 0.15);
    }

    gameOver() {
        if (!this.enabled) return;
        this.init();

        // Game over melody
        this.playSequence([
            { freq: 392, duration: 0.2 },  // G4
            { freq: 349, duration: 0.2 },  // F4
            { freq: 330, duration: 0.2 },  // E4
            { freq: 262, duration: 0.4 },  // C4
        ], 0.2);
    }

    victory() {
        if (!this.enabled) return;
        this.init();

        // Victory fanfare
        this.playSequence([
            { freq: 523, duration: 0.15 }, // C5
            { freq: 523, duration: 0.15 }, // C5
            { freq: 523, duration: 0.15 }, // C5
            { freq: 523, duration: 0.3 },  // C5
            { freq: 415, duration: 0.3 },  // Ab4
            { freq: 466, duration: 0.3 },  // Bb4
            { freq: 523, duration: 0.15 }, // C5
            { freq: 466, duration: 0.1 },  // Bb4
            { freq: 523, duration: 0.4 },  // C5
        ], 0.12);
    }

    levelComplete() {
        if (!this.enabled) return;
        this.init();

        // Level complete jingle
        this.playSequence([
            { freq: 659, duration: 0.1 },  // E5
            { freq: 784, duration: 0.1 },  // G5
            { freq: 988, duration: 0.1 },  // B5
            { freq: 1319, duration: 0.3 }, // E6
        ], 0.1);
    }

    shuffle() {
        if (!this.enabled) return;
        this.init();

        // Shuffle whoosh
        for (let i = 0; i < 8; i++) {
            setTimeout(() => {
                this.playTone(200 + Math.random() * 400, 0.05, 'sine', 0.1);
            }, i * 30);
        }
    }

    freeze() {
        if (!this.enabled) return;
        this.init();

        // Ice/freeze sound
        this.playSequence([
            { freq: 1200, duration: 0.1, type: 'sine', volume: 0.2 },
            { freq: 1000, duration: 0.1, type: 'sine', volume: 0.15 },
            { freq: 800, duration: 0.15, type: 'sine', volume: 0.1 },
        ], 0.05);
    }

    hint() {
        if (!this.enabled) return;
        this.init();

        // Hint reveal
        this.playSequence([
            { freq: 880, duration: 0.1 },
            { freq: 1100, duration: 0.15 },
        ], 0.08);
    }

    undo() {
        if (!this.enabled) return;
        this.init();

        // Undo/rewind sound
        this.playSequence([
            { freq: 600, duration: 0.08 },
            { freq: 500, duration: 0.08 },
            { freq: 400, duration: 0.1 },
        ], 0.04);
    }
}

// Create global instance
window.audio = new AudioSystem();
