export function getControlTemplate() {
    return `
    <h2>Steuerung</h2>

        <br>

        ⬅️ ➡️ ⬆️ ⬇️ Pfeiltasten oder WASD = Bewegen<br><br>

        Leertaste = Schwanzflossen-Schlag (Nahkampf)<br><br>

        E = Blase abschießen (Fernkampf)<br><br>

        Q = Gift-Schuss (nur mit Munition)

        <br><br>

        <small>
        Kugelfisch nur von hinten mit dem Schlag treffbar,
        von vorne wehrt er sich mit Stacheln.
        Quallen nur mit der Blase besiegbar.
        Der Gift-Schuss wirkt ausschließlich gegen den Endgegner.
        </small>
    `;
}

export function getCreditsTemplate() {
    return`
    <h2>Sharkie</h2>

        <br>

        Entwickelt von

        <br><br>

        Christian Scherlipp

        <br><br>

        in Zusammenarbeit mit der

        <br><br>

        Developer Akademie
    `;
}