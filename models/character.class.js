class Character extends MovableObject {
    x = 20;
    y = 150;
    width = 250;
    height = 290;
    speed = 4;
    world;

    rX;
    rY;
    rW;
    rH;

    offset = {
        top : 130,
        left : 50,
        right : 50,
        bottom : 70
    };
    
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

    IMAGES_HURT = [
        './assets/img/1.Sharkie/5.Hurt/1.Poisoned/1.png',
        './assets/img/1.Sharkie/5.Hurt/1.Poisoned/2.png',
        './assets/img/1.Sharkie/5.Hurt/1.Poisoned/3.png',
        './assets/img/1.Sharkie/5.Hurt/1.Poisoned/4.png',
        './assets/img/1.Sharkie/5.Hurt/1.Poisoned/5.png',
    ];

    constructor() {
        super().loadImage('./assets/img/1.Sharkie/3.Swim/1.png');
        this.loadImages(this.IMAGES_SWIM);
        this.loadImages(this.IMAGES_DEAD);
        this.loadImages(this.IMAGES_HURT);
        this.animate();
        this.apllyGravity();
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
            if (this.world.keyboard.RIGHT && this.x < this.world.level.level_end_x) {
                this.x += this.speed;
                this.rX += this.speed;
                this.otherDirection = false;
            } 
            if (this.world.keyboard.LEFT && this.x > 0) {
                this.x -= this.speed;
                this.rX - this.speed;
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
            }else if(this.isHurt()){
                this.playAnimation(this.IMAGES_HURT);
            }else{
                if (this.world.keyboard.RIGHT || this.world.keyboard.LEFT || this.world.keyboard.UP || this.world.keyboard.DOWN) {
                    this.playAnimation(this.IMAGES_SWIM);
                }
            }
        }, 150);
    }
}