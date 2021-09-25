import { Entity } from './entity.js';

// Global MatterJS Variables (to access its useful functions)
var Body = Matter.Body;
var Bodies = Matter.Bodies;

class Turret extends Entity {
    constructor(ss, ssData, fps, clientData) {
        super(
            Bodies.rectangle(clientData.state.pos.x, clientData.state.pos.y, 150, 25, {
                isSensor: true     // Inactivate body
            }),
            true
        );

        // Properties of turret
        this.clientId = clientData.clientId;
        this.speed = 45;

        // Variables used for rendering this object
        this.index = 0;
        this.framesPerSecond = fps;
        this.timeTracker = 0;
        this.spriteSheetData = ssData;
        this.spriteSheet = ss;

        // This turret's representation in another browser is set by the server
        let thisTurret = this;
        window.globals.clientSocket.on("turret rotation", function (data) {
            if (thisTurret.clientId == data.clientId) {
                thisTurret.body.angle = data.rot;
            }
        });
    }

    renderThis(ctx) {
        let ctxCenter = {
            "x": this.spriteSheetData.frames[this.index].frame.w / 2,
            "y": this.spriteSheetData.frames[this.index].frame.h / 2
        };
        ctx.drawImage(
            this.spriteSheet,
            this.spriteSheetData.frames[this.index].frame.x,
            this.spriteSheetData.frames[this.index].frame.y,
            this.spriteSheetData.frames[this.index].frame.w,
            this.spriteSheetData.frames[this.index].frame.h,
            -ctxCenter.x,
            -ctxCenter.y,
            this.spriteSheetData.frames[this.index].frame.w,
            this.spriteSheetData.frames[this.index].frame.h
        );
    }

    updateThis(keysDown, dt) {
        // Apply rotatation for left/right turn
        if (keysDown && keysDown.KeyD == true) {
            Body.rotate(this.body, 0.00872665);
            // Report state change to server
            window.globals.clientSocket.emit(
                "turret rotation", { "clientId": this.clientId, "rot": this.body.angle }
            );
        }
        if (keysDown && keysDown.KeyA == true) {
            Body.rotate(this.body, -0.00872665);
            // Report state change to server
            window.globals.clientSocket.emit(
                "turret rotation", { "clientId": this.clientId, "rot": this.body.angle }
            );
        }

        // Update index
        this.timeTracker += dt;
        let delay = 1 / this.framesPerSecond;
        if (this.timeTracker >= delay) {
            this.index += 1;
            this.index = this.index % this.spriteSheetData.frames.length;
            this.timeTracker = 0;
        }
    }
}

export { Turret };