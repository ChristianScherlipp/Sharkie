export class AudioHub {
    static MUSIC = new Audio('./assets/audio/HG_Sound.mp3');
    static MOVE = new Audio('./assets/audio/move-sound.mp3');
    static FIN_SLAP = new Audio('./assets/audio/punch.mp3');
    static BUBBLE_LOAD = new Audio('./assets/audio/bubble-load.mp3');
    static BUBBLE_FINISH_LOAD = new Audio('./assets/audio/bubble-finish-load.mp3');
    static BUBBLE_BURST = new Audio('./assets/audio/bubble-burst.mp3');
    static JELLYFISH_ELECTRO = new Audio('./assets/audio/electric-buzz.mp3');
    static BOSS_ATTACK = new Audio('./assets/audio/assets_sounds_boss-bite.mp3');
    static BOSS_APPEARS = new Audio('./assets/audio/assets_sounds_boss-splash.mp3');
    static JELLYFISH_CONTACT = new Audio('./assets/audio/electric-shock.mp3');
    static COIN_COLLECTED = new Audio('./assets/audio/coin-collected.mp3');
    static POTIN_COLLECTED = new Audio('./assets/audio/bottle-open.mp3');
    static HURT = new Audio('./assets/audio/electric-hurt.mp3');
    static LEVEL_SUCCESS = new Audio('./assets/audio/lvl-succes.mp3');
    static GAME_WIN = new Audio('./assets/audio/game-win.mp3');
    static GAME_OVER = new Audio('./assets/audio/game-over1.mp3');
    
    static masterVolume = 0.4;
    static musicVolume = 0.4;
    static sfxVolume = 0.4;

    static MUTE_STORAGE_KEY = 'sharkie-muted';
    static isMuted = false;

    static allSounds = [
        AudioHub.MUSIC,
        AudioHub.MOVE,
        AudioHub.FIN_SLAP,
        AudioHub.BUBBLE_LOAD,
        AudioHub.BUBBLE_FINISH_LOAD,
        AudioHub.BUBBLE_BURST,
        AudioHub.JELLYFISH_ELECTRO,
        AudioHub.BOSS_ATTACK,
        AudioHub.BOSS_APPEARS,
        AudioHub.JELLYFISH_CONTACT,
        AudioHub.COIN_COLLECTED,
        AudioHub.POTIN_COLLECTED,
        AudioHub.HURT,
        AudioHub.LEVEL_SUCCESS,
        AudioHub.GAME_WIN,
        AudioHub.GAME_OVER,
    ];

    static { AudioHub.MUSIC.loop = true; AudioHub.JELLYFISH_ELECTRO.loop = true; }

    static playOne(sound) {
        if (AudioHub.isMuted) return;
        if (sound.readyState < 2) return;
        sound.currentTime = 0;
        sound.play().catch(() => {});
    }

    static playIfNotRunning(sound) {
        if (AudioHub.isMuted || !sound.paused) return;
        AudioHub.playOne(sound);
    }

    static stopOne(sound) {
        sound.pause();
        sound.currentTime = 0;
    }

    static stopAll() {
        AudioHub.allSounds.forEach((sound) => {
            sound.pause();
        });
    }

    static toggleMusic() {
        AudioHub.isMuted = !AudioHub.isMuted;
        localStorage.setItem(AudioHub.MUTE_STORAGE_KEY, AudioHub.isMuted);
        if (AudioHub.isMuted){
            AudioHub.stopAll();
        } else {
            AudioHub.MUSIC.play().catch(() => {});
        }
        return !AudioHub.isMuted;
    }

    static loadMuteState() {
        AudioHub.isMuted = localStorage.getItem(AudioHub.MUTE_STORAGE_KEY) === 'true';
        return !AudioHub.isMuted;
    }

    static setVolume(volume) {
        AudioHub.allSounds.forEach((sound) => {
            sound.volume = volume;
        });
    }

    static setMasterVolume(value) {
        AudioHub.masterVolume = Number(value);
        AudioHub.applyVolumes();
    }

    static setMusicVolume(value) {
        AudioHub.musicVolume = Number(value);
        AudioHub.applyVolumes();
    }

    static setSfxVolume(value) {
        AudioHub.sfxVolume = Number(value);
        AudioHub.applyVolumes();
    }

    static applyVolumes() {
        AudioHub.MUSIC.volume = AudioHub.masterVolume * AudioHub.musicVolume;
        AudioHub.allSounds.forEach((sound) => {
            if (sound === AudioHub.MUSIC) return;
            sound.volume = AudioHub.masterVolume * AudioHub.sfxVolume;
        });
    }
}