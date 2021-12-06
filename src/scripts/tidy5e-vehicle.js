import ActorSheet5e from "../../../systems/dnd5e/module/actor/sheets/base.js";
import ActorSheet5eVehicle from "../../../systems/dnd5e/module/actor/sheets/vehicle.js";

import { tidy5eContextMenu } from "./app/context-menu.js";
import { tidy5eListeners } from "./app/listeners.js";
import { tidy5eClassicControls } from "./app/classic-controls.js";
import { tidy5eShowActorArt } from "./app/show-actor-art.js";
import { tidy5eItemCard } from "./app/itemcard.js";

export class Tidy5eVehicle extends ActorSheet5eVehicle {

	static get defaultOptions() {
    let defaultTab = game.settings.get("tidy5e-sheet", "defaultActionsTab") != 'default' ? 'attributes' : 'actions';
		if (!game.modules.get('character-actions-list-5e')?.active) defaultTab = 'description';

	  return mergeObject(super.defaultOptions, {
			classes: ["tidy5e", "sheet", "actor", "vehicle"],
			width: game.settings.get("tidy5e-sheet", "vehicleSheetWidth") ?? 740,
			height: 720,
			tabs: [{navSelector: ".tabs", contentSelector: ".sheet-body", initial: defaultTab}]
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
    if ( !game.user.isGM && this.actor.limited ) return "modules/tidy5e-sheet/templates/actors/tidy5e-vehicle-ltd.html";
    return "modules/tidy5e-sheet/templates/actors/tidy5e-vehicle.html";
  }

	/**
   * Add some extra data when rendering the sheet to reduce the amount of logic required within the template.
   */
  getData() {
    const data = super.getData();

    Object.keys(data.data.abilities).forEach(id => {
    	let Id = id.charAt(0).toUpperCase() + id.slice(1);
      data.data.abilities[id].abbr = game.i18n.localize(`DND5E.Ability${Id}Abbr`);
    });

    return data;
  }

	activateListeners(html) {
		super.activateListeners(html);

		let actor = this.actor;

    tidy5eListeners(html, actor);
    tidy5eContextMenu(html);
		tidy5eShowActorArt(html, actor);
    if(game.settings.get("tidy5e-sheet", "itemCardsForNpcs")) {
      tidy5eItemCard(html, actor);
    }

		// toggle empty traits visibility in the traits list
    html.find('.traits .toggle-traits').click( async (event) => {
      if(actor.getFlag('tidy5e-sheet', 'traitsExpanded')){
        await actor.unsetFlag('tidy5e-sheet', 'traitsExpanded');
      } else {
        await actor.setFlag('tidy5e-sheet', 'traitsExpanded', true);
      }
    });
    
	}

  
	// add actions module
  async _renderInner(...args) {
    const html = await super._renderInner(...args);
		const actionsListApi = game.modules.get('character-actions-list-5e')?.api;
    let injectVehicleSheet;
		if(game.modules.get('character-actions-list-5e')?.active) injectVehicleSheet = game.settings.get('character-actions-list-5e', 'inject-vehicles');
    
    try {
			if(game.modules.get('character-actions-list-5e')?.active && injectVehicleSheet){
        // Update the nav menu
        const actionsTabButton = $('<a class="item" data-tab="actions">' + game.i18n.localize(`DND5E.ActionPl`) + '</a>');
        const tabs = html.find('.tabs[data-group="primary"]');
        tabs.prepend(actionsTabButton);

        // Create the tab
        const sheetBody = html.find('.sheet-body');
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
  if(!actor.getFlag('tidy5e-sheet', 'allow-edit')){
    let itemContainer = html.find('.inventory-list.items-list');
    html.find('.inventory-list .items-header').each(function(){
      if(($(this).next('.item-list').find('li').length - $(this).next('.item-list').find('li.items-footer').length) == 0){
        $(this).next('.item-list').remove();
        $(this).remove();
      }
    });

    html.find('.inventory-list .items-footer').hide();
    html.find('.inventory-list .item-control.item-delete').remove();

    itemContainer.each(function(){
		  if($(this).children().length < 1){
		    $(this).append(`<span class="notice">This section is empty. Unlock the sheet to edit.</span>`)
		  }
    });
  }
}

// handle traits list display
async function toggleTraitsList(app, html, data){
  html.find('.traits:not(.always-visible):not(.expanded) .form-group.inactive').addClass('trait-hidden').hide();
  let visibleTraits = html.find('.traits .form-group:not(.trait-hidden)');
  for (let i = 0; i < visibleTraits.length; i++) {
    if(i % 2 != 0){
      visibleTraits[i].classList.add('even');
    }
  }
}

// Abbreviate Currency
async function abbreviateCurrency(app,html,data) {
	html.find('.currency .currency-item label').each(function(){
		let currency = $(this).data('denom').toUpperCase();
		let abbr = game.i18n.localize(`DND5E.CurrencyAbbr${currency}`);
		$(this).html(abbr);
	});
}

// add sheet classes
async function setSheetClasses(app, html, data){
  if (game.settings.get("tidy5e-sheet", "rightClickDisabled")) {
		if(game.settings.get("tidy5e-sheet", "classicControlsEnabled")){
			html.find('.tidy5e-sheet .grid-layout .items-list').addClass('alt-context');
		} else {
			html.find('.tidy5e-sheet .items-list').addClass('alt-context');
		}
	}
	if (game.settings.get("tidy5e-sheet", "classicControlsEnabled")) {
		tidy5eClassicControls(html);
	}
  if (game.settings.get("tidy5e-sheet", "portraitStyle") == "npc" || game.settings.get("tidy5e-sheet", "portraitStyle") == "all") {
    html.find('.tidy5e-sheet.tidy5e-vehicle .profile').addClass('roundPortrait');
  }
	if (game.settings.get("tidy5e-sheet", "hpOverlayBorderVehicle") > 0) {
		$('.system-dnd5e').get(0).style.setProperty('--vehicle-border', game.settings.get("tidy5e-sheet", "hpOverlayBorderVehicle")+'px');
  } else {
		$('.system-dnd5e').get(0).style.removeProperty('--vehicle-border');
  }
	if (game.settings.get("tidy5e-sheet", "hpOverlayDisabledVehicle")) {
		html.find('.tidy5e-sheet.tidy5e-vehicle .profile').addClass('disable-hp-overlay');
  }
	if (game.settings.get("tidy5e-sheet", "hpBarDisabled")) {
		html.find('.tidy5e-sheet .profile').addClass('disable-hp-bar');
	}
	$('.info-card-hint .key').html(game.settings.get('tidy5e-sheet', 'itemCardsFixKey'));
}

// Register Tidy5e Vehicle Sheet and make default vehicle sheet
Actors.registerSheet("dnd5e", Tidy5eVehicle, {
	types: ["vehicle"],
	makeDefault: true
});


Hooks.on("renderTidy5eVehicle", (app, html, data) => {
  setSheetClasses(app,html,data);
	editProtection(app, html, data);
  toggleTraitsList(app, html, data);
  abbreviateCurrency(app,html,data);
  // console.log(data);
});
