// Import/initialize Express (a web framework)
const app = require("express")();
// Import/initialize HTTP server (app is called to handle HTTP requests)
const httpServer = require("http").createServer(app);

// Serve index.html file
app.get("/", function (req, res) {
    res.sendFile(__dirname + "/client/index.html");
});
