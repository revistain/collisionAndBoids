document.addEventListener('keydown', function(event) {
    if (event.key === 'U' || event.key === 'u') {
        
        createUnitAtTile(getRandomInt(0, Canvas.instance.tileX - 1), getRandomInt(0,Canvas.instance.tileY - 1));
    }
 });

class Canvas {
    constructor() {
        if (!Canvas.instance) Canvas.instance = this;
        this.tileX = 64;
        this.tileY = 64;
        this.tilePixel = 16;
        this.pixelX = this.tileX*16;
        this.pixelY = this.tileY*16;
        this.tileType = {
            "empty" : 0,
            "wall" : 1,
        }
        this.collideMap = new Array(this.tileX*this.tileY).fill(this.tileType["empty"]);
        this.fps = 0;
        this.lastFrameTime = 0;
        this.frameCount = 0;

        this.canvas = document.querySelector("canvas");
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = this.pixelX;
        this.canvas.height = this.pixelY;
        this.animate = this.animate.bind(this);
    }
    setCollisionMap(typestring, tileX, tileY, amountX, amountY) {
        for(let i = 0; i < amountX; i++)  this.collideMap[tileX+i+tileY*this.tileY] = this.tileType[typestring];
        for(let i = 0; i < amountY; i++)  this.collideMap[tileX+(tileY+i)*this.tileY] = this.tileType[typestring];
    }
    getCollisionMap(tileX, tileY) {
        return this.collideMap[tileX + this.tileY*tileY];
    }

    startLoop() {
        this.lastFrameTime = performance.now();
        this.animate();
    }
    animate(currentTime) {
        requestAnimationFrame(this.animate);

        const deltaTime = currentTime - this.lastFrameTime;
        if (deltaTime >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.lastFrameTime = currentTime;
        } else this.frameCount++;

        this.update();
    }

    displayFPS(){
        this.ctx.fillStyle = "black";
        this.ctx.font = "20px Arial";
        this.ctx.fillText(`FPS: ${this.fps}`, 50, 50);
    }

    draw() {
        this.ctx.clearRect(0, 0, this.pixelX, this.pixelY);
        for(let drawable of Drawable.drawablelist){
            drawable.draw();
        }
        this.displayFPS();
    }
    move(){
        for(let movable of Movable.movablelist){
            // movable.applyForce(new Vector2(getRandomFloat(0.2, -0.1), getRandomFloat(0.2, -0.1)));
            movable.update();
        }
    }

    update() {
        this.move();
        this.draw();
        QuadTree.instance.update();
    }
}

window.onload = function() {
    const canvas = new Canvas();
    const qt = new QuadTree();
    const mm = new MouseManager();
    
    createWallAtTile(0, 0, 64, 1);
    createWallAtTile(0, 63, 64, 1);
    createWallAtTile(0, 0, 1, 64);
    createWallAtTile(63, 0, 1, 64);

    createWallAtTile(0, 16, 48, 1);
    createWallAtTile(48, 16, 1, 16);

    createWallAtTile(16, 48, 48, 1);
    createWallAtTile(16, 32, 1, 16);

    createWallAtTile(16, 32, 8, 1);
    createWallAtTile(41, 32, 8, 1);
    
    
    
    canvas.startLoop();
};

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
  
function getRandomFloat(range, start) {
    return Math.random() * range + start;
}

