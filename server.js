// Import Express (a web framework)
const express = require("express");
// Call to create app
const app = express();
// Import/initialize HTTP server (app is called to handle HTTP requests)
const httpServer = require("http").createServer(app);

// Serve index.html file at route '/'
app.get("/", function (req, res) {
    res.sendFile(__dirname + "/client/index.html");
});

// Allow browser to GET files from client repository
app.use(express.static(__dirname));
app.use(express.static(__dirname + "/styles"));

// Start HTTP server listening on port 8000
httpServer.listen(8000, function () {
    console.log("HTTP SERVER IS LISTENING ON PORT 8000");
});
