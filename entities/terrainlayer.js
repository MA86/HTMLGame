import { Entity } from './entity.js';

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
        this.drawn = false;
    }

    fill(value) {
        this.tiles = []
        for (let i = 0; i < this.mapCols * this.mapRows; i++) {
            this.tiles.push(value);
        }
    }

    renderThis(ctx) {
        if (this.drawn == false) {
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
                        imageY,    // source y
                        this.tSize,
                        this.tSize,
                        mapX,     // dest x
                        mapY,     // dest y
                        this.tSize,
                        this.tSize
                    );
                }
            }
            this.drawn = true;
        }
    }
}

export { TerrainLayer };