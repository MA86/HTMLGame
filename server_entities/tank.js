const Matter = require("matter-js/build/matter");

const Body = Matter.Body;
const Bodies = Matter.Bodies;
const Composite = Matter.Composite;
const Engine = Matter.Engine;
const Events = Matter.Events;

class Tank {
    constructor(world, initPos, turret) {
        // Create compound body representing tank & turret
        this.tank = Body.create({
            parts: [
                turret,
                Bodies.rectangle(initPos.x, initPos.y, 225, 100,)
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
        Body.setPosition(turret, this.tank.position);
        // TODO:do above before adding turret to world??

        // Add tank to the world
        Composite.add(world, [this.tank]);
    }

    setupEventListeners(socket, engine) {
        let thiss = this;

        Events.on(engine, "afterUpdate", function (event) {
            thiss.matterUpdated = true;
        });

        // Apply the force vector for forward/backward movement
        socket.on("move forward", function (data) {
            // Create a force vector
            let dx = Math.cos(thiss.tank.angle) * thiss.speed;
            let dy = Math.sin(thiss.tank.angle) * thiss.speed;

            if (true) {
                Body.applyForce(
                    thiss.tank,
                    { x: thiss.tank.position.x, y: thiss.tank.position.y },
                    { x: dx, y: dy }
                );
                thiss.matterUpdated = false;
            }
            //socket.emit("render position", { "position": thiss.tank.position });/// 
        });
        socket.on("move backward", function (data) {
            // Create a force vector
            let dx = Math.cos(thiss.tank.angle) * thiss.speed;
            let dy = Math.sin(thiss.tank.angle) * thiss.speed;

            if (true) {
                Body.applyForce(
                    thiss.tank,
                    { x: thiss.tank.position.x, y: thiss.tank.position.y },
                    { x: -dx, y: -dy }
                );
                thiss.matterUpdated = false;
            }
            //socket.emit("render position", { "position": thiss.tank.position });/// 
        });

        // Apply torque for right/left turn
        socket.on("turn right", function (data) {
            if (true) {
                thiss.tank.torque = thiss.rotationSpeed;
                thiss.matterUpdated = false;
            }
            //socket.emit("render angle", { "angle": thiss.tank.angle });///
            //Body.update(thiss.tank, 1000 / 60, 1, 1); ///
        });
        socket.on("turn left", function (data) {
            if (true) {
                thiss.tank.torque = -thiss.rotationSpeed;
                thiss.matterUpdated = false;
            }
            //socket.emit("render angle", { "angle": thiss.tank.angle });///
            //Body.update(thiss.tank, 1000 / 60, 1, 1); ///
        });
    }
}

module.exports = { Tank };