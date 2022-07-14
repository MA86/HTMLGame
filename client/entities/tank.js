class Tank extends window.globals.entityModule.Entity {
    constructor(ss, ssData, fps, clientID, turretParams, shellParams) {
        super({ "x": 0, "y": 0 }, 0, false);

        this.turret = new window.globals.turretModule.Turret(
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
        this.startAngle = 0;
        this.endAngle = 0;

        // Bind this object to its functions
        this.setupEventListeners = this.setupEventListeners.bind(this);
        this.handleCollision = this.handleCollision.bind(this);
        this.cleanupSelf = this.cleanupSelf.bind(this);

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
            // Check which tank is the message for...
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

        // Listen for destroy tank event
        window.globals.clientSocket.on("destroy tank", function (data) {
            // Check which tank is the message for...
            if (thiss.clientID == data.clientID) {
                // Play tank animation one time
                thiss.animateTankPenetration(data.currentPosition, data.currentAngle);

                // Find and delete this tank from lists
                window.globals.entities.slice().reverse().forEach(function (item, index, arr) {
                    if (item instanceof Tank && item.clientID == thiss.clientID) {
                        window.globals.entities.splice(arr.length - 1 - index, 1);

                        let indexOfClient = window.globals.clientIDs.indexOf(thiss.clientID);
                        window.globals.clientIDs.splice(indexOfClient, 1);

                        thiss.cleanupSelf();
                    }
                });
            }
        });

        window.globals.clientSocket.on("create tread mark", function (data) {
            if (thiss.clientID == data.clientID) {
                let treadMark = new window.globals.staticObjectModule.StaticObject(
                    data.position,
                    data.angle,
                    window.globals.images["./images_and_data/treadMark.png"],
                    window.globals.spriteSheetsData.treadMarkData,
                    1,
                    data.clientID,
                    data.staticObjectID
                );
            }
        });

        // Communicate keyup event to server 
        addEventListener("keyup", this.emitKeyUp, false);
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

    animateTankPenetration(position, angle) {
        let thiss = this;

        // Play tank penetration animation one time
        let tankPenetrationAnimation = new window.globals.spriteModule.Sprite(
            position,
            angle,
            window.globals.images["./images_and_data/explosions.png"],
            window.globals.spriteSheetsData.explosionsData,
            30,
            1,
            thiss.clientID,
            null,
            thiss.clientID
        );
        window.globals.entities.push(tankPenetrationAnimation);
    }

    cleanupSelf() {
        let thiss = this;
        /*
        // Find index of this tank and remove it from list
        let indexOfTank = window.globals.entities.findIndex(function (obj) {
            if (obj instanceof Tank && thiss.clientID == obj.clientID) {
                return true;
            }
        });
        // Remove client and associated tank
        window.globals.entities.splice(indexOfTank, 1);
        window.globals.clientIDs.splice(indexOfTank, 1);
        */

        // If it is the playable tank, disable input
        if (thiss.clientID == window.globals.clientSocket.id) {
            // Unsubscribe from input events
            removeEventListener("keyup", thiss.emitKeyUp);
            removeEventListener("keydown", window.globals.keyDownHandler);
            removeEventListener("keyup", window.globals.keyUpHandler);

            // Reset key container
            window.globals.keysDown = {};
        }
    }

    emitKeyUp(key) {
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
    }
}

export { Tank };