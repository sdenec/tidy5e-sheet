import { DND5E } from "../../../systems/dnd5e/module/config.js";
import ActorSheet5e from "../../../systems/dnd5e/module/actor/sheets/base.js";
import ActorSheet5eCharacter from "../../../systems/dnd5e/module/actor/sheets/character.js";
import { tidy5eSettings } from "./app/settings.js";
// import { Tidy5eUserSettings } from './app/settings.js';

import { preloadTidy5eHandlebarsTemplates } from "./app/tidy5e-templates.js";
import { tidy5eListeners } from "./app/listeners.js";
import { activeEffectsExhaustion } from "./app/exhaustion.js";
import { tidy5eContextMenu } from "./app/context-menu.js";
import { tidy5eSearchFilter } from "./app/search-filter.js";
import { addFavorites } from "./app/tidy5e-favorites.js";
import { tidy5eClassicControls } from "./app/classic-controls.js";
import { tidy5eShowActorArt } from "./app/show-actor-art.js";

let position = 0;

export class Tidy5eSheet extends ActorSheet5eCharacter {
	
	get template() {
		if ( !game.user.isGM && this.actor.limited && !game.settings.get("tidy5e-sheet", "useExpandedSheet") ) return "modules/tidy5e-sheet/templates/actors/tidy5e-sheet-ltd.html";
		return "modules/tidy5e-sheet/templates/actors/tidy5e-sheet.html";
	}
	
	static get defaultOptions() {
	  return mergeObject(super.defaultOptions, {
			classes: ["tidy5e", "sheet", "actor", "character"],
			blockFavTab: true,
			width: 740,
			height: 840
		});
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

    tidy5eListeners(html, actor);
    tidy5eContextMenu(html);
		tidy5eSearchFilter(html, actor);
		tidy5eShowActorArt(html, actor);

		// store Scroll Pos
		const attributesTab = html.find('.tab.attributes');
		attributesTab.scroll(function(){
			position = this.scrollPos = {top: attributesTab.scrollTop()};
		});
		let tabNav = html.find('a.item:not([data-tab="attributes"])');
		tabNav.click(function(){
			this.scrollPos = {top: 0};
			attributesTab.scrollTop(0);
		});

		// toggle inventory layout
		html.find('.toggle-layout.inventory-layout').click(async (event) => {
			event.preventDefault();
			
			if( $(event.currentTarget).hasClass('spellbook-layout')){
				if(actor.getFlag('tidy5e-sheet', 'spellbook-grid')){
					await actor.unsetFlag('tidy5e-sheet', 'spellbook-grid');
				} else {
					await actor.setFlag('tidy5e-sheet', 'spellbook-grid', true);
				}
			} else {
				if(actor.getFlag('tidy5e-sheet', 'inventory-grid')){
					await actor.unsetFlag('tidy5e-sheet', 'inventory-grid');
				} else {
					await actor.setFlag('tidy5e-sheet', 'inventory-grid', true);
				}
			}
 		});

		// toggle traits
 		html.find('.traits-toggle').click(async (event) => {
			event.preventDefault();
			
			if(actor.getFlag('tidy5e-sheet', 'traits-compressed')){
				await actor.unsetFlag('tidy5e-sheet', 'traits-compressed');
			} else {
				await actor.setFlag('tidy5e-sheet', 'traits-compressed', true);
			}
 		});

		// set exhaustion level with portrait icon
		html.find('.exhaust-level li').click(async (event) => {
			event.preventDefault();
			
			let data = actor.data.data;
			let target = event.currentTarget;
			let value = target.dataset.elvl;
			await actor.update({"data.attributes.exhaustion": value});
 		});

 		// changing item qty and charges values (removing if both value and max are 0)
    html.find('.item:not(.items-header) input').change(event => {
    	let value = event.target.value;
      let itemId = $(event.target).parents('.item')[0].dataset.itemId;
      let path = event.target.dataset.path;
      let data = {};
      data[path] = Number(event.target.value);
      actor.getOwnedItem(itemId).update(data);
    });

    // creating charges for the item
    html.find('.inventory-list .item .addCharges').click(event => {
      let itemId = $(event.target).parents('.item')[0].dataset.itemId;
      let item = actor.getOwnedItem(itemId);

      item.data.uses = { value: 1, max: 1 };
      let data = {};
      data['data.uses.value'] = 1;
      data['data.uses.max'] = 1;

      actor.getOwnedItem(itemId).update(data);
    });

    // toggle empty traits visibility in the traits list
    html.find('.traits .toggle-traits').click( async (event) => {
      if(actor.getFlag('tidy5e-sheet', 'traitsExpanded')){
        await actor.unsetFlag('tidy5e-sheet', 'traitsExpanded');
      } else {
        await actor.setFlag('tidy5e-sheet', 'traitsExpanded', true);
      }
    });

		// update item attunement
		html.find('.item-control.item-attunement').click( async (event) => {
	    event.preventDefault();
 			let li = $(event.currentTarget).closest('.item'),
					 item = actor.getOwnedItem(li.data("item-id")),
					 count = actor.data.data.details.attunedItemsCount;

 			if(item.data.data.attunement == 2) {
 				actor.getOwnedItem(li.data("item-id")).update({'data.attunement': 1});
 			} else {
 				if(count >= actor.data.data.details.attunedItemsMax) {
			  	ui.notifications.warn(`${game.i18n.format("TIDY5E.AttunementWarning", {number: count})}`);
			  } else {
 					actor.getOwnedItem(li.data("item-id")).update({'data.attunement': 2});
			  }
 			}
 		});

		// show/hide grid layout item info card on mouse enter/leave

 		html.find('.grid-layout .item-list .item').mouseenter( async (event) => {
	    event.preventDefault();
 			let li = $(event.currentTarget),
 					item = actor.getOwnedItem(li.data("item-id")),
 					itemData = item.data,
 					// itemDescription = itemData.data.description.value,
					chatData = item.getChatData({secrets: actor.owner}),
					itemDescription = chatData.description.value,
 					infoContainer = li.closest('.grid-layout').find('.item-info-container-content'),
 					infoCard = li.find('.info-card');
 					
 			infoCard.clone().appendTo(infoContainer);

 			let	infoBackground = infoContainer.find('.item-info-container-background'),
 					infoDescription = infoContainer.find('.info-card-description'),
 					props = $(`<div class="item-properties"></div>`);

 			infoDescription.html(itemDescription);

	    chatData.properties.forEach(p => props.append(`<span class="tag">${p}</span>`));
	    infoContainer.find('.info-card .info-card-description').after(props);

			infoContainer.show();
			infoBackground.hide();

 			let innerScrollHeight = infoDescription[0].scrollHeight;

			if(innerScrollHeight > infoDescription.height() ) {
				infoDescription.addClass('overflowing');
				infoDescription.after('<span class="truncated">&hellip;</span>');
			}
	    // console.log(itemData);
 		});

 		html.find('.item-list .item').mouseleave( function (event) {
			html.find('.item-info-container-background').show();
			html.find('.item-info-container-content .info-card').remove();
 		});

	}
}

// count inventory items
async function countInventoryItems(app, html, data){
	if(game.user.isGM) {
		html.find('.attuned-items-counter').addClass('isGM');
	}
  html.find('.tab.inventory .item-list').each(function(){
  	let itemlist = this;
  	let items = $(itemlist).find('li');
  	let itemCount = items.length - 1;
  	$(itemlist).prev('.items-header').find('.item-name').append(' ('+itemCount+')');
  });
}

// count attuned items
async function countAttunedItems(app, html, data){
  let actor = game.actors.entities.find(a => a.data._id === data.actor._id),
			count = actor.data.data.details.attunedItemsCount;
  // if no items are counted set default value to 3
  if (!actor.data.data.details.attunedItemsMax) {
  	await actor.update({"data.details.attunedItemsMax": 3});
  }

  if (!count) {
  	await actor.update({"data.details.attunedItemsCount": 0});
  }

  let items = actor.data.items;
	let attunedItems = 0;

  for (var i = 0; i < items.length; i++){
  	if (items[i].data.attunement == 2){
  		attunedItems++;
  	}
  }

  await actor.update({"data.details.attunedItemsCount": attunedItems});

  // html.find('.attuned-items-counter .attuned-items-current').text(attunedItems);
  if(actor.data.data.details.attunedItemsCount > actor.data.data.details.attunedItemsMax) {
  	html.find('.attuned-items-counter').addClass('overattuned');
  	ui.notifications.warn(`${game.i18n.format("TIDY5E.AttunementWarning", {number: count})}`);
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

// Check Death Save Status
async function checkDeathSaveStatus(app, html, data){
	var actor = game.actors.entities.find(a => a.data._id === data.actor._id);
	var data = actor.data.data;
	var currentHealth = data.attributes.hp.value;
	var deathSaveSuccess = data.attributes.death.success;
	var deathSaveFailure = data.attributes.death.failure;

	if(currentHealth > 0 && deathSaveSuccess != 0 || currentHealth > 0 && deathSaveFailure != 0){
			await actor.update({"data.attributes.death.success": 0});
			await actor.update({"data.attributes.death.failure": 0});
	}
}

// Edit Protection - Hide empty Inventory Sections, Effects aswell as add and delete-buttons
async function editProtection(app, html, data) {
  let actor = app.actor;
  if(game.user.isGM && game.settings.get("tidy5e-sheet", "gmCanAlwaysEdit")) {

  } else if(!actor.getFlag('tidy5e-sheet', 'allow-edit')){
    
    let itemContainer = html.find('.inventory-list.items-list, .effects-list.items-list');
    html.find('.inventory-list .items-header:not(.spellbook-header), .effects-list .items-header').each(function(){
      if($(this).next('.item-list').find('li').length <= 1){
        $(this).next('.item-list').addClass('hidden').hide();
				$(this).addClass('hidden').hide();
      }
    });

    html.find('.inventory-list .items-footer').addClass('hidden').hide();
		html.find('.inventory-list .item-control.item-delete').remove();

		if (game.settings.get('tidy5e-sheet', "gmOnlyEffectsEdit") && !game.user.isGM ) {
			html.find('.effects-list .items-footer, .effects-list .effect-controls').remove();
		}	else {
			html.find('.effects-list .items-footer, .effects-list .effect-control.effect-delete').remove();
		}

    itemContainer.each(function(){
			let hiddenSections = $(this).find('> .hidden').length;
			let totalSections = $(this).children().not('.notice').length;
			// console.log('hidden: '+ hiddenSections + '/ total: '+totalSections);
		  if(hiddenSections >= totalSections){
				if( $(this).hasClass('effects-list') && !game.user.isGM && game.settings.get('tidy5e-sheet', 'gmOnlyEffectsEdit')){
					$(this).prepend(`<span class="notice">${game.i18n.localize("TIDY5E.GmOnlyEdit")}</span>`);
				} else {
					$(this).append(`<span class="notice">${game.i18n.localize("TIDY5E.EmptySection")}</span>`);
				}
			}
    });
  } else if (!game.user.isGM && actor.getFlag('tidy5e-sheet', 'allow-edit') && game.settings.get('tidy5e-sheet', 'gmOnlyEffectsEdit')){
			let itemContainer = html.find('.effects-list.items-list');

			itemContainer.prepend(`<span class="notice">${game.i18n.localize("TIDY5E.GmOnlyEdit")}</span>`);
			html.find('.effects-list .items-footer, .effects-list .effect-controls').remove();

			html.find('.effects-list .items-header').each(function(){
				if($(this).next('.item-list').find('li').length < 1){
					$(this).next('.item-list').addClass('hidden').hide();
					$(this).addClass('hidden').hide();
				}
			});
	}
}

// Add Character Class List
async function addClassList(app, html, data) { 
	if (!game.settings.get("tidy5e-sheet", "hideClassList")) {
		let actor = game.actors.entities.find(a => a.data._id === data.actor._id);
		let classList = [];
		let items = data.actor.items;
		for (let item of items) {
			if (item.type === "class") {
				let levels = (item.data.levels) ? `<span class="levels-info">${item.data.levels}</span>` : ``;
				let subclass = (item.data.subclass) ? `<span class="subclass-info">(${item.data.subclass})</span>` : ``;
				classList.push(item.name + levels + subclass);
			}
		}
		classList = "<ul class='class-list'><li class='class-item'>" + classList.join("</li><li class='class-item'>") + "</li></ul>";
		mergeObject(actor, {"data.flags.tidy5e-sheet.classlist": classList});
		let classListTarget = html.find('.general-information');
		classListTarget.after(classList);
	}
}

// Calculate Spell Attack modifier
async function spellAttackMod(app,html,data){
	let actor = game.actors.entities.find(a => a.data._id === data.actor._id),
			prof = actor.data.data.attributes.prof,
			spellAbility = html.find('.spellcasting-attribute select option:selected').val(),
			abilityMod = spellAbility != '' ? actor.data.data.abilities[spellAbility].mod : 0,
			spellAttackMod = prof + abilityMod,
			text = spellAttackMod > 0 ? '+'+spellAttackMod : spellAttackMod;
			console.log(spellAbility);
	// console.log('Prof: '+prof+ '/ Spell Ability: '+spellAbility+ '/ ability Mod: '+abilityMod+'/ Spell Attack Mod:'+spellAttackMod);
	html.find('.spell-mod .spell-attack-mod').html(text);
}

// Abbreviate Currency
async function abbreviateCurrency(app,html,data) {
	html.find('.currency .currency-item label').each(function(){
		let currency = $(this).data('denom').toUpperCase();
		let abbr = game.i18n.localize(`TIDY5E.CurrencyAbbr${currency}`);
		$(this).html(abbr);
	});
}

// transform DAE formulas for maxPreparesSpells
function tidyCustomEffect(actor, change) {
  if (change.key !== "data.details.maxPreparedSpells") return;
  if (change.value?.length > 0) {
    let oldValue =  getProperty(actor.data, change.key) || 0;
    let changeText = change.value.trim();
    let op = "none";
    if (["+","-","/","*","="].includes(changeText[0])) {
      op = changeText[0];
      changeText = changeText.slice(1);
    }
    const value = new Roll(changeText, actor.getRollData()).roll().total;
    oldValue = Number.isNumeric(oldValue) ? parseInt(oldValue) : 0;
    switch (op) {
      case "+": return setProperty(actor.data, change.key, oldValue + value);
      case "-": return setProperty(actor.data, change.key, oldValue - value);
      case "*": return setProperty(actor.data, change.key, oldValue * value);
      case "/": return setProperty(actor.data, change.key, oldValue / value);
      case "=": return setProperty(actor.data, change.key, value);
      default:  return setProperty(actor.data, change.key, value);
    }
  }
}

// Manage Sheet Options
async function setSheetClasses(app, html, data) {
	let actor = game.actors.entities.find(a => a.data._id === data.actor._id);
	if (game.settings.get("tidy5e-sheet", "disableRightClick")) {
		if(game.settings.get("tidy5e-sheet", "useClassicControls")){
			html.find('.tidy5e-sheet .grid-layout .items-list').addClass('alt-context');
		} else {
			html.find('.tidy5e-sheet .items-list').addClass('alt-context');
		}
	}
	if (game.settings.get("tidy5e-sheet", "useClassicControls")) {
		tidy5eClassicControls(html);
	}
	if (game.settings.get("tidy5e-sheet", "portraitStyle") == "pc" || game.settings.get("tidy5e-sheet", "portraitStyle") == "all") {
		html.find('.tidy5e-sheet .profile').addClass('roundPortrait');
	}
	if (game.settings.get("tidy5e-sheet", "disableHpOverlay")) {
		html.find('.tidy5e-sheet .profile').addClass('disable-hp-overlay');
	}
	if (game.settings.get("tidy5e-sheet", "disableHpBar")) {
		html.find('.tidy5e-sheet .profile').addClass('disable-hp-bar');
	}
	if (game.settings.get("tidy5e-sheet", "disableInspiration")) {
		html.find('.tidy5e-sheet .profile .inspiration').remove();
	}
	if (game.settings.get("tidy5e-sheet", "noInspirationAnimation")) {
		html.find('.tidy5e-sheet .profile .inspiration label i').addClass('disable-animation');
	}
	if (game.settings.get("tidy5e-sheet", "hpOverlayBorder") > 0) {
		$('.system-dnd5e').get(0).style.setProperty('--pc-border', game.settings.get("tidy5e-sheet", "hpOverlayBorder")+'px');
	}
	if(game.settings.get("tidy5e-sheet", "hideIfZero")) {
		html.find('.tidy5e-sheet .profile').addClass('autohide');
	}
	if (game.settings.get("tidy5e-sheet", "disableExhaustion")) {
		html.find('.tidy5e-sheet .profile .exhaustion-container').remove();
	}
	if (game.settings.get("tidy5e-sheet", "exhaustionOnHover")) {
		html.find('.tidy5e-sheet .profile').addClass('exhaustionOnHover');
	}
	
	if (game.settings.get("tidy5e-sheet", "inspirationOnHover")) {
		html.find('.tidy5e-sheet .profile').addClass('inspirationOnHover');
	}
	if (game.settings.get("tidy5e-sheet", "moveTraits")) {
		let altPos = html.find('.alt-trait-pos');
		let traits = html.find('.traits');
		altPos.append(traits);
	}
	if (!game.settings.get("tidy5e-sheet", "pcToggleTraits")) {
		html.find('.tidy5e-sheet .traits').addClass('always-visible');
	}
	if (game.settings.get("tidy5e-sheet", "showTraitLabels")) {
		html.find('.tidy5e-sheet .traits').addClass('show-labels');
	}
	if(game.user.isGM){
		html.find('.tidy5e-sheet').addClass('isGM');
	}
	if (game.settings.get("tidy5e-sheet", "alwaysShowQuantity")) {
		html.find('.item').addClass('alwaysShowQuantity');
	}
}

// Preload tidy5e Handlebars Templates
Hooks.once("init", () => {
	preloadTidy5eHandlebarsTemplates();
	Hooks.on("applyActiveEffect", tidyCustomEffect);
	// Tidy5eUserSettings.init();
});

// Register Tidy5e Sheet and make default character sheet
Actors.registerSheet("dnd5e", Tidy5eSheet, {
	types: ["character"],
	makeDefault: true
});

Hooks.on("renderTidy5eSheet", (app, html, data) => {
	setSheetClasses(app, html, data);
	editProtection(app, html, data);
	addFavorites(app, html, data, position);
	addClassList(app, html, data);
	toggleTraitsList(app, html, data)
	checkDeathSaveStatus(app, html, data);
	countInventoryItems(app,html,data);
	countAttunedItems(app, html, data);
	abbreviateCurrency(app,html,data);
	spellAttackMod(app,html,data);
	// console.log(data);
	// console.log("Tidy5e Sheet rendered!");
});

// broken at the moment
// Hooks.on("updateActor", (actorObject) => {
// 	activeEffectsExhaustion(actorObject);
// });

Hooks.once("ready", (app, html, data) => {
	// console.log("Tidy5e Sheet is ready!");
	
	// can be removed when 0.7.x is stable
	if (window.BetterRolls) {
		window.BetterRolls.hooks.addActorSheet("Tidy5eSheet");
	}
	
	tidy5eSettings();

});
