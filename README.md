# WebGPU Works 🧪

A collection of high-performance graphics and physics experiments running entirely in the browser, powered by **WebGPU**.

This repository serves as a personal playground to push the limits of modern web graphics without relying on heavy game engines.

<!--> 🚀 View Portfolio

(Replace with a collage of your screenshots)
-->

## 📂 Projects

| Project                                          | Description                                                                                                                    | Tech Stack                                          |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------- |
| [🏎️ F1 Aerodynamics](./f1-aero/README.md)         | Real-time 3D Computational Fluid Dynamics (CFD) simulation visualizing Ground Effect and Wake Turbulence around a formula car. | `Compute Shaders` `Eulerian Grid` `Raymarching`     |
| [🔭 AI Vision](./ai-vision/README.md)             | Real-time 3D point cloud reconstruction from webcam feed using client-side depth estimation and semantic segmentation models.  | `WebGPU` `Transformers.js` `Depth Anything`         |
| [🧬 Reactive Sphere](./reactive-sphere/README.md) | An interactive generative art piece simulating the Gray-Scott Reaction-Diffusion model, mapped onto a pulsating 3D sphere.     | `Reaction-Diffusion` `Vertex Displacement` `Tiling` |
| 🌌 N-Body Sandbox                                 | Massive particle physics simulation (up to 65k+ particles) demonstrating gravity, collision, and SPH-like fluid dynamics.      | `N-Body` `Shared Memory` `Tiled Compute`            |

## 🤝 Development Story

I built this project through an intensive pair-programming session with **Google Gemini**. It stands as a testament to how human-AI collaboration can accelerate complex graphics engineering.

- **Concept & Direction**: I defined the physics scenarios, visual aesthetics, and interaction models (e.g., F1 regulations, biological patterns, galaxy mergers).

- **Core Implementation**: Gemini generated the highly optimized WGSL compute shaders and boilerplates for the simulation loops.

- **Optimization**: We iteratively tuned grid sizes, time steps, and memory alignment to achieve 60 FPS stability on consumer hardware (e.g., RTX 3060).

## 🗺️ Roadmap

Future ideas to explore the capabilities of WebGPU:

- [ ] 🕯️ **Real-time Raytracing**: Photorealistic rendering with soft shadows, reflections, and path tracing in the browser.

- [ ] ⚙️ **GPU Hardware Visualizer**: Educational visualizations of GPU architecture (e.g., Bitonic Sort, Warp Divergence).

## 🛠️ Tech Stack

- **Core**: Raw WebGPU (WGSL), HTML5, JavaScript.

- **Dependencies**: None. (Zero-dependency philosophy; math libraries are inline).

## 🚀 How to Run Locally

1. Clone the repository:
``` shell
git clone https://github.com/yn3104ao/webgpu-works.git
```

2. Serve the directory using a local web server (e.g., VS Code "Live Server", Python `http.server`, or Node `http-server`).

  - Note: WebGPU requires a secure context (localhost or https).

3. Open `index.html` in a WebGPU-compatible browser (latest Chrome/Edge).

## ⚠️ Requirements

- A browser with W**ebGPU** support enabled (Chrome 113+, Edge 113+, etc.).

- A dedicated GPU (RTX 3060 or equivalent) is recommended for high-fidelity simulations.

## 📄 License

MIT License
