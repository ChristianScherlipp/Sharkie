class Character extends MovableObject {
    width = 250;
    height = 290;
    y = 150;
    speed = 4;
    world;
    
    IMAGES_SWIM = [
            './assets/img/1.Sharkie/3.Swim/1.png',
            './assets/img/1.Sharkie/3.Swim/2.png',
            './assets/img/1.Sharkie/3.Swim/3.png',
            './assets/img/1.Sharkie/3.Swim/4.png',
            './assets/img/1.Sharkie/3.Swim/5.png',
            './assets/img/1.Sharkie/3.Swim/6.png',
        ];
    
    IMAGES_DEAD = [
        './assets/img/1.Sharkie/6.dead/1.Poisoned/1.png',
        './assets/img/1.Sharkie/6.dead/1.Poisoned/2.png',
        './assets/img/1.Sharkie/6.dead/1.Poisoned/3.png',
        './assets/img/1.Sharkie/6.dead/1.Poisoned/4.png',
        './assets/img/1.Sharkie/6.dead/1.Poisoned/5.png',
        './assets/img/1.Sharkie/6.dead/1.Poisoned/6.png',
        './assets/img/1.Sharkie/6.dead/1.Poisoned/7.png',
        './assets/img/1.Sharkie/6.dead/1.Poisoned/8.png',
        './assets/img/1.Sharkie/6.dead/1.Poisoned/9.png',
        './assets/img/1.Sharkie/6.dead/1.Poisoned/10.png',
        './assets/img/1.Sharkie/6.dead/1.Poisoned/11.png',
        './assets/img/1.Sharkie/6.dead/1.Poisoned/12.png'
    ];

    constructor() {
        super().loadImage('./assets/img/1.Sharkie/3.Swim/1.png');
        this.loadImages(this.IMAGES_SWIM);
        this.loadImages(this.IMAGES_DEAD);
        this.x = 20;
        this.animate();
        this.apllyGravity();
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
            if (this.world.keyboard.UP && this.y > -130) {
                this.y -= this.speed;
                this.acceleration = 0;
            }
            if (this.world.keyboard.DOWN && this.isAboveGround()) {
                this.y += this.speed;
            }
            this.world.camera_x = -this.x + 50;
        }, 1000 / 60);

        setInterval(() => {

            if (this.isDead()) {
                this.playAnimation(this.IMAGES_DEAD);
            }else{
                if (this.world.keyboard.RIGHT || this.world.keyboard.LEFT) {
                    this.playAnimation(this.IMAGES_SWIM);
                }
            }
        }, 150);
    }
}