class Entity {
    constructor(pos, rot, parent) {
        this.position = pos;
        this.rotation = rot;
        this.parent = parent;
        this.children = [];
        if (parent != null)
            parent.children.push(this);
    }

    render(ctx) {
        ctx.save();
        ctx.translate(this.position.x, this.position.y);
        ctx.rotate(this.rotation * Math.PI / 180);

        this.renderThis(ctx);

        for (let i = 0; i < this.children.length; i++) {
            const child = this.children[i];
            child.render(ctx);
        }
        ctx.restore();
    }

    renderThis(ctx) {
        // Derived class defines this method
    }

    update(keysDown, dt) {
        this.updateThis(keysDown, dt);
        for (let i = 0; i < this.children.length; i++) {
            const child = this.children[i];
            child.update(keysDown, dt);
        }
    }

    updateThis(keysdown, dt) {
        // Derived class defines this method
    }
}

class Tank extends Entity {
    constructor(pos, rot, parent, ssPath, ssData) {
        super(pos, rot, parent);
        this.speed = 70;             // Unit: PPS       
        this.rotationSpeed = 20;     // Unit: DPS
        this.children.push(
            new Sprite({ "x": 0, "y": 0 }, 0, this, ssPath.tank, ssData.mSixTankBodyData, 0)
        );
        this.children.push(
            new Turret({ "x": 0, "y": 20 }, 0, this, ssPath.turret, ssData.mSixTankTurretData, 0)
        );
        this.children.push(
            new Turret({ "x": 0, "y": -20 }, 0, this, ssPath.turret, ssData.mSixTankTurretData, 0)
        );

    }

    updateThis(keysDown, dt) {
        let rotationInRadian = this.rotation * Math.PI / 180;
        let dx = Math.cos(rotationInRadian) * (this.speed * dt);
        let dy = Math.sin(rotationInRadian) * (this.speed * dt);

        // Forward/backward
        if (keysDown && keysDown.ArrowUp == true) {
            this.position.x += dx;
            this.position.y += dy;
        }
        if (keysDown && keysDown.ArrowDown == true) {
            this.position.x -= dx;
            this.position.y -= dy;
        }

        // Rotate right/left
        if (keysDown && keysDown.ArrowRight == true) {
            this.rotation += this.rotationSpeed * dt;
        }
        if (keysDown && keysDown.ArrowLeft == true) {
            this.rotation -= this.rotationSpeed * dt;
        }
        // Wrap around
        this.rotation = this.rotation % 360;
    }
}

class Sprite extends Entity {
    constructor(pos, rot, parent, spriteSheetPath, spriteSheetData, framesPerSecond) {
        super(pos, rot, parent);
        this.index = 0;
        this.framesPerSecond = framesPerSecond;
        this.timeTracker = 0;
        this.spriteSheetData = spriteSheetData;
        this.spriteSheet = new Image();
        this.spriteSheet.src = spriteSheetPath;

    }
    renderThis(ctx) {
        let frameCenter = {
            "x": this.spriteSheetData.frames[this.index].frame.w / 2,
            "y": this.spriteSheetData.frames[this.index].frame.h / 2
        };

        ctx.drawImage(
            this.spriteSheet,
            this.spriteSheetData.frames[this.index].frame.x,
            this.spriteSheetData.frames[this.index].frame.y,
            this.spriteSheetData.frames[this.index].frame.w,
            this.spriteSheetData.frames[this.index].frame.h,
            -frameCenter.x,
            -frameCenter.y,
            this.spriteSheetData.frames[this.index].frame.w,
            this.spriteSheetData.frames[this.index].frame.h
        );
    }

    updateThis(keysDown, dt) {
        // Update index
        this.timeTracker += dt;
        let delay = 1 / this.framesPerSecond;
        if (this.timeTracker >= delay) {
            this.index += 1;
            this.index = this.index % this.spriteSheetData.frames.length;
            this.timeTracker = 0;
        }
    }
}

class Turret extends Entity {
    constructor(pos, rot, parent, ssPath, ssData) {
        super(pos, rot, parent);
        this.rotationSpeed = 25;
        this.children.push(
            new Sprite({ "x": 0, "y": 0 }, 0, this, ssPath, ssData, 0)
        );
    }

    updateThis(keysDown, dt) {
        // Rotate
        if (keysDown && keysDown.KeyD == true) {
            this.rotation += this.rotationSpeed * dt;
        }
        if (keysDown && keysDown.KeyA == true) {
            this.rotation -= this.rotationSpeed * dt;
        }
        // Wrap around
        this.rotation = this.rotation % 360;
    }
}

class TerrainLayer extends Entity {
    constructor(pos, rot, parent, numCols, numRows, ssImage, tSize, numColsImage, numRowsImage,) {
        super(pos, rot, parent);
        this.ssImage = ssImage;
        this.tSize = tSize;
        this.numColsImage = numColsImage;
        this.numColsRows = numRowsImage;
        this.mapCols = numCols;
        this.mapRows = numRows;
        this.tiles = []
        this.fill(-1);
    }

    fill(value) {
        this.tiles = []
        for (let i = 0; i < this.mapCols * this.mapRows; i++) {
            this.tiles.push(value);
        }
    }

    renderThis(ctx) {
        for (let i = 0; i < this.tiles.length; i++) {
            let mapRow = Math.trunc(i / this.mapCols);
            let mapCol = i % this.mapCols;
            let mapX = mapCol * this.tSize;
            let mapY = mapRow * this.tSize;

            const imageNumber = this.tiles[i];
            let imageRow = Math.trunc(imageNumber / this.numColsImage);
            let imageColumn = imageNumber % this.numColsImage;
            let imageX = imageColumn * this.tSize;
            let imageY = imageRow * this.tSize;

            if (imageNumber !== -1) {
                ctx.drawImage(
                    this.ssImage,
                    imageX,    // source x
                    imageY,    //source y
                    this.tSize,
                    this.tSize,
                    mapX,     // dest x
                    mapY,     // dest y
                    this.tSize,
                    this.tSize
                );
            }
        }
    }
}

// TODO remove this class and all usages of it
// class MapRenderer extends Entity {
//     constructor(pos, rot, parent, ssPath, map) {
//         super(pos, rot, parent);
//         this.spriteSheet = new Image();
//         this.spriteSheet.src = ssPath;
//         this.map = map;
//     }

//     updateThis(keysDown, dt) {
//         //TODO: create two canvases, one for background.
//     }

//     renderThis(ctx) {
//         for (let col = 0; col < this.map.cols; col++) {
//             for (let row = 0; row < this.map.rows; row++) {
//                 let tile = this.map.tiles[row * this.map.cols + col];
//                 if (tile !== 0) {
//                     ctx.drawImage(
//                         this.spriteSheet,
//                         (tile - 1) * this.map.tsize,    // source x
//                         0,                              //source y
//                         this.map.tsize,
//                         this.map.tsize,
//                         col * this.map.tsize,     // dest x
//                         row * this.map.tsize,     // dest y
//                         this.map.tsize,
//                         this.map.tsize
//                     );
//                 }
//             }

//             for (let i = 0; i < this.map.tiles.length; i++) {
//                 const imageNumber = this.map.tiles[i];
//                 let imageRow = Math.trunc(imageNumber / this.map.cols);
//                 let imageColumn = imageNumber % this.map.cols;
//                 let imageX = imageColumn * this.map.tsize;
//                 let imageY = imageRow * this.map.tsize;
//                 let canvasRow = Math.trunc(i /)

//             }
//         }
//     }
// }

export { Tank, TerrainLayer, Turret };

