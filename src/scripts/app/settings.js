import CONSTANTS from "./constants.js";
import { settingsList } from "./settingsList.js";

export class Tidy5eUserSettings extends FormApplication {
	static init() {
		settingsList();
	}

	// settings template
	static get defaultOptions() {
		return {
			...super.defaultOptions,
			template: "modules/tidy5e-sheet/templates/settings.html",
			height: 500,
			title: game.i18n.localize("TIDY5E.Settings.SheetMenu.title"),
			width: 600,
			classes: ["tidy5e", "settings"],
			tabs: [
				{
					navSelector: ".tabs",
					contentSelector: "form",
					initial: "Players"
				}
			],
			submitOnClose: true
		};
	}

	constructor(object = {}, options) {
		super(object, options);
	}

	_getHeaderButtons() {
		let btns = super._getHeaderButtons();
		btns[0].label = "Close";
		return btns;
	}

	getSettingsData() {
		// debug(game.settings.get('tidy5e-sheet'))
		const settings = [
			"ammoEquippedOnly",
			"activeEffectsMarker",
			"classListDisabled",
			"contextRollButtons",
			"defaultActionsTab",
			"editGmAlwaysEnabled",
			"editEffectsGmOnlyEnabled",
			"editTotalLockEnabled",
			"exhaustionEffectsEnabled",
			"exhaustionEffectIcon",
			"exhaustionEffectCustom",
			"exhaustionEffectCustomTiers",
			"exhaustionOnHover",
			"exhaustionDisabled",
			"expandedSheetEnabled",
			"hideIfZero",
			"hiddenDeathSavesEnabled",
			"hideSpellSlotMarker",
			"hideStandardEncumbranceBar",
			"enableSpellLevelButtons",
			"hpBarDisabled",
			"hpBarDisabledNpc",
			"hpBarDisabledVehicle",
			"hpOverlayDisabled",
			"hpOverlayDisabledNpc",
			"hpOverlayDisabledVehicle",
			"hpOverlayBorder",
			"hpOverlayBorderNpc",
			"hpOverlayBorderVehicle",
			"inspirationAnimationDisabled",
			"inspirationDisabled",
			"inspirationOnHover",
			"itemCardsAreFloating",
			"itemCardsDelay",
			"itemCardsFixKey",
			"itemCardsForAllItems",
			"journalTabDisabled",
			"journalTabNPCDisabled",
			"linkMarkerNpc",

			"playerNameEnabled",
			"portraitStyle",
			"quantityAlwaysShownEnabled",
			"restingForNpcsEnabled",
			"restingForNpcsChatDisabled",
			"rightClickDisabled",
			"classicControlsEnabled",
			"hideIconsNextToTheItemName",
			"skillsAlwaysShownNpc",
			"hideSpellbookTabNpc",

			"playerSheetWidth",
			"npsSheetWidth",
			"vehicleSheetWidth",

			"traitLabelsEnabled",
			"traitsAlwaysShownNpc",
			"traitsMovedBelowResource",
			"traitsMovedBelowResourceNpc",
			"traitsTogglePc",
			// REMOVED 2.1.5 do the job now
			// "lazyHpAndExpEnable",
			// "lazyHpForceHpValueLimit1",
			// "lazyHpForceHpValueLimit2",
			"lazyMoneyEnable",
			"lazyMoneyAddConvert",
			"lazyMoneyIgnoreElectrum",
			"lazyMoneyChatLog",

			"enableSortFavoritesItemsAlphabetically",
			"allowCantripToBePreparedOnContext",
			"enableActionListOnFavoritePanel",
			"spellClassFilterSelect",
			"spellClassFilterIconReplace",
			"spellClassFilterAdditionalClasses",
			"allowHpMaxOverride",
			"allowHpConfigOverride",
			"betterAttackDialog",

			"lockMoneyChanges",
			"lockExpChanges",
			"lockHpMaxChanges",
			"lockLevelSelector",
			"lockConfigureSheet",
			"lockItemQuantity",

			"colorPickerEnabled",
			"colorPickerEquipped",
			"colorPickerEquippedOutline",
			"colorPickerEquippedAccent",
			"colorPickerPrepared",
			"colorPickerPreparedOutline",
			"colorPickerPreparedAccent",
			"colorPickerPact",
			"colorPickerPactOutline",
			"colorPickerPactAccent",
			"colorPickerAtWill",
			"colorPickerAtWillOutline",
			"colorPickerAtWillAccent",
			"colorPickerInnate",
			"colorPickerInnateOutline",
			"colorPickerInnateAccent",
			"colorPickerAlwaysPrepared",
			"colorPickerAlwaysPreparedOutline",
			"colorPickerAlwaysPreparedAccent",

			"hbEnableUpcastFreeSpell",
			"hbSetFeaturesForUpcastFreeSpell",

			"debug"
		];

		// return game.settings.get('tidy5e-sheet', 'user-settings');
		let data = {};
		settings.forEach((setting) => {
			data[setting] = { value: game.settings.get(CONSTANTS.MODULE_ID, setting) };
			// debug(data[setting]);
		});
		return data;
	}

	getData() {
		let data = super.getData();
		data.settings = this.getSettingsData();
		return data;
	}

	activateListeners(html) {
		super.activateListeners(html);
		// debug('Listeners Active!')
		// debug(html)

		let exhaustionEffectSelect = html.find("select#exhaustionEffectsEnabled");
		let exhaustionSelected = $(exhaustionEffectSelect).val();
		// debug(exhaustionSelected)
		switch (exhaustionSelected) {
			case "default": {
				html.find("input#exhaustionEffectIcon").closest(".setting").hide();
				html.find("input#exhaustionEffectCustom").closest(".setting").hide();
				break;
			}
			case "tidy5e": {
				html.find("input#exhaustionEffectCustom").closest(".setting").hide();
				break;
			}
			case "dfredce": {
				html.find("input#exhaustionEffectIcon").closest(".setting").hide();
				break;
			}
			case "cub": {
				html.find("input#exhaustionEffectIcon").closest(".setting").hide();
				break;
			}
		}

		exhaustionEffectSelect.on("change", function (e) {
			html.find("input#exhaustionEffectIcon").closest(".setting").hide();
			html.find("input#exhaustionEffectCustom").closest(".setting").hide();

			let value = e.target.value;
			if (value == "tidy5e") {
				html.find("input#exhaustionEffectIcon").closest(".setting").show();
			} else if (value == "custom") {
				html.find("input#exhaustionEffectCustom").closest(".setting").show();
			}
		});

		html.find("input#exhaustionEffectIcon").on("change", function (e) {
			// debug(e.target.value)
			if (e.target.value == "" || e.target.value == null) {
				e.target.value = "modules/tidy5e-sheet/images/exhaustion.svg";
			}
		});
	}

	redrawOpenSheets() {
		game.actors.filter((a) => a.sheet.rendered).forEach((a) => a.sheet.render(true));
	}

	_updateObject(ev, formData) {
		const data = expandObject(formData);
		let settingsUpdated = false;
		// debug(formData);
		// debug(settingOptions);
		for (let key in data) {
			// debug(`Key: ${key} with value: ${data[key]}`);
			let oldSetting = game.settings.get(CONSTANTS.MODULE_ID, key);
			let newSetting = data[key];
			if (oldSetting == newSetting) continue;
			// debug(`${key} changed to "${data[key]}"`);
			game.settings.set(CONSTANTS.MODULE_ID, key, data[key]);
			settingsUpdated = true;
		}

		if (settingsUpdated) {
			this.redrawOpenSheets();
		}
	}
}

Hooks.on("renderTidy5eUserSettings", () => {
	if (!game.user.isGM) {
		document.querySelectorAll(".tidy5e.settings .gm-only").forEach(function (el) {
			el.remove();
		});
	}
});
