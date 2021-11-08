"use strict";

// NOTE: require() function executes a module and returns exports
const Tank = require("./server_entities/tank.js").Tank;
const Turret = require("./server_entities/turret.js").Turret;

// Returns a function object called 'express'
const express = require("express");

// Call express object to return HTTP handler object
const httpHandler = express();
// Create HTTP server, let HTTP handler handle requests
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

// TODO:
// D When first client connects, run simulation:
// D 1. Send HTML and script to browser.
// Prepare canvas tag.
// Prepare img tag.
// Prepare ...

// Run a update loop.
// "Key pressed!" - Client
// "Ok, render at this position!" - Server
// When last client leaves, stop game.
// Stop simulation.
const Start = function (socket) {
    // Create engine
    let engine = Engine.create({
        gravity: { x: 0, y: 0 },
        // enableSleeping: true,
        // timing: {timeScale: 0.1},
    });

    // Setup client
    let turret = new Turret(engine.world, { "x": 100, "y": 100 });
    let tank = new Tank(engine.world, turret.turret);
    turret.parent = tank;
    turret.setupEventListeners(socket);
    tank.setupEventListeners(socket);

    // Update physics and client every 16ms
    setInterval(function () {
        Engine.update(engine, 1000 / 60);
        //TODO
        socket.emit("render coordinates", { "position": tank.tank.position, "angle": tank.tank.angle });
        //socket.emit("render coordinates s", { "position": tank.tank.position, "angle": tank.tank.angle });
    }, 1000 / 60);
}

// Event when a client connects to TCP/UDP server
socketServer.on("connection", function (socket) {
    // Print this client ID
    console.log("Client ", socket.id, " is connected");

    // Add this client to the list
    clients.push({
        "clientId": socket.id,
        "state": {
            "position": { "x": 0, "y": 0 },
            "rotation": 0
        }
    });

    Start(socket);

    // Event when this client disconnects from TCP/UDP server
    socket.on("disconnect", () => {
        // Print this client ID
        console.log("Client ", socket.id, " is disconnected");
        /*
        // Remove this client from the list
        let indexOfDisconnectedClient = clients.map(function (obj) {
            return obj.clientId;
        }).indexOf(socket.id);
        clients.splice(indexOfDisconnectedClient, 1);
        */
    });
});


// Start the HTTP server (listening on port 8000)
httpServer.listen(8000, function () {
    console.log("HTTP SERVER IS LISTENING ON PORT 8000");
});
