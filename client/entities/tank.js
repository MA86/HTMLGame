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


        // Variables used for rendering this object
        this.index = 0;
        this.framesPerSecond = fps;
        this.timeTracker = 0;
        this.spriteSheetData = ssData;
        this.spriteSheet = ss;

        // TOD
        this.t = 0;


        this.setupEventListeners();
    }

    setupEventListeners() {
        // Listen for updates event
        let thiss = this;
        window.globals.clientSocket.on("update tank and turret", function (data) {
            if (thiss.clientID == data.clientID) {
                thiss.startPosition = thiss.position;
                thiss.endPosition = data.position;
                ///
                //thiss.t = 0;

                //thiss.position = data.position;
                thiss.angle = data.angle;
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
        if (this.clientID == window.globals.clientSocket.id) {
            // Lerp state
            this.lerpMovement(this.lerp, this.startPosition, this.endPosition, dt, 500);

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

    lerpMovement(lerpFunc, startPosition, endPosition, delta, lerpFactor) {
        ///
        this.t += delta / lerpFactor;
        if (delta <= lerpFactor) {
            // Do linear interpolation
            this.position.x = lerpFunc(startPosition.x, endPosition.x, delta / lerpFactor);
            this.position.y = lerpFunc(startPosition.y, endPosition.y, delta / lerpFactor);
            console.log(this.position);
        } else {
            // Skip linear interpolation
            this.position.x = endPosition.x;
            this.position.y = endPosition.y;
        }
    }

    lerp(start, end, time) {
        return start * (1 - time) + end * time;
    }
}

export { Tank };