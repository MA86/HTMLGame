import { Entity } from './entity.js';
import { Sprite } from './sprite.js';
import { Turret } from './turret.js';

class Tank extends Entity {
    constructor(pos, rot, parent, spriteSheet, ssData) {
        super(pos, rot, parent);
        this.speed = 70;             // Unit: PPS       
        this.rotationSpeed = 20;     // Unit: DPS
        this.children.push(
            new Sprite({ "x": 0, "y": 0 }, 0, this, spriteSheet.tank, ssData.mSixTankBodyData, 0)
        );
        this.children.push(
            new Turret({ "x": 0, "y": 0 }, 0, this, spriteSheet.turret, ssData.mSixTankTurretData, 0)
        );
    }

    updateThis(keysDown, dt, socket) {
        let rotationInRadian = this.rotation * Math.PI / 180;
        let dx = Math.cos(rotationInRadian) * (this.speed * dt);
        let dy = Math.sin(rotationInRadian) * (this.speed * dt);

        // EMIT to server...
        // Forward/backward
        if (keysDown && keysDown.ArrowUp == true) {
            this.position.x += dx;
            this.position.y += dy;
            socket.emit("tank position", this.position);
        }
        if (keysDown && keysDown.ArrowDown == true) {
            this.position.x -= dx;
            this.position.y -= dy;
            socket.emit("tank position", this.position);
        }

        // Rotate right/left
        if (keysDown && keysDown.ArrowRight == true) {
            this.rotation += this.rotationSpeed * dt;
            socket.emit("tank rotation", this.rotation);
        }
        if (keysDown && keysDown.ArrowLeft == true) {
            this.rotation -= this.rotationSpeed * dt;
            socket.emit("tank rotation", this.rotation);
        }
        // Wrap around
        this.rotation = this.rotation % 360;
    }
}

export { Tank };