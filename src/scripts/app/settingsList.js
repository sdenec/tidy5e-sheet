import { RGBAToHexAFromColor } from "./color-picker.js";

export function settingsList(){
  // General Settings
  		game.settings.registerMenu("tidy5e-sheet", "resetAllSettings", {
			name: `TIDY5E.Settings.Reset.name`,
			hint: `TIDY5E.Settings.Reset.hint`,
			icon: "fas fa-coins",
			type: ResetSettingsDialog,
			restricted: true,
		});
		// Color Theme
		game.settings.register("tidy5e-sheet", "colorScheme", {
			name: `${game.i18n.localize("TIDY5E.Settings.SheetTheme.name")}`,
			hint: game.i18n.localize("TIDY5E.Settings.SheetTheme.hint"),
			scope: "client",
			config: true,
			type: String,
			choices: {
				"default": game.i18n.localize("TIDY5E.Settings.SheetTheme.default"),
				"dark": game.i18n.localize("TIDY5E.Settings.SheetTheme.dark")
			},
			default: 'default',
			onChange: data => {
				data === 'dark' ? document.querySelector('html').classList.add("tidy5eDark"):document.querySelector('html').classList.remove("tidy5eDark");
			}
		});

		const colorScheme = game.settings.get('tidy5e-sheet', "colorScheme");
		if (colorScheme === 'dark') {
			document.querySelector('html').classList.add("tidy5eDark");
		}

		// Classic Item Controls
		game.settings.register("tidy5e-sheet", "classicControlsEnabled", {
			name: `${game.i18n.localize("TIDY5E.Settings.ClassicControls.name")}`,
			hint: game.i18n.localize("TIDY5E.Settings.ClassicControls.hint"),
			scope: "client",
			config: true,
			default: false,
			type: Boolean
		});

		// Item Info Cards
		game.settings.register("tidy5e-sheet", "itemCardsForAllItems", {
			name: `${game.i18n.localize("TIDY5E.Settings.ItemCardsForAllItems.name")}`,
			hint: game.i18n.localize("TIDY5E.Settings.ItemCardsForAllItems.hint"),
			scope: "client",
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
			scope: "client",
			config: true,
			default: false,
			type: Boolean
		});

		game.settings.register("tidy5e-sheet", "itemCardsDelay", {
			name: `${game.i18n.localize("TIDY5E.Settings.ItemCardsDelay.name")}`,
			hint: game.i18n.localize("TIDY5E.Settings.ItemCardsDelay.hint"),
			scope: "client",
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
			scope: "client",
			config: false,
			default: false,
			type: Boolean
		});

		game.settings.register("tidy5e-sheet", "classListDisabled", {
			name: `${game.i18n.localize("TIDY5E.Settings.ClassList.name")}`,
			hint: game.i18n.localize("TIDY5E.Settings.ClassList.hint"),
			scope: "client",
			config: false,
			default: false,
			type: Boolean
		});

		game.settings.register("tidy5e-sheet", "inspirationAnimationDisabled", {
			name: `${game.i18n.localize("TIDY5E.Settings.InspirationAnimation.name")}`,
			hint: game.i18n.localize("TIDY5E.Settings.InspirationAnimation.hint"),
			scope: "client",
			config: false,
			default: false,
			type: Boolean
		});

		game.settings.register("tidy5e-sheet", "hideIfZero", {
			name: `${game.i18n.localize("TIDY5E.Settings.HideIfZero.name")}`,
			hint: game.i18n.localize("TIDY5E.Settings.HideIfZero.hint"),
			scope: "client",
			config: false,
			default: false,
			type: Boolean
		});

		game.settings.register("tidy5e-sheet", "inspirationOnHover", {
			name: `${game.i18n.localize("TIDY5E.Settings.InspirationOnHover.name")}`,
			hint: game.i18n.localize("TIDY5E.Settings.InspirationOnHover.hint"),
			scope: "client",
			config: false,
			default: false,
			type: Boolean
		});

		game.settings.register("tidy5e-sheet", "exhaustionOnHover", {
			name: `${game.i18n.localize("TIDY5E.Settings.ExhaustionOnHover.name")}`,
			hint: game.i18n.localize("TIDY5E.Settings.ExhaustionOnHover.hint"),
			scope: "client",
			config: false,
			default: false,
			type: Boolean
		});

		game.settings.register("tidy5e-sheet", "hpBarDisabled", {
			name: `${game.i18n.localize("TIDY5E.Settings.HpBar.name")}`,
			hint: game.i18n.localize("TIDY5E.Settings.HpBar.hint"),
			scope: "client",
			config: false,
			default: false,
			type: Boolean
		});

		game.settings.register("tidy5e-sheet", "hpOverlayDisabled", {
			name: `${game.i18n.localize("TIDY5E.Settings.HpOverlay.name")}`,
			hint: game.i18n.localize("TIDY5E.Settings.HpOverlay.hint"),
			scope: "client",
			config: false,
			default: false,
			type: Boolean
		});

		game.settings.register("tidy5e-sheet", "traitsTogglePc", {
			name: `${game.i18n.localize("TIDY5E.Settings.TraitsTogglePc.name")}`,
			hint: game.i18n.localize("TIDY5E.Settings.TraitsTogglePc.hint"),
			scope: "client",
			config: false,
			default: false,
			type: Boolean
		});

		game.settings.register("tidy5e-sheet", "traitsMovedBelowResource", {
			name: `${game.i18n.localize("TIDY5E.Settings.TraitsMovedBelowResource.name")}`,
			hint: game.i18n.localize("TIDY5E.Settings.TraitsMovedBelowResource.hint"),
			scope: "client",
			config: false,
			default: false,
			type: Boolean
		});

		game.settings.register("tidy5e-sheet", "ammoEquippedOnly", {
			name: `${game.i18n.localize("TIDY5E.Settings.AmmoEquippedOnly.name")}`,
			hint: game.i18n.localize("TIDY5E.Settings.AmmoEquippedOnly.hint"),
			scope: "client",
			config: false,
			default: false,
			type: Boolean
		});


		// NPC Sheet Settings

		game.settings.register("tidy5e-sheet", "traitsMovedBelowResourceNpc", {
			name: `${game.i18n.localize("TIDY5E.Settings.TraitsMovedBelowResource.name")}`,
			hint: game.i18n.localize("TIDY5E.Settings.TraitsMovedBelowResource.hint"),
			scope: "client",
			config: false,
			default: false,
			type: Boolean
		});

		game.settings.register("tidy5e-sheet", "hpBarDisabledNpc", {
			name: `${game.i18n.localize("TIDY5E.Settings.HpBar.name")}`,
			hint: game.i18n.localize("TIDY5E.Settings.HpBar.hint"),
			scope: "client",
			config: false,
			default: false,
			type: Boolean
		});

		game.settings.register("tidy5e-sheet", "hpOverlayDisabledNpc", {
			name: `${game.i18n.localize("TIDY5E.Settings.HpOverlay.name")}`,
			hint: game.i18n.localize("TIDY5E.Settings.HpOverlay.hint"),
			scope: "client",
			config: false,
			default: false,
			type: Boolean
		});

		game.settings.register("tidy5e-sheet", "traitsAlwaysShownNpc", {
			name: `${game.i18n.localize("TIDY5E.Settings.TraitsAlwaysShown.name")}`,
			hint: game.i18n.localize("TIDY5E.Settings.TraitsAlwaysShown.hint"),
			scope: "client",
			config: false,
			default: false,
			type: Boolean
		});

		game.settings.register("tidy5e-sheet", "skillsAlwaysShownNpc", {
			name: `${game.i18n.localize("TIDY5E.Settings.SkillsAlwaysShown.name")}`,
			hint: game.i18n.localize("TIDY5E.Settings.SkillsAlwaysShown.hint"),
			scope: "client",
			config: false,
			default: false,
			type: Boolean
		});

		game.settings.register("tidy5e-sheet", "hideSpellbookTabNpc", {
			name: `${game.i18n.localize("TIDY5E.Settings.SkillsAlwaysShown.name")}`,
			hint: game.i18n.localize("TIDY5E.Settings.SkillsAlwaysShown.hint"),
			scope: "client",
			config: false,
			default: true,
			type: Boolean
		});
		
		// Vehicle Sheet Settings

		game.settings.register("tidy5e-sheet", "hpBarDisabledVehicle", {
			name: `${game.i18n.localize("TIDY5E.Settings.HpBar.name")}`,
			hint: game.i18n.localize("TIDY5E.Settings.HpBar.hint"),
			scope: "client",
			config: false,
			default: false,
			type: Boolean
		});

		game.settings.register("tidy5e-sheet", "hpOverlayDisabledVehicle", {
			name: `${game.i18n.localize("TIDY5E.Settings.HpOverlay.name")}`,
			hint: game.i18n.localize("TIDY5E.Settings.HpOverlay.hint"),
			scope: "client",
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

		// Hide marker spell slot
		game.settings.register("tidy5e-sheet", "hideSpellSlotMarker", {
			name: `${game.i18n.localize("TIDY5E.Settings.HideSpellSlotMarker.name")}`,
			hint: game.i18n.localize("TIDY5E.Settings.HideSpellSlotMarker.hint"),
			scope: "world",
			config: false,
			default: false,
			type: Boolean
		});

		// Enable Spell Level Buttons
		game.settings.register("tidy5e-sheet", "enableSpellLevelButtons", {
			name: `${game.i18n.localize("TIDY5E.Settings.EnableSpellLevelButtons.name")}`,
			hint: `${game.i18n.localize("TIDY5E.Settings.EnableSpellLevelButtons.hint")}`,
			scope: "world",
			config: false,
			default: true,
			type: Boolean
		});

		// Hide Standard Encumbrance Bar
		game.settings.register("tidy5e-sheet", "hideStandardEncumbranceBar", {
			name: `${game.i18n.localize("TIDY5E.Settings.HideStandardEncumbranceBar.name")}`,
			hint: `${game.i18n.localize("TIDY5E.Settings.HideStandardEncumbranceBar.hint")}`,
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
				'dfredce' : game.i18n.localize("TIDY5E.Settings.ExhaustionEffects.dfredce"),
				'cub' : game.i18n.localize("TIDY5E.Settings.ExhaustionEffects.cub")
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
				"inventory": game.i18n.localize("TIDY5E.Settings.defaultActionsTab.inventory"),
				"spellbook": game.i18n.localize("TIDY5E.Settings.defaultActionsTab.spellbook"),
				"features": game.i18n.localize("TIDY5E.Settings.defaultActionsTab.features"),
				"effects": game.i18n.localize("TIDY5E.Settings.defaultActionsTab.effects"),
				"biography": game.i18n.localize("TIDY5E.Settings.defaultActionsTab.biography"),
				"journal": game.i18n.localize("TIDY5E.Settings.defaultActionsTab.journal"),
				"actions": game.i18n.localize("TIDY5E.Settings.defaultActionsTab.actions"),
			},
			default: 'default'
		});

		// Default width for player sheet

		game.settings.register("tidy5e-sheet", "playerSheetWidth", {
			name: `${game.i18n.localize("TIDY5E.Settings.playerSheetWidth")}`,
			scope: "client",
			config: false,
			type: Number,
			default: 740
		});

		// Default width for NPC sheet

		game.settings.register("tidy5e-sheet", "npsSheetWidth", {
			name: `${game.i18n.localize("TIDY5E.Settings.npsSheetWidth")}`,
			scope: "client",
			config: false,
			type: Number,
			default: 740
		});

		// Default width for vehicle sheet

		game.settings.register("tidy5e-sheet", "vehicleSheetWidth", {
			name: `${game.i18n.localize("TIDY5E.Settings.vehicleSheetWidth")}`,
			scope: "client",
			config: false,
			type: Number,
			default: 740
		});

		// Lazy HP and Exp

		game.settings.register("tidy5e-sheet", "lazyHpAndExpEnable", {
			name: `${game.i18n.localize("TIDY5E.Settings.LazyHpAndExpEnable.name")}`,
			hint: `${game.i18n.localize("TIDY5E.Settings.LazyHpAndExpEnable.hint")}`,
			scope: "world",
			config: false,
			default: true,
			type: Boolean
		});

		// Lazy Money

		game.settings.register("tidy5e-sheet", "lazyMoneyEnable", {
			name: `${game.i18n.localize("TIDY5E.Settings.LazyMoneyEnable.name")}`,
			hint: `${game.i18n.localize("TIDY5E.Settings.LazyMoneyEnable.hint")}`,
			scope: "world",
			config: false,
			default: false,
			type: Boolean
		});

		game.settings.register("tidy5e-sheet", "lazyMoneyAddConvert", {
			name: `${game.i18n.localize("TIDY5E.Settings.LazyMoneyAddConvert.name")}`,
			hint: `${game.i18n.localize("TIDY5E.Settings.LazyMoneyAddConvert.hint")}`,
			scope: "world",
			config: false,
			default: false,
			type: Boolean
		});

		game.settings.register("tidy5e-sheet", "lazyMoneyIgnoreElectrum", {
			name: `${game.i18n.localize("TIDY5E.Settings.LazyMoneyIgnoreElectrum.name")}`,
			hint: `${game.i18n.localize("TIDY5E.Settings.LazyMoneyIgnoreElectrum.hint")}`,
			scope: "world",
			config: false,
			default: true,
			type: Boolean
		});

		game.settings.register("tidy5e-sheet", "lazyMoneyChatLog", {
			name: `${game.i18n.localize("TIDY5E.Settings.LazyMoneyChatLog.name")}`,
			hint: `${game.i18n.localize("TIDY5E.Settings.LazyMoneyChatLog.hint")}`,
			scope: "world",
			config: false,
			default: false,
			type: Boolean
		});

		// Locks

		game.settings.register("tidy5e-sheet", "lockMoneyChanges", {
			name: `${game.i18n.localize("TIDY5E.Settings.LockMoneyChanges.name")}`,
			hint: `${game.i18n.localize("TIDY5E.Settings.LockMoneyChanges.hint")}`,
			scope: "world",
			config: false,
			default: false,
			type: Boolean
		});

		game.settings.register("tidy5e-sheet", "lockExpChanges", {
			name: `${game.i18n.localize("TIDY5E.Settings.LockExpChanges.name")}`,
			hint: `${game.i18n.localize("TIDY5E.Settings.LockExpChanges.hint")}`,
			scope: "world",
			config: false,
			default: false,
			type: Boolean
		});

		game.settings.register("tidy5e-sheet", "lockHpMaxChanges", {
			name: `${game.i18n.localize("TIDY5E.Settings.LockHpMaxChanges.name")}`,
			hint: `${game.i18n.localize("TIDY5E.Settings.LockHpMaxChanges.hint")}`,
			scope: "world",
			config: false,
			default: false,
			type: Boolean
		});

		game.settings.register("tidy5e-sheet", "lockLevelSelector", {
			name: `${game.i18n.localize("TIDY5E.Settings.LockLevelSelector.name")}`,
			hint: `${game.i18n.localize("TIDY5E.Settings.LockLevelSelector.hint")}`,
			scope: "world",
			config: false,
			default: false,
			type: Boolean
		});

		game.settings.register("tidy5e-sheet", "lockConfigureSheet", {
			name: `${game.i18n.localize("TIDY5E.Settings.LockConfigureSheet.name")}`,
			hint: `${game.i18n.localize("TIDY5E.Settings.LockConfigureSheet.hint")}`,
			scope: "world",
			config: false,
			default: false,
			type: Boolean
		});

		game.settings.register("tidy5e-sheet", "lockItemQuantity", {
			name: `${game.i18n.localize("TIDY5E.Settings.LockItemQuantity.name")}`,
			hint: `${game.i18n.localize("TIDY5E.Settings.LockItemQuantity.hint")}`,
			scope: "world",
			config: false,
			default: false,
			type: Boolean
		});

		// Other 

		game.settings.register("tidy5e-sheet", "allowCantripToBePreparedOnContext", {
			name: `${game.i18n.localize("TIDY5E.Settings.AllowCantripToBePreparedOnContext.name")}`,
			hint: `${game.i18n.localize("TIDY5E.Settings.AllowCantripToBePreparedOnContext.hint")}`,
			scope: "world",
			config: false,
			default: false,
			type: Boolean
		});

		game.settings.register("tidy5e-sheet", "spellClassFilterSelect", {
			name: `${game.i18n.localize("TIDY5E.Settings.SpellClassFilterSelect.name")}`,
			hint: `${game.i18n.localize("TIDY5E.Settings.SpellClassFilterSelect.hint")}`,
			scope: "client",
			config: false,
			default: false,
			type: Boolean
		});

		game.settings.register("tidy5e-sheet", "spellClassFilterIconReplace", {
			name: `${game.i18n.localize("TIDY5E.Settings.SpellClassFilterIconReplace.name")}`,
			hint: `${game.i18n.localize("TIDY5E.Settings.SpellClassFilterIconReplace.hint")}`,
			scope: "client",
			config: false,
			default: false,
			type: Boolean
		});

		// Spell color customization

		game.settings.register("tidy5e-sheet", "colorPickerEnabled", {
			name: `${game.i18n.localize("TIDY5E.Settings.ColorPickerEnabled.name")}`,
			hint: `${game.i18n.localize("TIDY5E.Settings.ColorPickerEnabled.hint")}`,
			scope: "world",
			type: Boolean,
			default: false,
			config: false,
		});

		// --t5e-equipped: 					rgba(50, 205, 50, 0.3);
		// --t5e-equipped-outline: 			rgba(50, 205, 50, 1);
		// --t5e-equipped-accent: 			rgba(173, 255, 47, 1);

		game.settings.register("tidy5e-sheet", "colorPickerEquipped", {
			name: `${game.i18n.localize("TIDY5E.Settings.ColorPickerEquipped.name")}`,
			hint: `${game.i18n.localize("TIDY5E.Settings.ColorPickerEquipped.hint")}`,
			scope: "world",
			type: String,
			default: RGBAToHexAFromColor(50,205,50,.3),
			config: false,
		});
		game.settings.register("tidy5e-sheet", "colorPickerEquippedOutline", {
			name: `${game.i18n.localize("TIDY5E.Settings.ColorPickerEquippedOutline.name")}`,
			hint: `${game.i18n.localize("TIDY5E.Settings.ColorPickerEquippedOutline.hint")}`,
			scope: "world",
			type: String,
			default: RGBAToHexAFromColor(50,205,50,1),
			config: false,
		});
		game.settings.register("tidy5e-sheet", "colorPickerEquippedAccent", {
			name: `${game.i18n.localize("TIDY5E.Settings.ColorPickerEquippedAccent.name")}`,
			hint: `${game.i18n.localize("TIDY5E.Settings.ColorPickerEquippedAccent.hint")}`,
			scope: "world",
			type: String,
			default: RGBAToHexAFromColor(173,255,47,1),
			config: false,
		});

		// --t5e-prepared: 					rgba(50, 205, 50, 0.3);
		// --t5e-prepared-outline: 			rgba(50, 205, 50, 1);
		// --t5e-prepared-accent: 			rgba(173, 255, 47, 1);

		game.settings.register("tidy5e-sheet", "colorPickerPrepared", {
			name: `${game.i18n.localize("TIDY5E.Settings.ColorPickerPrepared.name")}`,
			hint: `${game.i18n.localize("TIDY5E.Settings.ColorPickerPrepared.hint")}`,
			scope: "world",
			type: String,
			default: RGBAToHexAFromColor(50,205,50,.3),
			config: false,
		});
		game.settings.register("tidy5e-sheet", "colorPickerPreparedOutline", {
			name: `${game.i18n.localize("TIDY5E.Settings.ColorPickerPreparedOutline.name")}`,
			hint: `${game.i18n.localize("TIDY5E.Settings.ColorPickerPreparedOutline.hint")}`,
			scope: "world",
			type: String,
			default: RGBAToHexAFromColor(50,205,50,1),
			config: false,
		});
		game.settings.register("tidy5e-sheet", "colorPickerPreparedAccent", {
			name: `${game.i18n.localize("TIDY5E.Settings.ColorPickerPreparedAccent.name")}`,
			hint: `${game.i18n.localize("TIDY5E.Settings.ColorPickerPreparedAccent.hint")}`,
			scope: "world",
			type: String,
			default: RGBAToHexAFromColor(173,255,47,1),
			config: false,
		});

		// --t5e-pact:					    rgba(250, 0, 180, 0.3);
		// --t5e-pact-outline: 			    rgba(250, 50, 213, 1);
		// --t5e-pact-accent: 				rgba(198, 119, 193, 1);

		game.settings.register("tidy5e-sheet", "colorPickerPact", {
			name: `${game.i18n.localize("TIDY5E.Settings.ColorPickerPact.name")}`,
			hint: `${game.i18n.localize("TIDY5E.Settings.ColorPickerPact.hint")}`,
			scope: "world",
			type: String,
			default: RGBAToHexAFromColor(250,0,180,.3),
			config: false,
		});
		game.settings.register("tidy5e-sheet", "colorPickerPactOutline", {
			name: `${game.i18n.localize("TIDY5E.Settings.ColorPickerPactOutline.name")}`,
			hint: `${game.i18n.localize("TIDY5E.Settings.ColorPickerPactOutline.hint")}`,
			scope: "world",
			type: String,
			default: RGBAToHexAFromColor(250,50,213,1),
			config: false,
		});
		game.settings.register("tidy5e-sheet", "colorPickerPactAccent", {
			name: `${game.i18n.localize("TIDY5E.Settings.ColorPickerPactAccent.name")}`,
			hint: `${game.i18n.localize("TIDY5E.Settings.ColorPickerPactAccent.hint")}`,
			scope: "world",
			type: String,
			default: RGBAToHexAFromColor(198,119,193,1),
			config: false,
		});

		// --t5e-atwill: 					rgba(226, 246, 4, 0.3);
		// --t5e-atwill-outline: 			rgba(163, 165, 50, 1);
		// --t5e-atwill-accent: 		    rgba(255, 242, 0, 1);

		game.settings.register("tidy5e-sheet", "colorPickerAtWill", {
			name: `${game.i18n.localize("TIDY5E.Settings.ColorPickerAtWill.name")}`,
			hint: `${game.i18n.localize("TIDY5E.Settings.ColorPickerAtWill.hint")}`,
			scope: "world",
			type: String,
			default: RGBAToHexAFromColor(226,246,4,.3),
			config: false,
		});
		game.settings.register("tidy5e-sheet", "colorPickerAtWillOutline", {
			name: `${game.i18n.localize("TIDY5E.Settings.ColorPickerAtWillOutline.name")}`,
			hint: `${game.i18n.localize("TIDY5E.Settings.ColorPickerAtWillOutline.hint")}`,
			scope: "world",
			type: String,
			default: RGBAToHexAFromColor(163,165,50,1),
			config: false,
		});
		game.settings.register("tidy5e-sheet", "colorPickerAtWillAccent", {
			name: `${game.i18n.localize("TIDY5E.Settings.ColorPickerAtWillAccent.name")}`,
			hint: `${game.i18n.localize("TIDY5E.Settings.ColorPickerAtWillAccent.hint")}`,
			scope: "world",
			type: String,
			default: RGBAToHexAFromColor(255,242,0,1),
			config: false,
		});

		// --t5e-innate: 					rgba(255, 0, 0, 0.3);
		// --t5e-innate-outline: 			rgba(231, 23, 23, 1);
		// --t5e-innate-accent: 			rgba(195, 69, 69, 1);

		game.settings.register("tidy5e-sheet", "colorPickerInnate", {
			name: `${game.i18n.localize("TIDY5E.Settings.ColorPickerInnate.name")}`,
			hint: `${game.i18n.localize("TIDY5E.Settings.ColorPickerInnate.hint")}`,
			scope: "world",
			type: String,
			default: RGBAToHexAFromColor(255,0,0,.3),
			config: false,
		});
		game.settings.register("tidy5e-sheet", "colorPickerInnateOutline", {
			name: `${game.i18n.localize("TIDY5E.Settings.ColorPickerInnateOutline.name")}`,
			hint: `${game.i18n.localize("TIDY5E.Settings.ColorPickerInnateOutline.hint")}`,
			scope: "world",
			type: String,
			default: RGBAToHexAFromColor(231,23,23,1),
			config: false,
		});
		game.settings.register("tidy5e-sheet", "colorPickerInnateAccent", {
			name: `${game.i18n.localize("TIDY5E.Settings.ColorPickerInnateAccent.name")}`,
			hint: `${game.i18n.localize("TIDY5E.Settings.ColorPickerInnateAccent.hint")}`,
			scope: "world",
			type: String,
			default: RGBAToHexAFromColor(195,69,69,1),
			config: false,
		});

		// --t5e-alwaysprepared: 			rgba(0, 0, 255, 0.15);
		// --t5e-alwaysprepared-outline: 	rgba(65, 105, 225, 1);
		// --t5e-alwaysprepared-accent: 	rgba(0, 191, 255, 1);

		game.settings.register("tidy5e-sheet", "colorPickerAlwaysPrepared", {
			name: `${game.i18n.localize("TIDY5E.Settings.ColorPickerAlwaysPrepared.name")}`,
			hint: `${game.i18n.localize("TIDY5E.Settings.ColorPickerAlwaysPrepared.hint")}`,
			scope: "world",
			type: String,
			default: RGBAToHexAFromColor(0,0,255,.15),
			config: false,
		});
		game.settings.register("tidy5e-sheet", "colorPickerAlwaysPreparedOutline", {
			name: `${game.i18n.localize("TIDY5E.Settings.ColorPickerAlwaysPreparedOutline.name")}`,
			hint: `${game.i18n.localize("TIDY5E.Settings.ColorPickerAlwaysPreparedOutline.hint")}`,
			scope: "world",
			type: String,
			default: RGBAToHexAFromColor(65,105,225,1),
			config: false,
		});
		game.settings.register("tidy5e-sheet", "colorPickerAlwaysPreparedAccent", {
			name: `${game.i18n.localize("TIDY5E.Settings.ColorPickerAlwaysPreparedAccent.name")}`,
			hint: `${game.i18n.localize("TIDY5E.Settings.ColorPickerAlwaysPreparedAccent.hint")}`,
			scope: "world",
			type: String,
			default: RGBAToHexAFromColor(0,191,255,1),
			config: false,
		});

}

class ResetSettingsDialog extends FormApplication {
	constructor(...args) {
		//@ts-ignore
		super(...args);
		//@ts-ignore
		return new Dialog({
			title: game.i18n.localize(`TIDY5E.Settings.Reset.dialogs.title`),
			content:
				'<p style="margin-bottom:1rem;">' +
				game.i18n.localize(`TIDY5E.Settings.Reset.dialogs.content`) +
				"</p>",
			buttons: {
				confirm: {
					icon: '<i class="fas fa-check"></i>',
					label: game.i18n.localize(`TIDY5E.Settings.Reset.dialogs.confirm`),
					callback: async () => {
						for (let setting of game.settings.storage.get("world")
							.filter(setting => setting.key.startsWith("tidy5e-sheet."))) {
							
							console.log(`Reset setting '${setting.key}'`);
							await setting.delete();
						}
						//window.location.reload();
					},
				},
				cancel: {
					icon: '<i class="fas fa-times"></i>',
					label: game.i18n.localize(`TIDY5E.Settings.Reset.dialogs.cancel`),
				},
			},
			default: "cancel",
		});
	}

	async _updateObject(event, formData) {
		// do nothing
	}
}