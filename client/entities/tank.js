import { Entity } from './entity.js';
import { StaticObject } from './static_object.js';
import { Turret } from './turret.js';
import * as spriteSheetsData from "../spritesheetsData.js";

class Tank extends Entity {
    constructor(ss, ssData, fps, clientID, turretParams, shellParams) {
        super({ "x": 0, "y": 0 }, 0, false);

        this.turret = new Turret(
            turretParams.ss,
            turretParams.ssData,
            turretParams.fps,
            turretParams.clientID,
            shellParams
        );
        this.children.push(this.turret);

        // Properties of this object
        this.clientID = clientID;
        this.startPosition = { "x": 0, "y": 0 };
        this.endPosition = { "x": 0, "y": 0 };
        this.startAngle = 0; ///
        this.endAngle = 0;


        // Variables used for rendering this object
        this.index = 0;
        this.framesPerSecond = fps;
        this.timeTracker = 0;
        this.spriteSheetData = ssData;
        this.spriteSheet = ss;

        this.timeSinceLastPositionTick = 0;    // Milisecond
        this.timeSinceLastRotationTick = 0

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Listen for update (server tick)
        let thiss = this;
        window.globals.clientSocket.on("update tank and turret", function (data) {
            if (thiss.clientID == data.clientID) {
                // Take by value not ref!
                thiss.startPosition.x = thiss.position.x;
                thiss.startPosition.y = thiss.position.y;
                thiss.endPosition.x = data.position.x;
                thiss.endPosition.y = data.position.y;

                thiss.startAngle = thiss.angle;
                thiss.endAngle = data.angle;

                // Reset time
                thiss.timeSinceLastPositionTick = 0;
                thiss.timeSinceLastRotationTick = 0;
            }
        });
        window.globals.clientSocket.on("create tread mark", function (data) {
            if (thiss.clientID == data.clientID) {
                let treadMark = new StaticObject(
                    data.position,
                    data.angle,
                    window.globals.images["./images_and_data/treadMark.png"],
                    spriteSheetsData.treadMarkData,
                    1,
                    data.clientID,
                    data.staticObjectID
                );
            }
        });

        // Listen for keys released 
        addEventListener("keyup", function (key) {
            if (key.code == "ArrowUp") {
                window.globals.clientSocket.emit(
                    "arrow up released", {}
                );
            }
            if (key.code == "ArrowDown") {
                window.globals.clientSocket.emit(
                    "arrow down released", {}
                );
            }
            if (key.code == "ArrowRight") {
                window.globals.clientSocket.emit(
                    "arrow right released", {}
                );
            }
            if (key.code == "ArrowLeft") {
                window.globals.clientSocket.emit(
                    "arrow left released", {}
                );
            }
        }, false);
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
        // Lerp position angle
        this.lerpMovement(this.lerp, this.startPosition, this.endPosition, dt, window.globals.serverTickRate);
        this.lerpRotation(this.lerp, this.startAngle, this.endAngle, dt, window.globals.serverTickRate);

        if (this.clientID == window.globals.clientSocket.id) {
            // Client tells server up-arrow is pressed
            if (keysDown && keysDown.ArrowUp == true) {
                window.globals.clientSocket.emit(
                    "move forward", {}
                );
            }
            // Client tells server down-arrow is pressed
            if (keysDown && keysDown.ArrowDown == true) {
                window.globals.clientSocket.emit(
                    "move backward", {}
                );
            }

            // Client tells server right-arrow/left-arrow is pressed
            if (keysDown && keysDown.ArrowRight == true) {
                window.globals.clientSocket.emit(
                    "turn right", {}
                );
            }
            if (keysDown && keysDown.ArrowLeft == true) {
                window.globals.clientSocket.emit(
                    "turn left", {}
                );
            }
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

    lerpMovement(lerpFunc, startPosition, endPosition, delta, lerpDuration) {
        if (this.timeSinceLastPositionTick < lerpDuration) {
            // Do linear interpolation
            this.position.x = lerpFunc(startPosition.x, endPosition.x, this.timeSinceLastPositionTick / lerpDuration);
            this.position.y = lerpFunc(startPosition.y, endPosition.y, this.timeSinceLastPositionTick / lerpDuration);
            this.timeSinceLastPositionTick += delta;
        } else {
            // Skip linear interpolation
            this.position.x = endPosition.x;
            this.position.y = endPosition.y;
        }
    }

    lerpRotation(lerpFunc, startAngle, endAngle, delta, lerpDuration) {
        if (this.timeSinceLastRotationTick < lerpDuration) {
            // Do linear interpolation
            this.angle = lerpFunc(startAngle, endAngle, this.timeSinceLastRotationTick / lerpDuration);
            this.timeSinceLastRotationTick += delta;
        } else {
            // Skip linear interpolation
            this.angle = endAngle;
        }
    }

    lerp(start, end, time) {
        return start * (1 - time) + end * time;
    }
}

export { Tank };