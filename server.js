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
var clientData = [];

// Search requested files inside client folder, first
httpHandler.use(express.static(__dirname + "/client"));

// For GET request at '/', send index.html file
httpHandler.get("/", function (req, res) {
    res.sendFile(__dirname + "/client/index.html");
});

// TODO: Create spawn point, add it to clientData
const spawnPoint = function () {
    // Find an available spawn point, 1/10
    // Return the location
}

// When a new client connects
serverSocket.on("connection", function (socket) {
    console.log("a client connected");
    // Initialize this client and add to list
    clientData.push({
        "clientId": socket.id,
        "state": {
            "pos": { "x": 300, "y": 200 },
            "rot": 0,
            "turRot": 0
        }
    });
    // When this client disconnects
    socket.on("disconnect", () => {
        console.log("a client disconnected");
        // Remove disconnected client from list
        let indexOfDisconnectedClient = clientData.map(function (obj) {
            return obj.clientId;
        }).indexOf(socket.id);
        clientData.splice(indexOfDisconnectedClient, 1);
        // Remove disconnected client from active clients' list
        serverSocket.emit("remove tank", socket.id);
    });
    // TODO: Wait a bit so clients are ready
    setTimeout(function () {
        // Tell current clients to create this client
        socket.broadcast.emit("create tank", clientData[clientData.length - 1]);
        // Tell this client to create all current clients
        socket.emit("create tanks", clientData);

        // *** This client will update server on: *** //
        socket.on("tank position", function (data) {
            // Store state
            for (let i = 0; i < clientData.length; i++) {
                const client = clientData[i];
                if (client.clientId == data.clientId) {
                    clientData[i].state.pos = data.pos;
                }
            }
            // Broadcast to everyone
            serverSocket.emit("tank position", data);
        });
        socket.on("tank rotation", function (data) {
            for (let i = 0; i < clientData.length; i++) {
                const client = clientData[i];
                if (client.clientId == data.clientId) {
                    clientData[i].state.rot = data.rot;
                }
            }
            // Broadcast to everyone
            serverSocket.emit("tank rotation", data);
        });
        socket.on("turret rotation", function (data) {
            for (let i = 0; i < clientData.length; i++) {
                const client = clientData[i];
                if (client.clientId == data.clientId) {
                    clientData[i].state.turRot = data.rot;
                }
            }
            // Broadcast to everyone
            serverSocket.emit("turret rotation", data);
        });
    }, 2000);
});


// Start HTTP server, listening on port 8000
httpServer.listen(8000, function () {
    console.log("HTTP SERVER IS LISTENING ON PORT 8000");
});
