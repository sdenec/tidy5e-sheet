import ItemSheet5e from "../../../systems/dnd5e/module/item/sheet.js";

export class Tidy5eItemSheet extends ItemSheet5e {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["tidy5e", "dnd5ebak", "sheet", "item"],
    });
  }

}

async function addEditorHeadline(app, html, data) {
  html.find(".tab[data-tab=description] .editor").prepend(`<h2 class="details-headline">${game.i18n.localize("TIDY5E.ItemDetailsHeadline")}</h2>`);
}
 
// Register Tidy5e Item Sheet and make default
Items.registerSheet("dnd5e", Tidy5eItemSheet, {makeDefault: true});

Hooks.once("ready", () => {

	// can be removed when 0.7.x is stable
  if (window.BetterRolls) {
    window.BetterRolls.hooks.addItemSheet("Tidy5eItemSheet");
  }
  
});

Hooks.on("renderTidy5eItemSheet", (app, html, data) => {
  addEditorHeadline(app, html, data);
});