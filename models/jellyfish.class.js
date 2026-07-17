class Jellyfish extends MovableObject {
    x = 190 + Math.random() * 1800;
    y = Math.random() * 440;
    width = 120;
    height = 180;

    rX;
    rY;
    rW;
    rH;

    offset = {
        top : 10,
        left : 10,
        right : 10,
        bottom : 20
    };
    
    JELLY_IMAGES_SWIM = [
            './assets/img/2.Enemy/2.Jelly_fish/Regular_damage/Lila1.png',
            './assets/img/2.Enemy/2.Jelly_fish/Regular_damage/Lila2.png',
            './assets/img/2.Enemy/2.Jelly_fish/Regular_damage/Lila3.png',
            './assets/img/2.Enemy/2.Jelly_fish/Regular_damage/Lila4.png',
    ];

    constructor() {
        super().loadImage('./assets/img/2.Enemy/2.Jelly_fish/Regular_damage/Lila1.png');
        this.loadImages(this.JELLY_IMAGES_SWIM);
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
            this.playAnimation(this.JELLY_IMAGES_SWIM);
        }, 255);
    }
}