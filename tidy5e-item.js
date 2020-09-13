import ItemSheet5e from "../../systems/dnd5e/module/item/sheet.js";

export class Tidy5eItemSheet extends ItemSheet5e {
	static get defaultOptions() {
	  return mergeObject(super.defaultOptions, {
			classes: ["tidy5e", "dnd5e", "sheet", "item"],
		});
	}
}

// Register Tidy5e Item Sheet and make default
Items.registerSheet("dnd5e", Tidy5eItemSheet, {makeDefault: true});

Hooks.once("ready", () => {
  if (window.BetterRolls) {
    window.BetterRolls.hooks.addItemSheet("Tidy5eItemSheet");
	}
});
