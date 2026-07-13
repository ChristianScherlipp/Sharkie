class MovableObject {
    x = 50;
    y = 200;
    img;
    height= 150;
    width = 180;

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