/**
 * Free The Man - Main Game Controller
 * Entry point and game loop
 */

class Game {
    constructor() {
        // DOM Elements
        this.boardElement = document.getElementById('gameBoard');
        this.levelNumberEl = document.getElementById('levelNumber');
        this.movesCountEl = document.getElementById('movesCount');
        this.startModal = document.getElementById('startModal');
        this.winModal = document.getElementById('winModal');
        this.loseModal = document.getElementById('loseModal');

        // Managers
        this.gridManager = null;
        this.matchResolver = null;
        this.gravitySystem = null;
        this.characterController = null;
        this.levelManager = new LevelManager();

        // Game state
        this.isProcessing = false;
        this.characterElement = null;

        // Initialize
        this.init();
    }

    /**
     * Initialize the game
     */
    init() {
        // Load default levels
        this.levelManager.loadLevels(DEFAULT_LEVELS);

        // Set up level manager callbacks
        this.levelManager.onLevelLoaded = (level, num) => this.onLevelLoaded(level, num);
        this.levelManager.onMovesChanged = (remaining, max) => this.onMovesChanged(remaining, max);
        this.levelManager.onWin = (data) => this.onWin(data);
        this.levelManager.onLose = (data) => this.onLose(data);

        // Set up button event listeners
        this.setupEventListeners();
    }

    /**
     * Set up UI event listeners
     */
    setupEventListeners() {
        // Start button
        document.getElementById('startBtn')?.addEventListener('click', () => {
            this.hideModal(this.startModal);
            this.startGame();
        });

        // Restart button
        document.getElementById('restartBtn')?.addEventListener('click', () => {
            this.restartLevel();
        });

        // Hint button
        document.getElementById('hintBtn')?.addEventListener('click', () => {
            this.showHint();
        });

        // Next level button
        document.getElementById('nextLevelBtn')?.addEventListener('click', () => {
            this.hideModal(this.winModal);
            if (this.levelManager.hasMoreLevels()) {
                this.levelManager.nextLevel();
                this.loadCurrentLevel();
            } else {
                // All levels complete
                alert('Congratulations! You\'ve completed all levels!');
                this.levelManager.startLevel(0);
                this.loadCurrentLevel();
            }
        });

        // Retry button
        document.getElementById('retryBtn')?.addEventListener('click', () => {
            this.hideModal(this.loseModal);
            this.restartLevel();
        });
    }

    /**
     * Start the game
     */
    startGame() {
        this.levelManager.startLevel(0);
        this.loadCurrentLevel();
    }

    /**
     * Load and initialize current level
     */
    loadCurrentLevel() {
        const level = this.levelManager.currentLevel;
        if (!level) return;

        // Create managers for this level
        this.gridManager = new GridManager(level.gridWidth, level.gridHeight);
        this.matchResolver = new MatchResolver(this.gridManager);
        this.gravitySystem = new GravitySystem(this.gridManager);
        this.characterController = new CharacterController(this.gridManager);

        // Initialize grid
        this.gridManager.initialize(level);

        // Initialize character
        this.characterController.initialize(
            level.characterStart.x,
            level.characterStart.y,
            level.exitPosition.y
        );

        // Render grid
        this.gridManager.render(this.boardElement);

        // Render character
        this.renderCharacter();

        // Set up swap callback
        this.gridManager.setSwapCallback((x1, y1, x2, y2) => {
            this.handleSwap(x1, y1, x2, y2);
        });

        // Reset processing flag
        this.isProcessing = false;
    }

    /**
     * Render character on the board
     */
    renderCharacter() {
        // Remove existing character element if any
        if (this.characterElement) {
            this.characterElement.remove();
        }

        const pos = this.characterController.getPosition();
        if (!pos) return;

        // Find the tile element at character position and replace it visually
        const tileIndex = pos.y * this.gridManager.width + pos.x;
        const tiles = this.boardElement.querySelectorAll('.tile');
        const tileAtPosition = tiles[tileIndex];

        if (tileAtPosition) {
            tileAtPosition.className = 'tile character';
            this.characterElement = tileAtPosition;
        }
    }

    /**
     * Handle tile swap attempt
     * @param {number} x1 - First tile x
     * @param {number} y1 - First tile y
     * @param {number} x2 - Second tile x
     * @param {number} y2 - Second tile y
     */
    async handleSwap(x1, y1, x2, y2) {
        if (this.isProcessing || this.levelManager.isGameOver()) return;

        this.isProcessing = true;
        this.levelManager.setState(CONFIG.STATE.SWAPPING);

        // Get tile elements before swap
        const tile1El = this.gridManager.getTileElement(x1, y1);
        const tile2El = this.gridManager.getTileElement(x2, y2);

        // Animate swap
        await animationManager.animateSwap(tile1El, tile2El);

        // Perform swap in grid
        this.gridManager.swap(x1, y1, x2, y2);

        // Check for matches
        const hasMatch = this.matchResolver.checkSwapForMatches(x1, y1, x2, y2);

        if (hasMatch) {
            // Use a move
            this.levelManager.useMove();

            // Process matches (cascade loop)
            await this.processCascades();

            // Move character up if possible
            await this.moveCharacter();

            // Check win condition
            if (this.characterController.hasEscaped()) {
                this.levelManager.triggerWin();
            } else if (this.levelManager.getMovesRemaining() <= 0) {
                this.levelManager.triggerLose();
            }
        } else {
            // Invalid swap - swap back
            await animationManager.animateInvalidSwap(tile1El, tile2El);
            this.gridManager.swap(x1, y1, x2, y2);
        }

        // Re-render grid
        this.gridManager.rerender();
        this.renderCharacter();

        // Reattach swap callback
        this.gridManager.setSwapCallback((x1, y1, x2, y2) => {
            this.handleSwap(x1, y1, x2, y2);
        });

        this.levelManager.setState(CONFIG.STATE.IDLE);
        this.isProcessing = false;
    }

    /**
     * Process match cascades
     */
    async processCascades() {
        let hasMatches = true;

        while (hasMatches) {
            this.levelManager.setState(CONFIG.STATE.MATCHING);

            // Find all matches
            const matches = this.matchResolver.findAllMatches();

            if (matches.length === 0) {
                hasMatches = false;
                break;
            }

            // Process matches
            const { clearedPositions, specialTiles } = this.matchResolver.processMatches(matches);

            // Animate match destruction
            const matchedElements = clearedPositions.map(pos =>
                this.gridManager.getTileElement(pos.x, pos.y)
            ).filter(el => el);

            await animationManager.animateMatch(matchedElements);

            // Clear matched tiles
            clearedPositions.forEach(pos => {
                this.gridManager.setEmpty(pos.x, pos.y);
            });

            // Create special tiles
            specialTiles.forEach(special => {
                const tile = new Tile(special.color, special.position.x, special.position.y);
                tile.setSpecial(special.type);
                this.gridManager.setTile(special.position.x, special.position.y, tile);
            });

            // Re-render after matches
            this.gridManager.rerender();
            this.renderCharacter();
            this.gridManager.setSwapCallback((x1, y1, x2, y2) => {
                this.handleSwap(x1, y1, x2, y2);
            });

            // Apply gravity
            this.levelManager.setState(CONFIG.STATE.FALLING);

            const { newTiles } = this.gravitySystem.processGravity();

            // Re-render after gravity
            this.gridManager.rerender();
            this.renderCharacter();
            this.gridManager.setSwapCallback((x1, y1, x2, y2) => {
                this.handleSwap(x1, y1, x2, y2);
            });

            // Animate new tiles
            if (newTiles.length > 0) {
                const newElements = newTiles.map(nt =>
                    this.gridManager.getTileElement(nt.x, nt.y)
                ).filter(el => el);
                await animationManager.animateSpawn(newElements);
            }

            // Small delay before checking for new cascades
            await animationManager.wait(CONFIG.ANIMATION.CASCADE_DELAY);
        }
    }

    /**
     * Move character up if possible
     */
    async moveCharacter() {
        this.levelManager.setState(CONFIG.STATE.CHARACTER_MOVING);

        const movements = this.characterController.moveToHighestEmpty();

        if (movements.length > 0) {
            // Re-render to show new character position
            this.gridManager.rerender();
            this.renderCharacter();
            this.gridManager.setSwapCallback((x1, y1, x2, y2) => {
                this.handleSwap(x1, y1, x2, y2);
            });

            // Animate character movement
            await animationManager.wait(CONFIG.ANIMATION.CHARACTER_MOVE);
        }
    }

    /**
     * Show hint - highlight a valid move
     */
    async showHint() {
        if (this.isProcessing) return;

        const hint = this.gridManager.findHint();

        if (hint) {
            const tile1 = this.gridManager.getTileElement(hint.x1, hint.y1);
            const tile2 = this.gridManager.getTileElement(hint.x2, hint.y2);

            await animationManager.highlightTiles([tile1, tile2].filter(t => t));
        }
    }

    /**
     * Restart current level
     */
    restartLevel() {
        this.levelManager.restartLevel();
        this.loadCurrentLevel();
    }

    /**
     * Callback when level is loaded
     * @param {Object} level - Level configuration
     * @param {number} levelNumber - Level number (1-based)
     */
    onLevelLoaded(level, levelNumber) {
        if (this.levelNumberEl) {
            this.levelNumberEl.textContent = levelNumber;
        }
    }

    /**
     * Callback when moves change
     * @param {number} remaining - Moves remaining
     * @param {number} max - Max moves
     */
    onMovesChanged(remaining, max) {
        if (this.movesCountEl) {
            this.movesCountEl.textContent = remaining;

            // Add warning class when low on moves
            if (remaining <= 5) {
                this.movesCountEl.classList.add('low');
            } else {
                this.movesCountEl.classList.remove('low');
            }
        }
    }

    /**
     * Callback when player wins
     * @param {Object} data - Win data
     */
    onWin(data) {
        const winMovesEl = document.getElementById('winMoves');
        if (winMovesEl) {
            winMovesEl.textContent = data.movesUsed;
        }

        this.showModal(this.winModal);
    }

    /**
     * Callback when player loses
     * @param {Object} data - Lose data
     */
    onLose(data) {
        this.showModal(this.loseModal);
    }

    /**
     * Show a modal
     * @param {HTMLElement} modal - Modal element
     */
    showModal(modal) {
        if (modal) {
            modal.classList.add('active');
        }
    }

    /**
     * Hide a modal
     * @param {HTMLElement} modal - Modal element
     */
    hideModal(modal) {
        if (modal) {
            modal.classList.remove('active');
        }
    }
}

// Start game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.game = new Game();
});
