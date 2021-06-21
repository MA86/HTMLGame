/* Define tank blueprint */
const Tank = function(xPos, yPos, rotationSpeed, speed, sprite) {
  // Initialize all attributes
  this.position = {
    "x": xPos,
    "y": yPos
  };
  this.speed = speed;
  // Pixels per second
  this.rotation = 0;
  // Degrees
  this.rotationSpeed = rotationSpeed;
  // Degrees per second
  this.sprite = sprite;
  // Image object

  this.render = function(ctx) {
    let spriteCenter = {
      "x": this.sprite.naturalWidth / 2,
      "y": this.sprite.naturalHeight / 2
    };
    // Rotate around self
    ctx.save();
    ctx.translate(this.position.x + spriteCenter.x, this.position.y + spriteCenter.y);
    ctx.rotate(this.rotation * Math.PI / 180);
    ctx.drawImage(this.sprite, -spriteCenter.x, -spriteCenter.y);
    ctx.restore();
  }

  this.update = function(keysDown, dt) {
    let rotationInRadian = this.rotation * Math.PI / 180;
    let dx = Math.cos(rotationInRadian) * (this.speed * dt);
    let dy = Math.sin(rotationInRadian) * (this.speed * dt);

    // Move forward/backward
    if (keysDown.ArrowUp == true) {
      this.position.x += dx;
      this.position.y += dy;
    }
    if (keysDown.ArrowDown == true) {
      this.position.x -= dx;
      this.position.y -= dy;
    }

    // Rotate right/left
    if (keysDown.ArrowRight == true) {
      this.rotation += this.rotationSpeed * dt;
    }
    if (keysDown.ArrowLeft == true) {
      this.rotation -= this.rotationSpeed * dt;
    }
    // Wrap around
    this.rotation = this.rotation % 360;
  }
}

/* Define background blueprint */
const Background = function(bgSprite) {
  this.bgSprite = bgSprite;

  this.render = function(ctx) {
    ctx.drawImage(this.bgSprite, 50, 50);
  }

  this.update = function(keysDown, dt) {// does nothing
  }
}

const addKeyboardInputEventListeners = function(dic) {
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
  var entities = [];

  // Set keyboard event listeners
  addKeyboardInputEventListeners(keysDown);

  // Background entity
  let bgImage = new Image();
  bgImage.src = "images/grass.png";
  let background = new Background(bgImage);
  entities.push(background)

  // Tank entity
  let tankImage = new Image();
  tankImage.src = "images/icon.png";
  let tank = new Tank(100,100,50,100,tankImage);
  entities.push(tank)

  // Game loop
  var timeNow;
  var timeThen;
  const main = function() {
    timeNow = Date.now();
    let delta = (timeNow - timeThen) / 1000.0;

    ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
    background.render(ctx);

    // Update entities
    for (let i = 0; i < entities.length; i++) {
      entities[i].update(keysDown,delta)
    }

    // Render entities
    for (let i = 0; i < entities.length; i++) {
      entities[i].render(ctx)
    }
    // Call main for every frame
    window.requestAnimationFrame(main);
    timeThen = timeNow;
  }
  timeThen = Date.now()
  main();   // Initial call
});
