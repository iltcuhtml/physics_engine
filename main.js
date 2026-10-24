"use strict";

let lastTime = 0;
let accumulatedTime = 0;
const INTERVAL_DELAY = 1000 / 60; // 60 FPS

let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");
const WORLD_W = 25.6, WORLD_H = 14.4;
const rad = Math.PI / 180;
let ratio = 100;

let eps = 1;

let wall_collision = true;
let collision = true;

class circle {
    constructor(m, x, y, vx, vy, ax, ay, r) {
        if (m <= 0) throw new Error("Mass must be greater than 0");
        if (r <= 0) throw new Error("Radius must be greater than 0");

        this.m = m;

        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.ax = ax;
        this.ay = ay;

        this.r = r;
    }

    updatePhysics(dt) {
        this.vx += this.ax * dt;
        this.vy += this.ay * dt;

        this.x += this.vx * dt;
        this.y += this.vy * dt;
    }

    resolveWalls() {
        if (!wall_collision) return;

        const r = this.r;
        const EPS = 1e-9;

        let x = this.x, y = this.y;
        let vx = this.vx, vy = this.vy;

        if (x < r) {
            this.x = r;

            if (vx < -EPS) this.y += (r - x) * vy / vx;

            this.vx = Math.abs(vx) * (eps + 1) / 2;
        } else if (x + r > WORLD_W) {
            this.x = WORLD_W - r;

            if (vx > EPS) this.y -= (x + r - WORLD_W) * vy / vx;

            this.vx = -Math.abs(vx) * (eps + 1) / 2;
        }

        x = this.x, y = this.y;
        vx = this.vx, vy = this.vy;

        if (y < r) {
            this.y = r;

            if (vy < -EPS) this.x += (r - y) * vx / vy;

            this.vy = Math.abs(vy) * (eps + 1) / 2;
        } else if (y + r > WORLD_H) {
            this.y = WORLD_H - r;

            if (vy > EPS) this.x -= (y + r - WORLD_H) * vx / vy;

            this.vy = -Math.abs(vy) * (eps + 1) / 2;
        }
    }

    resolveCircleCollision(index) {
        if (!collision) return;

        const a = circles[index];

        for (let i = index + 1; i < circles.length; i++) {
            const b = circles[i];

            const dx = a.x - b.x, dy = a.y - b.y;
            const d = Math.hypot(dx, dy);

            const l = a.r + b.r - d;

            if (l <= 0 || d === 0) continue;

            const nx = dx / d, ny = dy / d;

            const sa = Math.hypot(a.vx, a.vy);
            const sb = Math.hypot(b.vx, b.vy);
            const s = sa + sb;

            const ta = s > 1e-9 ? sa / s : 0.5;
            const tb = 1 - ta;

            a.x += nx * l * ta;
            a.y += ny * l * ta;
            b.x -= nx * l * tb;
            b.y -= ny * l * tb;

            const m1 = a.m, m2 = b.m;
            const v1n = a.vx * nx + a.vy * ny;
            const v2n = b.vx * nx + b.vy * ny;

            if (v1n - v2n >= 0) continue;

            const n1 = ((m1 - m2 * eps) * v1n + m2 * (1 + eps) * v2n) / (m1 + m2);
            const n2 = ((m2 - m1 * eps) * v2n + m1 * (1 + eps) * v1n) / (m1 + m2);

            a.vx += (n1 - v1n) * nx; a.vy += (n1 - v1n) * ny;
            b.vx += (n2 - v2n) * nx; b.vy += (n2 - v2n) * ny;
        }
    }
    
    render(index, ratio) {
        ctx.beginPath();

        ctx.arc(this.x * ratio, canvas.height - this.y * ratio, this.r * ratio, 0, 2 * Math.PI);

        ctx.fillStyle = "blue";

        ctx.fill();

        ctx.font = `${ratio}px Arial`;
        ctx.fillStyle = 'red';

        ctx.textAlign = "center"
        ctx.textBaseline = "middle"

        ctx.fillText(index, this.x * ratio, canvas.height - this.y * ratio);
        //ctx.fillText(`vx: ${this.vx.toFixed(2)}`, this.x * ratio, canvas.height - this.y * ratio - ratio * 2.5);
        //ctx.fillText(`vy: ${this.vy.toFixed(2)}`, this.x * ratio, canvas.height - this.y * ratio - ratio * 1.5);
    }
}

class rectangle {
    constructor(m, x, y, vx, vy, ax, ay, w, h, deg) {
        if (m <= 0) throw new Error("Mass must be greater than 0");
        if (w <= 0) throw new Error("Width must be greater than 0");
        if (h <= 0) throw new Error("Height must be greater than 0");

        this.m = m;

        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.ax = ax;
        this.ay = ay;

        this.w = w;
        this.h = h;

        this.deg = deg;
    }

    updatePhysics(dt) {
        this.vx += this.ax * dt;
        this.vy += this.ay * dt;

        this.x += this.vx * dt;
        this.y += this.vy * dt;
    }

    resolveWalls() {
        if (!wall_collision) return;

        const wc = Math.abs(this.w * Math.cos(this.deg) / 2), ws = Math.abs(this.w * Math.sin(this.deg) / 2);
        const hc = Math.abs(this.h * Math.cos(this.deg) / 2), hs = Math.abs(this.h * Math.sin(this.deg) / 2);
        const ex = wc + hs, ey = ws + hc;
        const EPS = 1e-9;

        let x = this.x, y = this.y;
        let vx = this.vx, vy = this.vy;

        if (x < ex) {
            this.x = ex;

            if (vx < -EPS) this.y += (ex - x) * vy / vx;

            this.vx = Math.abs(vx) * (eps + 1) / 2;
        } else if (x + ex > WORLD_W) {
            this.x = WORLD_W - ex;

            if (vx > EPS) this.y -= (x + ex - WORLD_W) * vy / vx;

            this.vx = -Math.abs(vx) * (eps + 1) / 2;
        }

        x = this.x, y = this.y;
        vx = this.vx, vy = this.vy;

        if (y < ey) {
            this.y = ey;

            if (vy < -EPS) this.x += (ey - y) * vx / vy;

            this.vy = Math.abs(vy) * (eps + 1) / 2;
        } else if (y + ey > WORLD_H) {
            this.y = WORLD_H - ey;

            if (vy > EPS) this.x -= (y + ey - WORLD_H) * vx / vy;

            this.vy = -Math.abs(vy) * (eps + 1) / 2;
        }
    }

    resolveRectangleCollision(index) {
        if (!collision) return;

        const a = rectangles[index];

        for (let i = index + 1; i < rectangles.length; i++) {
            const b = rectangles[i];

            const dx = a.x - b.x, dy = a.y - b.y;
            const d = Math.hypot(dx, dy);

            const l = a.r + b.r - d;

            if (l <= 0 || d === 0) continue;

            const nx = dx / d, ny = dy / d;

            const sa = Math.hypot(a.vx, a.vy);
            const sb = Math.hypot(b.vx, b.vy);
            const s = sa + sb;

            const ta = s > 1e-9 ? sa / s : 0.5;
            const tb = 1 - ta;

            a.x += nx * l * ta;
            a.y += ny * l * ta;
            b.x -= nx * l * tb;
            b.y -= ny * l * tb;

            const m1 = a.m, m2 = b.m;
            const v1n = a.vx * nx + a.vy * ny;
            const v2n = b.vx * nx + b.vy * ny;

            if (v1n - v2n >= 0) continue;

            const n1 = ((m1 - m2 * eps) * v1n + m2 * (1 + eps) * v2n) / (m1 + m2);
            const n2 = ((m2 - m1 * eps) * v2n + m1 * (1 + eps) * v1n) / (m1 + m2);

            a.vx += (n1 - v1n) * nx; a.vy += (n1 - v1n) * ny;
            b.vx += (n2 - v2n) * nx; b.vy += (n2 - v2n) * ny;
        }
    }

    render(index, ratio) {
        const x = this.x, y = this.y;
        const wc = this.w * Math.cos(this.deg) / 2, ws = this.w * Math.sin(this.deg) / 2;
        const hc = this.h * Math.cos(this.deg) / 2, hs = this.h * Math.sin(this.deg) / 2;

        ctx.beginPath();

        ctx.moveTo((x - wc - hs) * ratio, canvas.height - (y - ws + hc) * ratio);
        ctx.lineTo((x - wc + hs) * ratio, canvas.height - (y - ws - hc) * ratio);
        ctx.lineTo((x + wc + hs) * ratio, canvas.height - (y + ws - hc) * ratio);
        ctx.lineTo((x + wc - hs) * ratio, canvas.height - (y + ws + hc) * ratio);

        ctx.fillStyle = "red";

        ctx.fill();

        ctx.font = `${ratio}px Arial`;
        ctx.fillStyle = 'blue';

        ctx.textAlign = "center"
        ctx.textBaseline = "middle"

        ctx.fillText(index, this.x * ratio, canvas.height - this.y * ratio);
        //ctx.fillText(`vx: ${this.vx.toFixed(2)}`, this.x * ratio, canvas.height - this.y * ratio - ratio * 2.5);
        //ctx.fillText(`vy: ${this.vy.toFixed(2)}`, this.x * ratio, canvas.height - this.y * ratio - ratio * 1.5);
    }
}

function drawWorldArea(ratio) {
    const w = WORLD_W * ratio;
    const h = WORLD_H * ratio;
    const t = 5;

    ctx.save();
    ctx.strokeStyle = "black";
    ctx.lineWidth = t;
    ctx.strokeRect(t / 2, canvas.height - h + t / 2, w - t, h - t);
    ctx.restore();
}

let circles = [], rectangles = [];

function createCircle(m = 1, x = 1, y = 1, vx = 0, vy = 0, ax = 0, ay = 0, r = 1) {
    let c = new circle(m, x, y, vx, vy, ax, ay, r);

    circles.push(c);
}

function createRectangle(m = 1, x = 1, y = 1, vx = 0, vy = 0, ax = 0, ay = 0, w = 1, h = 1, deg = 0) {
    let r = new rectangle(m, x, y, vx, vy, ax, ay, w, h, deg);

    rectangles.push(r);
}

function updatePhysics(dt) {
    for (const c of circles) c.updatePhysics(dt);
    for (const c of circles) c.resolveWalls();

    for (const r of rectangles) r.updatePhysics(dt);
    for (const r of rectangles) r.resolveWalls();

    for (let i = 0; i < circles.length; i++) {
        circles[i].resolveCircleCollision(i);
    }

    for (let i = 0; i < rectangles.length; i++) {
        rectangles[i].resolveRectangleCollision(i);
    }
}

function render(ratio) {
    for (let i = 0; i < circles.length; i++)
        circles[i].render(i, ratio);

    for (let i = 0; i < rectangles.length; i++) {
        rectangles[i].render(i, ratio);
        rectangles[i].deg += 0.01;
    }
}

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    ratio = Math.min(canvas.width / WORLD_W, canvas.height / WORLD_H);
}
 
function main(timestamp) {
    requestAnimationFrame(main);

    if (!lastTime) { lastTime = timestamp; return; }

    accumulatedTime += Math.min(timestamp - lastTime, 100);
    lastTime = timestamp

    while (accumulatedTime >= INTERVAL_DELAY) {
        updatePhysics(INTERVAL_DELAY / 1000);

        accumulatedTime -= INTERVAL_DELAY;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (wall_collision) drawWorldArea(ratio);

    render(ratio);
}

createCircle(1.0, 5, 5, 2.5, 1.2, 0, 0, 0.8);
createCircle(1.5, 10, 8, -1.8, 2.1, 0, 0, 1.2);
createCircle(0.7, 15, 6, 0.5, -2.4, 0, 0, 0.6);
createCircle(2.0, 8, 12, 1.2, -1.1, 0, 0, 1.5);
createCircle(1.2, 13, 10, -2.2, -1.5, 0, 0, 0.9);
createCircle(0.9, 18, 13, -1.0, 1.8, 0, 0, 0.7);

createRectangle(1, 5, 5, 4, 3, 0, 0, 2, 1, 0);

resize();
requestAnimationFrame(main);
window.addEventListener("resize", resize);