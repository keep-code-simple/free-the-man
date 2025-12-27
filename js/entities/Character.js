/**
 * Character Entity Class
 * Represents the trapped person that needs to escape
 */

class Character {
    /**
     * Create the character
     * @param {number} x - Starting grid x position (column)
     * @param {number} y - Starting grid y position (row)
     */
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.startX = x;
        this.startY = y;
        this.element = null;
        this.isMoving = false;
        this.hasEscaped = false;
    }

    /**
     * Move character to a new position
     * @param {number} newX - New x position
     * @param {number} newY - New y position
     */
    moveTo(newX, newY) {
        this.x = newX;
        this.y = newY;
    }

    /**
     * Check if character can move to a position
     * @param {number} targetY - Target y position
     * @param {Function} isEmpty - Function to check if position is empty
     * @returns {boolean}
     */
    canMoveUp(isEmpty) {
        // Character moves up (y decreases)
        return this.y > 0 && isEmpty(this.x, this.y - 1);
    }

    /**
     * Get the position above the character
     * @returns {{x: number, y: number}}
     */
    getPositionAbove() {
        return { x: this.x, y: this.y - 1 };
    }

    /**
     * Check if character has reached the exit row
     * @param {number} exitY - The y position of the exit
     * @returns {boolean}
     */
    hasReachedExit(exitY) {
        return this.y <= exitY;
    }

    /**
     * Reset character to starting position
     */
    reset() {
        this.x = this.startX;
        this.y = this.startY;
        this.isMoving = false;
        this.hasEscaped = false;
    }

    /**
     * Mark character as escaped
     */
    escape() {
        this.hasEscaped = true;
    }

    /**
     * Get current position
     * @returns {{x: number, y: number}}
     */
    getPosition() {
        return { x: this.x, y: this.y };
    }

    /**
     * Create DOM element for character display
     * @returns {HTMLElement}
     */
    createElement() {
        const el = document.createElement('div');
        el.className = 'tile character';
        el.id = 'character';
        this.element = el;
        return el;
    }

    /**
     * Update element position on grid
     * @param {number} tileSize - Size of each tile in pixels
     * @param {number} gap - Gap between tiles
     */
    updateElementPosition(tileSize, gap) {
        if (!this.element) return;

        const left = this.x * (tileSize + gap);
        const top = this.y * (tileSize + gap);

        this.element.style.transform = `translate(${left}px, ${top}px)`;
    }

    /**
     * String representation
     * @returns {string}
     */
    toString() {
        return `Character @ (${this.x}, ${this.y}) - Escaped: ${this.hasEscaped}`;
    }
}
