# 🔭 AI Vision

Real-time 3D point cloud reconstruction and semantic isolation powered by WebGPU and on-device AI.

## 🌟 Overview

AI Vision transforms a standard 2D webcam feed into a dynamic 3D point cloud. It leverages a dual-model AI pipeline running entirely client-side to estimate depth and semantically isolate foreground objects (like people) from the background.

## 🚀 Key Features

- **Real-time Depth Estimation**: Uses `Depth-Anything-Small` (or Base) to generate high-resolution depth maps at 30+ FPS.
- **Semantic Isolation**: Integrated `SegFormer-B0` model to identify and prune background elements (walls, floors, etc.) in 3D space.
- **RTX Mode (High Density)**: Renders up to 1 million points with a 1:1 pixel-to-point mapping on high-end desktop GPUs.
- **WebGPU Compute Pipeline**: Highly optimized WGSL shaders for bilinear depth upscaling, color sampling, and semantic masking.
- **Clean Architecture**: Built with a modular structure (Core, Engine, Infrastructure, UI) for maximum maintainability.
- **Security Hardened**: Strict Content Security Policy (CSP) and local library hosting for zero external script dependency.

## 🛠️ Architecture

The project follows a **Pragmatic Clean Architecture** to separate concerns while maintaining high performance:

- **VisionSystem (App)**: Orchestrates the initialization and main rendering loop.
- **AIModelManager (Core)**: Encapsulates dual Transformers.js models within a Web Worker.
- **Renderer (Engine)**: Manages GPU resources and dispatches compute/render passes.
- **PipelineFactory**: Decouples the complexity of WebGPU pipeline creation.

## 🏎️ Performance Modes

| Mode         | Point Count      | Target                                                 |
| ------------ | ---------------- | ------------------------------------------------------ |
| **Standard** | ~230k points     | Balanced performance for most laptops/integrated GPUs. |
| **RTX Mode** | ~920k points     | Maximum fidelity for dedicated GPUs (RTX 3060+).       |
| **Mobile**   | Optimized Stride | High frame rate for devices like iPhone 17 Pro.        |

## 📦 Tech Stack

- **Graphics**: WebGPU (WGSL)
- **AI Inference**: Transformers.js (ONNX Runtime Web)
- **Engine**: Pure JavaScript (No external frameworks)
- **Worker**: Multi-threaded Web Workers for non-blocking inference.

## 📄 How to Use

1. Enable WebGPU in your browser (Chrome 113+).
2. Allow Camera access when prompted.
3. Use the UI panel to toggle **Isolation Mode** or **RTX Mode**.
4. Use the mouse/touch to rotate and zoom the 3D scene.
