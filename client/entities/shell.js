import { Entity } from "./entity.js";

// Global MatterJS Variables (to access its useful functions)
var Body = Matter.Body;
var Bodies = Matter.Bodies;

class Shell extends Entity {
    constructor(ss, ssData, fps, turret, options) {
        super(
            Bodies.rectangle(turret.body.position.x, turret.body.position.y, 20, 4, {
                isStatic: false,
                isSensor: false,
                //density: 1,
                render: { fillStyle: "white" }
            }),
            false
        );

        // Shell options
        this.clientId = turret.clientId;
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

        // Prepare a directional force vector
        this.fdx = Math.cos(turret.body.angle + turret.parent.body.angle) * this.speed;
        this.fdy = Math.sin(turret.body.angle + turret.parent.body.angle) * this.speed;

        // Prepare a directional position vector
        this.pdx = Math.cos(turret.body.angle + turret.parent.body.angle) * 140;
        this.pdy = Math.sin(turret.body.angle + turret.parent.body.angle) * 140;

        // Add two vectors to create a new position vector for Shell
        Body.setPosition(
            this.body,
            { x: this.pdx + turret.body.position.x, y: this.pdy + turret.body.position.y }
        );
        // Set Shell's angle to Turret's angle.
        Body.setAngle(this.body, turret.body.angle + turret.parent.body.angle);

        /*
        // This Shell's representation in another browser is set by the server
        let thisShell = this;
        window.globals.clientSocket.on("shell movement", function (data) {
            if (thisShell.clientId == data.clientId && thisShell.clientId != window.globals.clientSocket.id) {
                Body.applyForce(
                    thisShell.body,
                    { x: thisShell.body.position.x, y: thisShell.body.position.y },
                    { x: data.shellForce.x, y: data.shellForce.y }
                );
            }
        });
        */
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
        //if (this.clientId == window.globals.clientSocket.id) {
        this.detonate(dt);

        // Report to server the force applied
        //window.globals.clientSocket.emit(
        //"shell movement",
        //{ "clientId": this.clientId, "shellForce": { x: this.fdx * dt, y: this.fdy * dt } }
        //);
        //}

        // Update index
        this.timeTracker += dt;
        let delay = 1 / this.framesPerSecond;
        if (this.timeTracker >= delay) {
            this.index += 1;
            this.index = this.index % this.spriteSheetData.frames.length;
            this.timeTracker = 0;
        }
    }

    detonate(dt) {
        // Apply force to shell one time
        let thisShell = this;
        if (!thisShell.detonated) {
            Body.applyForce(
                thisShell.body,
                { x: thisShell.body.position.x, y: thisShell.body.position.y },
                { x: thisShell.fdx, y: thisShell.fdy }
            );
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