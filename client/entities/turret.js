import { Entity } from './entity.js';
import { Shell } from './shell.js';

// Global MatterJS Variables (to access its useful functions)
var Body = Matter.Body;
var Bodies = Matter.Bodies;
var Composite = Matter.Composite;

class Turret extends Entity {
    constructor(ss, ssData, fps, clientData, wrld) {
        super(
            Bodies.rectangle(clientData.state.force.x, clientData.state.force.y, 150, 25, {
                isSensor: true,     // Inactivate body
                render: { fillStyle: "white" }
            }),
            true
        );

        // Properties of turret
        this.engineWorld = wrld;
        this.clientId = clientData.clientId;
        this.speed = 45;
        this.readyToFire = false;

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
                Body.setAngle(thisTurret.body, data.turAngle);
            }
        });

        // Wait 3 seconds between fire
        this.setLoadTime(3000);
    }

    renderThis(ctx) {
        let ctxCenter = {
            "x": this.spriteSheetData.mSixTurretData.frames[this.index].frame.w / 2,
            "y": this.spriteSheetData.mSixTurretData.frames[this.index].frame.h / 2
        };
        ctx.drawImage(
            this.spriteSheet["./images_and_data/mSixTankTurret.png"],
            this.spriteSheetData.mSixTurretData.frames[this.index].frame.x,
            this.spriteSheetData.mSixTurretData.frames[this.index].frame.y,
            this.spriteSheetData.mSixTurretData.frames[this.index].frame.w,
            this.spriteSheetData.mSixTurretData.frames[this.index].frame.h,
            -ctxCenter.x,
            -ctxCenter.y,
            this.spriteSheetData.mSixTurretData.frames[this.index].frame.w,
            this.spriteSheetData.mSixTurretData.frames[this.index].frame.h
        );
    }

    updateThis(keysDown, dt) {
        // If tank belongs to this browser...
        if (this.clientId == window.globals.clientSocket.id) {
            // Apply rotatation for left/right turn
            if (keysDown && keysDown.KeyD == true) {
                Body.rotate(this.body, 0.00872665 * (this.speed * dt));
                // Report state change to server
                window.globals.clientSocket.emit(
                    "turret angle", { "clientId": this.clientId, "turAngle": this.body.angle }
                );
            }
            if (keysDown && keysDown.KeyA == true) {
                Body.rotate(this.body, -0.00872665 * (this.speed * dt));
                // Report state change to server
                window.globals.clientSocket.emit(
                    "turret angle", { "clientId": this.clientId, "turAngle": this.body.angle }
                );
            }
            // TODO: turret fire gun...
            if (keysDown && keysDown.Space == true) {
                if (this.readyToFire = true) {
                    // Create a new round
                    shell = new Shell(
                        this.spriteSheet["./images_and_data/shell.png"],
                        this.spriteSheetData.shellData,
                        0,
                        this,
                        {
                            speed: 45,
                            type: "HE",
                            blastRadius: 2,
                            penetration: 2
                        }
                    );
                    // Add shell as child
                    this.children.push(shell);
                    // Add shell to the world
                    Composite.add(this.engineWorld, [shell.body]);
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

    // TODO
    setLoadTime(time) {
        let thisTurret = this;
        setInterval(function () {
            thisTurret.readyToFire = true;
        }, time);
    }
}

export { Turret };