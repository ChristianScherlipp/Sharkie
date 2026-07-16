class Pufferfish extends MovableObject {
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
        this.x = 200 + Math.random() * 1800;
        this.y = Math.random() * 450;
        this.width = 140;
        this.height = 110;
        this.speed = 0.15 + Math.random() * 0.5;

        this.animate();
    }

    animate() {
        this.moveLeft();
        setInterval(() => {
            this.playAnimation(this.PUFFERFISH_IMAGES_SWIM);
        }, 150);
    }
}