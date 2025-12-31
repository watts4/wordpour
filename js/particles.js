/**
 * Particle System for WordPour
 * Handles confetti, celebrations, and visual effects
 */

class ParticleSystem {
    constructor() {
        this.canvas = document.getElementById('particleCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.isRunning = false;

        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    // Create a single particle
    createParticle(x, y, options = {}) {
        const defaults = {
            color: this.randomColor(),
            size: Math.random() * 8 + 4,
            speedX: (Math.random() - 0.5) * 10,
            speedY: Math.random() * -15 - 5,
            gravity: 0.3,
            friction: 0.99,
            life: 1,
            decay: 0.015,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.2,
            shape: Math.random() > 0.5 ? 'rect' : 'circle'
        };

        return { x, y, ...defaults, ...options };
    }

    randomColor() {
        const colors = [
            '#6366f1', // Primary purple
            '#8b5cf6', // Secondary purple
            '#a855f7', // Tertiary purple
            '#ec4899', // Pink
            '#f59e0b', // Warning/gold
            '#10b981', // Success green
            '#3b82f6', // Blue
            '#fbbf24', // Gold
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    // Burst of confetti from a point
    confettiBurst(x, y, count = 50) {
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count;
            const speed = Math.random() * 12 + 5;

            this.particles.push(this.createParticle(x, y, {
                speedX: Math.cos(angle) * speed,
                speedY: Math.sin(angle) * speed - 5,
                size: Math.random() * 10 + 5,
            }));
        }

        if (!this.isRunning) {
            this.start();
        }
    }

    // Rain of confetti from top
    confettiRain(duration = 3000) {
        const startTime = Date.now();

        const addConfetti = () => {
            if (Date.now() - startTime < duration) {
                for (let i = 0; i < 3; i++) {
                    this.particles.push(this.createParticle(
                        Math.random() * this.canvas.width,
                        -20,
                        {
                            speedX: (Math.random() - 0.5) * 4,
                            speedY: Math.random() * 3 + 2,
                            gravity: 0.1,
                            size: Math.random() * 12 + 6,
                        }
                    ));
                }
                requestAnimationFrame(addConfetti);
            }
        };

        addConfetti();

        if (!this.isRunning) {
            this.start();
        }
    }

    // Sparkle effect around a point
    sparkle(x, y, count = 20) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * 30;

            this.particles.push(this.createParticle(
                x + Math.cos(angle) * distance,
                y + Math.sin(angle) * distance,
                {
                    color: Math.random() > 0.5 ? '#fbbf24' : '#ffffff',
                    size: Math.random() * 4 + 2,
                    speedX: (Math.random() - 0.5) * 3,
                    speedY: (Math.random() - 0.5) * 3,
                    gravity: 0,
                    decay: 0.03,
                    shape: 'circle'
                }
            ));
        }

        if (!this.isRunning) {
            this.start();
        }
    }

    // Word found celebration
    wordCelebration(x, y) {
        // Small sparkle burst
        this.sparkle(x, y, 15);

        // Add a few floating letters/stars
        for (let i = 0; i < 5; i++) {
            this.particles.push(this.createParticle(x, y, {
                color: '#fbbf24',
                size: 6,
                speedX: (Math.random() - 0.5) * 8,
                speedY: Math.random() * -10 - 3,
                gravity: 0.2,
                decay: 0.02,
                shape: 'star'
            }));
        }

        if (!this.isRunning) {
            this.start();
        }
    }

    // Big celebration (end of game)
    bigCelebration() {
        // Center burst
        this.confettiBurst(this.canvas.width / 2, this.canvas.height / 2, 80);

        // Delayed side bursts
        setTimeout(() => {
            this.confettiBurst(this.canvas.width * 0.25, this.canvas.height * 0.6, 40);
            this.confettiBurst(this.canvas.width * 0.75, this.canvas.height * 0.6, 40);
        }, 200);

        // Confetti rain
        setTimeout(() => {
            this.confettiRain(2000);
        }, 400);
    }

    // Level up celebration
    levelUp() {
        // Ring of particles
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;

        for (let i = 0; i < 60; i++) {
            const angle = (Math.PI * 2 * i) / 60;
            const radius = 100;

            this.particles.push(this.createParticle(
                centerX + Math.cos(angle) * radius,
                centerY + Math.sin(angle) * radius,
                {
                    color: '#fbbf24',
                    speedX: Math.cos(angle) * 8,
                    speedY: Math.sin(angle) * 8,
                    gravity: 0,
                    size: 8,
                    decay: 0.02
                }
            ));
        }

        // Center sparkle
        this.sparkle(centerX, centerY, 30);

        if (!this.isRunning) {
            this.start();
        }
    }

    // Update and draw particles
    update() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];

            // Update physics
            p.speedY += p.gravity;
            p.speedX *= p.friction;
            p.speedY *= p.friction;
            p.x += p.speedX;
            p.y += p.speedY;
            p.rotation += p.rotationSpeed;
            p.life -= p.decay;

            // Draw particle
            if (p.life > 0) {
                this.ctx.save();
                this.ctx.translate(p.x, p.y);
                this.ctx.rotate(p.rotation);
                this.ctx.globalAlpha = p.life;
                this.ctx.fillStyle = p.color;

                if (p.shape === 'circle') {
                    this.ctx.beginPath();
                    this.ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
                    this.ctx.fill();
                } else if (p.shape === 'star') {
                    this.drawStar(0, 0, 5, p.size / 2, p.size / 4);
                } else {
                    this.ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
                }

                this.ctx.restore();
            } else {
                // Remove dead particles
                this.particles.splice(i, 1);
            }
        }

        // Continue animation if particles exist
        if (this.particles.length > 0) {
            requestAnimationFrame(() => this.update());
        } else {
            this.isRunning = false;
        }
    }

    // Draw a star shape
    drawStar(cx, cy, spikes, outerRadius, innerRadius) {
        let rot = Math.PI / 2 * 3;
        let x = cx;
        let y = cy;
        const step = Math.PI / spikes;

        this.ctx.beginPath();
        this.ctx.moveTo(cx, cy - outerRadius);

        for (let i = 0; i < spikes; i++) {
            x = cx + Math.cos(rot) * outerRadius;
            y = cy + Math.sin(rot) * outerRadius;
            this.ctx.lineTo(x, y);
            rot += step;

            x = cx + Math.cos(rot) * innerRadius;
            y = cy + Math.sin(rot) * innerRadius;
            this.ctx.lineTo(x, y);
            rot += step;
        }

        this.ctx.lineTo(cx, cy - outerRadius);
        this.ctx.closePath();
        this.ctx.fill();
    }

    start() {
        this.isRunning = true;
        this.update();
    }

    clear() {
        this.particles = [];
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

// Create global instance
window.particles = new ParticleSystem();
