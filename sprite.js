"use strict";

/* Define sprite animatation blueprint */
const Sprite = function (spriteSheetPath, spriteSheetData, framesPerSecond, entity = null) {
    // TODO: Handle one frame spritesheet case.
    // Initialize all attributes
    this.spriteSheetData = spriteSheetData;
    this.spriteSheet = new Image();
    this.spriteSheet.src = spriteSheetPath;
    this.index = 0;
    this.framesPerSecond = framesPerSecond;
    this.rotation = (entity == null) ? 0 : entity.rotation;
    this.position = (entity == null) ? { "x": 0, "y": 0 } : entity.position;
    this.timeTracker = 0;

    this.render = function (ctx) {
        let frameCenter = {
            "x": this.spriteSheetData.frames[this.index].frame.w / 2,
            "y": this.spriteSheetData.frames[this.index].frame.h / 2
        };
        ctx.save();
        ctx.translate(
            this.position.x,
            this.position.y
        );
        ctx.rotate(this.rotation.r * Math.PI / 180);
        ctx.drawImage(
            this.spriteSheet,
            this.spriteSheetData.frames[this.index].frame.x,
            this.spriteSheetData.frames[this.index].frame.y,
            this.spriteSheetData.frames[this.index].frame.w,
            this.spriteSheetData.frames[this.index].frame.h,
            -frameCenter.x,
            -frameCenter.y,
            this.spriteSheetData.frames[this.index].frame.w,
            this.spriteSheetData.frames[this.index].frame.h
        );
        ctx.restore();
    }

    this.update = function (keysDown, dt) {
        // Update index
        this.timeTracker += dt;
        let delay = 1 / this.framesPerSecond;
        if (this.timeTracker >= delay) {
            this.index += 1;
            this.index = this.index % this.spriteSheetData.frames.length;
            this.timeTracker = 0;
        }
    }
}

export { Sprite };

