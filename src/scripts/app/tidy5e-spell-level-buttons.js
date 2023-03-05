import CONSTANTS from "./constants.js";
import { warn } from "./logger-util.js";

export const tidy5eSpellLevelButtons = async function (app, html, options) {
	if (
		game.settings.get(CONSTANTS.MODULE_ID, "enableSpellLevelButtons") &&
		// The module already do the job so for avoid redundance...
		!game.modules.get("spell-level-buttons-for-dnd5e")?.active
	) {
		if (app?.item?.type != "spell") {
			return; // Nevermind if this isn't a spell
		}
		if (html.find('[name="consumeSpellSlot"]').length == 0) {
			return;
		}
		const optionsApplication = app;

		if ($('.dnd5e.dialog #ability-use-form select[name="consumeSpellLevel"]').length > 0) {
			// If the dialog box has a option to select a spell level

			// Resize the window to fit the contents
			let originalWindowHeight = parseInt($(optionsApplication._element[0]).css("height"));
			let heightOffset = 42;

			$(optionsApplication._element[0]).height(originalWindowHeight + heightOffset);

			// Find the label that says "Cast at level", and select it's parent parent (There's no specific class or ID for this wrapper)
			let levelSelectWrapper = $(optionsApplication._element[0])
				.find(`.form-group label:contains("${game.i18n.localize(`DND5E.SpellCastUpcast`)}")`)
				.parent();
			let selectedLevel = levelSelectWrapper.find("select").val();

			let appId = optionsApplication.appId;

			// Hide the default level select menu
			levelSelectWrapper.css("display", "none");

			// Append a container for the buttons
			levelSelectWrapper.after(`
            <div class="form-group spell-lvl-btn">
                <label>${game.i18n.localize(`DND5E.SpellCastUpcast`)}</label>
                <div class="form-fields"></div>
            </div>
        `);

			// Append a button for each spell level that the user can cast
			$(optionsApplication._element[0])
				.find(`select[name="consumeSpellLevel"] option`)
				.each(function () {
					let availableTextSlotsFounded = $(this)
						.text()
						.match(/\(\d+\s\w+\)/);
					if (!availableTextSlotsFounded) {
						availableTextSlotsFounded = $(this).text().match(/\d+/g);
						const lastMatch = availableTextSlotsFounded[availableTextSlotsFounded.length - 1];
						if (lastMatch) {
							availableTextSlotsFounded = lastMatch;
						}
					}

					if (!availableTextSlotsFounded) {
						warn(
							`tidy5e-spell-level-buttons | tidy5eSpellLevelButtons | Cannot find the spell slots on text '${$(
								this
							).text()}' with ${/\(\d+\s\w+\)/}`
						);
					}
					let availableSlotsFounded = availableTextSlotsFounded
						? availableTextSlotsFounded[0].match(/\d+/)
						: undefined;
					if (!availableSlotsFounded) {
						warn(
							`tidy5e-spell-level-buttons | tidy5eSpellLevelButtons | Cannot find the spell slots on text '${$(
								this
							).text()}' with ${/\d+/}`
						);
					}
					let availableSlots = availableSlotsFounded ? availableSlotsFounded[0] : 0;
					let availableSlotsBadge = "";
					let value = $(this).val();
					let i;

					if (value == "pact") {
						// i = "p" + $(this).text().match(/\d/)[0]; // Get the pact slot level
						let availablePactSlotsFounded = $(this).text().match(/\d/);
						if (!availablePactSlotsFounded) {
							warn(
								`tidy5e-spell-level-buttons | tidy5eSpellLevelButtons | Cannot find the pact slots on text '${$(
									this
								).text()}' with ${/\d/}`
							);
						}
						if (availablePactSlotsFounded) {
							i = "p" + availablePactSlotsFounded[0]; // Get the pact slot level
						} else {
							i = "p" + 0;
						}
					} else {
						i = value;
					}

					if (availableSlots > 0) {
						availableSlotsBadge = `<span class="available-slots">${availableSlots}</span>`;
					}

					$(optionsApplication._element[0]).find(".spell-lvl-btn .form-fields").append(`
                <label title="${$(this).text()}" class="spell-lvl-btn__label" for="${appId}lvl-btn-${i}">
                    <input type="radio" id="${appId}lvl-btn-${i}" name="lvl-btn" value="${value}">
                    <div class="spell-lvl-btn__btn">${i}</div>
                    ${availableSlotsBadge}
                </label>
            `);
				});

			// Click on the button corresponding to the default value on the cast level dropdown menu
			$(optionsApplication._element[0]).find(`#${appId}lvl-btn-${selectedLevel}`).trigger("click");

			// Change the dropdown menu value when user clicks on a button
			$(optionsApplication._element[0])
				.find(".spell-lvl-btn__label")
				.on("click", function () {
					levelSelectWrapper.find("select").val($(this).find("input").val());
				});
		}
	}
};
