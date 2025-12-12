# WebGPU Reactive Sphere 🧬

   **Built in collaboration with Google Gemini 🤖✨**

An interactive bio-digital art installation running in the browser using **WebGPU**.
This project simulates the **Gray-Scott Reaction-Diffusion** model on a high-resolution grid and maps it onto a pulsating sphere using vertex displacement, creating a "breathing" organic surface.

<!-- 🚀 Live Demo (Navigate from the main portal) -->

## 🌟 Overview

I created this project to explore the potential of WebGPU for **Generative Art** and **Compute Shaders**.
Unlike traditional fragment shader effects, this simulation runs entirely on the GPU's compute stage. It solves partial differential equations (PDEs) on a 2D grid at thousands of iterations per second, and uses the resulting chemical concentration to physically displace the vertices of a 3D sphere in real-time.

## ✨ Key Features

- **Reaction-Diffusion Simulation**: Implements the Gray-Scott model using WebGPU Compute Shaders with double-buffering (ping-pong) for fluid state updates.

- **Vertex Displacement**: The simulation texture directly modifies the geometry of the sphere in the Vertex Shader, creating actual physical depth rather than just a visual bump map.

- **Seamless Tiling**: The simulation logic implements **periodic boundary conditions** (torus wrapping), allowing the pattern to tile seamlessly across the sphere without visible seams.

- **Interactive Ecosystem**:

  - **Touch/Mouse Interaction**: Raycasting allows users to "draw" chemicals directly onto the 3D surface to disturb the pattern.

  - **Auto Pilot**: The system automatically modulates feed/kill rates over time, evolving the pattern from spots to stripes to chaos.

  - **Live Tuning**: Adjust simulation speed, displacement height, and texture repetition (tiling) via the UI.

## 🛠️ Tech Stack

- **WebGPU (WGSL)**:

  - **Compute Shader**: Solves the reaction-diffusion equations.

  - **Render Pipeline**: Handles the 3D projection, lighting, and vertex displacement.

- **HTML5 / JavaScript**: Zero dependencies. Custom matrix math library and raycaster implemented inline.

## 🎮 Controls

|Input|Action|
|Left Drag / Touch|Inject Chemical (Draw Pattern)|
|Right Drag|Rotate Camera View|
|Mouse Wheel|Zoom In / Out|
|UI Panel|Adjust parameters, toggle Auto Pilot, or select presets|

# 🚀 How to Run Locally

1. Clone the repository:

``` shell
git clone https://github.com/yn3104ao/webgpu-works.git
```

2. Navigate to the project directory:
``` shell
cd webgpu-works/reactive-sphere
```

3. Serve the directory using a local web server (WebGPU requires a secure context).

4. Open `index.html` in a supported browser (Chrome/Edge).

#📄 License

MIT License
