/**
 * Match Resolver
 * Detects matches and handles special tile creation
 */

class MatchResolver {
    /**
     * Create a new MatchResolver
     * @param {GridManager} gridManager - Reference to grid manager
     */
    constructor(gridManager) {
        this.gridManager = gridManager;
    }

    /**
     * Find all matches on the grid
     * @returns {Object[]} Array of match objects { tiles: [], type: 'horizontal'|'vertical', length: number }
     */
    findAllMatches() {
        const matches = [];
        const visited = new Set();

        // Helper to create position key
        const key = (x, y) => `${x},${y}`;

        // Find horizontal matches
        for (let y = 0; y < this.gridManager.height; y++) {
            let matchStart = 0;
            let currentType = null;

            for (let x = 0; x <= this.gridManager.width; x++) {
                const tile = this.gridManager.getTile(x, y);
                const tileType = tile?.isMatchable() ? tile.type : null;

                if (tileType === currentType && currentType !== null) {
                    // Continue match
                    continue;
                } else {
                    // End of potential match
                    const matchLength = x - matchStart;

                    if (matchLength >= CONFIG.MATCH.MIN_MATCH && currentType !== null) {
                        const matchTiles = [];
                        for (let mx = matchStart; mx < x; mx++) {
                            matchTiles.push({ x: mx, y: y });
                            visited.add(key(mx, y));
                        }
                        matches.push({
                            tiles: matchTiles,
                            type: 'horizontal',
                            length: matchLength,
                            color: currentType
                        });
                    }

                    matchStart = x;
                    currentType = tileType;
                }
            }
        }

        // Find vertical matches
        for (let x = 0; x < this.gridManager.width; x++) {
            let matchStart = 0;
            let currentType = null;

            for (let y = 0; y <= this.gridManager.height; y++) {
                const tile = this.gridManager.getTile(x, y);
                const tileType = tile?.isMatchable() ? tile.type : null;

                if (tileType === currentType && currentType !== null) {
                    continue;
                } else {
                    const matchLength = y - matchStart;

                    if (matchLength >= CONFIG.MATCH.MIN_MATCH && currentType !== null) {
                        const matchTiles = [];
                        for (let my = matchStart; my < y; my++) {
                            // Only add if not already in a horizontal match (avoid double counting)
                            matchTiles.push({ x: x, y: my });
                        }
                        matches.push({
                            tiles: matchTiles,
                            type: 'vertical',
                            length: matchLength,
                            color: currentType
                        });
                    }

                    matchStart = y;
                    currentType = tileType;
                }
            }
        }

        return matches;
    }

    /**
     * Get all unique positions from matches
     * @param {Object[]} matches - Array of match objects
     * @returns {Object[]} Array of unique {x, y} positions
     */
    getMatchedPositions(matches) {
        const positionMap = new Map();

        matches.forEach(match => {
            match.tiles.forEach(pos => {
                const key = `${pos.x},${pos.y}`;
                if (!positionMap.has(key)) {
                    positionMap.set(key, pos);
                }
            });
        });

        return Array.from(positionMap.values());
    }

    /**
     * Determine if a special tile should be created
     * @param {Object} match - Match object
     * @returns {Object|null} { type: specialType, position: {x, y} } or null
     */
    getSpecialTileForMatch(match) {
        if (match.length >= CONFIG.MATCH.BOMB_COUNT) {
            // 5+ match creates a bomb
            const centerIndex = Math.floor(match.tiles.length / 2);
            return {
                type: CONFIG.SPECIAL_TILES.BOMB,
                position: match.tiles[centerIndex],
                color: match.color
            };
        } else if (match.length >= CONFIG.MATCH.LINE_CLEAR_COUNT) {
            // 4-match creates line clear
            const centerIndex = Math.floor(match.tiles.length / 2);
            const specialType = match.type === 'horizontal'
                ? CONFIG.SPECIAL_TILES.LINE_V  // Horizontal match -> vertical clear
                : CONFIG.SPECIAL_TILES.LINE_H; // Vertical match -> horizontal clear
            return {
                type: specialType,
                position: match.tiles[centerIndex],
                color: match.color
            };
        }
        return null;
    }

    /**
     * Get tiles affected by special tile activation
     * @param {number} x - Special tile x position
     * @param {number} y - Special tile y position
     * @param {string} specialType - Type of special tile
     * @returns {Object[]} Array of {x, y} positions to clear
     */
    getSpecialTileAffectedPositions(x, y, specialType) {
        const positions = [];

        switch (specialType) {
            case CONFIG.SPECIAL_TILES.LINE_H:
                // Clear entire row
                for (let px = 0; px < this.gridManager.width; px++) {
                    const tile = this.gridManager.getTile(px, y);
                    if (tile && !tile.isBlocker() && !tile.isCharacter() && !tile.isExit()) {
                        positions.push({ x: px, y: y });
                    }
                }
                break;

            case CONFIG.SPECIAL_TILES.LINE_V:
                // Clear entire column
                for (let py = 0; py < this.gridManager.height; py++) {
                    const tile = this.gridManager.getTile(x, py);
                    if (tile && !tile.isBlocker() && !tile.isCharacter() && !tile.isExit()) {
                        positions.push({ x: x, y: py });
                    }
                }
                break;

            case CONFIG.SPECIAL_TILES.BOMB:
                // Clear 3x3 area
                for (let py = y - 1; py <= y + 1; py++) {
                    for (let px = x - 1; px <= x + 1; px++) {
                        const tile = this.gridManager.getTile(px, py);
                        if (tile && !tile.isBlocker() && !tile.isCharacter() && !tile.isExit()) {
                            positions.push({ x: px, y: py });
                        }
                    }
                }
                break;
        }

        return positions;
    }

    /**
     * Process all matches - clear tiles and handle ice/locked
     * @param {Object[]} matches - Array of match objects
     * @returns {Object} { clearedPositions: [], specialTiles: [] }
     */
    processMatches(matches) {
        const clearedPositions = [];
        const specialTiles = [];
        const processed = new Set();

        matches.forEach(match => {
            // Check for special tile creation
            const special = this.getSpecialTileForMatch(match);
            if (special) {
                specialTiles.push(special);
            }

            // Process each tile in match
            match.tiles.forEach(pos => {
                const key = `${pos.x},${pos.y}`;
                if (processed.has(key)) return;
                processed.add(key);

                const tile = this.gridManager.getTile(pos.x, pos.y);
                if (!tile) return;

                // Handle ice layer
                if (tile.iceLayer > 0) {
                    tile.removeIceLayer();
                    tile.updateElement();
                    // Don't clear tile yet if still has ice
                    if (tile.iceLayer > 0) return;
                }

                // Handle locked tiles - unlock adjacent
                this.unlockAdjacentTiles(pos.x, pos.y);

                clearedPositions.push(pos);
            });
        });

        return { clearedPositions, specialTiles };
    }

    /**
     * Unlock any locked tiles adjacent to position
     * @param {number} x - X position
     * @param {number} y - Y position
     */
    unlockAdjacentTiles(x, y) {
        const adjacent = this.gridManager.getAdjacentTiles(x, y);
        adjacent.forEach(tile => {
            if (tile.isLocked) {
                tile.unlock();
                tile.updateElement();
            }
        });
    }

    /**
     * Check if there are any matches on the grid
     * @returns {boolean}
     */
    hasMatches() {
        const matches = this.findAllMatches();
        return matches.length > 0;
    }

    /**
     * Check and resolve matches at specific positions (after swap)
     * @param {number} x1 - First position x
     * @param {number} y1 - First position y
     * @param {number} x2 - Second position x
     * @param {number} y2 - Second position y
     * @returns {boolean} True if matches were found
     */
    checkSwapForMatches(x1, y1, x2, y2) {
        return this.checkForMatchAt(x1, y1) || this.checkForMatchAt(x2, y2);
    }

    /**
     * Check for match at specific position
     * @param {number} x - X position
     * @param {number} y - Y position
     * @returns {boolean}
     */
    checkForMatchAt(x, y) {
        const tile = this.gridManager.getTile(x, y);
        if (!tile || !tile.isMatchable()) return false;

        // Check horizontal
        let hCount = 1;
        for (let i = x - 1; i >= 0; i--) {
            const t = this.gridManager.getTile(i, y);
            if (t && t.type === tile.type && t.isMatchable()) hCount++;
            else break;
        }
        for (let i = x + 1; i < this.gridManager.width; i++) {
            const t = this.gridManager.getTile(i, y);
            if (t && t.type === tile.type && t.isMatchable()) hCount++;
            else break;
        }
        if (hCount >= CONFIG.MATCH.MIN_MATCH) return true;

        // Check vertical
        let vCount = 1;
        for (let j = y - 1; j >= 0; j--) {
            const t = this.gridManager.getTile(x, j);
            if (t && t.type === tile.type && t.isMatchable()) vCount++;
            else break;
        }
        for (let j = y + 1; j < this.gridManager.height; j++) {
            const t = this.gridManager.getTile(x, j);
            if (t && t.type === tile.type && t.isMatchable()) vCount++;
            else break;
        }
        return vCount >= CONFIG.MATCH.MIN_MATCH;
    }
}
