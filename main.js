"use strict";

let lastTime = 0;
let accumulatedTime = 0;
const INTERVAL_DELAY = 1000 / 60; // 60 FPS

let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");
const WORLD_W = 25.6, WORLD_H = 14.4;
let ratio = 100;

let eps = 1;

let wall_collision = false;
let collision = false;

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

    resolveWalls() {
        if (!wall_collision) return;

        if (this.x < this.r) {
            this.x = this.r;
            this.vx = Math.abs(this.vx) * (eps + 1) / 2;
        } else if (this.x + this.r > WORLD_W) {
            this.x = WORLD_W - this.r;
            this.vx = -Math.abs(this.vx) * (eps + 1) / 2;
        }

        if (this.y < this.r) {
            this.y = this.r;
            this.vy = Math.abs(this.vy) * (eps + 1) / 2;
        } else if (this.y + this.r > WORLD_H) {
            this.y = WORLD_H - this.r;
            this.vy = -Math.abs(this.vy) * (eps + 1) / 2;
        }
    }

    resolveCollision(index) {
        if (!collision) return;

        for (let i = index + 1; i < circles.length; i++) {
            const m1 = circles_copy[index].m, m2 = circles_copy[i].m;
            const vx1 = circles_copy[index].vx, vx2 = circles_copy[i].vx;
            const vy1 = circles_copy[index].vy, vy2 = circles_copy[i].vy;

            const dx = Math.abs(circles_copy[index].x - circles_copy[i].x);
            const dy = Math.abs(circles_copy[index].y - circles_copy[i].y);
            const d = Math.hypot(dx, dy);

            const l = circles_copy[index].r + circles_copy[i].r - d;

            if (l <= 0 || d === 0) continue;

            if (vx1 !== vx2) {
                this.x -= l * (dx / d) * (vx1 / Math.abs(vx2 - vx1));
                circles[i].x -= l * (dx / d) * (vx2 / Math.abs(vx2 - vx1));

                this.vx = ((m1 - m2 * eps) * vx1 + (m2 + m2 * eps) * vx2) / (m1 + m2);
                circles[i].vx = ((m1 + m1 * eps) * vx1 + (m2 - m1 * eps) * vx2) / (m1 + m2);
            }

            if (vy1 !== vy2) {
                this.y -= l * (dy / d) * (vy1 / Math.abs(vy2 - vy1));
                circles[i].y -= l * (dy / d) * (vy2 / Math.abs(vy2 - vy1));

                this.vy = ((m1 - m2 * eps) * vy1 + (m2 + m2 * eps) * vy2) / (m1 + m2);
                circles[i].vy = ((m1 + m1 * eps) * vy1 + (m2 - m1 * eps) * vy2) / (m1 + m2);
            }
        }
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

let circles = [], circles_copy = [];

function createCircle(m = 1, x = 1, y = 1, vx = 0, vy = 0, ax = 0, ay = 0, r = 1) {
    let c = new circle(m, x, y, vx, vy, ax, ay, r);

    circles.push(c);
}

function updatePhysics(dt) {
    for (const c of circles) c.updatePhysics(dt);
    for (const c of circles) c.resolveWalls();

    circles_copy = [...circles];

    for (let i = 0; i < circles.length; i++)
        circles[i].resolveCollision(i);
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

    //ctx.clearRect(0, 0, canvas.width, canvas.height);
    render(ratio);
}

/*
createCircle(1.0, 5, 5, 2.5, 1.2, 0, 0, 0.8);
createCircle(1.5, 10, 8, -1.8, 2.1, 0, 0, 1.2);
createCircle(0.7, 15, 6, 0.5, -2.4, 0, 0, 0.6);
createCircle(2.0, 8, 12, 1.2, -1.1, 0, 0, 1.5);
createCircle(1.2, 13, 10, -2.2, -1.5, 0, 0, 0.9);
createCircle(0.9, 18, 13, -1.0, 1.8, 0, 0, 0.7);
*/

//createCircle(1, 1, 1, 5, 10, 5, -5, 1);
//createCircle(1, 24.6, 1, 10, 5, -5, 5, 1);

createCircle(1, 6, 0, 2, 3, -1, -1, 0.5);
createCircle(1, 24, -6, -1, 4, -1, -1, 0.5);

resize();
requestAnimationFrame(main);
window.addEventListener("resize", resize);