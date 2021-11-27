"use strict";

// NOTE: require() function executes a module and returns exports
const Tank = require("./server_entities/tank.js").Tank;
const Turret = require("./server_entities/turret.js").Turret;

// Returns a function object called 'express'
const express = require("express");

// Call express to create HTTP handler object for HTTP server
const httpHandler = express();
const httpServer = require("http").createServer(httpHandler);

// Create TCP/UDP socket server (httpServer passed because all "websockets" start with HTTP handshake)
const socket = require("socket.io");
const socketServer = new socket.Server(httpServer);

// Treat the client folder as "public folder"
// (Requested files will be searched here first)
httpHandler.use(express.static(__dirname + "/client"));

// For GET request @ path "/", send index.html file
httpHandler.get("/", function (req, res) {
    res.sendFile(__dirname + "./client/index.html");
});

const Matter = require("matter-js/build/matter");

// Create aliases for Matter exports
const Engine = Matter.Engine;         // For updating physics.
const Render = Matter.Render;         // For rendering results of Engine.
const Bodies = Matter.Bodies;         // To use a pre-made Body.
const Composite = Matter.Composite;   // Container for entity made of multiple parts.
const Body = Matter.Body;             // To make a custom Body.
const Runner = Matter.Runner;         // Optional game loop (Auto updates Engine).
const Events = Matter.Events;

// Global variables
var entities = [];
var engine = null;
var world = null;

const Start = function () {
    // Create engine
    engine = Engine.create({
        gravity: { x: 0, y: 0 },
        // enableSleeping: true,
        // timing: {timeScale: 0.1},
    });

    world = engine.world;

    // Game Loop //
    setInterval(function () {
        Engine.update(engine, 1000 / 60);

        if (entities.length > 0) {
            for (let index = 0; index < entities.length; index++) {
                const tank = entities[index];
                // Tell clients to update
                socketServer.emit(
                    "update",
                    {
                        "entityID": tank.clientID,
                        "position": tank.body.position,
                        "angle": tank.body.angle,
                        "turretAngle": tank.turret.body.angle
                    }
                );
            }
        }
    }, 1000 / 120);
}

// Start game
Start();

// Trigger when a new client opens TCP/UDP socket
socketServer.on("connection", function (socket) {
    // Print client ID
    console.log("Client ", socket.id, " is connected");

    // Setup client
    let client = new Tank({ "x": 0, "y": 0 }, world, socket, null);
    client.setupEventListeners();
    entities.push(client);

    // Emit event to create a tank for each entity in entities list
    for (let index = 0; index < entities.length; index++) {
        let tank = entities[index];
        socketServer.emit("create tanks", { "clientID": tank.clientID });
    }

    // Trigger when client leaves
    socket.on("disconnect", () => {
        // Print this client ID
        console.log("Client ", socket.id, " is disconnected");
    });
});

// Start the HTTP server (listening on port 8000)
httpServer.listen(8000, function () {
    console.log("HTTP SERVER IS LISTENING ON PORT 8000");
});
