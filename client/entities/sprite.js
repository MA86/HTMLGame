class Sprite extends window.globals.entityModule.Entity {
    constructor(pos, rot, ss, ssData, framesPerSecond, repeatNum, id, parent = null, clientID) {
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
        this.clientID = clientID;
        this.animationID = id;
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

    updateThis(keysDown, dt) {
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
        let indexOfSprite = window.globals.entities.findIndex(function (obj) {
            if (obj instanceof Sprite && thiss.animationID == obj.animationID) {
                return true;
            }
        });
        window.globals.entities.splice(indexOfSprite, 1);
    }
}

export { Sprite };