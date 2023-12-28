// https://stackoverflow.com/questions/41946007/efficient-and-well-explained-implementation-of-a-quadtree-for-2d-collision-det
// https://stackoverflow.com/questions/59795569/what-is-a-coarse-and-fine-grid-search
// quadtree를 구현해보자

class Rect extends Drawable{
    static debugGridOn = false;
    constructor(top=0, left=0, down=0, right=0) {
        /////////// for debug draw //////////////
        super(new Vector2(top, left), 0, "rect", null, right-left, down-top, false);
        /////////////////////////////////////////
        this.top = top;
        this.left = left;
        this.down = down;
        this.right = right; 
        this.halfwidth = (this.right - this.left) >> 1;
        this.halfheight = (this.down - this.top) >> 1;
        
        this.randomcolorA = Math.random() * 155 + 100;
        this.randomcolorB = Math.random() * 155 + 100;
        this.randomcolorC = Math.random() * 155 + 100;
    }

    draw() {
        // 생각보다 그리드 그리는게 성능에 영향을 많이 끼치네
        if(Rect.debugGridOn){
            this.ctx.fillStyle = `rgba(${this.randomcolorA}, ${this.randomcolorB}, ${this.randomcolorC}, 0.2)`;
            this.ctx.strokeRect(this.left, this.top, this.right-this.left, this.down-this.top);
            this.ctx.fillRect(this.left, this.top, this.right-this.left, this.down-this.top);
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
    intersectsWith(target){
        if(this.left > target.right) return false;
        if(this.right < target.left) return false;
        if(this.top > target.down) return false;
        if(this.down < target.top) return false;
        return true;
    }
    intersects(top, left, down, right){
        if(this.left > right) return false;
        if(this.right < left) return false;
        if(this.top > down) return false;
        if(this.down < top) return false;
        return true;
    }
}

class QuadTree {
    static instance = null;
    constructor() {
        if(!QuadTree.instance) QuadTree.instance = this;
        this.head = new QuadNode(0, 0, Canvas.instance.pixelX, Canvas.instance.pixelY);
    }
    insert(drawable) {
        if(this.head === null) console.log("WHAT??!?!?!");
        this.head.findInsert(drawable);
    }
    _remove_object(obj){
        if(obj.currentQuad === null) return;
        removeElemFromList(obj.currentQuad.objects, obj);
    }

    _Query(top, left, down, right) {
        const found = [];
        this.head.query(top, left, down, right, found);
        return found;
    }
    update(){
        collectEmptyQuads();
    }
}

function collectEmptyQuads(){
    QuadTree.instance.head._collectnulls();
}

function quadTreeQuery(top, left, down, right){
    return QuadTree.instance._Query(top, left, down, right);
}

function insertToQuadTree(obj) {
    QuadTree.instance.insert(obj);
}

function removeObjectFromQuadTree(obj){
    QuadTree.instance._remove_object(obj);
}

class QuadNode {
    constructor(top, left, down, right) {
        this.rect = new Rect(top, left, down, right);
        this.capacity = 4;
        this.firstQuad      = null;
        this.secondQuad     = null;
        this.thirdQuad      = null;
        this.fourthQuad     = null;
        
        this.isLeaf = true;
        this.objects = [];
    }
    findNode(drawable) {
        if(!this.contains(drawable)) return null;
        
        let ret = null;
        if(!this.isLeaf){
            let result = null;
            if((result = this.firstQuad.findNode(drawable)) !== null) ret = result
            if((result = this.secondQuad.findNode(drawable)) !== null) ret = result
            if((result = this.thirdQuad.findNode(drawable)) !== null) ret = result
            if((result = this.fourthQuad.findNode(drawable)) !== null) ret = result
        }
        else if(this.isLeaf) { ret = this; }
        return ret;
    }
    findInsert(obj){
        const leafNode = this.findNode(obj);
        obj.currentQuad = leafNode;
        
        leafNode.objects.push(obj);
        if(leafNode.objects.length >= leafNode.capacity) {
            leafNode.subdivide();
        }
    }
    contains(drawable) {
        return this.rect.includeDrawable(drawable);
    }
    subdivide() {
        this.firstQuad = new QuadNode(this.rect.top, this.rect.left+this.rect.halfwidth, this.rect.down-this.rect.halfheight, this.rect.right);
        this.secondQuad = new QuadNode(this.rect.top, this.rect.left, this.rect.down-this.rect.halfheight, this.rect.right-this.rect.halfwidth);
        this.thirdQuad = new QuadNode(this.rect.top+this.rect.halfheight, this.rect.left, this.rect.down, this.rect.right-this.rect.halfwidth); 
        this.fourthQuad = new QuadNode(this.rect.top+this.rect.halfheight, this.rect.left+this.rect.halfwidth, this.rect.down, this.rect.right);
        this.isLeaf = false;

        for(let obj of this.objects){
            this.findInsert(obj);
        }
        this.objects.length = 0;
    }
    query(top, left, down, right, found_list){
        if(!this.rect.intersects(top, left, down, right)) return null;
        if(!this.isLeaf){
            this.firstQuad.query(top, left, down, right, found_list);
            this.secondQuad.query(top, left, down, right, found_list);
            this.thirdQuad.query(top, left, down, right, found_list);
            this.fourthQuad.query(top, left, down, right, found_list);
        }
        else{
            for(let obj of this.objects){
                if(obj.pos.x >= left && obj.pos.x < right && obj.pos.y >= top && obj.pos.y < down) found_list.push(obj);
            }
        }
        return found_list;
    }
    _collectnulls(){
        if(!this.isLeaf){
            if(this.firstQuad.objects.length === 0 && this.secondQuad.objects.length === 0 && this.thirdQuad.objects.length === 0 && this.fourthQuad.objects.length === 0
              && this.firstQuad.isLeaf && this.secondQuad.isLeaf && this.thirdQuad.isLeaf && this.fourthQuad.isLeaf){
                this.firstQuad.rect.remove();
                this.secondQuad.rect.remove();
                this.thirdQuad.rect.remove();
                this.fourthQuad.rect.remove();
                this.firstQuad = null;
                this.secondQuad = null;
                this.thirdQuad = null;
                this.fourthQuad = null;
                this.isLeaf = true;
            }
            else{
                this.firstQuad = this.firstQuad._collectnulls();
                this.secondQuad = this.secondQuad._collectnulls();
                this.thirdQuad = this.thirdQuad._collectnulls();
                this.fourthQuad = this.fourthQuad._collectnulls();
            }
        }
        return this;

    }
}