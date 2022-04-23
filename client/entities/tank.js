import { Entity } from './entity.js';
import { StaticObject } from './static_object.js';
import { Turret } from './turret.js';
import * as spriteSheetsData from "../spriteSheetsData.js";

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

        // Variables used for rendering this object
        this.index = 0;
        this.framesPerSecond = fps;
        this.timeTracker = 0;
        this.spriteSheetData = ssData;
        this.spriteSheet = ss;

        this.clientID = clientID;

        // Listen for updates
        let thiss = this;
        window.globals.clientSocket.on("update tank", function (data) {
            if (thiss.clientID == data.clientID) {
                thiss.position = data.position;
                thiss.angle = data.angle;
            }
        });//TODO
        window.globals.clientSocket.on("create tread mark", function (data) {
            if (thiss.clientID == data.clientID) {
                let treadMark = new StaticObject(
                    data.position,
                    data.angle,
                    window.globals.images["./images_and_data/shell.png"],///
                    spriteSheetsData.shellData,///
                    1,
                    data.clientID,
                    data.staticObjectID
                );
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
        if (this.clientID == window.globals.clientSocket.id) {
            // Client tells server to move forward/backward
            if (keysDown && keysDown.ArrowUp == true) {
                window.globals.clientSocket.emit(
                    "move forward", {}
                );
            }
            if (keysDown && keysDown.ArrowDown == true) {
                window.globals.clientSocket.emit(
                    "move backward", {}
                );
            }

            // Client tells server to turn right/left
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
}

export { Tank };