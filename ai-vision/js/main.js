import { VisionSystem } from './app/VisionSystem.js';

export async function init() {
    const app = new VisionSystem('canvas', 'webcam');
    try {
        await app.init();
        app.start();
    } catch (e) {
        console.error("Initialization Failed:", e);
        document.getElementById('status').innerText = "Fatally Error: " + e.message;
    }
}
