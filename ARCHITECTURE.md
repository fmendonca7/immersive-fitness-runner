# Architecture Documentation

## System Overview

Immersive Fitness Runner is built using a modular architecture with clear separation of concerns. The application uses Three.js for 3D rendering and follows an entity-component pattern for game objects.

## Core Systems

### 1. Game Controller (`Game.js`)

**Responsibilities:**
- Initialize and manage Three.js scene
- Coordinate all subsystems
- Handle game state transitions
- Process user input
- Control game loop

**Key Methods:**
- `init()`: Setup Three.js and components
- `startWithIntro()`: Begin workout session
- `animate()`: Main game loop (60 FPS)
- `onPhaseComplete()`: Handle phase transitions
- `updateLevelActions()`: Configure allowed actions per level

**State Management:**
```javascript
{
    isRunning: boolean,
    isPaused: boolean,
    phaseDurationMinutes: number,
    actionMode: 'progressive' | 'all' | 'custom',
    scenarioMode: 'random' | 'specific',
    selectedScenario: string | null
}
```

### 2. Obstacle System (`Obstacle.js`)

**Design Pattern:** Object Pool

**Components:**
- `ObstacleManager`: Manages obstacle lifecycle
- `ObstacleType`: Enum for obstacle types
- Three obstacle constructors for each type

**Lifecycle:**
1. Pool Creation: Pre-instantiate 10 obstacles
2. Activation: Mark as active, position, make visible
3. Movement: Update position each frame
4. Deactivation: Hide, mark inactive, return to pool
5. Reuse: Activate again when needed

**Spawn Algorithm:**
```javascript
distanceTraveled += speed;
if (distanceTraveled >= minSpawnInterval) {
    if (Math.random() < spawnChance) {
        spawnObstacle();
    }
    distanceTraveled = 0;
}
```

### 3. Player System (`Player.js`)

**Capabilities:**
- Position: (0, 1.6, 0) - first-person height
- Actions: jump, duck, moveLeft, moveRight
- Lanes: 3 positions (left: -2, center: 0, right: 2)

**Action State Machine:**
```
Idle → Jump → Jumping → Landing → Idle
Idle → Duck → Ducking → Standing → Idle
Idle → Move Left/Right → Moving → Return → Idle
```

**Timing:**
- Jump duration: ~0.5-0.8s
- Duck duration: Variable (hold key)
- Sidestep duration: ~0.3-0.5s

### 4. Scenario System (`ScenarioManager.js`)

**Architecture:**
- Scenario definitions (11 scenarios)
- Decoration generators per scenario
- Dynamic decoration pool (reused as track scrolls)

**Scenario Structure:**
```javascript
{
    id: string,
    name: string,
    description: string,
    hasWalls: boolean,
    colors: {
        sky: hex,
        fog: hex,
        ground: hex,
        track: hex,
        trackLine: hex,
        obstacle: hex
    },
    fogNear: number,
    fogFar: number
}
```

**Performance Optimization:**
- Decorations loop via position offset
- Pool reuse prevents memory allocation
- Culling via fog distance

### 5. Theme System (`ThemeManager.js`)

**Phases:**
1. Warm Up (Phase 1)
2. Cardio (Phase 2)
3. Endurance (Phase 3)
4. Power (Phase 4)

**Theme Components:**
- Background colors
- Lighting adjustments
- UI color schemes
- Transition animations

**Timer System:**
```javascript
phaseTime += delta;
progress = phaseTime / phaseDuration;
if (progress >= 1.0) {
    onPhaseComplete();
}
```

### 6. UI System

#### HUD (`HUD.js`)
Updates DOM elements with game state:
- Time display
- Calorie counter
- Phase progress
- Phase name

#### Indicator (`Indicator.js`)
Shows action prompts:
- SVG icon generation
- Text display
- Color coding per action type
- Show/hide logic based on obstacle proximity

**Indicator Timing:**
```javascript
if (obstacle.position.z > -45 && obstacle.position.z < -5) {
    indicator.show(type, lane);
}
```

## Data Flow Diagrams

### Game Initialization
```
main.js
   ↓
Game.constructor()
   ↓
setupThreeJS() → Create scene, camera, renderer
   ↓
setupComponents() → Initialize all subsystems
   ↓
setupEventListeners() → Bind input handlers
   ↓
animate() → Start game loop
```

### Game Loop (60 FPS)
```
animate()
   ↓
Check if running → Exit if paused/stopped
   ↓
getDelta() → Time since last frame
   ↓
Update Components:
   ├─ ScoreManager.addTime(delta)
   ├─ ThemeManager.update(delta)
   ├─ ScenarioManager.update(speed)
   ├─ Player.update(delta)
   ├─ Track.update(speed)
   └─ ObstacleManager.update(delta, speed)
   ↓
Collision Detection
   ↓
Indicator Update
   ↓
HUD.update()
   ↓
renderer.render(scene, camera)
```

### Obstacle Spawn Flow
```
ObstacleManager.update()
   ↓
distanceTraveled >= interval? → No → Continue
   ↓ Yes
Random check (80%) → Fail → Reset distance
   ↓ Pass
Select random type from allowed
   ↓
Find inactive obstacle of that type
   ↓
Activate obstacle:
   ├─ Set position (z = -50)
   ├─ Set visible = true
   ├─ Set active = true
   └─ Add to activeObstacles array
   ↓
Reset distance counter
```

### User Input Flow
```
Keyboard Event
   ↓
Game.onKeyDown(event)
   ↓
Check if running → Exit if not
   ↓
Check allowed actions for current level
   ↓
Map key to action → Not allowed → Exit
   ↓ Allowed
Call Player method:
   ├─ Player.jump()
   ├─ Player.duck()
   ├─ Player.moveLeft()
   └─ Player.moveRight()
   ↓
Update ScoreManager action count
```

## Memory Management

### Object Pooling
- **Obstacles**: 10 pre-allocated (3 JUMP, 3 DUCK, 4 SIDE)
- **Decorations**: Recycled via position reset
- **Materials**: Shared where possible

### Garbage Collection Optimization
- Reuse objects instead of creating new ones
- Clear decorations on scenario change
- Dispose geometries and materials properly

### Performance Considerations
- Target: 60 FPS
- Shadow maps: 2048x2048 (balanced quality)
- Fog culling: Hide distant objects
- LOD: Not implemented (future enhancement)

## Event System

### Custom Events
Currently uses direct method calls. Could be enhanced with:
```javascript
// Future event bus pattern
EventBus.emit('obstacle:spawned', { type, position });
EventBus.on('player:action', handleAction);
```

### DOM Events
- Window resize → Update camera aspect ratio
- Keyboard input → Player actions
- Button clicks → UI navigation

## Extension Points

### Adding New Obstacles
1. Add type to `ObstacleType` enum
2. Create `createXObstacle()` method
3. Update pool creation
4. Add allowed type checks
5. Update indicator SVG and colors

### Adding New Scenarios
1. Define scenario object in `SCENARIOS`
2. Create `createXDecorations()` method
3. Add case to `createDecorations()`
4. Update HTML menu button

### Adding New Actions
1. Extend `Player` with new method
2. Add keyboard mapping in `onKeyDown()`
3. Create indicator icon and text
4. Update collision detection
5. Add to level action configuration

## Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| 3D Graphics | Three.js 0.160 | Scene, rendering, objects |
| Build Tool | Vite 5.0 | Development server, bundling |
| Language | JavaScript ES6+ | Application logic |
| Styling | CSS3 | UI styling, animations |
| Module System | ESM | Import/export |

## Best Practices Implemented

1. **Separation of Concerns**: Each system has single responsibility
2. **Object Pooling**: Reuse objects for performance
3. **State Management**: Centralized in Game.js
4. **Input Abstraction**: Keyboard handling separated from game logic
5. **Debugging Support**: Extensive console logging
6. **Configuration**: Easy-to-modify constants
7. **Code Comments**: Clear documentation of complex logic

## Security Considerations

- **Client-Side Only**: No server communication (no XSS/injection risks)
- **No User Data**: No storage or tracking
- **Safe Dependencies**: Using official Three.js and Vite packages

## Browser Compatibility

- **Required**: ES6+ support, WebGL 1.0+
- **Tested**: Chrome 90+, Firefox 88+, Edge 90+
- **Not Supported**: IE11 (no WebGL 2.0)
