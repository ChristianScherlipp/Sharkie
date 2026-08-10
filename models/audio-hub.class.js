// Zentrale Verwaltung aller Sound-Effekte und der Hintergrundmusik.
export class AudioHub {
    // Audiodateien für Musik, Sharkie-Aktionen und Gegner-Ereignisse
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
    static HURT = new Audio('./assets/audio/electric-hurt.mp3');
    static LEVEL_SUCCESS = new Audio('./assets/audio/lvl-succes.mp3');
    static GAME_WIN = new Audio('./assets/audio/game-win.mp3');
    static GAME_OVER = new Audio('./assets/audio/game-over1.mp3');

    // Array, das alle definierten Audio-Dateien enthält
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
        AudioHub.HURT,
        AudioHub.LEVEL_SUCCESS,
        AudioHub.GAME_WIN,
        AudioHub.GAME_OVER,
    ];

    // Aktuelle Lautstärken: Gesamtlautstärke wirkt zusätzlich zur jeweiligen
    // Kategorie (effektive Lautstärke = master * music bzw. master * sfx).
    static masterVolume = 0.4;
    static musicVolume = 0.4;
    static sfxVolume = 0.4;

     // Hintergrundmusik und Quallen-Elektro-Sound laufen in Dauerschleife,
    // solange sie aktiv sind - alle anderen Sounds nicht.
    static { AudioHub.MUSIC.loop = true; AudioHub.JELLYFISH_ELECTRO.loop = true; }

    // Spielt eine einzelne Audiodatei ab
    static playOne(sound) {
        if (sound.readyState < 2) return;
        sound.currentTime = 0; // Startet immer von vorne
        sound.play().catch(() => {});
    }

    // Spielt eine Audiodatei nur ab, wenn sie gerade nicht schon läuft -
    // wichtig für Dauer-Sounds wie das Schwimm-Geräusch, das sonst bei
    // jedem einzelnen Frame neu von vorne starten würde.
    static playIfNotRunning(sound) {
        if (!sound.paused) return;
        this.playOne(sound);
    }

    // Stoppt das Abspielen einer einzelnen Audiodatei
    static stopOne(sound) {
        sound.pause();
        sound.currentTime = 0;
    }

    // Stoppt das Abspielen aller Audiodateien
    static stopAll() {
        AudioHub.allSounds.forEach((sound) => {
            sound.pause();
        });
    }

    // Musik an/aus (pausiert/setzt fort, ohne die Abspielposition zu verlieren).
    // Gibt zurück, ob die Musik danach läuft.
    static toggleMusic() {
        if (AudioHub.MUSIC.paused) {
            AudioHub.MUSIC.play().catch(() => {});
        } else {
            AudioHub.MUSIC.pause();
        }
        return !AudioHub.MUSIC.paused;
    }

    // Setzt die Lautstärke für alle Audiodateien
    static setVolume(volume) {
        AudioHub.allSounds.forEach((sound) => {
            sound.volume = volume;
        });
    }

    // Gesamtlautstärke: wirkt zusätzlich zur Musik-/Effekt-Lautstärke.
    static setMasterVolume(value) {
        AudioHub.masterVolume = Number(value);
        AudioHub.applyVolumes();
    }

    // Lautstärke nur für die Hintergrundmusik.
    static setMusicVolume(value) {
        AudioHub.musicVolume = Number(value);
        AudioHub.applyVolumes();
    }

    // Lautstärke nur für die Soundeffekte (alles außer Musik).
    static setSfxVolume(value) {
        AudioHub.sfxVolume = Number(value);
        AudioHub.applyVolumes();
    }

    // Wendet Master-/Musik-/Effekt-Lautstärke auf alle Audiodateien an.
    static applyVolumes() {
        AudioHub.MUSIC.volume = AudioHub.masterVolume * AudioHub.musicVolume;
        AudioHub.allSounds.forEach((sound) => {
            if (sound === AudioHub.MUSIC) return;
            sound.volume = AudioHub.masterVolume * AudioHub.sfxVolume;
        });
    }
}