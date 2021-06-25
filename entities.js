import { Sprite } from "./sprite.js";

/* Define tank blueprint */
const Tank = function (xPos, yPos, rotationSpeed, speed, spriteSheetPath, spriteSheetData) {
    // Initialize all attributes
    this.position = {
        "x": xPos,
        "y": yPos
    };
    // In pixels per second
    this.speed = speed;
    // In degrees
    this.rotation = { "r": 0 };
    // In degrees per second
    this.rotationSpeed = rotationSpeed;
    this.sprite = new Sprite(spriteSheetPath, spriteSheetData, 1, this);

    this.render = function (ctx) {
        this.sprite.render(ctx);
    }

    this.update = function (keysDown, dt) {
        this.sprite.update(keysDown, dt);

        let rotationInRadian = this.rotation.r * Math.PI / 180;
        let dx = Math.cos(rotationInRadian) * (this.speed * dt);
        let dy = Math.sin(rotationInRadian) * (this.speed * dt);

        // Move forward/backward
        if (keysDown.ArrowUp == true) {
            this.position.x += dx;
            this.position.y += dy;
        }
        if (keysDown.ArrowDown == true) {
            this.position.x -= dx;
            this.position.y -= dy;
        }

        // Rotate right/left
        if (keysDown.ArrowRight == true) {
            this.rotation.r += this.rotationSpeed * dt;
        }
        if (keysDown.ArrowLeft == true) {
            this.rotation.r -= this.rotationSpeed * dt;
        }
        // Wrap around
        this.rotation.r = this.rotation.r % 360;
    }
}

/* Define background blueprint */
const Background = function (spriteSheetPath, spriteSheetData) {
    // TODO: implement "Animated Background" if possible, instead of static picture.
    // Careful though, running it like sprites can eat lots of memory.
    // Instead use efficient techniques to do this type of animation, like changing
    // pixels in png to simulate starry night! or 'localized' animation.
    // Read up scrolling background too. (aka parallax)

    // Ask what settings for one frame spritesheet.
    
    this.sprite = new Sprite(spriteSheetPath, spriteSheetData, 1);

    this.render = function (ctx) {
        this.sprite.render(ctx);
    }

    this.update = function (keysDown, dt) {
        // Does nothing
    }
}

export { Tank, Background };
