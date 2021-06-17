// Defines Tank Class //
const Tank = function(xPos, yPos, rotation, speed) {
  this.position = {
    "x": xPos,
    "y": yPos
  };
  this.rotation = rotation;
  this.speed = speed;

  this.setPosition = function(newXPos, newYPos) {
    this.position.x = newXPos;
    this.position.y = newYPos;
  }
  this.setRotation = function(newRot) {
    this.rotation = newRot;
  }
}

// Prepares Canvas //
const readifyCanvas = function() {

} 
// TODO: Prepare canva...
func()