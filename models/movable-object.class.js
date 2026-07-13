class MovableObject {
    x = 120;
    y = 400;
    img;

    constructor() {

    }
    // loadImage
    loadImage(path){
        this.img = new Image(); // this.Image = document.getElementById('Image') <img id="image" src>
        this.img.src = path;
    }

    moveRight(){
        console.log('move Right');
        
    }

    moveLeft() {
        
    }

    moveUp(){
        
    }

    moveDown(){
        
    }
}