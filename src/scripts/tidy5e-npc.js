import ActorSheet5e from "../../../systems/dnd5e/module/actor/sheets/base.js";
import ActorSheet5eNPC from "../../../systems/dnd5e/module/actor/sheets/npc.js";
import { preloadTidy5eHandlebarsTemplates } from "./app/tidy5e-npc-templates.js";

import { tidy5eListeners } from "./app/listeners.js";
import { tidy5eContextMenu } from "./app/context-menu.js";
import { tidy5eClassicControls } from "./app/classic-controls.js";
import { tidy5eShowActorArt } from "./app/show-actor-art.js";
import { tidy5eItemCard } from "./app/itemcard.js";
import { tidy5eAmmoSwitch } from "./app/ammo-switch.js";


/**
 * An Actor sheet for NPC type characters in the D&D5E system.
 * Extends the base ActorSheet5e class.
 * @type {ActorSheet5eNPC}
 */

let npcScrollPos = 0;

/* handlebars helper funtion to check if strings are empty */
Handlebars.registerHelper('check', function(value, comparator) {
  return (value === comparator) ? 'No content' : value;
});

export default class Tidy5eNPC extends ActorSheet5eNPC {

  /**
   * Define default rendering options for the NPC sheet
   * @return {Object}
   */
	static get defaultOptions() {
    let defaultTab = game.settings.get("tidy5e-sheet", "defaultActionsTab") != 'default' ? 'attributes' : 'actions';
		if (!game.modules.get('character-actions-list-5e')?.active) defaultTab = 'description';

	  return mergeObject(super.defaultOptions, {
      classes: ["tidy5e", "sheet", "actor", "npc"],
      width: game.settings.get("tidy5e-sheet", "npsSheetWidth") ?? 740,
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
    if ( !game.user.isGM && this.actor.limited ) return "modules/tidy5e-sheet/templates/actors/tidy5e-npc-ltd.html";
    return "modules/tidy5e-sheet/templates/actors/tidy5e-npc.html";
  }

  /* -------------------------------------------- */

  /**
   * Organize Owned Items for rendering the NPC sheet
   * @private
   */
  _prepareItems(data) {


    // Categorize Items as Features and Spells
    const features = {
      passive: { label: game.i18n.localize("DND5E.Features"), items: [], dataset: {type: "feat"} },
      weapons: { label: game.i18n.localize("DND5E.AttackPl"), items: [] , hasActions: true, dataset: {type: "weapon", "weapon-type": "natural"} },
      actions: { label: game.i18n.localize("DND5E.ActionPl"), items: [] , hasActions: true, dataset: {type: "feat", "activation.type": "action"} },
      equipment: { label: game.i18n.localize("DND5E.Inventory"), items: [], hasActions: true, dataset: {type: "loot"}}
    };

    // Start by classifying items into groups for rendering
    let [spells, other] = data.items.reduce((arr, item) => {
      item.img = item.img || CONST.DEFAULT_TOKEN;
      item.isStack = item.data.quantity ? item.data.quantity > 1 : false;
      item.hasUses = item.data.uses && (item.data.uses.max > 0);
      item.isOnCooldown = item.data.recharge && !!item.data.recharge.value && (item.data.recharge.charged === false);
      item.isDepleted = item.isOnCooldown && (item.data.uses.per && (item.data.uses.value > 0));
      item.hasTarget = !!item.data.target && !(["none",""].includes(item.data.target.type));

      // Item toggle state
      this._prepareItemToggleState(item);
      
      if ( item.type === "spell" ) arr[0].push(item);
      else arr[1].push(item);
      return arr;
    }, [[], []]);

    // Apply item filters
    spells = this._filterItems(spells, this._filters.spellbook);
    other = this._filterItems(other, this._filters.features);

    // Organize Spellbook
    const spellbook = this._prepareSpellbook(data, spells);

    // Organize Features
    for ( let item of other ) {
      if ( item.type === "weapon" ) features.weapons.items.push(item);
      else if ( item.type === "feat" ) {
        if ( item.data.activation.type ) features.actions.items.push(item);
        else features.passive.items.push(item);
      }
      else features.equipment.items.push(item);
    }

    // Sort others equipements type
    const sortingOrder = {
      'equipment': 1,
      'consumable': 2
    };

    features.equipment.items.sort((a, b) => {
      if (!a.hasOwnProperty('type') || !b.hasOwnProperty('type')) return 0;

      const first = (a['type'].toLowerCase() in sortingOrder) ? sortingOrder[a['type']] : Number.MAX_SAFE_INTEGER;
      const second = (b['type'].toLowerCase() in sortingOrder) ? sortingOrder[b['type']] : Number.MAX_SAFE_INTEGER;

      let result = 0;
      if (first < second) result = -1;
      else if (first > second) result = 1;

      return result
    });

    // Assign and return
    data.features = Object.values(features);
    data.spellbook = spellbook;
  }

  /* -------------------------------------------- */

  /**
   * A helper method to establish the displayed preparation state for an item
   * @param {Item} item
   * @private
   */
  _prepareItemToggleState(item) {
    if (item.type === "spell") {
      const isAlways = getProperty(item.data, "preparation.mode") === "always";
      const isPrepared =  getProperty(item.data, "preparation.prepared");
      item.toggleClass = isPrepared ? "active" : "";
      if ( isAlways ) item.toggleClass = "fixed";
      if ( isAlways ) item.toggleTitle = CONFIG.DND5E.spellPreparationModes.always;
      else if ( isPrepared ) item.toggleTitle = CONFIG.DND5E.spellPreparationModes.prepared;
      else item.toggleTitle = game.i18n.localize("DND5E.SpellUnprepared");
    }
    else {
      const isActive = getProperty(item.data, "equipped");
      item.toggleClass = isActive ? "active" : "";
      item.toggleTitle = game.i18n.localize(isActive ? "DND5E.Equipped" : "DND5E.Unequipped");
    }
  }

  /* -------------------------------------------- */

  /**
   * Add some extra data when rendering the sheet to reduce the amount of logic required within the template.
   */
  getData(options) {
    const data = super.getData(options);
    
    Object.keys(data.data.abilities).forEach(id => {
      // let Id = id.charAt(0).toLowerCase() + id.slice(1);
      // data.data.abilities[id].abbr = CONFIG.DND5E.abilityAbbreviations[Id];
      let Id = id.charAt(0).toUpperCase() + id.slice(1);
			data.data.abilities[id].abbr = game.i18n.localize(`DND5E.Ability${Id}Abbr`);
    });
    
		data.appId = this.appId;

    return data;
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

    tidy5eListeners(html, actor);
    tidy5eContextMenu(html);
		tidy5eShowActorArt(html, actor);
    if(game.settings.get("tidy5e-sheet", "itemCardsForNpcs")) {
      tidy5eItemCard(html, actor);
    }
    tidy5eAmmoSwitch(html, actor);

    // calculate average hp on right clicking roll hit dice icon
    html.find(".portrait-hp-formula span.rollable").mousedown( async (event) => {
      switch (event.which) {
      case 3:
        let formula = actor.data.data.attributes.hp.formula;
        // console.log(formula);
        let r = new Roll(formula);
        let term = r.terms;
        // console.log(term);
        let averageString = "";
        for (let i = 0; i < term.length; i++){
          let type = term[i].constructor.name;
          switch (type){
            case "Die":
              averageString += Math.floor(((term[i].faces * term[i].number)+term[i].number)/2);
              break;
            case "OperatorTerm":
              averageString += term[i].operator;
              break;
            case "NumericTerm":
              averageString += term[i].number;
              break;
            default:
              break;
          }
        }
        // console.log(averageString);

        let average = 0;
        averageString = averageString.replace(/\s/g, '').match(/[+\-]?([0-9\.\s]+)/g) || [];
        while(averageString.length) average += parseFloat(averageString.shift());

        // console.log(average);
        let data = {};
        data['data.attributes.hp.value'] = average;
        data['data.attributes.hp.max'] = average;
        actor.update(data);

      break;
      }
    });

    
    html.find(".toggle-personality-info").click( async (event) => {
       if(actor.getFlag('tidy5e-sheet', 'showNpcPersonalityInfo')){
        await actor.unsetFlag('tidy5e-sheet', 'showNpcPersonalityInfo');
      } else {
        await actor.setFlag('tidy5e-sheet', 'showNpcPersonalityInfo', true);
      }
    });

    html.find(".rollable[data-action=rollInitiative]").click(function(){
      return actor.rollInitiative({createCombatants: true});
    });
    
    // store Scroll Pos
    let attributesTab = html.find('.tab.attributes');
    attributesTab.scroll(function(){
      npcScrollPos = $(this).scrollTop();
    });
    let tabNav = html.find('a.item:not([data-tab="attributes"])');
    tabNav.click(function(){
      npcScrollPos = 0;
      attributesTab.scrollTop(npcScrollPos);
    });

    // Rollable Health Formula
    html.find(".health .rollable").click(this._onRollHealthFormula.bind(this));

    // toggle proficient skill visibility in the skill list
    html.find('.skills-list .toggle-proficient').click( async (event) => {
      if(actor.getFlag('tidy5e-sheet', 'npcSkillsExpanded')){
        await actor.unsetFlag('tidy5e-sheet', 'npcSkillsExpanded');
      } else {
        await actor.setFlag('tidy5e-sheet', 'npcSkillsExpanded', true);
      }
    });

    // toggle empty traits visibility in the traits list
    html.find('.traits .toggle-traits').click( async (event) => {
      if(actor.getFlag('tidy5e-sheet', 'traitsExpanded')){
        await actor.unsetFlag('tidy5e-sheet', 'traitsExpanded');
      } else {
        await actor.setFlag('tidy5e-sheet', 'traitsExpanded', true);
      }
    });
    
    // changing item qty and charges values (removing if both value and max are 0)
    html.find('.item:not(.items-header) input').change(event => {
      let value = event.target.value;
      let itemId = $(event.target).parents('.item')[0].dataset.itemId;
      let path = event.target.dataset.path;
      let data = {};
      data[path] = Number(event.target.value);
     actor.items.get(itemId).update(data);
    });

    // creating charges for the item
    html.find('.inventory-list .item .addCharges').click(event => {
      let itemId = $(event.target).parents('.item')[0].dataset.itemId;
      let item =actor.items.get(itemId);

      item.data.uses = { value: 1, max: 1 };
      let data = {};
      data['data.uses.value'] = 1;
      data['data.uses.max'] = 1;

     actor.items.get(itemId).update(data);
    });

    // Short and Long Rest
    html.find('.short-rest').click(this._onShortRest.bind(this));
    html.find('.long-rest').click(this._onLongRest.bind(this));

  }


  /* -------------------------------------------- */

  /**
   * Handle rolling NPC health values using the provided formula
   * @param {Event} event     The original click event
   * @private
   */
  async _onRollHealthFormula(event) {
    event.preventDefault();
    const formula = this.actor.data.data.attributes.hp.formula;
    if ( !formula ) return;
    // const hp = new Roll(formula).roll().total;  
		const roll_hp = await new Roll(formula).roll();
    const hp = roll_hp.total;
    AudioHelper.play({src: CONFIG.sounds.dice});
    this.actor.update({"data.attributes.hp.value": hp, "data.attributes.hp.max": hp});
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
    if(game.settings.get('tidy5e-sheet','restingForNpcsChatDisabled')){

      let obj = {
        dialog : true,
        chat : false
      }
      return this.actor.longRest(obj);
    }
    return this.actor.longRest();
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
    if(game.settings.get('tidy5e-sheet','restingForNpcsChatDisabled')){

      let obj = {
        dialog : true,
        chat : false
      }
      return this.actor.longRest(obj);
    }
    return this.actor.longRest();
  }

  
	// add actions module
  async _renderInner(...args) {
    const html = await super._renderInner(...args);
		const actionsListApi = game.modules.get('character-actions-list-5e')?.api;
		let injectNPCSheet;
    if(game.modules.get('character-actions-list-5e')?.active) injectNPCSheet = game.settings.get('character-actions-list-5e', 'inject-npcs');
    
    try {
			if(game.modules.get('character-actions-list-5e')?.active && injectNPCSheet){
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

// restore scroll position
async  function restoreScrollPosition(app, html, data){
  html.find('.tab.attributes').scrollTop(npcScrollPos);
  // $('.tab.attributes').scrollTop(npcScrollPos);
}

// handle skills list display
async function toggleSkillList(app, html, data){
  html.find('.skills-list:not(.always-visible):not(.expanded) .skill:not(.proficient)').remove();
}

// handle traits list display
async function toggleTraitsList(app, html, data){
  html.find('.traits:not(.always-visible):not(.expanded) .form-group.inactive').remove();
}

// toggle item icon
async function toggleItemMode(app, html, data){
  html.find('.item-toggle').click(ev => {
    ev.preventDefault();
    let itemId = ev.currentTarget.closest(".item").dataset.itemId;
    let item = app.actor.items.get(itemId);
    let attr = item.data.type === "spell" ? "data.preparation.prepared" : "data.equipped";
    return item.update({ [attr]: !getProperty(item.data, attr) });
  });
}

// restore scroll position
async  function resetTempHp(app, html, data){
  let actor = app.actor;
	if(data.editable && !actor.compendium){
    let temp = actor.data.data.attributes.hp.temp,
        tempmax = actor.data.data.attributes.hp.tempmax;

    if(temp == 0){
      actor.update({ 'data.attributes.hp.temp': null });
    }
    if(tempmax == 0){
      actor.update({ 'data.attributes.hp.tempmax': null });
    }
  }
}

// Set Sheet Classes
async function setSheetClasses(app, html, data) {
  const {token} = app;
  const actor = app.actor;
  if(actor.getFlag('tidy5e-sheet', 'showNpcPersonalityInfo')){
    html.find('.tidy5e-sheet .left-notes').removeClass('hidden');
  }
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
  if (game.settings.get("tidy5e-sheet", "traitsMovedBelowResourceNpc")) {
		let altPos = html.find('.alt-trait-pos');
		let traits = html.find('.traits');
		altPos.append(traits);
	}
  if (!game.settings.get("tidy5e-sheet", "restingForNpcsEnabled")) {
    html.find('.tidy5e-sheet.tidy5e-npc .rest-container').remove();
  }
  if (game.settings.get("tidy5e-sheet", "portraitStyle") == "npc" || game.settings.get("tidy5e-sheet", "portraitStyle") == "all") {
    html.find('.tidy5e-sheet.tidy5e-npc .profile').addClass('roundPortrait');
  }
  if (game.settings.get("tidy5e-sheet", "hpOverlayDisabledNpc")) {
    html.find('.tidy5e-sheet.tidy5e-npc .profile').addClass('disable-hp-overlay');
  }
	if (game.settings.get("tidy5e-sheet", "hpBarDisabled")) {
		html.find('.tidy5e-sheet .profile').addClass('disable-hp-bar');
	}
  if (game.settings.get("tidy5e-sheet", "hpOverlayBorderNpc") > 0) {
    $('.system-dnd5e').get(0).style.setProperty('--npc-border', game.settings.get("tidy5e-sheet", "hpOverlayBorderNpc")+'px');
	} else {
     $('.system-dnd5e').get(0).style.removeProperty('--npc-border');
  }
  if (game.settings.get("tidy5e-sheet", "traitsAlwaysShownNpc")) {
    html.find('.tidy5e-sheet.tidy5e-npc .traits').addClass('always-visible');
  }
  if (game.settings.get("tidy5e-sheet", "traitLabelsEnabled")) {
		html.find('.tidy5e-sheet.tidy5e-npc .traits').addClass('show-labels');
	}
  if (game.settings.get("tidy5e-sheet", "skillsAlwaysShownNpc")) {
    html.find('.tidy5e-sheet.tidy5e-npc .skills-list').addClass('always-visible');
  }
  if (token && token.data.actorLink && game.settings.get("tidy5e-sheet", "linkMarkerNpc") == 'both') {
    html.find('.tidy5e-sheet.tidy5e-npc').addClass('linked');
  }
  if (token && !token.data.actorLink && ( game.settings.get("tidy5e-sheet", "linkMarkerNpc") == "unlinked" || game.settings.get("tidy5e-sheet", "linkMarkerNpc") == "both")) {
    html.find('.tidy5e-sheet.tidy5e-npc').addClass('unlinked');
  }
  if (!token && (game.settings.get("tidy5e-sheet", "linkMarkerNpc") == "unlinked" || game.settings.get("tidy5e-sheet", "linkMarkerNpc") == "both")) {
    html.find('.tidy5e-sheet.tidy5e-npc').addClass('original');
  }
	$('.info-card-hint .key').html(game.settings.get('tidy5e-sheet', 'itemCardsFixKey'));
}

// Abbreviate Currency
async function abbreviateCurrency(app,html,data) {
	html.find('.currency .currency-item label').each(function(){
		let currency = $(this).data('denom').toUpperCase();
		// let abbr = CONFIG.DND5E.currencies[currency].abbreviation;
		// if(abbr == CONFIG.DND5E.currencies[currency].abbreviation){
		// 	abbr = currency;
		// }
		let abbr = game.i18n.localize(`DND5E.CurrencyAbbr${currency}`);
		if(abbr == `DND5E.CurrencyAbbr${currency}`){
			abbr = currency;
		}
		$(this).html(abbr);
	});
}

// Hide empty Spellbook
async function hideSpellbook(app, html, data) {
  let spellbook = html.find('.spellbook-footer');

  if (spellbook.hasClass('spellbook-empty')){
    html.find('.spellbook-title').addClass('toggle-spellbook');
    // html.find('.spellbook-title .fa-caret-down').show();
    // html.find('.spellbook-title .fa-caret-up').hide();
    html.find('.spellbook-title + .list-layout').hide();
    html.find('.spellcasting-ability').hide();

    $('.toggle-spellbook').on('click', function(){
      html.find('.spellbook-title').toggleClass('show');
      // html.find('.spellbook-title .fa-caret-down').toggle();
      // html.find('.spellbook-title .fa-caret-up').toggle();
      html.find('.spellbook-title + .list-layout').toggle();
      html.find('.spellcasting-ability').toggle();
    });
  }
}

// Edit Protection - Hide empty Inventory Sections, add and delete-buttons
async function editProtection(app, html, data) {
  let actor = app.actor;
  if(!actor.getFlag('tidy5e-sheet', 'allow-edit')){
    
		if(game.settings.get("tidy5e-sheet", "editTotalLockEnabled")){
			html.find(".skill input").prop('disabled', true);
			html.find(".skill .config-button").remove();
			html.find(".skill .proficiency-toggle").remove();
			html.find(".ability-score").prop('disabled', true);
			html.find(".ac-display input").prop('disabled', true);
			html.find(".initiative input").prop('disabled', true);
			html.find(".hp-max").prop('disabled', true);
			html.find(".resource-name input").prop('disabled', true);
			html.find(".res-max").prop('disabled', true);
			html.find(".res-options").remove();
			html.find(".ability-modifiers .proficiency-toggle").remove();
			html.find(".ability .config-button").remove();
			html.find(".traits .config-button,.traits .trait-selector,.traits .proficiency-selector").remove();
			html.find('[contenteditable]').prop('contenteditable', false);
			html.find(".caster-level input").prop('disabled', true);
			html.find(".spellcasting-attribute select").prop('disabled', true);
		}

    let itemContainer = html.find('.inventory-list:not(.spellbook-list).items-list');
    html.find('.inventory-list:not(.spellbook-list) .items-header').each(function(){
      if(($(this).next('.item-list').find('li').length - $(this).next('.item-list').find('li.items-footer').length) == 0){
        $(this).next('.item-list').addClass('hidden').hide();
				$(this).addClass('hidden').hide();
      }
    });
    
    html.find('.inventory-list .items-footer').addClass('hidden').hide();
		html.find('.inventory-list .item-control.item-delete').remove();

    let actor = app.actor,
        legAct = actor.data.data.resources.legact.max,
        legRes = actor.data.data.resources.legres.max,
        lair = actor.data.data.resources.lair.value;

    if(!lair && legAct < 1 && legRes < 1) {
      html.find('.counters').addClass('hidden').hide();
    }

    if(itemContainer.children().length < 1){
      itemContainer.append(`<span class="notice">This section is empty. Unlock the sheet to edit.</span>`)
    }
  }
}

// add fav button for npc-favorites
async function npcFavorites (app, html, data){

  let items = data.actor.items;
  
  for (let item of items) {
    // do not add the fav button for class items
    if (item.type == "class") continue;

    // making sure the flag to set favorites exists
    if (item.flags.favtab === undefined || item.flags.favtab.isFavorite === undefined) {
      item.flags.favtab = { isFavorite: false };
        // DO NOT SAVE AT THIS POINT! saving for each and every item creates unneeded data and hogs the system
        //app.actor.updateOwnedItem(item, true);
    }
    let isFav = item.flags.favtab.isFavorite;

    if (app.options.editable) {
      let favBtn = $(`<a class="item-control item-fav ${isFav ? 'active' : ''}" title="${isFav ? game.i18n.localize("TIDY5E.RemoveFav") : game.i18n.localize("TIDY5E.AddFav")}" data-fav="${isFav}"><i class="${isFav ? "fas fa-bookmark" : "fas fa-bookmark inactive"}"></i> <span class="control-label">${isFav ? game.i18n.localize("TIDY5E.RemoveFav") : game.i18n.localize("TIDY5E.AddFav")}</span></a>`);
      favBtn.click(ev => {
        app.actor.items.get(item._id).update({ "flags.favtab.isFavorite": !item.flags.favtab.isFavorite });
      });
      html.find(`.item[data-item-id="${item._id}"]`).find('.item-controls .item-edit').before(favBtn);
      if(item.flags.favtab.isFavorite){
        html.find(`.item[data-item-id="${item._id}"]`).addClass('isFav');
      }
    }
  }
}

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
  toggleItemMode(app, html, data);
  restoreScrollPosition(app, html, data);
	abbreviateCurrency(app,html,data);
  hideSpellbook(app, html, data);
  resetTempHp(app, html, data);
  editProtection(app, html, data);
  npcFavorites (app, html, data);
	// console.log(data.actor);
});
