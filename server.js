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
    res.sendFile(__dirname + "./client/index.html");
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
global.shellID = 0;
global.staticObjectID = 0;
global.entities = [];
global.staticEntities = [];

// Variables
var engine;
var world;


const Start = function () {
    // Create engine
    engine = Engine.create({
        gravity: { x: 0, y: 0 },
        // enableSleeping: true,
        // timing: {timeScale: 0.1},
    });

    world = engine.world;

    let lastUpdateTime = Date.now();
    setImmediate(function x() {
        let timeNow = Date.now();
        let timeElapsed = timeNow - lastUpdateTime
        if (timeElapsed > 1000 / 120) {
            lastUpdateTime = timeNow

            //*** Game Loop Start ***//
            Engine.update(engine, timeElapsed);

            if (entities.length > 0) {
                for (let index = 0; index < entities.length; index++) {
                    const entity = entities[index];

                    // Update clients
                    if (entity instanceof Shell) {
                        socketServer.emit(
                            "update shell",
                            {
                                "clientID": entity.clientID,
                                "shellID": entity.shellID,
                                "position": entity.body.position,
                                "angle": entity.body.angle,
                            }
                        );
                    }
                    if (entity instanceof Tank) {
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
        }
        setImmediate(x);
    });
}

Start();

// Trigger when a new client opens TCP/UDP socket
socketServer.on("connection", function (socket) {
    // Print client ID
    console.log("Client ", socket.id, " is connected");

    // Prepare an entity for client
    let entity = new Tank({ "x": 0, "y": 0 }, world, socket, socketServer, null, engine);
    entities.push(entity);
    // TODO: send clients static list too.
    // when new client enters, load shells on his screen too!
    // Tell clients to create entity representations
    for (let index = 0; index < entities.length; index++) {
        let entity = entities[index];
        socketServer.emit("create entities", { "clientID": entity.clientID });
    }

    // Trigger when client exits
    socket.on("disconnect", () => {
        // Print client ID
        console.log("Client ", socket.id, " is disconnected");

        // Remove entity from server
        let indexOfDisconnectedClient = entities.map(function (obj) {
            return obj.clientID;
        }).indexOf(socket.id);
        entities.splice(indexOfDisconnectedClient, 1);

        // Remove entity from browsers
        socketServer.emit("remove entities", { "clientID": socket.id });
    });
});

// Start the HTTP server (listening on port 8000)
httpServer.listen(443, function () {
    console.log("HTTP SERVER IS LISTENING ON PORT 8000");
});
