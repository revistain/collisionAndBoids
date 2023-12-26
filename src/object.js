class Drawable {
    static counter = 1;
    static drawablelist = [];
    constructor(pos, radius, style, color, width=0, height=0, lazyDraw=false) {
        if(!lazyDraw) Drawable.drawablelist.push(this);
        this.pos = pos;
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

class Movable extends Drawable {
    static counter = 0;
    static movablelist = [];
    constructor(pos, radius, style, color, currentSpeed, maxSpeed, accel=0) {
        super(pos, radius, style, color);
        Movable.movablelist.push(this);
        this.currentSpeed = currentSpeed;
        this.maxSpeed = maxSpeed;
        if(accel != 0)this.accel = accel;
        else this.accel = new Vector2(0, 0);
        this.moveid = Movable.counter++;
    }
    move() {
        this.currentSpeed = this.currentSpeed.add(this.accel);
        this.currentSpeed.limit(this.maxSpeed);
        this.pos.add(this.currentSpeed);
    }
    remove() {
        Movable.movablelist = Movable.movablelistfilter(movable => movable.moveid !== this.moveid);
    }
    applyForce(force) {
        this.accel.add(force);
    }
    update() {
        insertToQuadTree(this);
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
    return new Unit(createPos);
}

function createWallAtTile(tileX, tileY, amountX, amountY) {
    const createPos = new Vector2(tileX*Canvas.instance.tilePixel, tileY*Canvas.instance.tilePixel);
    Canvas.instance.setCollideMap("wall", tileX, tileY, amountX, amountY);
    
    return new Wall(createPos, amountX, amountY);
}