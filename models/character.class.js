class Character extends MovableObject {
    width = 250;
    height = 290;
    y = 150;
    speed = 4;
    IMAGES_SWIM = [
            './assets/img/1.Sharkie/3.Swim/1.png',
            './assets/img/1.Sharkie/3.Swim/2.png',
            './assets/img/1.Sharkie/3.Swim/3.png',
            './assets/img/1.Sharkie/3.Swim/4.png',
            './assets/img/1.Sharkie/3.Swim/5.png',
            './assets/img/1.Sharkie/3.Swim/6.png',
        ];
    world;

    constructor() {
        super().loadImage('./assets/img/1.Sharkie/3.Swim/1.png');
        this.loadImages(this.IMAGES_SWIM);
        this.x = 20;
        this.animate();
    }

    animate() {
        setInterval(() => {
            if (this.world.keyboard.RIGHT && this.x < this.world.level.level_end_x) {
                this.x += this.speed;
                this.otherDirection = false;
            } 
            if (this.world.keyboard.LEFT && this.x > 0) {
                this.x -= this.speed;
                this.otherDirection = true;
            }
            if (this.world.keyboard.UP) {
                this.y -= this.speed;
            }
            if (this.world.keyboard.DOWN) {
                this.y += this.speed;
            }
            this.world.camera_x = -this.x + 50;
        }, 1000 / 60);

        setInterval(() => {
            if (this.world.keyboard.RIGHT || this.world.keyboard.LEFT) {
                // Swim animation
                this.playAnimation(this.IMAGES_SWIM)
            }
        }, 150);
    }
}