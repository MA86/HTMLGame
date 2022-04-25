import { Entity } from './entity.js';

class Sprite extends Entity {
    constructor(pos, rot, ss, ssData, framesPerSecond, repeatNum, id, parent = null) {
        super(pos, rot, parent);

        // Variables used for rendering
        this.index = 0;
        this.framesPerSecond = framesPerSecond;
        this.timeTracker = 0;
        this.spriteSheetData = ssData;
        this.spriteSheet = ss;
        this.numberOfTimeToRepeat = repeatNum;
        this.timesPlayed = 0;
        this.resize = 2;
        // Properties
        this.parent = parent;
        this.id = id;
    }
    renderThis(ctx) {
        let frameCenter = {
            "x": (this.spriteSheetData.frames[this.index].frame.w * this.resize) / 2,
            "y": (this.spriteSheetData.frames[this.index].frame.h * this.resize) / 2
        };

        ctx.drawImage(
            this.spriteSheet,
            this.spriteSheetData.frames[this.index].frame.x,
            this.spriteSheetData.frames[this.index].frame.y,
            this.spriteSheetData.frames[this.index].frame.w,
            this.spriteSheetData.frames[this.index].frame.h,
            -frameCenter.x,
            -frameCenter.y,
            this.spriteSheetData.frames[this.index].frame.w * this.resize,
            this.spriteSheetData.frames[this.index].frame.h * this.resize
        );
    }

    updateThis(keysDown, dt, keysUp) {
        // Update index
        this.timeTracker += dt;
        let delay = 1 / this.framesPerSecond;
        if (this.timeTracker >= delay) {
            // Update
            this.index += 1;

            // If index refers to last frame...
            if (this.index == this.spriteSheetData.frames.length) {
                // Count as one play
                this.timesPlayed++;
            }

            this.index = this.index % this.spriteSheetData.frames.length;
            this.timeTracker = 0;
        }

        if (this.timesPlayed == this.numberOfTimeToRepeat) {
            this.removeSelfFromList();
        }
    }

    removeSelfFromList() {
        let thiss = this;
        let indexOfShell = window.globals.entities.findIndex(function (obj) {
            // If it has shellID check by shellID, else check by clientID
            if ("shellID" in obj && thiss.id == obj.shellID) {
                return true;
            } else if (thiss.id == obj.clientID) {
                return true;
            }
        });
        window.globals.entities.splice(indexOfShell, 1);
    }
}

export { Sprite };