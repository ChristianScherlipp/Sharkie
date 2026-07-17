class Pufferfish extends MovableObject {
    x = 200 + Math.random() * 1800;
    y = Math.random() * 450;
    width = 140;
    height = 110;

    rX;
    rY;
    rW;
    rH;

    offset = {
        top : 5,
        left : 5,
        right : 12,
        bottom : 30
    };
    
    PUFFERFISH_IMAGES_SWIM = [
            './assets/img/2.Enemy/1.Puffer_fish_3_color_options/1.Swim/1.swim1.png',
            './assets/img/2.Enemy/1.Puffer_fish_3_color_options/1.Swim/1.swim2.png',
            './assets/img/2.Enemy/1.Puffer_fish_3_color_options/1.Swim/1.swim3.png',
            './assets/img/2.Enemy/1.Puffer_fish_3_color_options/1.Swim/1.swim4.png',
            './assets/img/2.Enemy/1.Puffer_fish_3_color_options/1.Swim/1.swim5.png',
    ];

    constructor(){
        super().loadImage('./assets/img/2.Enemy/1.Puffer_fish_3_color_options/1.Swim/1.swim1.png');
        this.loadImages(this.PUFFERFISH_IMAGES_SWIM);
        this.speed = 0.15 + Math.random() * 0.5;
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
        this.moveLeft();
        setInterval(() => {
            this.playAnimation(this.PUFFERFISH_IMAGES_SWIM);
        }, 150);
    }
}