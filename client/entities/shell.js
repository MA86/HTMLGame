import { Entity } from "./entity.js";

// Global MatterJS Variables (to access its useful functions)
var Body = Matter.Body;
var Bodies = Matter.Bodies;

class Shell extends Entity {
    constructor(ss, ssData, fps, turret, options) {
        super(
            Bodies.rectangle(turret.body.position.x, turret.body.position.y, 20, 4, {
                isStatic: false,
                isSensor: false
            }),
            false
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

        // TODO: 
        // write vector additions more clear for understanding.
        // NEW: create an independent shell which is an entity, adds itself to entities array on fire!

        // TODO: add dt. Prepare a force vector in the direction of fire
        this.fdx = Math.cos(turret.body.angle + turret.parent.body.angle) * (this.speed);
        this.fdy = Math.sin(turret.body.angle + turret.parent.body.angle) * (this.speed);

        // TODO: Prepare a position vector in front of the turret
        // PROBLEM: does not fire straight when tank rotates.
        this.pdx = Math.cos(turret.body.angle + turret.parent.body.angle) * 140;
        this.pdy = Math.sin(turret.body.angle + turret.parent.body.angle) * 140;

        // Add the Shell's spawn vec to Turret's position vec, set Shell at that pos.
        Body.setPosition(
            this.body,
            { x: this.pdx + turret.body.position.x, y: this.pdy + turret.body.position.y }
        );
        // Set Shell's angle to Turret's angle.
        Body.setAngle(this.body, turret.body.angle + turret.parent.body.angle);
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
        if (!thisShell.detonated) {
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