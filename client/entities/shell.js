import { Entity } from "./entity";

// Global MatterJS Variables (to access its useful functions)
var Body = Matter.Body;

class Shell extends Entity {
    constructor(ss, ssData, fps, cannon, options) {
        super(
            Bodies.rectangle(cannon.body.x, cannon.body.y, 50, 20, {
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
        if (true) {
            Body.applyForce(
                this.body,
                { x: this.body.position.x, y: this.body.position.y },
                { x: 0.1, y: 0.1 }
            );
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

    renderThis() {
        // Render animation as usual
    }

    updateThis() {
        // Physics
    }
}