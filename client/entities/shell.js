import { Entity } from "./entity.js";

class Shell extends Entity {
    constructor(ss, ssData, fps, clientID, sID) {
        super({ "x": 0, "y": 0 }, 0, false);

        // Variables used for rendering this object
        this.index = 0;
        this.framesPerSecond = fps;
        this.timeTracker = 0;
        this.spriteSheetData = ssData;
        this.spriteSheet = ss;

        this.clientID = clientID;
        this.shellID = sID;

        // Listen for updates
        let thiss = this;
        window.globals.clientSocket.on("update shell", function (data) {
            if (thiss.clientID == data.clientID && thiss.shellID == data.shellID) {
                thiss.position = data.position;
                thiss.angle = data.angle;
            }
        });

        // Listen for destroy shell
        window.globals.clientSocket.on("destroy shell", function (data) {
            // Check if the message is for this shell
            if (thiss.clientID == data.clientID && thiss.shellID == data.shellID) {
                // Find and remove this shell from entities list
                let indexOfShell = window.globals.entities.findIndex(function (obj) {
                    if ("shellID" in obj && thiss.shellID == obj.shellID) {
                        return true
                    }
                });
                window.globals.entities.splice(indexOfShell, 1);
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
        // Update index
        this.timeTracker += dt;
        let delay = 1 / this.framesPerSecond;
        if (this.timeTracker >= delay) {
            this.index += 1;
            this.index = this.index % this.spriteSheetData.frames.length;
            this.timeTracker = 0;
        }
    }

    explode() {
        // TODO: animation
    }
}

export { Shell };