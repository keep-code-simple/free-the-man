/**
 * Character Controller
 * Manages the trapped person's movement and escape logic
 */

class CharacterController {
    /**
     * Create character controller
     * @param {GridManager} gridManager - Reference to grid manager
     */
    constructor(gridManager) {
        this.gridManager = gridManager;
        this.character = null;
        this.exitY = 0;
    }

    /**
     * Initialize character at starting position
     * @param {number} x - Starting x position
     * @param {number} y - Starting y position
     * @param {number} exitY - Y position of exit (typically 0)
     */
    initialize(x, y, exitY = 0) {
        this.character = new Character(x, y);
        this.exitY = exitY;

        // Mark character position in grid
        this.gridManager.updateCharacterPosition(x, y, x, y);
    }

    /**
     * Try to move character upward
     * @returns {Object|null} { fromY, toY } if moved, null if couldn't move
     */
    tryMoveUp() {
        if (!this.character || this.character.isMoving) return null;

        const { x, y } = this.character.getPosition();

        // Check if can move up
        if (y <= 0) return null; // Already at top

        const tileAbove = this.gridManager.getTile(x, y - 1);

        // Can move if tile above is empty or is the exit
        const canMove = tileAbove && (tileAbove.isEmpty() || tileAbove.isExit());

        if (canMove) {
            const fromY = y;
            const toY = y - 1;

            // Update character position
            this.character.moveTo(x, toY);
            this.gridManager.updateCharacterPosition(x, fromY, x, toY);

            return { fromY, toY, x };
        }

        return null;
    }

    /**
     * Move character up as far as possible
     * @returns {Object[]} Array of movements { fromY, toY, x }
     */
    moveToHighestEmpty() {
        const movements = [];

        let movement = this.tryMoveUp();
        while (movement) {
            movements.push(movement);

            // Check if reached exit
            if (this.hasEscaped()) break;

            movement = this.tryMoveUp();
        }

        return movements;
    }

    /**
     * Check if character has reached the exit
     * @returns {boolean}
     */
    hasEscaped() {
        if (!this.character) return false;
        return this.character.y <= this.exitY;
    }

    /**
     * Get current character position
     * @returns {{x: number, y: number}|null}
     */
    getPosition() {
        return this.character?.getPosition() || null;
    }

    /**
     * Reset character to starting position
     */
    reset() {
        if (this.character) {
            const { startX, startY } = this.character;
            this.character.reset();
            this.gridManager.updateCharacterPosition(
                this.character.x,
                this.character.y,
                startX,
                startY
            );
        }
    }

    /**
     * Get the character instance
     * @returns {Character|null}
     */
    getCharacter() {
        return this.character;
    }

    /**
     * Check if a position is directly above character
     * @param {number} x - X position to check
     * @param {number} y - Y position to check
     * @returns {boolean}
     */
    isPositionAboveCharacter(x, y) {
        if (!this.character) return false;
        const { x: cx, y: cy } = this.character.getPosition();
        return x === cx && y < cy;
    }

    /**
     * Get the path from character to exit
     * @returns {Object[]} Array of positions on the path
     */
    getPathToExit() {
        if (!this.character) return [];

        const path = [];
        const { x } = this.character.getPosition();

        for (let y = this.character.y - 1; y >= this.exitY; y--) {
            path.push({ x, y });
        }

        return path;
    }

    /**
     * Check if character is blocked
     * @returns {boolean}
     */
    isBlocked() {
        if (!this.character) return true;

        const { x, y } = this.character.getPosition();
        if (y <= 0) return false; // At top, not blocked

        const tileAbove = this.gridManager.getTile(x, y - 1);
        return !tileAbove || (!tileAbove.isEmpty() && !tileAbove.isExit());
    }
}
