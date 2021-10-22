"use strict";

const process = require("process");
// Import Express
const express = require("express");
// Handler function
const httpHandler = express();
// Create HTTP server (httpHandler handles HTTP requests)
const httpServer = require("http").createServer(httpHandler);
// Import Socket
const socket = require("socket.io");
// Create Socket server (httpServer passed because all websockets start with http message)
const serverSocket = new socket.Server(httpServer);

// Variables
var clientDataList = [];
var temp = 0; // TODO: create a separate INITIAL variable.

// Search requested files inside client folder, first
httpHandler.use(express.static(__dirname + "/client"));

// For GET request at '/', send index.html file
httpHandler.get("/", function (req, res) {
    res.sendFile(__dirname + "/client/index.html");
});

// When a new client connects
serverSocket.on("connection", function (socket) {
    console.log("a client connected");
    // TODO: see temp above.
    // Add client to the server list and set initial states
    clientDataList.push({
        "clientId": socket.id,
        "state": {
            "tankInitPos": { "x": 300 + temp, "y": 200 + temp },
            "tankForce": { "x": 0, "y": 0 },
            "tankTorque": 0,
            "turAngle": 0,
            "shellForce": { x: 0, y: 0 }
        }
    });
    temp += 130;

    // When this client disconnects
    socket.on("disconnect", () => {
        console.log("a client disconnected");
        // Remove this client from server list
        let indexOfDisconnectedClient = clientDataList.map(function (obj) {
            return obj.clientId;
        }).indexOf(socket.id);
        clientDataList.splice(indexOfDisconnectedClient, 1);

        // Direct all clients to remove this client from thier entities list
        serverSocket.emit("remove tank", socket.id);
    });

    // TODO: Wait a bit so clients are ready
    setTimeout(function () {
        // Direct existing clients (except this client) to create this client
        socket.broadcast.emit("create tank", clientDataList[clientDataList.length - 1]);
        // Direct this client to create self and all existing clients
        socket.emit("create tanks", clientDataList);

        // *** This client will send its state updates to the server: *** //
        socket.on("tank movement", function (data) {
            // Update the state changes in the server list
            for (let i = 0; i < clientDataList.length; i++) {
                const client = clientDataList[i];
                if (client.clientId == data.clientId) {
                    clientDataList[i].state.tankForce = data.tankForce;
                }
            }
            // Broadcast state changes to everyone
            serverSocket.emit("tank movement", data);
        });
        socket.on("tank rotation", function (data) {
            // Update the state changes in the server list
            for (let i = 0; i < clientDataList.length; i++) {
                const client = clientDataList[i];
                if (client.clientId == data.clientId) {
                    clientDataList[i].state.tankTorque = data.tankTorque;
                }
            }
            // Broadcast state changes to everyone
            serverSocket.emit("tank rotation", data);
        });
        socket.on("turret angle", function (data) {
            // Update the state changes in the server list
            for (let i = 0; i < clientDataList.length; i++) {
                const client = clientDataList[i];
                if (client.clientId == data.clientId) {
                    clientDataList[i].state.turAngle = data.turAngle;
                }
            }
            // Broadcast state changes to everyone
            serverSocket.emit("turret angle", data);
        });
        socket.on("shell movement", function (data) {
            // Update the state changes in the server list
            for (let i = 0; i < clientDataList.length; i++) {
                const client = clientDataList[i];
                if (client.clientId == data.clientId) {
                    clientDataList[i].state.shellForce = data.shellForce;
                }
            }
            // Broadcast state changes to everyone
            serverSocket.emit("shell movement", data);
        });
    }, 500);
});


// Start HTTP server, listening on port 8000
httpServer.listen(8000, function () {
    console.log("HTTP SERVER IS LISTENING ON PORT 8000");
});
