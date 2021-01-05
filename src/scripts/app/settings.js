export const tidy5eSettings = function () {
	
	// Classic Item Controls for PC Sheets
	game.settings.register("tidy5e-sheet", "useClassicControls", {
		name: `${game.i18n.localize("TIDY5E.Settings.UserLabel")} ${game.i18n.localize("TIDY5E.Settings.PcLabel")}: ${game.i18n.localize("TIDY5E.Settings.UseClassicControls.name")}`,
		hint: game.i18n.localize("TIDY5E.Settings.UseClassicControls.hint"),
		scope: "user",
		config: true,
		default: false,
		type: Boolean
	});
	
	// Show Roll buttons in context Menu
	game.settings.register("tidy5e-sheet", "contextRollButtons", {
		name: `${game.i18n.localize("TIDY5E.Settings.UserLabel")} ${game.i18n.localize("TIDY5E.Settings.PcLabel")}/${game.i18n.localize("TIDY5E.Settings.NpcLabel")}: ${game.i18n.localize("TIDY5E.Settings.ContextRollButtons.name")}`,
		hint: game.i18n.localize("TIDY5E.Settings.ContextRollButtons.hint"),
		scope: "user",
		config: true,
		default: false,
		type: Boolean
	});
	
	// Color Theme
	game.settings.register("tidy5e-sheet", "colorScheme", {
    name: `${game.i18n.localize("TIDY5E.Settings.UserLabel")}: ${game.i18n.localize("TIDY5E.Settings.SheetTheme.name")}`,
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

  // Tidy5e Global Settings
  game.settings.register("tidy5e-sheet", "useExpandedSheet", {
    name: `${game.i18n.localize("TIDY5E.Settings.GlobalLabel")}: ${game.i18n.localize("TIDY5E.Settings.UseExpandedSheet.name")}`,
    hint: game.i18n.localize("TIDY5E.Settings.UseExpandedSheet.hint"),
    scope: "world",
    config: true,
    default: false,
    type: Boolean
	});
	
	game.settings.register("tidy5e-sheet", "disableRightClick", {
    name: `${game.i18n.localize("TIDY5E.Settings.GlobalLabel")}: ${game.i18n.localize("TIDY5E.Settings.DisableRightClick.name")}`,
    hint: game.i18n.localize("TIDY5E.Settings.DisableRightClick.hint"),
    scope: "world",
    config: true,
    default: false,
		type: Boolean
	});

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
	
	game.settings.register("tidy5e-sheet", "alwaysShowQuantity", {
    name: `${game.i18n.localize("TIDY5E.Settings.GlobalLabel")}: ${game.i18n.localize("TIDY5E.Settings.AlwaysShowQty.name")}`,
    hint: game.i18n.localize("TIDY5E.Settings.AlwaysShowQty.hint"),
    scope: "world",
    config: true,
    default: false,
    type: Boolean
  });

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
	

	game.settings.register("tidy5e-sheet", "disableHpBar", {
		name: `${game.i18n.localize("TIDY5E.Settings.UserLabel")} ${game.i18n.localize("TIDY5E.Settings.PcLabel")}/${game.i18n.localize("TIDY5E.Settings.NpcLabel")}: ${game.i18n.localize("TIDY5E.Settings.DisableHpBar.name")}`,
		hint: game.i18n.localize("TIDY5E.Settings.DisableHpBar.hint"),
		scope: "user",
		config: true,
		default: false,
		type: Boolean
	});

	game.settings.register("tidy5e-sheet", "hpOverlayBorder", {
		name: `${game.i18n.localize("TIDY5E.Settings.GlobalLabel")} ${game.i18n.localize("TIDY5E.Settings.PcLabel")}: ${game.i18n.localize("TIDY5E.Settings.HpOverlayBorder.name")}`,
		hint: game.i18n.localize("TIDY5E.Settings.HpOverlayBorder.hint"),
		scope: "world",
		config: true,
		default: 0,
		type: Number
	});
	
	game.settings.register("tidy5e-sheet", "disableHpOverlay", {
		name: `${game.i18n.localize("TIDY5E.Settings.UserLabel")} ${game.i18n.localize("TIDY5E.Settings.PcLabel")}: ${game.i18n.localize("TIDY5E.Settings.DisableHpOverlay.name")}`,
		hint: game.i18n.localize("TIDY5E.Settings.DisableHpOverlay.hint"),
		scope: "user",
		config: true,
		default: false,
		type: Boolean
	});

  game.settings.register("tidy5e-sheet", "vehicleHpOverlayBorder", {
    name: `${game.i18n.localize("TIDY5E.Settings.GlobalLabel")} ${game.i18n.localize("TIDY5E.Settings.VehicleLabel")}: ${game.i18n.localize("TIDY5E.Settings.HpOverlayBorder.name")}`,
    hint: game.i18n.localize("TIDY5E.Settings.HpOverlayBorder.hint"),
    scope: "world",
    config: true,
    default: 0,
    type: Number
	});

  game.settings.register("tidy5e-sheet", "disableVehicleHpOverlay", {
    name: `${game.i18n.localize("TIDY5E.Settings.GlobalLabel")} ${game.i18n.localize("TIDY5E.Settings.VehicleLabel")}: ${game.i18n.localize("TIDY5E.Settings.DisableHpOverlay.name")}`,
    hint: game.i18n.localize("TIDY5E.Settings.DisableHpOverlay.hint"),
    scope: "world",
    config: true,
    default: false,
    type: Boolean
  });

  // Tidy5e NPC Settings
  game.settings.register("tidy5e-sheet", "npcHpOverlayBorder", {
    name: `${game.i18n.localize("TIDY5E.Settings.GlobalLabel")} ${game.i18n.localize("TIDY5E.Settings.NpcLabel")}: ${game.i18n.localize("TIDY5E.Settings.HpOverlayBorder.name")}`,
    hint: game.i18n.localize("TIDY5E.Settings.HpOverlayBorder.hint"),
    scope: "world",
    config: true,
    default: 0,
    type: Number
	});
	
  game.settings.register("tidy5e-sheet", "disableNpcHpOverlay", {
    name: `${game.i18n.localize("TIDY5E.Settings.GlobalLabel")} ${game.i18n.localize("TIDY5E.Settings.NpcLabel")}: ${game.i18n.localize("TIDY5E.Settings.DisableHpOverlay.name")}`,
    hint: game.i18n.localize("TIDY5E.Settings.DisableHpOverlay.hint"),
    scope: "world",
    config: true,
    default: false,
    type: Boolean
  });
  
  game.settings.register("tidy5e-sheet", "showNpcResting", {
    name: `${game.i18n.localize("TIDY5E.Settings.GlobalLabel")} ${game.i18n.localize("TIDY5E.Settings.NpcLabel")}: ${game.i18n.localize("TIDY5E.Settings.ShowNpcRest.name")}`,
    hint: game.i18n.localize("TIDY5E.Settings.ShowNpcRest.hint"),
    scope: "world",
    config: true,
    default: false,
    type: Boolean
  });

  game.settings.register("tidy5e-sheet", "npcAlwaysShowTraits", {
    name: `${game.i18n.localize("TIDY5E.Settings.GlobalLabel")} ${game.i18n.localize("TIDY5E.Settings.NpcLabel")}: ${game.i18n.localize("TIDY5E.Settings.AlwaysShowTraits.name")}`,
    hint: game.i18n.localize("TIDY5E.Settings.AlwaysShowTraits.hint"),
    scope: "world",
    config: true,
    default: false,
    type: Boolean
  });

  game.settings.register("tidy5e-sheet", "npcAlwaysShowSkills", {
    name: `${game.i18n.localize("TIDY5E.Settings.GlobalLabel")} ${game.i18n.localize("TIDY5E.Settings.NpcLabel")}: ${game.i18n.localize("TIDY5E.Settings.AlwaysShowSkills.name")}`,
    hint: game.i18n.localize("TIDY5E.Settings.AlwaysShowSkills.hint"),
    scope: "world",
    config: true,
    default: false,
    type: Boolean
  });

  game.settings.register("tidy5e-sheet", "npcLinkMarker", {
    name: `${game.i18n.localize("TIDY5E.Settings.GlobalLabel")} ${game.i18n.localize("TIDY5E.Settings.NpcLabel")}: ${game.i18n.localize("TIDY5E.Settings.LinkMarker.name")}`,
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

  // Tidy5e User Settings
	
  const colorScheme = game.settings.get('tidy5e-sheet', "colorScheme");
  if (colorScheme === 'dark') {
    document.body.classList.add("tidy5eDark");
  }
	
	game.settings.register("tidy5e-sheet", "hideClassList", {
		name: `${game.i18n.localize("TIDY5E.Settings.UserLabel")} ${game.i18n.localize("TIDY5E.Settings.PcLabel")}: ${game.i18n.localize("TIDY5E.Settings.HideClassList.name")}`,
		hint: game.i18n.localize("TIDY5E.Settings.HideClassList.hint"),
		scope: "user",
		config: true,
		default: false,
		type: Boolean
	});

	game.settings.register("tidy5e-sheet", "noInspirationAnimation", {
		name: `${game.i18n.localize("TIDY5E.Settings.UserLabel")} ${game.i18n.localize("TIDY5E.Settings.PcLabel")}: ${game.i18n.localize("TIDY5E.Settings.DisableInspirationAnimation.name")}`,
		hint: game.i18n.localize("TIDY5E.Settings.DisableInspirationAnimation.hint"),
		scope: "user",
		config: true,
		default: false,
		type: Boolean
	});
	
	game.settings.register("tidy5e-sheet", "hideIfZero", {
		name: `${game.i18n.localize("TIDY5E.Settings.UserLabel")} ${game.i18n.localize("TIDY5E.Settings.PcLabel")}: ${game.i18n.localize("TIDY5E.Settings.HideIfZero.name")}`,
		hint: game.i18n.localize("TIDY5E.Settings.HideIfZero.hint"),
		scope: "user",
		config: true,
		default: false,
		type: Boolean
	});
	
	game.settings.register("tidy5e-sheet", "inspirationOnHover", {
		name: `${game.i18n.localize("TIDY5E.Settings.UserLabel")} ${game.i18n.localize("TIDY5E.Settings.PcLabel")}: ${game.i18n.localize("TIDY5E.Settings.InspirationOnHover.name")}`,
		hint: game.i18n.localize("TIDY5E.Settings.InspirationOnHover.hint"),
		scope: "user",
		config: true,
		default: false,
		type: Boolean
	});

	game.settings.register("tidy5e-sheet", "exhaustionOnHover", {
		name: `${game.i18n.localize("TIDY5E.Settings.UserLabel")} ${game.i18n.localize("TIDY5E.Settings.PcLabel")}: ${game.i18n.localize("TIDY5E.Settings.ExhaustionOnHover.name")}`,
		hint: game.i18n.localize("TIDY5E.Settings.ExhaustionOnHover.hint"),
		scope: "user",
		config: true,
		default: false,
		type: Boolean
	});

	game.settings.register("tidy5e-sheet", "pcToggleTraits", {
		name: `${game.i18n.localize("TIDY5E.Settings.UserLabel")} ${game.i18n.localize("TIDY5E.Settings.PcLabel")}: ${game.i18n.localize("TIDY5E.Settings.PcToggleTraits.name")}`,
		hint: game.i18n.localize("TIDY5E.Settings.PcToggleTraits.hint"),
		scope: "user",
		config: true,
		default: false,
		type: Boolean
	});

	game.settings.register("tidy5e-sheet", "showTraitLabels", {
		name: `${game.i18n.localize("TIDY5E.Settings.UserLabel")} ${game.i18n.localize("TIDY5E.Settings.PcLabel")}/${game.i18n.localize("TIDY5E.Settings.NpcLabel")}: ${game.i18n.localize("TIDY5E.Settings.ShowTraitLabels.name")}`,
		hint: game.i18n.localize("TIDY5E.Settings.ShowTraitLabels.hint"),
		scope: "user",
		config: true,
		default: false,
		type: Boolean
	});
	
  game.settings.register("tidy5e-sheet", "moveTraits", {
		name: `${game.i18n.localize("TIDY5E.Settings.UserLabel")} ${game.i18n.localize("TIDY5E.Settings.PcLabel")}: ${game.i18n.localize("TIDY5E.Settings.MoveTraits.name")}`,
		hint: game.i18n.localize("TIDY5E.Settings.MoveTraits.hint"),
    scope: "user",
    config: true,
    default: false,
    type: Boolean
	});

}