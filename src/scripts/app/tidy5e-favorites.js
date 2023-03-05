/*
 * This file and its functions are
 * adapted for the Tidy5eSheet from
 * FavTab Module version 0.5.4 by Felix M�ller aka syl3r96 (Felix#6196 on Discord).
 *
 * This file and its functions are
 * adapted for the Tidy5eSheet from
 * Character Sheet Favorites Module version ?? by mxzf.
 *
 * It is licensed under a
 * Creative Commons Attribution 4.0 International License
 * and can be found at https://github.com/syl3r86/favtab.
 *
 * It is licensed under a
 * MIT License
 * and can be found at https://gitlab.com/mxzf/favorite-items.
 */

import { tidy5eAmmoSwitch } from "./ammo-switch.js";
import { applyColorPickerCustomization } from "./color-picker.js";
import CONSTANTS from "./constants.js";
import { tidy5eContextMenu } from "./context-menu.js";
import { is_real_number } from "./helpers.js";
import { debug, warn } from "./logger-util.js";

export const isItemFavorite = function (item) {
	if (!item) {
		return false;
	}
	let isFav =
		(game.modules.get("favtab")?.active && item.flags["favtab"]?.isFavorite) ||
		(game.modules.get("favorite-items")?.active && item.flags["favorite-items"]?.favorite) ||
		item.flags[CONSTANTS.MODULE_ID]?.favorite ||
		false;

	const isAlreadyTidyFav = getProperty(item.flags[CONSTANTS.MODULE_ID], `favorite`);
	// for retrocompatibility
	const isAlreadyFabTab = getProperty(item.flags["favtab"], `isFavorite`);
	if (String(isAlreadyFabTab) === "true" && String(isAlreadyFabTab) === "false") {
		if (String(isAlreadyTidyFav) !== "true" && String(isAlreadyTidyFav) !== "false") {
			isFav = item.flags["favtab"]?.isFavorite; // for retrocompatibility
		}
	}

	// if(String(isAlreadyTidyFav) !== "true" && String(isAlreadyTidyFav) !== "false") {
	// //   item.setFlag(CONSTANTS.MODULE_ID,"favorite",isFav);
	// }

	return isFav;
};

export const addFavorites = async function (app, html, data, position) {
	let favs = app.actor.items.filter((i) => {
		return isItemFavorite(i);
	});

	let favoriteColor = "rgba(0, 0, 0, 0.65)"; //Standard black
	let favoriteIcon = "fa-bookmark";
	if (game.modules.get("favorite-items")?.active) {
		favoriteIcon = game.settings.get("favorite-items", "favorite-icon");
		favoriteColor = game.settings.get("favorite-items", "favorite-color");
	}

	// Apply the toggle state info (mostly for equiped gear and prepared spells)
	//favs.forEach(i => app._prepareItemToggleState(i))

	let context = {
		owner: data.owner,
		inventory: favs.filter((i) =>
			["weapon", "equipment", "consumable", "tool", "backpack", "loot"].includes(i.type)
		),
		features: favs.filter((i) => ["feat", "background", "class", "subclass"].includes(i.type)),
		spells: app._prepareSpellbook(
			{ actor: app.actor },
			favs.filter((i) => i.type === "spell")
		),
		itemContext: favs.reduce((obj, i) => {
			obj[i.id] ??= { hasUses: i.system.uses && i.system.uses.max > 0 };
			app._prepareItemToggleState(i, obj[i.id]);
			return obj;
		}, {})
	};

	let favItems = [];
	let favFeats = [];
	let favSpellsPrepMode = {
		atwill: {
			isAtWill: true,
			spells: []
		},
		innate: {
			isInnate: true,
			spells: []
		},
		pact: {
			isPact: true,
			spells: [],
			value: data.actor.system.spells.pact.value,
			max: data.actor.system.spells.pact.max
		}
	};
	let favSpells = {
		0: {
			isCantrip: true,
			spells: []
		},
		1: {
			spells: [],
			value: data.actor.system.spells.spell1.value,
			max: data.actor.system.spells.spell1.max
		},
		2: {
			spells: [],
			value: data.actor.system.spells.spell2.value,
			max: data.actor.system.spells.spell2.max
		},
		3: {
			spells: [],
			value: data.actor.system.spells.spell3.value,
			max: data.actor.system.spells.spell3.max
		},
		4: {
			spells: [],
			value: data.actor.system.spells.spell4.value,
			max: data.actor.system.spells.spell4.max
		},
		5: {
			spells: [],
			value: data.actor.system.spells.spell5.value,
			max: data.actor.system.spells.spell5.max
		},
		6: {
			spells: [],
			value: data.actor.system.spells.spell6.value,
			max: data.actor.system.spells.spell6.max
		},
		7: {
			spells: [],
			value: data.actor.system.spells.spell7.value,
			max: data.actor.system.spells.spell7.max
		},
		8: {
			spells: [],
			value: data.actor.system.spells.spell8.value,
			max: data.actor.system.spells.spell8.max
		},
		9: {
			spells: [],
			value: data.actor.system.spells.spell9.value,
			max: data.actor.system.spells.spell9.max
		}
	};

	let spellCount = 0;
	let spellPrepModeCount = 0;

	let renderFavTab = false;

	// processing all items and put them in their respective lists if they're favorited
	for (let item of app.actor.items) {
		item.owner = app.actor.isOwner;

		// do not add the fav button for class items
		if (item.type == "class") {
			continue;
		}

		item.notFeat = true;
		if (item.type == "feat") {
			item.notFeat = false;
		}

		let isFav = isItemFavorite(item);

		// add button to toggle favorite of the item in their native tab
		if (app.options.editable) {
			let favBtn = $(
				`<a class="item-control item-fav ${isFav ? "active" : ""}" title="${
					isFav ? game.i18n.localize("TIDY5E.RemoveFav") : game.i18n.localize("TIDY5E.AddFav")
				}" data-fav="${isFav}"><i class="${
					isFav ? "fas fa-bookmark" : "fas fa-bookmark inactive"
				}"></i> <span class="control-label">${
					isFav ? game.i18n.localize("TIDY5E.RemoveFav") : game.i18n.localize("TIDY5E.AddFav")
				}</span></a>`
			);
			favBtn.click((ev) => {
				const item_id = ev.currentTarget.closest("[data-item-id]").dataset.itemId;
				const item = app.actor.items.get(item_id);
				if (!item) {
					warn(`tidy5e-favorites | addFavorites | Item no founded!`);
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
			});
			html.find(`.item[data-item-id="${item._id}"]`).find(".item-controls .item-edit").before(favBtn);

			if (isFav) {
				html.find(`.item[data-item-id="${item._id}"]`).addClass("isFav");
			}
		}

		if (isFav) {
			renderFavTab = true;

			// creating specific labels to be displayed
			let labels = {};
			let translation = {
				none: game.i18n.localize("DND5E.None"),
				action: game.i18n.localize("DND5E.Action"),
				crew: game.i18n.localize("DND5E.VehicleCrewAction"),
				bonus: game.i18n.localize("DND5E.BonusAction"),
				reaction: game.i18n.localize("DND5E.Reaction"),
				legendary: game.i18n.localize("DND5E.LegAct"),
				lair: game.i18n.localize("DND5E.LairAct"),
				special: game.i18n.localize("DND5E.Special"),
				day: game.i18n.localize("DND5E.TimeDay"),
				hour: game.i18n.localize("DND5E.TimeHour"),
				minute: game.i18n.localize("DND5E.TimeMinute"),
				reactiondamage: game.i18n.localize("midi-qol.reactionDamaged"),
				reactionmanual: game.i18n.localize("midi-qol.reactionManual")
			};

			function translateLabels(key) {
				let string = String(key);
				return translation[string];
			}
			if (item.system.activation && item.system.activation.type) {
				let key = item.system.activation.type;
				// item.system.activation.type.capitalize()
				labels.activation = `${
					item.system.activation.cost ? item.system.activation.cost + " " : ""
				}${translateLabels(key)}`;
			}

			// is item chargeable and on Cooldown
			item.isOnCooldown = false;
			if (item.system.recharge && item.system.recharge.value && item.system.recharge.charged === false) {
				item.isOnCooldown = true;
				item.labels = {
					recharge: game.i18n.localize("DND5E.FeatureRechargeOn") + " [" + item.system.recharge.value + "+]",
					rechargeValue: "[" + item.system.recharge.value + "+]"
				};
			}

			// adding info if item has quantity more than one
			item.isStack = false;
			if (item.system.quantity && item.system.quantity > 1) {
				item.isStack = true;
			}

			// adding attunement info
			item.canAttune = false;

			if (item.system.attunement) {
				if (item.system.attunement == 1 || item.system.attunement == 2) {
					item.canAttune = true;
				}
			}

			// check magic item
			item.isMagic = false;
			if (
				(item.flags.magicitems && item.flags.magicitems.enabled) ||
				(item.system.properties && item.system.properties.mgc)
			) {
				item.isMagic = true;
			}

			let attr = item.type === "spell" ? "preparation.prepared" : "equipped";
			let isActive = getProperty(item.system, attr);
			item.toggleClass = isActive ? "active" : "";
			if (item.type === "spell") {
				if (item.system.preparation.mode == "always") {
					item.toggleTitle = game.i18n.localize("DND5E.SpellPrepAlways");
				} else {
					item.toggleTitle = game.i18n.localize(isActive ? "DND5E.SpellPrepared" : "DND5E.SpellUnprepared");
				}
			} else {
				item.toggleTitle = game.i18n.localize(isActive ? "DND5E.Equipped" : "DND5E.Unequipped");
			}

			item.spellComps = "";
			if (item.type === "spell" && item.system.components) {
				let comps = item.system.components;
				let v = comps.vocal ? "V" : "";
				let s = comps.somatic ? "S" : "";
				let m = comps.material ? "M" : "";
				let c = comps.concentration ? true : false;
				let r = comps.ritual ? true : false;
				item.spellComps = `${v}${s}${m}`;
				item.spellCon = c;
				item.spellRit = r;
			}

			item.favLabels = labels;

			item.editable = app.options.editable;
			switch (item.type) {
				case "feat": {
					if (!is_real_number(item.flags[CONSTANTS.MODULE_ID].sort)) {
						item.flags[CONSTANTS.MODULE_ID].sort = (favFeats.count + 1) * 100000; // initial sort key if not present
					}
					item.isFeat = true;
					favFeats.push(item);
					break;
				}
				case "spell": {
					if (!is_real_number(item.flags[CONSTANTS.MODULE_ID].sort)) {
						item.flags[CONSTANTS.MODULE_ID].sort = (favSpellsPrepMode.count + 1) * 100000; // initial sort key if not present
					}
					if (item.system.preparation.mode && item.system.preparation.mode !== "prepared") {
						if (item.system.preparation.mode == "always") {
							// favSpellsPrepMode['always'].spells.push(item);
							item.canPrep = true;
							item.alwaysPrep = true;
						} else if (item.system.preparation.mode == "atwill") {
							favSpellsPrepMode["atwill"].spells.push(item);
						} else if (item.system.preparation.mode == "innate") {
							favSpellsPrepMode["innate"].spells.push(item);
						} else if (item.system.preparation.mode == "pact") {
							favSpellsPrepMode["pact"].spells.push(item);
						}
						spellPrepModeCount++;
					} else {
						item.canPrep = true;
					}
					if (item.canPrep && item.system.level) {
						favSpells[item.system.level].spells.push(item);
					} else if (item.canPrep) {
						favSpells[0].spells.push(item);
					}
					spellCount++;
					break;
				}
				default: {
					if (!is_real_number(item.flags[CONSTANTS.MODULE_ID].sort)) {
						item.flags[CONSTANTS.MODULE_ID].sort = (favItems.count + 1) * 100000; // initial sort key if not present
					}
					item.isItem = true;
					favItems.push(item);
					break;
				}
			}
			if (item.canPrep) {
				item.canPrepare = item.system.level >= 1;
			}
		}
	}

	let enableSortFavoritesItemsAlphabetically = game.settings.get(
		CONSTANTS.MODULE_ID,
		"enableSortFavoritesItemsAlphabetically"
	);

	if (enableSortFavoritesItemsAlphabetically) {
		// sorting favItems alphabetically

		const favItemsArray = Object.keys(favItems);
		for (let key of favItemsArray) {
			favItems.sort(function (a, b) {
				let nameA = a.name.toLowerCase();
				let nameB = b.name.toLowerCase();
				if (nameA < nameB) {
					//sort string ascending
					return -1;
				}
				if (nameA > nameB) {
					return 1;
				}
				return 0; //default return value (no sorting)
			});
		}

		// sorting favItems alphabetically

		const favFeatsArray = Object.keys(favFeats);
		for (let key of favFeatsArray) {
			favFeats.sort(function (a, b) {
				let nameA = a.name.toLowerCase();
				let nameB = b.name.toLowerCase();
				if (nameA < nameB) {
					//sort string ascending
					return -1;
				}
				if (nameA > nameB) {
					return 1;
				}
				return 0; //default return value (no sorting)
			});
		}

		// sorting favSpells alphabetically

		const favSpellsArray = Object.keys(favSpells);
		for (let key of favSpellsArray) {
			favSpells[key].spells.sort(function (a, b) {
				let nameA = a.name.toLowerCase();
				let nameB = b.name.toLowerCase();
				if (nameA < nameB) {
					//sort string ascending
					return -1;
				}
				if (nameA > nameB) {
					return 1;
				}
				return 0; //default return value (no sorting)
			});
		}

		// sorting favSpellsPrepMode alphabetically

		const favSpellsPrepModeArray = Object.keys(favSpellsPrepMode);
		for (let key of favSpellsPrepModeArray) {
			favSpellsPrepMode[key].spells.sort(function (a, b) {
				let nameA = a.name.toLowerCase();
				let nameB = b.name.toLowerCase();
				if (nameA < nameB) {
					//sort string ascending
					return -1;
				}
				if (nameA > nameB) {
					return 1;
				}
				return 0; //default return value (no sorting)
			});
		}
	} else {
		// sorting favItems by sort

		const favItemsArray = Object.keys(favItems);
		for (let key of favItemsArray) {
			favItems.sort(function (a, b) {
				let nameA = a.flags[CONSTANTS.MODULE_ID]?.sort;
				let nameB = b.flags[CONSTANTS.MODULE_ID]?.sort;
				if (nameA < nameB) {
					//sort string ascending
					return -1;
				}
				if (nameA > nameB) {
					return 1;
				}
				return 0; //default return value (no sorting)
			});
		}

		// sorting favItems by sort

		const favFeatsArray = Object.keys(favFeats);
		for (let key of favFeatsArray) {
			favFeats.sort(function (a, b) {
				let nameA = a.flags[CONSTANTS.MODULE_ID]?.sort;
				let nameB = b.flags[CONSTANTS.MODULE_ID]?.sort;
				if (nameA < nameB) {
					//sort string ascending
					return -1;
				}
				if (nameA > nameB) {
					return 1;
				}
				return 0; //default return value (no sorting)
			});
		}

		// sorting favSpells by sort

		const favSpellsArray = Object.keys(favSpells);
		for (let key of favSpellsArray) {
			favSpells[key].spells.sort(function (a, b) {
				let nameA = a.flags[CONSTANTS.MODULE_ID]?.sort;
				let nameB = b.flags[CONSTANTS.MODULE_ID]?.sort;
				if (nameA < nameB) {
					//sort string ascending
					return -1;
				}
				if (nameA > nameB) {
					return 1;
				}
				return 0; //default return value (no sorting)
			});
		}

		// sorting favSpellsPrepMode by sort

		const favSpellsPrepModeArray = Object.keys(favSpellsPrepMode);
		for (let key of favSpellsPrepModeArray) {
			favSpellsPrepMode[key].spells.sort(function (a, b) {
				let nameA = a.flags[CONSTANTS.MODULE_ID]?.sort;
				let nameB = b.flags[CONSTANTS.MODULE_ID]?.sort;
				if (nameA < nameB) {
					//sort string ascending
					return -1;
				}
				if (nameA > nameB) {
					return 1;
				}
				return 0; //default return value (no sorting)
			});
		}
	}

	let attributesTab = html.find('.item[data-tab="attributes"]');
	let favContainer = html.find(".favorites-wrap");
	let favContent = html.find(".favorites-target");
	let favoritesTab = html.find(".tab.attributes");
	if (renderFavTab) {
		// rendering of the favtab

		context.favItems =
			favItems.length > 0
				? favItems
				: //? enableSortFavoritesItemsAlphabetically ? favItems : favItems?.sort((a, b) => a.flags[CONSTANTS.MODULE_ID].sort - b.flags[CONSTANTS.MODULE_ID].sort)
				  false;
		context.favFeats =
			favFeats.length > 0
				? favFeats
				: //? enableSortFavoritesItemsAlphabetically ? favFeats : favFeats?.sort((a, b) => a.flags[CONSTANTS.MODULE_ID].sort - b.flags[CONSTANTS.MODULE_ID].sort)
				  false;
		context.favSpellsPrepMode = spellPrepModeCount > 0 ? favSpellsPrepMode : false;
		context.favSpells = spellCount > 0 ? favSpells : false;
		context.editable = app.options.editable;
		context.allowCantripToBePreparedOnContext = game.settings.get(
			CONSTANTS.MODULE_ID,
			"allowCantripToBePreparedOnContext"
		);

		await loadTemplates(["modules/tidy5e-sheet/templates/favorites/tidy5e-favorite-item.html"]);
		let favHtml = $(
			await renderTemplate("modules/tidy5e-sheet/templates/favorites/tidy5e-favorite-template.html", context)
		);

		// Activating favorite-list events
		tidy5eContextMenu(favHtml, app);

		// showing item summary
		favHtml.find(".item-name h4").click((event) => app._onItemSummary(event));

		// the rest is only needed if the sheet is editable
		if (app.options.editable) {
			// rolling the item
			favHtml.find(".item-image").click((ev) => app._onItemUse(ev));

			// Item Dragging
			let handler = async (ev) => app._onDragStart(ev);
			favHtml.find(".item").each((i, li) => {
				if (li.classList.contains("items-header")) return;
				li.setAttribute("draggable", true);
				li.addEventListener("dragstart", handler, false);
			});

			// editing the item
			favHtml.find(".item-control.item-edit").click((ev) => {
				let itemId = $(ev.target).parents(".item")[0].dataset.itemId;
				app.actor.items.get(itemId).sheet.render(true);
			});

			// toggle item icon
			favHtml.find(".item-control.item-toggle").click((ev) => {
				ev.preventDefault();
				let itemId = ev.currentTarget.closest(".item").dataset.itemId;
				let item = app.actor.items.get(itemId);
				let attr = item.type === "spell" ? "system.preparation.prepared" : "system.equipped";
				return item.update({ [attr]: !getProperty(item, attr) });
			});

			// update item attunement
			favHtml.find(".item-control.item-attunement").click(async (ev) => {
				ev.preventDefault();
				let itemId = ev.currentTarget.closest(".item").dataset.itemId;
				let item = app.actor.items.get(itemId);

				if (item.system.attunement == 2) {
					app.actor.items.get(itemId).update({ "system.attunement": 1 });
				} else {
					if (app.actor.system.details.attunedItemsCount >= app.actor.system.details.attunedItemsMax) {
						let count = actor.system.details.attunedItemsCount;
						ui.notifications.warn(
							`${game.i18n.format("TIDY5E.AttunementWarning", {
								number: count
							})}`
						);
					} else {
						app.actor.items.get(itemId).update({ "system.attunement": 2 });
					}
				}
			});

			// removing item from favorite list
			favHtml.find(".item-fav").click((ev) => {
				const item_id = ev.currentTarget.closest("[data-item-id]").dataset.itemId;
				const item = app.actor.items.get(item_id);
				if (!item) {
					warn(`tidy5e-favorites | addFavorites | Item no founded!`);
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
			});

			// // changing the charges values (removing if both value and max are 0)
			// favHtml.find(".item input").change((ev) => {
			// 	let itemId = $(ev.target).parents(".item")[0].dataset.itemId;
			// 	let path = ev.target.dataset.path;
			// 	let data = {};
			// 	data[path] = Number(ev.target.value ?? 0);
			// 	app.actor.items.get(itemId).update(data);
			// 	// app.activateFavs = true;
			// });

			// changing the spell slot values and overrides
			favHtml.find(".spell-slots input").change((ev) => {
				let path = ev.target.dataset.target;
				let data = Number(ev.target.value ?? 0);
				app.actor.update({ [path]: data });
			});

			// creating charges for the item
			favHtml.find(".addCharges").click((ev) => {
				let itemId = $(ev.target).parents(".item")[0].dataset.itemId;
				let item = app.actor.items.get(itemId);

				item.system.uses = { value: 1, max: 1 };
				let data = {};
				data["system.uses.value"] = 1;
				data["system.uses.max"] = 1;

				app.actor.items.get(itemId).update(data);
			});

			// charging features
			favHtml.find(".item-recharge").click((ev) => {
				ev.preventDefault();
				let itemId = $(ev.target).parents(".item")[0].dataset.itemId;
				let item = app.actor.items.get(itemId);
				return item.rollRecharge();
			});

			// custom sorting
			favHtml.find(".item").on("drop", (ev) => {
				ev.preventDefault();
				// ev.stopPropagation();

				let dropData = JSON.parse(ev.originalEvent.dataTransfer.getData("text/plain"));
				let item = fromUuidSync(dropData.uuid);
				if (!item || item.actor?.id !== app.actor.id) {
					// only do sorting if the item is from the same actor (not dropped from outside)
					return;
				}
				let itemId = item.id;
				let list = null;
				if (item.type === "feat") {
					list = favFeats;
				} else if (item.type === "spell" && is_real_number(item.system.level)) {
					list = favSpells[item.system.level].spells;
				} else {
					list = favItems;
				}

				let dragSource = list.find((i) => i._id === itemId);
				let siblings = list.filter((i) => i._id !== itemId);
				let targetId = ev.target.closest(".item").dataset.itemId;
				let dragTarget = siblings.find((s) => s._id === targetId);

				debug(
					`tidy5e-favorites | addFavorite | dragSource: ${dragSource} // siblings: ${siblings} // targetID: ${targetId} // dragTarget: ${dragTarget}`
				);
				if (dragTarget === undefined) {
					// catch trying to drag from one list to the other, which is not supported
					debug(
						`tidy5e-favorites | addFavorite | catch trying to drag from one list to the other, which is not supported, folder not supported`
					);
					return;
				}

				// Perform the sort
				const sortUpdates = SortingHelpers.performIntegerSort(dragSource, {
					target: dragTarget,
					siblings: siblings,
					sortKey: "flags.tidy5e-sheet.sort"
				});
				const updateData = sortUpdates.map((u) => {
					const update = u.update;
					update._id = u.target._id;
					return update;
				});

				app.actor.updateEmbeddedDocuments("Item", updateData);
			});
			// TODO why i need this... the html template is wrong ?
			favHtml.find(".item-detail input.uses-max").off("change");
			favHtml
				.find(".item-detail input.uses-max")
				.click((ev) => ev.target.select())
				.change(async (event) => {
					event.preventDefault();
					const itemId = event.currentTarget.closest(".item").dataset.itemId;
					const item = app.actor.items.get(itemId);
					const uses = parseInt(event.target.value ?? item.system.uses.max ?? 0);
					return item.update({ "system.uses.max": uses });
				});
			// TODO why i need this... the html template is wrong ?
			favHtml.find(".item-detail input.uses-value").off("change");
			favHtml
				.find(".item-detail input.uses-value")
				.click((ev) => ev.target.select())
				.change(async (event) => {
					event.preventDefault();
					const itemId = event.currentTarget.closest(".item").dataset.itemId;
					const item = app.actor.items.get(itemId);
					const uses = Math.clamped(0, parseInt(event.target.value), item.system.uses.max);
					event.target.value = uses;
					return item.update({ "system.uses.value": uses });
				});

			favHtml.find(".item-quantity input.item-count").off("change");
			favHtml
				.find(".item-quantity input.item-count")
				.click((ev) => ev.target.select())
				.change(async (event) => {
					event.preventDefault();
					const itemId = event.currentTarget.closest(".item").dataset.itemId;
					const item = app.actor.items.get(itemId);
					const uses = parseInt(event.target.value ?? item.system.quantity);
					event.target.value = uses;
					return item.update({ "system.quantity": uses });
				});
		}

		// adding the html to the appropiate containers
		favContainer.addClass("hasFavs");
		favContent.append(favHtml);
		// attributesTab.prepend(favMarker);
		if (position) {
			html.find(".tab.attributes")?.scrollTop(position.top);
		}
		if (game.settings.get(CONSTANTS.MODULE_ID, "rightClickDisabled")) {
			favContent.find(".items-list").addClass("alt-context");
		}

		tidy5eAmmoSwitch(favHtml, app.actor);
		applyColorPickerCustomization(favHtml);
	}
};
