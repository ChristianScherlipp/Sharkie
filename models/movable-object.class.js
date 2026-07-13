class MovableObject {
    x;
    y;
    img;


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