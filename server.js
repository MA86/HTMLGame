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

const Matter = require("matter-js/build/matter");

// Create aliases for Matter exports
const Engine = Matter.Engine;         // For updating physics.
const Render = Matter.Render;         // For rendering results of Engine.
const Bodies = Matter.Bodies;         // To use a pre-made Body.
const Composite = Matter.Composite;   // Container for entity made of multiple parts.
const Body = Matter.Body;             // To make a custom Body.
const Runner = Matter.Runner;         // Optional game loop (Auto updates Engine).

// Global variables
const clients = [];

// Treat the client folder as "public folder"
// (Requested files will be searched here first)
httpHandler.use(express.static(__dirname + "/client"));

// For GET request @ path "/", send index.html file
httpHandler.get("/", function (req, res) {
    res.sendFile(__dirname + "./client/index.html");
});

const Start = function (socket) {
    // Create engine
    let engine = Engine.create({
        gravity: { x: 0, y: 0 },
        // enableSleeping: true,
        // timing: {timeScale: 0.1},
    });

    // Setup client
    let turret = new Turret(engine.world, { "x": 0, "y": 0 });
    let tank = new Tank(engine.world, { "x": 0, "y": 0 }, turret.turret);
    turret.parent = tank.tank;
    turret.setupEventListeners(socket, engine);
    tank.setupEventListeners(socket, engine);

    /*
    // TEST //
    let box = Bodies.rectangle(0, 0, 100, 100);
    Composite.add(engine.world, [box]);
    */

    // Update physics and client every 16ms
    setInterval(function () {
        //Engine.update(engine, 1000 / 60);
        //console.log(engine.timing.lastElapsed); ///

        /*
        //TEST//
        Body.applyForce(
            box,
            { x: box.position.x, y: box.position.y },
            { x: 0.004, y: 0.004 }
        );
        box.torque = 1;
        console.log(box.angle, box.position);
        */

        //socket.emit("turret state", { "angle": turret.turret.angle }); ///
    }, 1000 / 60);
}

// Event when a client connects to TCP/UDP server
socketServer.on("connection", function (socket) {
    // Print this client ID
    console.log("Client ", socket.id, " is connected");

    Start(socket);

    // Event when this client disconnects from TCP/UDP server
    socket.on("disconnect", () => {
        // Print this client ID
        console.log("Client ", socket.id, " is disconnected");
    });
});

// Start the HTTP server (listening on port 8000)
httpServer.listen(8000, function () {
    console.log("HTTP SERVER IS LISTENING ON PORT 8000");
});
