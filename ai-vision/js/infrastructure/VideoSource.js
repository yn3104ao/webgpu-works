export class VideoSource {
    constructor(videoElement) {
        this.video = videoElement;
        this.stream = null;
        this.isDemoMode = false;
    }

    async init() {
        try {
            this.stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } }
            });
            this.video.srcObject = this.stream;
        } catch (e) {
            console.warn("Camera access denied. Switching to Demo Mode.", e);
            this.isDemoMode = true;
            this.video.srcObject = this.generateDemoStream();
        }

        await new Promise(r => this.video.onloadedmetadata = r);
        this.video.play();
        return {
            width: this.video.videoWidth,
            height: this.video.videoHeight,
            isDemo: this.isDemoMode
        };
    }

    generateDemoStream() {
        const demoCanvas = document.createElement('canvas');
        demoCanvas.width = 640;
        demoCanvas.height = 480;
        const dCtx = demoCanvas.getContext('2d');

        const draw = () => {
            const time = Date.now() * 0.001;
            dCtx.fillStyle = '#012';
            dCtx.fillRect(0, 0, 640, 480);

            for (let i = 0; i < 5; i++) {
                const x = 320 + Math.sin(time + i * 1.5) * 200;
                const y = 240 + Math.cos(time * 0.7 + i) * 150;
                const r = 60 + Math.sin(time * 2 + i) * 20;
                const grad = dCtx.createRadialGradient(x, y, 0, x, y, r);
                grad.addColorStop(0, `hsl(${(time * 40 + i * 60) % 360}, 80%, 60%)`);
                grad.addColorStop(1, 'rgba(0,0,0,0)');
                dCtx.fillStyle = grad;
                dCtx.beginPath();
                dCtx.arc(x, y, r, 0, Math.PI * 2);
                dCtx.fill();
            }
            requestAnimationFrame(draw);
        };
        draw();
        return demoCanvas.captureStream(30);
    }

    get ready() {
        return this.video.readyState >= 2 && !this.video.paused;
    }
}
