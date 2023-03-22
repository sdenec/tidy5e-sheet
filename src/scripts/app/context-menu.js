import CONSTANTS from "./constants.js";
import { warn, debug } from "./logger-util.js";
import { isItemFavorite } from "./tidy5e-favorites.js";

export const tidy5eContextMenu = function (html, sheet) {
	const actor = sheet.actor ? sheet.actor : sheet.parent;

	// Manage Middle Click behavior
	html.find(".item-list .item .item-name").mousedown(async (event) => {
		if (event.which === 2) {
			debug(`tidy5eContextMenu | middle click`);
			// let target = event.target.class;
			// let item = event.currentTarget;
			// Middle mouse opens item editor
			event.preventDefault();
			let li = $(event.target).parents(".item");
			if(li && li[0]) {
				/*
				if ($(li).find(".item-edit")) {
					$(li).find(".item-edit").trigger("click");
				}
				if ($(li).find(".effect-edit")) {
					$(li).find(".effect-edit").trigger("click");
				}
				*/
				const itemId = li[0].dataset.itemId;
				const effectId = li[0].dataset.effectId;
				if((!itemId && !effectId) || !actor) {
					return;
				}
				if(itemId) {
					let item = actor.items.get(itemId);
					if(!item) {
						return;
					}
					item.sheet.render(true);
				}
				if(effectId) {
					let effect = actor.effects.get(effectId);
					if(!effect) {
						return;
					}
					effect.sheet.render(true);
				}
			}
			// let itemId = $(event.target).parents(".item")[0].dataset.itemId;
			// if(!itemId || !actor) {
			// 	return;
			// }
			// let item = actor.items.get(itemId);
			// if(!item) {
			// 	return;
			// }
			//item._onAdvancementAction(li[0], "edit")
			// item.render(true);
		}
	});

	// Override COntext Menu
	// Item Context Menu
	// new ContextMenu(html, ".item-list .item #context-menu", [], {onOpen: sheet._onItemContext.bind(sheet)});

	Hooks.on("dnd5e.getActiveEffectContextOptions", (effect, contextOptions) => {
		const actor = effect.actor ? effect.actor : effect.parent;
		if (actor?.isOwner) {
			contextOptions = contextOptions.filter((obj) => {
				//check for default options and remove them.
				return ![
					"DND5E.ContextMenuActionEdit",
					"DND5E.ContextMenuActionDuplicate",
					"DND5E.ContextMenuActionDelete",
					"DND5E.ContextMenuActionEnable",
					"DND5E.ContextMenuActionDisable",
					"DND5E.ContextMenuActionUnattune",
					"DND5E.ContextMenuActionAttune",
					"DND5E.ContextMenuActionUnequip",
					"DND5E.ContextMenuActionEquip",
					"DND5E.ContextMenuActionUnprepare",
					"DND5E.ContextMenuActionPrepare"
				].includes(obj?.name);
			});
			if (game.settings.get(CONSTANTS.MODULE_ID, "rightClickDisabled")) {
				contextOptions = [];
			} else {
				let tidy5eContextOptions = _getActiveEffectContextOptions(effect);
				contextOptions = tidy5eContextOptions.concat(contextOptions);
			}
			ui.context.menuItems = contextOptions;
		}
	});

	Hooks.on("dnd5e.getItemContextOptions", (item, contextOptions) => {
		const actor = item.actor ? item.actor : item.parent;
		if (actor?.isOwner) {
			contextOptions = contextOptions.filter((obj) => {
				//check for default options and remove them.
				return ![
					"DND5E.ContextMenuActionEdit",
					"DND5E.ContextMenuActionDuplicate",
					"DND5E.ContextMenuActionDelete",
					"DND5E.ContextMenuActionEnable",
					"DND5E.ContextMenuActionDisable",
					"DND5E.ContextMenuActionUnattune",
					"DND5E.ContextMenuActionAttune",
					"DND5E.ContextMenuActionUnequip",
					"DND5E.ContextMenuActionEquip",
					"DND5E.ContextMenuActionUnprepare",
					"DND5E.ContextMenuActionPrepare"
				].includes(obj?.name);
			});
			if (game.settings.get(CONSTANTS.MODULE_ID, "rightClickDisabled")) {
				if (item.type === "spell" && !item.actor.getFlag(CONSTANTS.MODULE_ID, "tidy5e-sheet.spellbook-grid")) {
					contextOptions = [];
				} else if (item.type !== "spell" && !item.actor.getFlag(CONSTANTS.MODULE_ID, "inventory-grid")) {
					contextOptions = [];
				} else {
					//merge new options with tidy5e options
					let tidy5eContextOptions = _getItemContextOptions(item);
					contextOptions = tidy5eContextOptions.concat(contextOptions);
				}
			} else {
				//merge new options with tidy5e options
				let tidy5eContextOptions = _getItemContextOptions(item);
				contextOptions = tidy5eContextOptions.concat(contextOptions);
			}
			ui.context.menuItems = contextOptions;
		}
	});

	Hooks.on("dnd5e.getItemAdvancementContext", (html, contextOptions) => {
		// TODO cannot recover the 'this' reference
		/*
    if ( actor?.isOwner ) {

      if(game.settings.get(CONSTANTS.MODULE_ID, "rightClickDisabled")){
        contextOptions = [];
      } else {
        contextOptions = _getAdvancementContextMenuOptions(html);
      }
      ui.context.menuItems = contextOptions;
    }
    */
	});
};

/**
 * Get the set of ContextMenu options which should be applied for advancement entries.
 * @returns {ContextMenuEntry[]}  Context menu entries.
 * @protected
 */
const _getAdvancementContextMenuOptions = function (html) {
	let options = [];
	// const condition = li => (this.advancementConfigurationMode || !this.isEmbedded) && this.isEditable;

	/*
  {
    name: "DND5E.AdvancementControlEdit",
    icon: "<i class='fas fa-edit fa-fw'></i>",
    condition,
    callback: li => this._onAdvancementAction(li[0], "edit")
  },
  {
    name: "DND5E.AdvancementControlDuplicate",
    icon: "<i class='fas fa-copy fa-fw'></i>",
    condition: li => {
      const id = li[0].closest(".advancement-item")?.dataset.id;
      const advancement = this.item.advancement.byId[id];
      return condition(li) && advancement?.constructor.availableForItem(this.item);
    },
    callback: li => this._onAdvancementAction(li[0], "duplicate")
  },
  {
    name: "DND5E.AdvancementControlDelete",
    icon: "<i class='fas fa-trash fa-fw' style='color: rgb(255, 65, 65);'></i>",
    condition,
    callback: li => this._onAdvancementAction(li[0], "delete")
  }
  */

	options.push(
		{
			name: "DND5E.AdvancementControlEdit",
			icon: "<i class='fas fas fa-pencil-alt fa-fw'></i>",
			condition,
			callback: (li) => this._onAdvancementAction(li[0], "edit")
		},
		{
			name: "DND5E.AdvancementControlDuplicate",
			icon: "<i class='fas fa-copy fa-fw'></i>",
			condition: (li) => {
				const id = li[0].closest(".advancement-item")?.dataset.id;
				const advancement = this.item.advancement.byId[id];
				return condition(li) && advancement?.constructor.availableForItem(this.item);
			},
			callback: (li) => this._onAdvancementAction(li[0], "duplicate")
		},
		{
			name: "DND5E.AdvancementControlDelete",
			icon: "<i class='fas fa-trash fa-fw' style='color: rgb(255, 65, 65);'></i>",
			condition,
			callback: (li) => this._onAdvancementAction(li[0], "delete")
		}
	);
};

/**
 * Prepare an array of context menu options which are available for owned ActiveEffect documents.
 * @param {ActiveEffect5e} effect         The ActiveEffect for which the context menu is activated
 * @returns {ContextMenuEntry[]}          An array of context menu options offered for the ActiveEffect
 * @protected
 */
const _getActiveEffectContextOptions = function (effect) {
	const actor = effect.actor ? effect.actor : effect.parent;
	let options = [];

	/*
  {
    name: "DND5E.ContextMenuActionEdit",
    icon: "<i class='fas fa-edit fa-fw'></i>",
    callback: () => effect.sheet.render(true)
  },
  {
    name: "DND5E.ContextMenuActionDuplicate",
    icon: "<i class='fas fa-copy fa-fw'></i>",
    callback: () => effect.clone({label: game.i18n.format("DOCUMENT.CopyOf", {name: effect.label})}, {save: true})
  },
  {
    name: "DND5E.ContextMenuActionDelete",
    icon: "<i class='fas fa-trash fa-fw'></i>",
    callback: () => effect.deleteDialog()
  },
  {
    name: effect.disabled ? "DND5E.ContextMenuActionEnable" : "DND5E.ContextMenuActionDisable",
    icon: effect.disabled ? "<i class='fas fa-check fa-fw'></i>" : "<i class='fas fa-times fa-fw'></i>",
    callback: () => effect.update({disabled: !effect.disabled})
  }
  */

	options.push({
		name: effect.disabled ? "DND5E.ContextMenuActionEnable" : "DND5E.ContextMenuActionDisable",
		icon: effect.disabled ? "<i class='fas fa-check fa-fw'></i>" : "<i class='fas fa-times fa-fw'></i>",
		callback: () => effect.update({ disabled: !effect.disabled })
	});

	options.push({
		name: "DND5E.ContextMenuActionEdit",
		icon: "<i class='fas fas fa-pencil-alt fa-fw'></i>",
		callback: () => effect.sheet.render(true)
	});
	if (actor.getFlag(CONSTANTS.MODULE_ID, "allow-edit")) {
		options.push({
			name: "DND5E.ContextMenuActionDuplicate",
			icon: "<i class='fas fa-copy fa-fw'></i>",
			callback: () =>
				effect.clone({ label: game.i18n.format("DOCUMENT.CopyOf", { name: effect.label }) }, { save: true })
		});
		options.push({
			name: "DND5E.ContextMenuActionDelete",
			icon: "<i class='fas fa-trash fa-fw' style='color: rgba(255, 30, 0, 0.65);'></i>",
			callback: () => effect.deleteDialog()
		});
	}

	return options;
};

/**
 * Prepare an array of context menu options which are available for owned Item documents.
 * @param {Item5e} item                   The Item for which the context menu is activated
 * @returns {ContextMenuEntry[]}          An array of context menu options offered for the Item
 * @protected
 */
const _getItemContextOptions = function (item) {
	const actor = item.actor ? item.actor : item.parent;
	if (!actor) {
		return;
	}
	let options = [];

	const isCharacter = actor.type === "character";
	const isNPC = actor.type === "npc";
	const isVehicle = actor.type === "vehicle";

	const allowCantripToBePreparedOnContext = game.settings.get(
		CONSTANTS.MODULE_ID,
		"allowCantripToBePreparedOnContext"
	);
	let toggleClass = "";
	let toggleTitle = "";
	let canToggle = false;
	let isActive = false;
	let canPrepare = false;

	if (item.type === "spell") {
		const prep = item.system.preparation || {};
		const isAlways = prep.mode === "always";
		const isPrepared = !!prep.prepared;
		isActive = isPrepared;
		toggleClass = isPrepared ? "active" : "";
		if (isAlways) toggleClass = "fixed";
		if (isAlways) toggleTitle = CONFIG.DND5E.spellPreparationModes.always;
		else if (isPrepared) toggleTitle = CONFIG.DND5E.spellPreparationModes.prepared;
		else toggleTitle = game.i18n.localize("DND5E.SpellUnprepared");

		canPrepare = item.system.level >= 1;
	} else {
		isActive = !!item.system.equipped;
		toggleClass = isActive ? "active" : "";
		toggleTitle = game.i18n.localize(isActive ? "DND5E.Equipped" : "DND5E.Unequipped");
		canToggle = "equipped" in item.system;

		canPrepare = item.system.level >= 1;
	}

	// Toggle Attunement State
	if ("attunement" in item.system && item.system.attunement !== CONFIG.DND5E.attunementTypes.NONE) {
		const isAttuned = item.system.attunement === CONFIG.DND5E.attunementTypes.ATTUNED;
		// options.push({
		//   name: isAttuned ? "DND5E.ContextMenuActionUnattune" : "DND5E.ContextMenuActionAttune",
		//   icon: "<i class='fas fa-sun fa-fw'></i>",
		//   callback: () => item.update({
		//     "system.attunement": CONFIG.DND5E.attunementTypes[isAttuned ? "REQUIRED" : "ATTUNED"]
		//   })
		// });
		options.push({
			name: isAttuned ? "TIDY5E.Deattune" : "TIDY5E.Attune",
			icon: isAttuned
				? "<i class='fas fa-sun fa-fw' style='color: rgba(255, 30, 0, 0.65);'></i>"
				: "<i class='fas fa-sun fa-fw'></i>",
			callback: () =>
				item.update({
					"system.attunement": CONFIG.DND5E.attunementTypes[isAttuned ? "REQUIRED" : "ATTUNED"]
				})
		});
	}

	// Toggle Equipped State
	if ("equipped" in item.system) {
		// options.push({
		//   name: item.system.equipped ? "DND5E.ContextMenuActionUnequip" : "DND5E.ContextMenuActionEquip",
		//   icon: "<i class='fas fa-shield-alt fa-fw'></i>",
		//   callback: () => item.update({"system.equipped": !item.system.equipped})
		// });
		const isEquipped = item.system.equipped;
		options.push({
			name: isEquipped ? "TIDY5E.Unequip" : "TIDY5E.Equip",
			icon: isEquipped
				? "<i class='fas fa-user-alt fa-fw' style='color: rgba(255, 30, 0, 0.65);'></i> "
				: "<i class='fas fa-user-alt fa-fw'></i> ",
			callback: () => item.update({ "system.equipped": !isEquipped })
		});
	}

	// Toggle Prepared State
	if ("preparation" in item.system) {
		// if ( ("preparation" in item.system) &&
		//   (item.system.preparation?.mode === "prepared") ) {
		// options.push({
		//   name: item.system?.preparation?.prepared ? "DND5E.ContextMenuActionUnprepare" : "DND5E.ContextMenuActionPrepare",
		//   icon: "<i class='fas fa-sun fa-fw'></i>",
		//   callback: () => item.update({"system.preparation.prepared": !item.system.preparation?.prepared})
		// });

		const isPrepared = item.system?.preparation?.prepared;
		if (allowCantripToBePreparedOnContext) {
			if (item.system.preparation.mode != "always") {
				options.push({
					name: isActive ? "TIDY5E.Unprepare" : "TIDY5E.Prepare",
					icon: isActive ? "<i class='fas fa-book fa-fw'></i>" : "<i class='fas fa-book fa-fw'></i>",
					callback: () => item.update({ "system.preparation.prepared": !isPrepared })
				});
			}
		} else {
			if (canPrepare && item.system.preparation.mode != "always") {
				options.push({
					name: isActive ? "TIDY5E.Unprepare" : "TIDY5E.Prepare",
					icon: isActive ? "<i class='fas fa-book fa-fw'></i>" : "<i class='fas fa-book fa-fw'></i>",
					callback: () => item.update({ "system.preparation.prepared": !isPrepared })
				});
			}
		}
	}

	// TODO SUPPORT FAVORITE ON NPC ?
	if (isCharacter) {
		// Add favorites to context menu
		let isFav = isItemFavorite(item);

		let favoriteColor = "rgba(0, 0, 0, 0.65)"; //Standard black
		let favoriteIcon = "fa-bookmark";
		if (game.modules.get("favorite-items")?.active) {
			favoriteIcon = game.settings.get("favorite-items", "favorite-icon");
			favoriteColor = game.settings.get("favorite-items", "favorite-color");
		}
		options.push({
			name: isFav ? "TIDY5E.RemoveFav" : "TIDY5E.AddFav",
			icon: isFav
				? `<i class='fas ${favoriteIcon} fa-fw'></i>`
				: `<i class='fas ${favoriteIcon} fa-fw inactive'></i>`,
			callback: () => {
				// const item_id = ev[0].dataset.itemId; //ev.currentTarget.closest('[data-item-id]').dataset.itemId;
				// const item = actor.items.get(item_id);
				if (!item) {
					warn(`tidy5e-context-menu | _getItemContextOptions | Item no founded!`);
					return;
				}
				let isFav = isItemFavorite(item);

				item.update({
					"flags.tidy5e-sheet.favorite": !isFav
				});
				// Sync favorite flag with module 'favorite-items'
				if (game.modules.get("favorite-items")?.active) {
					item.update({
						"flags.favorite-items.favorite": !isFav
					});
				}
				// Sync favorite flag with module 'favtab'
				if (game.modules.get("favtab")?.active) {
					item.update({
						"flags.favtab.isFavorite": !isFav
					});
				}
			}
		});

		// TODO commented waiting for this PR https://github.com/KageJittai/lets-trade-5e/pulls
		// if(game.modules.get("lets-trade-5e")?.active) {
		//   if(!['feat','background','class','subclass','spell'].includes(item.type)) {
		//     options.push({
		//         name: `${game.i18n.localize("LetsTrade5E.Send")}`,
		//         icon: `<i class="fas fa-balance-scale-right"></i>`,
		//         callback: ()=>{
		//           game.modules.get("lets-trade-5e").api.openItemTrade(item.actor?.id, item.id);
		//         }
		//     });
		//   }
		// }
	}
	/*
  // Standard Options
  const options = [
    {
      name: "DND5E.ContextMenuActionEdit",
      icon: "<i class='fas fa-edit fa-fw'></i>",
      callback: () => item.sheet.render(true)
    },
    {
      name: "DND5E.ContextMenuActionDuplicate",
      icon: "<i class='fas fa-copy fa-fw'></i>",
      condition: () => !["race", "background", "class", "subclass"].includes(item.type),
      callback: () => item.clone({name: game.i18n.format("DOCUMENT.CopyOf", {name: item.name})}, {save: true})
    },
    {
      name: "DND5E.ContextMenuActionDelete",
      icon: "<i class='fas fa-trash fa-fw'></i>",
      callback: () => item.deleteDialog()
    }
  ]
  */

	if (item.type === "spell") {
		options.push({
			name: "TIDY5E.EditSpell",
			icon: "<i class='fas fa-pencil-alt fa-fw'></i>",
			callback: () => item.sheet.render(true)
		});
		if (actor.getFlag(CONSTANTS.MODULE_ID, "allow-edit")) {
			options.push({
				name: "DND5E.ContextMenuActionDuplicate",
				icon: "<i class='fas fa-copy fa-fw'></i>",
				condition: () => !["race", "background", "class", "subclass"].includes(item.type),
				callback: () =>
					item.clone({ name: game.i18n.format("DOCUMENT.CopyOf", { name: item.name }) }, { save: true })
			});
			options.push({
				name: "TIDY5E.DeleteSpell",
				icon: "<i class='fas fa-trash fa-fw' style='color: rgba(255, 30, 0, 0.65);'></i>",
				callback: () => item.deleteDialog()
			});
		}
	} else {
		options.push({
			name: "DND5E.ContextMenuActionEdit",
			icon: "<i class='fas fa-pencil-alt fa-fw'></i>",
			callback: () => item.sheet.render(true)
		});

		if (actor.getFlag(CONSTANTS.MODULE_ID, "allow-edit")) {
			options.push({
				name: "DND5E.ContextMenuActionDuplicate",
				icon: "<i class='fas fa-copy fa-fw'></i>",
				condition: () => !["race", "background", "class", "subclass"].includes(item.type),
				callback: () =>
					item.clone({ name: game.i18n.format("DOCUMENT.CopyOf", { name: item.name }) }, { save: true })
			});
			options.push({
				name: "DND5E.ContextMenuActionDelete",
				icon: "<i class='fas fa-trash fa-fw' style='color: rgba(255, 30, 0, 0.65);'></i>",
				callback: () => item.deleteDialog()
			});
		}
	}
	return options;
};
