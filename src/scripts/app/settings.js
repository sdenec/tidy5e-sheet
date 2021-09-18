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
			title: game.i18n.localize("TIDY5E.Settings.SheetMenu.title"),
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
		
		// console.log(game.settings.get('tidy5e-sheet'))
		const settings = [
			'ammoEquippedOnly',
			'activeEffectsMarker',
			'classListDisabled',
			'contextRollButtons',
			'defaultActionsTab',
			'editGmAlwaysEnabled',
			'editEffectsGmOnlyEnabled',
			'editTotalLockEnabled',
			'exhaustionEffectsEnabled',
			'exhaustionEffectIcon',
			'exhaustionEffectCustom',
			'exhaustionEffectCustomTiers',
			'exhaustionOnHover',
			'exhaustionDisabled',
			'expandedSheetEnabled',
			'hideIfZero',
			'hiddenDeathSavesEnabled',
			'hpBarDisabled',
			'hpBarDisabledNpc',
			'hpBarDisabledVehicle',
			'hpOverlayDisabled',
			'hpOverlayDisabledNpc',
			'hpOverlayDisabledVehicle',
			'hpOverlayBorder',
			'hpOverlayBorderNpc',
			'hpOverlayBorderVehicle',
			'inspirationAnimationDisabled',
			'inspirationDisabled',
			'inspirationOnHover',
			'itemCardsAreFloating',
			'itemCardsDelay',
			'itemCardsFixKey',
			'itemCardsForAllItems',
			'journalTabDisabled',
			'linkMarkerNpc',
			
			'playerNameEnabled',
			'portraitStyle',
			'quantityAlwaysShownEnabled',
			'restingForNpcsEnabled',
			'restingForNpcsChatDisabled',
			'rightClickDisabled',
			'skillsAlwaysShownNpc',

			'playerSheetWidth',
			'npsSheetWidth',
			'vehicleSheetWidth',

			'traitLabelsEnabled',
			'traitsAlwaysShownNpc',
			'traitsMovedBelowResource',
			'traitsMovedBelowResourceNpc',
			'traitsTogglePc'
		]

		// return game.settings.get('tidy5e-sheet', 'user-settings');
		let data = {};
		settings.forEach (setting => {
			data[setting] = {'value' : game.settings.get('tidy5e-sheet', setting)};
			// console.log(data[setting]);
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
		// console.log('Listeners Active!')
		// console.log(html)
		
		let exhaustionEffectSelect = html.find('select#exhaustionEffectsEnabled');
		let exhaustionSelected = $(exhaustionEffectSelect).val();
		// console.log(exhaustionSelected)
		switch (exhaustionSelected) {
			case 'default':
				html.find('input#exhaustionEffectIcon').closest('.setting').hide();
				html.find('input#exhaustionEffectCustom').closest('.setting').hide();
			break;
			case 'tidy5e' :
				html.find('input#exhaustionEffectCustom').closest('.setting').hide();
			break;
			case 'custom' :
				html.find('input#exhaustionEffectIcon').closest('.setting').hide();
			break;
		}
		
		exhaustionEffectSelect.on('change', function(e){			
			html.find('input#exhaustionEffectIcon').closest('.setting').hide();
			html.find('input#exhaustionEffectCustom').closest('.setting').hide();

			let value = e.target.value;
			if (value == 'tidy5e'){
				html.find('input#exhaustionEffectIcon').closest('.setting').show();
			} else if (value == 'custom'){
				html.find('input#exhaustionEffectCustom').closest('.setting').show();
			}
		})

		html.find('input#exhaustionEffectIcon').on('change', function(e){
			// console.log(e.target.value)
			if(e.target.value == '' || e.target.value == null){
				e.target.value="modules/tidy5e-sheet/images/exhaustion.svg";
			}
		})

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
