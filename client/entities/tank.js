import { Entity } from './entity.js';
import { Turret } from './turret.js';

class Tank extends Entity {
    constructor(ss, ssData, fps, Bodies) {
        super(
            Bodies.rectangle(100, 100, 225, 100, {
                isStatic: false,
                frictionAir: 0.9,
                restitution: 0.1,
                //density: 0.002,
                //friction: 1,
                //inverseInertia: 1,
                //inertia: Infinity,
                //frictionStatic: 2,
                // render: { fillStyle: "white" }
            }),
            false
        );
        this.children.push(
            new Turret(
                ss.turret,
                ssData.turretData,
                0,
                this,
                Bodies
            )
        );
        this.speed = 6;
        this.rotationSpeed = 380;

        // Variables used for rendering this object
        this.index = 0;
        this.framesPerSecond = fps;
        this.timeTracker = 0;
        this.spriteSheetData = ssData.tankData;
        this.spriteSheet = ss.tank;
    }

    renderThis(ctx) {
        let ctxCenter = {
            "x": this.spriteSheetData.frames[this.index].frame.w / 2,
            "y": this.spriteSheetData.frames[this.index].frame.h / 2
        };
        ctx.drawImage(
            this.spriteSheet,
            this.spriteSheetData.frames[this.index].frame.x,
            this.spriteSheetData.frames[this.index].frame.y,
            this.spriteSheetData.frames[this.index].frame.w,
            this.spriteSheetData.frames[this.index].frame.h,
            -ctxCenter.x,
            -ctxCenter.y,
            this.spriteSheetData.frames[this.index].frame.w,
            this.spriteSheetData.frames[this.index].frame.h
        );
    }

    updateThis(keysDown, dt, Body) {
        // Prepare a force vector
        let dx = Math.cos(this.body.angle) * (this.speed * dt);
        let dy = Math.sin(this.body.angle) * (this.speed * dt);

        // Apply the force vector for forward/backward movement
        if (keysDown && keysDown.ArrowUp == true) {
            Body.applyForce(
                this.body,
                { x: this.body.position.x, y: this.body.position.y },
                { x: dx, y: dy }
            );
        }
        if (keysDown && keysDown.ArrowDown == true) {
            Body.applyForce(
                this.body,
                { x: this.body.position.x, y: this.body.position.y },
                { x: -dx, y: -dy }
            );
        }

        // Right/left
        if (keysDown && keysDown.ArrowRight == true) {
            this.body.torque = this.rotationSpeed * dt;
        }
        if (keysDown && keysDown.ArrowLeft == true) {
            this.body.torque = -this.rotationSpeed * dt;
        }

        // Update index
        this.timeTracker += dt;
        let delay = 1 / this.framesPerSecond;
        if (this.timeTracker >= delay) {
            this.index += 1;
            this.index = this.index % this.spriteSheetData.frames.length;
            this.timeTracker = 0;
        }
    }
}

export { Tank };