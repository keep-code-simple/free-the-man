/**
 * Animation Manager
 * Handles all game animations using CSS classes and JavaScript timing
 */

class AnimationManager {
    constructor() {
        this.animations = new Map();
        this.animationId = 0;
    }

    /**
     * Wait for a specified duration
     * @param {number} ms - Milliseconds to wait
     * @returns {Promise}
     */
    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Animate tile swap between two tiles
     * @param {HTMLElement} tile1 - First tile element
     * @param {HTMLElement} tile2 - Second tile element
     * @param {number} duration - Animation duration in ms
     * @returns {Promise}
     */
    async animateSwap(tile1, tile2, duration = CONFIG.ANIMATION.SWAP) {
        if (!tile1 || !tile2) return;

        const rect1 = tile1.getBoundingClientRect();
        const rect2 = tile2.getBoundingClientRect();

        const dx = rect2.left - rect1.left;
        const dy = rect2.top - rect1.top;

        tile1.classList.add('swapping');
        tile2.classList.add('swapping');

        tile1.style.transform = `translate(${dx}px, ${dy}px)`;
        tile2.style.transform = `translate(${-dx}px, ${-dy}px)`;

        await this.wait(duration);

        tile1.style.transform = '';
        tile2.style.transform = '';
        tile1.classList.remove('swapping');
        tile2.classList.remove('swapping');
    }

    /**
     * Animate invalid swap (shake)
     * @param {HTMLElement} tile1 - First tile element
     * @param {HTMLElement} tile2 - Second tile element
     * @returns {Promise}
     */
    async animateInvalidSwap(tile1, tile2) {
        tile1?.classList.add('invalid-swap');
        tile2?.classList.add('invalid-swap');

        await this.wait(300);

        tile1?.classList.remove('invalid-swap');
        tile2?.classList.remove('invalid-swap');
    }

    /**
     * Animate tile match (destruction)
     * @param {HTMLElement[]} tiles - Array of tile elements to animate
     * @param {number} duration - Animation duration in ms
     * @returns {Promise}
     */
    async animateMatch(tiles, duration = CONFIG.ANIMATION.MATCH) {
        tiles.forEach(tile => {
            if (tile) tile.classList.add('matched');
        });

        await this.wait(duration);
    }

    /**
     * Animate tiles falling
     * @param {Object[]} fallData - Array of {element, fromY, toY}
     * @param {number} duration - Animation duration in ms
     * @returns {Promise}
     */
    async animateFall(fallData, duration = CONFIG.ANIMATION.FALL) {
        fallData.forEach(({ element }) => {
            if (element) element.classList.add('falling');
        });

        await this.wait(duration);

        fallData.forEach(({ element }) => {
            if (element) element.classList.remove('falling');
        });
    }

    /**
     * Animate new tile spawning
     * @param {HTMLElement[]} tiles - Array of new tile elements
     * @param {number} duration - Animation duration in ms
     * @returns {Promise}
     */
    async animateSpawn(tiles, duration = CONFIG.ANIMATION.SPAWN) {
        tiles.forEach(tile => {
            if (tile) tile.classList.add('spawning');
        });

        await this.wait(duration);

        tiles.forEach(tile => {
            if (tile) tile.classList.remove('spawning');
        });
    }

    /**
     * Animate character moving up
     * @param {HTMLElement} characterEl - Character element
     * @param {number} fromY - Starting row
     * @param {number} toY - Ending row
     * @param {number} tileSize - Size of each tile
     * @param {number} gap - Gap between tiles
     * @param {number} duration - Animation duration in ms
     * @returns {Promise}
     */
    async animateCharacterMove(characterEl, fromY, toY, tileSize, gap, duration = CONFIG.ANIMATION.CHARACTER_MOVE) {
        if (!characterEl) return;

        // Calculate pixel movement
        const deltaY = (toY - fromY) * (tileSize + gap);

        characterEl.style.transition = `transform ${duration}ms ease-out`;
        characterEl.style.transform = `translateY(${deltaY}px)`;

        await this.wait(duration);

        characterEl.style.transition = '';
        characterEl.style.transform = '';
    }

    /**
     * Animate special tile activation (line clear, bomb)
     * @param {string} type - Special tile type
     * @param {HTMLElement[]} affectedTiles - Tiles to animate
     * @returns {Promise}
     */
    async animateSpecialActivation(type, affectedTiles) {
        // Add flash effect to affected tiles
        affectedTiles.forEach(tile => {
            if (tile) {
                tile.style.filter = 'brightness(2)';
            }
        });

        await this.wait(150);

        // Clear tiles with explosion effect
        await this.animateMatch(affectedTiles, 200);
    }

    /**
     * Create particle effect at position
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {string} color - Particle color
     */
    createParticles(x, y, color) {
        // Create simple particle effect (optional enhancement)
        const particleCount = 6;
        const container = document.querySelector('.game-board');
        if (!container) return;

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.cssText = `
                position: absolute;
                left: ${x}px;
                top: ${y}px;
                width: 8px;
                height: 8px;
                background: ${color};
                border-radius: 50%;
                pointer-events: none;
                animation: particleFly 0.5s ease-out forwards;
                --angle: ${(360 / particleCount) * i}deg;
            `;
            container.appendChild(particle);

            // Remove after animation
            setTimeout(() => particle.remove(), 500);
        }
    }

    /**
     * Highlight tiles (for hints)
     * @param {HTMLElement[]} tiles - Tiles to highlight
     * @param {number} duration - How long to highlight
     * @returns {Promise}
     */
    async highlightTiles(tiles, duration = 1500) {
        tiles.forEach(tile => {
            if (tile) {
                tile.style.boxShadow = '0 0 20px 5px rgba(255, 255, 0, 0.8)';
            }
        });

        await this.wait(duration);

        tiles.forEach(tile => {
            if (tile) {
                tile.style.boxShadow = '';
            }
        });
    }

    /**
     * Pulse animation for element
     * @param {HTMLElement} element - Element to pulse
     * @param {number} count - Number of pulses
     * @returns {Promise}
     */
    async pulse(element, count = 2) {
        for (let i = 0; i < count; i++) {
            element.style.transform = 'scale(1.1)';
            await this.wait(150);
            element.style.transform = 'scale(1)';
            await this.wait(150);
        }
    }
}

// Create global instance
const animationManager = new AnimationManager();
