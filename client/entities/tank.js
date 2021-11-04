import { Entity } from './entity.js';

// Global MatterJS Variables (to access its useful functions)
var Body = Matter.Body;
var Bodies = Matter.Bodies;

class Tank extends Entity {
    constructor(ss, ssData, fps, dt, clientData, turret) {
        super(
            // TODO: three tanks in 3 browsers must have same orientation!
            // Create a compound body representing tank/turret
            Body.create({
                parts: [
                    Bodies.rectangle(clientData.state.tankInitPos.x, clientData.state.tankInitPos.y, 225, 100,
                        { render: { fillStyle: "white" } }
                    ),
                    turret.body
                ],
                isStatic: false,
                frictionAir: 0.5,
                restitution: 0,
                density: 10,
                friction: 1,
                frictionStatic: 10,
                render: { fillStyle: "white" }
            }),
            false
        );

        // Properties of tank
        this.clientId = clientData.clientId;
        this.speed = 0.04;
        this.rotationSpeed = 5;

        // Variables used for rendering this object
        this.index = 0;
        this.framesPerSecond = fps;
        this.timeTracker = 0;
        this.spriteSheetData = ssData;
        this.spriteSheet = ss;

        // TODO: move to Turret class?
        // Change turret body's center-of-rotation from middle to left
        Body.setCentre(turret.body, { x: -48, y: -4 }, true);
        // Reposition turret body based on this new center-of-rotation
        Body.setPosition(turret.body, this.body.position);
        // Add child turret
        this.children.push(turret);

        // This tank's representation in another browser is set by the server
        let thisTank = this;
        window.globals.clientSocket.on("tank movement", function (data) {
            if (thisTank.clientId == data.clientId && thisTank.clientId != window.globals.clientSocket.id) {
                Body.applyForce(
                    thisTank.body,
                    { x: thisTank.body.position.x, y: thisTank.body.position.y },
                    { x: data.tankForce.x, y: data.tankForce.y }
                );
            }
        });
        window.globals.clientSocket.on("tank rotation", function (data) {
            if (data.clientId == thisTank.clientId && thisTank.clientId != window.globals.clientSocket.id) {
                thisTank.body.torque = data.tankTorque;
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
            let dx = Math.cos(this.body.angle) * this.speed;
            let dy = Math.sin(this.body.angle) * this.speed;

            // Apply the force vector for forward/backward movement
            if (keysDown && keysDown.ArrowUp == true) {
                Body.applyForce(
                    this.body,
                    { x: this.body.position.x, y: this.body.position.y },
                    { x: dx, y: dy }
                );
                // Report to server the force applied
                window.globals.clientSocket.emit(
                    "tank movement",
                    { "clientId": this.clientId, "tankForce": { x: dx, y: dy } }
                );
            }
            if (keysDown && keysDown.ArrowDown == true) {
                Body.applyForce(
                    this.body,
                    { x: this.body.position.x, y: this.body.position.y },
                    { x: -dx, y: -dy }
                );
                // Report to server the force applied
                window.globals.clientSocket.emit(
                    "tank movement",
                    { "clientId": this.clientId, "tankForce": { x: -dx, y: -dy } }
                );
            }

            // Apply torque for right/left turn
            if (keysDown && keysDown.ArrowRight == true) {
                this.body.torque = this.rotationSpeed;
                // Report to server the torque applied
                window.globals.clientSocket.emit(
                    "tank rotation",
                    { "clientId": this.clientId, "tankTorque": this.rotationSpeed }
                );
            }
            if (keysDown && keysDown.ArrowLeft == true) {
                this.body.torque = -this.rotationSpeed;
                // Report to server the torque applied
                window.globals.clientSocket.emit(
                    "tank rotation",
                    { "clientId": this.clientId, "tankTorque": -this.rotationSpeed }
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