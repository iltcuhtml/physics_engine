"use strict";

let lastTime = 0;
let accumulatedTime = 0;
const INTERVAL_DELAY = 1000 / 60; // 60 FPS

let canvas = document.getElementById("canvas"); // 25.6m x 14.4m
let ctx = canvas.getContext("2d");
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

    updateCollisions(index) {
        for (let i = index; i < circles.length; i++) {
            const m1 = this.m, m2 = circles[i].m;
            const vx1 = this.vx, vx2 = circles[i].vx;
            const vy1 = this.vy, vy2 = circles[i].vy;

            const dx = Math.abs(this.x - circles[i].x);
            const dy = Math.abs(this.y - circles[i].y);
            const d = Math.sqrt(dx ** 2 + dy ** 2);
            const l = this.r + circles[i].r - d;

            if ((i === index) & wall_collision) {
                if (this.x - this.r < 0) {
                    this.x = this.r;
                    this.vx = -this.vx * (1 + eps) / 2;
                } else if (this.x + this.r > 25.6) {
                    this.x = 25.6 - this.r;
                    this.vx = -this.vx * (1 + eps) / 2;
                }

                if (this.y - this.r < 0) {
                    this.y = this.r;
                    this.vy = -this.vy * (1 + eps) / 2;
                } else if (this.y + this.r > 14.4) {
                    this.y = 14.4 - this.r;
                    this.vy = -this.vy * (1 + eps) / 2;
                }
            }

            if ((i !== index) & (l > 0)) {
                if (d === 0) {
                    console.log("Collision detected with zero distance between circles");

                    continue;
                }

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
        //ctx.fillText(`vx: ${this.vx.toFixed(2)}`, this.x * ratio - ratio * 1.75, canvas.height - this.y * ratio - ratio * 2.5);
        //ctx.fillText(`vy: ${this.vy.toFixed(2)}`, this.x * ratio - ratio * 1.75, canvas.height - this.y * ratio - ratio * 1.5);
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

createCircle(1.0, 5, 5, 2.5, 1.2, 0, 0, 0.8);
createCircle(1.5, 10, 8, -1.8, 2.1, 0, 0, 1.2);
createCircle(0.7, 15, 6, 0.5, -2.4, 0, 0, 0.6);
createCircle(2.0, 8, 12, 1.2, -1.1, 0, 0, 1.5);
createCircle(1.2, 13, 10, -2.2, -1.5, 0, 0, 0.9);
createCircle(0.9, 18, 14, -1.0, 1.8, 0, 0, 0.7);

requestAnimationFrame(main);