// Zentrale Verwaltung aller Sound-Effekte und der Hintergrundmusik.
export class AudioHub {
    // Audiodateien für Musik, Sharkie-Aktionen und Gegner-Ereignisse
    static MUSIC = new Audio('./assets/audio/HG_Sound.mp3');
    static MOVE = new Audio('./assets/audio/move-sound.mp3');
    static FIN_SLAP = new Audio('./assets/audio/punch.mp3');
    static BUBBLE_ATTACK = new Audio('./assets/audio/bubbles.mp3');
    static JELLYFISH_ELECTRO = new Audio('./assets/audio/electric-buzz.mp3');
    static BOSS_ATTACK = new Audio('./assets/audio/assets_sounds_boss-bite.mp3');
    static BOSS_APPEARS = new Audio('./assets/audio/assets_sounds_boss-splash.mp3');
    static JELLYFISH_CONTACT = new Audio('./assets/audio/electric-shock.mp3');

    // Array, das alle definierten Audio-Dateien enthält
    static allSounds = [
        AudioHub.MUSIC,
        AudioHub.MOVE,
        AudioHub.FIN_SLAP,
        AudioHub.BUBBLE_ATTACK,
        AudioHub.JELLYFISH_ELECTRO,
        AudioHub.BOSS_ATTACK,
        AudioHub.BOSS_APPEARS,
        AudioHub.JELLYFISH_CONTACT,
    ];

    // Hintergrundmusik läuft in Dauerschleife, alle anderen Sounds nicht.
    static { AudioHub.MUSIC.loop = true; }

    // Spielt eine einzelne Audiodatei ab
    static playOne(sound) {
        if (sound.readyState < 2) return;
        sound.currentTime = 0; // Startet immer von vorne
        sound.play();
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

    // Setzt die Lautstärke für alle Audiodateien
    static setVolume(volume) {
        AudioHub.allSounds.forEach((sound) => {
            sound.volume = volume;
        });
    }
}