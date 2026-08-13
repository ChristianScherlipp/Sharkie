export const WorldBossIntroMixin = {

    checkNetTrigger(){
        if (!this.netTriggered) {
            this.tryTriggerNet();
            return;
        }
        this.tryStartCameraPan();
    },

    tryTriggerNet(){
        if (this.character.x < this.level.net.x + this.level.net.width) return;

        this.netTriggered = true;
        this.character.isFrozen = true;
        this.character.showingConfusion = true;
        this.character.confusionFrame = 0;
        this.character.confusionTimer = 0;
        this.character.otherDirection = true;
        this.level.net.startUnrolling();
    },

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
        let eased = 1 - Math.pow(1 - t, 3);
        let camera = this.cameraPanStartX + (this.cameraPanTargetX - this.cameraPanStartX) * eased;
        this.camera_x = Math.round(camera);
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