// Netz-/Boss-Erschein-Sequenz für World, ausgelagert damit world.class.js
// unter der 400-LOC-Grenze bleibt. Wird per Object.assign(World.prototype, ...)
// in world.class.js eingebunden - die Methoden greifen weiterhin ganz normal
// über "this" auf die World-Instanz zu.
export const WorldBossIntroMixin = {

    // Löst einmalig die Netz-Sequenz aus, sobald Sharkie die Trigger-Position
    // erreicht, und startet danach den Kamera-Schwenk zum Boss-Bereich,
    // sobald das Netz fertig ausgerollt ist.
    checkNetTrigger(){
        if (!this.netTriggered) {
            this.tryTriggerNet();
            return;
        }
        this.tryStartCameraPan();
    },

    // Sharkie friert ein, dreht sich zum Netz um und zeigt Verwunderung.
    tryTriggerNet(){
        // Erst auslösen, wenn Sharkie komplett am Netz vorbei ist (nicht nur
        // die linke Kante erreicht) - sonst überlappt sein Körper (250px)
        // noch die Netz-Zone (75px), und er bleibt an sich selbst hängen.
        if (this.character.x < this.level.net.x + this.level.net.width) return;

        this.netTriggered = true;
        this.character.isFrozen = true;
        this.character.showingConfusion = true;
        this.character.confusionFrame = 0;
        this.character.confusionTimer = 0;
        this.character.otherDirection = true; // zum Netz umdrehen
        this.level.net.startUnrolling();
    },

    // Netz fertig: Verwunderung abschalten, Kamera-Schwenk starten
    // (Sharkie bleibt eingefroren, siehe updateBossIntro()).
    tryStartCameraPan(){
        if (!this.character.isFrozen || !this.level.net.unrollDone) return;
        if (this.bossIntroPhase !== 'pending') return;

        this.character.showingConfusion = false;
        this.bossIntroPhase = 'panning';
        this.cameraPanStartX = this.camera_x;
        this.cameraPanTargetX = this.canvas.width - this.level.level_end_x;
        this.cameraPanElapsed = 0;
    },

    updateBossIntro(deltaTime) {
        if (this.bossIntroPhase === 'panning') {
            this.updateCameraPan(deltaTime);
        } else if (this.bossIntroPhase === 'introducing'){
            this.checkIntroComplete();
        }
    },

    updateCameraPan(deltaTime){
        this.cameraPanElapsed += deltaTime;
        let t = Math.min(this.cameraPanElapsed / this.cameraPanDuration, 1);
        let eased = 1 - Math.pow(1 - t, 3); // Ease-out, wie beim Rückstoß
        this.camera_x = this.cameraPanStartX + (this.cameraPanTargetX - this.cameraPanStartX) * eased;
        if (t >= 1) {
            this.bossIntroPhase = 'introducing';
            if (this.finalboss) this.finalboss.startIntroducing();
        }
    },

    checkIntroComplete(){
        if (this.finalboss && this.finalboss.introduced) {
            this.bossIntroPhase = 'done';
            this.character.isFrozen = false;
        }
    },
};