const Turret = require("./turret.js").turret;
const Matter = require("matter-js/build/matter");

const Body = Matter.Body;
const Bodies = Matter.Bodies;
const Composite = Matter.Composite;
const Engine = Matter.Engine;
const Events = Matter.Events;

class Tank {
    constructor(initPos, world, socket, parent) {
        // Create turret
        this.turret = new Turret({ "x": initPos.x, "y": initPos.y }, world, this);

        // Create compound body representing tank
        this.body = Body.create({
            parts: [
                Bodies.rectangle(initPos.x, initPos.y, 225, 100, {}),
                this.turret.body
            ],
            isStatic: false,
            frictionAir: 0.5,
            restitution: 0,
            density: 4,
            friction: 1,
            frictionStatic: 10,
        });

        // Properties of tank
        this.speed = 0.04;
        this.rotationSpeed = 4;
        this.world = world;
        this.socket = socket;
        this.parent = parent;

        // Move turret center from middle to left
        Body.setCentre(this.turret.body, { x: -48, y: -4 }, true);
        // Position turret on tank (based on new center)
        Body.setPosition(this.turret.body, this.body.position);

        // Add tank compound body to the world
        Composite.add(world, [this.body]);
    }

    setupEventListeners() {
        let thiss = this;

        // Trigger forward movement
        thiss.socket.on("move forward", function (data) {
            // Create a force vector
            let dx = Math.cos(thiss.body.angle) * thiss.speed;
            let dy = Math.sin(thiss.body.angle) * thiss.speed;

            Body.applyForce(
                thiss.body,
                { "x": thiss.body.position.x, "y": thiss.body.position.y },
                { "x": dx, "y": dy }
            );
        });

        // Trigger backward movement
        thiss.socket.on("move backward", function (data) {
            // Create a force vector
            let dx = Math.cos(thiss.body.angle) * thiss.speed;
            let dy = Math.sin(thiss.body.angle) * thiss.speed;

            Body.applyForce(
                thiss.body,
                { "x": thiss.body.position.x, "y": thiss.body.position.y },
                { "x": -dx, "y": -dy }
            );
        });

        // Trigger right turn
        thiss.socket.on("turn right", function (data) {
            thiss.body.torque = thiss.rotationSpeed;
        });

        // Trigger left turn
        thiss.socket.on("turn left", function (data) {
            thiss.body.torque = -thiss.rotationSpeed;
        });
    }
    // TODO
    update() {
        let thiss = this;

        thiss.socket.emit("render data", {
            "position": thiss.body.position,
            "angle": thiss.body.angle,
            "turretAngle": thiss.turret.body.angle
        });
    }
}

module.exports = { Tank };