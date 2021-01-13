export class Tidy5eUserSettings extends FormApplication {
	static init() {
		game.settings.registerMenu('tidy5e-sheet', 'userMenu', {
      name: '',
      label: game.i18n.localize("TIDY5E.Settings.SheetMenu.label"),
      icon: 'fas fa-scroll',
      type: Tidy5eUserSettings,
      restricted: false
    });

// open a dialogue to reload the window when saving

    game.settings.register('tidy5e-sheet', 'user-settings', {
      name: 'Settings object for world level markdown editor settings',
      type: Object,
      default: {
        chat: true,
        richText: true
      },
      config: false,
      onChange: () => {
        new Dialog({
          content: `<p>Some settings have changed, that require a refresh of the page to be applied.</p>`,
          buttons: {
            yes: {
              icon: '<i class="fas fa-check"></i>',
              label: 'Refresh page.',
              callback: () => location.reload()
            },
            no: {
              icon: '<i class="fas fa-times"></i>',
              label: 'I\'ll refresh later.'
            }
          }
        }).render(true);
      }
    })


	}

	// settings template
	static get defaultOptions() {
		return {
			...super.defaultOptions,
			template: "modules/tidy5e-sheet/templates/settings/settings.html",
			height: "auto",
			title: "Tidy5e Sheet - Settings",
			width: 600,
			classes: ["tidy5e-sheet", "settings"],
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

  // static get isRichTextActive() {
  //   const settings = game.settings.get('tidy5e-sheet', 'user-settings');
  //   return settings.richText;
  // }

  // static get isChatActive() {
  //   const settings = game.settings.get('tidy5e-sheet', 'user-settings');
  //   return settings.chat;    
  // }

	constructor(object = {}, options) {
		super(object, options);
	}

	_getHeaderButtons() {
		let btns = super._getHeaderButtons();
		btns[0].label = "Close";
		return btns;
	}

	getSettingsData() {		
		console.log(game.settings);
		return game.settings.get('tidy5e-sheet', 'user-settings');
	}

	getData() {
		let data = super.getData();
		data.settings = this.getSettingsData();
		console.log(data);
		return data;
	}

	activateListeners(html) {
		super.activateListeners(html);
	}

	_updateObject(ev, formData) {
    const data = expandObject(formData);
    game.settings.set('tidy5e-sheet', 'user-settings', data);
	}	
	
}

Hooks.on("renderTidy5eUserSettings", () => {
	if (!game.user.isGM) {
		document.querySelector('.tidy5e-sheet.settings .item.gm-only').remove();
	}
});

export const tidy5eSettings = function () {
	
	// Color Theme
	game.settings.register("tidy5e-sheet", "colorScheme", {
    name: `${game.i18n.localize("TIDY5E.Settings.SheetTheme.name")}`,
    hint: game.i18n.localize("TIDY5E.Settings.SheetTheme.hint"),
		scope: "user",
		config: true,
		type: String,
		choices: {
			"default": game.i18n.localize("TIDY5E.Settings.SheetTheme.default"),
			"dark": game.i18n.localize("TIDY5E.Settings.SheetTheme.dark")
		},
		default: 'default',
		onChange: data => {
      data === 'dark' ? document.body.classList.add("tidy5eDark"):document.body.classList.remove("tidy5eDark");
     }
	});
	
  const colorScheme = game.settings.get('tidy5e-sheet', "colorScheme");
  if (colorScheme === 'dark') {
    document.body.classList.add("tidy5eDark");
  }

	// Classic Item Controls for PC Sheets
	game.settings.register("tidy5e-sheet", "useClassicControls", {
		name: `${game.i18n.localize("TIDY5E.Settings.UseClassicControls.name")}`,
		hint: game.i18n.localize("TIDY5E.Settings.UseClassicControls.hint"),
		scope: "user",
		config: true,
		default: false,
		type: Boolean
	});
	
	// Show Roll buttons in context Menu
	game.settings.register("tidy5e-sheet", "contextRollButtons", {
		name: `${game.i18n.localize("TIDY5E.Settings.ContextRollButtons.name")}`,
		hint: game.i18n.localize("TIDY5E.Settings.ContextRollButtons.hint"),
		scope: "user",
		config: true,
		default: false,
		type: Boolean
	});
	
	game.settings.register("tidy5e-sheet", "showTraitLabels", {
		name: `${game.i18n.localize("TIDY5E.Settings.ShowTraitLabels.name")}`,
		hint: game.i18n.localize("TIDY5E.Settings.ShowTraitLabels.hint"),
		scope: "user",
		config: true,
		default: false,
		type: Boolean
	});

	// PC Sheet Settings
	
	game.settings.register("tidy5e-sheet", "hideClassList", {
		name: `${game.i18n.localize("TIDY5E.Settings.PcLabel")}: ${game.i18n.localize("TIDY5E.Settings.HideClassList.name")}`,
		hint: game.i18n.localize("TIDY5E.Settings.HideClassList.hint"),
		scope: "user",
		config: true,
		default: false,
		type: Boolean
	});

	game.settings.register("tidy5e-sheet", "noInspirationAnimation", {
		name: `${game.i18n.localize("TIDY5E.Settings.PcLabel")}: ${game.i18n.localize("TIDY5E.Settings.DisableInspirationAnimation.name")}`,
		hint: game.i18n.localize("TIDY5E.Settings.DisableInspirationAnimation.hint"),
		scope: "user",
		config: true,
		default: false,
		type: Boolean
	});

	game.settings.register("tidy5e-sheet", "hideIfZero", {
		name: `${game.i18n.localize("TIDY5E.Settings.PcLabel")}: ${game.i18n.localize("TIDY5E.Settings.HideIfZero.name")}`,
		hint: game.i18n.localize("TIDY5E.Settings.HideIfZero.hint"),
		scope: "user",
		config: true,
		default: false,
		type: Boolean
	});

	game.settings.register("tidy5e-sheet", "inspirationOnHover", {
		name: `${game.i18n.localize("TIDY5E.Settings.PcLabel")}: ${game.i18n.localize("TIDY5E.Settings.InspirationOnHover.name")}`,
		hint: game.i18n.localize("TIDY5E.Settings.InspirationOnHover.hint"),
		scope: "user",
		config: true,
		default: false,
		type: Boolean
	});

	game.settings.register("tidy5e-sheet", "exhaustionOnHover", {
		name: `${game.i18n.localize("TIDY5E.Settings.PcLabel")}: ${game.i18n.localize("TIDY5E.Settings.ExhaustionOnHover.name")}`,
		hint: game.i18n.localize("TIDY5E.Settings.ExhaustionOnHover.hint"),
		scope: "user",
		config: true,
		default: false,
		type: Boolean
	});
	
	game.settings.register("tidy5e-sheet", "disableHpBar", {
		name: `${game.i18n.localize("TIDY5E.Settings.PcLabel")}: ${game.i18n.localize("TIDY5E.Settings.DisableHpBar.name")}`,
		hint: game.i18n.localize("TIDY5E.Settings.DisableHpBar.hint"),
		scope: "user",
		config: true,
		default: false,
		type: Boolean
	});
	
	game.settings.register("tidy5e-sheet", "disableHpOverlay", {
		name: `${game.i18n.localize("TIDY5E.Settings.PcLabel")}: ${game.i18n.localize("TIDY5E.Settings.DisableHpOverlay.name")}`,
		hint: game.i18n.localize("TIDY5E.Settings.DisableHpOverlay.hint"),
		scope: "user",
		config: true,
		default: false,
		type: Boolean
	});

	game.settings.register("tidy5e-sheet", "pcToggleTraits", {
		name: `${game.i18n.localize("TIDY5E.Settings.PcLabel")}: ${game.i18n.localize("TIDY5E.Settings.PcToggleTraits.name")}`,
		hint: game.i18n.localize("TIDY5E.Settings.PcToggleTraits.hint"),
		scope: "user",
		config: true,
		default: false,
		type: Boolean
	});
	
  game.settings.register("tidy5e-sheet", "moveTraits", {
		name: `${game.i18n.localize("TIDY5E.Settings.PcLabel")}: ${game.i18n.localize("TIDY5E.Settings.MoveTraits.name")}`,
		hint: game.i18n.localize("TIDY5E.Settings.MoveTraits.hint"),
    scope: "user",
    config: true,
    default: false,
    type: Boolean
	});

	// NPC Sheet Settings

	game.settings.register("tidy5e-sheet", "disableNpcHpBar", {
		name: `${game.i18n.localize("TIDY5E.Settings.NpcLabel")}: ${game.i18n.localize("TIDY5E.Settings.DisableHpBar.name")}`,
		hint: game.i18n.localize("TIDY5E.Settings.DisableHpBar.hint"),
		scope: "user",
		config: true,
		default: false,
		type: Boolean
	});

  game.settings.register("tidy5e-sheet", "disableNpcHpOverlay", {
    name: `${game.i18n.localize("TIDY5E.Settings.NpcLabel")}: ${game.i18n.localize("TIDY5E.Settings.DisableHpOverlay.name")}`,
    hint: game.i18n.localize("TIDY5E.Settings.DisableHpOverlay.hint"),
    scope: "user",
    config: true,
    default: false,
    type: Boolean
	});
	
  game.settings.register("tidy5e-sheet", "npcAlwaysShowTraits", {
    name: `${game.i18n.localize("TIDY5E.Settings.NpcLabel")}: ${game.i18n.localize("TIDY5E.Settings.AlwaysShowTraits.name")}`,
    hint: game.i18n.localize("TIDY5E.Settings.AlwaysShowTraits.hint"),
    scope: "user",
    config: true,
    default: false,
    type: Boolean
	});
	
  game.settings.register("tidy5e-sheet", "npcAlwaysShowSkills", {
    name: `${game.i18n.localize("TIDY5E.Settings.NpcLabel")}: ${game.i18n.localize("TIDY5E.Settings.AlwaysShowSkills.name")}`,
    hint: game.i18n.localize("TIDY5E.Settings.AlwaysShowSkills.hint"),
    scope: "user",
    config: true,
    default: false,
    type: Boolean
  });

	// Vehicle Sheet Settings
	
	game.settings.register("tidy5e-sheet", "disableVehicleHpBar", {
		name: `${game.i18n.localize("TIDY5E.Settings.VehicleLabel")}: ${game.i18n.localize("TIDY5E.Settings.DisableHpBar.name")}`,
		hint: game.i18n.localize("TIDY5E.Settings.DisableHpBar.hint"),
		scope: "user",
		config: true,
		default: false,
		type: Boolean
	});

  game.settings.register("tidy5e-sheet", "disableVehicleHpOverlay", {
    name: `${game.i18n.localize("TIDY5E.Settings.VehicleLabel")}: ${game.i18n.localize("TIDY5E.Settings.DisableHpOverlay.name")}`,
    hint: game.i18n.localize("TIDY5E.Settings.DisableHpOverlay.hint"),
    scope: "user",
    config: true,
    default: false,
    type: Boolean
	});

	
	//
	// GM Options
	//
	
	// Disable Right Click
	game.settings.register("tidy5e-sheet", "disableRightClick", {
    name: `${game.i18n.localize("TIDY5E.Settings.GlobalLabel")}: ${game.i18n.localize("TIDY5E.Settings.DisableRightClick.name")}`,
    hint: game.i18n.localize("TIDY5E.Settings.DisableRightClick.hint"),
    scope: "world",
    config: true,
    default: false,
		type: Boolean
	});

  // Expanded Sheet
  game.settings.register("tidy5e-sheet", "useExpandedSheet", {
    name: `${game.i18n.localize("TIDY5E.Settings.GlobalLabel")}: ${game.i18n.localize("TIDY5E.Settings.UseExpandedSheet.name")}`,
    hint: game.i18n.localize("TIDY5E.Settings.UseExpandedSheet.hint"),
    scope: "world",
    config: true,
    default: false,
    type: Boolean
	});
	
  // Portrait Settings
	// Portrait Style
	game.settings.register("tidy5e-sheet", "portraitStyle", {
		name: `${game.i18n.localize("TIDY5E.Settings.GlobalLabel")}: ${game.i18n.localize("TIDY5E.Settings.UseRoundPortraits.name")}`,
		hint: game.i18n.localize("TIDY5E.Settings.UseRoundPortraits.hint"),
		scope: "world",
		config: true,
		default: false,
		type: String,
		choices: {
			"default": game.i18n.localize("TIDY5E.Settings.UseRoundPortraits.default"),
			"pc": game.i18n.localize("TIDY5E.Settings.UseRoundPortraits.pc"),
			"npc": game.i18n.localize("TIDY5E.Settings.UseRoundPortraits.npc"),
			"all": game.i18n.localize("TIDY5E.Settings.UseRoundPortraits.all")
		},
  	default: "all"
	});
	
	game.settings.register("tidy5e-sheet", "hpOverlayBorder", {
		name: `${game.i18n.localize("TIDY5E.Settings.GlobalLabel")} ${game.i18n.localize("TIDY5E.Settings.PcLabel")}: ${game.i18n.localize("TIDY5E.Settings.HpOverlayBorder.name")}`,
		hint: game.i18n.localize("TIDY5E.Settings.HpOverlayBorder.hint"),
		scope: "world",
		config: true,
		default: 0,
		type: Number
	});

  game.settings.register("tidy5e-sheet", "npcHpOverlayBorder", {
    name: `${game.i18n.localize("TIDY5E.Settings.GlobalLabel")} ${game.i18n.localize("TIDY5E.Settings.NpcLabel")}: ${game.i18n.localize("TIDY5E.Settings.HpOverlayBorder.name")}`,
    hint: game.i18n.localize("TIDY5E.Settings.HpOverlayBorder.hint"),
    scope: "world",
    config: true,
    default: 0,
    type: Number
	});

  game.settings.register("tidy5e-sheet", "vehicleHpOverlayBorder", {
    name: `${game.i18n.localize("TIDY5E.Settings.GlobalLabel")} ${game.i18n.localize("TIDY5E.Settings.VehicleLabel")}: ${game.i18n.localize("TIDY5E.Settings.HpOverlayBorder.name")}`,
    hint: game.i18n.localize("TIDY5E.Settings.HpOverlayBorder.hint"),
    scope: "world",
    config: true,
    default: 0,
    type: Number
	});

	// Sheet edit permissions
  game.settings.register("tidy5e-sheet", "gmCanAlwaysEdit", {
    name: `${game.i18n.localize("TIDY5E.Settings.GlobalLabel")}: ${game.i18n.localize("TIDY5E.Settings.GmEditPermission.name")}`,
    hint: game.i18n.localize("TIDY5E.Settings.GmEditPermission.hint"),
    scope: "world",
    config: true,
    default: false,
    type: Boolean
	});
	
	game.settings.register("tidy5e-sheet", "gmOnlyEffectsEdit", {
    name: `${game.i18n.localize("TIDY5E.Settings.GlobalLabel")}: ${game.i18n.localize("TIDY5E.Settings.GmEditEffects.name")}`,
    hint: game.i18n.localize("TIDY5E.Settings.GmEditEffects.hint"),
    scope: "world",
    config: true,
    default: false,
    type: Boolean
	});
	
	// Item quantity
	game.settings.register("tidy5e-sheet", "alwaysShowQuantity", {
    name: `${game.i18n.localize("TIDY5E.Settings.GlobalLabel")}: ${game.i18n.localize("TIDY5E.Settings.AlwaysShowQty.name")}`,
    hint: game.i18n.localize("TIDY5E.Settings.AlwaysShowQty.hint"),
    scope: "world",
    config: true,
    default: false,
    type: Boolean
  });

	// Tracker Settings
	/* currently broken
	game.settings.register("tidy5e-sheet", "exhaustionEffects", {
		name: `${game.i18n.localize("TIDY5E.Settings.GlobalLabel")}: ${game.i18n.localize("TIDY5E.Settings.ExhaustionEffects.name")}`,
		hint: game.i18n.localize("TIDY5E.Settings.ExhaustionEffects.hint"),
		scope: "world",
		config: true,
		default: false,
		type: Boolean
	});
	*/
	
	game.settings.register("tidy5e-sheet", "disableExhaustion", {
		name: `${game.i18n.localize("TIDY5E.Settings.GlobalLabel")}: ${game.i18n.localize("TIDY5E.Settings.DisableExhaustion.name")}`,
		hint: game.i18n.localize("TIDY5E.Settings.DisableExhaustion.hint"),
		scope: "world",
		config: true,
		default: false,
		type: Boolean
	});
	
	game.settings.register("tidy5e-sheet", "disableInspiration", {
		name: `${game.i18n.localize("TIDY5E.Settings.GlobalLabel")}: ${game.i18n.localize("TIDY5E.Settings.DisableInspiration.name")}`,
		hint: game.i18n.localize("TIDY5E.Settings.DisableInspiration.hint"),
		scope: "world",
		config: true,
		default: false,
		type: Boolean
	});
	
	// NPC Resting
  game.settings.register("tidy5e-sheet", "showNpcResting", {
    name: `${game.i18n.localize("TIDY5E.Settings.GlobalLabel")}: ${game.i18n.localize("TIDY5E.Settings.ShowNpcRest.name")}`,
    hint: game.i18n.localize("TIDY5E.Settings.ShowNpcRest.hint"),
    scope: "world",
    config: true,
    default: false,
    type: Boolean
	});

	// Link Marker
  game.settings.register("tidy5e-sheet", "npcLinkMarker", {
    name: `${game.i18n.localize("TIDY5E.Settings.GlobalLabel")}: ${game.i18n.localize("TIDY5E.Settings.LinkMarker.name")}`,
    hint: game.i18n.localize("TIDY5E.Settings.LinkMarker.hint"),
    scope: "world",
    config: true,
		type: String,
		choices: {
			"default": game.i18n.localize("TIDY5E.Settings.LinkMarker.default"),
			"unlinked": game.i18n.localize("TIDY5E.Settings.LinkMarker.unlinked"),
			"both": game.i18n.localize("TIDY5E.Settings.LinkMarker.both")
		},
		default: 'default'
	});
}