import { MovableObject } from "./movable-object.class.js";

export class Character extends MovableObject {
    showFrame = true;
    x = 20;
    y = 150;
    width = 250;
    height = 290;
    speed = 4;
    world;
    longIdleThreshold = 8000;
    idleTime = 0;

    knockbackActive = false;
    knockbackStartX = 0;
    knockbackStartY = 0;
    knockbackTargetX = 0;
    knockbackTargetY = 0;
    knockbackElapsed = 0;
    knockbackDuration = 200;

    offset = {
        top : 160,
        left : 60,
        right : 60,
        bottom : 80
    };

    isAttacking = false;
    attackFrame = 0;
    attackTimer = 0;
    attackFrameDuration = 100; // ms pro Frame, 8 Frames = 800ms gesamt
    justAttacked = false; // World prüft dann einmalig auf Coin-Treffer

    isFormingBubble = false;
    bubbleFrame = 0;
    bubbleTimer = 0;
    bubbleFrameDuration = 100;
    justFiredBubble = false; //world erzeugt daraufhin das FiringObject

    sFormingPoison = false;
    poisonFrame = 0;
    poisonTimer = 0;
    poisonFrameDuration = 100;
    justFiredPoison = false;
    
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
        './assets/img/1.Sharkie/5.Hurt/1.Poisoned/5.png'
    ];

    IMAGES_IDLE = [
        './assets/img/1.Sharkie/1.IDLE/1.png',
        './assets/img/1.Sharkie/1.IDLE/2.png',
        './assets/img/1.Sharkie/1.IDLE/3.png',
        './assets/img/1.Sharkie/1.IDLE/4.png',
        './assets/img/1.Sharkie/1.IDLE/5.png',
        './assets/img/1.Sharkie/1.IDLE/6.png',
        './assets/img/1.Sharkie/1.IDLE/7.png',
        './assets/img/1.Sharkie/1.IDLE/8.png',
        './assets/img/1.Sharkie/1.IDLE/9.png',
        './assets/img/1.Sharkie/1.IDLE/10.png',
        './assets/img/1.Sharkie/1.IDLE/11.png',
        './assets/img/1.Sharkie/1.IDLE/12.png',
        './assets/img/1.Sharkie/1.IDLE/13.png',
        './assets/img/1.Sharkie/1.IDLE/14.png',
        './assets/img/1.Sharkie/1.IDLE/15.png',
        './assets/img/1.Sharkie/1.IDLE/16.png',
        './assets/img/1.Sharkie/1.IDLE/17.png',
        './assets/img/1.Sharkie/1.IDLE/18.png'
    ];

    IMAGES_LONG_IDLE = [
        './assets/img/1.Sharkie/2.Long_IDLE/I1.png',
        './assets/img/1.Sharkie/2.Long_IDLE/I2.png',
        './assets/img/1.Sharkie/2.Long_IDLE/I3.png',
        './assets/img/1.Sharkie/2.Long_IDLE/I4.png',
        './assets/img/1.Sharkie/2.Long_IDLE/I5.png',
        './assets/img/1.Sharkie/2.Long_IDLE/I6.png',
        './assets/img/1.Sharkie/2.Long_IDLE/I7.png',
        './assets/img/1.Sharkie/2.Long_IDLE/I8.png',
        './assets/img/1.Sharkie/2.Long_IDLE/I9.png',
        './assets/img/1.Sharkie/2.Long_IDLE/I10.png',
        './assets/img/1.Sharkie/2.Long_IDLE/I11.png',
        './assets/img/1.Sharkie/2.Long_IDLE/I12.png',
        './assets/img/1.Sharkie/2.Long_IDLE/I13.png',
        './assets/img/1.Sharkie/2.Long_IDLE/I14.png'
    ];

    IMAGES_FIN_SLAP_ATTACK = [
        './assets/img/1.Sharkie/4.Attack/Fin_slap/1.png',
        './assets/img/1.Sharkie/4.Attack/Fin_slap/2.png',
        './assets/img/1.Sharkie/4.Attack/Fin_slap/3.png',
        './assets/img/1.Sharkie/4.Attack/Fin_slap/4.png',
        './assets/img/1.Sharkie/4.Attack/Fin_slap/5.png',
        './assets/img/1.Sharkie/4.Attack/Fin_slap/6.png',
        './assets/img/1.Sharkie/4.Attack/Fin_slap/7.png',
        './assets/img/1.Sharkie/4.Attack/Fin_slap/8.png',
    ]

    IMAGES_BUBBLE_FORMATION = [
        './assets/img/1.Sharkie/4.Attack/Bubble_trap/op1_with_bubble_formation/1.png',
        './assets/img/1.Sharkie/4.Attack/Bubble_trap/op1_with_bubble_formation/2.png',
        './assets/img/1.Sharkie/4.Attack/Bubble_trap/op1_with_bubble_formation/3.png',
        './assets/img/1.Sharkie/4.Attack/Bubble_trap/op1_with_bubble_formation/4.png',
        './assets/img/1.Sharkie/4.Attack/Bubble_trap/op1_with_bubble_formation/5.png',
        './assets/img/1.Sharkie/4.Attack/Bubble_trap/op1_with_bubble_formation/6.png',
        './assets/img/1.Sharkie/4.Attack/Bubble_trap/op1_with_bubble_formation/7.png',
        './assets/img/1.Sharkie/4.Attack/Bubble_trap/op1_with_bubble_formation/8.png',
    ]

    IMAGES_POISON_FORMATION = [
        './assets/img/1.Sharkie/4.Attack/Bubble_trap/For_Whale/1.png',
        './assets/img/1.Sharkie/4.Attack/Bubble_trap/For_Whale/2.png',
        './assets/img/1.Sharkie/4.Attack/Bubble_trap/For_Whale/3.png',
        './assets/img/1.Sharkie/4.Attack/Bubble_trap/For_Whale/4.png',
        './assets/img/1.Sharkie/4.Attack/Bubble_trap/For_Whale/5.png',
        './assets/img/1.Sharkie/4.Attack/Bubble_trap/For_Whale/6.png',
        './assets/img/1.Sharkie/4.Attack/Bubble_trap/For_Whale/7.png',
        './assets/img/1.Sharkie/4.Attack/Bubble_trap/For_Whale/8.png',
    ]

    constructor() {
        super().loadImage('./assets/img/1.Sharkie/3.Swim/1.png');
        this.loadImages(this.IMAGES_SWIM);
        this.loadImages(this.IMAGES_DEAD);
        this.loadImages(this.IMAGES_HURT);
        this.loadImages(this.IMAGES_IDLE);
        this.loadImages(this.IMAGES_LONG_IDLE);
        this.loadImages(this.IMAGES_FIN_SLAP_ATTACK);
        this.loadImages(this.IMAGES_BUBBLE_FORMATION);
        this.loadImages(this.IMAGES_POISON_FORMATION);
        this.getRealFrame();
    }

    

    update(deltaTime) {
        let factor = deltaTime / (1000 / 60);
        let prevX = this.x;
        let prevY = this.y;
        if (this.knockbackActive) {
            this.knockbackElapsed += deltaTime;
            let t = Math.min(this.knockbackElapsed / this.knockbackDuration, 1);
            let eased = 1 - Math.pow(1 - t, 3);
            this.x = this.knockbackStartX + (this.knockbackTargetX - this.knockbackStartX) * eased;
            this.y = this.knockbackStartY + (this.knockbackTargetY - this.knockbackStartY) * eased;
            if (t >= 1) { this.knockbackActive = false; }
        } else{
            if (this.world.keyboard.RIGHT && this.x < this.world.level.level_end_x - this.width) {
                this.x += this.speed * factor;
                this.otherDirection = false;
            } 
            if (this.world.keyboard.LEFT && this.x > this.world.level.level_start_x) {
                this.x -= this.speed * factor;
                this.otherDirection = true;
            }
            if (this.world.keyboard.UP && this.y > -130) {
                this.y -= this.speed * factor;
                this.acceleration = 0;
            }
            if (this.world.keyboard.DOWN && this.isAboveGround()) {
                this.y += this.speed * factor;
            }
        }
        // Kamera mit Totzone: bleibt stehen, solange der Hintergrund sonst eine
        // schwarze Lücke zeigen würde (Weltanfang/-ende), folgt Sharkie sonst
        // ab 40% der Canvas-Breite.
        let canvasWidth = this.world.canvas.width;
        let followX = this.world.level.level_start_x + canvasWidth * 0.3;
        let cameraMax = -this.world.level.level_start_x;
        let cameraMin = canvasWidth - this.world.level.level_end_x;
        let desiredCamera = followX - this.x;
        this.world.camera_x = Math.min(cameraMax, Math.max(cameraMin, desiredCamera));

        this.getRealFrame();

        let blocked = this.world.level.coins.some(coin => coin.blocksMovement && this.isColliding(coin));
        if (blocked){
            this.x = prevX;
            this.y = prevY;
            this.getRealFrame();
        }
        
        let isMoving = this.world.keyboard.RIGHT || this.world.keyboard.LEFT || this.world.keyboard.UP || this.world.keyboard.DOWN || this.world.keyboard.E || this.world.keyboard.SPACE;
        if (isMoving) {
            this.idleTime = 0;
        } else {
            this.idleTime += deltaTime;
        }

        if (this.world.keyboard.SPACE && !this.isAttacking && !this.isFormingBubble && !this.FormingPoison) {
            this.isAttacking = true;
            this.attackFrame = 0;
            this.attackTimer = 0;
            this.img = this.imageCache[this.IMAGES_FIN_SLAP_ATTACK[0]];
            this.justAttacked = true;
        }
        if (this.isAttacking) {
            this.attackTimer += deltaTime;
            if (this.attackTimer > this.attackFrameDuration) {
                this.attackTimer = 0;
                this.attackFrame++;
                if (this.attackFrame >= this.IMAGES_FIN_SLAP_ATTACK.length) {
                    this.isAttacking = false;
                } else {
                    this.img = this.imageCache[this.IMAGES_FIN_SLAP_ATTACK[this.attackFrame]];
                }
            }
            return;
        }

        if (this.world.keyboard.E && !this.isFormingBubble && !this.isAttacking && !this.FormingPoison) {
            this.isFormingBubble = true;
            this.bubbleFrame = 0;
            this.bubbleTimer = 0;
            this.img = this.imageCache[this.IMAGES_BUBBLE_FORMATION[0]];
        }
        if (this.isFormingBubble) {
            this.bubbleTimer += deltaTime;
            if (this.bubbleTimer > this.bubbleFrameDuration) {
                this.bubbleTimer = 0;
                this.bubbleFrame++;
                if (this.bubbleFrame >= this.IMAGES_BUBBLE_FORMATION.length) {
                    this.isFormingBubble = false;
                    this.justFiredBubble = true;
                } else {
                    this.img = this.imageCache[this.IMAGES_BUBBLE_FORMATION[this.bubbleFrame]];
                }
            }
            return;
        }

        if (this.world.keyboard.Q && !this.isFormingPoison && !this.isAttacking && !this.isFormingBubble && this.world.collectedPoisons > 0) {
            this.isFormingPoison = true;
            this.poisonFrame = 0;
            this.poisonTimer = 0;
            this.img = this.imageCache[this.IMAGES_POISON_FORMATION[0]];
        }
        if (this.isFormingPoison) {
            this.poisonTimer += deltaTime;
            if (this.poisonTimer > this.poisonFrameDuration) {
                this.poisonTimer = 0;
                this.poisonFrame++;
                if (this.poisonFrame >= this.IMAGES_POISON_FORMATION.length) {
                    this.isFormingPoison = false;
                    this.justFiredPoison = true;
                } else {
                    this.img = this.imageCache[this.IMAGES_POISON_FORMATION[this.poisonFrame]];
                }
            }
            return;
        }
        
        this.animationTimer += deltaTime;
        if(this.animationTimer > 150){
            if (this.isDead()) {
                this.playAnimation(this.IMAGES_DEAD);
            } else if (this.isHurt()) {
                this.playAnimation(this.IMAGES_HURT);
            } else if (isMoving) {
                this.playAnimation(this.IMAGES_SWIM);
            }else if (this.idleTime > this.longIdleThreshold) {
                this.playAnimation(this.IMAGES_LONG_IDLE);
                this.applyGravity(deltaTime);
            } else {
                this.playAnimation(this.IMAGES_IDLE);
            }
            this.animationTimer = 0;
        }
    }
}