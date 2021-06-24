import { Sprite } from "./sprite"

// Animation
playerAnimation = new Animation()
playerAnimation.addAnimation("walk",new Sprite(playerSpritesheet,walkData,30));
playerAnimation.addAnimation("jump",new Sprite(playerSpritesheet,jumpData,30));
playerAnimation.addAnimation("throw",new Sprite(playerSpritesheet,jumpData,30));

playerAnimation.play("walk")
playerAnimation.playingAnimation


