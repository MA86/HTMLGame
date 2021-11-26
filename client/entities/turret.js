import { Entity } from './entity.js';

class Turret extends Entity {
    constructor(ss, ssData, fps) {
        super({ "x": 0, "y": 0 }, 0, true);

        // Variables used for rendering this object
        this.index = 0;
        this.framesPerSecond = fps;
        this.timeTracker = 0;
        this.spriteSheetData = ssData;
        this.spriteSheet = ss;      // Note: keyname is a path made at main.js

        // Update turret properties
        let thiss = this;
        window.globals.clientSocket.on("update", function (data) {
            if (this.clientID == data.clientID) {
                thiss.angle = data.turretAngle;
            }
        });
    }

    renderThis(ctx) {
        let ctxCenter = {
            "x": this.spriteSheetData.mSixTankTurretData.frames[this.index].frame.w / 2,
            "y": this.spriteSheetData.mSixTankTurretData.frames[this.index].frame.h / 2
        };
        ctx.drawImage(
            this.spriteSheet["./images_and_data/mSixTankTurret.png"],
            this.spriteSheetData.mSixTankTurretData.frames[this.index].frame.x,
            this.spriteSheetData.mSixTankTurretData.frames[this.index].frame.y,
            this.spriteSheetData.mSixTankTurretData.frames[this.index].frame.w,
            this.spriteSheetData.mSixTankTurretData.frames[this.index].frame.h,
            -ctxCenter.x,
            -ctxCenter.y,
            this.spriteSheetData.mSixTankTurretData.frames[this.index].frame.w,
            this.spriteSheetData.mSixTankTurretData.frames[this.index].frame.h
        );
    }

    updateThis(keysDown, dt) {
        // Client tells server to rotate right/left
        if (keysDown && keysDown.KeyD == true) {
            window.globals.clientSocket.emit(
                "rotate right", {}
            );
        }
        if (keysDown && keysDown.KeyA == true) {
            window.globals.clientSocket.emit(
                "rotate left", {}
            );
        }

        // Fire a shell
        if (keysDown && keysDown.Space == true) {
            window.globals.clientSocket.emit(
                "fire shell", {}
            );

        }

        // Update index
        this.timeTracker += dt;
        let delay = 1 / this.framesPerSecond;
        if (this.timeTracker >= delay) {
            this.index += 1;
            this.index = this.index % this.spriteSheetData.mSixTurretData.frames.length;
            this.timeTracker = 0;
        }
    }
}

export { Turret };