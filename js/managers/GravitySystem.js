/**
 * Gravity System
 * Handles tiles falling after matches and spawning new tiles
 */

class GravitySystem {
    /**
     * Create gravity system
     * @param {GridManager} gridManager - Reference to grid manager
     */
    constructor(gridManager) {
        this.gridManager = gridManager;
    }

    /**
     * Apply gravity - make tiles fall to fill empty spaces
     * @returns {Object[]} Array of { fromX, fromY, toX, toY } movement data
     */
    applyGravity() {
        const movements = [];

        // Process each column from bottom to top
        for (let x = 0; x < this.gridManager.width; x++) {
            // Find all empty positions in this column
            const emptyPositions = [];

            for (let y = this.gridManager.height - 1; y >= 0; y--) {
                const tile = this.gridManager.getTile(x, y);

                // Skip: character position, exit tile, blockers
                if (this.isPositionFixed(x, y)) continue;

                if (tile && tile.isEmpty()) {
                    emptyPositions.push(y);
                }
            }

            // For each empty position, look for tiles above to fall
            emptyPositions.forEach(emptyY => {
                // Find a tile above that can fall
                for (let searchY = emptyY - 1; searchY >= 0; searchY--) {
                    const tile = this.gridManager.getTile(x, searchY);

                    // Skip fixed positions
                    if (this.isPositionFixed(x, searchY)) continue;

                    // Found a tile that can fall
                    if (tile && !tile.isEmpty() && !tile.isBlocker() && tile.isMatchable()) {
                        // Move tile down
                        this.gridManager.setTile(x, emptyY, tile);
                        this.gridManager.setEmpty(x, searchY);

                        movements.push({
                            fromX: x,
                            fromY: searchY,
                            toX: x,
                            toY: emptyY
                        });
                        break;
                    }
                }
            });
        }

        return movements;
    }

    /**
     * Apply gravity repeatedly until no more movements
     * @returns {Object[][]} Array of movement arrays (one per iteration)
     */
    applyGravityFully() {
        const allMovements = [];
        let movements;

        do {
            movements = this.applyGravity();
            if (movements.length > 0) {
                allMovements.push(movements);
            }
        } while (movements.length > 0);

        return allMovements;
    }

    /**
     * Check if position is fixed (shouldn't move or be replaced)
     * @param {number} x - X position
     * @param {number} y - Y position
     * @returns {boolean}
     */
    isPositionFixed(x, y) {
        const tile = this.gridManager.getTile(x, y);

        // Character position
        const charPos = this.gridManager.characterPosition;
        if (charPos && x === charPos.x && y === charPos.y) return true;

        // Exit position
        if (tile && tile.isExit()) return true;

        // Stone blockers
        if (tile && tile.isBlocker()) return true;

        return false;
    }

    /**
     * Fill empty spaces at the top with new tiles
     * @returns {Object[]} Array of { x, y, tile } for new tiles
     */
    spawnNewTiles() {
        const newTiles = [];
        const tileTypes = this.gridManager.tileTypes || CONFIG.MATCHABLE_COLORS;

        for (let x = 0; x < this.gridManager.width; x++) {
            for (let y = 0; y < this.gridManager.height; y++) {
                const tile = this.gridManager.getTile(x, y);

                // Skip fixed positions
                if (this.isPositionFixed(x, y)) continue;

                if (tile && tile.isEmpty()) {
                    // Create new random tile
                    const newTile = this.gridManager.createNonMatchingTile(x, y, tileTypes);
                    this.gridManager.setTile(x, y, newTile);

                    newTiles.push({
                        x: x,
                        y: y,
                        tile: newTile
                    });
                }
            }
        }

        return newTiles;
    }

    /**
     * Complete gravity cycle: apply gravity and spawn new tiles
     * @returns {Object} { movements: [], newTiles: [] }
     */
    processGravity() {
        // Apply gravity until stable
        const allMovements = this.applyGravityFully();
        const movements = allMovements.flat();

        // Spawn new tiles to fill any remaining empty spaces
        const newTiles = this.spawnNewTiles();

        // Apply gravity again for new tiles
        if (newTiles.length > 0) {
            const additionalMovements = this.applyGravityFully();
            movements.push(...additionalMovements.flat());
        }

        return { movements, newTiles };
    }

    /**
     * Get empty positions in the grid
     * @returns {Object[]} Array of {x, y}
     */
    getEmptyPositions() {
        const empty = [];

        for (let y = 0; y < this.gridManager.height; y++) {
            for (let x = 0; x < this.gridManager.width; x++) {
                const tile = this.gridManager.getTile(x, y);
                if (tile && tile.isEmpty() && !this.isPositionFixed(x, y)) {
                    empty.push({ x, y });
                }
            }
        }

        return empty;
    }
}
