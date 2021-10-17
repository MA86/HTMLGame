import { Entity } from "./entity.js";

// Global MatterJS Variables (to access its useful functions)
var Body = Matter.Body;
var Bodies = Matter.Bodies;

class Shell extends Entity {
    constructor(ss, ssData, fps, cannon, options) {
        super(
            Bodies.rectangle(cannon.position.x, cannon.position.y, 220, 4, {
                isStatic: false,
                isSensor: false
            }),
            false // Remove
        );

        // Shell options
        // TODO: this.clientId = parent?
        this.speed = options.speed;
        this.type = options.type;
        this.blastRadius = options.blastRadius;
        this.penetration = options.penetration;

        this.detonated = false;

        // Variables used for rendering this object
        this.index = 0;
        this.framesPerSecond = fps;
        this.timeTracker = 0;
        this.spriteSheetData = ssData;
        this.spriteSheet = ss;

        // TODO: remove wait time from shell!

        // Prepare a force vector in the direction of fire
        this.fdx = Math.cos(cannon.angle) * (this.speed * dt);
        this.fdy = Math.sin(cannon.angle) * (this.speed * dt);

        // TODO: Prepare a position vector in front of the turret
        this.pdx = Math.cos(cannon.angle) * 100;
        this.pdy = Math.sin(cannon.angle) * 100;
        Body.setPosition(this.body, { x: this.pdx, y: this.pdy });
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
        this.detonate();

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
        let thisShell = this;
        if (thisShell.detonated = false) {
            Body.applyForce(
                thisShell.body,
                { x: thisShell.body.position.x, y: thisShell.body.position.y },
                { x: thisShell.fdx, y: thisShell.fdy }
            );
            // It's now detonated
            thisShell.detonated = true;
        }
    }

    onImpact() {
        // Destroy this shell.
        // Remove this shell from world
        // Remove this shell from cannon parent
    }
}

export { Shell };