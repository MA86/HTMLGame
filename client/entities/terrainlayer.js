class TerrainLayer extends window.globals.entityModule.Entity {
    constructor(pos, rot, parent, numCols, numRows, ssImage, tSize, numColsImage, numRowsImage,) {
        super(pos, rot, false);
        this.ssImage = ssImage;
        this.tSize = tSize;
        this.numColsImage = numColsImage;
        this.numRowsImage = numRowsImage;
        this.mapCols = numCols;
        this.mapRows = numRows;
        this.tiles = []
        this.fill(-1);
        this.drawn = false;
    }

    // Fill entire train layer with an image
    fill(imageInt) {
        // NOTE: imagePosition is an integer refering to an image in the spritesheet

        this.tiles = []
        for (let i = 0; i < this.mapCols * this.mapRows; i++) {
            this.tiles.push(imageInt);
        }
    }

    // Change an image on a cell of terain layer
    changeImage(row, col, imageInt) {
        let index = (row * this.mapCols) + col;
        this.tiles[index] = imageInt;
    }

    setTiles(arr) {
        this.tiles = arr;
    }

    updateThis(keysDown, dt) {
        // Does nothing
    }

    // Render this.tiles
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
    }
}

export { TerrainLayer };