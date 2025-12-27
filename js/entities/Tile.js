/**
 * Tile Entity Class
 * Represents a single tile on the game board
 */

class Tile {
    /**
     * Create a new Tile
     * @param {string} type - Tile type from CONFIG.TILE_TYPES
     * @param {number} x - Grid x position (column)
     * @param {number} y - Grid y position (row)
     */
    constructor(type, x, y) {
        this.type = type;
        this.x = x;
        this.y = y;
        this.element = null;

        // State flags
        this.isMatched = false;
        this.isFalling = false;
        this.isSpecial = false;
        this.specialType = null;

        // Blocker properties
        this.iceLayer = 0;      // 0 = no ice, 1+ = ice layers
        this.isLocked = false;
    }

    /**
     * Check if this tile can be matched (regular color tiles only)
     * @returns {boolean}
     */
    isMatchable() {
        return CONFIG.MATCHABLE_COLORS.includes(this.type) && !this.isLocked;
    }

    /**
     * Check if this tile is empty
     * @returns {boolean}
     */
    isEmpty() {
        return this.type === CONFIG.TILE_TYPES.EMPTY;
    }

    /**
     * Check if this tile is a blocker (stone)
     * @returns {boolean}
     */
    isBlocker() {
        return this.type === CONFIG.TILE_TYPES.STONE;
    }

    /**
     * Check if this tile is the character
     * @returns {boolean}
     */
    isCharacter() {
        return this.type === CONFIG.TILE_TYPES.CHARACTER;
    }

    /**
     * Check if this tile is the exit
     * @returns {boolean}
     */
    isExit() {
        return this.type === CONFIG.TILE_TYPES.EXIT;
    }

    /**
     * Check if this tile can be swapped
     * @returns {boolean}
     */
    canSwap() {
        return this.isMatchable() && !this.isFalling && !this.isLocked;
    }

    /**
     * Set tile as a special power tile
     * @param {string} specialType - Type from CONFIG.SPECIAL_TILES
     */
    setSpecial(specialType) {
        this.isSpecial = true;
        this.specialType = specialType;
    }

    /**
     * Clear special status
     */
    clearSpecial() {
        this.isSpecial = false;
        this.specialType = null;
    }

    /**
     * Add ice layer to tile
     * @param {number} layers - Number of ice layers
     */
    addIce(layers = 1) {
        this.iceLayer = layers;
    }

    /**
     * Remove one ice layer
     * @returns {boolean} - True if ice was removed, false if no ice
     */
    removeIceLayer() {
        if (this.iceLayer > 0) {
            this.iceLayer--;
            return true;
        }
        return false;
    }

    /**
     * Lock the tile
     */
    lock() {
        this.isLocked = true;
    }

    /**
     * Unlock the tile
     */
    unlock() {
        this.isLocked = false;
    }

    /**
     * Create DOM element for this tile
     * @returns {HTMLElement}
     */
    createElement() {
        const el = document.createElement('div');
        el.className = 'tile';
        el.dataset.x = this.x;
        el.dataset.y = this.y;
        this.updateElement(el);
        this.element = el;
        return el;
    }

    /**
     * Update DOM element classes based on tile state
     * @param {HTMLElement} el - Optional element (uses this.element if not provided)
     */
    updateElement(el = this.element) {
        if (!el) return;

        // Build class list
        const classes = ['tile', this.type];

        if (this.isMatched) classes.push('matched');
        if (this.isFalling) classes.push('falling');
        if (this.isSpecial) classes.push('special', this.specialType);
        if (this.iceLayer > 0) classes.push('ice');
        if (this.isLocked) classes.push('locked');

        el.className = classes.join(' ');
        el.dataset.x = this.x;
        el.dataset.y = this.y;
    }

    /**
     * Clone this tile
     * @returns {Tile}
     */
    clone() {
        const tile = new Tile(this.type, this.x, this.y);
        tile.isSpecial = this.isSpecial;
        tile.specialType = this.specialType;
        tile.iceLayer = this.iceLayer;
        tile.isLocked = this.isLocked;
        return tile;
    }

    /**
     * Get string representation
     * @returns {string}
     */
    toString() {
        return `Tile(${this.type} @ ${this.x},${this.y})`;
    }
}

/**
 * Factory function to create random tile
 * @param {number} x - Grid x position
 * @param {number} y - Grid y position
 * @param {string[]} allowedTypes - Array of allowed tile types
 * @returns {Tile}
 */
function createRandomTile(x, y, allowedTypes = CONFIG.MATCHABLE_COLORS) {
    const randomType = allowedTypes[Math.floor(Math.random() * allowedTypes.length)];
    return new Tile(randomType, x, y);
}
