// import { tidy5eSettings } from "./app/settings.js";
import { Tidy5eUserSettings } from "./app/settings.js";

import { preloadTidy5eHandlebarsTemplates } from "./app/tidy5e-templates.js";
import { tidy5eListeners } from "./app/listeners.js";
import { tidy5eContextMenu } from "./app/context-menu.js";
import { tidy5eSearchFilter } from "./app/search-filter.js";
import { addFavorites } from "./app/tidy5e-favorites.js";
import { tidy5eShowActorArt } from "./app/show-actor-art.js";
import { tidy5eItemCard } from "./app/itemcard.js";
import { tidy5eAmmoSwitch } from "./app/ammo-switch.js";
import { applyLazyMoney } from "./app/lazymoney.js";
import { applyLazyExp, applyLazyHp } from "./app/lazyExpAndHp.js";
import { applyLocksCharacterSheet } from "./app/lockers.js";
import { applySpellClassFilterActorSheet } from "./app/spellClassFilter.js";
import { updateExhaustion } from "./app/exhaustion.js";
import { HexToRGBA, colorPicker, mapDefaultColorsRGBA, mapDefaultColorsDarkRGBA, mapDefaultColorsDarkRGB, mapDefaultColorsRGB, applyColorPickerCustomization } from "./app/color-picker.js";
import CONSTANTS from "./app/constants.js";
import { is_real_number } from "./app/helpers.js";
import { debug, error } from "./app/logger-util.js";

let position = 0;

export class Tidy5eSheet extends dnd5e.applications.actor.ActorSheet5eCharacter {
	get template() {
		if (!game.user.isGM && this.actor.limited && !game.settings.get(CONSTANTS.MODULE_ID, "expandedSheetEnabled")) return "modules/tidy5e-sheet/templates/actors/tidy5e-sheet-ltd.html";
		return "modules/tidy5e-sheet/templates/actors/tidy5e-sheet.html";
	}

	static get defaultOptions() {
		let defaultTab = game.settings.get(CONSTANTS.MODULE_ID, "defaultActionsTab") != "default" ? game.settings.get(CONSTANTS.MODULE_ID, "defaultActionsTab") : "attributes";
		if (!game.modules.get("character-actions-list-5e")?.active && game.settings.get(CONSTANTS.MODULE_ID, "defaultActionsTab") == "actions") {
			defaultTab = "attributes";
		}
		return mergeObject(super.defaultOptions, {
			classes: ["tidy5e", "sheet", "actor", "character"],
			blockFavTab: true,
			width: game.settings.get(CONSTANTS.MODULE_ID, "playerSheetWidth") ?? 740,
			height: 840,
			tabs: [
				{
					navSelector: ".tabs",
					contentSelector: ".sheet-body",
					initial: defaultTab,
				},
			],
		});
	}

	/**
	 * Add some extra data when rendering the sheet to reduce the amount of logic required within the template.
	 */
	async getData(options) {
		const context = await super.getData(options);

		Object.keys(context.abilities).forEach((id) => {
			context.abilities[id].abbr = CONFIG.DND5E.abilityAbbreviations[id];
		});

		// Journal HTML enrichment

		context.journalNotes1HTML = await TextEditor.enrichHTML(context.actor.flags[CONSTANTS.MODULE_ID]?.notes1?.value, {
			secrets: this.actor.isOwner,
			rollData: context.rollData,
			async: true,
			relativeTo: this.actor,
		});

		context.journalNotes2HTML = await TextEditor.enrichHTML(context.actor.flags[CONSTANTS.MODULE_ID]?.notes2?.value, {
			secrets: this.actor.isOwner,
			rollData: context.rollData,
			async: true,
			relativeTo: this.actor,
		});

		context.journalNotes3HTML = await TextEditor.enrichHTML(context.actor.flags[CONSTANTS.MODULE_ID]?.notes3?.value, {
			secrets: this.actor.isOwner,
			rollData: context.rollData,
			async: true,
			relativeTo: this.actor,
		});

		context.journalNotes4HTML = await TextEditor.enrichHTML(context.actor.flags[CONSTANTS.MODULE_ID]?.notes4?.value, {
			secrets: this.actor.isOwner,
			rollData: context.rollData,
			async: true,
			relativeTo: this.actor,
		});

		context.journalHTML = await TextEditor.enrichHTML(context.actor.flags[CONSTANTS.MODULE_ID]?.notes?.value, {
			secrets: this.actor.isOwner,
			rollData: context.rollData,
			async: true,
			relativeTo: this.actor,
		});

		context.appId = this.appId;
		context.allowCantripToBePreparedOnContext = game.settings.get(CONSTANTS.MODULE_ID, "allowCantripToBePreparedOnContext");
		context.isGM = game.user.isGM;
		context.allowHpMaxOverride = game.settings.get(CONSTANTS.MODULE_ID, "allowHpMaxOverride");
		context.rightClickDisabled = game.settings.get(CONSTANTS.MODULE_ID, "rightClickDisabled");
		context.classicControlsEnabled = game.settings.get(CONSTANTS.MODULE_ID, "classicControlsEnabled");
		context.classicControlsDisabled = !game.settings.get(CONSTANTS.MODULE_ID, "classicControlsEnabled");
		context.notHideIconsNextToTheItemName = !game.settings.get(CONSTANTS.MODULE_ID, "hideIconsNextToTheItemName");

		context.hpOverlayCalculationCurrent =
		(
			100 /
			(
				(is_real_number(this.actor.system?.attributes?.hp?.max) ? this.actor.system.attributes.hp.max : 1)
				+ (is_real_number(this.actor.system?.attributes?.hp?.tempmax) ? this.actor.system.attributes.hp.tempmax : 0)
			)
		)
		* (is_real_number(this.actor.system?.attributes?.hp?.value) ? this.actor.system.attributes.hp.value : 0)
		+ (is_real_number(this.actor.system?.attributes?.hp?.temp) ? this.actor.system.attributes.hp.temp : 0);

		context.hpOverlayCalculationCurrent = context.hpOverlayCalculationCurrent  + "%";

    context.hpBarCalculationCurrent =
    (
			100 /
			(
				(is_real_number(this.actor.system?.attributes?.hp?.max) ? this.actor.system.attributes.hp.max : 1)
				+ (is_real_number(this.actor.system?.attributes?.hp?.tempmax) ? this.actor.system.attributes.hp.tempmax : 0)
			)
		)
    * (is_real_number(this.actor.system?.attributes?.hp?.value) ? this.actor.system.attributes.hp.value : 0)
		+ (is_real_number(this.actor.system?.attributes?.hp?.temp) ? this.actor.system.attributes.hp.temp : 0);

    context.hpBarCalculationCurrent =  context.hpBarCalculationCurrent + "%";

		const exhaustionTooltipPrefix = `${game.i18n.localize("DND5E.Exhaustion")} ${game.i18n.localize("DND5E.AbbreviationLevel")} ${this.actor.system.attributes.exhaustion}`;
		if (this.actor.system.attributes.exhaustion === 0) {
			context.exhaustionTooltip = exhaustionTooltipPrefix + `, ${game.i18n.localize("TIDY5E.Exhaustion0")}`;
		} else if (this.actor.system.attributes.exhaustion === 1) {
			context.exhaustionTooltip = exhaustionTooltipPrefix + `, ${game.i18n.localize("TIDY5E.Exhaustion1")}`;
		} else if (this.actor.system.attributes.exhaustion === 2) {
			context.exhaustionTooltip = exhaustionTooltipPrefix + `, ${game.i18n.localize("TIDY5E.Exhaustion2")}`;
		} else if (this.actor.system.attributes.exhaustion === 3) {
			context.exhaustionTooltip = exhaustionTooltipPrefix + `, ${game.i18n.localize("TIDY5E.Exhaustion3")}`;
		} else if (this.actor.system.attributes.exhaustion === 4) {
			context.exhaustionTooltip = exhaustionTooltipPrefix + `, ${game.i18n.localize("TIDY5E.Exhaustion4")}`;
		} else if (this.actor.system.attributes.exhaustion === 5) {
			context.exhaustionTooltip = exhaustionTooltipPrefix + `, ${game.i18n.localize("TIDY5E.Exhaustion5")}`;
		} else if (this.actor.system.attributes.exhaustion === 6) {
			context.exhaustionTooltip = exhaustionTooltipPrefix + `, ${game.i18n.localize("TIDY5E.Exhaustion6")}`;
		} else {
			context.exhaustionTooltip = exhaustionTooltipPrefix;
		}

		return context;
	}

	_createEditor(target, editorOptions, initialContent) {
		editorOptions.min_height = 200;
		super._createEditor(target, editorOptions, initialContent);
	}

	// save all simultaneously open editor field when one field is saved
	async _onEditorSave(target, element, content) {
		return this.submit();
	}

	activateListeners(html) {
		super.activateListeners(html);

		let actor = this.actor;

		tidy5eListeners(html, actor, this);
		tidy5eContextMenu(html, this);
		tidy5eSearchFilter(html, actor);
		tidy5eShowActorArt(html, actor);
		tidy5eItemCard(html, actor);
		tidy5eAmmoSwitch(html, actor);

		// store Scroll Pos
		const attributesTab = html.find(".tab.attributes");
		attributesTab.scroll(function () {
			position = this.scrollPos = { top: attributesTab.scrollTop() };
		});
		let tabNav = html.find('a.item:not([data-tab="attributes"])');
		tabNav.click(function () {
			this.scrollPos = { top: 0 };
			attributesTab.scrollTop(0);
		});

		// toggle inventory layout
		html.find(".toggle-layout.inventory-layout").click(async (event) => {
			event.preventDefault();

			if ($(event.currentTarget).hasClass("spellbook-layout")) {
				if (actor.getFlag(CONSTANTS.MODULE_ID, "spellbook-grid")) {
					await actor.unsetFlag(CONSTANTS.MODULE_ID, "spellbook-grid");
				} else {
					await actor.setFlag(CONSTANTS.MODULE_ID, "spellbook-grid", true);
				}
			} else {
				if (actor.getFlag(CONSTANTS.MODULE_ID, "inventory-grid")) {
					await actor.unsetFlag(CONSTANTS.MODULE_ID, "inventory-grid");
				} else {
					await actor.setFlag(CONSTANTS.MODULE_ID, "inventory-grid", true);
				}
			}
		});

		// toggle traits
		html.find(".traits-toggle").click(async (event) => {
			event.preventDefault();

			if (actor.getFlag(CONSTANTS.MODULE_ID, "traits-compressed")) {
				await actor.unsetFlag(CONSTANTS.MODULE_ID, "traits-compressed");
			} else {
				await actor.setFlag(CONSTANTS.MODULE_ID, "traits-compressed", true);
			}
		});

		// set exhaustion level with portrait icon
		html.find(".exhaust-level li").click(async (event) => {
			event.preventDefault();
			let target = event.currentTarget;
			let value = Number(target.dataset.elvl);
			await actor.update({ "system.attributes.exhaustion": value });
			// TODO strange why i did need this ???
			setProperty(actor, "system.attributes.exhaustion", value);
			if (game.settings.get(CONSTANTS.MODULE_ID, "exhaustionEffectsEnabled") != "default") {
				if (actor.constructor.name != "Actor5e") {
					// Only act if we initiated the update ourselves, and the effect is a child of a character
				} else {
					updateExhaustion(actor);
				}
			}
		});

		// changing item qty and charges values (removing if both value and max are 0)
		html.find(".item:not(.items-header) input").change((event) => {
			let value = event.target.value;
			let itemId = $(event.target).parents(".item")[0].dataset.itemId;
			let path = event.target.dataset.path;
			let data = {};
			data[path] = Number(event.target.value);
			actor.items.get(itemId).update(data);
		});

		// creating charges for the item
		html.find(".inventory-list .item .addCharges").click((event) => {
			let itemId = $(event.target).parents(".item")[0].dataset.itemId;
			let item = actor.items.get(itemId);

			item.system.uses = { value: 1, max: 1 };
			let data = {};
			data["system.uses.value"] = 1;
			data["system.uses.max"] = 1;

			actor.items.get(itemId).update(data);
		});

		// toggle empty traits visibility in the traits list
		html.find(".traits .toggle-traits").click(async (event) => {
			if (actor.getFlag(CONSTANTS.MODULE_ID, "traitsExpanded")) {
				await actor.unsetFlag(CONSTANTS.MODULE_ID, "traitsExpanded");
			} else {
				await actor.setFlag(CONSTANTS.MODULE_ID, "traitsExpanded", true);
			}
		});

		// update item attunement

		html.find(".item-control.item-attunement").click(async (event) => {
			event.preventDefault();
			let li = $(event.currentTarget).closest(".item"),
				item = actor.items.get(li.data("item-id")),
				count = actor.system.attributes.attunement.value;

			if (item.system.attunement == 2) {
				actor.items.get(li.data("item-id")).update({ "system.attunement": 1 });
			} else {
				if (count >= actor.system.attributes.attunement.max) {
					ui.notifications.warn(`${game.i18n.format("TIDY5E.AttunementWarning", { number: count })}`);
				} else {
					actor.items.get(li.data("item-id")).update({ "system.attunement": 2 });
				}
			}
		});
	}

	/* -------------------------------------------- */

	/**
	 * Handle duplicate an existing Item entry from the Advancement.
	 * @param {Event} event        The originating click event.
	 * @returns {Promise<Item5e>}  The updated parent Item after the application re-renders.
	 * @protected
	 */
	async _onItemDuplicate(event) {
		event.preventDefault();
		// const uuidToDuplicate = event.currentTarget.closest("[data-item-uuid]")?.dataset.itemUuid;
		const uuidToDuplicate = event.currentTarget.closest("[data-item-id]")?.dataset.itemId;
		if (!uuidToDuplicate) return;
		const item = this.actor.items.get(uuidToDuplicate);
		item.clone({ name: game.i18n.format("DOCUMENT.CopyOf", { name: item.name }) }, { save: true });
	}

	/* -------------------------------------------- */

	// add actions module
	async _renderInner(...args) {
		const html = await super._renderInner(...args);
		const actionsListApi = game.modules.get("character-actions-list-5e")?.api;
		let injectCharacterSheet;
		if (game.modules.get("character-actions-list-5e")?.active) injectCharacterSheet = game.settings.get("character-actions-list-5e", "inject-characters");

		try {
			if (game.modules.get("character-actions-list-5e")?.active && injectCharacterSheet) {
				// Update the nav menu
				const actionsTabButton = $('<a class="item" data-tab="actions">' + game.i18n.localize(`DND5E.ActionPl`) + "</a>");
				const tabs = html.find('.tabs[data-group="primary"]');
				tabs.prepend(actionsTabButton);

				// Create the tab
				const sheetBody = html.find(".sheet-body");
				const actionsTab = $(`<div class="tab actions" data-group="primary" data-tab="actions"></div>`);
				const actionsLayout = $(`<div class="list-layout"></div>`);
				actionsTab.append(actionsLayout);
				sheetBody.prepend(actionsTab);

				// const actionsTab = html.find('.actions-target');

				const actionsTabHtml = $(await actionsListApi.renderActionsList(this.actor));
				actionsLayout.html(actionsTabHtml);
			}
		} catch (e) {
			console.error(e.message);
		}

		return html;
	}
}

// count inventory items
async function countInventoryItems(app, html, data) {
	if (game.user.isGM) {
		html.find(".attuned-items-counter").addClass("isGM");
	}
	html.find(".tab.inventory .item-list").each(function () {
		let itemlist = this;
		let items = $(itemlist).find("li");
		let itemCount = items.length - 1;
		$(itemlist)
			.prev(".items-header")
			.find(".item-name")
			.append(" (" + itemCount + ")");
	});
}

// count attuned items
async function countAttunedItems(app, html, data) {
	const actor = app.actor;
	const count = actor.system.attributes.attunement.value;
	if (actor.system.attributes.attunement.value > actor.system.attributes.attunement.max) {
		html.find(".attuned-items-counter").addClass("overattuned");
		ui.notifications.warn(`${game.i18n.format("TIDY5E.AttunementWarning", { number: count })}`);
	}
}

// handle traits list display
async function toggleTraitsList(app, html, data) {
	html.find(".traits:not(.always-visible):not(.expanded) .form-group.inactive").remove();
}

// Check Death Save Status
async function checkDeathSaveStatus(app, html, data) {
	if (data.editable) {
		// var actor = game.actors.entities.find(a => a._id === data.actor._id);
		let actor = app.actor;
    if(actor.type == "character") {
      var currentHealth = actor.system.attributes.hp.value;
      var deathSaveSuccess = actor.system.attributes.death.success;
      var deathSaveFailure = actor.system.attributes.death.failure;

      debug(`current HP Character : ${currentHealth}, success: ${deathSaveSuccess}, failure: ${deathSaveFailure}`);
      if (currentHealth <= 0) {
        html.find(".tidy5e-sheet .profile").addClass("dead");
      }

      if ((currentHealth > 0 && deathSaveSuccess != 0) || (currentHealth > 0 && deathSaveFailure != 0)) {
        await actor.update({ "system.attributes.death.success": 0 });
        await actor.update({ "system.attributes.death.failure": 0 });
      }
    }
    else if(actor.type == "npc"){
      var currentHealth = actor.system.attributes.hp.value;
      var deathSaveSuccess = actor.flags.tidy5e-sheet.death.success;
      var deathSaveFailure = actor.flags.tidy5e-sheet.death.failure;

      debug(`current HP NPC : ${currentHealth}, success: ${deathSaveSuccess}, failure: ${deathSaveFailure}`);
      if (currentHealth <= 0) {
        html.find(".tidy5e-sheet .profile").addClass("dead");
      }

      if ((currentHealth > 0 && deathSaveSuccess != 0) || (currentHealth > 0 && deathSaveFailure != 0)) {
        await actor.update({ "flags.tidy5e-sheet.death.success": 0 });
        await actor.update({ "flags.tidy5e-sheet.death.failure": 0 });
      }
    }
    else {
      // TODO ADD A WARNING
    }
	}
}

// Edit Protection - Hide empty Inventory Sections, Effects aswell as add and delete-buttons
async function editProtection(app, html, data) {
	let actor = app.actor;
	if (game.user.isGM && game.settings.get(CONSTANTS.MODULE_ID, "editGmAlwaysEnabled")) {
		html.find(".classic-controls").addClass("gmEdit");
	} else if (!actor.getFlag(CONSTANTS.MODULE_ID, "allow-edit")) {
		/* MOVED TO LOCKERS.JS
    if (game.settings.get(CONSTANTS.MODULE_ID, "editTotalLockEnabled")) {
      html.find(".skill input").prop("disabled", true);
      html.find(".skill .config-button").remove();
      // html.find(".skill .proficiency-toggle").remove();
      html.find(".skill .proficiency-toggle").removeClass("proficiency-toggle");
      html.find(".ability-score").prop("disabled", true);
      html.find(".ac-display input").prop("disabled", true);
      html.find(".initiative input").prop("disabled", true);
      html.find(".hp-max").prop("disabled", true);
      html.find(".resource-name input").prop("disabled", true);
      html.find(".res-max").prop("disabled", true);
      html.find(".res-options").remove();
      html.find(".ability-modifiers .proficiency-toggle").remove();
      html.find(".ability .config-button").remove();
      html
        .find(
          ".traits .config-button,.traits .trait-selector,.traits .proficiency-selector"
        )
        .remove();
      html.find("[contenteditable]").prop("contenteditable", false);
      html.find(".spellbook .slot-max-override").remove();
      html.find(".spellcasting-attribute select").prop("disabled", true);
      const spellbook = html.find(
        ".spellbook .inventory-list .item-list"
      ).length;
      if (spellbook == 0) html.find(".item[data-tab='spellbook']").remove();
    }
    */

		let resourcesUsed = 0;
		html.find('.resources input[type="text"]').each(function () {
			if ($(this).val() != "") {
				resourcesUsed++;
			}
		});
		if (resourcesUsed == 0) {
			html.find(".resources").hide();
		}

		let itemContainer = html.find(".inventory-list.items-list, .effects-list.items-list");
		html.find(".inventory-list .items-header:not(.spellbook-header), .effects-list .items-header").each(function () {
			if ($(this).next(".item-list").find("li").length - $(this).next(".item-list").find("li.items-footer").length == 0) {
				$(this).next(".item-list").addClass("hidden").hide();
				$(this).addClass("hidden").hide();
			}
		});

		html.find(".inventory-list .items-footer").addClass("hidden").hide();
		html.find(".inventory-list .item-control.item-delete").remove();
		html.find(".inventory-list .item-control.item-duplicate").remove();
		html.find(".effects .effect-control.effect-delete").remove();
		html.find(".effects .effect-control.effect-duplicate").remove();

		if (game.settings.get(CONSTANTS.MODULE_ID, "editEffectsGmOnlyEnabled") && !game.user.isGM) {
			html.find(".effects-list .items-footer, .effects-list .effect-controls").remove();
		} else {
			html.find(".effects-list .items-footer, .effects-list .effect-control.effect-delete").remove();
		}

		itemContainer.each(function () {
			let hiddenSections = $(this).find("> .hidden").length;
			let totalSections = $(this).children().not(".notice").length;
			// console.log('hidden: '+ hiddenSections + '/ total: '+totalSections);
			if (hiddenSections >= totalSections) {
				if ($(this).hasClass("effects-list") && !game.user.isGM && game.settings.get(CONSTANTS.MODULE_ID, "editEffectsGmOnlyEnabled")) {
					$(this).prepend(`<span class="notice">${game.i18n.localize("TIDY5E.GmOnlyEdit")}</span>`);
				} else {
					$(this).append(`<span class="notice">${game.i18n.localize("TIDY5E.EmptySection")}</span>`);
				}
			}
		});
	} else if (!game.user.isGM && actor.getFlag(CONSTANTS.MODULE_ID, "allow-edit") && game.settings.get(CONSTANTS.MODULE_ID, "editEffectsGmOnlyEnabled")) {
		let itemContainer = html.find(".effects-list.items-list");

		itemContainer.prepend(`<span class="notice">${game.i18n.localize("TIDY5E.GmOnlyEdit")}</span>`);
		html.find(".effects-list .items-footer, .effects-list .effect-controls").remove();

		html.find(".effects-list .items-header").each(function () {
			if ($(this).next(".item-list").find("li").length < 1) {
				$(this).next(".item-list").addClass("hidden").hide();
				$(this).addClass("hidden").hide();
			}
		});
	}
}

// Add Character Class List
async function addClassList(app, html, data) {
	if (data.editable) {
		if (!game.settings.get(CONSTANTS.MODULE_ID, "classListDisabled")) {
			// let actor = game.actors.entities.find(a => a_id === data.actor._id);
			let actor = app.actor;
			let classList = [];
			let items = data.actor.items;
			for (let item of items) {
				if (item.type === "class") {
					let levelsHtml = item.system.levels ? `<span class='levels-info'>${item.system.levels}</span>` : ``;
					classList.push(`<li class='class-item' data-tooltip='${item.name} (${item.system.levels})'>${truncate(item.name, 30, false) + levelsHtml}</li>`);
				}
				if (item.type === "subclass") {
					classList.push(`<li class='class-item' data-tooltip='${item.name}'>${truncate(item.name, 30, false)}</li>`);
				}
			}
			let classListHtml = `<ul class='class-list'>${classList.join("")}</ul>`;

			mergeObject(actor, { "flags.tidy5e-sheet.classlist": classListHtml });
			let classListTarget = html.find(".bonus-information");
			classListTarget.append(classListHtml);
		}

		// Prepare summary

		html.find(".origin-summary span.origin-summary-text").each(function () {
			let originalText = $(this).text();
			$(this).text(truncate($(this).text(), 20, false));
			$(this).attr("data-tooltip", originalText);
		});
		// html.find(".origin-summary input").each(function () {
		// 	let originalText = $(this).text();
		// 	$(this).attr("data-tooltip", originalText);
		// });
	}
}

function truncate( str, n, useWordBoundary ){
	if (str.length <= n) {
		return str;
	}
	const subString = str.slice(0, n-1); // the original check
	return (useWordBoundary
	  ? subString.slice(0, subString.lastIndexOf(" "))
	  : subString) + "..."; // "&hellip;";
};

// Calculate Spell Attack modifier

async function spellAttackMod(app, html, data) {
	let actor = app.actor;
	let prof = actor.system.attributes.prof;
	let spellAbility = html.find(".spellcasting-attribute select option:selected").val();
	let abilityMod = spellAbility != "" ? actor.system.abilities[spellAbility].mod : 0;
	let spellBonus = 0;

	const rollData = actor.getRollData();
	let formula = Roll.replaceFormulaData(actor.system.bonuses.rsak.attack, rollData, { missing: 0, warn: false });
	if (formula === "") {
		formula = "0";
	}
	try {
		// Roll parser no longer accepts some expressions it used to so we will try and avoid using it
		spellBonus = Roll.safeEval(formula);
	} catch (err) {
		// safeEval failed try a roll
		try {
			spellBonus = new Roll(formula).evaluate({ async: false }).total;
		} catch (err) {
			console.error("spell bonus calculation failed");
			console.error(err);
		}
	}

	let spellAttackMod = prof + abilityMod;
	let spellAttackModWihBonus = prof + abilityMod + spellBonus;
	let spellAttackText = spellAttackMod > 0 ? "+" + spellAttackMod : spellAttackMod;
	let spellAttackTextWithBonus = spellAttackModWihBonus > 0 ? "+" + spellAttackModWihBonus : spellAttackModWihBonus;
	let spellAttackTextTooltip = `${prof} (prof.)+${abilityMod} (${spellAbility})`;
	let spellAttackTextTooltipWithBonus = `with bonus ${spellAttackTextWithBonus} = ${prof} (prof.)+${abilityMod} (${spellAbility})+${formula} (bonus 'actor.system.bonuses.rsak.attack')`;

	console.log('Prof: '+prof+ '/ Spell Ability: '+spellAbility+ '/ ability Mod: '+abilityMod+'/ Spell Attack Mod:'+spellAttackMod+'/ Spell Bonus :'+spellBonus);

	html.find(".spell-mod .spell-attack-mod").html(spellAttackText);
	html.find(".spell-mod .spell-attack-mod").attr("data-tooltip", `${spellAttackTextTooltip} [${spellAttackTextTooltipWithBonus}] `);
}

// Abbreviate Currency
async function abbreviateCurrency(app, html, data) {
	html.find(".currency .currency-item label").each(function () {
		let currency = $(this).data("denom").toUpperCase();
		// console.log('Currency Abbr: '+CONFIG.DND5E.currencies[currency].abbreviation);
		// let abbr = CONFIG.DND5E.currencies[currency].abbreviation;
		// if(abbr == CONFIG.DND5E.currencies[currency].abbreviation){
		// 	abbr = currency;
		// }
		let abbr = game.i18n.localize(`DND5E.CurrencyAbbr${currency}`);
		if (abbr == `DND5E.CurrencyAbbr${currency}`) {
			abbr = currency;
		}

		$(this).html(abbr);
	});
}

/**
 *  transform DAE formulas for maxPreparesSpells
 */
async function tidyCustomEffect(actor, changes) {
	const changeMaxPreparedList = changes.find((c) => {
		return c.key === "flags.tidy5e-sheet.maxPreparedSpells";
	});
	if(changeMaxPreparedList){
		if (changeMaxPreparedList.value?.length > 0) {
			let oldValue = getProperty(actor, changeMaxPreparedList.key) || 0;
			let changeMaxPreparedListText = changeMaxPreparedList.value.trim();
			// let op = "none";
			// if (["+", "-", "/", "*", "="].includes(changeMaxPreparedListText[0])) {
			// 	op = changeMaxPreparedListText[0];
			// 	changeMaxPreparedListText = changeMaxPreparedListText.slice(1);
			// }
			let op = changeMaxPreparedList.mode;
			const rollData = actor.getRollData();
			Object.keys(rollData.abilities).forEach((abl) => {
				rollData.abilities[abl].mod = Math.floor((rollData.abilities[abl].value - 10) / 2);
			});
			// const value = new Roll(changeText, rollData).roll().total;
			const roll_value = await new Roll(changeMaxPreparedListText, rollData).roll();
			const value = roll_value.total;
			oldValue = Number.isNumeric(oldValue) ? parseInt(oldValue) : 0;
			if(oldValue != value) {
				switch (op) {
					case CONST.ACTIVE_EFFECT_MODES.ADD: {
						setProperty(actor, changeMaxPreparedList.key, oldValue + value);
						break;
					}
					case CONST.ACTIVE_EFFECT_MODES.DOWNGRADE: {
						setProperty(actor, changeMaxPreparedList.key, oldValue - value);
						break;
					}
					case CONST.ACTIVE_EFFECT_MODES.MULTIPLY: {
						setProperty(actor, changeMaxPreparedList.key, oldValue * value);
						break;
					}
					case CONST.ACTIVE_EFFECT_MODES.UPGRADE: {
						setProperty(actor, changeMaxPreparedList.key, value);
						break;
					}
					case CONST.ACTIVE_EFFECT_MODES.OVERRIDE: {
						//setProperty(actor, changeMaxPreparedList.key, value);
						throw error (`Do not use the mode 'OVERRIDE' when you try to set the Max Prepared Spells`, true);
						break;
					}
					case CONST.ACTIVE_EFFECT_MODES.CUSTOM: {
						setProperty(actor, changeMaxPreparedList.key, value);
						break;
					}
					default: {
						setProperty(actor, changeMaxPreparedList.key, value);
						break;
					}
				}
				await actor.update({
					"flags.tidy5e-sheet.maxPreparedSpells": getProperty(actor, changeMaxPreparedList.key)
				})
				return getProperty(actor, changeMaxPreparedList.key);
			} else {
				return undefined;
			}
		}
	}
}

// add active effects marker
function markActiveEffects(app, html, data) {
	if (game.settings.get(CONSTANTS.MODULE_ID, "activeEffectsMarker")) {
		let actor = app.actor;
		let items = data.actor.items;
		let marker = `<span class="ae-marker" title="Item has active effects">Æ</span>`;
		for (let item of items) {
			// console.log(item);
			if (item.effects.length > 0) {
				// console.log(item);
				let id = item._id;
				// console.log(id);
				html.find(`.item[data-item-id="${id}"] .item-name h4`).append(marker);
			}
		}
	}
}

// Add Spell Slot Marker
function spellSlotMarker(app, html, data) {
	if (game.settings.get(CONSTANTS.MODULE_ID, "hideSpellSlotMarker")) {
		return;
	}
	let actor = app.actor;
	let items = data.actor.items;
	let options = ["pact", "spell1", "spell2", "spell3", "spell4", "spell5", "spell6", "spell7", "spell8", "spell9"];
	for (let o of options) {
		let max = html.find(`.spell-max[data-level=${o}]`);
		let name = max.closest(".spell-slots");
		let spellData = actor.system.spells[o];
		if (spellData.max === 0) {
			continue;
		}
		let contents = ``;
		for (let i = 1; i <= spellData.max; i++) {
			if (i <= spellData.value) {
				contents += `<span class="dot"></span>`;
			} else {
				contents += `<span class="dot empty"></span>`;
			}
		}
		name.before(`<div class="spellSlotMarker">${contents}</div>`);
	}

	html.find(".spellSlotMarker .dot").mouseenter((ev) => {
		const parentEl = ev.currentTarget.parentElement;
		const index = [...parentEl.children].indexOf(ev.currentTarget);
		const dots = parentEl.querySelectorAll(".dot");

		if (ev.currentTarget.classList.contains("empty")) {
			for (let i = 0; i < dots.length; i++) {
				if (i <= index) {
					dots[i].classList.contains("empty") ? dots[i].classList.add("change") : "";
				}
			}
		} else {
			for (let i = 0; i < dots.length; i++) {
				if (i >= index) {
					dots[i].classList.contains("empty") ? "" : dots[i].classList.add("change");
				}
			}
		}
	});

	html.find(".spellSlotMarker .dot").mouseleave((ev) => {
		const parentEl = ev.currentTarget.parentElement;
		$(parentEl).find(".dot").removeClass("change");
	});

	html.find(".spellSlotMarker .dot").click(async (ev) => {
		const index = [...ev.currentTarget.parentElement.children].indexOf(ev.currentTarget);
		const slots = $(ev.currentTarget).parents(".spell-level-slots");
		const spellLevel = slots.find(".spell-max").data("level");
		// console.log(spellLevel, index);
		if (spellLevel) {
			let path = `data.spells.${spellLevel}.value`;
			if (ev.currentTarget.classList.contains("empty")) {
				await actor.update({
					[path]: index + 1,
				});
			} else {
				await actor.update({
					[path]: index,
				});
			}
		}
	});
}

// Hide Standard Encumbrance Bar
function hideStandardEncumbranceBar(app, html, data) {
	if (!game.settings.get(CONSTANTS.MODULE_ID, "hideStandardEncumbranceBar")) {
		return;
	}
	const elements = html.find(".encumbrance");
	if (elements && elements.length > 0) {
		for (const elem of elements) {
			elem.style.display = "none";
		}
	}
}

// Manage Sheet Options
async function setSheetClasses(app, html, data) {
	// let actor = game.actors.entities.find(a => a._id === data.actor._id);
	let actor = app.actor;
	if (!game.settings.get(CONSTANTS.MODULE_ID, "playerNameEnabled")) {
		html.find(".tidy5e-sheet #playerName").remove();
	}
	if (game.settings.get(CONSTANTS.MODULE_ID, "journalTabDisabled")) {
		html.find('.tidy5e-sheet .tidy5e-navigation a[data-tab="journal"]').remove();
	}
	if (game.settings.get(CONSTANTS.MODULE_ID, "rightClickDisabled")) {
		if (game.settings.get(CONSTANTS.MODULE_ID, "classicControlsEnabled")) {
			html.find(".tidy5e-sheet .grid-layout .items-list").addClass("alt-context");
		} else {
			html.find(".tidy5e-sheet .items-list").addClass("alt-context");
		}
	}
	// if (game.settings.get(CONSTANTS.MODULE_ID, "classicControlsEnabled")) {
	//   tidy5eClassicControls(html);
	// }
	if (!game.settings.get(CONSTANTS.MODULE_ID, "classicControlsEnabled")) {
		html.find(".tidy5e-sheet .items-header-controls").remove();
	}
	if (game.settings.get(CONSTANTS.MODULE_ID, "portraitStyle") == "pc" || game.settings.get(CONSTANTS.MODULE_ID, "portraitStyle") == "all") {
		html.find(".tidy5e-sheet .profile").addClass("roundPortrait");
	}
	if (game.settings.get(CONSTANTS.MODULE_ID, "hpOverlayDisabled")) {
		html.find(".tidy5e-sheet .profile").addClass("disable-hp-overlay");
	}
	if (game.settings.get(CONSTANTS.MODULE_ID, "hpBarDisabled")) {
		html.find(".tidy5e-sheet .profile").addClass("disable-hp-bar");
	}
	if (game.settings.get(CONSTANTS.MODULE_ID, "inspirationDisabled")) {
		html.find(".tidy5e-sheet .profile .inspiration").remove();
	}
	if (game.settings.get(CONSTANTS.MODULE_ID, "inspirationAnimationDisabled")) {
		html.find(".tidy5e-sheet .profile .inspiration label i").addClass("disable-animation");
	}
	if (game.settings.get(CONSTANTS.MODULE_ID, "hpOverlayBorder") > 0) {
		$(".system-dnd5e")
			.get(0)
			.style.setProperty("--pc-border", game.settings.get(CONSTANTS.MODULE_ID, "hpOverlayBorder") + "px");
	} else {
		$(".system-dnd5e").get(0).style.removeProperty("--pc-border");
	}
	if (game.settings.get(CONSTANTS.MODULE_ID, "hideIfZero")) {
		html.find(".tidy5e-sheet .profile").addClass("autohide");
	}
	if (game.settings.get(CONSTANTS.MODULE_ID, "exhaustionDisabled")) {
		html.find(".tidy5e-sheet .profile .exhaustion-container").remove();
	}
	if (game.settings.get(CONSTANTS.MODULE_ID, "exhaustionOnHover")) {
		html.find(".tidy5e-sheet .profile").addClass("exhaustionOnHover");
	}

	if (game.settings.get(CONSTANTS.MODULE_ID, "inspirationOnHover")) {
		html.find(".tidy5e-sheet .profile").addClass("inspirationOnHover");
	}
	if (game.settings.get(CONSTANTS.MODULE_ID, "traitsMovedBelowResource")) {
		let altPos = html.find(".alt-trait-pos");
		let traits = html.find(".traits");
		altPos.append(traits);
	}
	if (!game.settings.get(CONSTANTS.MODULE_ID, "traitsTogglePc")) {
		html.find(".tidy5e-sheet .traits").addClass("always-visible");
	}
	if (game.settings.get(CONSTANTS.MODULE_ID, "traitLabelsEnabled")) {
		html.find(".tidy5e-sheet .traits").addClass("show-labels");
	}
	if (game.user.isGM) {
		html.find(".tidy5e-sheet").addClass("isGM");
	}
	if (game.settings.get(CONSTANTS.MODULE_ID, "hiddenDeathSavesEnabled") && !game.user.isGM) {
		html.find(".tidy5e-sheet .death-saves").addClass("gmOnly");
	}
	if (game.settings.get(CONSTANTS.MODULE_ID, "quantityAlwaysShownEnabled")) {
		html.find(".item").addClass("quantityAlwaysShownEnabled");
	}

	$(".info-card-hint .key").html(game.settings.get(CONSTANTS.MODULE_ID, "itemCardsFixKey"));

	applyColorPickerCustomization(html);
}

// Register Tidy5e Sheet and make default character sheet
Actors.registerSheet("dnd5e", Tidy5eSheet, {
	types: ["character"],
	makeDefault: true,
});

// Preload tidy5e Handlebars Templates
Hooks.once("init", () => {
	preloadTidy5eHandlebarsTemplates();
	//
	// init user settings menu
	Tidy5eUserSettings.init();
});
// TODO nos sure if this hook exists anymore ???
Hooks.on("applyActiveEffects", (activeEffect, _config, options) => {
	if (!(activeEffect?.parent instanceof Actor) ||
		!_config.changes
	) {
		return;
	}
	const changes = _config.changes;
	tidyCustomEffect(activeEffect?.parent, changes);
});

/**
 * Handle adding any actor data changes when an active effect is added to an actor
 */
Hooks.on('createActiveEffect', (activeEffect, _config, options) => {
	if (!(activeEffect?.parent instanceof Actor) ||
		!_config.changes
	) {
		return;
	}
	const changes = _config.changes;
	tidyCustomEffect(activeEffect?.parent, changes);
});

/**
 * Handle re-rendering the app if it is open and an update occurs
 */
Hooks.on('updateActiveEffect', (activeEffect, _config, options) => {
	if (!(activeEffect?.parent instanceof Actor) ||
		!_config.changes
	) {
		return;
	}
	const changes = _config.changes;
	tidyCustomEffect(activeEffect?.parent, changes);
});

/**
 * Handle removing any actor data changes when an active effect is deleted from an actor
 */
Hooks.on('deleteActiveEffect', (activeEffect, _config, options) => {
	if (!(activeEffect?.parent instanceof Actor) ||
		!_config.changes
	) {
		return;
	}
	const changes = _config.changes;
	tidyCustomEffect(activeEffect?.parent, changes);
});

Hooks.on("renderTidy5eSheet", (app, html, data) => {
	setSheetClasses(app, html, data);
	editProtection(app, html, data);
	addClassList(app, html, data);
	toggleTraitsList(app, html, data);
	checkDeathSaveStatus(app, html, data);
	abbreviateCurrency(app, html, data);
	spellAttackMod(app, html, data);
	addFavorites(app, html, data, position);
	countAttunedItems(app, html, data);
	countInventoryItems(app, html, data);
	markActiveEffects(app, html, data);
	spellSlotMarker(app, html, data);
	hideStandardEncumbranceBar(app, html, data);
	applyLazyMoney(app, html, data);
	applyLazyExp(app, html, data);
	applyLazyHp(app, html, data);
	applySpellClassFilterActorSheet(app, html, data);
	// console.log(data.actor);
	// console.log("Tidy5e Sheet rendered!");

	// NOTE LOCKS ARE THE LAST THING TO SET
	applyLocksCharacterSheet(app, html, data);
});

/** perform some necessary operations on character sheet **/
Hooks.on("renderActorSheet", (app, html, data) => {
	// Temporary Patch for module incompatibility with https://github.com/misthero/dnd5e-custom-skills
	// Issue https://github.com/sdenec/tidy5e-sheet/issues/662
	if(game.modules.get("dnd5e-custom-skills")?.active) {
		html.find(".tidy5e-sheet .ability-scores.custom-abilities").removeClass("custom-abilities");
	}
});

Hooks.once("ready", (app, html, data) => {
	// console.log("Tidy5e Sheet is ready!");
	/*
	if (!game.modules.get("colorsettings")?.active && game.user?.isGM) {
		let word = "install and activate";
		if (game.modules.get("colorsettings")) word = "activate";
		const errorText = `tidy5e-sheet | Requires the 'colorsettings' module. Please ${word} it.`.replace("<br>", "\n");
		ui.notifications?.error(errorText);
		throw new Error(errorText);
	}
	*/
});

Hooks.on("renderAbilityUseDialog", (application, html, context) => {
	if (application?.item?.type != "spell") {
		return; // Nevermind if this isn't a spell
	}
	if (html.find('[name="consumeSpellSlot"]').length == 0) {
		return;
	}

	// TODO Integration checkbox upcast (ty to mxzf on discord )
	/*
  // Add a new checkbox and insert it at the end of the list
  let new_checkbox = $('<div class="form-group"><label class="checkbox"><input type="checkbox" name="freeUpcast"="">Level Bump</label></div>')
  new_checkbox.insertAfter(html.find('.form-group').last())
  // Bind a change handler to the new checkbox to increment/decrement the options in the dropdown
  // This is so that dnd5e will scale the spell up under the hood as-if it's upcast
  new_checkbox.change(ev => {
    if (ev.target.checked) {
      Object.values(html.find('[name="consumeSpellLevel"] option')).map(o => {
        if (o.value === 'pact') o.value = String(application.item.actor.system.spells.pact.level+1)
        else o.value = String(parseInt(o.value)+1)

      })
    } else {
      Object.values(html.find('[name="consumeSpellLevel"] option')).map(o => {
          if (o.text.includes('Pact')) o.value = 'pact'
          else o.value = String(parseInt(o.value)-1)
      })
    }
  })
  application.setPosition({height:'auto'}) // Reset the height of the window to match the new content
})
  Hooks.on('dnd5e.preItemUsageConsumption', (item,config,options) => {
    // If the checkbox is checked, drop the spell level used to calculate the slot cost by 1
    if (config?.freeUpcast) {
      if (item.system.preparation.mode === 'pact') config.consumeSpellLevel = 'pact'
      else config.consumeSpellLevel = String(parseInt(config.consumeSpellLevel)-1)
    }
  });
  */
	if (
		game.settings.get(CONSTANTS.MODULE_ID, "enableSpellLevelButtons") &&
		// The module already do the job so for avoid redundance...
		!game.modules.get("spell-level-buttons-for-dnd5e")?.active
	) {
		const options = application;

		if ($('.dnd5e.dialog #ability-use-form select[name="consumeSpellLevel"]').length > 0) {
			// If the dialog box has a option to select a spell level

			// Resize the window to fit the contents
			let originalWindowHeight = parseInt($(options._element[0]).css("height"));
			let heightOffset = 42;

			$(options._element[0]).height(originalWindowHeight + heightOffset);

			// Find the label that says "Cast at level", and select it's parent parent (There's no specific class or ID for this wrapper)
			let levelSelectWrapper = $(options._element[0])
				.find(`.form-group label:contains("${game.i18n.localize(`DND5E.SpellCastUpcast`)}")`)
				.parent();
			let selectedLevel = levelSelectWrapper.find("select").val();

			let appId = options.appId;

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
			$(options._element[0])
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
						console.warn(`Cannot find the spell slots on text '${$(this).text()}' with ${/\(\d+\s\w+\)/}`);
					}
					let availableSlotsFounded = availableTextSlotsFounded ? availableTextSlotsFounded[0].match(/\d+/) : undefined;
					if (!availableSlotsFounded) {
						console.warn(`Cannot find the spell slots on text '${$(this).text()}' with ${/\d+/}`);
					}
					let availableSlots = availableSlotsFounded ? availableSlotsFounded[0] : 0;
					let availableSlotsBadge = "";
					let value = $(this).val();
					let i;

					if (value == "pact") {
						// i = "p" + $(this).text().match(/\d/)[0]; // Get the pact slot level
						let availablePactSlotsFounded = $(this).text().match(/\d/);
						if (!availablePactSlotsFounded) {
							console.warn(`Cannot find the pact slots on text '${$(this).text()}' with ${/\d/}`);
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

					$(options._element[0]).find(".spell-lvl-btn .form-fields").append(`
                <label title="${$(this).text()}" class="spell-lvl-btn__label" for="${appId}lvl-btn-${i}">
                    <input type="radio" id="${appId}lvl-btn-${i}" name="lvl-btn" value="${value}">
                    <div class="spell-lvl-btn__btn">${i}</div>
                    ${availableSlotsBadge}
                </label>
            `);
				});

			// Click on the button corresponding to the default value on the cast level dropdown menu
			$(options._element[0]).find(`#${appId}lvl-btn-${selectedLevel}`).trigger("click");

			// Change the dropdown menu value when user clicks on a button
			$(options._element[0])
				.find(".spell-lvl-btn__label")
				.on("click", function () {
					levelSelectWrapper.find("select").val($(this).find("input").val());
				});
		}
	}
});
