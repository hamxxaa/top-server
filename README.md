# TOP - Multiplayer Game Server 🎮

The authoritative server for the TOP multiplayer game.  Handles physics simulation, game state, room management, and real-time synchronization using Socket.IO and Phaser 3 in headless mode.

## 🎯 Overview

This is the server-side component of a real-time multiplayer top soccer game. It runs Phaser 3 in Node.js (headless mode) to perform authoritative physics calculations, manages game rooms, and broadcasts state updates to connected clients.

## 🚀 Tech Stack

- **[Node.js](https://nodejs.org/)** - Runtime environment
- **[Express 4.19.2](https://expressjs.com/)** - Web server framework
- **[Socket.IO 4.7.5](https://socket.io/)** - Real-time communication
- **[Phaser 3.80.1](https://phaser.io/)** - Game engine (headless mode)
- **[@geckos. io/phaser-on-nodejs](https://www.npmjs.com/package/@geckos.io/phaser-on-nodejs)** - Enables Phaser in Node.js
- **[Matter.js 0.20.0](https://brm.io/matter-js/)** - Physics engine
- **[Nodemon 3.1.0](https://nodemon.io/)** - Auto-restart on changes
- **[CORS 2.8.5](https://www.npmjs.com/package/cors)** - Cross-origin resource sharing

## 📦 Installation

```bash
npm install
```

## 🚀 Running the Server

Start the server with auto-restart on file changes:

```bash
npm start
```

The server will start on **port 3000**. 

## 🏗️ Project Structure

```
├── server.js                    # Main server entry point
└── src/
    ├── main.js                  # Phaser game configuration
    ├── mapcfg.js               # Map/arena configuration
    ├── defaults.js             # Default object properties
    ├── RoomManager.js          # Manages all game rooms
    ├── scenes/
    │   └── Game.js             # Main game scene with physics
    └── classes/
        ├── Room.js             # Individual room management
        ├── Player.js           # Server-side player entity
        ├── Ball.js             # Ball physics and logic
        └── Direk.js            # Goal post objects
```

## 🎮 Key Features

### Room Management
- **Create Rooms**: Players can create custom rooms with configurable settings
- **Join/Leave**: Dynamic player connections and disconnections
- **Room States**: Lobby, playing, full capacity tracking
- **Spectator Support**: Watch ongoing games without joining

### Authoritative Physics
- Server runs Phaser 3 in **HEADLESS** mode (no rendering)
- Full physics simulation using Matter.js
- 60 FPS game loop
- Zero gravity (top-down gameplay)
- Collision detection for: 
  - Ball-to-goal scoring
  - Ball-to-post hits
  - Player interactions

### Real-time Synchronization
- Broadcasts physics updates to all clients
- Delta compression (only changed properties sent)
- Player input validation
- State reconciliation

## 🗺️ Map Configuration

The game arena is defined in `src/mapcfg.js`:

### Objects
- **Ball(s)**: Initial position, radius, density
- **Goal Lines**: Position, angle, size, posts
- **Obstacles**: Rectangles, circles, polygons (static/dynamic)
- **Scores**: Display positions and styles

Example:
```javascript
ball: [{ id: '0', x: 500, y: 300, radius:  10, density: 0.001 }]
goalline: [{ x: 80, y: 250, angle: Math.PI / 6, ...  }]
obstacles: [{ type: 'rectangle', x: 500, y: 500, ...  }]
```

## 🔌 Socket Events

### Received from Clients
- `join room` - Player joins a room
- `create room` - Player creates a new room
- `refresh rooms` - Request updated room list
- `player connected to lobby` - Player enters lobby
- `update stats` - Player stat changes
- `update team` - Team selection
- `start game` - Owner starts the game
- `player ready` - Player ready status
- `game started on client side` - Confirm game loaded
- `spec connected` - Spectator joined

### Sent to Clients
- `rooms` - List of active rooms
- `get lobby` - Initial lobby state
- `update lobby` - Lobby changes
- `draw players` - Initial game state and config
- `update clients` - Physics state (every frame)
- `user disconnected` - Player left
- `pause` - Goal scored, pause game
- `update specs` - Spectator list
- `validate stats` - Confirm stat allocation
- `game started` - Signal game start
- `game already started` - Room in progress (join as spec)
- `room is full` - Cannot join
- `player can connect to lobby` - Join approved

## 🎯 Phaser Configuration

```javascript
{
  width: 2000,
  height: 1100,
  type: Phaser. HEADLESS,  // No rendering
  banner: false,
  audio: false,
  physics: {
    default: 'matter',
    matter: {
      debug: true,
      gravity: { y:  0, x: 0 }  // Top-down
    }
  }
}
```

## 🔧 Development

### Start Development Server
```bash
npm start
```
Nodemon will watch for changes and auto-restart. 

### Manual Start
```bash
node server.js
```

## 🌐 CORS Configuration

The server accepts connections from:
```javascript
origin: 'http://localhost:1234'  // Client dev server
```

Update in `server.js` if your client runs on a different port/domain.

## 🎮 Game Flow

1. **Client connects** → Receives active rooms list
2. **Create/Join Room** → Player enters lobby
3. **Lobby Phase** → Players select teams, adjust stats
4. **Game Start** → Server initializes physics simulation
5. **Game Loop** → Server calculates physics at 60 FPS, broadcasts updates
6. **Goal Detection** → Collision handler updates scores, pauses game
7. **Game End/Disconnect** → Cleanup and reset

## 🏗️ Room Management System

### RoomManager
- Tracks all active rooms
- Generates unique room IDs using Phaser's UUID
- Provides room list for clients
- Routes socket connections to appropriate rooms

### Room Class (assumed structure)
- Player limit enforcement
- Owner privileges
- Lobby state management
- Game scene lifecycle
- Player/spectator lists

## 🐛 Troubleshooting

- **Port 3000 already in use**: Kill the process or change port in `server.js`
- **Clients can't connect**: Check CORS settings match client URL
- **Physics acting strange**: Verify Matter.js object densities and velocities
- **Room not created**: Check Phaser. Math.RND initialization

## 📝 Performance Notes

- Headless mode reduces CPU usage (no rendering)
- Physics updates sent at 60 FPS (can be throttled if needed)
- Delta updates minimize bandwidth usage
- Room isolation prevents cross-room interference

## 🔐 Security Considerations

⚠️ **This is a 2-year-old development project**.  Before production use, consider:
- Input validation and sanitization
- Rate limiting on room creation
- Player authentication
- Cheat detection (client-side prediction validation)
- Maximum player/room limits
- Resource cleanup on disconnect

## 🤝 Related Repository

- **Client**: [hamxxaa/top-client](https://github.com/hamxxaa/top-client)

## 🚀 Quick Start (Both Repos)

```bash
# Terminal 1 - Server
cd top-server
npm install
npm start

# Terminal 2 - Client
cd top-client
npm install
npm start
```

Then open `http://localhost:1234` in your browser! 
