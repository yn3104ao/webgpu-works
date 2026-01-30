export class Controls {
    constructor() {
        this.status = document.getElementById('status');
        this.size = document.getElementById('p_size');
        this.scale = document.getElementById('p_scale');
        this.v_size = document.getElementById('v_size');
        this.v_scale = document.getElementById('v_scale');
        this.v_clip = document.getElementById('v_clip');
        this.c_video = document.getElementById('c_video');
        this.c_dense = document.getElementById('c_dense');
        this.c_base = document.getElementById('c_base');
        this.c_isolate = document.getElementById('c_isolate');
        this.clip = document.getElementById('p_clip');
    }

    setStatus(msg, color = "#fff") {
        this.status.innerText = msg;
        this.status.style.color = color;
    }

    getParams() {
        const s = parseFloat(this.size.value);
        const sc = parseFloat(this.scale.value);
        const clip = parseFloat(this.clip.value);
        const useVideo = this.c_video.checked ? 1.0 : 0.0;
        const isDense = this.c_dense.checked ? 1.0 : 0.0;
        const isBase = this.c_base.checked;
        const isIsolate = this.c_isolate.checked ? 1.0 : 0.0;

        this.v_size.innerText = s.toFixed(1);
        this.v_scale.innerText = sc.toFixed(1);
        this.v_clip.innerText = clip.toFixed(0);

        return [s * 0.15, sc * 2.0, useVideo, isDense, isBase, isIsolate, clip];
    }

    setupInput(canvas, onRotate, onZoom, onModelSettingsChange) {
        const triggerUpdate = () => onModelSettingsChange(this.c_base.checked, this.c_isolate.checked);
        this.c_base.addEventListener('change', triggerUpdate);
        this.c_isolate.addEventListener('change', triggerUpdate);
        let isDragging = false;
        let lastMouse = { x: 0, y: 0 };

        const handleMove = (dx, dy) => onRotate(dx, dy);

        canvas.addEventListener('mousedown', e => {
            isDragging = true;
            lastMouse = { x: e.clientX, y: e.clientY };
        });
        window.addEventListener('mouseup', () => isDragging = false);
        window.addEventListener('mousemove', e => {
            if (!isDragging) return;
            handleMove(e.clientX - lastMouse.x, e.clientY - lastMouse.y);
            lastMouse = { x: e.clientX, y: e.clientY };
        });

        canvas.addEventListener('wheel', e => onZoom(e.deltaY), { passive: true });

        // Touch Handling
        let lastTouch = null;
        let lastDist = 0;

        canvas.addEventListener('touchstart', e => {
            if (e.touches.length === 1) {
                lastTouch = { x: e.touches[0].clientX, y: e.touches[0].clientY };
            } else if (e.touches.length === 2) {
                const dx = e.touches[0].clientX - e.touches[1].clientX;
                const dy = e.touches[0].clientY - e.touches[1].clientY;
                lastDist = Math.sqrt(dx * dx + dy * dy);
            }
        }, { passive: false });

        canvas.addEventListener('touchmove', e => {
            if (e.touches.length === 1 && lastTouch) {
                e.preventDefault();
                handleMove(e.touches[0].clientX - lastTouch.x, e.touches[0].clientY - lastTouch.y);
                lastTouch = { x: e.touches[0].clientX, y: e.touches[0].clientY };
            } else if (e.touches.length === 2 && lastDist > 0) {
                e.preventDefault();
                const dx = e.touches[0].clientX - e.touches[1].clientX;
                const dy = e.touches[0].clientY - e.touches[1].clientY;
                const dist = Math.sqrt(dx * dx + dy * dy);

                // Sensitivity adjustment for pinch
                const delta = (lastDist - dist) * 2.0;
                onZoom(delta);
                lastDist = dist;
            }
        }, { passive: false });

        canvas.addEventListener('touchend', () => {
            lastTouch = null;
            lastDist = 0;
        });
    }
}
