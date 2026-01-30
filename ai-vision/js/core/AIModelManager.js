import { pipeline, env, RawImage } from '../libs/transformers.min.js';

// Configure Env globally for the worker context
env.allowLocalModels = false;
env.useBrowserCache = false;
if (!env.wasm) env.wasm = {};
env.wasm.numThreads = navigator.hardwareConcurrency || 4;

export class AIModelManager {
    constructor() {
        this.depthEstimator = null;
        this.segmenter = null;
        this.offscreen = null;
        this.offscreenCtx = null;
    }

    async init(payload) {
        const isBase = payload?.isBase;
        const doIsolate = payload?.doIsolate;
        const depthModel = isBase ? 'Xenova/depth-anything-base-hf' : 'Xenova/depth-anything-small-hf';
        const segModel = 'Xenova/segformer-b0-finetuned-ade-512-512';

        console.log(`AIModelManager: Initializing...`);

        try {
            // Initialize Depth
            if (this.depthEstimator) this.depthEstimator = null;
            this.depthEstimator = await pipeline('depth-estimation', depthModel, {
                device: 'webgpu',
                dtype: isBase ? 'fp32' : 'fp16',
            });

            // Initialize Segmentation
            if (this.segmenter) this.segmenter = null;
            if (doIsolate) {
                this.segmenter = await pipeline('image-segmentation', segModel, {
                    device: 'webgpu'
                });
            }

            return { success: true, mode: 'WebGPU' };

        } catch (err) {
            console.warn("AIModelManager: WebGPU failed, fallback to WASM...", err);
            try {
                // Fallback Depth
                this.depthEstimator = await pipeline('depth-estimation', depthModel);

                // Fallback Segmentation
                if (doIsolate) {
                    this.segmenter = await pipeline('image-segmentation', segModel);
                } else {
                    this.segmenter = null;
                }

                return { success: true, mode: 'WASM' };
            } catch (err2) {
                return { success: false, error: err2.toString() };
            }
        }
    }

    async run(bitmap, doIsolate) {
        if (!this.depthEstimator) throw new Error("AI Models not initialized");

        // Prepare Input
        const image = this.processInput(bitmap);

        // Run Depth
        const depthResult = await this.depthEstimator(image);
        let depthData = depthResult.depth.data;

        // Run Segmentation
        let maskData = null;
        if (doIsolate && this.segmenter) {
            maskData = await this.runSegmentation(image, depthResult.depth.width, depthResult.depth.height);
        }

        // Standardize output
        depthData = this.normalizeDepth(depthData);

        return {
            data: depthData,
            mask: maskData,
            width: depthResult.depth.width,
            height: depthResult.depth.height
        };
    }

    processInput(bitmap) {
        if (!this.offscreen) {
            this.offscreen = new OffscreenCanvas(bitmap.width, bitmap.height);
            this.offscreenCtx = this.offscreen.getContext('2d', { willReadFrequently: true });
        }
        if (this.offscreen.width !== bitmap.width || this.offscreen.height !== bitmap.height) {
            this.offscreen.width = bitmap.width;
            this.offscreen.height = bitmap.height;
        }
        this.offscreenCtx.drawImage(bitmap, 0, 0);
        const pixels = this.offscreenCtx.getImageData(0, 0, this.offscreen.width, this.offscreen.height).data;
        const image = new RawImage(pixels, this.offscreen.width, this.offscreen.height, 4);
        bitmap.close();
        return image;
    }

    async runSegmentation(image, w, h) {
        try {
            const segResults = await this.segmenter(image);
            const maskData = new Float32Array(w * h).fill(1.0);

            // ADE20K background classes
            const bgClasses = new Set([0, 1, 2, 3, 4, 5, 6, 9, 11, 13, 16, 21, 25, 26, 29, 31, 33]);

            for (const seg of segResults) {
                const label_id = seg.label_id !== undefined ? seg.label_id : -1;
                if (bgClasses.has(label_id)) {
                    const mask = seg.mask;
                    const maskData8 = mask.data;
                    const mw = mask.width;
                    const mh = mask.height;
                    const channels = Math.floor(maskData8.length / (mw * mh));

                    for (let i = 0; i < maskData.length; ++i) {
                        const x = i % w;
                        const y = Math.floor(i / w);
                        const mx = Math.floor((x / w) * (mw - 1));
                        const my = Math.floor((y / h) * (mh - 1));
                        if (maskData8[(my * mw + mx) * channels] > 0) {
                            maskData[i] = 0.0;
                        }
                    }
                }
            }
            return maskData;
        } catch (e) {
            console.warn("Segmentation failed", e);
            return null;
        }
    }

    normalizeDepth(depthData) {
        if (!(depthData instanceof Float32Array)) {
            const f32 = new Float32Array(depthData.length);
            const isUint8 = (depthData instanceof Uint8Array || depthData instanceof Uint8ClampedArray);
            const scale = isUint8 ? 1.0 / 255.0 : 1.0;
            for (let i = 0; i < depthData.length; i++) {
                f32[i] = depthData[i] * scale;
            }
            return f32;
        }
        return depthData;
    }
}
