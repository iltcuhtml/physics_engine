"use strict";

let lastTime = 0;
let accumulatedTime = 0;
const INTERVAL_DELAY = 1000 / 60; // 60 FPS

let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");
const WORLD_W = 25.6, WORLD_H = 14.4;
let ratio = 100;

let eps = 1;

let wall_collision = true;

class circle {
    constructor(m, x, y, vx, vy, ax, ay, r) {
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

    render(index, ratio) {
        ctx.beginPath();
        ctx.arc(this.x * ratio, canvas.height - this.y * ratio, this.r * ratio, 0, 2 * Math.PI);
        ctx.fillStyle = "blue";
        ctx.fill();
        ctx.stroke();

        ctx.font = `${ratio}px Arial`;
        ctx.fillStyle = 'red';
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText(index, this.x * ratio, canvas.height - this.y * ratio);
        //ctx.fillText(`vx: ${this.vx.toFixed(2)}`, this.x * ratio, canvas.height - this.y * ratio - ratio * 2.5);
        //ctx.fillText(`vy: ${this.vy.toFixed(2)}`, this.x * ratio, canvas.height - this.y * ratio - ratio * 1.5);
    }
}

let circles = [];

function createCircle(m = 1, x = 1, y = 1, vx = 0, vy = 0, ax = 0, ay = 0, r = 1) {
    let c = new circle(m, x, y, vx, vy, ax, ay, r);

    circles.push(c);
}

function resolveCircleCollision(a, b) {
    const dx = Math.abs(a.x - b.x);
    const dy = Math.abs(a.y - b.y);
    const d = Math.hypot(dx, dy);
    const l = a.r + b.r - d;

    if (l <= 0 || d === 0) return;

    if (a.vx !== b.vx) {
        a.x -= l * (dx / d) * (a.vx / Math.abs(a.vx - b.vx));
        b.x -= l * (dx / d) * (b.vx / Math.abs(a.vx - b.vx));

        a.vx = ((a.m - b.m * eps) * a.vx + (b.m + b.m * eps) * b.vx) / (a.m + b.m);
        b.vx = ((a.m + a.m * eps) * a.vx + (b.m - a.m * eps) * b.vx) / (a.m + b.m);
    }

    if (a.vy !== b.vy) {
        a.y -= l * (dy / d) * (a.vy / Math.abs(a.vy - b.vy));
        b.y -= l * (dy / d) * (b.vy / Math.abs(a.vy - b.vy));

        a.vy = ((a.m - b.m * eps) * a.vy + (b.m + b.m * eps) * b.vy) / (a.m + b.m);
        b.vy = ((a.m + a.m * eps) * a.vy + (b.m - a.m * eps) * b.vy) / (a.m + b.m);
    }
}

function resolveCircleWalls(c) {
    if (!wall_collision) return;

    if (c.x < c.r)                { c.x = c.r;           c.vx =  Math.abs(c.vx) * (eps + 1) / 2; }
    else if (c.x + c.r > WORLD_W) { c.x = WORLD_W - c.r; c.vx = -Math.abs(c.vx) * (eps + 1) / 2; }

    if (c.y < c.r)                { c.y = c.r;           c.vy =  Math.abs(c.vy) * (eps + 1) / 2; }
    else if (c.y + c.r > WORLD_H) { c.y = WORLD_H - c.r; c.vy = -Math.abs(c.vy) * (eps + 1) / 2; }
}

function updatePhysics(dt) {
    for (const c of circles) c.updatePhysics(dt);
    for (const c of circles) resolveCircleWalls(c);

    for (let i = 0; i < circles.length; i++)
        for (let j = i + 1; j < circles.length; j++)
            resolveCircleCollision(circles[i], circles[j]);
}

function render(ratio) {
    for (let i = 0; i < circles.length; i++)
        circles[i].render(i, ratio);
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
    render(ratio);
}

createCircle(1.0, 5, 5, 2.5, 1.2, 0, 0, 0.8);
createCircle(1.5, 10, 8, -1.8, 2.1, 0, 0, 1.2);
createCircle(0.7, 15, 6, 0.5, -2.4, 0, 0, 0.6);
createCircle(2.0, 8, 12, 1.2, -1.1, 0, 0, 1.5);
createCircle(1.2, 13, 10, -2.2, -1.5, 0, 0, 0.9);
createCircle(0.9, 18, 13, -1.0, 1.8, 0, 0, 0.7);

resize();
requestAnimationFrame(main);
window.addEventListener("resize", resize);