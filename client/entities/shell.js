import { Entity } from "./entity.js";

// Global MatterJS Variables (to access its useful functions)
var Body = Matter.Body;
var Bodies = Matter.Bodies;

class Shell extends Entity {
    constructor(ss, ssData, fps, cannon, options) {
        super(
            Bodies.rectangle(cannon.position.x, cannon.position.y + 100, 50, 20, {
                isStatic: false,
                isSensor: true
            }),
            false
        );

        // Properties of cannon
        this.cannon = cannon;
        this.speed = options.speed;
        this.type = options.type;
        this.blastRadius = options.blastRadius;
        this.penetration = options.penetration;

        // Variables used for rendering this object
        this.index = 0;
        this.framesPerSecond = fps;
        this.timeTracker = 0;
        this.spriteSheetData = ssData;
        this.spriteSheet = ss;

        // TEST
        this.flag = true;
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
        if (this.flag) {
            // Prepare a vector in the direction of cannon
            let dx = Math.cos(this.cannon.angle) * (this.speed * dt);
            let dy = Math.sin(this.cannon.angle) * (this.speed * dt);

            Body.applyForce(
                this.body,
                { x: this.body.position.x, y: this.body.position.y },
                { x: 0.2, y: 0.2 }
            );
            this.flag = false;
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

    animation() {

    }

    onImpact() {
        // Event?
    }
}

export { Shell };