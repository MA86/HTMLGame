/* Define sprite animatation blueprint */
const Sprite = function (spriteSheet, spriteSheetData, framesPerSecond) {
    this.index = 0;
    this.spriteSheetData = spriteSheetData;
    this.spriteSheet = spriteSheet;
    this.framesPerSecond = framesPerSecond;
    this.rotation = 45;
    this.position = {
        "x": 100,
        "y": 100
    };
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
        ctx.rotate(this.rotation * Math.PI / 180);
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
        this.timeTracker += dt;
        let delay = 1 / this.framesPerSecond;
        if (this.timeTracker >= delay) {
            // Update index
            this.index += 1;
            // Wrap index
            this.index = this.index % this.spriteSheetData.frames.length;
            this.timeTracker = 0;
        }
    }
}

export { Sprite };

