import { Entity } from './entity.js';

// Global MatterJS Variables (to access its useful functions)
var Body = Matter.Body;
var Bodies = Matter.Bodies;

class Turret extends Entity {
    constructor(ss, ssData, fps, initPos) {
        super(
            Bodies.rectangle(initPos.x, initPos.y, 150, 10, {
                isStatic: false,
                frictionAir: 0.1,
                restitution: 0,
                isSensor: false,     // Inactivate body
                //density: 0.005,
                //friction: 0,
                //inverseInertia: 1,
                //inertia: Infinity,
                //frictionStatic: 2,
                //render: { fillStyle: "white" }
            }),
            true
        );
        this.speed = 45;

        // Variables used for rendering this object
        this.index = 0;
        this.framesPerSecond = fps;
        this.timeTracker = 0;
        this.spriteSheetData = ssData;
        this.spriteSheet = ss;
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

    updateThis(keysDown, dt) {
        // Rotate
        if (keysDown && keysDown.KeyD == true) {
            Body.rotate(this.body, 0.00872665);
            //this.body.torque = 10;
        }
        if (keysDown && keysDown.KeyA == true) {
            Body.rotate(this.body, -0.00872665);
            //this.body.torque = -10;
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

export { Turret };