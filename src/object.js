class Drawable {
    static counter = 1;
    static drawablelist = [];
    constructor(pos, radius, style, color, width=0, height=0, lazyDraw=false, lineWeigth) {
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

        this.width = width;
        this.height = height;
    }
    draw() {
        if(this.style === "circle"){
            this.ctx.beginPath();
            this.ctx.arc(this.pos.x, this.pos.y, this.radius, 0, 2 * Math.PI);
            this.ctx.fillStyle = this.color;
            this.ctx.fill();
        }
        else if(this.style === "rect"){
            this.ctx.fillStyle = this.color;
            this.ctx.fillRect(this.pos.x, this.pos.y,  this.width, this.height); // draw at TL
        }
        else if(this.style === "line"){
            this.ctx.beginPath();
            this.ctx.moveTo(this.pos.x, this.pos.y);
            this.ctx.lineTo(this.pos.x+this.width, this.pos.y+this.height);
            this.ctx.strokeStyle = this.color;
            this.ctx.stroke();
        }
    }

    remove() {
        Drawable.drawablelist = Drawable.drawablelist.filter(drawable => drawable.drawid !== this.drawid);
    }
}

class Arrow extends Drawable {
    constructor(pos, toward, color="green", weight){
        super(pos, 0, "line", color, toward.x, toward.y, false, weight);
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
        this.perception = 100;
        this.currentQuad = null;
        this.neighbors = null;
        insertToQuadTree(this);
    }
    moveOffBound(movable) {
        if(movable.pos.x > Canvas.instance.pixelX) movable.pos.x -= Canvas.instance.pixelX;
        else if(movable.pos.x < 0) movable.pos.x += Canvas.instance.pixelX;
        if(movable.pos.y > Canvas.instance.pixelY) movable.pos.y -= Canvas.instance.pixelY;
        else if(movable.pos.y < 0) movable.pos.y += Canvas.instance.pixelY;

    }
    getNeighbors(){
        this.neighbors = queryQuadTreeRangeWall(this.pos, this.perception, this.radius, this.radius);
        // console.log(this.neighbors);
    }
    setFriction() {
        this.currentSpeed.mul(this.friction);
    }
    reflectWithWall() {
        const canvas = Canvas.instance;
        const tileX = Math.floor(this.pos.x / canvas.tilePixel);
        const tileY = Math.floor(this.pos.y / canvas.tilePixel);
        const startPixelX = canvas.tilePixel*tileX;
        const startPixelY = canvas.tilePixel*tileY;
        
        function isOutOfBound(tileX, tileY) { return (tileX < 0 || tileX >= Canvas.instance.tileX || tileY < 0 || tileY >= Canvas.instance.tileY); }
        // vector reflection {r = v - 2 * (v · n) * n} n은 정규화된 벡터
        // 1. 직선거리라면
        // left
        const n = new Vector2(0, 0);
        var dist = null;
        if(!isOutOfBound(tileX-1, tileY) &&
           canvas.getCollisionMap(tileX-1, tileY) === canvas.tileType["wall"]) {
            n.set(1, 0);
            dist = this.pos.x - (startPixelX - canvas.tilePixel/2);
            if(this.style === "circle" && this.pos.x - startPixelX < this.radius){ // for circle
                applyReflect(n, this);
            }
        }
        // right
        if(!isOutOfBound(tileX+1, tileY) &&
           canvas.getCollisionMap(tileX+1, tileY) === canvas.tileType["wall"]) {
            n.set(-1, 0);
            if(this.style === "circle" && startPixelX - this.pos.x < this.radius){ // for circle
                applyReflect(n, this);
            }
        }
        // up
        if(!isOutOfBound(tileX, tileY-1) &&
           canvas.getCollisionMap(tileX, tileY-1) === canvas.tileType["wall"]) {
            n.set(0, 1);
            if(this.style === "circle" && this.pos.y - startPixelY < this.radius){ // for circle
                applyReflect(n, this);
            }
        }
        // down
        if(!isOutOfBound(tileX, tileY+1) &&
           canvas.getCollisionMap(tileX, tileY+1) === canvas.tileType["wall"]) {
            n.set(0, -1);
            dist = (startPixelY + canvas.tilePixel/2) - this.pos.y;
            if(this.style === "circle" && startPixelY - this.pos.y < this.radius){ // for circle
                applyReflect(n, this);
            }
        }
        // 2. 대각선 처리(실제로는 거의 안 일어날듯? 낮은 확률=>그러니 좀 더 정확성 up)
        if(!isOutOfBound(tileX-1, tileY-1) &&
           canvas.getCollisionMap(tileX-1, tileY-1) === canvas.tileType["wall"]) {
            const collisionPoint = new Vector2();
            collisionPoint.set(startPixelX-canvas.tilePixel/2, startPixelY-canvas.tilePixel/2);
            dist = collisionPoint.getDistance(this.pos);
            collisionPoint.neg().add(this.pos).normalize();
            
            if(this.style === "circle" && dist < this.radius + canvas.tilePixel/2){ // for circle
                applyReflect(collisionPoint, this);
            }
        }
        if(!isOutOfBound(tileX-1, tileY+1) &&
           canvas.getCollisionMap(tileX-1, tileY+1) === canvas.tileType["wall"]) {
            const collisionPoint = new Vector2();
            collisionPoint.set(startPixelX-canvas.tilePixel/2, startPixelY+canvas.tilePixel*3/2);
            dist = collisionPoint.getDistance(this.pos);
            collisionPoint.neg().add(this.pos).normalize();
            
            if(this.style === "circle" && dist < this.radius + canvas.tilePixel/2){ // for circle
                applyReflect(collisionPoint, this);
            }
        }
        if(!isOutOfBound(tileX+1, tileY+1) &&
           canvas.getCollisionMap(tileX+1, tileY+1) === canvas.tileType["wall"]) {
            const collisionPoint = new Vector2();
            collisionPoint.set(startPixelX+canvas.tilePixel*3/2, startPixelY+canvas.tilePixel*3/2);
            dist = collisionPoint.getDistance(this.pos);
            collisionPoint.neg().add(this.pos).normalize();
            
            if(this.style === "circle" && dist < this.radius + canvas.tilePixel/2){ // for circle
                applyReflect(collisionPoint, this);
            }
        }
        if(!isOutOfBound(tileX+1, tileY-1) &&
            canvas.getCollisionMap(tileX+1, tileY-1) === canvas.tileType["wall"]) {
            const collisionPoint = new Vector2();
            collisionPoint.set(startPixelX-canvas.tilePixel/2, startPixelY+canvas.tilePixel*3/2);
            dist = collisionPoint.getDistance(this.pos);
            collisionPoint.neg().add(this.pos).normalize();
            
            if(this.style === "circle" && dist < this.radius + canvas.tilePixel/2){ // for circle
                applyReflect(collisionPoint, this);
            }
        }
        //r = v - 2 * (v · n) * n
        function applyReflect(n, _this){
            const collideValue = n.mul_var(_this.currentSpeed.dot(n)*2);
            const collideVector = new Vector2(collideValue.x-_this.currentSpeed.x, collideValue.y-_this.currentSpeed.y);
            const centerVector = new Vector2(_this.pos.x-(startPixelX+canvas.tilePixel/2), _this.pos.y-(startPixelY+canvas.tilePixel/2));
            if(collideVector.dot(centerVector) >= 0){
                _this.currentSpeed.sub(collideValue);
            }
        }
    }
    move() {
        if(!this.neightbors) this.getNeighbors();
        this.currentSpeed = this.currentSpeed.add(this.accel);
        this.currentSpeed.limit(this.maxSpeed);

        // this.setFriction();
        this.reflectWithWall();
        this.pos.add(this.currentSpeed);
        this.moveOffBound(this);
        if(!this.currentSpeed.equals(0, 0)){
            removeObjectFromQuadTree(this);
            insertToQuadTree(this);
        }

        this.neighbors = null;
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
