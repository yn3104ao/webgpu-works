import { AIModelManager } from './core/AIModelManager.js';

const manager = new AIModelManager();

self.onmessage = async (e) => {
    const { type, payload } = e.data;

    try {
        if (type === 'init') {
            const result = await manager.init(payload);
            if (result.success) {
                self.postMessage({ type: 'status', msg: `AI Systems Ready (${result.mode})`, ready: true });
            } else {
                self.postMessage({ type: 'error', msg: result.error });
            }
        }
        else if (type === 'run') {
            const { bitmap, doIsolate } = payload;
            const result = await manager.run(bitmap, doIsolate);
            self.postMessage({ type: 'result', ...result });
        }
    } catch (err) {
        console.error("Worker Error:", err);
        self.postMessage({ type: 'error', msg: err.toString() });
    }
};
