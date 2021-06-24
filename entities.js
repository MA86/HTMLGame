/* Define tank blueprint */
const Tank = function (xPos, yPos, rotationSpeed, speed, sprite) {
    // Initialize all attributes
    this.position = {
        "x": xPos,
        "y": yPos
    };
    // In pixels per second
    this.speed = speed;
    // In degrees
    this.rotation = 0;
    // In degrees per second
    this.rotationSpeed = rotationSpeed;
    // Image object
    this.sprite = sprite;

    this.render = function (ctx) {
        
    }

    this.update = function (keysDown, dt) {
        let rotationInRadian = this.rotation * Math.PI / 180;
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
            this.rotation += this.rotationSpeed * dt;
        }
        if (keysDown.ArrowLeft == true) {
            this.rotation -= this.rotationSpeed * dt;
        }
        // Wrap around
        this.rotation = this.rotation % 360;
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
