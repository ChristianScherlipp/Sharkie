class MovableObject {
    x;
    y;
    img;
    height= 120;
    width = 150;
    speed = 0.15;
    imageCache = {};

    constructor() {

    }
    // loadImage
    loadImage(path){
        this.img = new Image(); // this.Image = document.getElementById('Image') <img id="image" src>
        this.img.src = path;
    }

    /**
     * 
     * @param {Array} arr - ['img/image1', 'img/image2', ...] 
     */
    loadImages(arr) {
        arr.forEach((path) => {
            let img = new Image();
            img.src = path;
            this.imageCache[path] = img;
        });
    }

    moveRight(){
        console.log('move Right');
        
    }

    moveLeft() {
        setInterval(() => {
            this.x -= this.speed;
        }, 1000 / 60);
    }

    moveUp(){
        
    }

    moveDown(){
        
    }
}