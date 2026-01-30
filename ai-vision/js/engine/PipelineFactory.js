export class PipelineFactory {
    static createCompute(device, module) {
        const bindGroupLayout = device.createBindGroupLayout({
            entries: [
                { binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' } },
                { binding: 1, visibility: GPUShaderStage.COMPUTE, sampler: {} },
                { binding: 2, visibility: GPUShaderStage.COMPUTE, texture: { sampleType: 'unfilterable-float', viewDimension: '2d' } },
                { binding: 3, visibility: GPUShaderStage.COMPUTE, texture: { sampleType: 'float', viewDimension: '2d' } },
                { binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },
                { binding: 5, visibility: GPUShaderStage.COMPUTE, texture: { sampleType: 'unfilterable-float', viewDimension: '2d' } }
            ]
        });

        const pipeline = device.createComputePipeline({
            label: 'ComputePipeline',
            layout: device.createPipelineLayout({ bindGroupLayouts: [bindGroupLayout] }),
            compute: { module, entryPoint: 'computeMain' }
        });

        return { pipeline, bindGroupLayout };
    }

    static createRender(device, module, format) {
        const bindGroupLayout = device.createBindGroupLayout({
            entries: [
                { binding: 0, visibility: GPUShaderStage.VERTEX, buffer: { type: 'uniform' } },
                { binding: 4, visibility: GPUShaderStage.VERTEX, buffer: { type: 'read-only-storage' } }
            ]
        });

        const pipeline = device.createRenderPipeline({
            label: 'RenderPipeline',
            layout: device.createPipelineLayout({ bindGroupLayouts: [bindGroupLayout] }),
            vertex: { module, entryPoint: 'vsMain' },
            fragment: {
                module, entryPoint: 'fsMain',
                targets: [{
                    format,
                    blend: {
                        color: { operation: 'add', srcFactor: 'src-alpha', dstFactor: 'one-minus-src-alpha' },
                        alpha: { operation: 'add', srcFactor: 'one', dstFactor: 'one-minus-src-alpha' }
                    }
                }]
            },
            primitive: { topology: 'triangle-list', cullMode: 'none' },
            depthStencil: { format: 'depth24plus', depthWriteEnabled: true, depthCompare: 'less' }
        });

        return { pipeline, bindGroupLayout };
    }

    static createBackground(device, module, format) {
        const bindGroupLayout = device.createBindGroupLayout({
            entries: [
                { binding: 1, visibility: GPUShaderStage.FRAGMENT, sampler: {} },
                { binding: 3, visibility: GPUShaderStage.FRAGMENT, texture: { sampleType: 'float', viewDimension: '2d' } }
            ]
        });

        const pipeline = device.createRenderPipeline({
            label: 'BackgroundPipeline',
            layout: device.createPipelineLayout({ bindGroupLayouts: [bindGroupLayout] }),
            vertex: { module, entryPoint: 'vsMain' },
            fragment: {
                module, entryPoint: 'fsMain',
                targets: [{
                    format,
                    blend: {
                        color: { operation: 'add', srcFactor: 'src-alpha', dstFactor: 'one-minus-src-alpha' },
                        alpha: { operation: 'add', srcFactor: 'one', dstFactor: 'one-minus-src-alpha' }
                    }
                }]
            },
            primitive: {
                topology: 'triangle-strip',
                cullMode: 'none',
                stripIndexFormat: 'uint32'
            },
            depthStencil: { format: 'depth24plus', depthWriteEnabled: false, depthCompare: 'always' }
        });

        return { pipeline, bindGroupLayout };
    }

    static createGizmo(device, module, format) {
        const bindGroupLayout = device.createBindGroupLayout({
            entries: [{ binding: 0, visibility: GPUShaderStage.VERTEX, buffer: { type: 'uniform' } }]
        });

        const pipeline = device.createRenderPipeline({
            label: 'GizmoPipeline',
            layout: device.createPipelineLayout({ bindGroupLayouts: [bindGroupLayout] }),
            vertex: { module, entryPoint: 'vsMain' },
            fragment: { module, entryPoint: 'fsMain', targets: [{ format }] },
            primitive: { topology: 'line-list' },
            depthStencil: { format: 'depth24plus', depthWriteEnabled: false, depthCompare: 'always' }
        });

        return { pipeline, bindGroupLayout };
    }
}
