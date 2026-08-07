// Gemeinsamer Bild-Cache über alle Spielobjekte hinweg.
//
// Vorher hat jedes Objekt für jeden Bildpfad ein eigenes new Image()
// angelegt - z.B. hätten 52 Coins + 12 BigCoins zusammen 320 Image-Objekte
// für nur 4 einzigartige Bilddateien erzeugt, 6 Kugelfische 102 Objekte für
// nur 17 einzigartige Dateien usw. Das kostet beim Levelstart unnötig viel
// Zeit und Speicher, obwohl die allermeisten Objekte exakt dieselbe Datei
// zeigen. Dieser Cache sorgt dafür, dass jeder Pfad nur EIN Mal als Image
// angelegt wird und alle Objekte sich dasselbe (bereits ladende/geladene)
// Image-Element teilen.
const imageCache = new Map();

export function getSharedImage(path) {
    let img = imageCache.get(path);
    if (!img) {
        img = new Image();
        img.src = path;
        imageCache.set(path, img);
    }
    return img;
}