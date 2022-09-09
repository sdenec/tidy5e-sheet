import { tidy5eShowItemArt } from "./app/show-item-art.js";

export class Tidy5eItemSheet extends dnd5e.applications.item.ItemSheet5e {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["tidy5e", "dnd5ebak", "sheet", "item"],
    });
  }

  activateListeners(html) {
    super.activateListeners(html);

    let item = this.item;
    console.log(item);

    tidy5eShowItemArt(html, item);
  }
}

async function addEditorHeadline(app, html, data) {
  html
    .find(".tab[data-tab=description] .editor")
    .prepend(
      `<h2 class="details-headline">${game.i18n.localize(
        "TIDY5E.ItemDetailsHeadline"
      )}</h2>`
    );
}

// Register Tidy5e Item Sheet and make default
Items.registerSheet("dnd5e", Tidy5eItemSheet, { makeDefault: true });

Hooks.on("renderTidy5eItemSheet", (app, html, data) => {
  addEditorHeadline(app, html, data);
});
