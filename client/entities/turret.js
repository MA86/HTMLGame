import { Entity } from './entity.js';
import { Shell } from './shell.js';

class Turret extends Entity {
    constructor(ss, ssData, fps, clientID, shellParams) {
        super({ "x": 0, "y": 0 }, 0, true);

        // Variables used for rendering this object
        this.index = 0;
        this.framesPerSecond = fps;
        this.timeTracker = 0;
        this.spriteSheetData = ssData;
        this.spriteSheet = ss;      // Note: keyname is a path made at main.js

        // Properties of Turret
        this.clientID = clientID;
        this.shellParams = shellParams;
        this.firedShell = null;
        this.shellIsActive = false;

        // Listen for update
        let thiss = this;
        window.globals.clientSocket.on("update tank", function (data) {
            if (thiss.clientID == data.clientID) {
                thiss.angle = data.turretAngle;
            }
        });

        // Listen for create shell ///
        window.globals.clientSocket.on("create shell", function (data) {
            if (thiss.clientID == data.clientID) {
                // TODO: Create a 'remove shell' and put this code there along with animation?
                /*
                if (thiss.shellIsActive) {
                    let indexOfShell = window.globals.entities.map(function (tank) {
                        if (tank.turret.shellIsActive) {
                            return tank.clientID;
                        }
                    }).indexOf(thiss.firedShell.clientID);
                    window.globals.entities.splice(indexOfShell, 1);
                    thiss.shellIsActive = false;
                }
                */

                // Create new shell
                thiss.firedShell = new Shell(
                    thiss.shellParams.ss,
                    thiss.shellParams.ssData,
                    thiss.shellParams.fps,
                    data.clientID,
                    data.shellID
                );

                // Add shell to list 
                window.globals.entities.push(thiss.firedShell);
                thiss.shellIsActive = true;
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
        if (this.clientID == window.globals.clientSocket.id) {
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
                window.globals.clientSocket.emit(///
                    "fire shell",
                    {
                        "clientID": this.clientID
                    }
                );
            }
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