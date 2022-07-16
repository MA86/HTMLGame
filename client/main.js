"use strict";

/*** On Window Load Event ***/
window.addEventListener("load", async function (e) {
    // Global Variables 
    window.globals = {};
    window.globals.bgCanvas = document.getElementById("bg-canvas");
    window.globals.bgContext = window.globals.bgCanvas.getContext("2d");
    window.globals.gameCanvas = document.getElementById("game-canvas");
    window.globals.gameContext = window.globals.gameCanvas.getContext("2d");
    window.globals.uiCanvas = document.getElementById("ui-canvas");
    window.globals.uiContext = window.globals.uiCanvas.getContext("2d");
    window.globals.keysDown = {};
    window.globals.spriteSheetsData = {};
    window.globals.entityBlueprints = {};
    window.globals.images = {};
    window.globals.entities = [];
    window.globals.staticEntities = [];
    window.globals.clientIDs = [];
    window.globals.imagePaths = [
        "./images_and_data/mSixTankBody.png",
        "./images_and_data/treadMark.png",
        "./images_and_data/mSixTankTurret.png",
        "./images_and_data/shell.png",
        "./images_and_data/explosions.png", /// Delete if not needed
        "./images_and_data/hit.png",
        "./images_and_data/ground.png"
    ];
    window.globals.clientSocket = null;
    window.globals.serverTickRate = 1000 / 10;     // Milisecond
    window.globals.keyUpHandler = null;
    window.globals.keyDownHandler = null;

    // Download modules in order  ///TODO: Handle reject error let user know
    window.globals.spriteSheetsData = await import("./spritesheetsData.js");
    window.globals.entityModule = await import("./entities/entity.js");
    window.globals.terrainLayerModule = await import("./entities/terrainlayer.js");
    window.globals.spriteModule = await import("./entities/sprite.js");
    window.globals.staticObjectModule = await import("./entities/static_object.js");
    window.globals.tankModule = await import("./entities/tank.js");
    window.globals.turretModule = await import("./entities/turret.js");
    window.globals.shellModule = await import("./entities/shell.js");

    window.globals.keyDownHandler = function (key) {
        // Add key to pressed array
        window.globals.keysDown[key.code] = true;
        // Prevent default key behavior
        switch (key.code) {
            case "ArrowUp":
            case "ArrowDown":
            case "ArrowLeft":
            case "ArrowRight":
            case "Space":
                key.preventDefault();
                break;
            default:
                break;
        }
    }

    window.globals.keyUpHandler = function (key) {
        // Key is no longer 'pressed'
        delete window.globals.keysDown[key.code];
    }

    const setupKeyboardHandler = function () {
        // Listen for key pressed
        addEventListener("keydown", window.globals.keyDownHandler, false);

        // Listen for key released
        addEventListener("keyup", window.globals.keyUpHandler, false);
    }

    const Start = function () {
        // Turn canvases to fullscreen
        window.globals.bgCanvas.width = window.innerWidth;
        window.globals.bgCanvas.height = window.innerHeight;
        window.globals.gameCanvas.width = window.innerWidth;
        window.globals.gameCanvas.height = window.innerHeight;
        window.globals.uiCanvas.width = window.innerWidth;
        window.globals.uiCanvas.height = window.innerHeight;

        // Open socket connection to server and stop using HTTP polling
        window.globals.clientSocket = io({ transports: ['websocket'], upgrade: false });

        // Listen for keyboard input
        setupKeyboardHandler();

        // Render map
        let testTerrain = new window.globals.terrainLayerModule.TerrainLayer(
            0, 0, null, 10, 10, window.globals.images["./images_and_data/ground.png"], 128, 8, 8
        );
        testTerrain.setTiles(window.globals.spriteSheetsData.oasis.layerOne);
        testTerrain.renderThis(window.globals.bgContext);
        testTerrain.setTiles(window.globals.spriteSheetsData.oasis.layerTwo);
        testTerrain.renderThis(window.globals.bgContext);

        // When client connects...
        window.globals.clientSocket.on("create client", function (data) {
            // If a rep for this client isn't already created...
            if (!window.globals.clientIDs.includes(data.clientID)) {
                // Create tank
                let mSixTank = new window.globals.tankModule.Tank(
                    window.globals.images["./images_and_data/mSixTankBody.png"],
                    window.globals.spriteSheetsData.mSixTankBodyData,
                    1,
                    data.clientID,
                    {
                        "ss": window.globals.images,
                        "ssData": window.globals.spriteSheetsData,
                        "fps": 1,
                        "clientID": data.clientID
                    },
                    {
                        "ss": window.globals.images["./images_and_data/shell.png"],
                        "ssData": window.globals.spriteSheetsData.shellData,
                        "fps": 1,
                        "clientID": data.clientID
                    }
                );
                // Add tank to entities list and client to client list
                window.globals.entities.push(mSixTank);
                window.globals.clientIDs.push(data.clientID);
            }
        });

        // When client disconnects...
        window.globals.clientSocket.on("delete client", function (data) {
            // Find and delete all shells belonging to this client
            window.globals.entities.slice().reverse().forEach(function (item, index, arr) {
                if (item instanceof window.globals.tankModule.Tank && item.clientID == data.clientID) {
                    console.log(window.globals.entities[arr.length - 1 - index].clientID + " tank")///
                    window.globals.entities[arr.length - 1 - index].cleanupSelf();
                    window.globals.entities.splice(arr.length - 1 - index, 1);

                    // Find and delete clientID
                    let indexOfClient = window.globals.clientIDs.indexOf(data.clientID);
                    window.globals.clientIDs.splice(indexOfClient, 1);
                }
            });
            /*
            window.globals.entities.slice().reverse().forEach(function (item, index, arr) {
                if (item instanceof window.globals.shellModule.Shell && item.clientID == data.clientID) {
                    console.log(window.globals.entities[arr.length - 1 - index].clientID)///
                    //window.globals.entities[arr.length - 1 - index].cleanupSelf();
                    window.globals.entities.splice(arr.length - 1 - index, 1);
                }
            });
            */
        });
        ///
        window.globals.clientSocket.on("delete shall", function (data) {
            window.globals.entities.slice().reverse().forEach(function (item, index, arr) {
                if (item instanceof window.globals.shellModule.Shell && item.clientID == data.clientID) {
                    console.log(window.globals.entities[arr.length - 1 - index].clientID + " shell")///
                    //window.globals.entities[arr.length - 1 - index].cleanupSelf();
                    window.globals.entities.splice(arr.length - 1 - index, 1);
                }
            });
        });

        // Client Loop //
        var delta = 0;
        var timeNow = 0;
        var timeThen = 0;

        (function gameLoop(timeStamp) {
            // Calculate time between two frames
            timeNow = timeStamp;
            delta = (timeNow - timeThen);

            // Update game-canvas's entities
            for (let i = 0; i < window.globals.entities.length; i++) {
                window.globals.entities[i].update(window.globals.keysDown, delta);
            }

            // Clear game-canvas
            window.globals.gameContext.clearRect(
                0,
                0,
                window.globals.gameCanvas.width,
                window.globals.gameCanvas.height
            );

            // Render game-canvas's static entities
            for (let i = 0; i < window.globals.staticEntities.length; i++) {
                window.globals.staticEntities[i].render(window.globals.gameContext, 1000, delta);
            }

            // Render game-canvas's entities
            for (let i = 0; i < window.globals.entities.length; i++) {
                window.globals.entities[i].render(window.globals.gameContext, 1000, delta);
            }

            // Request to run Game Loop again
            window.requestAnimationFrame(gameLoop);
            timeThen = timeNow;
        })();
    }

        // Self-Invoking Starting Point: image assets loaded here
        ; (function () {
            // Download sprites 
            let numImagesLoaded = 0;
            let numImagesRequested = window.globals.imagePaths.length;
            for (let i = 0; i < numImagesRequested; i++) {
                let image = new Image();
                image.src = window.globals.imagePaths[i];

                image.onload = function () {
                    window.globals.images[window.globals.imagePaths[i]] = image;
                    numImagesLoaded++;
                    if (numImagesLoaded == numImagesRequested) {
                        // Start when assets are loaded
                        Start();
                    }
                }
            }
        })();
});
