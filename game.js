/* Define tank blueprint */
const Tank = function(xPos, yPos, rotation, speed, sprite) {
  // Initialize all attributes
  this.position = {
    "x": xPos,
    "y": yPos
  };
  this.rotation = rotation;
  this.speed = speed;
  this.sprite = sprite;

  this.render = function(ctx) {
    ctx.drawImage(this.sprite, this.position.x, this.position.y);
  }

  this.update = function(keysDown, dt) {
    if (keysDown.ArrowUp == true) {
      this.position.y -= this.speed * dt;
    }
    if (keysDown.ArrowDown == true) {
      this.position.y += this.speed * dt;
    }
    if (keysDown.ArrowRight == true) {
      this.position.x += this.speed * dt;
    }
    if (keysDown.ArrowLeft == true) {
      this.position.x -= this.speed * dt;
    }
  }
}

const addInputEventListeners = function(dic) {
  addEventListener("keydown", function(e) {
    dic[e.code] = true;
  }, false);

  addEventListener("keyup", function(e) {
    delete dic[e.code];
  }, false);
}

/* On Window load - aka main */
window.addEventListener("load", function(e) {
  // Set global variables
  var gameCanvas = document.getElementById("game-canvas");
  var ctx = gameCanvas.getContext("2d");
  var keysDown = {};
  var timeNow;

  // Handle input
  addInputEventListeners(keysDown);

  // Instantiate tank and image objects
  let tankImage = new Image();
  tankImage.src = "images/icon.png";
  var tank = new Tank(100,100,2,200,tankImage);

  // Game loop
  const main = function() {
    timeNow = Date.now();
    var delta = (timeNow - timeThen) / 1000.0;

    ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
    tank.update(keysDown, delta);
    tank.render(ctx);

    window.requestAnimationFrame(main);
    timeThen = timeNow;
  }
  // Start game
  var timeThen = Date.now()
  main();
});
