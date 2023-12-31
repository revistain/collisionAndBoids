class Drawable {
    static counter = 1;
    static drawablelist = [];
    constructor(pos, radius, style, color, width=0, height=0, lazyDraw=false) {
        if(!lazyDraw) Drawable.drawablelist.push(this);
        if(pos === null){
            this.pos = null;
        }
        else{
            this.pos = pos;
            this.pos.x += radius;
            this.pos.y += radius;
        }
        this.radius = radius;
        this.style = style;
        this.color = color;
        this.drawid = Drawable.counter++;
        this.ctx = Canvas.instance.ctx;

        if(width != 0) this.width = width;
        if(height != 0) this.height = height;
    }
    draw() {
        if(this.style === "circle"){
            this.ctx.beginPath();
            this.ctx.arc(this.pos.x, this.pos.y, this.radius, 0, 2 * Math.PI); // 중심 x, 중심 y, 반지름, 시작 각도, 끝 각도
            this.ctx.fillStyle = this.color;
            this.ctx.fill();
        }
        else if(this.style === "rect"){
            this.ctx.fillStyle = this.color;
            this.ctx.fillRect(this.pos.x, this.pos.y,  this.width, this.height); // draw at TL
        }
    }

    remove() {
        Drawable.drawablelist = Drawable.drawablelist.filter(drawable => drawable.drawid !== this.drawid);
    }
}

const orderType = {
    "idle" : 0,         // only seperation force
    "all_move" : 1,     // force regardlessly
    "friendly_move" : 2,// force only from team
    "stop" : 3          // no force
};

class Movable extends Drawable {
    static counter = 0;
    static movablelist = [];
    constructor(pos, radius, style, color, currentSpeed, maxSpeed, accel=0) {
        super(pos, radius, style, color);
        Movable.movablelist.push(this);
        this.currentSpeed = currentSpeed;
        this.maxSpeed = maxSpeed;
        if(accel != 0)this.accel = accel;
        else this.accel = new Vector2();
        this.friction = new Vector2(0.9, 0.9);
        this.moveid = Movable.counter++;
        
        this.orderState = orderType["all_move"];
        this.currentQuad = null;
        insertToQuadTree(this);
    }
    moveOffBound(movable) {
        if(movable.pos.x > Canvas.instance.pixelX) movable.pos.x -= Canvas.instance.pixelX;
        else if(movable.pos.x < 0) movable.pos.x += Canvas.instance.pixelX;
        if(movable.pos.y > Canvas.instance.pixelY) movable.pos.y -= Canvas.instance.pixelY;
        else if(movable.pos.y < 0) movable.pos.y += Canvas.instance.pixelY;

    }
    setFriction() {
        this.currentSpeed.mul(this.friction);
    }
    reflectWithWall() {
        const canvas = Canvas.instance;
        const tileX = Math.floor(this.pos.x / canvas.tilePixel);
        const tileY = Math.floor(this.pos.y / canvas.tilePixel);
        
        function isOutOfBound(tileX, tileY) { return (tileX < 0 || tileX >= Canvas.instance.tileX || tileY < 0 || tileY >= Canvas.instance.tileY); }
        // vector reflection {r = v - 2 * (v · n) * n} n은 정규화된 벡터
        // 1. 직선거리라면
        // left
        var n = null;
        if(!isOutOfBound(tileX-1, tileY) &&
           canvas.getCollisionMap(tileX-1, tileY) === canvas.tileType["wall"]) {
            console.log("left");
            n = new Vector2(1, 0);
        }
        // right
        else if(!isOutOfBound(tileX+1, tileY) &&
           canvas.getCollisionMap(tileX+1, tileY) === canvas.tileType["wall"]) {
            console.log("right");
            n = new Vector2(-1, 0);
        }
        // up
        else if(!isOutOfBound(tileX, tileY-1) &&
           canvas.getCollisionMap(tileX, tileY-1) === canvas.tileType["wall"]) {
            console.log("up");
            n = new Vector2(0, 1);
        }
        // down
        else if(!isOutOfBound(tileX, tileY+1) &&
           canvas.getCollisionMap(tileX, tileY+1) === canvas.tileType["wall"]) {
            console.log("down");
            n = new Vector2(0, -1);
        }
        // 2. 대각선 처리(실제로는 거의 안 일어날듯? 낮은 확률=>그러니 좀 더 정확성 up)
        else if(!isOutOfBound(tileX-1, tileY-1) &&
           canvas.getCollisionMap(tileX-1, tileY-1) === canvas.tileType["wall"]) {
            const collisionPoint = new Vector2();
            collisionPoint.set((tileX-1)*canvas.tilePixel+canvas.tilePixel/2, (tileY-1)*canvas.tilePixel+canvas.tilePixel/2);
            collisionPoint.neg.add(this.pos).normalize();
            n = collisionPoint; // dangling?
        }
        else if(!isOutOfBound(tileX-1, tileY+1) &&
           canvas.getCollisionMap(tileX-1, tileY+1) === canvas.tileType["wall"]) {
            const collisionPoint = new Vector2();
            collisionPoint.set((tileX-1)*canvas.tilePixel+canvas.tilePixel/2, (tileY+1)*canvas.tilePixel+canvas.tilePixel/2);
            collisionPoint.neg.add(this.pos).normalize();
            n = collisionPoint; // dangling?
        }
        else if(!isOutOfBound(tileX+1, tileY+1) &&
           canvas.getCollisionMap(tileX+1, tileY+1) === canvas.tileType["wall"]) {
            const collisionPoint = new Vector2();
            collisionPoint.set((tileX+1)*canvas.tilePixel+canvas.tilePixel/2, (tileY+1)*canvas.tilePixel+canvas.tilePixel/2);
            collisionPoint.neg.add(this.pos).normalize();
            n = collisionPoint; // dangling?
        }
        else if(!isOutOfBound(tileX+1, tileY-1) &&
           canvas.getCollisionMap(tileX+1, tileY-1) === canvas.tileType["wall"]) {
            const collisionPoint = new Vector2();
            collisionPoint.set((tileX+1)*canvas.tilePixel+canvas.tilePixel/2, (tileY-1)*canvas.tilePixel+canvas.tilePixel/2);
            collisionPoint.neg.add(this.pos).normalize();
            n = collisionPoint; // dangling?
        }
        //r = v - 2 * (v · n) * n
        if(n !== null) {
            this.currentSpeed.sub(n.mul_var(this.currentSpeed.dot(n)*2));
            console.log(n.mul_var(this.currentSpeed.dot(n)*2));
        }
    }
    move() {
        this.currentSpeed = this.currentSpeed.add(this.accel);
        this.currentSpeed.limit(this.maxSpeed);

        this.setFriction();
        this.reflectWithWall();
        this.pos.add(this.currentSpeed);
        this.moveOffBound(this);
        if(!this.currentSpeed.equals(0, 0)){
            removeObjectFromQuadTree(this);
            insertToQuadTree(this);
        }
    }
    remove() {
        Movable.movablelist = Movable.movablelist.filter(movable => movable.moveid !== this.moveid);
        super.remove();
    }
    applyForceMovingToDirection(vec) {
        
    }
    applyForce(force) {
        this.accel.add(force);
    }
    update() {
        this.move();
        this.accel.set(0, 0);
    }
}

class Unit extends Movable {
    constructor(pos) {
        const initSpeed = new Vector2(0, 0);
        super(pos, 6, "circle", "red", initSpeed, 4, new Vector2(0, 0));
    }
}

class Wall extends Drawable {
    constructor(pos, horizontal, vertical) {
        super(pos, 0, "rect", "black", Canvas.instance.tilePixel*horizontal, Canvas.instance.tilePixel*vertical);
    }
}

function createUnitAtTile(tileX, tileY) {
    const createPos = new Vector2(tileX*Canvas.instance.tilePixel, tileY*Canvas.instance.tilePixel);
    return new CircleBoid(createPos);
}

function createWallAtTile(tileX, tileY, amountX, amountY) {
    const createPos = new Vector2(tileX*Canvas.instance.tilePixel, tileY*Canvas.instance.tilePixel);
    Canvas.instance.setCollisionMap("wall", tileX, tileY, amountX, amountY);
    
    return new Wall(createPos, amountX, amountY);
}
