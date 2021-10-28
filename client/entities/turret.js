import { Entity } from './entity.js';
import { Shell } from './shell.js';

// Global MatterJS Variables (to access its useful functions)
var Body = Matter.Body;
var Bodies = Matter.Bodies;
var Composite = Matter.Composite;

class Turret extends Entity {
    constructor(ss, ssData, fps, dt, clientData, wrld) {
        super(
            Bodies.rectangle(clientData.state.tankInitPos.x, clientData.state.tankInitPos.y, 148, 10, {
                isSensor: true,     // Inactivate body
                render: { fillStyle: "white" }
            }),
            true
        );

        // Properties of turret
        this.clientId = clientData.clientId;
        this.speed = 5;
        this.readyToFire = true;

        // Other properties
        this.parent;                // Assigned after Turret is instantiated
        this.engineWorld = wrld;

        // Variables used for rendering this object
        this.index = 0;
        this.framesPerSecond = fps;
        this.timeTracker = 0;
        this.spriteSheetData = ssData;
        this.spriteSheet = ss;      // Note: keyname is a path made at main.js

        // This turret representation's state in another browser is handled by the server
        let thisTurret = this;
        window.globals.clientSocket.on("turret angle", function (data) {
            if (thisTurret.clientId == data.clientId && thisTurret.clientId != window.globals.clientSocket.id) {
                Body.rotate(thisTurret.body, data.turAngle);
            }
        });
        window.globals.clientSocket.on("fire shell", function (data) {
            if (thisTurret.clientId == data.clientId && thisTurret.clientId != window.globals.clientSocket.id) {
                // Create a new round
                let shell = new Shell(
                    thisTurret.spriteSheet["./images_and_data/shell.png"],
                    thisTurret.spriteSheetData.shellData,
                    0,
                    thisTurret,
                    {
                        speed: 0.004,
                        type: "HE",
                        blastRadius: 2,
                        penetration: 2
                    }
                );
                // Add shell to entities 
                window.globals.entities.push(shell);
                // Add shell to the world
                Composite.add(thisTurret.engineWorld, [shell.body]);
                // Reset after fire
                thisTurret.readyToFire = false;
                thisTurret.setLoadTime(500);
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
        // If tank belongs to this browser...
        if (this.clientId == window.globals.clientSocket.id) {
            // Apply rotatation for left/right turn
            if (keysDown && keysDown.KeyD == true) {
                let rotation = 0.00872665 * this.speed;
                Body.rotate(this.body, rotation);
                // Report state change to server
                window.globals.clientSocket.emit(
                    "turret angle", { "clientId": this.clientId, "turAngle": rotation }
                );
            }
            if (keysDown && keysDown.KeyA == true) {
                let rotation = -0.00872665 * this.speed;
                Body.rotate(this.body, rotation);
                // Report state change to server
                window.globals.clientSocket.emit(
                    "turret angle", { "clientId": this.clientId, "turAngle": rotation }
                );
            }

            // Fire a shell
            if (keysDown && keysDown.Space == true) {
                if (this.readyToFire) {
                    // Create a new round
                    let thisTurret = this;
                    let shell = new Shell(
                        this.spriteSheet["./images_and_data/shell.png"],
                        this.spriteSheetData.shellData,
                        0,
                        thisTurret,
                        {
                            speed: 0.004,
                            type: "HE",
                            blastRadius: 2,
                            penetration: 2
                        }
                    );
                    // Add shell to entities 
                    window.globals.entities.push(shell);
                    // Add shell to the world
                    Composite.add(this.engineWorld, [shell.body]);
                    // Reset after fire
                    this.readyToFire = false;
                    this.setLoadTime(500);

                    // Report shell fire to server
                    window.globals.clientSocket.emit(
                        "fire shell", { "clientId": this.clientId, "shellFired": true }
                    );
                }
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

    // Shell load time
    setLoadTime(time) {
        let thisTurret = this;
        setTimeout(function () {
            thisTurret.readyToFire = true;
        }, time);
    }
}

export { Turret };