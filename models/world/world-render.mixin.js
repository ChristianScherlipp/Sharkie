import { getSharedImage } from "../image-cache.js";

export const WorldRenderMixin = {

    /**
     * Draws the object onto the canvas.
     */
    draw(){
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.translate(this.camera_x, 0);
        this.drawWorldLayer();
        this.drawForegroundLayer();
        this.ctx.translate(-this.camera_x, 0);
        this.drawHud();
    },

    /**
     * Draws world layer.
     */
    drawWorldLayer(){
        this.addObjectsToMap(this.level.backgroundObjects);
        this.addObjectsToMap(this.level.lights);
        this.addObjectsToMap(this.level.enemies);
        this.addObjectsToMap(this.level.coins);
        this.addObjectsToMap(this.level.poisons);
        this.drawPopups(this.xpPopups, 'yellow');
        this.drawPopups(this.damagePopups, 'red');
        this.drawCoinPopups();
    },

    /**
     * Draws hud.
     */
    drawHud(){
        this.addToMap(this.coinBar);
        this.addToMap(this.posionBar);
        this.addToMap(this.healthBar);
        this.drawExperience();
        this.drawFinalbossHealthbar();
    },

    /**
     * Draws foreground layer.
     */
    drawForegroundLayer(){
        this.addObjectsToMap(this.firingObjects);
        this.addToMap(this.level.net);
        this.addToMap(this.character);
        this.drawConfusion();
    },

    /**
     * Draws confusion.
     */
    drawConfusion(){
        if (!this.character.showingConfusion) return;
        let baseX = this.character.x + this.character.width / 2;
        let baseY = this.character.y + this.character.offset.top - 20;

        this.ctx.save();
        this.setConfusionTextStyle();
        this.drawConfusionMarks(baseX, baseY);
        this.ctx.restore();
    },

    /**
     * Sets confusion text style.
     */
    setConfusionTextStyle(){
        this.ctx.font = 'bold 22px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.lineWidth = 3;
        this.ctx.strokeStyle = 'black';
        this.ctx.fillStyle = 'white';
    },

    /**
     * Draws confusion marks.
     * @param {number} baseX - Base X position in pixels.
     * @param {number} baseY - Base Y position in pixels.
     */
    drawConfusionMarks(baseX, baseY){
        let bounceOffsets = [0, -6, -10, -6];
        let marks = [-24, 0, 24];
        marks.forEach((dx, i) => {
            let offsetIndex = (this.character.confusionFrame + i) % bounceOffsets.length;
            let y = baseY + bounceOffsets[offsetIndex];
            this.ctx.strokeText('?', baseX + dx, y);
            this.ctx.fillText('?', baseX + dx, y);
        });
    },

    /**
     * Draws popups.
     * @param {Array<Object>} popups - List of popup objects to update/draw.
     * @param {string} color - CSS color used to draw the text.
     */
    drawPopups(popups, color){
        popups.forEach(popup => {
            let t = Math.min(popup.elapsed / popup.duration, 1);
            let y = popup.y - popup.riseDistance * t;
            this.ctx.save();
            this.ctx.globalAlpha = 1 - t;
            this.setPopupTextStyle();
            this.ctx.strokeText(popup.text, popup.x, y);
            this.ctx.fillStyle = color;
            this.ctx.fillText(popup.text, popup.x, y);
            this.ctx.restore();
        });
    },

    /**
     * Sets popup text style.
     */
    setPopupTextStyle(){
        this.ctx.font = 'bold 20px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.lineWidth = 3;
        this.ctx.strokeStyle = 'black';
    },

    /**
     * Draws coin popups.
     */
    drawCoinPopups(){
        let icon = getSharedImage('./assets/img/4.Marcadores/1.Coins/1.png');
        let size = 30;
        this.coinPopups.forEach(popup => {
            let t = Math.min(popup.elapsed / popup.duration, 1);
            let y = popup.y - popup.riseDistance * t;
            this.ctx.save();
            this.ctx.globalAlpha = 1 - t;
            this.ctx.drawImage(icon, popup.x - size / 2, y - size / 2, size, size);
            this.ctx.restore();
        });
    },

    /**
     * Draws finalboss healthbar.
     */
    drawFinalbossHealthbar(){
        if (!this.showFinalbossHealthbar || !this.finalboss) return;
        let bar = { x: this.canvas.width - 170, y: 80, width: 150, height: 18, radius: 8 };
        let pct = Math.max(0, this.finalboss.health / this.finalboss.maxHealth);

        this.ctx.save();
        this.drawHealthbarBackground(bar);
        this.drawHealthbarFill(bar, pct);
        this.drawHealthbarBorder(bar);
        this.drawHealthbarText(bar);
        this.ctx.restore();
    },

    /**
     * Draws healthbar background.
     * @param {Object} bar - Healthbar layout data (position and size).
     */
    drawHealthbarBackground(bar){
        this.ctx.beginPath();
        this.ctx.roundRect(bar.x, bar.y, bar.width, bar.height, bar.radius);
        this.ctx.fillStyle = '#3a0d0d';
        this.ctx.fill();
    },

    /**
     * Draws healthbar fill.
     * @param {Object} bar - Healthbar layout data (position and size).
     * @param {number} pct - Fill percentage from 0 to 1.
     */
    drawHealthbarFill(bar, pct){
        let fillWidth = bar.width * pct;
        this.ctx.beginPath();
        this.ctx.roundRect(bar.x, bar.y, fillWidth, bar.height, bar.radius);
        this.ctx.fillStyle = '#e0334d';
        this.ctx.fill();
    },

    /**
     * Draws healthbar border.
     * @param {Object} bar - Healthbar layout data (position and size).
     */
    drawHealthbarBorder(bar){
        this.ctx.beginPath();
        this.ctx.roundRect(bar.x, bar.y, bar.width, bar.height, bar.radius);
        this.ctx.strokeStyle = 'white';
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
    },

    /**
     * Draws healthbar text.
     * @param {Object} bar - Healthbar layout data (position and size).
     */
    drawHealthbarText(bar){
        this.ctx.font = 'bold 12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillStyle = 'white';
        let healthText = Math.max(0, Math.round(this.finalboss.health));
        this.ctx.fillText(`Boss: ${healthText}/${this.finalboss.maxHealth}`, bar.x + bar.width / 2, bar.y + bar.height / 2);
    },

    /**
     * Draws experience.
     */
    drawExperience(){
        let text = String(this.experience).padStart(6, '0');
        let x = this.canvas.width / 2;

        this.ctx.save();
        this.ctx.font = 'bold 24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.lineWidth = 4;
        this.ctx.strokeStyle = 'black';
        this.ctx.strokeText(text, x, 30);
        this.ctx.fillStyle = 'white';
        this.ctx.fillText(text, x, 30);
        this.ctx.restore();
    },

    /**
     * Adds objects to map.
     * @param {Array<DrawableObject>} objects - Objects to add to the canvas map.
     */
    addObjectsToMap (objects) {
        objects.forEach(object => {
            this.addToMap(object);
        });
    },

    /**
     * Adds to map.
     * @param {MovableObject} mo - The other movable object to compare against.
     */
    addToMap (mo){
        if (mo.hasAppeared === false) return;

        if (mo.otherDirection) {
            this.flipImage(mo);
        }
        mo.draw(this.ctx);

        if (mo.otherDirection) {
            this.flipImageBack(mo);
        }
        mo.drawFrame(this.ctx);
    },

    /**
     * Flips image.
     * @param {MovableObject} mo - The other movable object to compare against.
     */
    flipImage (mo){
        this.ctx.save();
        this.ctx.translate(mo.width, 0);
        this.ctx.scale(-1, 1)
        mo.x = mo.x * -1;
    },

    /**
     * Flips image back.
     * @param {MovableObject} mo - The other movable object to compare against.
     */
    flipImageBack(mo){
        mo.x = mo.x * -1;
        this.ctx.restore();
    },
};