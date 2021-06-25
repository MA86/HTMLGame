"use strict";

import { Sprite } from "./sprite.js";

/* Define tank blueprint */
const Tank = function (xPos, yPos, rotationSpeed, speed, spriteSheetPath, spriteSheetData) {
    // Initialize attributes
    this.position = {
        "x": xPos,
        "y": yPos
    };
    // Unit: PPS
    this.speed = speed;
    // Unit: degrees
    this.rotation = { "r": 0 };
    // Unit: DPS 
    this.rotationSpeed = rotationSpeed;
    this.sprite = new Sprite(spriteSheetPath, spriteSheetData, 0, this);
    this.turret = new Turret(
        this.position,
        this.rotation.r,
        50,
        "images/mSixTankTurret.png",
        spriteSheetsData.mSixTankTurretData
    );

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

/* Define turret blueprint */
const Turret = function (position, rotation, rotationSpeed, spriteSheetPath, spriteSheetData) {
    this.position = position;
    this.rotation = rotation;
    this.rotationSpeed = rotationSpeed;
    this.sprite = new Sprite(spriteSheetPath, spriteSheetData, 0, this);

    this.render = function (ctx) {
        //TODO
        this.sprite.render(ctx);
    }

    this.update = function (keysDown, dt) {
        //TODO
        // Rotate right/left
        if (keysDown.KeyD == true) {
            this.rotation += this.rotationSpeed * dt;
            console.log(keysDown.KeyD);
        }
        if (keysDown.KeyA == true) {
            this.rotation -= this.rotationSpeed * dt;

        }
        // Wrap around
        this.rotation = this.rotation % 360;
    }
}

/* Define background blueprint */
const Background = function (spriteSheetPath, spriteSheetData) {
    this.sprite = new Sprite(spriteSheetPath, spriteSheetData, 1);

    this.render = function (ctx) {
        this.sprite.render(ctx);
    }

    this.update = function (keysDown, dt) {
        // Does nothing
    }
}

export { Tank, Turret, Background };
