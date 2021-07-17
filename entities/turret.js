import { Entity } from './entity.js';
import { Sprite } from './sprite.js';

class Turret extends Entity {
    constructor(pos, rot, parent, spriteSheet, ssData) {
        super(pos, rot, parent);
        this.rotationSpeed = 20;
        this.children.push(
            new Sprite({ "x": 0, "y": 0 }, 0, this, spriteSheet, ssData, 0)
        );
    }

    updateThis(keysDown, dt) {
        // EMIT to server...
        // Rotate
        if (keysDown && keysDown.KeyD == true) {
            this.rotation += this.rotationSpeed * dt;
        }
        if (keysDown && keysDown.KeyA == true) {
            this.rotation -= this.rotationSpeed * dt;
        }
        // Wrap around
        this.rotation = this.rotation % 360;
    }
}

export { Turret };