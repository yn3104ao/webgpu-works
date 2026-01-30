export class WorkerClient {
    constructor(workerPath) {
        this.worker = new Worker(workerPath, { type: 'module' });
        this.onStatus = () => { };
        this.onResult = () => { };
    }

    init(payload = {}) {
        this.worker.onmessage = (e) => {
            const { type, msg, ready, data, width, height } = e.data;
            if (type === 'status') this.onStatus(msg, ready);
            if (type === 'error') this.onStatus("Error: " + msg, false, true);
            if (type === 'result') this.onResult({ data, width, height });
        };
        this.worker.postMessage({ type: 'init', payload });
    }

    run(bitmap, extraPayload = {}) {
        // Transfer the ImageBitmap for zero-copy efficiency
        const payload = { bitmap, ...extraPayload };
        this.worker.postMessage({ type: 'run', payload }, [bitmap]);
    }
}
