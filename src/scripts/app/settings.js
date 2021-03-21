import {settingsList} from './settingsList.js';

export class Tidy5eUserSettings extends FormApplication {
	static init() {
		game.settings.registerMenu('tidy5e-sheet', 'userMenu', {
      name: '',
      label: game.i18n.localize("TIDY5E.Settings.SheetMenu.label"),
      icon: 'fas fa-cog',
      type: Tidy5eUserSettings,
      restricted: false
    });
		
		settingsList();

	}

	// settings template
	static get defaultOptions() {
		return {
			...super.defaultOptions,
			template: "modules/tidy5e-sheet/templates/settings.html",
			height: 500,
			title: "Tidy5e Sheet Settings",
			width: 600,
			classes: ["tidy5e", "settings"],
			tabs: [ 
				{
					navSelector: '.tabs',
					contentSelector: 'form',
					initial: 'Players'
				} 
			],
			submitOnClose: true
		}
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
		
		const settings = [
			'itemCardsForAllItems',
			'itemCardsAreFloating',
			'itemCardsDelay',
			'itemCardsFixKey',

			'rightClickDisabled',
			'contextRollButtons',

			'traitLabelsEnabled',
			'traitsMovedBelowResource',
			'traitsTogglePc',
			'traitsAlwaysShownNpc',
			
			'skillsAlwaysShownNpc',

			'activeEffectsMarker',
			'quantityAlwaysShownEnabled',
			'exhaustionDisabled',
			'hpBarDisabled',
			'hpBarDisabledNpc',
			'hpBarDisabledVehicle',
			'hpOverlayDisabledNpc',
			'hpOverlayDisabled',
			'hpOverlayDisabledVehicle',
			'hpOverlayBorderNpc',
			'hpOverlayBorder',
			'hpOverlayBorderVehicle',
			
			'inspirationOnHover',
			'inspirationAnimationDisabled',
			'inspirationDisabled',
			
			'exhaustionEffectsEnabled',
			'exhaustionOnHover',
			
			'editEffectsGmOnlyEnabled',
			'editGmAlwaysEnabled',
			
			'classListDisabled',
			'hideIfZero',
			'linkMarkerNpc',
			'restingForNpcsEnabled',
			'editTotalLockEnabled',
			'portraitStyle',
			'expandedSheetEnabled'
		]

		// return game.settings.get('tidy5e-sheet', 'user-settings');
		let data = {};
		settings.forEach (setting => {
			data[setting] = game.settings.get('tidy5e-sheet', setting);
		})
		return data;
	}

	getData() {
		let data = super.getData();
		data.settings = this.getSettingsData();
		return data;
	}

	activateListeners(html) {
		super.activateListeners(html);
	}

	redrawOpenSheets() {
		game.actors.entities.filter(a => a.sheet.rendered).forEach(a => a.sheet.render(true));
	}

	_updateObject(ev, formData) {
		const data = expandObject(formData);
		let settingsUpdated = false;
		// console.log(formData);
		// console.log(settingOptions);
		for(let key in data) {
			// console.log(`Key: ${key} with value: ${data[key]}`);
			let oldSetting = game.settings.get('tidy5e-sheet', key);
			let newSetting = data[key];
			if(oldSetting == newSetting) continue;
			// console.log(`${key} changed to "${data[key]}"`);
			game.settings.set('tidy5e-sheet', key, data[key]);
			settingsUpdated = true;
		}

		if(settingsUpdated){
			this.redrawOpenSheets();
		}
	}	
}

Hooks.on("renderTidy5eUserSettings", () => {
	if (!game.user.isGM) {
		document.querySelectorAll('.tidy5e.settings .gm-only').forEach(function(el){
			el.remove();
		});
	}
});