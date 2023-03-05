import CONSTANTS from "./constants.js";

export const tidy5eHBEnableUpcastFreeSpell = async function (app, html, options) {
	if (game.settings.get(CONSTANTS.MODULE_ID, "hbEnableUpcastFreeSpell")) {
		if (app?.item?.type != "spell") {
			return; // Nevermind if this isn't a spell
		}
		if (html.find('[name="consumeSpellSlot"]').length == 0) {
			return; // Nevermind if this is a cantrip
		}

		// Add a new checkbox and insert it at the end of the list
		// let new_checkbox = $(`
		//   <div class="form-group">
		//     <label class="checkbox"><input type="checkbox" name="freeUpcast" />${game.i18n.localize("TIDY5E.LevelBump")}</label>
		//   </div>`);
		let new_checkbox = $(`
      <div class="form-group spell-lvl-btn">
        <label class="checkbox spell-lvl-btn__label"><input type="checkbox" name="freeUpcast" />${game.i18n.localize(
			"TIDY5E.LevelBump"
		)}</label>
      </div>`);
		new_checkbox.insertAfter(html.find(".form-group").last());
		// Bind a change handler to the new checkbox to increment/decrement the options in the dropdown
		// This is so that dnd5e will scale the spell up under the hood as-if it's upcast
		new_checkbox.change((ev) => {
			if (ev.target.checked) {
				Object.values(html.find('[name="consumeSpellLevel"] option')).map((o) => {
					if (o.value === "pact") {
						o.value = String(app.item.actor.system.spells.pact.level + 1);
					} else {
						o.value = String(parseInt(o.value) + 1);
					}
				});
			} else {
				Object.values(html.find('[name="consumeSpellLevel"] option')).map((o) => {
					if (o.text.includes("Pact")) {
						o.value = "pact";
					} else {
						o.value = String(parseInt(o.value) - 1);
					}
				});
			}
		});
		app.setPosition({ height: "auto" }); // Reset the height of the window to match the new content
	}
};

Hooks.on("dnd5e.preItemUsageConsumption", (item, config, options) => {
	if (game.settings.get(CONSTANTS.MODULE_ID, "hbEnableUpcastFreeSpell")) {
		if (item?.type != "spell") {
			return; // Nevermind if this isn't a spell
		}
		// If the checkbox is checked, drop the spell level used to calculate the slot cost by 1
		if (config?.freeUpcast) {
			if (item.system.preparation.mode === "pact") {
				config.consumeSpellLevel = "pact";
			} else {
				config.consumeSpellLevel = String(parseInt(config.consumeSpellLevel) - 1);
			}
		}
	}
});
