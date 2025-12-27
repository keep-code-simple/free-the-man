# Free The Man 🧩

A Candy Crush-style match-3 puzzle game where you help a trapped person escape by clearing a path to the top!

## � Play Now

**[Play Free The Man](https://keep-code-simple.github.io/free-the-man/)** - No download required!

## �🎮 Controls

### 📱 iPhone / iPad (Touch)
| Action | How To |
|--------|--------|
| Select tile | Tap on any colored tile |
| Swap tiles | Tap first tile, then tap adjacent tile |
| Cancel selection | Tap anywhere else or tap the same tile again |
| Restart level | Tap the **↺ Restart** button |
| Get hint | Tap the **💡 Hint** button |

### 🖥️ Desktop Browser (Mouse)
| Action | How To |
|--------|--------|
| Select tile | Click on any colored tile |
| Swap tiles | Click first tile, then click adjacent tile |
| Cancel selection | Click anywhere else or click the same tile again |
| Restart level | Click the **↺ Restart** button |
| Get hint | Click the **💡 Hint** button |

> **Note**: Both touch and mouse inputs work the same way - tap/click to select, then tap/click an adjacent tile to swap!

## 🎯 How to Play

1. **Match Tiles**: Swap adjacent tiles to match 3 or more of the same color
2. **Clear a Path**: Matched tiles disappear, creating space for the character to move up
3. **Reach the Exit**: Guide the trapped person (🧍) to the EXIT at the top
4. **Watch Your Moves**: You have limited moves per level!

## 🚀 Quick Start

```bash
# Navigate to game directory
cd free-the-man

# Start a local server
python3 -m http.server 8080

# Open in browser
# http://localhost:8080
```

## 🎯 Game Features

- **5 Levels** with increasing difficulty
- **Match-3 Mechanics** with cascade chain reactions
- **Special Tiles**:
  - 4-match → Line clear power-up
  - 5-match → Bomb power-up (3x3 area)
- **Blockers**: Stone tiles that block the path
- **Hint System**: Click the 💡 button when stuck
- **Smooth Animations** for all game actions

## 📁 Project Structure

```
free-the-man/
├── index.html              # Main HTML
├── css/styles.css          # All styling
├── js/
│   ├── config.js           # Game constants
│   ├── main.js             # Game controller
│   ├── entities/
│   │   ├── Tile.js         # Tile class
│   │   └── Character.js    # Character class
│   ├── managers/
│   │   ├── GridManager.js      # Grid operations
│   │   ├── MatchResolver.js    # Match detection
│   │   ├── GravitySystem.js    # Tile falling
│   │   ├── CharacterController.js  # Character movement
│   │   └── LevelManager.js     # Level loading
│   └── utils/
│       └── AnimationManager.js  # Animation helpers
└── levels/
    └── levels.json         # Level definitions
```

## 🛠️ Creating New Levels

Edit `levels/levels.json` or modify `DEFAULT_LEVELS` in `LevelManager.js`:

```json
{
  "id": 6,
  "name": "Custom Level",
  "gridWidth": 8,
  "gridHeight": 10,
  "maxMoves": 20,
  "characterStart": { "x": 4, "y": 9 },
  "exitPosition": { "x": 4, "y": 0 },
  "blockers": [
    { "type": "stone", "x": 2, "y": 4 }
  ],
  "tileTypes": ["red", "blue", "green", "yellow", "purple"]
}
```

### Level Properties

| Property | Description |
|----------|-------------|
| `gridWidth` | Number of columns (5-10 recommended) |
| `gridHeight` | Number of rows (8-12 recommended) |
| `maxMoves` | Maximum swaps allowed |
| `characterStart` | Starting position {x, y} |
| `exitPosition` | Exit position (usually y=0) |
| `blockers` | Array of blocker tiles |
| `tileTypes` | Colors to include in level |

### Blocker Types

- `stone` - Permanent blocker, cannot be cleared
- `ice` - Requires 2 matches to break (use `iceLayer: 2`)
- `locked` - Unlocked when adjacent tile is matched

## 🎨 Adding New Tile Types

1. Add type to `CONFIG.MATCHABLE_COLORS` in `config.js`
2. Add CSS styling in `styles.css`:

```css
.tile.pink {
    background: linear-gradient(135deg, #ff6b9d, #ff4081);
    box-shadow: 0 4px 0 #d81b60;
}
.tile.pink::after { content: '💗'; font-size: 1.2rem; }
```

## ⚙️ Adjusting Difficulty

Modify in `config.js`:

```javascript
const CONFIG = {
    MATCH: {
        MIN_MATCH: 3,        // Change to 2 for easier
        LINE_CLEAR_COUNT: 4,
        BOMB_COUNT: 5
    },
    ANIMATION: {
        SWAP: 200,           // Faster = harder
        CASCADE_DELAY: 100
    }
};
```

## 📱 Responsive Design

The game adapts to screen size:
- Desktop: 48px tiles
- Tablet: 40px tiles  
- Mobile: 35px tiles

## 🎵 Future Enhancements

- [ ] Sound effects
- [ ] Multiple trapped characters
- [ ] Timed mode
- [ ] Leaderboard
- [ ] More special power-ups

---

Made with ❤️ and JavaScript