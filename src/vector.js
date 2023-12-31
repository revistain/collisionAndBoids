class Vector2 {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
        return this;
    }
    set(x, y){
        this.x = x;
        this.y = y;
        return this;
    }
    equals(x, y){
        return (this.x == x && this.y == y);
    }
    assign(v){
        this.x = v.x;
        this.y = v.y;
        return this;
    }
    add(v) {
        this.x += v.x;
        this.y += v.y;
        return this;
    }
    add_var(x, y) {
        this.x += x;
        this.y += y;
        return this;
    }
    neg(){
        this.x = -this.x;
        this.y = -this.y;
        return this;
    }
    sub(v) {
        this.x -= v.x;
        this.y -= v.y;
        return this;
    }
    mul_var(scalar) {
        this.x *= scalar;
        this.y *= scalar;
        return this;
    }
    mul(v) {
        this.x *= v.x;
        this.y *= v.y;
        return this;
    }
    div(vec){
        if(vec.x === 0 || vec.y === 0) return;
        this.x /= vec.x;
        this.y /= vec.y;
        return this;
    }
    div_var(scalar){
        if(scalar === 0) return;
        this.x /= scalar;
        this.y /= scalar;
        return this;
    }
    magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    limit(maxMagnitude) {
        const currentMagnitude = this.magnitude();
        if (currentMagnitude > maxMagnitude) {
            this.setMagnitude(maxMagnitude);
        }
        return this;
    }
    setMagnitude(magnitude) {
        const normalized = this.normalize();
        this.x = normalized.x * magnitude;
        this.y = normalized.y * magnitude;
        return this;
    }
    normalize() {
        const mag = this.magnitude();
        if(mag > 0) {
            this.x /= mag;
            this.y /= mag;
        }
        return this;
    }
    dot(v) {
        return this.x * v.x + this.y * v.y;
    }
    getDistance(vec){
        return Math.sqrt(this.x*vec.x + this.y*vec.y);
    }
    getDistance_var(x, y){
        return Math.sqrt(this.x*x + this.y*y);
    }
}

function removeElemFromList(array, element) {
    const index = array.indexOf(element);
    if (index > -1) {
        array.splice(index, 1);
    }
}