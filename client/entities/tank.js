import { Entity } from './entity.js';

// Global MatterJS Variables (to access its useful functions)
var Body = Matter.Body;
var Bodies = Matter.Bodies;

class Tank extends Entity {
    constructor(ss, ssData, fps, clientData, turret) {
        super(
            // Create a compound body representing tank/turret
            Body.create({
                parts: [
                    Bodies.rectangle(clientData.state.pos.x, clientData.state.pos.y, 225, 100, {
                        isStatic: false
                    }),
                    turret.body
                ],
                isStatic: false,
                frictionAir: 0.9,
                restitution: 0,
                //density: 0.002,
                //friction: 1,
                //inverseInertia: 0,
                //inertia: 0,
                //frictionStatic: 2,
                // render: { fillStyle: "white" }
            }),
            false
        );

        // Properties of tank
        this.clientId = clientData.clientId;
        this.speed = 6;
        this.rotationSpeed = 380;

        // Variables used for rendering this object
        this.index = 0;
        this.framesPerSecond = fps;
        this.timeTracker = 0;
        this.spriteSheetData = ssData;
        this.spriteSheet = ss;

        // Change turret body's center-of-rotation from middle to left
        Body.setCentre(turret.body, { x: -50, y: -5 }, true);
        // Reposition turret body based on this new center-of-rotation
        Body.setPosition(turret.body, this.body.position);
        this.children.push(turret);

        let thisTank = this;
        window.globals.clientSocket.on("tank position", function (data) {
            if (thisTank.clientId == data.clientId) {
                Body.applyForce(
                    thisTank.body,
                    { x: thisTank.body.position.x, y: thisTank.body.position.y },
                    { x: data.pos.x, y: data.pos.y }
                );
            }
        });
        window.globals.clientSocket.on("tank rotation", function (data) {
            if (data.clientId == thisTank.clientId) {
                thisTank.body.torque = data.rot;
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
        if (this.clientId == window.globals.clientSocket.id) {
            // Prepare a force vector
            let dx = Math.cos(this.body.angle) * (this.speed * dt);
            let dy = Math.sin(this.body.angle) * (this.speed * dt);

            // Apply the force vector for forward/backward movement
            if (keysDown && keysDown.ArrowUp == true) {
                Body.applyForce(
                    this.body,
                    { x: this.body.position.x, y: this.body.position.y },
                    { x: dx, y: dy }
                );
                // Emit to all the force vector applied
                window.globals.clientSocket.emit("tank position", { "clientId": this.clientId, "pos": { x: dx, y: dy } });
            }
            if (keysDown && keysDown.ArrowDown == true) {
                Body.applyForce(
                    this.body,
                    { x: this.body.position.x, y: this.body.position.y },
                    { x: -dx, y: -dy }
                );
                // Emit to all the force vector applied
                window.globals.clientSocket.emit("tank position", { "clientId": this.clientId, "pos": { x: -dx, y: -dy } });
            }

            // Apply torque for right/left turn
            if (keysDown && keysDown.ArrowRight == true) {
                this.body.torque = this.rotationSpeed * dt;
                // Emit to all the torque applied
                window.globals.clientSocket.emit("tank rotation", { "clientId": this.clientId, "rot": this.rotationSpeed * dt });
            }
            if (keysDown && keysDown.ArrowLeft == true) {
                this.body.torque = -this.rotationSpeed * dt;
                // Emit to all the torque applied
                window.globals.clientSocket.emit("tank rotation", { "clientId": this.clientId, "rot": -this.rotationSpeed * dt });
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