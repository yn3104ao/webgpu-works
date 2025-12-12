# 🗺️ WebGPU Works Roadmap

This document outlines the future development plans and experimental ideas for the WebGPU Works portfolio.

## ✅ Phase 1: Physics & Compute (Completed)

Demonstrating raw compute power through physical simulations.

- [x] 🏎️ **F1 Aerodynamics CFD**: Eulerian fluid simulation with ground effect visualization.

- [x] 🧬 **Reactive Sphere**: Reaction-Diffusion system on a 3D displaced surface.

- [x] 🌌 **N-Body Galaxy**: Massive particle simulation with tiled compute optimization.

## 🚧 Phase 2: Advanced Rendering (Next Up)

Pushing graphical fidelity beyond standard rasterization.

- [ ] **Raytracing / Path Tracing**:

  - Real-time global illumination using a compute-based raytracer.

  - Scenes with glass, water (caustics), and soft shadows.

  - *Goal*: Show off "Photorealism in the Browser".

## 🔮 Phase 3: AI & Machine Learning

Leveraging WebGPU for client-side AI inference (Edge AI).

- [ ] **Visualizing Neural Networks**:

  - Instead of a text box, visualize the activations of a neural network layer in 3D space.

  - Example: Real-time Depth Estimation from webcam feed, rendered as a point cloud.

  - *Tech*: WebNN / Transformers.js with WebGPU backend.

## ⚙️ Phase 4: Hardware Visualization

Educational visualizations that reveal how the GPU works.

- [ ] **The "Parallel" Demo**:

  - Visualize GPU threads (invocations) as individual pixels/agents.

  - **Bitonic Sort Visualizer**: Watch millions of colored particles sort themselves instantly.

  - **Warp Divergence**: Visualize performance penalty when threads in a group take different branch paths (if/else).

  - *Goal*: Make the concept of "Massive Parallelism" intuitive and visible.

*Ideas are subject to change based on GPU melting points and inspiration. 🧠*
