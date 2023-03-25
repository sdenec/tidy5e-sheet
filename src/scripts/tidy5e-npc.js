import { preloadTidy5eHandlebarsTemplates } from "./app/tidy5e-npc-templates.js";

import { tidy5eListeners } from "./app/listeners.js";
import { tidy5eContextMenu } from "./app/context-menu.js";
import { tidy5eShowActorArt } from "./app/show-actor-art.js";
import { tidy5eItemCard } from "./app/itemcard.js";
import { tidy5eAmmoSwitch } from "./app/ammo-switch.js";
import { applyLazyMoney } from "./app/tidy5e-lazy-money.js";
// import { applyLazyExp, applyLazyHp } from "./app/tidy5e-lazy-exp-and-hp.js";
import { applyLocksNpcSheet } from "./app/lockers.js";
import { applyColorPickerCustomization } from "./app/color-picker.js";
// import { addFavorites } from "./app/tidy5e-favorites.js";
import { updateExhaustion } from "./app/tidy5e-exhaustion.js";
import CONSTANTS from "./app/constants.js";
import { d20Roll, isLessThanOneIsOne, is_real_number } from "./app/helpers.js";
import LongRestDialog from "./app/tidy5e-npc-long-rest-dialog.js";
import ShortRestDialog from "./app/tidy5e-npc-short-rest-dialog.js";
import { debug, error } from "./app/logger-util.js";

/**
 * An Actor sheet for NPC type characters in the D&D5E system.
 * Extends the base ActorSheet5e class.
 * @type {ActorSheet5eNPC}
 */

let npcScrollPos = 0;

/* handlebars helper function to check if strings are empty */
Handlebars.registerHelper("check", function (value, comparator) {
	return value === comparator ? "No content" : value;
});

export default class Tidy5eNPC extends dnd5e.applications.actor.ActorSheet5eNPC {
	/**
	 * Define default rendering options for the NPC sheet
	 * @return {Object}
	 */
	static get defaultOptions() {
		let defaultTab =
			game.settings.get(CONSTANTS.MODULE_ID, "defaultActionsTab") != "default"
				? game.settings.get(CONSTANTS.MODULE_ID, "defaultActionsTab")
				: "attributes";
		if (
			!game.modules.get("character-actions-list-5e")?.active &&
			game.settings.get(CONSTANTS.MODULE_ID, "defaultActionsTab") == "actions"
		) {
			defaultTab = "attributes";
		}

		return mergeObject(super.defaultOptions, {
			classes: ["tidy5e", "sheet", "actor", "npc"],
			width: game.settings.get(CONSTANTS.MODULE_ID, "npsSheetWidth") ?? 740,
			height: 720,
			tabs: [
				{
					navSelector: ".tabs",
					contentSelector: ".sheet-body",
					initial: defaultTab
				}
			]
		});
	}

	/* -------------------------------------------- */
	/*  Rendering                                   */
	/* -------------------------------------------- */

	/**
	 * Get the correct HTML template path to use for rendering this particular sheet
	 * @type {String}
	 */
	get template() {
		if (!game.user.isGM && this.actor.limited) return "modules/tidy5e-sheet/templates/actors/tidy5e-npc-ltd.html";
		return "modules/tidy5e-sheet/templates/actors/tidy5e-npc.html";
	}

	/* -------------------------------------------- */

	/**
	 * Organize Owned Items for rendering the NPC sheet
	 * @override
	 * @private
	 */
	_prepareItems(context) {
		// super._prepareItems(context);
		// =========================
		// Original system code
		// =========================

		// Categorize Items as Features and Spells
		const features = {
			weapons: {
				label: game.i18n.localize("DND5E.AttackPl"),
				items: [],
				hasActions: true,
				dataset: { type: "weapon", "weapon-type": "natural" }
			},
			actions: {
				label: game.i18n.localize("DND5E.ActionPl"),
				items: [],
				hasActions: true,
				dataset: { type: "feat", "activation.type": "action" }
			},
			passive: { label: game.i18n.localize("DND5E.Features"), items: [], dataset: { type: "feat" } },
			equipment: { label: game.i18n.localize("DND5E.Inventory"), items: [], dataset: { type: "loot" } }
		};

		// Start by classifying items into groups for rendering
		let [spells, other] = context.items.reduce(
			(arr, item) => {
				const { quantity, uses, recharge, target } = item.system;
				const ctx = (context.itemContext[item.id] ??= {});
				ctx.isStack = Number.isNumeric(quantity) && quantity !== 1;
				ctx.hasUses = uses && uses.max > 0;
				ctx.isOnCooldown = recharge && !!recharge.value && recharge.charged === false;
				ctx.isDepleted = item.isOnCooldown && uses.per && uses.value > 0;
				ctx.hasTarget = !!target && !["none", ""].includes(target.type);
				ctx.canToggle = false;
				if (item.type === "spell") arr[0].push(item);
				else arr[1].push(item);
				return arr;
			},
			[[], []]
		);

		// Apply item filters
		spells = this._filterItems(spells, this._filters.spellbook);
		other = this._filterItems(other, this._filters.features);

		// Organize Spellbook
		const spellbook = this._prepareSpellbook(context, spells);

		// Organize Features
		for (let item of other) {
			if (item.type === "weapon") features.weapons.items.push(item);
			else if (item.type === "feat") {
				if (item.system.activation.type) features.actions.items.push(item);
				else features.passive.items.push(item);
			} else features.equipment.items.push(item);
		}

		// Assign and return
		context.inventoryFilters = true;
		// context.features = Object.values(features); // Removed from 4535992
		context.spellbook = spellbook;
		// =========================
		// End original system code
		// =========================

		// Sort others equipements type
		const sortingOrder = {
			equipment: 1,
			consumable: 2
		};

		features.equipment.items.sort((a, b) => {
			if (!a.hasOwnProperty("type") || !b.hasOwnProperty("type")) {
				return 0;
			}
			const first = a["type"].toLowerCase() in sortingOrder ? sortingOrder[a["type"]] : Number.MAX_SAFE_INTEGER;
			const second = b["type"].toLowerCase() in sortingOrder ? sortingOrder[b["type"]] : Number.MAX_SAFE_INTEGER;

			let result = 0;
			if (first < second) {
				result = -1;
			} else if (first > second) {
				result = 1;
			}
			return result;
		});

		context.features = Object.values(features);
	}

	/* -------------------------------------------- */

	/**
	 * A helper method to establish the displayed preparation state for an item
	 * @param {Item} item
	 * @private
	 */
	// TODO to remove with system 2.1.X
	_prepareItemToggleState(item) {
		if (item.type === "spell") {
			const isAlways = getProperty(item.system, "preparation.mode") === "always";
			const isPrepared = getProperty(item.system, "preparation.prepared");
			item.toggleClass = isPrepared ? "active" : "";
			if (isAlways) item.toggleClass = "fixed";
			if (isAlways) item.toggleTitle = CONFIG.DND5E.spellPreparationModes.always;
			else if (isPrepared) item.toggleTitle = CONFIG.DND5E.spellPreparationModes.prepared;
			else item.toggleTitle = game.i18n.localize("DND5E.SpellUnprepared");
		} else {
			const isActive = getProperty(item.system, "equipped");
			item.toggleClass = isActive ? "active" : "";
			item.toggleTitle = game.i18n.localize(isActive ? "DND5E.Equipped" : "DND5E.Unequipped");
		}
	}

	/* -------------------------------------------- */

	/**
	 * Add some extra data when rendering the sheet to reduce the amount of logic required within the template.
	 */
	async getData(options) {
		const context = await super.getData(options);

		Object.keys(context.abilities).forEach((id) => {
			context.abilities[id].abbr = CONFIG.DND5E.abilityAbbreviations[id];
		});

		// Journal HTML enrichment

		context.journalNotes1HTML = await TextEditor.enrichHTML(
			context.actor.flags[CONSTANTS.MODULE_ID]?.notes1?.value,
			{
				secrets: this.actor.isOwner,
				rollData: context.rollData,
				async: true,
				relativeTo: this.actor
			}
		);

		context.journalNotes2HTML = await TextEditor.enrichHTML(
			context.actor.flags[CONSTANTS.MODULE_ID]?.notes2?.value,
			{
				secrets: this.actor.isOwner,
				rollData: context.rollData,
				async: true,
				relativeTo: this.actor
			}
		);

		context.journalNotes3HTML = await TextEditor.enrichHTML(
			context.actor.flags[CONSTANTS.MODULE_ID]?.notes3?.value,
			{
				secrets: this.actor.isOwner,
				rollData: context.rollData,
				async: true,
				relativeTo: this.actor
			}
		);

		context.journalNotes4HTML = await TextEditor.enrichHTML(
			context.actor.flags[CONSTANTS.MODULE_ID]?.notes4?.value,
			{
				secrets: this.actor.isOwner,
				rollData: context.rollData,
				async: true,
				relativeTo: this.actor
			}
		);

		context.journalHTML = await TextEditor.enrichHTML(context.actor.flags[CONSTANTS.MODULE_ID]?.notes?.value, {
			secrets: this.actor.isOwner,
			rollData: context.rollData,
			async: true,
			relativeTo: this.actor
		});

		context.appId = this.appId;
		context.allowCantripToBePreparedOnContext = game.settings.get(
			CONSTANTS.MODULE_ID,
			"allowCantripToBePreparedOnContext"
		);
		context.hideSpellbookTabNpc = game.settings.get(CONSTANTS.MODULE_ID, "hideSpellbookTabNpc");
		context.isGM = game.user.isGM;
		context.allowHpMaxOverride = game.settings.get(CONSTANTS.MODULE_ID, "allowHpMaxOverride");
		context.allowHpConfigOverride = game.settings.get(CONSTANTS.MODULE_ID, "allowHpConfigOverride");
		context.rightClickDisabled = game.settings.get(CONSTANTS.MODULE_ID, "rightClickDisabled");
		context.classicControlsEnabled = game.settings.get(CONSTANTS.MODULE_ID, "classicControlsEnabled");
		context.classicControlsDisabled = !game.settings.get(CONSTANTS.MODULE_ID, "classicControlsEnabled");
		context.notHideIconsNextToTheItemName = !game.settings.get(CONSTANTS.MODULE_ID, "hideIconsNextToTheItemName");

		context.hpOverlayCalculationCurrent =
			(100 /
				((is_real_number(this.actor.system?.attributes?.hp?.max) ? this.actor.system.attributes.hp.max : 1) +
					(is_real_number(this.actor.system?.attributes?.hp?.tempmax)
						? this.actor.system.attributes.hp.tempmax
						: 0))) *
				(is_real_number(this.actor.system?.attributes?.hp?.value) ? this.actor.system.attributes.hp.value : 0) +
			(is_real_number(this.actor.system?.attributes?.hp?.temp) ? this.actor.system.attributes.hp.temp : 0);

		context.hpOverlayCalculationCurrent = context.hpOverlayCalculationCurrent + "%";

		context.hpBarCalculationCurrent =
			(100 /
				((is_real_number(this.actor.system?.attributes?.hp?.max) ? this.actor.system.attributes.hp.max : 1) +
					(is_real_number(this.actor.system?.attributes?.hp?.tempmax)
						? this.actor.system.attributes.hp.tempmax
						: 0))) *
				(is_real_number(this.actor.system?.attributes?.hp?.value) ? this.actor.system.attributes.hp.value : 0) +
			(is_real_number(this.actor.system?.attributes?.hp?.temp) ? this.actor.system.attributes.hp.temp : 0);

		context.hpBarCalculationCurrent = context.hpBarCalculationCurrent + "%";

		if (!is_real_number(this.actor.flags[CONSTANTS.MODULE_ID]?.exhaustion)) {
			setProperty(this.actor, `flags.tidy5e-sheet.exhaustion`, 0);
		}

		const exhaustionTooltipPrefix = `${game.i18n.localize("DND5E.Exhaustion")} ${game.i18n.localize(
			"DND5E.AbbreviationLevel"
		)} ${this.actor.flags[CONSTANTS.MODULE_ID].exhaustion}`;
		if (this.actor.flags[CONSTANTS.MODULE_ID].exhaustion === 0) {
			context.exhaustionTooltip = exhaustionTooltipPrefix + `, ${game.i18n.localize("TIDY5E.Exhaustion0")}`;
		} else if (this.actor.flags[CONSTANTS.MODULE_ID].exhaustion === 1) {
			context.exhaustionTooltip = exhaustionTooltipPrefix + `, ${game.i18n.localize("TIDY5E.Exhaustion1")}`;
		} else if (this.actor.flags[CONSTANTS.MODULE_ID].exhaustion === 2) {
			context.exhaustionTooltip = exhaustionTooltipPrefix + `, ${game.i18n.localize("TIDY5E.Exhaustion2")}`;
		} else if (this.actor.flags[CONSTANTS.MODULE_ID].exhaustion === 3) {
			context.exhaustionTooltip = exhaustionTooltipPrefix + `, ${game.i18n.localize("TIDY5E.Exhaustion3")}`;
		} else if (this.actor.flags[CONSTANTS.MODULE_ID].exhaustion === 4) {
			context.exhaustionTooltip = exhaustionTooltipPrefix + `, ${game.i18n.localize("TIDY5E.Exhaustion4")}`;
		} else if (this.actor.flags[CONSTANTS.MODULE_ID].exhaustion === 5) {
			context.exhaustionTooltip = exhaustionTooltipPrefix + `, ${game.i18n.localize("TIDY5E.Exhaustion5")}`;
		} else if (this.actor.flags[CONSTANTS.MODULE_ID].exhaustion === 6) {
			context.exhaustionTooltip = exhaustionTooltipPrefix + `, ${game.i18n.localize("TIDY5E.Exhaustion6")}`;
		} else {
			context.exhaustionTooltip = exhaustionTooltipPrefix;
		}

		if (!is_real_number(this.actor.flags[CONSTANTS.MODULE_ID]?.death?.success)) {
			setProperty(this.actor, `flags.tidy5e-sheet.death.success`, 0);
		}
		if (!is_real_number(this.actor.flags[CONSTANTS.MODULE_ID]?.death?.failure)) {
			setProperty(this.actor, `flags.tidy5e-sheet.death.failure`, 0);
		}

		return context;
	}

	/* -------------------------------------------- */
	/*  Event Listeners and Handlers                */
	/* -------------------------------------------- */

	/**
	 * Activate event listeners using the prepared sheet HTML
	 * @param html {HTML}   The prepared HTML object ready to be rendered into the DOM
	 */
	activateListeners(html) {
		super.activateListeners(html);

		let actor = this.actor;

		tidy5eListeners(html, actor, this);
		tidy5eContextMenu(html, this);
		tidy5eShowActorArt(html, actor);
		if (game.settings.get(CONSTANTS.MODULE_ID, "itemCardsForNpcs")) {
			tidy5eItemCard(html, actor);
		}
		tidy5eAmmoSwitch(html, actor);

		// calculate average hp on right clicking roll hit dice icon
		html.find(".portrait-hp-formula span.rollable").mousedown(async (event) => {
			switch (event.which) {
				case 3: {
					let formula = actor.system.attributes.hp.formula;
					debug(`tidy5e-npc | activateListeners | formula: ${formula}`);
					let r = new Roll(formula);
					let term = r.terms;
					debug(`tidy5e-npc | activateListeners | term: ${term}`);
					let averageString = "";
					for (let i = 0; i < term.length; i++) {
						let type = term[i].constructor.name;
						switch (type) {
							case "Die": {
								averageString += Math.floor((term[i].faces * term[i].number + term[i].number) / 2);
								break;
							}
							case "OperatorTerm": {
								averageString += term[i].operator;
								break;
							}
							case "NumericTerm": {
								averageString += term[i].number;
								break;
							}
							default: {
								break;
							}
						}
					}
					debug(`tidy5e-npc | activateListeners | averageString: ${averageString}`);
					let average = 0;
					averageString = averageString.replace(/\s/g, "").match(/[+\-]?([0-9\.\s]+)/g) || [];
					while (averageString.length) {
						average += parseFloat(averageString.shift());
					}
					debug(`tidy5e-npc | activateListeners | average: ${average}`);
					let data = {};
					data["system.attributes.hp.value"] = average;
					data["system.attributes.hp.max"] = average;
					actor.update(data);

					break;
				}
			}
		});

		html.find(".toggle-personality-info").click(async (event) => {
			if (actor.getFlag(CONSTANTS.MODULE_ID, "showNpcPersonalityInfo")) {
				await actor.unsetFlag(CONSTANTS.MODULE_ID, "showNpcPersonalityInfo");
			} else {
				await actor.setFlag(CONSTANTS.MODULE_ID, "showNpcPersonalityInfo", true);
			}
		});

		html.find(".rollable[data-action=rollInitiative]").click(function () {
			return actor.rollInitiative({ createCombatants: true });
		});

		// store Scroll Pos
		let attributesTab = html.find(".tab.attributes");
		attributesTab.scroll(function () {
			npcScrollPos = $(this).scrollTop();
		});
		let tabNav = html.find('a.item:not([data-tab="attributes"])');
		tabNav.click(function () {
			npcScrollPos = 0;
			attributesTab.scrollTop(npcScrollPos);
		});

		// Rollable Health Formula
		html.find(".health .rollable").click(this._onRollHealthFormula.bind(this));

		// toggle proficient skill visibility in the skill list
		html.find(".skills-list .toggle-proficient").click(async (event) => {
			if (actor.getFlag(CONSTANTS.MODULE_ID, "npcSkillsExpanded")) {
				await actor.unsetFlag(CONSTANTS.MODULE_ID, "npcSkillsExpanded");
			} else {
				await actor.setFlag(CONSTANTS.MODULE_ID, "npcSkillsExpanded", true);
			}
		});

		// toggle empty traits visibility in the traits list
		html.find(".traits .toggle-traits").click(async (event) => {
			if (actor.getFlag(CONSTANTS.MODULE_ID, "traitsExpanded")) {
				await actor.unsetFlag(CONSTANTS.MODULE_ID, "traitsExpanded");
			} else {
				await actor.setFlag(CONSTANTS.MODULE_ID, "traitsExpanded", true);
			}
		});

		// set exhaustion level with portrait icon
		html.find(".exhaust-level li").click(async (event) => {
			event.preventDefault();
			let target = event.currentTarget;
			let value = Number(target.dataset.elvl);
			await actor.update({ "flags.tidy5e-sheet.exhaustion": value });
			// TODO strange why i did need this ???
			setProperty(actor, "flags.tidy5e-sheet.exhaustion", value);
			if (game.settings.get(CONSTANTS.MODULE_ID, "exhaustionEffectsEnabled") != "default") {
				if (actor.constructor.name != "Actor5e") {
					// Only act if we initiated the update ourselves, and the effect is a child of a character
				} else {
					updateExhaustion(actor, value);
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

		// Quantity and Charges listener
		// TODO why i need this... the html template is wrong ?
		html.find(".item-detail input.uses-max").off("change");
		html.find(".item-detail input.uses-max")
			.click((ev) => ev.target.select())
			.change(_onUsesMaxChange.bind(this));
		// TODO why i need this... the html template is wrong ?
		html.find(".item-detail input.uses-value").off("change");
		html.find(".item-detail input.uses-value")
			.click((ev) => ev.target.select())
			.change(_onUsesChange.bind(this));
		// TODO why i need this... the html template is wrong ?
		html.find(".item-quantity input.item-count").off("change");
		html.find(".item-quantity input.item-count")
			.click((ev) => ev.target.select())
			.change(_onQuantityChange.bind(this));

		// Short and Long Rest
		html.find(".short-rest").click(this._onShortRest.bind(this));
		html.find(".long-rest").click(this._onLongRest.bind(this));
		html.find(".death-save-tidy").click(this._rollDeathSave.bind(this));
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

	/**
	 * Handle rolling NPC health values using the provided formula
	 * @param {Event} event     The original click event
	 * @private
	 */
	async _onRollHealthFormula(event) {
		event.preventDefault();
		const formula = this.actor.system.attributes.hp.formula;
		if (!formula) return;
		// const hp = new Roll(formula).roll().total;
		const roll_hp = await new Roll(formula).roll();
		const hp = roll_hp.total;
		AudioHelper.play({ src: CONFIG.sounds.dice });
		this.actor.update({
			"system.attributes.hp.value": hp,
			"system.attributes.hp.max": hp
		});
	}

	/* -------------------------------------------- */

	/**
	 * Take a short rest, calling the relevant function on the Actor instance
	 * @param {Event} event   The triggering click event
	 * @private
	 */
	async _onShortRest(event) {
		event.preventDefault();
		await this._onSubmit(event);
		if (game.settings.get(CONSTANTS.MODULE_ID, "restingForNpcsChatDisabled")) {
			let obj = {
				dialog: true,
				chat: false
			};
			return this.shortRest(obj);
		}
		return this.shortRest();
	}

	/* -------------------------------------------- */

	/**
	 * Take a long rest, calling the relevant function on the Actor instance
	 * @param {Event} event   The triggering click event
	 * @private
	 */
	async _onLongRest(event) {
		event.preventDefault();
		await this._onSubmit(event);
		if (game.settings.get(CONSTANTS.MODULE_ID, "restingForNpcsChatDisabled")) {
			let obj = {
				dialog: true,
				chat: false
			};
			return this.longRest(obj);
		}
		return this.longRest();
	}

	/* -------------------------------------------- */

	/**
	 * Take a short rest, possibly spending hit dice and recovering resources, item uses, and pact slots.
	 * @param {RestConfiguration} [config]  Configuration options for a short rest.
	 * @returns {Promise<RestResult>}       A Promise which resolves once the short rest workflow has completed.
	 */
	async shortRest(config = {}) {
		config = foundry.utils.mergeObject(
			{
				dialog: true,
				chat: true,
				newDay: false,
				autoHD: false,
				autoHDThreshold: 3
			},
			config
		);

		/**
		 * A hook event that fires before a short rest is started.
		 * @function dnd5e.preShortRest
		 * @memberof hookEvents
		 * @param {Actor5e} actor             The actor that is being rested.
		 * @param {RestConfiguration} config  Configuration options for the rest.
		 * @returns {boolean}                 Explicitly return `false` to prevent the rest from being started.
		 */
		if (Hooks.call("dnd5e.preShortRest", this.actor, config) === false) return;

		// Take note of the initial hit points and number of hit dice the Actor has
		const hd0 = isLessThanOneIsOne(this.actor.system.details.cr); // this.actor.system.attributes.hd;
		const hp0 = this.actor.system.attributes.hp.value;

		// Display a Dialog for rolling hit dice
		if (config.dialog) {
			try {
				config.newDay = await ShortRestDialog.shortRestDialog({ actor: this.actor, canRoll: hd0 > 0 });
			} catch (err) {
				// error(err?.message, true);
				return;
			}
		}

		// Automatically spend hit dice
		else if (config.autoHD) await this.autoSpendHitDice({ threshold: config.autoHDThreshold });

		// Return the rest result
		const dhd = hd0; // this.system.attributes.hd - hd0;
		const dhp = this.actor.system.attributes.hp.value - hp0;
		return this._rest(config.chat, config.newDay, false, dhd, dhp);
	}

	/* -------------------------------------------- */

	/**
	 * Take a long rest, recovering hit points, hit dice, resources, item uses, and spell slots.
	 * @param {RestConfiguration} [config]  Configuration options for a long rest.
	 * @returns {Promise<RestResult>}       A Promise which resolves once the long rest workflow has completed.
	 */
	async longRest(config = {}) {
		config = foundry.utils.mergeObject(
			{
				dialog: true,
				chat: true,
				newDay: true
			},
			config
		);

		/**
		 * A hook event that fires before a long rest is started.
		 * @function dnd5e.preLongRest
		 * @memberof hookEvents
		 * @param {Actor5e} actor             The actor that is being rested.
		 * @param {RestConfiguration} config  Configuration options for the rest.
		 * @returns {boolean}                 Explicitly return `false` to prevent the rest from being started.
		 */
		if (Hooks.call("dnd5e.preLongRest", this.actor, config) === false) return;

		if (config.dialog) {
			try {
				config.newDay = await LongRestDialog.longRestDialog({ actor: this.actor });
			} catch (err) {
				// error(err?.message, true);
				return;
			}
		}

		return this._rest(config.chat, config.newDay, true);
	}

	/* -------------------------------------------- */

	/**
	 * Perform all of the changes needed for a short or long rest.
	 *
	 * @param {boolean} chat           Summarize the results of the rest workflow as a chat message.
	 * @param {boolean} newDay         Has a new day occurred during this rest?
	 * @param {boolean} longRest       Is this a long rest?
	 * @param {number} [dhd=0]         Number of hit dice spent during so far during the rest.
	 * @param {number} [dhp=0]         Number of hit points recovered so far during the rest.
	 * @returns {Promise<RestResult>}  Consolidated results of the rest workflow.
	 * @private
	 */
	async _rest(chat, newDay, longRest, dhd = 0, dhp = 0) {
		// Recover hit points & hit dice on long rest
		if (longRest || newDay) {
			this.actor.update({ "system.attributes.hp.value": Number(this.actor.system.attributes.hp.max ?? 0) });
			// Patch for NPC
			if (this.actor.flags[CONSTANTS.MODULE_ID].exhaustion > 0) {
				const exhaustion = this.actor.flags[CONSTANTS.MODULE_ID].exhaustion;
				debug("tidy5e-npc | _rest | exhaustion = " + exhaustion);
				await this.actor.update({ "flags.tidy5e-sheet.exhaustion": exhaustion - 1 });
				await updateExhaustion(this.actor);
			}
		} else {
			const rollData = this.actor.getRollData();
			const roll_value = await new Roll(isLessThanOneIsOne(dhd) + "d6", rollData).roll();
			const value = roll_value.total;
			let newHpValue = this.actor.system.attributes.hp.value + Number(value ?? 0);
			if (newHpValue > this.actor.system.attributes.hp.max) {
				newHpValue = this.actor.system.attributes.hp.max;
			}
			await this.actor.update({ "system.attributes.hp.value": newHpValue });
		}
		// TODO for some reason doen't work...i copy and paste the code from the system
		// return this.actor._rest(chat, newDay, longRest, dhd, dhp);
		let hitPointsRecovered = 0;
		let hitPointUpdates = {};
		let hitDiceRecovered = 0;
		let hitDiceUpdates = [];
		const rolls = [];

		// Recover hit points & hit dice on long rest
		if (longRest) {
			({ updates: hitPointUpdates, hitPointsRecovered } = this.actor._getRestHitPointRecovery());
			({ updates: hitDiceUpdates, hitDiceRecovered } = this.actor._getRestHitDiceRecovery());
		}

		// Figure out the rest of the changes
		const result = {
			dhd: dhd + hitDiceRecovered,
			dhp: dhp + hitPointsRecovered,
			updateData: {
				...hitPointUpdates,
				...this.actor._getRestResourceRecovery({
					recoverShortRestResources: !longRest,
					recoverLongRestResources: longRest
				}),
				...this.actor._getRestSpellRecovery({ recoverSpells: longRest })
			},
			updateItems: [
				...hitDiceUpdates,
				...(await this.actor._getRestItemUsesRecovery({
					recoverLongRestUses: longRest,
					recoverDailyUses: newDay,
					rolls
				}))
			],
			longRest,
			newDay
		};
		result.rolls = rolls;

		/**
		 * A hook event that fires after rest result is calculated, but before any updates are performed.
		 * @function dnd5e.preRestCompleted
		 * @memberof hookEvents
		 * @param {Actor5e} actor      The actor that is being rested.
		 * @param {RestResult} result  Details on the rest to be completed.
		 * @returns {boolean}          Explicitly return `false` to prevent the rest updates from being performed.
		 */
		if (Hooks.call("dnd5e.preRestCompleted", this.actor, result) === false) return result;

		// Perform updates
		await this.actor.update(result.updateData);
		await this.actor.updateEmbeddedDocuments("Item", result.updateItems);

		// Display a Chat Message summarizing the rest effects
		if (chat) await this.actor._displayRestResultMessage(result, longRest);

		/**
		 * A hook event that fires when the rest process is completed for an actor.
		 * @function dnd5e.restCompleted
		 * @memberof hookEvents
		 * @param {Actor5e} actor      The actor that just completed resting.
		 * @param {RestResult} result  Details on the rest completed.
		 */
		Hooks.callAll("dnd5e.restCompleted", this.actor, result);

		// Return data summarizing the rest effects
		return result;
	}

	/* -------------------------------------------- */

	/**
	 * Perform a death saving throw, rolling a d20 plus any global save bonuses
	 * @param {object} options          Additional options which modify the roll
	 * @returns {Promise<D20Roll|null>} A Promise which resolves to the Roll instance
	 */
	async _rollDeathSave(options = {}) {
		const death = this.actor.flags[CONSTANTS.MODULE_ID].death ?? {};

		// Display a warning if we are not at zero HP or if we already have reached 3
		if (this.actor.system.attributes.hp.value > 0 || death.failure >= 3 || death.success >= 3) {
			ui.notifications.warn(game.i18n.localize("DND5E.DeathSaveUnnecessary"));
			return null;
		}

		// Evaluate a global saving throw bonus
		const speaker = options.speaker || ChatMessage.getSpeaker({ actor: this });
		const globalBonuses = this.actor.system.bonuses?.abilities ?? {};
		const parts = [];
		const data = this.actor.getRollData();

		// Diamond Soul adds proficiency
		if (this.actor.getFlag("dnd5e", "diamondSoul")) {
			parts.push("@prof");
			data.prof = new Proficiency(this.actor.system.attributes.prof, 1).term;
		}

		// Include a global actor ability save bonus
		if (globalBonuses.save) {
			parts.push("@saveBonus");
			data.saveBonus = Roll.replaceFormulaData(globalBonuses.save, data);
		}

		// Evaluate the roll
		const flavor = game.i18n.localize("DND5E.DeathSavingThrow");
		const rollData = foundry.utils.mergeObject(
			{
				data,
				title: `${flavor}: ${this.actor.name}`,
				flavor,
				halflingLucky: this.actor.getFlag("dnd5e", "halflingLucky"),
				targetValue: 10,
				messageData: {
					speaker: speaker,
					"flags.dnd5e.roll": { type: "death" }
				}
			},
			options
		);
		rollData.parts = parts.concat(options.parts ?? []);

		const roll = await d20Roll(rollData);
		if (!roll) return null;

		// Take action depending on the result
		const details = {};

		// Save success
		if (roll.total >= (roll.options.targetValue ?? 10)) {
			let successes = (death.success || 0) + 1;

			// Critical Success = revive with 1hp
			if (roll.isCritical) {
				details.updates = {
					"flags.tidy5e-sheet.death.success": 0,
					"flags.tidy5e-sheet.death.failure": 0,
					"system.attributes.hp.value": 1
				};
				details.chatString = "DND5E.DeathSaveCriticalSuccess";
			}

			// 3 Successes = survive and reset checks
			else if (successes === 3) {
				details.updates = {
					"flags.tidy5e-sheet.death.success": 0,
					"flags.tidy5e-sheet.death.failure": 0
				};
				details.chatString = "DND5E.DeathSaveSuccess";
			}

			// Increment successes
			else details.updates = { "flags.tidy5e-sheet.death.success": Math.clamped(successes, 0, 3) };
		}

		// Save failure
		else {
			let failures = (death.failure || 0) + (roll.isFumble ? 2 : 1);
			details.updates = { "flags.tidy5e-sheet.death.failure": Math.clamped(failures, 0, 3) };
			if (failures >= 3) {
				// 3 Failures = death
				details.chatString = "DND5E.DeathSaveFailure";
			}
		}

		if (!foundry.utils.isEmpty(details.updates)) await this.actor.update(details.updates);

		// Display success/failure chat message
		if (details.chatString) {
			let chatData = { content: game.i18n.format(details.chatString, { name: this.actor.name }), speaker };
			ChatMessage.applyRollMode(chatData, roll.options.rollMode);
			await ChatMessage.create(chatData);
		}

		// Return the rolled result
		return roll;
	}

	/* -------------------------------------------- */

	// add actions module
	async _renderInner(...args) {
		const html = await super._renderInner(...args);
		const actionsListApi = game.modules.get("character-actions-list-5e")?.api;
		let injectNPCSheet;
		if (game.modules.get("character-actions-list-5e")?.active) {
			injectNPCSheet = game.settings.get("character-actions-list-5e", "inject-npcs");
		}
		try {
			if (game.modules.get("character-actions-list-5e")?.active && injectNPCSheet) {
				// Update the nav menu
				const actionsTabButton = $(
					'<a class="item" data-tab="actions">' + game.i18n.localize(`DND5E.ActionPl`) + "</a>"
				);
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
		} catch (err) {
			error(err?.message, true);
		}

		return html;
	}
}

// restore scroll position
async function restoreScrollPosition(app, html, data) {
	html.find(".tab.attributes").scrollTop(npcScrollPos);
	// $('.tab.attributes').scrollTop(npcScrollPos);
}

// handle skills list display
async function toggleSkillList(app, html, data) {
	html.find(".skills-list:not(.always-visible):not(.expanded) .skill:not(.proficient)").remove();
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

		var currentHealth = actor.system.attributes.hp.value;
		var deathSaveSuccess = actor.flags[CONSTANTS.MODULE_ID].death.success;
		var deathSaveFailure = actor.flags[CONSTANTS.MODULE_ID].death.failure;

		debug(
			`tidy5e-npc | checkDeathSaveStatus | current HP NPC : ${currentHealth}, success: ${deathSaveSuccess}, failure: ${deathSaveFailure}`
		);
		if (currentHealth <= 0) {
			html.find(".tidy5e-sheet.tidy5e-npc .profile").addClass("dead");
		}

		if ((currentHealth > 0 && deathSaveSuccess != 0) || (currentHealth > 0 && deathSaveFailure != 0)) {
			await actor.update({ "flags.tidy5e-sheet.death.success": 0 });
			await actor.update({ "flags.tidy5e-sheet.death.failure": 0 });
		}
	}
}

// toggle item icon
async function toggleItemMode(app, html, data) {
	html.find(".item-toggle").click((ev) => {
		ev.preventDefault();
		let itemId = ev.currentTarget.closest(".item").dataset.itemId;
		let item = app.actor.items.get(itemId);
		debug(`tidy5e-npc | toggleItemMode | item.type: ${item.type}`);
		let attr = item.type === "spell" ? "system.preparation.prepared" : "system.equipped";
		if (item.type !== "feat") {
			return item.update({ [attr]: !foundry.utils.getProperty(item, attr) });
		}
	});
}

// restore scroll position
async function resetTempHp(app, html, data) {
	let actor = app.actor;
	if (data.editable && !actor.compendium) {
		let temp = actor.system.attributes.hp.temp,
			tempmax = actor.system.attributes.hp.tempmax;

		if (temp == 0) {
			actor.update({ "system.attributes.hp.temp": null });
		}
		if (tempmax == 0) {
			actor.update({ "system.attributes.hp.tempmax": null });
		}
	}
}

// Set Sheet Classes
async function setSheetClasses(app, html, data) {
	const { token } = app;
	const actor = app.actor;
	if (actor.getFlag(CONSTANTS.MODULE_ID, "showNpcPersonalityInfo")) {
		html.find(".tidy5e-sheet.tidy5e-npc .left-notes").removeClass("hidden");
	}
	if (game.settings.get(CONSTANTS.MODULE_ID, "journalTabNPCDisabled")) {
		html.find('.tidy5e-sheet.tidy5e-npc .tidy5e-navigation a[data-tab="journal"]').remove();
	}
	if (game.settings.get(CONSTANTS.MODULE_ID, "rightClickDisabled")) {
		if (game.settings.get(CONSTANTS.MODULE_ID, "classicControlsEnabled")) {
			html.find(".tidy5e-sheet.tidy5e-npc .grid-layout .items-list").addClass("alt-context");
		} else {
			html.find(".tidy5e-sheet.tidy5e-npc .items-list").addClass("alt-context");
		}
	}
	// if (game.settings.get(CONSTANTS.MODULE_ID, "classicControlsEnabled")) {
	//   tidy5eClassicControls(html);
	// }
	if (!game.settings.get(CONSTANTS.MODULE_ID, "classicControlsEnabled")) {
		html.find(".tidy5e-sheet.tidy5e-npc .items-header-controls").remove();
	}
	if (game.settings.get(CONSTANTS.MODULE_ID, "traitsMovedBelowResourceNpc")) {
		let altPos = html.find(".alt-trait-pos");
		let traits = html.find(".traits");
		altPos.append(traits);
	}
	if (!game.settings.get(CONSTANTS.MODULE_ID, "restingForNpcsEnabled")) {
		html.find(".tidy5e-sheet.tidy5e-npc .rest-container").remove();
	}
	if (
		game.settings.get(CONSTANTS.MODULE_ID, "portraitStyle") == "npc" ||
		game.settings.get(CONSTANTS.MODULE_ID, "portraitStyle") == "all"
	) {
		html.find(".tidy5e-sheet.tidy5e-npc .profile").addClass("roundPortrait");
	}
	if (game.settings.get(CONSTANTS.MODULE_ID, "hpOverlayDisabledNpc")) {
		html.find(".tidy5e-sheet.tidy5e-npc .profile").addClass("disable-hp-overlay");
	}
	if (game.settings.get(CONSTANTS.MODULE_ID, "hpBarDisabled")) {
		html.find(".tidy5e-sheet.tidy5e-npc .profile").addClass("disable-hp-bar");
	}
	if (game.settings.get(CONSTANTS.MODULE_ID, "hpOverlayBorderNpc") > 0) {
		$(".system-dnd5e")
			.get(0)
			.style.setProperty("--npc-border", game.settings.get(CONSTANTS.MODULE_ID, "hpOverlayBorderNpc") + "px");
	} else {
		$(".system-dnd5e").get(0).style.removeProperty("--npc-border");
	}
	if (game.settings.get(CONSTANTS.MODULE_ID, "traitsAlwaysShownNpc")) {
		html.find(".tidy5e-sheet.tidy5e-npc .traits").addClass("always-visible");
	}
	if (game.settings.get(CONSTANTS.MODULE_ID, "traitLabelsEnabled")) {
		html.find(".tidy5e-sheet.tidy5e-npc .traits").addClass("show-labels");
	}
	if (game.settings.get(CONSTANTS.MODULE_ID, "skillsAlwaysShownNpc")) {
		html.find(".tidy5e-sheet.tidy5e-npc .skills-list").addClass("always-visible");
	}
	if (
		token &&
		token.actor.prototypeToken.actorLink &&
		game.settings.get(CONSTANTS.MODULE_ID, "linkMarkerNpc") == "both"
	) {
		html.find(".tidy5e-sheet.tidy5e-npc").addClass("linked");
	}
	if (
		token &&
		!token.actor.prototypeToken.actorLink &&
		(game.settings.get(CONSTANTS.MODULE_ID, "linkMarkerNpc") == "unlinked" ||
			game.settings.get(CONSTANTS.MODULE_ID, "linkMarkerNpc") == "both")
	) {
		html.find(".tidy5e-sheet.tidy5e-npc").addClass("unlinked");
	}
	if (
		!token &&
		(game.settings.get(CONSTANTS.MODULE_ID, "linkMarkerNpc") == "unlinked" ||
			game.settings.get(CONSTANTS.MODULE_ID, "linkMarkerNpc") == "both")
	) {
		html.find(".tidy5e-sheet.tidy5e-npc").addClass("original");
	}
	if (game.settings.get(CONSTANTS.MODULE_ID, "exhaustionDisabled")) {
		html.find(".tidy5e-sheet.tidy5e-npc .profile .exhaustion-container").remove();
	}
	if (game.settings.get(CONSTANTS.MODULE_ID, "exhaustionOnHover")) {
		html.find(".tidy5e-sheet.tidy5e-npc .profile").addClass("exhaustionOnHover");
	}
	if (game.settings.get(CONSTANTS.MODULE_ID, "hiddenDeathSavesEnabled") && !game.user.isGM) {
		html.find(".tidy5e-sheet.tidy5e-npc .death-saves").addClass("gmOnly");
	}

	$(".info-card-hint .key").html(game.settings.get(CONSTANTS.MODULE_ID, "itemCardsFixKey"));

	applyColorPickerCustomization(html);
}

// Abbreviate Currency
async function abbreviateCurrency(app, html, data) {
	html.find(".currency .currency-item label").each(function () {
		let currency = $(this).data("denom").toUpperCase();
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

// Hide empty Spellbook
async function hideSpellbook(app, html, data) {
	let spellbook = html.find(".spellbook-footer");

	if (spellbook.hasClass("spellbook-empty")) {
		html.find(".spellbook-title").addClass("toggle-spellbook");
		// html.find('.spellbook-title .fa-caret-down').show();
		// html.find('.spellbook-title .fa-caret-up').hide();
		html.find(".spellbook-title + .list-layout").hide();
		html.find(".spellcasting-ability").hide();

		$(".toggle-spellbook").on("click", function () {
			html.find(".spellbook-title").toggleClass("show");
			// html.find('.spellbook-title .fa-caret-down').toggle();
			// html.find('.spellbook-title .fa-caret-up').toggle();
			html.find(".spellbook-title + .list-layout").toggle();
			html.find(".spellcasting-ability").toggle();
		});
	}
}

// Edit Protection - Hide empty Inventory Sections, add and delete-buttons
async function editProtection(app, html, data) {
	let actor = app.actor;
	if (!actor.getFlag(CONSTANTS.MODULE_ID, "allow-edit")) {
		// CODE "editTotalLockEnabled" MOVED TO LOCKERS.JS

		let itemContainer = html.find(".inventory-list:not(.spellbook-list).items-list");
		html.find(".inventory-list:not(.spellbook-list) .items-header").each(function () {
			if (
				$(this).next(".item-list").find("li").length -
					$(this).next(".item-list").find("li.items-footer").length ==
				0
			) {
				$(this).next(".item-list").addClass("hidden").hide();
				$(this).addClass("hidden").hide();
			}
		});

		html.find(".inventory-list .items-footer").addClass("hidden").hide();
		html.find(".inventory-list .item-control.item-delete").remove();
		html.find(".inventory-list .item-control.item-duplicate").remove();
		html.find(".effects .effect-control.effect-delete").remove();
		html.find(".effects .effect-control.effect-duplicate").remove();

		let actor = app.actor,
			legAct = actor.system.resources.legact.max,
			legRes = actor.system.resources.legres.max,
			lair = actor.system.resources.lair.value;

		if (!lair && legAct < 1 && legRes < 1) {
			html.find(".counters").addClass("hidden").hide();
		}

		if (itemContainer.children().length < 1) {
			itemContainer.append(`<span class="notice">This section is empty. Unlock the sheet to edit.</span>`);
		}
	}
}

// add fav button for npc-favorites
async function npcFavorites(app, html, data) {
	// TODO intgrate favorite mechanism for NPC too ?
	// Issue https://github.com/sdenec/tidy5e-sheet/issues/539
	// for now is beeter use other external module
	// addFavorites(app, html, data);
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
		debug(`tidy5e-npc | spellSlotMarker | spellLevel: ${spellLevel}, index: ${index}`);
		if (spellLevel) {
			let path = `data.spells.${spellLevel}.value`;
			if (ev.currentTarget.classList.contains("empty")) {
				await actor.update({
					[path]: index + 1
				});
			} else {
				await actor.update({
					[path]: index
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

/* -------------------------------------------- */

/**
 * Change the uses amount of an Owned Item within the Actor.
 * @param {Event} event        The triggering click event.
 * @returns {Promise<Item5e>}  Updated item.
 * @private
 */
async function _onUsesChange(event) {
	event.preventDefault();
	const itemId = event.currentTarget.closest(".item").dataset.itemId;
	const item = this.actor.items.get(itemId);
	const uses = Math.clamped(0, parseInt(event.target.value), item.system.uses.max);
	event.target.value = uses;
	return item.update({ "system.uses.value": uses });
}

/* -------------------------------------------- */

/**
 * Change the uses amount of an Owned Item within the Actor.
 * @param {Event} event        The triggering click event.
 * @returns {Promise<Item5e>}  Updated item.
 * @private
 */
async function _onUsesMaxChange(event) {
	event.preventDefault();
	const itemId = event.currentTarget.closest(".item").dataset.itemId;
	const item = this.actor.items.get(itemId);
	// const uses = Math.clamped(0, parseInt(event.target.value), ;
	// event.target.value = uses;
	const uses = parseInt(event.target.value ?? item.system.uses.max ?? 0);
	return item.update({ "system.uses.max": uses });
}

/* -------------------------------------------- */

/**
 * Change the quantity amount of an Owned Item within the Actor.
 * @param {Event} event        The triggering click event.
 * @returns {Promise<Item5e>}  Updated item.
 * @private
 */
async function _onQuantityChange(event) {
	event.preventDefault();
	const itemId = event.currentTarget.closest(".item").dataset.itemId;
	const item = this.actor.items.get(itemId);
	const uses = parseInt(event.target.value ?? item.system.quantity);
	event.target.value = uses;
	return item.update({ "system.quantity": uses });
}

/* -------------------------------------------- */

Actors.registerSheet("dnd5e", Tidy5eNPC, {
	types: ["npc"],
	makeDefault: true
});

Hooks.once("init", () => {
	preloadTidy5eHandlebarsTemplates();
});

Hooks.once("ready", () => {
	// can be removed when 0.7.x is stable
	// if (window.BetterRolls) {
	//   window.BetterRolls.hooks.addActorSheet("Tidy5eNPC");
	// }
});

Hooks.on("renderTidy5eNPC", (app, html, data) => {
	setSheetClasses(app, html, data);
	toggleSkillList(app, html, data);
	toggleTraitsList(app, html, data);
	checkDeathSaveStatus(app, html, data);
	toggleItemMode(app, html, data);
	restoreScrollPosition(app, html, data);
	abbreviateCurrency(app, html, data);
	hideSpellbook(app, html, data);
	resetTempHp(app, html, data);
	editProtection(app, html, data);
	npcFavorites(app, html, data);
	spellSlotMarker(app, html, data);
	hideStandardEncumbranceBar(app, html, data);
	applyLazyMoney(app, html, data);
	// applyLazyExp(app, html, data);
	// applyLazyHp(app, html, data);

	// NOTE LOCKS ARE THE LAST THING TO SET
	applyLocksNpcSheet(app, html, data);
});

/** perform some necessary operations on character sheet **/
Hooks.on("renderActorSheet", (app, html, data) => {
	// Temporary Patch for module incompatibility with https://github.com/misthero/dnd5e-custom-skills
	// Issue https://github.com/sdenec/tidy5e-sheet/issues/662
	if (game.modules.get("dnd5e-custom-skills")?.active) {
		html.find(".tidy5e-sheet.tidy5e-npc .ability-scores.custom-abilities").removeClass("custom-abilities");
	}
});
