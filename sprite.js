/* Define sprite animatation blueprint */
const Sprite = function (images, framesPerSecond) {
    this.index = 0;
    this.images = images;
    this.framesPerSecond = framesPerSecond;
    this.timeTracker = 0;

    this.render = function (ctx) {
        ctx.save();
        //ctx.translate(this.position.x + spriteCenter.x, this.position.y + spriteCenter.y);
        //ctx.rotate(this.rotation * Math.PI / 180);
        ctx.drawImage(this.images[this.index], 0, 0);
        ctx.restore();
    }

    this.update = function (keysDown, dt) {
        this.timeTracker += dt;
        let delay = 1 / this.framesPerSecond;
        if (this.timeTracker >= delay) {
            this.index += 1;

            // Wrap index
            this.index = this.index % this.images.length;
            this.timeTracker = 0;
        }
    }
}

export { Sprite };

