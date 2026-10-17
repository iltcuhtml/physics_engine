"use strict";

let lastTime = 0;
let accumulatedTime = 0;
const INTERVAL_DELAY = 1000 / 60; // 60 FPS

let canvas = document.getElementById("canvas"); // 25.6m x 14.4m
let ctx = canvas.getContext("2d");
let ratio = 100;

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
            let dx = Math.abs(this.x - circles[i].x);
            let dy = Math.abs(this.y - circles[i].y);

            let d = Math.sqrt(dx ** 2 + dy ** 2);
            let l = this.r + circles[i].r - d;

            if (l > 0) {
                if (d === 0) {
                    console.log("Collision detected with zero distance between circles");

                    continue;
                }

                if (this.vx !== circles[i].vx) {
                    this.x -= l * (dx / d) * (this.vx / Math.abs(this.vx - circles[i].vx));
                    circles[i].x -= l * (dx / d) * (circles[i].vx / Math.abs(this.vx - circles[i].vx));
                }

                if (this.vy !== circles[i].vy) {
                    this.y += l * (dy / d) * (this.vy / Math.abs(this.vy - circles[i].vy));
                    circles[i].y += l * (dy / d) * (circles[i].vy / Math.abs(this.vy - circles[i].vy));
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

let circles = [];

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

createCircle(1,    2, 3.6,    0, 19.6, 0, -9.8, 1);
createCircle(1,    4, 3.6,  6.4, 19.6, 0, -9.8, 1);
createCircle(1, 21.6, 3.6, -6.4, 19.6, 0, -9.8, 1);

requestAnimationFrame(main);