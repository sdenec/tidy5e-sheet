export function settingsList(){
  // General Settings
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
	
		// Classic Item Controls
		game.settings.register("tidy5e-sheet", "classicControlsEnabled", {
			name: `${game.i18n.localize("TIDY5E.Settings.ClassicControls.name")}`,
			hint: game.i18n.localize("TIDY5E.Settings.ClassicControls.hint"),
			scope: "user",
			config: true,
			default: false,
			type: Boolean
		});
		
		// Item Info Cards
		game.settings.register("tidy5e-sheet", "itemCardsForAllItems", {
			name: `${game.i18n.localize("TIDY5E.Settings.ItemCardsForAllItems.name")}`,
			hint: game.i18n.localize("TIDY5E.Settings.ItemCardsForAllItems.hint"),
			scope: "user",
			config: true,
			default: true,
			type: Boolean
		});
		
		game.settings.register("tidy5e-sheet", "itemCardsForNpcs", {
			name: `${game.i18n.localize("TIDY5E.Settings.ItemCardsForNpcs.name")}`,
			hint: game.i18n.localize("TIDY5E.Settings.ItemCardsForNpcs.hint"),
			scope: "world",
			config: true,
			default: true,
			type: Boolean
		});
	
		game.settings.register("tidy5e-sheet", "itemCardsAreFloating", {
			name: `${game.i18n.localize("TIDY5E.Settings.ItemCardsAreFloating.name")}`,
			hint: game.i18n.localize("TIDY5E.Settings.ItemCardsAreFloating.hint"),
			scope: "user",
			config: true,
			default: false,
			type: Boolean
		});
	
		game.settings.register("tidy5e-sheet", "itemCardsDelay", {
			name: `${game.i18n.localize("TIDY5E.Settings.ItemCardsDelay.name")}`,
			hint: game.i18n.localize("TIDY5E.Settings.ItemCardsDelay.hint"),
			scope: "user",
			config: true,
			default: 300,
			type: Number
		});
	
		game.settings.register("tidy5e-sheet", "itemCardsFixKey", {
			name: `${game.i18n.localize("TIDY5E.Settings.ItemCardsFixKey.name")}`,
			hint: game.i18n.localize("TIDY5E.Settings.ItemCardsFixKey.hint"),
			scope: "world",
			config: false,
			default: "x",
			type: String
		});
	
		// Show Roll buttons in context Menu
		game.settings.register("tidy5e-sheet", "contextRollButtons", {
			name: `${game.i18n.localize("TIDY5E.Settings.RollButtonsToCard.name")}`,
			hint: game.i18n.localize("TIDY5E.Settings.RollButtonsToCard.hint"),
			scope: "world",
			config: false,
			default: false,
			type: Boolean
		});
		
		//Show trait labels
		game.settings.register("tidy5e-sheet", "traitLabelsEnabled", {
			name: `${game.i18n.localize("TIDY5E.Settings.TraitLabels.name")}`,
			hint: game.i18n.localize("TIDY5E.Settings.TraitLabels.hint"),
			scope: "world",
			config: false,
			default: true,
			type: Boolean
		});

		// Settings Menu
	
		// PC Sheet Settings
		game.settings.register("tidy5e-sheet", "journalTabDisabled", {
			name: `${game.i18n.localize("TIDY5E.Settings.JournalTab.name")}`,
			hint: game.i18n.localize("TIDY5E.Settings.JournalTab.hint"),
			scope: "user",
			config: false,
			default: false,
			type: Boolean
		});
	
		game.settings.register("tidy5e-sheet", "classListDisabled", {
			name: `${game.i18n.localize("TIDY5E.Settings.ClassList.name")}`,
			hint: game.i18n.localize("TIDY5E.Settings.ClassList.hint"),
			scope: "user",
			config: false,
			default: false,
			type: Boolean
		});
	
		game.settings.register("tidy5e-sheet", "inspirationAnimationDisabled", {
			name: `${game.i18n.localize("TIDY5E.Settings.InspirationAnimation.name")}`,
			hint: game.i18n.localize("TIDY5E.Settings.InspirationAnimation.hint"),
			scope: "user",
			config: false,
			default: false,
			type: Boolean
		});
	
		game.settings.register("tidy5e-sheet", "hideIfZero", {
			name: `${game.i18n.localize("TIDY5E.Settings.HideIfZero.name")}`,
			hint: game.i18n.localize("TIDY5E.Settings.HideIfZero.hint"),
			scope: "user",
			config: false,
			default: false,
			type: Boolean
		});
	
		game.settings.register("tidy5e-sheet", "inspirationOnHover", {
			name: `${game.i18n.localize("TIDY5E.Settings.InspirationOnHover.name")}`,
			hint: game.i18n.localize("TIDY5E.Settings.InspirationOnHover.hint"),
			scope: "user",
			config: false,
			default: false,
			type: Boolean
		});
	
		game.settings.register("tidy5e-sheet", "exhaustionOnHover", {
			name: `${game.i18n.localize("TIDY5E.Settings.ExhaustionOnHover.name")}`,
			hint: game.i18n.localize("TIDY5E.Settings.ExhaustionOnHover.hint"),
			scope: "user",
			config: false,
			default: false,
			type: Boolean
		});
		
		game.settings.register("tidy5e-sheet", "hpBarDisabled", {
			name: `${game.i18n.localize("TIDY5E.Settings.HpBar.name")}`,
			hint: game.i18n.localize("TIDY5E.Settings.HpBar.hint"),
			scope: "user",
			config: false,
			default: false,
			type: Boolean
		});
		
		game.settings.register("tidy5e-sheet", "hpOverlayDisabled", {
			name: `${game.i18n.localize("TIDY5E.Settings.HpOverlay.name")}`,
			hint: game.i18n.localize("TIDY5E.Settings.HpOverlay.hint"),
			scope: "user",
			config: false,
			default: false,
			type: Boolean
		});
	
		game.settings.register("tidy5e-sheet", "traitsTogglePc", {
			name: `${game.i18n.localize("TIDY5E.Settings.TraitsTogglePc.name")}`,
			hint: game.i18n.localize("TIDY5E.Settings.TraitsTogglePc.hint"),
			scope: "user",
			config: false,
			default: false,
			type: Boolean
		});
		
		game.settings.register("tidy5e-sheet", "traitsMovedBelowResource", {
			name: `${game.i18n.localize("TIDY5E.Settings.TraitsMovedBelowResource.name")}`,
			hint: game.i18n.localize("TIDY5E.Settings.TraitsMovedBelowResource.hint"),
			scope: "user",
			config: false,
			default: false,
			type: Boolean
		});

		game.settings.register("tidy5e-sheet", "ammoEquippedOnly", {
			name: `${game.i18n.localize("TIDY5E.Settings.AmmoEquippedOnly.name")}`,
			hint: game.i18n.localize("TIDY5E.Settings.AmmoEquippedOnly.hint"),
			scope: "user",
			config: false,
			default: false,
			type: Boolean
		});
	
	
		// NPC Sheet Settings
		
		game.settings.register("tidy5e-sheet", "traitsMovedBelowResourceNpc", {
			name: `${game.i18n.localize("TIDY5E.Settings.TraitsMovedBelowResource.name")}`,
			hint: game.i18n.localize("TIDY5E.Settings.TraitsMovedBelowResource.hint"),
			scope: "user",
			config: false,
			default: false,
			type: Boolean
		});
	
		game.settings.register("tidy5e-sheet", "hpBarDisabledNpc", {
			name: `${game.i18n.localize("TIDY5E.Settings.HpBar.name")}`,
			hint: game.i18n.localize("TIDY5E.Settings.HpBar.hint"),
			scope: "user",
			config: false,
			default: false,
			type: Boolean
		});
	
		game.settings.register("tidy5e-sheet", "hpOverlayDisabledNpc", {
			name: `${game.i18n.localize("TIDY5E.Settings.HpOverlay.name")}`,
			hint: game.i18n.localize("TIDY5E.Settings.HpOverlay.hint"),
			scope: "user",
			config: false,
			default: false,
			type: Boolean
		});
		
		game.settings.register("tidy5e-sheet", "traitsAlwaysShownNpc", {
			name: `${game.i18n.localize("TIDY5E.Settings.TraitsAlwaysShown.name")}`,
			hint: game.i18n.localize("TIDY5E.Settings.TraitsAlwaysShown.hint"),
			scope: "user",
			config: false,
			default: false,
			type: Boolean
		});
		
		game.settings.register("tidy5e-sheet", "skillsAlwaysShownNpc", {
			name: `${game.i18n.localize("TIDY5E.Settings.SkillsAlwaysShown.name")}`,
			hint: game.i18n.localize("TIDY5E.Settings.SkillsAlwaysShown.hint"),
			scope: "user",
			config: false,
			default: false,
			type: Boolean
		});
	
		// Vehicle Sheet Settings
		
		game.settings.register("tidy5e-sheet", "hpBarDisabledVehicle", {
			name: `${game.i18n.localize("TIDY5E.Settings.HpBar.name")}`,
			hint: game.i18n.localize("TIDY5E.Settings.HpBar.hint"),
			scope: "user",
			config: false,
			default: false,
			type: Boolean
		});
	
		game.settings.register("tidy5e-sheet", "hpOverlayDisabledVehicle", {
			name: `${game.i18n.localize("TIDY5E.Settings.HpOverlay.name")}`,
			hint: game.i18n.localize("TIDY5E.Settings.HpOverlay.hint"),
			scope: "user",
			config: false,
			default: false,
			type: Boolean
		});
	
		
		//
		// GM Options
		//
		// Show Player Name
		game.settings.register("tidy5e-sheet", "playerNameEnabled", {
			name: `${game.i18n.localize("TIDY5E.Settings.PlayerName.name")}`,
			hint: game.i18n.localize("TIDY5E.Settings.PlayerName.hint"),
			scope: "world",
			config: false,
			default: false,
			type: Boolean
		});
		
		// Disable Right Click
		game.settings.register("tidy5e-sheet", "rightClickDisabled", {
			name: `${game.i18n.localize("TIDY5E.Settings.RightClick.name")}`,
			hint: game.i18n.localize("TIDY5E.Settings.RightClick.hint"),
			scope: "world",
			config: false,
			default: false,
			type: Boolean
		});
	
		// Expanded Sheet
		game.settings.register("tidy5e-sheet", "expandedSheetEnabled", {
			name: `${game.i18n.localize("TIDY5E.Settings.ExpandedSheet.name")}`,
			hint: game.i18n.localize("TIDY5E.Settings.ExpandedSheet.hint"),
			scope: "world",
			config: false,
			default: false,
			type: Boolean
		});
		
		// Portrait Settings
		// Portrait Style
		game.settings.register("tidy5e-sheet", "portraitStyle", {
			name: `${game.i18n.localize("TIDY5E.Settings.PortraitStyle.name")}`,
			hint: game.i18n.localize("TIDY5E.Settings.PortraitStyle.hint"),
			scope: "world",
			config: false,
			type: String,
			choices: {
				"default": game.i18n.localize("TIDY5E.Settings.PortraitStyle.default"),
				"pc": game.i18n.localize("TIDY5E.Settings.PortraitStyle.pc"),
				"npc": game.i18n.localize("TIDY5E.Settings.PortraitStyle.npc"),
				"all": game.i18n.localize("TIDY5E.Settings.PortraitStyle.all")
			},
			default: "all",
			onChange : data => {
				if (data == "npc" || data == "all") {
					$('.tidy5e-sheet.tidy5e-npc .profile').addClass('roundPortrait');
					$('.tidy5e-sheet.tidy5e-vehicle .profile').addClass('roundPortrait');
				}
				if (data == "pc" || data == "all") {
					$('.tidy5e-sheet .profile').addClass('roundPortrait');
					$('.tidy5e-sheet.tidy5e-npc .profile').removeClass('roundPortrait');
					$('.tidy5e-sheet.tidy5e-vehicle .profile').removeClass('roundPortrait');
				}
				if(data == "default") {
					$('.tidy5e-sheet .profile').removeClass('roundPortrait');
					$('.tidy5e-sheet.tidy5e-npc .profile').removeClass('roundPortrait');
					$('.tidy5e-sheet.tidy5e-vehicle .profile').removeClass('roundPortrait');
				}
			}
		});
		
		game.settings.register("tidy5e-sheet", "hpOverlayBorder", {
			name: `${game.i18n.localize("TIDY5E.Settings.HpOverlayBorder.name")}`,
			hint: game.i18n.localize("TIDY5E.Settings.HpOverlayBorder.hint"),
			scope: "world",
			config: false,
			default: 0,
			type: Number,
			onChange: data => {
				$('.system-dnd5e').get(0).style.setProperty('--pc-border', game.settings.get("tidy5e-sheet", "hpOverlayBorder")+'px');
			}
		});
	
		game.settings.register("tidy5e-sheet", "hpOverlayBorderNpc", {
			name: `${game.i18n.localize("TIDY5E.Settings.HpOverlayBorder.name")}`,
			hint: game.i18n.localize("TIDY5E.Settings.HpOverlayBorder.hint"),
			scope: "world",
			config: false,
			default: 0,
			type: Number,
			onChange: data => {
				$('.system-dnd5e').get(0).style.setProperty('--npc-border', game.settings.get("tidy5e-sheet", "hpOverlayBorderNpc")+'px');
			}
		});
	
		game.settings.register("tidy5e-sheet", "hpOverlayBorderVehicle", {
			name: `${game.i18n.localize("TIDY5E.Settings.HpOverlayBorder.name")}`,
			hint: game.i18n.localize("TIDY5E.Settings.HpOverlayBorder.hint"),
			scope: "world",
			config: false,
			default: 0,
			type: Number,
			onChange: data => {
				$('.system-dnd5e').get(0).style.setProperty('--vehicle-border', game.settings.get("tidy5e-sheet", "hpOverlayBorderVehicle")+'px');
			}
		});
	
		// Total Edit Lock
		game.settings.register("tidy5e-sheet", "editTotalLockEnabled", {
			name: `${game.i18n.localize("TIDY5E.Settings.EditTotalLock.name")}`,
			hint: game.i18n.localize("TIDY5E.Settings.EditTotalLock.hint"),
			scope: "world",
			config: false,
			default: false,
			type: Boolean
		});
	
		game.settings.register("tidy5e-sheet", "editGmAlwaysEnabled", {
			name: `${game.i18n.localize("TIDY5E.Settings.EditGmAlways.name")}`,
			hint: game.i18n.localize("TIDY5E.Settings.EditGmAlways.hint"),
			scope: "world",
			config: false,
			default: false,
			type: Boolean
		});
		
		game.settings.register("tidy5e-sheet", "editEffectsGmOnlyEnabled", {
			name: `${game.i18n.localize("TIDY5E.Settings.EditEffectsGmOnly.name")}`,
			hint: game.i18n.localize("TIDY5E.Settings.EditEffectsGmOnly.hint"),
			scope: "world",
			config: false,
			default: false,
			type: Boolean
		});
		
		// Hidden Death Saves
		game.settings.register("tidy5e-sheet", "hiddenDeathSavesEnabled", {
			name: `${game.i18n.localize("TIDY5E.Settings.HiddenDeathSaves.name")}`,
			hint: game.i18n.localize("TIDY5E.Settings.HiddenDeathSaves.hint"),
			scope: "world",
			config: false,
			default: false,
			type: Boolean
		});
		
		// Item quantity
		game.settings.register("tidy5e-sheet", "quantityAlwaysShownEnabled", {
			name: `${game.i18n.localize("TIDY5E.Settings.QuantityAlwaysShown.name")}`,
			hint: game.i18n.localize("TIDY5E.Settings.QuantityAlwaysShown.hint"),
			scope: "world",
			config: false,
			default: false,
			type: Boolean
		});
	
		// Tracker Settings
			game.settings.register("tidy5e-sheet", "exhaustionEffectsEnabled", {
			name: `${game.i18n.localize("TIDY5E.Settings.ExhaustionEffects.name")}`,
			hint: game.i18n.localize("TIDY5E.Settings.ExhaustionEffects.hint"),
			scope: "world",
			config: false,
			choices : {
				'default' : game.i18n.localize("TIDY5E.Settings.ExhaustionEffects.default"),
				'tidy5e' : game.i18n.localize("TIDY5E.Settings.ExhaustionEffects.default"),
				'custom' : game.i18n.localize("TIDY5E.Settings.ExhaustionEffects.default")
			},
			type: String,
			default: 'default'
		});
	
		game.settings.register("tidy5e-sheet", "exhaustionEffectIcon", {
			name: `${game.i18n.localize("TIDY5E.Settings.CustomExhaustionIcon.name")}`,
			hint: game.i18n.localize("TIDY5E.Settings.CustomExhaustionIcon.hint"),
			scope: "world",
			config: false,
			type: String,
			default: "modules/tidy5e-sheet/images/exhaustion.svg"
		});
		
		game.settings.register("tidy5e-sheet", "exhaustionEffectCustom", {
			name: `${game.i18n.localize("TIDY5E.Settings.CustomExhaustionEffect.name")}`,
			hint: game.i18n.localize("TIDY5E.Settings.CustomExhaustionEffect.hint"),
			scope: "world",
			config: false,
			default: 'Exhaustion',
			type: String
		});
		
		game.settings.register("tidy5e-sheet", "exhaustionEffectCustomTiers", {
			name: `${game.i18n.localize("TIDY5E.Settings.CustomExhaustionEffect.tiers")}`,
			hint: game.i18n.localize("TIDY5E.Settings.CustomExhaustionEffect.hint"),
			scope: "world",
			config: false,
			default: 5,
			type: Number
		});
			
		game.settings.register("tidy5e-sheet", "exhaustionDisabled", {
			name: `${game.i18n.localize("TIDY5E.Settings.ExhaustionDisabled.name")}`,
			hint: game.i18n.localize("TIDY5E.Settings.ExhaustionDisabled.hint"),
			scope: "world",
			config: false,
			default: false,
			type: Boolean
		});
		
		game.settings.register("tidy5e-sheet", "inspirationDisabled", {
			name: `${game.i18n.localize("TIDY5E.Settings.InspirationDisabled.name")}`,
			hint: game.i18n.localize("TIDY5E.Settings.InspirationDisabled.hint"),
			scope: "world",
			config: false,
			default: false,
			type: Boolean
		});
		
		// NPC Resting
		game.settings.register("tidy5e-sheet", "restingForNpcsEnabled", {
			name: `${game.i18n.localize("TIDY5E.Settings.RestingForNpcs.name")}`,
			hint: game.i18n.localize("TIDY5E.Settings.RestingForNpcs.hint"),
			scope: "world",
			config: false,
			default: false,
			type: Boolean
		});

		game.settings.register("tidy5e-sheet", "restingForNpcsChatDisabled", {
			name: `${game.i18n.localize("TIDY5E.Settings.RestingForNpcsChat.name")}`,
			hint: game.i18n.localize("TIDY5E.Settings.RestingForNpcsChat.hint"),
			scope: "world",
			config: false,
			default: false,
			type: Boolean
		});
	
		// Link Marker
		game.settings.register("tidy5e-sheet", "linkMarkerNpc", {
			name: `${game.i18n.localize("TIDY5E.Settings.LinkMarker.name")}`,
			hint: game.i18n.localize("TIDY5E.Settings.LinkMarker.hint"),
			scope: "world",
			config: false,
			type: String,
			choices: {
				"default": game.i18n.localize("TIDY5E.Settings.LinkMarker.default"),
				"unlinked": game.i18n.localize("TIDY5E.Settings.LinkMarker.unlinked"),
				"both": game.i18n.localize("TIDY5E.Settings.LinkMarker.both")
			},
			default: 'default'
		});
		
		// Show if item has active effects
		game.settings.register("tidy5e-sheet", "activeEffectsMarker", {
			name: `${game.i18n.localize("TIDY5E.Settings.ActiveEffectsMarker.name")}`,
			hint: game.i18n.localize("TIDY5E.Settings.ActiveEffectsMarker.hint"),
			scope: "world",
			config: false,
			default: false,
			type: Boolean
		});

		// Set default Tab for character actions list
		
		game.settings.register("tidy5e-sheet", "defaultActionsTab", {
			name: `${game.i18n.localize("TIDY5E.Settings.defaultActionsTab.name")}`,
			hint: game.i18n.localize("TIDY5E.Settings.defaultActionsTab.hint"),
			scope: "world",
			config: false,
			type: String,
			choices: {
				"default": game.i18n.localize("TIDY5E.Settings.defaultActionsTab.default"),
				"attributes": game.i18n.localize("TIDY5E.Settings.defaultActionsTab.attributes"),
			},
			default: 'default'
		});

		// Default width for player sheet
		
		game.settings.register("tidy5e-sheet", "playerSheetWidth", {
			name: `${game.i18n.localize("TIDY5E.Settings.playerSheetWidth")}`,
			scope: "user",
			config: false,
			type: Number,
			default: 740
		});

		// Default width for NPC sheet
		
		game.settings.register("tidy5e-sheet", "npsSheetWidth", {
			name: `${game.i18n.localize("TIDY5E.Settings.npsSheetWidth")}`,
			scope: "user",
			config: false,
			type: Number,
			default: 740
		});

		// Default width for vehicle sheet
		
		game.settings.register("tidy5e-sheet", "vehicleSheetWidth", {
			name: `${game.i18n.localize("TIDY5E.Settings.vehicleSheetWidth")}`,
			scope: "user",
			config: false,
			type: Number,
			default: 740
		});
}
