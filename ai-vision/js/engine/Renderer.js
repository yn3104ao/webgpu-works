import { PipelineFactory } from './PipelineFactory.js';

export class Renderer {
    constructor(gpuCtx) {
        this.gpu = gpuCtx;
        this.device = gpuCtx.device;
        this.pipelines = {};
        this.bindGroups = {};
        this.buffers = {};
        this.textures = {};
        this.sampler = this.device.createSampler({ magFilter: 'linear', minFilter: 'linear' });
    }

    async loadShaders() {
        const fetchShader = async (path) => await fetch(path).then(r => r.text());
        const codes = await Promise.all([
            fetchShader('./shaders/compute.wgsl'),
            fetchShader('./shaders/render.wgsl'),
            fetchShader('./shaders/gizmo.wgsl'),
            fetchShader('./shaders/background.wgsl')
        ]);

        this.modules = {
            compute: this.device.createShaderModule({ label: 'ComputeModule', code: codes[0] }),
            render: this.device.createShaderModule({ label: 'RenderModule', code: codes[1] }),
            gizmo: this.device.createShaderModule({ label: 'GizmoModule', code: codes[2] }),
            background: this.device.createShaderModule({ label: 'BackgroundModule', code: codes[3] })
        };
    }

    initResources(vW, vH) {
        // ... (kept unchanged, but not redeclaring initResources, just showing context for where createPipelines sits)
        const { device } = this;
        // Uniform Buffer
        this.buffers.uniform = device.createBuffer({
            size: 128,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        });

        // Vertex/Storage Buffer for points
        const maxPoints = 1024 * 1024;
        this.buffers.points = device.createBuffer({
            size: maxPoints * 6 * 4,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.VERTEX
        });

        // Textures
        this.textures.video = device.createTexture({
            size: [vW, vH, 1],
            format: 'rgba8unorm',
            usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT
        });

        this.textures.depth = device.createTexture({
            size: [1, 1, 1],
            format: 'r32float',
            usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST
        });

        this.textures.mask = device.createTexture({
            size: [1, 1, 1],
            format: 'r32float',
            usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST
        });
        device.queue.writeTexture(
            { texture: this.textures.mask },
            new Float32Array([1.0]),
            { bytesPerRow: 4, rowsPerImage: 1 },
            [1, 1, 1]
        );

        this.textures.background = device.createTexture({
            size: [vW, vH, 1],
            format: 'rgba8unorm',
            usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_DST
        });
    }

    createPipelines() {
        const { format, device } = this.gpu;

        // Compute
        const compute = PipelineFactory.createCompute(device, this.modules.compute);
        this.pipelines.compute = compute.pipeline;
        this.layouts = { computeBGL: compute.bindGroupLayout };

        // Render
        const render = PipelineFactory.createRender(device, this.modules.render, format);
        this.pipelines.render = render.pipeline;
        this.layouts.renderBGL = render.bindGroupLayout;

        // Background
        const bg = PipelineFactory.createBackground(device, this.modules.background, format);
        this.pipelines.background = bg.pipeline;
        this.layouts.bgBGL = bg.bindGroupLayout;

        // Gizmo
        const gizmo = PipelineFactory.createGizmo(device, this.modules.gizmo, format);
        this.pipelines.gizmo = gizmo.pipeline;
        this.layouts.gizmoBGL = gizmo.bindGroupLayout;
    }

    updateBindGroups() {
        this.bindGroups.compute = this.device.createBindGroup({
            layout: this.layouts.computeBGL,
            entries: [
                { binding: 0, resource: { buffer: this.buffers.uniform } },
                { binding: 1, resource: this.sampler },
                { binding: 2, resource: this.textures.depth.createView() },
                { binding: 3, resource: this.textures.video.createView() },
                { binding: 4, resource: { buffer: this.buffers.points } },
                { binding: 5, resource: this.textures.mask.createView() }
            ]
        });

        this.bindGroups.render = this.device.createBindGroup({
            layout: this.layouts.renderBGL,
            entries: [
                { binding: 0, resource: { buffer: this.buffers.uniform } },
                { binding: 4, resource: { buffer: this.buffers.points } }
            ]
        });

        this.bindGroups.background = this.device.createBindGroup({
            layout: this.layouts.bgBGL,
            entries: [
                { binding: 1, resource: this.sampler },
                { binding: 3, resource: this.textures.video.createView() }
            ]
        });

        this.bindGroups.gizmo = this.device.createBindGroup({
            layout: this.layouts.gizmoBGL,
            entries: [{ binding: 0, resource: { buffer: this.buffers.uniform } }]
        });
    }

    resizeVideoTexture(w, h) {
        if (this.textures.video.width !== w || this.textures.video.height !== h) {
            this.textures.video.destroy();
            this.textures.video = this.device.createTexture({
                size: [w, h, 1],
                format: 'rgba8unorm',
                usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT
            });
            this.updateBindGroups();
        }
    }

    resizeDepthTexture(w, h) {
        if (this.textures.depth.width !== w || this.textures.depth.height !== h) {
            this.textures.depth.destroy();
            this.textures.depth = this.device.createTexture({
                size: [w, h, 1],
                format: 'r32float',
                usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST
            });
            this.updateBindGroups();
        }
    }

    resizeMaskTexture(w, h) {
        if (this.textures.mask.width !== w || this.textures.mask.height !== h) {
            this.textures.mask.destroy();
            this.textures.mask = this.device.createTexture({
                size: [w, h, 1],
                format: 'r32float',
                usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST
            });
            this.updateBindGroups();
        }
    }

    render(viewProj, params, pointCount) {
        const { device, gpu } = this;

        // Write Uniforms
        const uData = new Float32Array(32);
        uData.set(viewProj, 0);
        uData.set(params, 16);
        device.queue.writeBuffer(this.buffers.uniform, 0, uData);

        const enc = device.createCommandEncoder();

        // Compute Pass
        const cPass = enc.beginComputePass();
        cPass.setPipeline(this.pipelines.compute);
        cPass.setBindGroup(0, this.bindGroups.compute);
        // Dispatch based on VIDEO grid size (params[3], params[4])
        // The shader internally maps these to DEPTH texture (params[5], params[6])
        cPass.dispatchWorkgroups(Math.ceil(params[3] / 8), Math.ceil(params[4] / 8));
        cPass.end();

        // Render Pass
        const pass = enc.beginRenderPass({
            colorAttachments: [{
                view: gpu.currentTexture,
                loadOp: 'clear', clearValue: { r: 0.1, g: 0.1, b: 0.2, a: 1 }, storeOp: 'store'
            }],
            depthStencilAttachment: {
                view: gpu.depthBuffer.createView(),
                depthClearValue: 1.0, depthLoadOp: 'clear', depthStoreOp: 'store'
            }
        });

        // 1. BG
        pass.setPipeline(this.pipelines.background);
        pass.setBindGroup(0, this.bindGroups.background);
        pass.draw(4);

        // 2. Points
        if (pointCount > 0) {
            pass.setPipeline(this.pipelines.render);
            pass.setBindGroup(0, this.bindGroups.render);
            pass.draw(pointCount * 6);
        }

        // 3. Gizmo
        pass.setPipeline(this.pipelines.gizmo);
        pass.setBindGroup(0, this.bindGroups.gizmo);
        pass.draw(6);

        pass.end();
        device.queue.submit([enc.finish()]);
    }
}
