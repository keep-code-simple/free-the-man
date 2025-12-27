/**
 * Game Configuration Constants
 * Central location for all game settings and constants
 */

const CONFIG = {
    // Grid Settings
    GRID: {
        DEFAULT_WIDTH: 7,
        DEFAULT_HEIGHT: 8,
        TILE_SIZE: 48,
        GAP: 4
    },
    
    // Tile Types
    TILE_TYPES: {
        EMPTY: 'empty',
        RED: 'red',
        BLUE: 'blue',
        GREEN: 'green',
        YELLOW: 'yellow',
        PURPLE: 'purple',
        STONE: 'stone',
        ICE: 'ice',
        LOCKED: 'locked',
        EXIT: 'exit',
        CHARACTER: 'character'
    },
    
    // Matchable tile colors (regular tiles only)
    MATCHABLE_COLORS: ['red', 'blue', 'green', 'yellow', 'purple'],
    
    // Special tile types created from matches
    SPECIAL_TILES: {
        LINE_H: 'line-h',     // 4-match horizontal - clears row
        LINE_V: 'line-v',     // 4-match vertical - clears column
        BOMB: 'bomb'          // 5+ match - clears 3x3 area
    },
    
    // Matching Rules
    MATCH: {
        MIN_MATCH: 3,          // Minimum tiles for a match
        LINE_CLEAR_COUNT: 4,   // Tiles needed for line clear
        BOMB_COUNT: 5          // Tiles needed for bomb
    },
    
    // Animation Durations (ms)
    ANIMATION: {
        SWAP: 200,
        MATCH: 300,
        FALL: 200,
        SPAWN: 300,
        CHARACTER_MOVE: 400,
        CASCADE_DELAY: 100
    },
    
    // Game State
    STATE: {
        IDLE: 'idle',
        SWAPPING: 'swapping',
        MATCHING: 'matching',
        FALLING: 'falling',
        CHARACTER_MOVING: 'character_moving',
        WIN: 'win',
        LOSE: 'lose'
    },
    
    // Directions for matching and adjacency
    DIRECTIONS: {
        UP: { x: 0, y: -1 },
        DOWN: { x: 0, y: 1 },
        LEFT: { x: -1, y: 0 },
        RIGHT: { x: 1, y: 0 }
    },
    
    // Audio (optional - for future use)
    AUDIO: {
        ENABLED: false,
        VOLUME: 0.5
    }
};

// Freeze config to prevent accidental modifications
Object.freeze(CONFIG);
Object.freeze(CONFIG.GRID);
Object.freeze(CONFIG.TILE_TYPES);
Object.freeze(CONFIG.SPECIAL_TILES);
Object.freeze(CONFIG.MATCH);
Object.freeze(CONFIG.ANIMATION);
Object.freeze(CONFIG.STATE);
Object.freeze(CONFIG.DIRECTIONS);
Object.freeze(CONFIG.AUDIO);
