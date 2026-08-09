// Zeichen-Methoden für World, ausgelagert damit world.class.js unter der
// 400-LOC-Grenze bleibt. Wird per Object.assign(World.prototype, ...) in
// world.class.js eingebunden - die Methoden greifen weiterhin ganz normal
// über "this" auf die World-Instanz zu.
export const WorldRenderMixin = {

    draw(){
        // Canvas Clearen um neu geladenen bilder anzuzeigen
        // und das vorgänger bild aus dem canvas entfernt wird.
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.translate(this.camera_x, 0);
        this.drawWorldLayer();
        this.ctx.translate(-this.camera_x, 0);
        this.drawHud();
        this.ctx.translate(this.camera_x, 0);
        this.drawForegroundLayer();
        this.ctx.translate(-this.camera_x, 0);
    },

    // Alles, was sich mit der Kamera mitbewegt: Hintergrund, Licht, Gegner,
    // Coins, Poisons, XP-/Schadens-Popups.
    drawWorldLayer(){
        this.addObjectsToMap(this.level.backgroundObjects);
        this.addObjectsToMap(this.level.lights);
        this.addObjectsToMap(this.level.enemies);
        this.addObjectsToMap(this.level.coins);
        this.addObjectsToMap(this.level.poisons);
        this.drawPopups(this.xpPopups, 'yellow');
        this.drawPopups(this.damagePopups, 'red');
    },

    // HUD: fest auf dem Bildschirm, bewegt sich nicht mit der Kamera.
    drawHud(){
        this.addToMap(this.coinBar);
        this.addToMap(this.posionBar);
        this.addToMap(this.healthBar);
        this.drawExperience();
        this.drawFinalbossHealthbar();
    },

    // Wieder mit Kamera-Versatz: Blasen, Netz, Sharkie selbst.
    drawForegroundLayer(){
        this.addObjectsToMap(this.firingObjects);
        this.addToMap(this.level.net);
        this.addToMap(this.character);
        this.drawConfusion();
    },

    // Zeichnet 3 bouncende "?" über Sharkies Kopf, solange showingConfusion
    // true ist - als Text statt Bild, da hierfür kein Asset vorliegt.
    drawConfusion(){
        if (!this.character.showingConfusion) return;
        let baseX = this.character.x + this.character.width / 2;
        // relativ zur tatsächlichen Kopf-Hitbox (offset.top), nicht zur rohen
        // Sprite-Oberkante - da oben ist sonst viel leerer Platz im Bild.
        let baseY = this.character.y + this.character.offset.top - 20;

        this.ctx.save();
        this.setConfusionTextStyle();
        this.drawConfusionMarks(baseX, baseY);
        this.ctx.restore();
    },

    setConfusionTextStyle(){
        this.ctx.font = 'bold 22px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.lineWidth = 3;
        this.ctx.strokeStyle = 'black';
        this.ctx.fillStyle = 'white';
    },

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

    // Gemeinsame Zeichenroutine für XP- (gelb) und Schadens- (rot) Popups -
    // beide funktionierten vorher identisch in zwei fast gleichen Methoden,
    // nur Array und Farbe unterschieden sich.
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

    setPopupTextStyle(){
        this.ctx.font = 'bold 20px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.lineWidth = 3;
        this.ctx.strokeStyle = 'black';
    },

    // Boss-Healthbar: nur sichtbar, sobald Sharkie hinter dem Netz ist.
    // Reine Canvas-Zeichnung (Rechtecke), da hierfür kein Bild-Asset vorliegt.
    drawFinalbossHealthbar(){
        if (!this.showFinalbossHealthbar || !this.finalboss) return;
        let bar = { x: this.canvas.width - 170, y: 20, width: 150, height: 18, radius: 8 };
        let pct = Math.max(0, this.finalboss.health / this.finalboss.maxHealth);

        this.ctx.save();
        this.drawHealthbarBackground(bar);
        this.drawHealthbarFill(bar, pct);
        this.drawHealthbarBorder(bar);
        this.drawHealthbarText(bar);
        this.ctx.restore();
    },

    drawHealthbarBackground(bar){
        this.ctx.beginPath();
        this.ctx.roundRect(bar.x, bar.y, bar.width, bar.height, bar.radius);
        this.ctx.fillStyle = '#3a0d0d';
        this.ctx.fill();
    },

    drawHealthbarFill(bar, pct){
        let fillWidth = bar.width * pct;
        this.ctx.beginPath();
        this.ctx.roundRect(bar.x, bar.y, fillWidth, bar.height, bar.radius);
        this.ctx.fillStyle = '#e0334d';
        this.ctx.fill();
    },

    drawHealthbarBorder(bar){
        this.ctx.beginPath();
        this.ctx.roundRect(bar.x, bar.y, bar.width, bar.height, bar.radius);
        this.ctx.strokeStyle = 'white';
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
    },

    drawHealthbarText(bar){
        this.ctx.font = 'bold 12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillStyle = 'white';
        let healthText = Math.max(0, Math.round(this.finalboss.health));
        this.ctx.fillText(`Boss: ${healthText}/${this.finalboss.maxHealth}`, bar.x + bar.width / 2, bar.y + bar.height / 2);
    },

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

    addObjectsToMap (objects) {
        objects.forEach(object => {
            this.addToMap(object);
        });
    },

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

    // Image Spiegeln
    flipImage (mo){
        this.ctx.save();
        this.ctx.translate(mo.width, 0);
        this.ctx.scale(-1, 1)
        mo.x = mo.x * -1;
    },
    // gespiegeltest Image zurücksetzen
    flipImageBack(mo){
        mo.x = mo.x * -1;
        this.ctx.restore();
    },
};