# Development Guide

## Getting Started

### Prerequisites Installation

#### macOS
```bash
# Install Homebrew (if not installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js
brew install node

# Verify installation
node --version  # Should be 16+
npm --version
```

#### Windows
```bash
# Download and install from nodejs.org
# Or use nvm-windows

# Verify installation
node --version
npm --version
```

#### Linux (Ubuntu/Debian)
```bash
# Install Node.js via NodeSource
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify
node --version
npm --version
```

### Project Setup

```bash
# Clone repository
git clone https://github.com/fmendonca7/immersive-fitness-runner.git
cd immersive-fitness-runner

# Install dependencies
npm install

# Start development server
npm run dev
```

Development server will run at `http://localhost:5173` with hot-reload enabled.

## Development Workflow

### File Structure Convention

```
src/
├── game/           # Core game logic (no UI)
├── scenarios/      # Environment definitions
├── themes/         # Visual theme systems
├── ui/            # UI components (no game logic)
└── styles/        # CSS only
```

**Rule**: Keep game logic separate from UI logic.

### Code Style Guide

#### Naming Conventions
- **Classes**: PascalCase (`ObstacleManager`, `ThemeManager`)
- **Methods**: camelCase (`createObstacle`, `updatePosition`)
- **Constants**: UPPER_SNAKE_CASE (`OBSTACLE_TYPE`, `MAX_SPEED`)
- **Private properties**: Prefix with `_` (`_internalState`)

#### File Organization
```javascript
/**
 * Brief file description
 */

// Imports
import * as THREE from 'three';

// Constants
const SPAWN_INTERVAL = 20;

// Exports
export const ObstacleType = { ... };

// Class definition
export class ObstacleManager {
    constructor() { ... }
    
    // Public methods
    update() { ... }
    
    // Private methods
    _spawnInternal() { ... }
}
```

#### Code Comments
```javascript
// Good: Explain WHY, not WHAT
// Using pool pattern to avoid GC pressure during gameplay
this.obstacles = this.createObstaclePool();

// Bad: Redundant
// Create obstacle pool
this.obstacles = this.createObstaclePool();
```

### Debugging Techniques

#### Console Logging
```javascript
// Already implemented in ObstacleManager
console.log('🚀 [ObstacleManager] Construtor chamado');
console.log('✅ [Spawn] Obstáculo jump spawnado em z=-50');
```

**Emoji Convention:**
- 🚀 Initialization
- 📦 Object creation
- 🎯 Selection/decision
- ✅ Success
- ⚠️ Warning
- 🗑️ Cleanup/deletion
- 🎲 Random/chance

#### Three.js Inspector
```javascript
// Add to window for debugging
window.game = game;
window.THREE = THREE;

// Inspect in console
window.game.scene.children
window.game.obstacleManager.activeObstacles
```

#### Visual Debugging
```javascript
// Add helper at obstacle position
const helper = new THREE.AxesHelper(5);
obstacle.add(helper);

// Show bounding boxes
const boxHelper = new THREE.BoxHelper(obstacle, 0xff0000);
scene.add(boxHelper);
```

### Testing

#### Manual Testing Checklist
- [ ] Obstacles spawn correctly
- [ ] All three obstacle types appear
- [ ] Indicators show at correct distance
- [ ] Player actions work (jump, duck, side)
- [ ] Phase transitions work
- [ ] All scenarios load
- [ ] Stats track correctly
- [ ] End screen displays
- [ ] No console errors

#### Performance Testing
```javascript
// Add FPS counter
let lastTime = performance.now();
let frames = 0;

function checkFPS() {
    frames++;
    const currentTime = performance.now();
    if (currentTime >= lastTime + 1000) {
        console.log(`FPS: ${frames}`);
        frames = 0;
        lastTime = currentTime;
    }
    requestAnimationFrame(checkFPS);
}
checkFPS();
```

**Target**: 60 FPS on mid-range hardware

#### Browser Testing
Test on:
- Chrome/Edge (Chromium)
- Firefox
- Safari (if on macOS)

Use different window sizes to test responsive UI.

### Common Development Tasks

#### Adding a New Obstacle Type

1. **Define Type**
```javascript
// In Obstacle.js
export const ObstacleType = {
    JUMP: 'jump',
    DUCK: 'duck',
    SIDE: 'side',
    SLIDE: 'slide'  // New type
};
```

2. **Create Constructor**
```javascript
createSlideObstacle() {
    const group = new THREE.Group();
    // ... create geometry
    group.userData = {
        type: ObstacleType.SLIDE,
        active: false,
        mainMesh: mainMesh
    };
    this.scene.add(group);
    return group;
}
```

3. **Update Pool**
```javascript
createObstaclePool() {
    for (let i = 0; i < 3; i++) {
        this.obstacles.push(this.createSlideObstacle());
    }
}
```

4. **Add to Allowed Types**
```javascript
setAllowedTypes(actions) {
    if (actions.includes('slide')) {
        this.allowedTypes.push(ObstacleType.SLIDE);
    }
}
```

5. **Create Indicator**
```javascript
// In Indicator.js
this.icons = {
    slide: `<svg>...</svg>`
};

// In main.css
.action-indicator.slide {
    color: #ff00ff;
}
```

#### Modifying Spawn Rate

```javascript
// In Obstacle.js constructor
this.minSpawnInterval = 15;  // Faster (was 20)
this.spawnChance = 0.9;      // More frequent (was 0.8)
```

Test by watching console output for spawn frequency.

#### Creating New Scenario

1. **Define Scenario**
```javascript
// In ScenarioManager.js
export const SCENARIOS = {
    DESERT: {
        id: 'desert',
        name: 'Desert Run',
        description: 'Running through sand dunes',
        hasWalls: false,
        colors: {
            sky: 0xFFDB58,
            fog: 0xF4E4C1,
            ground: 0xE3C565,
            track: 0xDEB887,
            trackLine: 0x8B7355,
            obstacle: 0xA0522D
        },
        fogNear: 120,
        fogFar: 400
    }
};
```

2. **Create Decorations**
```javascript
createDesertDecorations(scenario) {
    // Add cacti, rocks, etc.
    for (let i = 0; i < 30; i++) {
        const cactus = this.createCylinder(0.5, 3, 0x228B22);
        cactus.position.set(
            (i % 2 === 0 ? -1 : 1) * (10 + Math.random() * 5),
            1.5,
            -i * 25
        );
        this.addDecoration(cactus);
    }
}
```

3. **Register**
```javascript
createDecorations(scenario) {
    const id = scenario.id;
    if (id === 'desert') this.createDesertDecorations(scenario);
    // ... other scenarios
}
```

4. **Add to Menu**
```html
<!-- In index.html -->
<button class="scenario-btn" data-scenario="desert">
    <span class="scenario-icon">🌵</span>
    <span class="scenario-name">Desert</span>
</button>
```

#### Adjusting Player Speed

```javascript
// In Game.js
this.baseSpeed = 0.40;  // Faster (was 0.30)
this.maxSpeed = 0.60;   // Higher cap
```

Player doesn't actually move; the world moves toward them.

### Build and Deployment

#### Production Build
```bash
npm run build
```

Output goes to `dist/` directory.

#### Deployment Options

**GitHub Pages:**
```bash
# Build
npm run build

# Deploy (add to package.json scripts)
npm install --save-dev gh-pages
# Add script: "deploy": "gh-pages -d dist"
npm run deploy
```

**Netlify:**
1. Connect GitHub repository
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Deploy automatically on push

**Vercel:**
```bash
npm install -g vercel
vercel --prod
```

#### Environment Variables
Currently not used. If needed:
```javascript
// vite.config.js
export default {
    define: {
        __APP_VERSION__: JSON.stringify(process.env.npm_package_version)
    }
}
```

### Performance Optimization

#### Reducing Draw Calls
```javascript
// Merge geometries (advanced)
import { BufferGeometryUtils } from 'three/examples/jsm/utils/BufferGeometryUtils';

const geometries = [];
decorations.forEach(d => geometries.push(d.geometry));
const merged = BufferGeometryUtils.mergeBufferGeometries(geometries);
```

#### Optimizing Materials
```javascript
// Share materials across objects
const sharedMaterial = new THREE.MeshStandardMaterial({...});
obstacles.forEach(o => o.material = sharedMaterial);
```

#### Reducing Shadow Map Size
```javascript
// In Game.js setupThreeJS()
directionalLight.shadow.mapSize.width = 1024;  // Lower (was 2048)
directionalLight.shadow.mapSize.height = 1024;
```

### Git Workflow

#### Branching Strategy
```bash
# Feature branch
git checkout -b feature/new-obstacle-type
# ... make changes
git commit -m "feat: add slide obstacle type"
git push origin feature/new-obstacle-type
# Create PR on GitHub

# Bug fix
git checkout -b fix/spawn-timing
git commit -m "fix: correct obstacle spawn interval"
```

#### Commit Messages
Follow conventional commits:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `style:` Code style (formatting)
- `refactor:` Code refactoring
- `perf:` Performance improvement
- `test:` Adding tests
- `chore:` Maintenance

Example:
```
feat: add dynamic difficulty scaling

- Increase spawn rate over time
- Add combo multiplier for consecutive successes
- Update HUD to show difficulty level
```

### Troubleshooting

#### Obstacles Not Appearing
1. Check console for spawn logs
2. Verify `allowedTypes` is not empty
3. Check obstacle pool creation
4. Verify visibility flag
5. Check Z position in scene

#### Performance Issues
1. Check FPS (should be 60)
2. Reduce shadow map size
3. Decrease decoration count
4. Simplify obstacle geometry
5. Lower fog distance

#### Collision Not Working
1. Verify hitbox coordinates
2. Check player position
3. Log collision detection calls
4. Verify obstacle active state

#### UI Not Updating
1. Check if elements exist in DOM
2. Verify IDs match
3. Check CSS display/visibility
4. Confirm update() is called

### Resources

- [Three.js Documentation](https://threejs.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [WebGL Fundamentals](https://webglfundamentals.org/)
- [Game Programming Patterns](https://gameprogrammingpatterns.com/)

### Getting Help

1. Check console for errors
2. Enable verbose logging
3. Use TEST scenario for isolation
4. Check GitHub Issues
5. Review ARCHITECTURE.md for system design
