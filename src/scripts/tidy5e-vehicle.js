import { tidy5eContextMenu } from "./app/context-menu.js";
import { tidy5eListeners } from "./app/listeners.js";
import { tidy5eShowActorArt } from "./app/show-actor-art.js";
import { tidy5eItemCard } from "./app/itemcard.js";
import { applyLazyMoney } from "./app/tidy5e-lazy-money.js";
// import { applyLazyExp, applyLazyHp } from "./app/tidy5e-lazy-exp-and-hp.js";
import { applyLocksVehicleSheet } from "./app/lockers.js";
import { applyColorPickerCustomization } from "./app/color-picker.js";
import CONSTANTS from "./app/constants.js";
import { is_real_number } from "./app/helpers.js";

export class Tidy5eVehicle extends dnd5e.applications.actor.ActorSheet5eVehicle {
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
			classes: ["tidy5e", "sheet", "actor", "vehicle"],
			width: game.settings.get(CONSTANTS.MODULE_ID, "vehicleSheetWidth") ?? 740,
			height: 720,
			tabs: [{ navSelector: ".tabs", contentSelector: ".sheet-body", initial: defaultTab }]
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
		if (!game.user.isGM && this.actor.limited) {
			return "modules/tidy5e-sheet/templates/actors/tidy5e-vehicle-ltd.html";
		}
		return "modules/tidy5e-sheet/templates/actors/tidy5e-vehicle.html";
	}

	/**
	 * Add some extra data when rendering the sheet to reduce the amount of logic required within the template.
	 */
	async getData(options) {
		const context = await super.getData(options);

		Object.keys(context.abilities).forEach((id) => {
			context.abilities[id].abbr = CONFIG.DND5E.abilityAbbreviations[id];
		});

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

		return context;
	}

	activateListeners(html) {
		super.activateListeners(html);

		let actor = this.actor;

		tidy5eListeners(html, actor, this);
		tidy5eContextMenu(html, this);
		tidy5eShowActorArt(html, actor);
		if (game.settings.get(CONSTANTS.MODULE_ID, "itemCardsForNpcs")) {
			tidy5eItemCard(html, actor);
		}

		// toggle empty traits visibility in the traits list
		html.find(".traits .toggle-traits").click(async (event) => {
			if (actor.getFlag(CONSTANTS.MODULE_ID, "traitsExpanded")) {
				await actor.unsetFlag(CONSTANTS.MODULE_ID, "traitsExpanded");
			} else {
				await actor.setFlag(CONSTANTS.MODULE_ID, "traitsExpanded", true);
			}
		});

		// TODO in the future
		// Short and Long Rest
		// html.find(".short-rest").click(this._onShortRest.bind(this));
		// html.find(".long-rest").click(this._onLongRest.bind(this));
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
		let injectVehicleSheet;
		if (game.modules.get("character-actions-list-5e")?.active)
			injectVehicleSheet = game.settings.get("character-actions-list-5e", "inject-vehicles");

		try {
			if (game.modules.get("character-actions-list-5e")?.active && injectVehicleSheet) {
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
		} catch (e) {
			// log(true, e);
		}

		return html;
	}
}

// Edit Protection - Hide empty Inventory Sections, add and delete-buttons
async function editProtection(app, html, data) {
	let actor = app.actor;
	if (!actor.getFlag(CONSTANTS.MODULE_ID, "allow-edit")) {
		let itemContainer = html.find(".inventory-list.items-list");
		html.find(".inventory-list .items-header").each(function () {
			if (
				$(this).next(".item-list").find("li").length -
					$(this).next(".item-list").find("li.items-footer").length ==
				0
			) {
				$(this).next(".item-list").remove();
				$(this).remove();
			}
		});

		html.find(".inventory-list .items-footer").hide();
		html.find(".inventory-list .item-control.item-delete").remove();
		html.find(".inventory-list .item-control.item-duplicate").remove();
		html.find(".effects .effect-control.effect-delete").remove();
		html.find(".effects .effect-control.effect-duplicate").remove();

		itemContainer.each(function () {
			if ($(this).children().length < 1) {
				$(this).append(`<span class="notice">This section is empty. Unlock the sheet to edit.</span>`);
			}
		});
	}
}

// handle traits list display
async function toggleTraitsList(app, html, data) {
	html.find(".traits:not(.always-visible):not(.expanded) .form-group.inactive").addClass("trait-hidden").hide();
	let visibleTraits = html.find(".traits .form-group:not(.trait-hidden)");
	for (let i = 0; i < visibleTraits.length; i++) {
		if (i % 2 != 0) {
			visibleTraits[i].classList.add("even");
		}
	}
}

// Abbreviate Currency
async function abbreviateCurrency(app, html, data) {
	html.find(".currency .currency-item label").each(function () {
		let currency = $(this).data("denom").toUpperCase();
		let abbr = game.i18n.localize(`DND5E.CurrencyAbbr${currency}`);
		$(this).html(abbr);
	});
}

// add sheet classes
async function setSheetClasses(app, html, data) {
	if (game.settings.get(CONSTANTS.MODULE_ID, "rightClickDisabled")) {
		if (game.settings.get(CONSTANTS.MODULE_ID, "classicControlsEnabled")) {
			html.find(".tidy5e-sheet.tidy5e-vehicle .grid-layout .items-list").addClass("alt-context");
		} else {
			html.find(".tidy5e-sheet.tidy5e-vehicle .items-list").addClass("alt-context");
		}
	}
	// if (game.settings.get(CONSTANTS.MODULE_ID, "classicControlsEnabled")) {
	// 	tidy5eClassicControls(html);
	// }
	if (!game.settings.get(CONSTANTS.MODULE_ID, "classicControlsEnabled")) {
		html.find(".tidy5e-sheet.tidy5e-vehicle .items-header-controls").remove();
	}
	if (!game.settings.get(CONSTANTS.MODULE_ID, "restingForNpcsEnabled")) {
		html.find(".tidy5e-sheet.tidy5e-vehicle .rest-container").remove();
	}
	if (
		game.settings.get(CONSTANTS.MODULE_ID, "portraitStyle") == "npc" ||
		game.settings.get(CONSTANTS.MODULE_ID, "portraitStyle") == "all"
	) {
		html.find(".tidy5e-sheet.tidy5e-vehicle .profile").addClass("roundPortrait");
	}
	if (game.settings.get(CONSTANTS.MODULE_ID, "hpOverlayBorderVehicle") > 0) {
		$(".system-dnd5e")
			.get(0)
			.style.setProperty(
				"--vehicle-border",
				game.settings.get(CONSTANTS.MODULE_ID, "hpOverlayBorderVehicle") + "px"
			);
	} else {
		$(".system-dnd5e").get(0).style.removeProperty("--vehicle-border");
	}
	if (game.settings.get(CONSTANTS.MODULE_ID, "hpOverlayDisabledVehicle")) {
		html.find(".tidy5e-sheet.tidy5e-vehicle .profile").addClass("disable-hp-overlay");
	}
	if (game.settings.get(CONSTANTS.MODULE_ID, "hpBarDisabled")) {
		html.find(".tidy5e-sheet.tidy5e-vehicle .profile").addClass("disable-hp-bar");
	}

	$(".info-card-hint .key").html(game.settings.get(CONSTANTS.MODULE_ID, "itemCardsFixKey"));

	applyColorPickerCustomization(html);
}

// Register Tidy5e Vehicle Sheet and make default vehicle sheet
Actors.registerSheet("dnd5e", Tidy5eVehicle, {
	types: ["vehicle"],
	makeDefault: true
});

Hooks.on("renderTidy5eVehicle", (app, html, data) => {
	setSheetClasses(app, html, data);
	editProtection(app, html, data);
	toggleTraitsList(app, html, data);
	abbreviateCurrency(app, html, data);
	applyLazyMoney(app, html, data);
	// applyLazyExp(app, html, data);
	// applyLazyHp(app, html, data);

	// NOTE LOCKS ARE THE LAST THING TO SET
	applyLocksVehicleSheet(app, html, data);
});

/** perform some necessary operations on character sheet **/
Hooks.on("renderActorSheet", (app, html, data) => {
	// Temporary Patch for module incompatibility with https://github.com/misthero/dnd5e-custom-skills
	// Issue https://github.com/sdenec/tidy5e-sheet/issues/662
	if (game.modules.get("dnd5e-custom-skills")?.active) {
		html.find(".tidy5e-sheet.tidy5e-vehicle .ability-scores.custom-abilities").removeClass("custom-abilities");
	}
});
