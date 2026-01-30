export class WebGPUContext {
    constructor(canvas) {
        this.canvas = canvas;
        this.device = null;
        this.format = null;
        this.ctx = null;
        this.depthBuffer = null;
    }

    async init() {
        if (!navigator.gpu) throw new Error("WebGPU not supported");

        const adapter = await navigator.gpu.requestAdapter();
        this.device = await adapter.requestDevice();
        this.ctx = this.canvas.getContext('webgpu');
        this.format = navigator.gpu.getPreferredCanvasFormat();

        this.configure();
        return this;
    }

    configure() {
        const dpr = window.devicePixelRatio || 1;
        const width = Math.floor(this.canvas.clientWidth * dpr);
        const height = Math.floor(this.canvas.clientHeight * dpr);

        if (this.canvas.width !== width || this.canvas.height !== height) {
            this.canvas.width = width;
            this.canvas.height = height;

            if (this.depthBuffer) this.depthBuffer.destroy();
            this.depthBuffer = this.device.createTexture({
                size: [width, height, 1],
                format: 'depth24plus',
                usage: GPUTextureUsage.RENDER_ATTACHMENT
            });
        }

        this.ctx.configure({
            device: this.device,
            format: this.format,
            alphaMode: 'opaque'
        });
    }

    get currentTexture() {
        return this.ctx.getCurrentTexture().createView();
    }
}
