
export function applyLocks(app, html, actorData) {
    if (game.settings.get('tidy5e-sheet', "lockMoneyChanges")) {
        for (const elem of html.find("input[name^='system.currency']")) {
            elem.setAttribute('readonly', true);
        }
    }
}