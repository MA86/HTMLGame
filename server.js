"use strict";

// NOTE: require() function executes a module and returns exports
const Tank = require("./server_entities/tank.js").Tank;
const Turret = require("./server_entities/turret.js").Turret;
const Shell = require("./server_entities/shell.js").Shell;

// Returns a function object called 'express'
const express = require("express");

// Call express to create HTTP handler object for HTTP server
const httpHandler = express();
const httpServer = require("http").createServer(httpHandler);

// Create TCP/UDP socket server (httpServer passed because all "websockets" start with HTTP handshake)
const socket = require("socket.io");
const socketServer = new socket.Server(httpServer);

// Treat client's folder as "public folder"
// (Requested files will be searched here first)
httpHandler.use(express.static(__dirname + "/client"));

// For GET request @ path "/", send index.html file
httpHandler.get("/", function (req, res) {
    res.sendFile(__dirname + "/client/index.html");
});

// Aliases for Matter exports
const Matter = require("matter-js/build/matter");
const Engine = Matter.Engine;         // For updating physics.
const Render = Matter.Render;         // For rendering results of Engine.
const Bodies = Matter.Bodies;         // To use a pre-made Body.
const Composite = Matter.Composite;   // Container for entity made of multiple parts.
const Body = Matter.Body;             // To make a custom Body.
const Runner = Matter.Runner;         // Optional game loop (Auto updates Engine).
const Events = Matter.Events;

// Global variables
global.staticObjectID = 0;
global.entities = [];
global.staticEntities = [];

// Variables
var engine;
var world;
var tickRate = 1000 / 10;

const Start = function () {
    // Create engine
    engine = Engine.create({
        gravity: { x: 0, y: 0 },
        // enableSleeping: true,
        // timing: {timeScale: 0.1},
    });

    world = engine.world;

    setInterval(function loop() {
        //*** Game Loop Start ***//
        Engine.update(engine, 1000 / 60);

        if (entities.length > 0) {
            for (let index = 0; index < entities.length; index++) {
                const entity = entities[index];

                // Update clients
                if (entity instanceof Shell) {
                    console.log(entity.clientID + " Shell")///
                    socketServer.emit(
                        "update shell",
                        {
                            "clientID": entity.clientID,
                            "shellID": entity.shellID,///
                            "position": entity.body.position,
                            "angle": entity.body.angle,
                        }
                    );
                }
                if (entity instanceof Tank) {
                    console.log(entity.clientID + " Tank")///
                    socketServer.emit(
                        "update tank and turret",
                        {
                            "clientID": entity.clientID,
                            "position": entity.body.position,
                            "angle": entity.body.angle,
                            "turretAngle": entity.turret.body.angle
                        }
                    );
                }
            }
        }
        //*** Game Loop End ***//
    }, tickRate);
}

Start();

// When a new client connects to server...
socketServer.on("connection", function onConnect(socket) {
    // Print this client ID
    console.log("Client ", socket.id, " is connected");

    // Create a new tank for this client, add it to entities list
    let entity = new Tank({ "x": 0, "y": 0 }, world, socket, socketServer, null, engine);
    entities.push(entity);
    // TODO: send clients static list too.
    // TODO: when new client enters, load shells on his screen too!
    // TODO: send them start screen!
    // For every item in the entities list, broadcast message to connected clients to create items
    entities.forEach(function (item, index, arr) {
        if (item instanceof Tank) {
            socketServer.emit("create client", { "clientID": item.clientID });
        }
    });
    entities.forEach(function (item, index, arr) {
        if (item instanceof Shell) {
            socketServer.emit("create shell", { "clientID": item.clientID, "shellID": item.shellID });
        }
    });

    // When this socket disconnects...
    socket.on("disconnect", function onDisconnect() {
        // Print this client's socket.id
        console.log("Client ", socket.id, " is disconnected");

        // Broadcast message to connected clients to delete items associated with this client
        entities.slice().reverse().forEach(function (item, index, arr) {
            if (item instanceof Tank && item.clientID == socket.id) {
                entities[arr.length - 1 - index].cleanupSelf();
                entities.splice(arr.length - 1 - index, 1);

                // Tell clients to remove this entity as well
                socketServer.emit("delete client", { "clientID": item.clientID });
            }
        });
        entities.slice().reverse().forEach(function (item, index, arr) {
            if (item instanceof Shell && item.clientID == socket.id) {
                entities[arr.length - 1 - index].cleanupSelf();
                entities.splice(arr.length - 1 - index, 1);

                // Tell clients to remove this entity as well
                socketServer.emit("delete shall", { "clientID": item.clientID });
            }
        });
        // TODO: Auto destroy shell like treads
    });
});

// Start the HTTP server (listening on port 8000)
httpServer.listen(process.env.PORT || 5000, function () {
    console.log("HTTP SERVER IS LISTENING ON PORT " + process.env.PORT);
});
