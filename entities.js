import { Sprite } from "./sprite.js";

/* Define tank blueprint */
const Tank = function (xPos, yPos, rotationSpeed, speed, spriteSheetPath, spriteSheetData,) {
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
    // Sprite object
    this.sprite = new Sprite(spriteSheetPath, spriteSheetData, 28, this);

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
const Background = function (image) {
    this.image = image;

    this.render = function (ctx) {
        ctx.drawImage(this.image, 50, 50);
    }

    this.update = function (keysDown, dt) {// does nothing
    }
}

export { Tank, Background };
