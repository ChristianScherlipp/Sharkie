class Pufferfish extends MovableObject {
    PUFFERFISH_IMAGES_SWIM = [
            './assets/img/2.Enemy/1.Puffer_fish_3_color_options/1.Swim/1.swim1.png',
            './assets/img/2.Enemy/1.Puffer_fish_3_color_options/1.Swim/1.swim2.png',
            './assets/img/2.Enemy/1.Puffer_fish_3_color_options/1.Swim/1.swim3.png',
            './assets/img/2.Enemy/1.Puffer_fish_3_color_options/1.Swim/1.swim4.png',
            './assets/img/2.Enemy/1.Puffer_fish_3_color_options/1.Swim/1.swim5.png',
    ];
    currentImage = 0;

    constructor(){
        super().loadImage('./assets/img/2.Enemy/1.Puffer_fish_3_color_options/1.Swim/1.swim1.png');
        this.loadImages(this.PUFFERFISH_IMAGES_SWIM);
        this.x = 200 + Math.random() * 450;
        this.y = Math.random() * 450;
        this.width = 140;
        this.height = 110;
        this.speed = 0.15 + Math.random() * 0.5;

        this.animate();
    }

    animate() {
        this.moveLeft();
        setInterval(() => {
            let i = this.currentImage % this.PUFFERFISH_IMAGES_SWIM.length;
            let path = this.PUFFERFISH_IMAGES_SWIM[i];
            this.img = this.imageCache[path];
            this.currentImage++;
        }, 150);
    }
}