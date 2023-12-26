// https://stackoverflow.com/questions/41946007/efficient-and-well-explained-implementation-of-a-quadtree-for-2d-collision-det
// https://stackoverflow.com/questions/59795569/what-is-a-coarse-and-fine-grid-search
// quadtree를 구현해보자

class Rect extends Drawable{
    constructor(top=0, left=0, down=0, right=0) {
        /////////// for debug draw //////////////
        super(new Vector2(top, left), 0, "rect", null, right-left, down-top, false);
        /////////////////////////////////////////

        if(left === 0 && down === 0 && right === 0){
            // if Drawable로 initialize 되면
            this.top = top.y;
            this.left = top.x;
            this.down = top.y+1;
            this.right = top.x+1;
        }
        else {
            this.top = top;
            this.left = left;
            this.down = down;
            this.right = right;
        }
    }
    draw() {
        if(this.style === "rect"){
            this.ctx.fillStyle = 'rgba(173, 216, 230, 0.3)';
            this.ctx.strokeRect(this.pos.x, this.pos.y,  this.width, this.height); // draw at TL
            this.ctx.fillRect(this.pos.x, this.pos.y,  this.width, this.height); // draw at TL
        }
    }

    includeDrawable(drawable) {
        return (
            drawable.pos.x >= this.left &&
            drawable.pos.x < this.right &&
            drawable.pos.y >= this.top &&
            drawable.pos.y < this.down
        );
    }
    setRect(top, left, down, right) {
        this.top = top;
        this.left = left;
        this.down = down;
        this.right = right;
    }
}

class QuadTree {
    constructor() {
        if(!QuadTree.instance) QuadTree.instance = this;
        this.head = new QuadNode(0, 0, Canvas.instance.pixelX, Canvas.instance.pixelY);
    }
    insert(drawable) {
        const leafNode = this.head.find(drawable);
        if(leafNode === null) console.log("WHAT??!?!?!");
        
        leafNode.objects.push(drawable);
        if(leafNode.count >= 3) {
            leafNode.subdivide();
        }
    }

    update() {

    }
}

function insertToQuadTree(drawable) {
    QuadTree.instance.insert(drawable);
}

class QuadNode {
    constructor(top, left, down, right) {
        this.rect = new Rect(top, left, down, right);
        this.count = 0;
        this.firstQuad      = null;
        this.secondQuad     = null;
        this.thirdQuad      = null;
        this.fourthQuad     = null;
        
        this.isLeaf = true;
        this.objects = new Array(5);
    }
    find(drawable) {
        if(!this.contains(drawable)) return null;
        
        let ret = null;
        if(this.firstQuad) ret = this.firstQuad.find(drawable);
        if(this.secondQuad) ret = this.secondQuad.find(drawable);
        if(this.thirdQuad) ret = this.thirdQuad.find(drawable);
        if(this.fourthQuad) ret = this.fourthQuad.find(drawable);
        
        if(this.isLeaf) ret = this;
        return ret;

    }
    contains(drawable) {
        return this.rect.includeDrawable(drawable);
    }
    
    subdivide() {
        const halfwidth = (this.rect.right - this.rect.left) >> 1;
        const halfheight = (this.rect.down - this.rect.up) >> 1;
        this.firstQuad = new QuadNode(this.top-halfheight, this.left+halfwidth, this.down-halfheight, this.right+halfwidth);
        this.secondQuad = new QuadNode(this.top-halfheight, this.left-halfwidth, this.down-halfheight, this.right-halfwidth);
        this.thridQuad = new QuadNode(this.top+halfheight, this.left-halfwidth, this.down+halfheight, this.right-halfwidth);
        this.fourthQuad = new QuadNode(this.top+halfheight, this.left+halfheight, this.down+halfheight, this.right+halfheight);
        
        for(obj in this.objects){
            this.find(obj);
        }
        this.objects.fill(null);
        this.isLeaf = false;
        this.count = 0;
    }
}