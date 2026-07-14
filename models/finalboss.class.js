class Finalboss extends MovableObject {


    constructor (){
        super().loadImage('./assets/img/2.Enemy/3.Final_Enemy/2.floating/1.png');
        this.x = 550;
        this.y = Math.random() * 450;
    }
}