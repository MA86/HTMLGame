import { Entity } from './entity.js';

class Turret extends Entity {
    constructor(ss, ssData, fps, parent, Bodies) {
        super(
            Bodies.rectangle(parent.body.position.x, parent.body.position.y, 200, 12, {
                isStatic: false,
                frictionAir: 0.1,
                restitution: 0,
                isSensor: true,     // Inactivate body
                //density: 0.005,
                //friction: 0,
                //inverseInertia: 1,
                //inertia: Infinity,
                //frictionStatic: 2,
                //render: { fillStyle: "white" }
            }),
            true
        );
        this.parent = parent;
        this.angle = 0;
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

    updateThis(keysDown, dt, Body, ctx) {
        //TODO
        Body.setPosition(this.body, this.parent.body.position);
        Body.setAngle(this.body, 0);
        Body.rotate(this.body, this.parent.body.angle);

        // Rotate
        if (keysDown && keysDown.KeyD == true) {
            this.body.torque = 0.1;
        }
        if (keysDown && keysDown.KeyA == true) {
            this.body.torque = -0.1;
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