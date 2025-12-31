
# Solana dApp Scaffold Next

The Solana dApp Scaffold repos are meant to house good starting scaffolds for ecosystem developers to get up and running quickly with a front end client UI that integrates several common features found in dApps with some basic usage examples. Wallet Integration. State management. Components examples. Notifications. Setup recommendations.

Responsive                     |  Desktop
:-------------------------:|:-------------------------:
![](scaffold-mobile.png)  |  ![](scaffold-desktop.png)

## Getting Started

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

The responsive version for wallets and wallet adapter may not function or work as expected for mobile based on plugin and wallet compatibility. For more code examples and implementations please visit the [Solana Cookbook](https://solanacookbook.com/)

## Installation

```bash
npm install
# or
yarn install
```

## Build and Run

Next, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.tsx`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.ts`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

## Features

Each Scaffold will contain at least the following features:

```
Wallet Integration with Auto Connec / Refresh

State Management

Components: One or more components demonstrating state management

Web3 Js: Examples of one or more uses of web3 js including a transaction with a connection provider

Sample navigation and page changing to demonstate state

Clean Simple Styling 

Notifications (optional): Example of using a notification system

```

A Solana Components Repo will be released in the near future to house a common components library.


### Structure

The scaffold project structure may vary based on the front end framework being utilized. The below is an example structure for the Next js Scaffold.
 
```
├── public : publically hosted files
├── src : primary code folders and files 
│   ├── components : should house anything considered a resuable UI component
│   ├── contexts` : any context considered reusable and useuful to many compoennts that can be passed down through a component tree
│   ├── hooks` : any functions that let you 'hook' into react state or lifecycle features from function components
│   ├── models` : any data structure that may be reused throughout the project
│   ├── pages` : the pages that host meta data and the intended `View` for the page
│   ├── stores` : stores used in state management
│   ├── styles` : contain any global and reusable styles
│   ├── utils` : any other functionality considered reusable code that can be referenced
│   ├── views` : contains the actual views of the project that include the main content and components within
style, package, configuration, and other project files

```

## Contributing

Anyone is welcome to create an issue to build, discuss or request a new feature or update to the existing code base. Please keep in mind the following when submitting an issue. We consider merging high value features that may be utilized by the majority of scaffold users. If this is not a common feature or fix, consider adding it to the component library or cookbook. Please refer to the project's architecture and style when contributing. 

If submitting a feature, please reference the project structure shown above and try to follow the overall architecture and style presented in the existing scaffold.

### Committing

To choose a task or make your own, do the following:

1. [Add an issue](https://github.com/solana-dev-adv/solana-dapp-next/issues/new) for the task and assign it to yourself or comment on the issue
2. Make a draft PR referencing the issue.

The general flow for making a contribution:

1. Fork the repo on GitHub
2. Clone the project to your own machine
3. Commit changes to your own branch
4. Push your work back up to your fork
5. Submit a Pull request so that we can review your changes

**NOTE**: Be sure to merge the latest from "upstream" before making a 
pull request!

You can find tasks on the [project board](https://github.com/solana-dev-adv/solana-dapp-next/projects/1) 
or create an issue and assign it to yourself.


## Learn More Next Js

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.


## Game Development

This project includes an arcade-style mini game integrated directly into the home view. This section documents the architecture, components, implementation approach, technical specifications, dependencies, and setup instructions to help developers extend or modify the game functionality.

### 1. Game Architecture Overview

- Client-side, single-component game loop using requestAnimationFrame for smooth updates
- State architecture combines React state for UI reactivity with mutable refs for high-frequency game logic updates
- Layered UI rendering using Tailwind CSS:
  - Background effects layer
  - Game layer (interactive items and particles)
  - HUD overlay (score, lives, status indicators)
  - Modal overlays (Start screen and Game Over)
- Event-driven input handling via onMouseDown and onTouchStart for tap interactions
- Deterministic spawn logic with difficulty scaling based on score and active effects (combo, fever, freeze, double points)

### 2. Key Development Components

- Views and game container:
  - `src/views/home/index.tsx` contains the HomeView and the game component
- Context providers for network and wallet:
  - `src/contexts/ContextProvider.tsx` integrates wallet connection and providers
  - `src/contexts/AutoConnectProvider.tsx` manages auto-connect behavior
  - `src/contexts/NetworkConfigurationProvider.tsx` manages network selection
- UI and state helpers:
  - `src/stores/useUserSOLBalanceStore.tsx` for SOL balance (home HUD section)
  - `src/components/RequestAirdrop.tsx` for quick devnet airdrops

### 3. Implementation Approach

- Game loop and rendering use requestAnimationFrame with a mutable ref holding the authoritative game state (score, items, timers, effects)
- React state is used strategically to trigger visual updates (items list, particles, combo progress, HUD indicators)
- Item lifecycle:
  1. Spawn at a varying rate influenced by score and active effects
  2. Physics update each frame (gravity scaled by freeze/fever/difficulty)
  3. Cleanup when off-screen or consumed by user interaction
  4. HUD and overlay updates based on current game state
- Input handling removes items and applies scoring, combos, and power-ups immediately to the ref state, then syncs with React state for rendering

Example skeleton of the core loop and entities:

```ts
// Entity types
type Item = {
  id: number;
  x: number; // percentage position
  y: number; // percentage position
  type: 'GEM' | 'BOMB' | 'POWERUP' | 'BOSS';
  emoji: string;
  scale: number;
  power?: 'FREEZE' | 'SHIELD' | 'DOUBLE';
};

// Core loop (simplified)
function gameLoop() {
  if (!stateRef.current.gameActive) return;
  const now = Date.now();
  const ref = stateRef.current;

  // 1) Spawn
  const spawnInterval = Math.max(300, SPAWN_RATE - ref.score / 2);
  if (now - ref.lastSpawn > spawnInterval) {
    spawnItem(ref);
    ref.lastSpawn = now;
  }

  // 2) Physics
  applyPhysics(ref);

  // 3) Cleanup
  ref.items = ref.items.filter((i) => i.y < 110);
  ref.particles = ref.particles.filter((p) => p.life > 0);

  // 4) Render sync
  setItems([...ref.items]);
  setParticles([...ref.particles]);

  requestRef.current = requestAnimationFrame(gameLoop);
}
```

### 4. Technical Specifications

- Frameworks and language: Next.js 13, React 18, TypeScript
- Styling: Tailwind CSS with utility-first classes; DaisyUI components for some UI elements
- Rendering container: responsive 9:16 aspect ratio game board with layered effects
- Timing and effects:
  - Spawn rate baseline: 800 ms (reduces with score), freeze increases interval
  - Physics gravity baseline: 0.5 (scaled by difficulty and effects)
  - Combo window: 600 ms; Fever threshold: 10 taps; Fever duration: 8 s
  - Power-ups: Freeze (slows spawns/physics), Shield (negates bomb), Double (score multiplier)
  - Particles: short-lived celebratory effects for feedback
- Input handling: tap via mouse/touch events, immediate item removal and scoring
- Overlays: START and GAMEOVER screens with prominent call-to-action buttons

### 5. Required Dependencies

The game relies on standard frontend dependencies already present in this project. Key packages:

- Runtime:
  - next, react, react-dom
  - tailwindcss, daisyui
- TypeScript and tooling:
  - typescript, postcss, autoprefixer
- Optional (scaffold context and wallet UI):
  - @solana/wallet-adapter-react, @solana/wallet-adapter-react-ui, @solana/web3.js

These are declared in `package.json` and installed via `npm install` or `yarn install`.

### 6. Setup Instructions for Developers

- Install dependencies:

```bash
npm install
# or
yarn install
```

- Run the development server and open the app:

```bash
npm run dev
# or
yarn dev
```

Navigate to http://localhost:3000 and open the Home view to play and test the game.

- Modify gameplay parameters:
  - Edit constants (SPAWN_RATE, GRAVITY, FEVER_DURATION, etc.) and type pools in `src/views/home/index.tsx`
  - Add new item types by extending the `TYPES` array and handling them in `handleTap`
  - Adjust UI layers and HUD by editing Tailwind classes in the game container

- Recommended workflow:
  1. Keep fast-changing logic in the ref state for performance
  2. Use React state only for values that affect visible rendering
  3. Test interactions with both mouse and touch
  4. Profile animation and state updates when introducing complex effects
