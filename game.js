/* TODO: Define tank blueprint */
const Tank = function(xPos, yPos, rotationSpeed, speed, sprite) {
  // Initialize all attributes
  this.position = {
    "x": xPos,
    "y": yPos
  };
  this.speed = speed;                 // Pixels per second
  this.rotation = 0;                  // Degrees
  this.rotationSpeed = rotationSpeed; // Degrees per second
  this.sprite = sprite;

  this.render = function(ctx) {
    let spriteCenter = {
      "x": this.sprite.naturalWidth / 2,
      "y": this.sprite.naturalHeight / 2
    };
    // Rotate around self
    ctx.save();
    ctx.translate(this.position.x + spriteCenter.x, this.position.y + spriteCenter.y);
    ctx.rotate(this.rotation * Math.PI / 180);
    console.log(this.rotation);
    ctx.drawImage(this.sprite, -spriteCenter.x, -spriteCenter.y);
    ctx.restore();
  }

  this.update = function(keysDown, dt) {
    if (keysDown.ArrowUp == true) {
      this.position.y -= this.speed * dt;
    }
    if (keysDown.ArrowDown == true) {
      this.position.y += this.speed * dt;
    }
    if (keysDown.ArrowRight == true) {
      //this.position.x += this.speed * dt;
      this.rotation += this.rotationSpeed * dt;
    }
    if (keysDown.ArrowLeft == true) {
      //this.position.x -= this.speed * dt;
      this.rotation -= this.rotationSpeed * dt;
    }
  }
}

/* TODO: Define background blueprint */
const Background = function(bgSprite) {
  this.bgSprite = bgSprite;

  this.render = function(ctx) {
    ctx.drawImage(this.bgSprite, 50, 50);
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
  // Global variables
  var gameCanvas = document.getElementById("game-canvas");
  var ctx = gameCanvas.getContext("2d");
  var keysDown = {};
  var timeNow;
  var timeThen;

  // Set background
  let bgImage = new Image();
  bgImage.src = "images/grass.png";
  let background = new Background(bgImage);

  // Set input event listeners
  addInputEventListeners(keysDown);

  // Set tank
  let tankImage = new Image();
  tankImage.src = "images/icon.png";
  let tank = new Tank(100,100,90,100,tankImage);

  // Game loop
  const main = function() {
    timeNow = Date.now();
    let delta = (timeNow - timeThen) / 1000.0;

    ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
    background.render(ctx);

    tank.render(ctx);
    tank.update(keysDown, delta);

    window.requestAnimationFrame(main);
    timeThen = timeNow;
  }
  // Start game
  timeThen = Date.now()
  main();
});
