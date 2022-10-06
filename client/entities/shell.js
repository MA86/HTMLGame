class Shell extends window.globals.entityModule.Entity {
    constructor(ss, ssData, fps, clientID, sID, initPos, initAng) {
        super({ "x": initPos.x, "y": initPos.y }, initAng, false);

        // Variables used for rendering this object
        this.index = 0;
        this.framesPerSecond = fps;
        this.timeTracker = 0;
        this.spriteSheetData = ssData;
        this.spriteSheet = ss;

        this.clientID = clientID;
        this.shellID = sID;
        this.startPosition = { "x": initPos.x, "y": initPos.y };
        this.endPosition = { "x": initPos.x, "y": initPos.y };
        this.startAngle = initAng;
        this.endAngle = initAng;

        // Bind this
        this.updateThis = this.updateThis.bind(this);
        this.lerpMovement = this.lerpMovement.bind(this);
        this.lerpRotation = this.lerpRotation.bind(this);
        this.lerp = this.lerp.bind(this);

        this.timeSinceLastPositionTick = 0;
        this.timeSinceLastRotationTick = 0;

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Listen for updates
        let thiss = this;
        window.globals.clientSocket.on("update shell", function (data) {
            if (thiss.clientID == data.clientID && thiss.shellID == data.shellID) {
                // Take by value not ref!
                thiss.startPosition.x = thiss.position.x;
                thiss.startPosition.y = thiss.position.y;
                thiss.endPosition.x = data.position.x;
                thiss.endPosition.y = data.position.y;

                thiss.startAngle = thiss.angle;
                thiss.endAngle = data.angle;
                /// DELETE below
                //thiss.position = data.position;
                //thiss.angle = data.angle;

                // Reset time
                thiss.timeSinceLastPositionTick = 0;
                thiss.timeSinceLastRotationTick = 0;
            }
        });

        // Listen for destroy shell
        window.globals.clientSocket.on("destroy shell", function (data) {
            // Check if the message is for this shell...
            if (thiss.clientID == data.clientID && thiss.shellID == data.shellID) {
                // Play shell animation one time
                thiss.animateShellPenetration(data.currentPosition, data.currentAngle);

                // Remove shell from entities list
                thiss.removeSelfFromList();
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
        // Lerp position and angle
        this.lerpMovement(this.lerp, this.startPosition, this.endPosition, dt, window.globals.serverTickRate);
        this.lerpRotation(this.lerp, this.startAngle, this.endAngle, dt, window.globals.serverTickRate);

        // Update animation index
        this.timeTracker += dt;
        let delay = 1 / this.framesPerSecond;
        if (this.timeTracker >= delay) {
            this.index += 1;
            this.index = this.index % this.spriteSheetData.frames.length;
            this.timeTracker = 0;
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

    lerp(start, end, time) {
        return start * (1 - time) + end * time;
    }

    animateShellPenetration(position, angle) {
        let thiss = this;

        // Play shell penetration animation one time
        let shellPenetrationAnimation = new window.globals.spriteModule.Sprite(
            position,
            angle,
            window.globals.images["./images_and_data/hit.png"],
            window.globals.spriteSheetsData.hitData,
            30,
            1,
            thiss.shellID,
            null,
            thiss.clientID
        );
        window.globals.entities.push(shellPenetrationAnimation);
    }

    removeSelfFromList() {
        let thiss = this;

        // Find index of this shell and remove it from list
        let indexOfShell = window.globals.entities.findIndex(function (obj) {
            if (obj instanceof Shell && thiss.shellID == obj.shellID) {
                return true;
            }
        });
        window.globals.entities.splice(indexOfShell, 1);
    }
}

export { Shell };