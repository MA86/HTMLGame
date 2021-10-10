import { Entity } from "./entity.js";

// Global MatterJS Variables (to access its useful functions)
var Body = Matter.Body;
var Bodies = Matter.Bodies;

class Shell extends Entity {
    constructor(ss, ssData, fps, cannon, options) {
        super(
            Bodies.rectangle(cannon.position.x, cannon.position.y + 100, 220, 4, {
                isStatic: false,
                isSensor: false
            }),
            false
        );

        // Properties of cannon
        this.speed = options.speed;
        this.type = options.type;
        this.blastRadius = options.blastRadius;
        this.penetration = options.penetration;

        this.position;
        this.angle = 3;

        // Variables used for rendering this object
        this.index = 0;
        this.framesPerSecond = fps;
        this.timeTracker = 0;
        this.spriteSheetData = ssData;
        this.spriteSheet = ss;
        // TODO: remove wait time from shell!

        // Prepare a vector in the direction of fire
        let dx = Math.cos(this.angle) * (this.speed * dt);
        let dy = Math.sin(this.angle) * (this.speed * dt);
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
        // Update index
        this.timeTracker += dt;
        let delay = 1 / this.framesPerSecond;
        if (this.timeTracker >= delay) {
            this.index += 1;
            this.index = this.index % this.spriteSheetData.frames.length;
            this.timeTracker = 0;
        }
    }

    detonate() {
        //TODO
        Body.applyForce(
            this.body,
            { x: this.body.position.x, y: this.body.position.y },
            { x: dx, y: dy }
        );
    }

    animate() {

    }

    onImpact() {
        // Event?
    }
}

export { Shell };