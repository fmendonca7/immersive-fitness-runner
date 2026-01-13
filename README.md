# 🏃 Immersive Fitness Runner

An immersive 3D endless runner game designed for fitness and exercise, featuring first-person perspective, dynamic scenarios, and full-body movement controls.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Three.js](https://img.shields.io/badge/Three.js-0.160.0-green)
![Vite](https://img.shields.io/badge/Vite-5.0.0-purple)

## 🎯 Overview

Immersive Fitness Runner is a browser-based fitness game that combines 3D graphics with physical exercise. Players navigate through beautiful scenarios by performing real-world actions (jumping, ducking, sidestepping) in response to on-screen obstacles. Perfect for TV-based workouts, streaming fitness content, or interactive exercise sessions.

## ✨ Features

### 🎮 Core Gameplay
- **4 Workout Phases**: Warm Up → Cardio → Endurance → Power
- **Multiple Actions**:
  - 🦘 **JUMP** - Leap over barriers
  - ⬇️ **DUCK** - Crouch under obstacles  
  - ↔️ **LEFT/RIGHT** - Sidestep blockers
- **Progressive Difficulty**: Actions unlock gradually across phases
- **Customizable Duration**: 1, 2, 4, 5, or 10 minutes per phase

### 🌍 Visual Experience
- **11 Unique Scenarios**:
  - 🏙️ City Run
  - 🏢 Rooftop Chase
  - ❄️ Winter Wonderland
  - 🏖️ Beach Paradise
  - 🚇 Industrial Tunnel
  - 🌃 Neon Cyberpunk
  - 🌴 Jungle Trek
  - 🚀 Space Station
  - 🌅 Sunset Highway
  - 💎 Crystal Cave
  - 🔬 TEST (Debug)

- **Dynamic Environments**: Each scenario features unique decorations, lighting, and atmosphere
- **Realistic Obstacles**: 
  - Industrial barriers (JUMP)
  - Metallic pipes (DUCK)
  - Tech blocks (SIDE)

### 📊 Tracking & Feedback
- **Real-time Stats**: Time, calories, action counts
- **Visual Indicators**: Large, clear action prompts
- **Motivational Phrases**: 100+ randomized encouragement messages
- **Progress Display**: Phase progress bar with markers
- **YouTube-Style End Screen**: Stats summary with subscriber CTAs

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- Modern web browser (Chrome, Firefox, Edge)

### Installation

```bash
# Clone the repository
git clone https://github.com/fmendonca7/immersive-fitness-runner.git
cd immersive-fitness-runner

# Install dependencies
npm install

# Start development server
npm run dev
```

The game will be available at `http://localhost:5173` (or next available port).

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## 🎮 How to Play

### Setup
1. Open the game in your browser
2. Select workout duration (1-10 minutes per phase)
3. Choose action mode:
   - **Progressive**: Starts simple, adds complexity
   - **All Actions**: Full challenge from the start
   - **Custom**: Pick actions for each level
4. Select a scenario (or random)
5. Click "INICIAR TREINO"

### Controls

#### Keyboard
- `W` / `↑` / `Space` - Jump
- `S` / `↓` - Duck
- `A` / `←` - Move Left
- `D` / `→` - Move Right
- `ESC` - Pause

#### Physical Movements (Recommended!)
Watch the on-screen indicators and perform the actions:
- See "JUMP!" → Jump in place
- See "DUCK!" → Crouch/squat
- See "LEFT!" or "RIGHT!" → Step sideways

## 📁 Project Structure

```
immersive-fitness-runner/
├── index.html              # Main HTML entry point
├── package.json            # Dependencies and scripts
├── vite.config.js          # Vite configuration
├── src/
│   ├── main.js            # Application entry point
│   ├── game/              # Core game logic
│   │   ├── Game.js        # Main game controller
│   │   ├── Player.js      # Player character
│   │   ├── Track.js       # Running track/ground
│   │   ├── Obstacle.js    # Obstacle system
│   │   └── ScoreManager.js # Stats tracking
│   ├── scenarios/         # Environment scenarios
│   │   └── ScenarioManager.js
│   ├── themes/            # Visual themes per phase
│   │   ├── ThemeManager.js
│   │   ├── UrbanTheme.js
│   │   ├── WinterTheme.js
│   │   └── NightTheme.js
│   ├── ui/                # User interface
│   │   ├── HUD.js         # Heads-up display
│   │   └── Indicator.js   # Action indicators
│   └── styles/
│       └── main.css       # Global styles
```

## 🏗️ Architecture

### Component Overview

#### Game.js
The central controller that orchestrates all game systems:
- Initializes Three.js scene, camera, renderer
- Manages game state and phases
- Coordinates player, obstacles, themes, scenarios
- Handles input events
- Controls game flow (start, pause, transitions)

#### ObstacleManager (Obstacle.js)
Manages obstacle lifecycle and spawning:
- **Pool System**: Reuses 10 obstacle objects for performance
- **Spawn Logic**: Controlled intervals and randomization
- **Three Types**: JUMP, DUCK, SIDE with distinct visuals
- **Debug Logging**: Extensive console output for troubleshooting

#### Player.js
Player character controller:
- Position management
- Action animations (jump, duck, sidestep)
- Collision detection
- Camera attachment

#### ScenarioManager
Handles environmental visuals:
- 11 different scenarios with unique atmosphere
- Dynamic decorations (buildings, trees, stars, etc.)
- Fog and lighting configuration
- Wall system for enclosed scenarios

#### ThemeManager
Controls phase-based visual progression:
- 4 phases with distinct themes
- Smooth color transitions
- Configurable phase duration
- Timer and progress tracking

#### HUD & Indicator
User interface components:
- Real-time stat display
- Large action indicators with SVG icons
- Phase progress visualization
- Motivational phrase animations

### Data Flow

```
User Input → Game.js → Player.js → ObstacleManager → Collision Check
                  ↓
            ScenarioManager → Visual Updates
                  ↓
            ThemeManager → Color Transitions
                  ↓
            HUD/Indicator → UI Updates
```

## 🎨 Obstacle Design

### JUMP Obstacles
**Theme**: Industrial Safety Barrier
- Orange body with hazard yellow stripe
- Black diagonal markings
- Support posts on sides
- Material: MeshStandardMaterial with emissive glow

### DUCK Obstacles
**Theme**: Construction Scaffolding
- Metallic gray cylinder (pipe)
- Green LED warning strip underneath
- Metal support brackets
- Material: High metalness for realistic metal look

### SIDE Obstacles
**Theme**: Futuristic Digital Barrier
- Cyan/blue core block
- Glowing neon edge frames
- White directional arrows
- Material: Cyan with subtle emissive

## 🔧 Configuration

### Spawn Settings (Obstacle.js)
```javascript
minSpawnInterval: 20  // Units between spawns
spawnChance: 0.8      // 80% chance when interval met
spawnDistance: -50    // Z position for new obstacles
despawnDistance: 10   // Z position to remove obstacles
```

### Phase Settings (Game.js)
```javascript
phaseDurationMinutes: 4  // Default 4 minutes per phase
levelActions: {
    1: ['jump'],                    // Phase 1
    2: ['jump', 'side'],           // Phase 2
    3: ['jump', 'side', 'duck'],   // Phase 3
    4: ['jump', 'side', 'duck']    // Phase 4
}
```

## 🐛 Debugging

### TEST Scenario
Use the TEST (Debug) scenario for development:
- Minimal decorations (best performance)
- Simple colored obstacles
- Extended fog distance
- Clear visibility

### Console Logging
The ObstacleManager includes extensive logging:
```
🚀 [ObstacleManager] Construtor chamado
📦 [Pool] JUMP obstacle 0 criado
🎯 [Spawn] Tipo selecionado: jump
✅ [Spawn] Obstáculo jump spawnado em z=-50
```

Enable/view these via browser developer tools (F12 → Console).

## 🎯 Use Cases

### Fitness Streaming
- Stream to YouTube/Twitch for group workouts
- Built-in CTA screen for subscriber engagement
- Customizable workout duration

### Personal Training
- TV-based home workouts
- Progressive difficulty for beginners
- Calorie tracking

### Physical Therapy
- Low-impact movement practice
- Customizable action selection
- Visual feedback for timing

### Gaming Cafes
- Interactive fitness gaming
- Multiplayer potential (future feature)
- Engaging visuals on large screens

## 🚧 Future Enhancements

- [ ] Multiplayer mode
- [ ] Custom soundtrack integration
- [ ] Achievement system
- [ ] Leaderboards
- [ ] Mobile device support (touch controls)
- [ ] VR headset compatibility
- [ ] More scenarios (desert, volcano, underwater)
- [ ] Combo system for advanced players
- [ ] Workout session replay

## 📄 License

This project is open source and available under the MIT License.

## 👤 Author

**Fabio Mendonca**
- GitHub: [@fmendonca7](https://github.com/fmendonca7)

## 🙏 Acknowledgments

- Built with [Three.js](https://threejs.org/) for 3D graphics
- Powered by [Vite](https://vitejs.dev/) for fast development
- Inspired by fitness gaming and endless runner genres

---

**Ready to get fit? Start running! 🏃‍♂️💨**
