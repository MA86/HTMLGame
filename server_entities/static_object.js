const Matter = require("matter-js/build/matter");

const Body = Matter.Body;
const Bodies = Matter.Bodies;
const Composite = Matter.Composite;

class StaticObject {
    constructor(posVec, angle, world, eng, server, clientID, time) {
        this.body = Bodies.rectangle(posVec.pdx, posVec.pdy, 4, 8, {
            isStatic: true,
            isSensor: true
        });

        // Properties
        this.clientID = clientID;
        this.staticObjectID = staticObjectID++;
        this.engine = eng;
        this.world = world;
        this.socketServer = server;

        // Set angle
        Body.setAngle(this.body, angle);

        // Add tread mark to the world
        Composite.add(this.world, this.body);

        // Add static object to static list
        staticEntities.push(this);

        // TODO: Remove (fade in client?) after 10 seconds
        this.removeSelf(time);
    }

    removeSelf(time) {
        let thiss = this;
        if (time > -1) {
            // After x amount of time, remove static object
            setTimeout(function () {
                // Tell clients to remove static object
                thiss.socketServer.emit(
                    "destroy static object",
                    {
                        "clientID": thiss.clientID,
                        "staticObjectID": thiss.staticObjectID
                    }
                );

                // Remove this tread marks from entities list
                let indexOfStaticObject = staticEntities.findIndex(function (obj) {
                    if ("staticObjectID" in obj && obj.staticObjectID == thiss.staticObjectID) {
                        return true;
                    }
                });
                staticEntities.splice(indexOfStaticObject, 1);

                // Remove this tread mark body from world
                Composite.remove(thiss.world, thiss.body);
            }, time);
        }
    }
}

module.exports = { StaticObject };