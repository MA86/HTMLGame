import { Entity } from "./entity.js";


class Shell extends Entity {
    constructor(ss, ssData, fps) {
        super({ "x": 0, "y": 0 }, 0, false);

        // Variables used for rendering this object
        this.index = 0;
        this.framesPerSecond = fps;
        this.timeTracker = 0;
        this.spriteSheetData = ssData;
        this.spriteSheet = ss;
        // TODO
        let thiss = this;
        window.globals.clientSocket.on("render coordinates", function (coordinates) {
            thiss.position = coordinates.position;
            thiss.angle = coordinates.angle;
        });
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