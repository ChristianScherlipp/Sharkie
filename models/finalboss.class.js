class Finalboss extends MovableObject {
    x = 2500;
    y = Math.random() * 300;
    width = 250;
    height = 220;

    rX;
    rY;
    rW;
    rH;

    offset = {
        top : 80,
        left : 15,
        right : 20,
        bottom : 40
    };

    FINALBOSS_IMAGES_SWIM = [
            './assets/img/2.Enemy/3.Final_Enemy/2.floating/1.png',
            './assets/img/2.Enemy/3.Final_Enemy/2.floating/2.png',
            './assets/img/2.Enemy/3.Final_Enemy/2.floating/3.png',
            './assets/img/2.Enemy/3.Final_Enemy/2.floating/4.png',
            './assets/img/2.Enemy/3.Final_Enemy/2.floating/5.png',
            './assets/img/2.Enemy/3.Final_Enemy/2.floating/6.png',
            './assets/img/2.Enemy/3.Final_Enemy/2.floating/7.png',
            './assets/img/2.Enemy/3.Final_Enemy/2.floating/8.png',
            './assets/img/2.Enemy/3.Final_Enemy/2.floating/9.png',
            './assets/img/2.Enemy/3.Final_Enemy/2.floating/10.png',
            './assets/img/2.Enemy/3.Final_Enemy/2.floating/11.png',
            './assets/img/2.Enemy/3.Final_Enemy/2.floating/12.png',
            './assets/img/2.Enemy/3.Final_Enemy/2.floating/13.png',
    ];

    constructor (){
        super().loadImage('./assets/img/2.Enemy/3.Final_Enemy/2.floating/1.png');
        this.loadImages(this.FINALBOSS_IMAGES_SWIM);
        this.animate();
        this.getRealFrame();
    }

    getRealFrame(){
        setInterval(() => {
            this.rX = this.x +this.offset.left;
            this.rY = this.y + this.offset.top;
            this.rW = this.width - this.offset.left - this.offset.right;
            this.rH = this.height - this.offset.top - this.offset.bottom;
        }, 1000 / 120)
    }

    animate() {
        setInterval(() => {
            this.playAnimation(this.FINALBOSS_IMAGES_SWIM);
        }, 150);
    }
}