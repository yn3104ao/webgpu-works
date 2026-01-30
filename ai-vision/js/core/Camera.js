import { Mat4 } from '../math.js';

export class Camera {
    constructor(aspect) {
        this.rotX = 0;
        this.rotY = 0;
        this.dist = 10;
        this.target = [0, 0, 0];
        this.pos = [0, 0, 10];
        this.aspect = aspect;

        this.proj = Mat4.create();
        this.view = Mat4.create();
        this.viewProj = Mat4.create();

        this.update();
    }

    rotate(dx, dy) {
        this.rotX -= dx * 0.005;
        this.rotY -= dy * 0.005;
        this.rotY = Math.max(-1.5, Math.min(1.5, this.rotY));
        this.update();
    }

    zoom(delta) {
        this.dist += delta * 0.002;
        this.dist = Math.max(0.1, this.dist);
        this.update();
    }

    setAspect(aspect) {
        this.aspect = aspect;
        this.update();
    }

    update() {
        const cx = this.target[0] + Math.sin(this.rotX) * Math.cos(this.rotY) * this.dist;
        const cy = this.target[1] + Math.sin(this.rotY) * this.dist;
        const cz = this.target[2] + Math.cos(this.rotX) * Math.cos(this.rotY) * this.dist;
        this.pos = [cx, cy, cz];

        Mat4.lookAt(this.view, this.pos, this.target, [0, 1, 0]);
        Mat4.perspective(this.proj, Math.PI / 3, this.aspect, 0.1, 100.0);
        Mat4.multiply(this.viewProj, this.proj, this.view);
    }
}
