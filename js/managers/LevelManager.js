/**
 * Level Manager
 * Handles level loading, progression, and game state
 */

class LevelManager {
    constructor() {
        this.levels = [];
        this.currentLevelIndex = 0;
        this.currentLevel = null;
        this.movesRemaining = 0;
        this.maxMoves = 0;
        this.gameState = CONFIG.STATE.IDLE;

        // Callbacks
        this.onLevelLoaded = null;
        this.onMovesChanged = null;
        this.onWin = null;
        this.onLose = null;
    }

    /**
     * Load levels from configuration
     * @param {Object[]} levelData - Array of level configurations
     */
    loadLevels(levelData) {
        this.levels = levelData;
    }

    /**
     * Get level configuration by index
     * @param {number} index - Level index (0-based)
     * @returns {Object|null}
     */
    getLevel(index) {
        if (index >= 0 && index < this.levels.length) {
            return this.levels[index];
        }
        return null;
    }

    /**
     * Start a specific level
     * @param {number} index - Level index
     * @returns {Object|null} Level configuration
     */
    startLevel(index) {
        const level = this.getLevel(index);
        if (!level) return null;

        this.currentLevelIndex = index;
        this.currentLevel = level;
        this.maxMoves = level.maxMoves || 20;
        this.movesRemaining = this.maxMoves;
        this.gameState = CONFIG.STATE.IDLE;

        if (this.onLevelLoaded) {
            this.onLevelLoaded(level, index + 1);
        }

        if (this.onMovesChanged) {
            this.onMovesChanged(this.movesRemaining, this.maxMoves);
        }

        return level;
    }

    /**
     * Start the next level
     * @returns {Object|null} Next level configuration
     */
    nextLevel() {
        return this.startLevel(this.currentLevelIndex + 1);
    }

    /**
     * Restart current level
     * @returns {Object|null} Current level configuration
     */
    restartLevel() {
        return this.startLevel(this.currentLevelIndex);
    }

    /**
     * Use a move
     * @returns {boolean} True if move was used, false if no moves left
     */
    useMove() {
        if (this.movesRemaining <= 0) return false;

        this.movesRemaining--;

        if (this.onMovesChanged) {
            this.onMovesChanged(this.movesRemaining, this.maxMoves);
        }

        // Check for lose condition
        if (this.movesRemaining <= 0 && this.gameState !== CONFIG.STATE.WIN) {
            this.triggerLose();
            return false;
        }

        return true;
    }

    /**
     * Add bonus moves
     * @param {number} moves - Number of moves to add
     */
    addMoves(moves) {
        this.movesRemaining += moves;

        if (this.onMovesChanged) {
            this.onMovesChanged(this.movesRemaining, this.maxMoves);
        }
    }

    /**
     * Trigger win condition
     */
    triggerWin() {
        this.gameState = CONFIG.STATE.WIN;

        if (this.onWin) {
            this.onWin({
                level: this.currentLevelIndex + 1,
                movesUsed: this.maxMoves - this.movesRemaining,
                movesRemaining: this.movesRemaining
            });
        }
    }

    /**
     * Trigger lose condition
     */
    triggerLose() {
        this.gameState = CONFIG.STATE.LOSE;

        if (this.onLose) {
            this.onLose({
                level: this.currentLevelIndex + 1
            });
        }
    }

    /**
     * Check if game is over (win or lose)
     * @returns {boolean}
     */
    isGameOver() {
        return this.gameState === CONFIG.STATE.WIN || this.gameState === CONFIG.STATE.LOSE;
    }

    /**
     * Check if player has won
     * @returns {boolean}
     */
    hasWon() {
        return this.gameState === CONFIG.STATE.WIN;
    }

    /**
     * Check if player has lost
     * @returns {boolean}
     */
    hasLost() {
        return this.gameState === CONFIG.STATE.LOSE;
    }

    /**
     * Set game state
     * @param {string} state - State from CONFIG.STATE
     */
    setState(state) {
        this.gameState = state;
    }

    /**
     * Get current game state
     * @returns {string}
     */
    getState() {
        return this.gameState;
    }

    /**
     * Check if there are more levels
     * @returns {boolean}
     */
    hasMoreLevels() {
        return this.currentLevelIndex < this.levels.length - 1;
    }

    /**
     * Get current level number (1-based)
     * @returns {number}
     */
    getCurrentLevelNumber() {
        return this.currentLevelIndex + 1;
    }

    /**
     * Get total number of levels
     * @returns {number}
     */
    getTotalLevels() {
        return this.levels.length;
    }

    /**
     * Get moves remaining
     * @returns {number}
     */
    getMovesRemaining() {
        return this.movesRemaining;
    }
}

// Default levels (built-in)
const DEFAULT_LEVELS = [
    // Level 1: Tutorial - Simple path
    {
        id: 1,
        name: "First Steps",
        gridWidth: 7,
        gridHeight: 8,
        maxMoves: 25,
        characterStart: { x: 3, y: 7 },
        exitPosition: { x: 3, y: 0 },
        blockers: [],
        tileTypes: ["red", "blue", "green", "yellow"]
    },

    // Level 2: Introduce stone blockers
    {
        id: 2,
        name: "Stone Cold",
        gridWidth: 7,
        gridHeight: 9,
        maxMoves: 22,
        characterStart: { x: 3, y: 8 },
        exitPosition: { x: 3, y: 0 },
        blockers: [
            { type: "stone", x: 2, y: 4 },
            { type: "stone", x: 4, y: 4 },
            { type: "stone", x: 1, y: 6 },
            { type: "stone", x: 5, y: 6 }
        ],
        tileTypes: ["red", "blue", "green", "yellow"]
    },

    // Level 3: Introduce ice tiles
    {
        id: 3,
        name: "Ice Breaker",
        gridWidth: 8,
        gridHeight: 10,
        maxMoves: 25,
        characterStart: { x: 4, y: 9 },
        exitPosition: { x: 4, y: 0 },
        blockers: [
            { type: "stone", x: 2, y: 3 },
            { type: "stone", x: 5, y: 3 },
            { type: "stone", x: 3, y: 5, iceLayer: 2 },
            { type: "stone", x: 4, y: 5, iceLayer: 2 }
        ],
        tileTypes: ["red", "blue", "green", "yellow", "purple"]
    },

    // Level 4: Narrow passage with locked tiles
    {
        id: 4,
        name: "Narrow Escape",
        gridWidth: 8,
        gridHeight: 10,
        maxMoves: 22,
        characterStart: { x: 4, y: 9 },
        exitPosition: { x: 4, y: 0 },
        blockers: [
            // Left wall
            { type: "stone", x: 1, y: 2 },
            { type: "stone", x: 1, y: 3 },
            { type: "stone", x: 1, y: 4 },
            { type: "stone", x: 2, y: 4 },
            { type: "stone", x: 2, y: 5 },
            { type: "stone", x: 2, y: 6 },
            // Right wall
            { type: "stone", x: 6, y: 2 },
            { type: "stone", x: 6, y: 3 },
            { type: "stone", x: 6, y: 4 },
            { type: "stone", x: 5, y: 4 },
            { type: "stone", x: 5, y: 5 },
            { type: "stone", x: 5, y: 6 }
        ],
        tileTypes: ["red", "blue", "green", "yellow", "purple"]
    },

    // Level 5: Complex challenge
    {
        id: 5,
        name: "The Gauntlet",
        gridWidth: 9,
        gridHeight: 12,
        maxMoves: 30,
        characterStart: { x: 4, y: 11 },
        exitPosition: { x: 4, y: 0 },
        blockers: [
            // Bottom section stones
            { type: "stone", x: 2, y: 10 },
            { type: "stone", x: 6, y: 10 },
            // Middle maze
            { type: "stone", x: 1, y: 7 },
            { type: "stone", x: 2, y: 7 },
            { type: "stone", x: 3, y: 7 },
            { type: "stone", x: 5, y: 7 },
            { type: "stone", x: 6, y: 7 },
            { type: "stone", x: 7, y: 7 },
            // Upper section
            { type: "stone", x: 1, y: 4 },
            { type: "stone", x: 2, y: 4 },
            { type: "stone", x: 6, y: 4 },
            { type: "stone", x: 7, y: 4 },
            { type: "stone", x: 3, y: 2 },
            { type: "stone", x: 5, y: 2 }
        ],
        tileTypes: ["red", "blue", "green", "yellow", "purple"]
    }
];
