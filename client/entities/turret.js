class Turret extends window.globals.entityModule.Entity {
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

        this.startAngle = 0;
        this.endAngle = 0;
        this.timeSinceLastRotationTick = 0;

        // Bind this
        this.updateThis = this.updateThis.bind(this);
        this.lerpRotation = this.lerpRotation.bind(this);
        this.lerp = this.lerp.bind(this);

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Listen for update
        let thiss = this;
        window.globals.clientSocket.on("update tank and turret", function (data) {
            // Update if it's this turret
            if (thiss.clientID == data.clientID) {
                //thiss.angle = data.turretAngle;

                thiss.startAngle = thiss.angle;
                thiss.endAngle = data.turretAngle;

                // Reset time
                thiss.timeSinceLastRotationTick = 0;
            }
        });

        // Listen for create shell representation
        window.globals.clientSocket.on("create shell", function (data) {
            if (thiss.clientID == data.clientID) {
                // Create new shell representation
                thiss.firedShell = new window.globals.shellModule.Shell(
                    thiss.shellParams.ss,
                    thiss.shellParams.ssData,
                    thiss.shellParams.fps,
                    data.clientID,
                    data.shellID,
                    data.initPos,
                    data.initAng
                );

                // Add this shell rep. to entities list 
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
        // Lerp rotation
        this.lerpRotation(this.lerp, this.startAngle, this.endAngle, dt, window.globals.serverTickRate);

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

            // Client tells server to fire a shell
            if (keysDown && keysDown.Space == true) {
                window.globals.clientSocket.emit(
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
            this.index = this.index % this.spriteSheetData.mSixTankTurretData.frames.length;
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

    lerp(start, end, time) {
        return start * (1 - time) + end * time;
    }

    cleanupSelf() {
        // Does nothing yet
    }
}

export { Turret };