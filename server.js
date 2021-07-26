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
var listOfClientId = [];

// Search requested files inside client folder, first
httpHandler.use(express.static(__dirname + "/client"));

// For GET request at '/', send index.html file
httpHandler.get("/", function (req, res) {
    res.sendFile(__dirname + "/client/index.html");
});

// When client connects
serverSocket.on("connection", function (socket) {
    console.log("a client connected");
    listOfClientId.push({
        "clientId": socket.id
    });

    socket.on("disconnect", () => {
        console.log("a client disconnected");

        // Remove disconnected client from server
        let indexOfDisconnectedClient = listOfClientId.map(function (obj) {
            return obj.clientId;
        }).indexOf(socket.id);
        listOfClientId.splice(indexOfDisconnectedClient);

        // Remove disconnected client from clients' list
        serverSocket.emit("remove tank", socket.id);
    });
    // Wait a bit so clients are ready
    setTimeout(function () {
        // Existing clients creates one tank for new client
        socket.broadcast.emit("create tank", { "clientId": socket.id });
        // New client creates tanks for all existing clients
        socket.emit("create tanks", listOfClientId);
    }, 500);

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
});

// Start HTTP server, listening on port 8000
httpServer.listen(8000, function () {
    console.log("HTTP SERVER IS LISTENING ON PORT 8000");
});
