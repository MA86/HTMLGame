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

// Search requested files inside client folder, first
httpHandler.use(express.static(__dirname + "/client"));

// For GET request at '/', send index.html file
httpHandler.get("/", function (req, res) {
    res.sendFile(__dirname + "/client/index.html");
});

// When client connects
serverSocket.on("connection", function (socket) {
    console.log("a user connected");
    // When client position data is recieved
    socket.on("tank position", function (pos) {
        // Broadcast to everyone except emitting client
        socket.broadcast.emit("tank position", pos);
    });
    // When client rotation data is recieved
    socket.on("tank rotation", function (rot) {
        // Broadcast to everyone except emitting client
        socket.broadcast.emit("tank rotation", rot);
    });
});

// When an input data is recieved
serverSocket.on("tank position", function (pos) {

});

// Start HTTP server, listening on port 8000
httpServer.listen(8000, function () {
    console.log("HTTP SERVER IS LISTENING ON PORT 8000");
});
