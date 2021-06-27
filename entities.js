"use strict";

import * as spriteSheetsData from './spritesheetsData.js';
import { Sprite } from "./sprite.js";

/* Define tank blueprint */
const Tank = function (xPos, yPos, rotationSpeed, speed, spriteSheetPath, spriteSheetData) {
    // Initialize attributes
    this.position = {
        "x": xPos,
        "y": yPos
    };

    this.speed = speed;             // Unit: PPS       
    this.rotation = { "r": 0 };     // Unit: degrees
    this.rotationSpeed = rotationSpeed;     // Unit: DPS 
    this.sprite = new Sprite(spriteSheetPath, spriteSheetData, 0, this);
    this.turret = new Turret(
        this.position,
        50,
        "images/mSixTankTurret.png",
        spriteSheetsData.mSixTankTurretData,
        this.rotation
    );

    this.render = function (ctx) {
        this.sprite.render(ctx);
        this.turret.render(ctx);
    }

    this.update = function (keysDown, dt) {
        this.sprite.update(keysDown, dt);
        this.turret.update(keysDown, dt);

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
const Turret = function (position, rotationSpeed, spriteSheetPath, spriteSheetData, parentRotation) {
    this.position = position;
    this.rotation = { "r": 0 };
    this.parentRotation = parentRotation;
    this.rotationSpeed = rotationSpeed;
    this.rotateBy = 0;
    this.sprite = new Sprite(spriteSheetPath, spriteSheetData, 0, this);

    this.render = function (ctx) {
        this.sprite.render(ctx);
    }

    this.update = function (keysDown, dt) {
        this.sprite.update(keysDown, dt);

        // Rotate relative to parent 
        this.rotation.r = this.parentRotation.r + this.rotateBy;

        // Set rotateBy
        if (keysDown.KeyD == true) {
            this.rotateBy += this.rotationSpeed * dt;
        }
        if (keysDown.KeyA == true) {
            this.rotateBy -= this.rotationSpeed * dt;
        }
        // Wrap around
        this.rotation.r = this.rotation.r % 360;
        this.rotateBy = this.rotateBy % 360;
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
