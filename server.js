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

// Search requested files inside client folder, first
httpHandler.use(express.static(__dirname + "/client"));

// For GET request at '/', send index.html file
httpHandler.get("/", function (req, res) {
    res.sendFile(__dirname + "/client/index.html");
});

// TODO: Create spawn point, add it to clientDataList
const spawnPoint = function () {
    // Find an available spawn point, 1/10
    // Return the location
}

// When a client connects
serverSocket.on("connection", function (socket) {
    console.log("a client connected");
    // Initialize new client and add to list
    clientDataList.push({
        "clientId": socket.id,
        "state": {
            "pos": { "x": 300, "y": 200 },
            "rot": 45
        }
    });
    // When client disconnects
    socket.on("disconnect", () => {
        console.log("a client disconnected");
        // Remove disconnected client from list
        let indexOfDisconnectedClient = clientDataList.map(function (obj) {
            return obj.clientId;
        }).indexOf(socket.id);
        clientDataList.splice(indexOfDisconnectedClient, 1);
        // Remove disconnected client from clients' list
        serverSocket.emit("remove tank", socket.id);
    });

    // TODO: Wait a bit so clients are ready
    setTimeout(function () {
        // Tell existing clients to create the new client
        socket.broadcast.emit("create tank", clientDataList[clientDataList.length - 1]);
        // Tell the new client to create all existing clients
        socket.emit("create tanks", clientDataList);

        // *** Listen for client data here *** //
        socket.on("tank position", function (data) {
            // Broadcast to everyone
            serverSocket.emit("tank position", data);
        });
        socket.on("tank rotation", function (data) {
            // Broadcast to everyone
            serverSocket.emit("tank rotation", data);
        });
        socket.on("turret rotation", function (data) {
            // Broadcast to everyone
            serverSocket.emit("turret rotation", data);
        });
    }, 500);
});

// Start HTTP server, listening on port 8000
httpServer.listen(8000, function () {
    console.log("HTTP SERVER IS LISTENING ON PORT 8000");
});
