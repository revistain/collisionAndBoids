class Canvas {
    constructor() {
        if (!Canvas.instance) Canvas.instance = this;
        this.tileX = 32;
        this.tileY = 32;
        this.tilePixel = 16;
        this.pixelX = 32*16;
        this.pixelY = 32*16;
        this.tileType = {
            "empty" : 0,
            "wall" : 1,
        }
        this.collideMap = new Array(this.tileX*this.tileY).fill(this.tileType["empty"]);

        this.canvas = document.querySelector("canvas");
        this.ctx = this.canvas.getContext('2d');
        this.animate = this.animate.bind(this);
    }
    setCollideMap(typestring, tileX, tileY, amountX, amountY) {
        for(let i = 0; i < amountX; i++)  this.collideMap[tileX+i+tileY*this.tileY] = this.tileType[typestring];
        for(let i = 0; i < amountY; i++)  this.collideMap[tileX+(tileY+i)*this.tileY] = this.tileType[typestring];
        console.log(this.collideMap);
    }

    startLoop() {
        this.animate();
    }
 
    animate() {
        requestAnimationFrame(this.animate);
        this.update();
    }

    draw() {
        this.ctx.clearRect(0, 0, this.pixelX, this.pixelY);
        for(let drawable of Drawable.drawablelist){
            drawable.draw();
        }
    }

    update() {
        this.draw();
    }
}

window.onload = function() {
    const canvas = new Canvas();
    const a = new MouseManager();
    createUnitAtTile(3, 3);
    createUnitAtTile(3, 14);
    createWallAtTile(0, 0, 1, 3);
    
    canvas.startLoop();
};