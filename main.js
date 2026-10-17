"use strict";

let lastTime = 0;
let accumulatedTime = 0;
const INTERVAL_DELAY = 1000 / 60; // 60 FPS

let canvas = document.getElementById("canvas"); // 25.6m x 14.4m
let ctx = canvas.getContext("2d");
let ratio = 100;

let eps = 1;

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

    updateCollisions(index) {
        for (let i = index + 1; i < circles.length; i++) {
            const m1 = circles[index].m, m2 = circles[i].m;
            const vx1 = circles[index].vx, vx2 = circles[i].vx;
            const vy1 = circles[index].vy, vy2 = circles[i].vy;

            const dx = Math.abs(circles[i].x - circles[index].x);
            const dy = Math.abs(circles[i].y - circles[index].y);
            const d = Math.sqrt(dx ** 2 + dy ** 2);
            const l = circles[index].r + circles[i].r - d;

            if (l > 0) {
                if (d === 0) {
                    console.log("Collision detected with zero distance between circles");

                    continue;
                }

                if (vx1 !== vx2) {
                    circles[index].x -= l * (dx / d) * (vx1 / Math.abs(vx2 - vx1));
                    circles[i].x -= l * (dx / d) * (vx2 / Math.abs(vx2 - vx1));

                    circles[index].vx = ((m1 - m2 * eps) * vx1 + (m2 + m2 * eps) * vx2) / (m1 + m2);
                    circles[i].vx = ((m1 + m1 * eps) * vx1 + (m2 - m1 * eps) * vx2) / (m1 + m2);
                }

                if (vy1 !== vy2) {
                    circles[index].y -= l * (dy / d) * (vy1 / Math.abs(vy2 - vy1));
                    circles[i].y -= l * (dy / d) * (vy2 / Math.abs(vy2 - vy1));

                    circles[index].vy = ((m1 - m2 * eps) * vy1 + (m2 + m2 * eps) * vy2) / (m1 + m2);
                    circles[i].vy = ((m1 + m1 * eps) * vy1 + (m2 - m1 * eps) * vy2) / (m1 + m2);
                }
            }
        }
    }

    render(ratio) {
        ctx.beginPath();
        ctx.arc(this.x * ratio, canvas.height - this.y * ratio, this.r * ratio, 0, 2 * Math.PI);
        ctx.fillStyle = "blue";
        ctx.fill();
        ctx.stroke();
    }

    render(index, ratio) {
        ctx.beginPath();
        ctx.arc(this.x * ratio, canvas.height - this.y * ratio, this.r * ratio, 0, 2 * Math.PI);
        ctx.fillStyle = "blue";
        ctx.fill();
        ctx.stroke();

        ctx.font = `${ratio}px Arial`;
        ctx.fillStyle = 'red';
        ctx.fillText(index, this.x * ratio - ratio * 0.275, canvas.height - this.y * ratio + ratio * 0.275);
        ctx.fillText(`vx: ${this.vx.toFixed(2)}`, this.x * ratio - ratio * 1.75, canvas.height - this.y * ratio - ratio * 2.5);
        ctx.fillText(`vy: ${this.vy.toFixed(2)}`, this.x * ratio - ratio * 1.75, canvas.height - this.y * ratio - ratio * 1.5);
    }
}

let circles = [], circles_copy = [];

function createCircle(m = 1, x = 1, y = 1, vx = 0, vy = 0, ax = 0, ay = 0, r = 1) {
    let c = new circle(m, x, y, vx, vy, ax, ay, r);

    circles.push(c);
}

function updatePhysics(dt) {
    for (let i = 0; i < circles.length; i++) {
        circles[i].updatePhysics(dt);
    }

    for (let i = 0; i < circles.length; i++) {
        circles[i].updateCollisions(i);
    }
}

function render(ratio) {
    for (let i = 0; i < circles.length; i++) {
        circles[i].render(i, ratio);
    }
}

function main(timestamp) {
    requestAnimationFrame(main);

    if (!lastTime) {
        lastTime = timestamp;

        return;
    }

    const dt = timestamp - lastTime;
    lastTime = timestamp
    accumulatedTime += dt;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    ratio = Math.min(canvas.width / 2560, canvas.height / 1440) * 100;

    while (accumulatedTime >= INTERVAL_DELAY) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        updatePhysics(INTERVAL_DELAY / 1000);

        accumulatedTime -= INTERVAL_DELAY;
    }

    render(ratio);
}
createCircle(1, 2, 7.2, 3, 0, 0, 0, 1);
createCircle(1, 10, 7.2, 0, 0, 0, 0, 1);
createCircle(1, 16, 7.2, -2, 0, 0, 0, 1);

requestAnimationFrame(main);