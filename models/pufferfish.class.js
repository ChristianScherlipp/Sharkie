import { MovableObject } from "./movable-object.class.js";

export class Pufferfish extends MovableObject {
    showFrame = false;
    x = 200 + Math.random() * 2500;
    y = Math.random() * 450;
    width = 140;
    height = 110;
    health = 2;
    damage = 2;
    detectionRange = 100;
    exitRange = 130;  // Hysterese gegen Flackern an der Grenze
    alertState = 'idle';  // 'idle' | 'entering' | 'charging' | 'exiting'
    transitionFrame = 0;
    transitionTimer = 0;
    transitionFrameDuration = 100;
    chargeDeadzone = 20;
    chargeDirectionLeft = true;
    // Nach einem Bounce (Rand/BigCoin) wird die Charge-Richtung für diese
    // Dauer nicht aus der Spielerposition neu berechnet - verhindert, dass
    // der Fisch am Hindernis "vibriert", wenn der Spieler dahinter steht.
    chargeBounceCooldown = 0;
    chargeBounceCooldownDuration = 400;
    knocksBack = true;
    knockbackDistance = 50;

    minX;
    maxX;
    movingLeft = true;

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

    PUFFERFISH_IMAGES_TRANSITION = [
        './assets/img/2.Enemy/1.Puffer_fish_3_color_options/2.transition/1.transition1.png',
        './assets/img/2.Enemy/1.Puffer_fish_3_color_options/2.transition/1.transition2.png',
        './assets/img/2.Enemy/1.Puffer_fish_3_color_options/2.transition/1.transition3.png',
        './assets/img/2.Enemy/1.Puffer_fish_3_color_options/2.transition/1.transition4.png',
    ];

    PUFFERFISH_IMAGES_BUBBLESWIM = [
        './assets/img/2.Enemy/1.Puffer_fish_3_color_options/3.Bubbleeswim/1.bubbleswim1.png',
        './assets/img/2.Enemy/1.Puffer_fish_3_color_options/3.Bubbleeswim/1.bubbleswim2.png',
        './assets/img/2.Enemy/1.Puffer_fish_3_color_options/3.Bubbleeswim/1.bubbleswim3.png',
        './assets/img/2.Enemy/1.Puffer_fish_3_color_options/3.Bubbleeswim/1.bubbleswim4.png',
        './assets/img/2.Enemy/1.Puffer_fish_3_color_options/3.Bubbleeswim/1.bubbleswim5.png',
    ];

    PUFFERFISH_IMAGES_DIE = [
        './assets/img/2.Enemy/1.Puffer_fish_3_color_options/4.DIE/1.Dead.1.png',
        './assets/img/2.Enemy/1.Puffer_fish_3_color_options/4.DIE/1.Dead.2.png',
        './assets/img/2.Enemy/1.Puffer_fish_3_color_options/4.DIE/1.Dead.3.png',
    ];


    constructor(x, y){
        super().loadImage('./assets/img/2.Enemy/1.Puffer_fish_3_color_options/1.Swim/1.swim1.png');
        this.loadImages(this.PUFFERFISH_IMAGES_SWIM);
        this.loadImages(this.PUFFERFISH_IMAGES_TRANSITION);
        this.loadImages(this.PUFFERFISH_IMAGES_BUBBLESWIM);
        this.loadImages(this.PUFFERFISH_IMAGES_DIE);
        this.speed = 0.15 + Math.random() * 0.5;
        this.x = x;
        this.y = y;
        this.minX = this.x - (200 + Math.random() * 200);
        this.maxX = this.x + (200 + Math.random() * 200);
        this.getRealFrame();
    }

     // Wird jeden Frame von World.update() aufgerufen.
    update(deltaTime, character, level) {

        if (this.isDying) {
            this.updateDying(deltaTime, this.PUFFERFISH_IMAGES_DIE);
            return;
        }
        let distance = this.edgeDistanceTo(character);
        this.updateAlertState(distance, character);

        if (this.alertState === 'entering') { this.updateEntering(deltaTime); return; }
        if (this.alertState === 'charging') { this.updateCharging(deltaTime, character, level); return; }
        if (this.alertState === 'exiting') { this.updateExiting(deltaTime); return; }

        this.updatePatrol(deltaTime, level);
    }

    // Wechselt zwischen idle/entering/charging/exiting je nach Abstand zu
    // Sharkie (mit Hysterese, damit der Status nicht an der Grenze flackert).
    updateAlertState(distance, character){
        if (this.alertState === 'idle' && distance <= this.detectionRange && character) {
            if (this.isCharacterInFront(character)) {
                this.alertState = 'entering';
                this.transitionFrame = 0;
                this.transitionTimer = 0;
            }
        }
        if ((this.alertState === 'entering' || this.alertState === 'charging') && distance > this.exitRange) {
            this.alertState = 'exiting';
        }
        this.damage = (this.alertState === 'idle') ? 2 : 4;
    }

    isCharacterInFront(character){
        let facingLeft = !this.otherDirection;
        let charCenterX = character.x + character.width / 2;
        let myCenterX = this.x + this.width / 2;
        return facingLeft ? charCenterX <= myCenterX : charCenterX >= myCenterX;
    }

    // Übergangs-Animation "Kugelfisch bläst sich auf", bevor er angreift.
    updateEntering(deltaTime){
        this.transitionTimer += deltaTime;
        if (this.transitionTimer > this.transitionFrameDuration) {
            this.transitionTimer = 0;
            this.transitionFrame++;
            if (this.transitionFrame >= this.PUFFERFISH_IMAGES_TRANSITION.length) {
                this.alertState = 'charging';
                this.transitionFrame = 0;
            }
        }
        if (this.alertState === 'entering') {
            this.img = this.imageCache[this.PUFFERFISH_IMAGES_TRANSITION[this.transitionFrame]];
        }
    }

     // Übergangs-Animation zurück in den Ruhezustand, wenn Sharkie zu weit weg ist.
    updateExiting(deltaTime){
        this.transitionTimer += deltaTime;
        if (this.transitionTimer > this.transitionFrameDuration) {
            this.transitionTimer = 0;
            this.transitionFrame--;
            if (this.transitionFrame < 0) {
                this.alertState = 'idle';
                this.transitionFrame = 0;
                this.otherDirection = !this.movingLeft;
            }
        }
        if (this.alertState === 'exiting') {
            this.img = this.imageCache[this.PUFFERFISH_IMAGES_TRANSITION[this.transitionFrame]];
        }
    }

    // Angriffsmodus: schwimmt zielstrebig auf Sharkies letzte X-Position zu.
    updateCharging(deltaTime, character, level){
        this.updateChargeDirection(deltaTime, character);
        if (this.chargeDirectionLeft) this.moveLeft(deltaTime); else this.moveRight(deltaTime);
        this.checkChargeBounce(level);
        this.getRealFrame();
        this.otherDirection = !this.chargeDirectionLeft;
        this.animateImages(this.PUFFERFISH_IMAGES_BUBBLESWIM, deltaTime, 150);
    }

    updateChargeDirection(deltaTime, character){
        if (this.chargeBounceCooldown > 0) {
            this.chargeBounceCooldown -= deltaTime;
            return;
        }
        if (!character) return;
        let dx = (character.x + character.width / 2) - (this.x + this.width / 2);
        if (Math.abs(dx) > this.chargeDeadzone) {
            this.chargeDirectionLeft = dx < 0;
        }
    }

    // Rand des Levels bzw. eine BigCoin im Weg während der Charge: Richtung
    // umkehren, statt hindurchzuschwimmen.
    checkChargeBounce(level){
        let hitLeft = this.isAtLeftLevelBound(level);
        let hitRight = this.isAtRightLevelBound(level);
        let hitCoin = this.isBlockedByObstacle(level);

        if (hitLeft || (hitCoin && this.chargeDirectionLeft)) {
            if (level && this.x < level.level_start_x) this.x = level.level_start_x;
            this.chargeDirectionLeft = false;
            this.chargeBounceCooldown = this.chargeBounceCooldownDuration;
        } else if (hitRight || (hitCoin && !this.chargeDirectionLeft)) {
            if (level) this.x = level.level_end_x - this.width;
            this.chargeDirectionLeft = true;
            this.chargeBounceCooldown = this.chargeBounceCooldownDuration;
        }
    }

    // Ruhezustand: pendelt zwischen minX und maxX.
    updatePatrol(deltaTime, level){
        if (this.movingLeft) {
            this.moveLeft(deltaTime);
            this.checkPatrolBoundLeft(level);
        } else {
            this.moveRight(deltaTime);
            this.checkPatrolBoundRight(level);
        }
        this.animateImages(this.PUFFERFISH_IMAGES_SWIM, deltaTime, 150);
    }

    checkPatrolBoundLeft(level){
        let hitCoin = this.isBlockedByObstacle(level);
        if (this.x <= this.minX || this.isAtLeftLevelBound(level) || hitCoin) {
            if (level && this.x < level.level_start_x) this.x = level.level_start_x;
            this.movingLeft = false;
            this.otherDirection = true;
            this.getRealFrame();
        }
    }

    checkPatrolBoundRight(level){
        let hitCoin = this.isBlockedByObstacle(level);
        if (this.x >= this.maxX || this.isAtRightLevelBound(level) || hitCoin) {
            if (level && this.x + this.width > level.level_end_x) this.x = level.level_end_x - this.width;
            this.movingLeft = true;
            this.otherDirection = false;
            this.getRealFrame();
        }
    }
}