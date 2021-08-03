import { Entity } from './entity.js';
import { Sprite } from './sprite.js';
import { Turret } from './turret.js';

class Tank extends Entity {
    constructor(pos, rot, parent, ss, ssData, data) {
        super(pos, rot, parent);
        this.velocity = 70;             // Unit: PPS       
        this.rotationVelocity = 25;     // Unit: DPS
        this.isColliding = false;
        this.height = ssData.frames[0].frame.h;
        this.width = ssData.frames[0].frame.w;
        this.clientId = data.clientId;

        this.children.push(
            new Sprite(
                { "x": 0, "y": 0 },
                0,
                this,
                ss.tank,
                ssData.mSixTankBodyData,
                0
            )
        );
        this.children.push(
            new Turret(
                { "x": 0, "y": 0 },
                data.state.turRot,
                this,
                ss.turret,
                ssData.mSixTankTurretData,
                data.clientId
            )
        );

        let thisTank = this;
        window.globals.clientSocket.on("tank position", function (data) {
            if (data.clientId == thisTank.clientId) {
                thisTank.position = data.pos;
            }
        });
        window.globals.clientSocket.on("tank rotation", function (data) {
            if (data.clientId == thisTank.clientId) {
                thisTank.rotation = data.rot;
            }
        });
    }

    updateThis(keysDown, dt, socket) {
        if (this.clientId == socket.id) {
            let rotationInRadian = this.rotation * Math.PI / 180;
            let dx = Math.cos(rotationInRadian) * (this.velocity * dt);
            let dy = Math.sin(rotationInRadian) * (this.velocity * dt);

            // Forward/backward
            if (keysDown && keysDown.ArrowUp == true) {
                this.position.x += dx;
                this.position.y += dy;
                socket.emit("tank position", { "clientId": this.clientId, "pos": this.position });
            }
            if (keysDown && keysDown.ArrowDown == true) {
                this.position.x -= dx;
                this.position.y -= dy;
                socket.emit("tank position", { "clientId": this.clientId, "pos": this.position });
            }

            // Rotate right/left
            if (keysDown && keysDown.ArrowRight == true) {
                this.rotation += this.rotationVelocity * dt;
                socket.emit("tank rotation", { "clientId": this.clientId, "rot": this.rotation });
            }
            if (keysDown && keysDown.ArrowLeft == true) {
                this.rotation -= this.rotationVelocity * dt;
                socket.emit("tank rotation", { "clientId": this.clientId, "rot": this.rotation });
            }
            // Wrap around
            this.rotation = this.rotation % 360;
        }
    }
}

export { Tank };