# WebGPU N-Body Galaxy Simulation 🌌

   **Built in collaboration with Google Gemini 🤖✨**

A massive N-Body gravity simulation rendering 65,536 particles in real-time using WebGPU Compute Shaders.

<!-- ## 🚀 Live Demo -->

## 🌟 Overview

I implemented a classic N-Body problem solver to simulate the formation and interaction of galaxies.
Unlike approximate methods (like Barnes-Hut), this simulation calculates **all-to-all gravitational forces** ($O(N^2)$ complexity) for maximum accuracy. To achieve real-time performance with tens of thousands of stars, I utilized **WebGPU Compute Shaders with Shared Memory (Tiled rendering)** optimizations to maximize GPU throughput.

## ✨ Key Features

- **High-Performance Physics**: Simulates up to 65,536 particles at 60 FPS on modern GPUs (e.g., RTX 3060, Apple M-series).

- **Tiled Compute Shader**: Optimizes memory access by loading particle chunks into fast Shared Memory, significantly reducing global memory bandwidth.

- **Interactive Chaos**:

  - **Big Bang**: Reset the universe with a random explosion.

  - **Black Hole Cursor**: Hold Shift + Drag to create a massive gravitational attractor and disrupt the galaxy.

- **Flight Controls**: Navigate through the star cluster with WASD + Mouse Orbit controls.

🛠️ Tech Stack

- **WebGPU (WGSL)**:

  - **Compute Shader**: Tiled N-Body gravity calculation, Symplectic Euler integration.

  - **Render Pipeline**: Point-list rendering with velocity-based coloring (Doppler-shift style).

- **HTML5 / JavaScript**: Zero dependencies.

🎮 Controls

|Input|Action|
|---|---|
|Left Drag|Rotate Camera|
|Right Drag|Pan Camera Target|
|Mouse Wheel|Zoom In / Out|
|Shift + Drag|Create Black Hole (Attract stars)|
|UI Panel|Adjust Particle Count, Gravity, Time Step|

⚠️ Requirements

- **PC / Desktop Recommended:** This simulation is extremely compute-intensive.

- **Mobile**: May run on high-end devices (e.g., iPhone 17 Pro / A19 Pro), **BUT** a **dedicated GPU is recommended** for the full 65k particle experience.

📄 License

MIT License
