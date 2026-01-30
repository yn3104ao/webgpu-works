# 🗺️ WebGPU Works Roadmap

This document outlines the future development plans and experimental ideas for the WebGPU Works portfolio.

## ✅ Phase 1: Physics & Compute (Completed)

Demonstrating raw compute power through physical simulations.

- [x] 🏎️ **F1 Aerodynamics CFD**: Eulerian fluid simulation with ground effect visualization.

- [x] 🧬 **Reactive Sphere**: Reaction-Diffusion system on a 3D displaced surface.

- [x] 🌌 **N-Body Galaxy**: Massive particle simulation with tiled compute optimization.

## ✅ Phase 2: Advanced Rendering (Completed)

Pushing graphical fidelity beyond standard rasterization.

- [x] 🏎️ **F1 Aerodynamics CFD**: Real-time Raymarching and flow visualization.

- [ ] **Real-time Path Tracing**: Global illumination using compute-based raytracing.

## ✅ Phase 3: AI & Machine Learning (Completed)

Leveraging WebGPU for client-side AI inference (Edge AI).

- [x] 🔭 **AI Vision**:
  - Real-time Depth Estimation from webcam feed.
  - Semantic Isolation (Background Pruning) using SegFormer.
  - *Tech*: WebGPU, Transformers.js (ONNX), Web Workers.

## ⚙️ Phase 4: Hardware Visualization

Educational visualizations that reveal how the GPU works.

- [ ] **The "Parallel" Demo**:

  - Visualize GPU threads (invocations) as individual pixels/agents.

  - **Bitonic Sort Visualizer**: Watch millions of colored particles sort themselves instantly.

  - **Warp Divergence**: Visualize performance penalty when threads in a group take different branch paths (if/else).

  - *Goal*: Make the concept of "Massive Parallelism" intuitive and visible.

*Ideas are subject to change based on GPU melting points and inspiration. 🧠*
