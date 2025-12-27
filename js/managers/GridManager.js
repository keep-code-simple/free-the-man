/**
 * Grid Manager
 * Manages the game grid state and tile operations
 */

class GridManager {
    /**
     * Create a new GridManager
     * @param {number} width - Grid width (columns)
     * @param {number} height - Grid height (rows)
     */
    constructor(width = CONFIG.GRID.DEFAULT_WIDTH, height = CONFIG.GRID.DEFAULT_HEIGHT) {
        this.width = width;
        this.height = height;
        this.grid = [];
        this.boardElement = null;
        this.selectedTile = null;
        this.onSwapCallback = null;
    }

    /**
     * Initialize the grid with random tiles
     * @param {Object} levelConfig - Level configuration
     */
    initialize(levelConfig = {}) {
        const {
            blockers = [],
            exitPosition = { x: Math.floor(this.width / 2), y: 0 },
            characterStart = { x: Math.floor(this.width / 2), y: this.height - 1 },
            tileTypes = CONFIG.MATCHABLE_COLORS
        } = levelConfig;

        this.tileTypes = tileTypes;
        this.exitPosition = exitPosition;
        this.characterPosition = { ...characterStart };

        // Create empty grid
        this.grid = [];
        for (let y = 0; y < this.height; y++) {
            const row = [];
            for (let x = 0; x < this.width; x++) {
                row.push(null);
            }
            this.grid.push(row);
        }

        // Place blockers first
        blockers.forEach(blocker => {
            const tile = new Tile(blocker.type, blocker.x, blocker.y);
            if (blocker.iceLayer) tile.addIce(blocker.iceLayer);
            if (blocker.locked) tile.lock();
            this.grid[blocker.y][blocker.x] = tile;
        });

        // Place exit tile
        this.grid[exitPosition.y][exitPosition.x] = new Tile(CONFIG.TILE_TYPES.EXIT, exitPosition.x, exitPosition.y);

        // Mark character position as empty (character is rendered separately)
        this.grid[characterStart.y][characterStart.x] = new Tile(CONFIG.TILE_TYPES.EMPTY, characterStart.x, characterStart.y);

        // Fill remaining positions with random matchable tiles
        // Ensure no initial matches by checking each placement
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (this.grid[y][x] === null) {
                    const tile = this.createNonMatchingTile(x, y, tileTypes);
                    this.grid[y][x] = tile;
                }
            }
        }
    }

    /**
     * Create a tile that doesn't form an immediate match
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {string[]} tileTypes - Allowed tile types
     * @returns {Tile}
     */
    createNonMatchingTile(x, y, tileTypes) {
        const availableTypes = [...tileTypes];

        // Check left tiles
        if (x >= 2) {
            const left1 = this.grid[y][x - 1];
            const left2 = this.grid[y][x - 2];
            if (left1 && left2 && left1.type === left2.type && left1.isMatchable()) {
                const index = availableTypes.indexOf(left1.type);
                if (index > -1) availableTypes.splice(index, 1);
            }
        }

        // Check top tiles
        if (y >= 2) {
            const top1 = this.grid[y - 1][x];
            const top2 = this.grid[y - 2][x];
            if (top1 && top2 && top1.type === top2.type && top1.isMatchable()) {
                const index = availableTypes.indexOf(top1.type);
                if (index > -1) availableTypes.splice(index, 1);
            }
        }

        // If all types would cause a match, just pick any
        const types = availableTypes.length > 0 ? availableTypes : tileTypes;
        const randomType = types[Math.floor(Math.random() * types.length)];

        return new Tile(randomType, x, y);
    }

    /**
     * Render the grid to DOM
     * @param {HTMLElement} boardElement - Container element for the grid
     */
    render(boardElement) {
        this.boardElement = boardElement;
        boardElement.innerHTML = '';

        // Set grid CSS
        boardElement.style.gridTemplateColumns = `repeat(${this.width}, var(--tile-size))`;
        boardElement.style.gridTemplateRows = `repeat(${this.height}, var(--tile-size))`;

        // Create tiles
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const tile = this.grid[y][x];
                if (tile) {
                    const element = tile.createElement();
                    this.attachTileEvents(element, x, y);
                    boardElement.appendChild(element);
                }
            }
        }
    }

    /**
     * Re-render the entire grid (after major changes)
     */
    rerender() {
        if (this.boardElement) {
            this.render(this.boardElement);
        }
    }

    /**
     * Attach click/touch events to a tile
     * @param {HTMLElement} element - Tile DOM element
     * @param {number} x - Tile x position
     * @param {number} y - Tile y position
     */
    attachTileEvents(element, x, y) {
        const handleSelect = (e) => {
            e.preventDefault();
            this.handleTileSelect(x, y);
        };

        element.addEventListener('click', handleSelect);
        element.addEventListener('touchend', handleSelect);
    }

    /**
     * Handle tile selection for swapping
     * @param {number} x - Selected tile x
     * @param {number} y - Selected tile y
     */
    handleTileSelect(x, y) {
        const tile = this.grid[y][x];

        // Can't select non-swappable tiles
        if (!tile || !tile.canSwap()) {
            this.clearSelection();
            return;
        }

        if (this.selectedTile === null) {
            // First selection
            this.selectedTile = { x, y };
            tile.element?.classList.add('selected');
        } else {
            // Second selection - check if adjacent
            const { x: sx, y: sy } = this.selectedTile;

            if (this.areAdjacent(sx, sy, x, y)) {
                // Attempt swap
                if (this.onSwapCallback) {
                    this.onSwapCallback(sx, sy, x, y);
                }
            }

            this.clearSelection();
        }
    }

    /**
     * Clear current tile selection
     */
    clearSelection() {
        if (this.selectedTile) {
            const { x, y } = this.selectedTile;
            const tile = this.grid[y][x];
            tile?.element?.classList.remove('selected');
        }
        this.selectedTile = null;
    }

    /**
     * Set callback for swap attempts
     * @param {Function} callback - Called with (x1, y1, x2, y2)
     */
    setSwapCallback(callback) {
        this.onSwapCallback = callback;
    }

    /**
     * Check if two positions are adjacent (not diagonal)
     * @param {number} x1 - First x
     * @param {number} y1 - First y
     * @param {number} x2 - Second x
     * @param {number} y2 - Second y
     * @returns {boolean}
     */
    areAdjacent(x1, y1, x2, y2) {
        const dx = Math.abs(x1 - x2);
        const dy = Math.abs(y1 - y2);
        return (dx === 1 && dy === 0) || (dx === 0 && dy === 1);
    }

    /**
     * Swap two tiles in the grid
     * @param {number} x1 - First tile x
     * @param {number} y1 - First tile y
     * @param {number} x2 - Second tile x
     * @param {number} y2 - Second tile y
     */
    swap(x1, y1, x2, y2) {
        const tile1 = this.grid[y1][x1];
        const tile2 = this.grid[y2][x2];

        // Swap in grid
        this.grid[y1][x1] = tile2;
        this.grid[y2][x2] = tile1;

        // Update tile positions
        if (tile1) {
            tile1.x = x2;
            tile1.y = y2;
        }
        if (tile2) {
            tile2.x = x1;
            tile2.y = y1;
        }
    }

    /**
     * Get tile at position
     * @param {number} x - X position
     * @param {number} y - Y position
     * @returns {Tile|null}
     */
    getTile(x, y) {
        if (this.isValidPosition(x, y)) {
            return this.grid[y][x];
        }
        return null;
    }

    /**
     * Set tile at position
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {Tile} tile - Tile to set
     */
    setTile(x, y, tile) {
        if (this.isValidPosition(x, y)) {
            this.grid[y][x] = tile;
            if (tile) {
                tile.x = x;
                tile.y = y;
            }
        }
    }

    /**
     * Check if position is within grid bounds
     * @param {number} x - X position
     * @param {number} y - Y position
     * @returns {boolean}
     */
    isValidPosition(x, y) {
        return x >= 0 && x < this.width && y >= 0 && y < this.height;
    }

    /**
     * Check if a position is empty
     * @param {number} x - X position
     * @param {number} y - Y position
     * @returns {boolean}
     */
    isEmpty(x, y) {
        const tile = this.getTile(x, y);
        return tile && tile.isEmpty();
    }

    /**
     * Mark a position as empty
     * @param {number} x - X position
     * @param {number} y - Y position
     */
    setEmpty(x, y) {
        this.setTile(x, y, new Tile(CONFIG.TILE_TYPES.EMPTY, x, y));
    }

    /**
     * Get DOM element for a tile position
     * @param {number} x - X position
     * @param {number} y - Y position
     * @returns {HTMLElement|null}
     */
    getTileElement(x, y) {
        const tile = this.getTile(x, y);
        return tile?.element || null;
    }

    /**
     * Update character position in grid (mark as empty)
     * @param {number} oldX - Old x position
     * @param {number} oldY - Old y position
     * @param {number} newX - New x position
     * @param {number} newY - New y position
     */
    updateCharacterPosition(oldX, oldY, newX, newY) {
        // Don't overwrite exit tile
        if (!(oldX === this.exitPosition.x && oldY === this.exitPosition.y)) {
            this.setEmpty(oldX, oldY);
        }
        this.characterPosition = { x: newX, y: newY };
    }

    /**
     * Get adjacent tiles
     * @param {number} x - Center x
     * @param {number} y - Center y
     * @returns {Tile[]}
     */
    getAdjacentTiles(x, y) {
        const adjacent = [];
        const directions = Object.values(CONFIG.DIRECTIONS);

        directions.forEach(dir => {
            const nx = x + dir.x;
            const ny = y + dir.y;
            const tile = this.getTile(nx, ny);
            if (tile) adjacent.push(tile);
        });

        return adjacent;
    }

    /**
     * Check if there are any possible moves
     * @returns {boolean}
     */
    hasPossibleMoves() {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const tile = this.getTile(x, y);
                if (!tile || !tile.isMatchable()) continue;

                // Check swap with right neighbor
                if (x < this.width - 1) {
                    const right = this.getTile(x + 1, y);
                    if (right && right.isMatchable()) {
                        // Temporarily swap
                        this.swap(x, y, x + 1, y);
                        const hasMatch = this.checkForMatchAt(x, y) || this.checkForMatchAt(x + 1, y);
                        this.swap(x, y, x + 1, y); // Swap back
                        if (hasMatch) return true;
                    }
                }

                // Check swap with bottom neighbor
                if (y < this.height - 1) {
                    const bottom = this.getTile(x, y + 1);
                    if (bottom && bottom.isMatchable()) {
                        this.swap(x, y, x, y + 1);
                        const hasMatch = this.checkForMatchAt(x, y) || this.checkForMatchAt(x, y + 1);
                        this.swap(x, y, x, y + 1);
                        if (hasMatch) return true;
                    }
                }
            }
        }
        return false;
    }

    /**
     * Simple check for match at position
     * @param {number} x - X position
     * @param {number} y - Y position
     * @returns {boolean}
     */
    checkForMatchAt(x, y) {
        const tile = this.getTile(x, y);
        if (!tile || !tile.isMatchable()) return false;

        // Check horizontal
        let hCount = 1;
        for (let i = x - 1; i >= 0; i--) {
            const t = this.getTile(i, y);
            if (t && t.type === tile.type) hCount++;
            else break;
        }
        for (let i = x + 1; i < this.width; i++) {
            const t = this.getTile(i, y);
            if (t && t.type === tile.type) hCount++;
            else break;
        }
        if (hCount >= 3) return true;

        // Check vertical
        let vCount = 1;
        for (let j = y - 1; j >= 0; j--) {
            const t = this.getTile(x, j);
            if (t && t.type === tile.type) vCount++;
            else break;
        }
        for (let j = y + 1; j < this.height; j++) {
            const t = this.getTile(x, j);
            if (t && t.type === tile.type) vCount++;
            else break;
        }
        if (vCount >= 3) return true;

        return false;
    }

    /**
     * Find a hint (possible move)
     * @returns {{x1: number, y1: number, x2: number, y2: number}|null}
     */
    findHint() {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const tile = this.getTile(x, y);
                if (!tile || !tile.isMatchable()) continue;

                // Check right
                if (x < this.width - 1) {
                    const right = this.getTile(x + 1, y);
                    if (right && right.isMatchable()) {
                        this.swap(x, y, x + 1, y);
                        const hasMatch = this.checkForMatchAt(x, y) || this.checkForMatchAt(x + 1, y);
                        this.swap(x, y, x + 1, y);
                        if (hasMatch) return { x1: x, y1: y, x2: x + 1, y2: y };
                    }
                }

                // Check down
                if (y < this.height - 1) {
                    const down = this.getTile(x, y + 1);
                    if (down && down.isMatchable()) {
                        this.swap(x, y, x, y + 1);
                        const hasMatch = this.checkForMatchAt(x, y) || this.checkForMatchAt(x, y + 1);
                        this.swap(x, y, x, y + 1);
                        if (hasMatch) return { x1: x, y1: y, x2: x, y2: y + 1 };
                    }
                }
            }
        }
        return null;
    }
}
