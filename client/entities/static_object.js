import { Entity } from "./entity.js";

class StaticObject extends Entity {
    constructor(posVec, angle, ss, ssData, fps, clientID, id) {
        super({ "x": 0, "y": 0 }, 0, false);

        // Variables used for rendering this object
        this.index = 0;
        this.framesPerSecond = fps;
        this.timeTracker = 0;
        this.spriteSheetData = ssData;
        this.spriteSheet = ss;

        // Properties
        this.clientID = clientID;
        this.staticObjectID = id;
        this.position = posVec;
        this.angle = angle;
        this.drawnOnce = false;

        window.globals.staticEntities.push(this);

        // Listen for destroy shell
        let thiss = this;
        window.globals.clientSocket.on("destroy static object", function (data) {
            // Check if the message is for this static object
            if (thiss.clientID == data.clientID && thiss.staticObjectID == data.staticObjectID) {
                // Remove shell from entities list
                thiss.removeSelfFromList();
            }
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

        // PERFORMANCE TODO: Draw once
        this.drawnOnce = true;
    }

    updateThis(keysDown, dt) {
        // Update animation index
        this.timeTracker += dt;
        let delay = 1 / this.framesPerSecond;
        if (this.timeTracker >= delay) {
            this.index += 1;
            this.index = this.index % this.spriteSheetData.frames.length;
            this.timeTracker = 0;
        }
    }

    animateAfterDestruction() {
        // OPTIONAL TODO: Copy from client's Shell class
    }

    removeSelfFromList() {
        let thiss = this;

        // Find index of this shell and remove it from list
        let indexOfStaticObject = window.globals.entities.findIndex(function (obj) {
            if (thiss.clientID == obj.clientID && thiss.staticObjectID == obj.staticObjectID) {
                return true;
            }
        });
        window.globals.staticEntities.splice(indexOfStaticObject, 1);
    }
}

export { StaticObject };