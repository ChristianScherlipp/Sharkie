# 🦈 Sharkie

Ein Jump-'n'-Run/Beat-'em-up im Ozean, gebaut mit Vanilla JavaScript und
HTML5 Canvas – ganz ohne Frameworks. Entstanden als Abschlussprojekt im
Rahmen der Umschulung zum Fachinformatiker für Anwendungsentwicklung bei der
[Developer Akademie](https://developerakademie.com/).

Du steuerst Sharkie durch ein gefährliches Riff, sammelst Coins und
Gifttränke, besiegst Quallen und Kugelfische und stellst dich am Ende jedes
Levels einem Endgegner.

## Features

- 2 Level mit steigendem Schwierigkeitsgrad
- Nahkampf (Schwanzflossen-Schlag) und zwei Fernkampf-Angriffe (Blase,
  Gift-Schuss)
- Gegner mit unterschiedlichem Verhalten: Quallen, Kugelfische, Endgegner
  mit eigener Intro-Sequenz
- Coins, Gifttränke und Erfahrungspunkte, die beim Levelaufstieg mitgenommen
  werden
- Shop im Spiel: Coins gegen zusätzliches Leben oder Gift-Munition eintauschen
- Vollständig responsive: eigene Touch-Steuerung (Joystick + Buttons) für
  Mobilgeräte, echter Vollbildmodus
- Speicherbarer Mute-Status (Local Storage)
- Pausenmenü, Steuerungs-Popup (passt sich automatisch an Tastatur/Touch an),
  Musik-Einstellungen, Impressum

## Steuerung

| Taste / Button | Aktion |
|---|---|
| Pfeiltasten *oder* WASD / Joystick | Bewegen |
| Leertaste / Flossen-Button | Schwanzflossen-Schlag (Nahkampf) |
| E / Blasen-Button | Blase abschießen (Fernkampf) |
| Q / Gift-Button | Gift-Schuss (nur mit Munition) |
| F / Shop-Button | Shop öffnen |
| P / Pause-Button | Pause |
| Esc | Popup schließen, danach Pausenmenü |

Eine ausführlichere Spielanleitung inklusive Gegner-Taktik findest du in
[`Sharkie-Anleitung.MD`](./Sharkie-Anleitung.MD).

## Tech-Stack

- Vanilla JavaScript (ES6-Module, klassenbasierte OOP, Mixins für die
  `World`-Klasse)
- HTML5 Canvas für das komplette Rendering
- Kein Build-Step, keine externen Abhängigkeiten

## Projektstruktur

```
Sharkie/
├── index.html              Einstiegspunkt, lädt alle Styles/Scripts
├── game/
│   └── game.js              UI-Steuerung, Popups, Menüs, Game-Loop-Start
├── models/                  Alle Klassen (Character, Gegner, World, ...)
│   └── world-*.mixin.js     World-Logik aufgeteilt nach Bereich (Combat,
│                             Items, Render, Boss-Intro)
├── levels/                  Level-Aufbau (Gegner, Coins, Hintergrund, ...)
├── styles/                  CSS, aufgeteilt nach Bereich (Basis, Spiel,
│                             Mobile)
└── assets/                  Bilder, Sounds, Icons
```

## Lokal starten

Da das Projekt ES6-Module nutzt, funktioniert es nicht direkt über
`file://` (Browser blockieren Module-Imports dann aus Sicherheitsgründen).
Einfach über einen lokalen Server öffnen, z. B.:

```bash
# Mit Python
python3 -m http.server

# Oder mit der VS-Code-Erweiterung "Live Server"
```

Anschließend `index.html` im Browser aufrufen (z. B. `http://localhost:8000`).

## Browser-Support

Getestet in aktuellen Versionen von Chrome, Firefox und Safari (Desktop &
Mobile). Vollbildmodus nutzt die Fullscreen API inkl. Safari-Fallback
(`webkit`-Präfix).

## Autor

Christian Scherlipp
