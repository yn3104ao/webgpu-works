import { WebGPUContext } from '../engine/WebGPUContext.js';
import { Renderer } from '../engine/Renderer.js';
import { Camera } from '../core/Camera.js';
import { VideoSource } from '../infrastructure/VideoSource.js';
import { WorkerClient } from '../infrastructure/WorkerClient.js';
import { Controls } from '../ui/Controls.js';

export class VisionSystem {
    constructor(canvasId, webcamId) {
        this.canvas = document.getElementById(canvasId);
        this.videoElement = document.getElementById(webcamId);

        this.ui = new Controls();
        this.gpu = new WebGPUContext(this.canvas);
        this.video = new VideoSource(this.videoElement);
        this.worker = new WorkerClient('./js/worker.js');
        this.cam = new Camera(this.canvas.width / this.canvas.height);

        // AI State
        this.aiReady = false;
        this.aiBusy = false;

        this.loopId = null;
    }

    async init() {
        // Setup GPU
        await this.gpu.init();
        this.renderer = new Renderer(this.gpu);
        await this.renderer.loadShaders();

        // Setup Video
        const vidInfo = await this.video.init();
        if (vidInfo.isDemo) {
            this.ui.setStatus("Demo Mode (No Camera)", "#ffa");
        }

        // Initialize Resources
        this.renderer.initResources(vidInfo.width, vidInfo.height);
        this.renderer.createPipelines();
        this.renderer.updateBindGroups();

        this.setupAI();
        this.setupInputs();
    }

    setupAI() {
        this.worker.onStatus = (msg, ready, isError) => {
            this.ui.setStatus(msg, isError ? "#f55" : (ready ? "#5f5" : "#fff"));
            if (ready) this.aiReady = true;
        };

        const [, , , , initialIsBase, initialIsIsolate] = this.ui.getParams();
        this.worker.init({ isBase: initialIsBase, doIsolate: initialIsIsolate });

        this.worker.onResult = ({ data, mask, width, height }) => {
            this.renderer.resizeDepthTexture(width, height);
            this.gpu.device.queue.writeTexture(
                { texture: this.renderer.textures.depth },
                data,
                { bytesPerRow: width * 4, rowsPerImage: height },
                [width, height, 1]
            );

            if (mask) {
                this.renderer.resizeMaskTexture(width, height);
                this.gpu.device.queue.writeTexture(
                    { texture: this.renderer.textures.mask },
                    mask,
                    { bytesPerRow: width * 4, rowsPerImage: height },
                    [width, height, 1]
                );
            }

            this.aiBusy = false;
        };
    }

    setupInputs() {
        this.ui.setupInput(this.canvas,
            (dx, dy) => this.cam.rotate(dx, dy),
            (d) => this.cam.zoom(d),
            (isBase, doIsolate) => {
                this.aiReady = false;
                this.ui.setStatus("Reloading AI Pipeline...");
                this.worker.init({ isBase, doIsolate });
            }
        );
    }

    async scheduleAI() {
        if (!this.aiReady || this.aiBusy || !this.video.ready) return;
        this.aiBusy = true;

        const [, , , , isBase, doIsolate] = this.ui.getParams();
        const res = isBase ? 518 : 320;

        const bitmap = await createImageBitmap(this.video.video, {
            resizeWidth: res,
            resizeHeight: Math.round(res * 9 / 16),
            resizeQuality: 'medium'
        });
        this.worker.run(bitmap, { doIsolate });
    }

    start() {
        const frame = () => {
            if (!this.gpu.device) return; // Safety check

            this.gpu.configure();
            this.cam.setAspect(this.canvas.width / this.canvas.height);

            // Update Video Texture
            if (this.video.ready) {
                this.renderer.resizeVideoTexture(this.video.video.videoWidth, this.video.video.videoHeight);
                this.gpu.device.queue.copyExternalImageToTexture(
                    { source: this.video.video },
                    { texture: this.renderer.textures.video },
                    { width: this.video.video.videoWidth, height: this.video.video.videoHeight }
                );
            }

            const [ptSize, dispScale, useVideo, isDense, , isIsolate, bgClip] = this.ui.getParams();
            const renderParams = [
                ptSize, dispScale, useVideo, this.renderer.textures.video.width,
                this.renderer.textures.video.height, this.renderer.textures.depth.width, this.renderer.textures.depth.height, isDense,
                isIsolate, bgClip, 0.0, 0.0
            ];

            this.renderer.render(this.cam.viewProj, renderParams, this.renderer.textures.video.width * this.renderer.textures.video.height);

            this.scheduleAI();

            this.loopId = requestAnimationFrame(frame);
        };
        this.loopId = requestAnimationFrame(frame);
    }

    stop() {
        if (this.loopId) cancelAnimationFrame(this.loopId);
    }
}
