import { Entity } from './entity.js';
import { Sprite } from './sprite.js';

class Turret extends Entity {
    constructor(pos, rot, parent, spriteSheet, ssData, clientId) {
        super(pos, rot, parent);
        this.rotationSpeed = 20;
        this.clientId = clientId;
        this.children.push(
            new Sprite({ "x": 0, "y": 0 }, 0, this, spriteSheet, ssData, 0)
        );
        let thisTurret = this;
        window.globals.clientSocket.on("turret rotation", function (data) {
            if (data.clientId == thisTurret.clientId) {
                thisTurret.rotation = data.rot;
            }
        });
    }

    updateThis(keysDown, dt, socket) {
        if (this.clientId == socket.id) {
            // Rotate
            if (keysDown && keysDown.KeyD == true) {
                this.rotation += this.rotationSpeed * dt;
                socket.emit("turret rotation", { "clientId": this.clientId, "rot": this.rotation });
            }
            if (keysDown && keysDown.KeyA == true) {
                this.rotation -= this.rotationSpeed * dt;
                socket.emit("turret rotation", { "clientId": this.clientId, "rot": this.rotation });
            }
            // Wrap around
            this.rotation = this.rotation % 360;
        }
    }
}

export { Turret };