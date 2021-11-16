const Matter = require("matter-js/build/matter");

const Body = Matter.Body;
const Bodies = Matter.Bodies;
const Composite = Matter.Composite;
const Engine = Matter.Engine;
const Events = Matter.Events;

class Tank {
    constructor(world, initPos, turret) {

        // Create compound body representing tank & turret
        this.body = Body.create({
            parts: [
                Bodies.rectangle(initPos.x, initPos.y, 225, 100, {}),
                turret
            ],
            isStatic: false,
            frictionAir: 0.5,
            restitution: 0,
            density: 4,
            friction: 1,
            frictionStatic: 10,
        });

        // Properties of tank
        this.matterUpdated = false;
        this.speed = 0.04;
        this.rotationSpeed = 4;

        // Move turret center from middle to left
        Body.setCentre(turret, { x: -48, y: -4 }, true);
        // Position turret on tank (based on new center)
        Body.setPosition(turret, this.body.position);
        // TODO:do above before adding turret to world??

        // Add tank to the world
        Composite.add(world, [this.body]);
    }

    setupEventListeners(socket, engine) {
        let thiss = this;

        Events.on(engine, "afterUpdate", function (event) {
            thiss.matterUpdated = true;
        });

        // Apply the force vector for forward/backward movement
        socket.on("move forward", function (data) {
            // Create a force vector
            let dx = Math.cos(thiss.body.angle) * thiss.speed;
            let dy = Math.sin(thiss.body.angle) * thiss.speed;

            if (true) {
                Body.applyForce(
                    thiss.body,
                    { x: thiss.body.position.x, y: thiss.body.position.y },
                    { x: dx, y: dy }
                );
                thiss.matterUpdated = false;
            }
            //socket.emit("render position", { "position": thiss.tank.position });/// 
        });
        socket.on("move backward", function (data) {
            // Create a force vector
            let dx = Math.cos(thiss.body.angle) * thiss.speed;
            let dy = Math.sin(thiss.body.angle) * thiss.speed;

            if (true) {
                Body.applyForce(
                    thiss.body,
                    { x: thiss.body.position.x, y: thiss.body.position.y },
                    { x: -dx, y: -dy }
                );
                thiss.matterUpdated = false;
            }
            //socket.emit("render position", { "position": thiss.tank.position });/// 
        });

        // Apply torque for right/left turn
        socket.on("turn right", function (data) {
            if (true) {
                thiss.body.torque = thiss.rotationSpeed;
                thiss.matterUpdated = false;
            }
            //socket.emit("render angle", { "angle": thiss.tank.angle });///
            //Body.update(thiss.tank, 1000 / 60, 1, 1); ///
        });
        socket.on("turn left", function (data) {
            if (true) {
                thiss.body.torque = -thiss.rotationSpeed;
                thiss.matterUpdated = false;
            }
            //socket.emit("render angle", { "angle": thiss.tank.angle });///
            //Body.update(thiss.tank, 1000 / 60, 1, 1); ///
        });
    }
}

module.exports = { Tank };