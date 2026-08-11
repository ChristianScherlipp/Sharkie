import { MovableObject } from "./movable-object.class.js";
import { AudioHub } from "./audio-hub.class.js";

export class Jellyfish extends MovableObject {
    showFrame = false;
    x = 190 + Math.random() * 2500;
    y = Math.random() * (480 - 180);
    width = 70;
    height = 120;
    damage = 2;
    health = 1;
    strengthBonus = 0;
    detectionRange = 100;
    exitRange = 130;
    isAlerted = false;
    knocksBack = true;
    knockbackDistance = 100;

    offset = {
        top : 25,
        left : 25,
        right : 25,
        bottom : 40
    };
    
    JELLY_IMAGES_SWIM = [
            './assets/img/2.Enemy/2.Jelly_fish/Regular_damage/Lila1.png',
            './assets/img/2.Enemy/2.Jelly_fish/Regular_damage/Lila2.png',
            './assets/img/2.Enemy/2.Jelly_fish/Regular_damage/Lila3.png',
            './assets/img/2.Enemy/2.Jelly_fish/Regular_damage/Lila4.png',
    ];

    JELLY_IMAGES_DANGEROUS = [
        './assets/img/2.Enemy/2.Jelly_fish/Super_dangerous/Pink1.png',
        './assets/img/2.Enemy/2.Jelly_fish/Super_dangerous/Pink2.png',
        './assets/img/2.Enemy/2.Jelly_fish/Super_dangerous/Pink3.png',
        './assets/img/2.Enemy/2.Jelly_fish/Super_dangerous/Pink4.png',
    ];

    JELLY_IMAGES_DIE = [
        './assets/img/2.Enemy/2.Jelly_fish/Dead/Lila/L1.png',
        './assets/img/2.Enemy/2.Jelly_fish/Dead/Lila/L2.png',
        './assets/img/2.Enemy/2.Jelly_fish/Dead/Lila/L3.png',
        './assets/img/2.Enemy/2.Jelly_fish/Dead/Lila/L4.png',
    ];

    minY;
    maxY;
    movingUp = true;

    // Zählt, wie viele Quallen im Level gerade alarmiert sind. Der geteilte
    // Elektro-Sound (ein Audio-Element für alle Quallen) läuft, solange
    // dieser Zähler > 0 ist, und stoppt erst, wenn die letzte alarmierte
    // Qualle sich wieder beruhigt (oder stirbt) - so schneidet eine Qualle
    // nicht mehr versehentlich den Sound einer anderen ab.
    static alertedCount = 0;

    constructor(x, y, strengthBonus = 0) {
        super().loadImage('./assets/img/2.Enemy/2.Jelly_fish/Regular_damage/Lila1.png');
        this.loadImages(this.JELLY_IMAGES_SWIM);
        this.loadImages(this.JELLY_IMAGES_DANGEROUS);
        this.loadImages(this.JELLY_IMAGES_DIE);
        this.speed = 0.15 +Math.random() * 0.5;
        this.x = x;
        this.y =y;
        this.strengthBonus = strengthBonus;
        this.health += strengthBonus;
        let canvasHeight = 480;
        let range = 50 + Math.random() * 5
        this.minY = Math.max(0, this.y - range);
        this.maxY = Math.min(canvasHeight - this.height, this.y + range);
        this.getRealFrame();
    }

    // Wird jeden Frame von World.update() aufgerufen
    update(deltaTime, character, level){
        if (this.isDying) {
            this.updateDying(deltaTime, this.JELLY_IMAGES_DIE);
            return;
        }

        let distance = this.edgeDistanceTo(character);
        this.updateAlertState(distance, character);
        this.updateVerticalPatrol(deltaTime, level);
        this.updateSwimAnimation(deltaTime);
    }
    // Qualle wird "alarmiert" (macht mehr Schaden), sobald Sharkie nah
    // genug und nicht unterhalb der Qualle ist, und beruhigt sich wieder,
    // sobald der Abstand exitRange überschreitet.
    updateAlertState(distance, character){

        let characterBelow = character && (character.y + character.height / 2) > (this.y + this.height / 2);
        let visible = !characterBelow;

        if (!this.isAlerted && distance <= this.detectionRange && visible) {
            this.markAlerted();
        }else if (this.isAlerted && distance > this.exitRange) {
            this.markCalm();
        }
        this.damage = (this.isAlerted ? 5 : 2) + this.strengthBonus;
    }

    markAlerted(){
        this.isAlerted = true;
        Jellyfish.alertedCount++;
        if (Jellyfish.alertedCount === 1){
        AudioHub.playOne(AudioHub.JELLYFISH_ELECTRO);
        }
    }

    markCalm() {
        this.isAlerted = false;
        Jellyfish.alertedCount = Math.max(0, Jellyfish.alertedCount - 1);
        if (Jellyfish.alertedCount === 0){
            AudioHub.stopOne(AudioHub.JELLYFISH_ELECTRO);
        }
    }

    // Stirbt eine noch alarmierte Qualle (z.B. durch eine Blase getroffen),
    // muss sie sich genauso "beruhigen" wie beim normalen Entfernen -
    // sonst bliebe der Zähler für immer zu hoch stehen.
    startDying(){
        if (this.isAlerted) this.markCalm();
        super.startDying();
    }

    // Pendelt senkrecht zwischen minY und maxY (oder bricht früher ab,
    // wenn eine BigCoin im Weg ist).
    updateVerticalPatrol(deltaTime, level){
        if (this.movingUp) {
            this.moveUp(deltaTime);
            this.checkPatrolTurn(level, this.minY, true);
        } else {
            this.moveDown(deltaTime);
            this.checkPatrolTurn(level, this.maxY, false);
        }
    }

    // Prüft, ob die Qualle ihre Patrouillen-Grenze (minY/maxY) oder ein
    // Hindernis erreicht hat, und dreht in dem Fall die Richtung um.
    checkPatrolTurn(level, boundaryY, isMovingUp){
        let reachedBoundary = isMovingUp ? this.y <= boundaryY : this.y >= boundaryY;
        if (!reachedBoundary && !this.isBlockedByObstacle(level)) return;

        let overshotUp = isMovingUp && this.y < boundaryY;
        let overshotDown = !isMovingUp && this.y > boundaryY;
        if (overshotUp || overshotDown) this.y = boundaryY;

        this.movingUp = !isMovingUp;
        this.getRealFrame();
    }

    updateSwimAnimation(deltaTime){
        if (this.isAlerted) {
            this.animateImages(this.JELLY_IMAGES_DANGEROUS, deltaTime, 200);
        } else {
            this.animateImages(this.JELLY_IMAGES_SWIM, deltaTime, 255);
        }
    }
}