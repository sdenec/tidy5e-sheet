
export function applyLocks(app, html, actorData) {
    if(game.user.isGM){
        return;
    }
    if (game.settings.get('tidy5e-sheet', "lockMoneyChanges")) {
        for (const elem of html.find("input[name^='system.currency']")) {
            elem.setAttribute('readonly', true);
        }
    }
    if (game.settings.get('tidy5e-sheet', "lockExpChanges")) {
        for (const elem of html.find("input[name^='system.details.xp.value']")) {
            elem.setAttribute('readonly', true);
        }
        for (const elem of html.find("input[name^='system.details.xp.max']")) {
            elem.setAttribute('readonly', true);
        }
    }
    if (game.settings.get('tidy5e-sheet', "lockHpMaxChanges")) {
        for (const elem of html.find("input[name^='system.attributes.hp.max']")) {
            elem.setAttribute('readonly', true);
        }
    }
    if (game.settings.get('tidy5e-sheet', "lockLevelSelector")) {
        for (const elem of html.find("select[class^='level-selector']")) {
            elem.setAttribute('disabled', true);
        }
    }
    if (game.settings.get('tidy5e-sheet', "lockConfigureSheet")) {
        for (const elem of html.find("a[class$='configure-sheet']")) {
            elem.style.pointerEvents="none";
            elem.style.cursor="default";
            elem.style.display="none";
        }
    }
}