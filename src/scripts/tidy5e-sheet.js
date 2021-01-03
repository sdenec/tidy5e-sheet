import { DND5E } from "../../../systems/dnd5e/module/config.js";
import ActorSheet5e from "../../../systems/dnd5e/module/actor/sheets/base.js";
import ActorSheet5eCharacter from "../../../systems/dnd5e/module/actor/sheets/character.js";
import { tidy5eSettings } from "./app/settings.js";

import { preloadTidy5eHandlebarsTemplates } from "./app/tidy5e-templates.js";
import { tidy5eListeners } from "./app/listeners.js";
import { activeEffectsExhaustion } from "./app/exhaustion.js";
import { tidy5eContextMenu } from "./app/context-menu.js";
import { addFavorites } from "./app/tidy5e-favorites.js";

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
 					item = actor.getOwnedItem(li.data("item-id"));

 			if(item.data.data.attunement == 2) {
 				actor.getOwnedItem(li.data("item-id")).update({'data.attunement': 1});
 			} else {
 				if(actor.data.data.details.attunedItemsCount >= actor.data.data.details.attunedItemsMax) {
			  	ui.notifications.warn(`Attunement warning: You can't attune to more than ${actor.data.data.details.attunedItemsCount} items!`);
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
 					itemDescription = itemData.data.description.value,
	        chatData = item.getChatData({secrets: actor.owner}),
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
  let actor = game.actors.entities.find(a => a.data._id === data.actor._id);
  // if no items are counted set default value to 3
  if (!actor.data.data.details.attunedItemsMax) {
  	await actor.update({"data.details.attunedItemsMax": 3});
  }

  if (!actor.data.data.details.attunedItemsCount) {
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
  	ui.notifications.warn(`Attunement warning: You can't attune to more than ${actor.data.data.details.attunedItemsCount} items!`);
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
        $(this).next('.item-list').remove();
        $(this).remove();
      }
    });

    html.find('.inventory-list .items-footer').hide();
		html.find('.inventory-list .item-control.item-delete').remove();

		if (game.settings.get('tidy5e-sheet', "gmOnlyEffectsEdit") && !game.user.isGM ) {
			html.find('.effects-list .items-footer, .effects-list .effect-controls').remove();
		} else {
			html.find('.effects-list .items-footer, .effects-list .effect-control.effect-delete').remove();
		}

    itemContainer.each(function(){

		  if($(this).children().length < 1){
				if( $(this).hasClass('effects-list') && !game.user.isGM && game.settings.get('tidy5e-sheet', 'gmOnlyEffectsEdit')){
					// $(this).append(`<span class="notice">This section is empty.</span>`);
					$(this).prepend(`<span class="notice">Only your GM can edit this section.</span>`);
				} else {
					$(this).append(`<span class="notice">This section is empty. Unlock the sheet to edit.</span>`);
				}
			}
    });
  } else if (!game.user.isGM && actor.getFlag('tidy5e-sheet', 'allow-edit') && game.settings.get('tidy5e-sheet', 'gmOnlyEffectsEdit')){
			let itemContainer = html.find('.effects-list.items-list');

			itemContainer.prepend(`<span class="notice">Only your GM can edit this section.</span>`);
			html.find('.effects-list .items-footer, .effects-list .effect-controls').remove();

			html.find('.effects-list .items-header').each(function(){
				if($(this).next('.item-list').find('li').length < 1){
					$(this).next('.item-list').remove();
					$(this).remove();
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

// Manage Sheet Options
async function setSheetClasses(app, html, data) {
	let actor = game.actors.entities.find(a => a.data._id === data.actor._id);
	if (game.settings.get("tidy5e-sheet", "disableRightClick")) {
		html.find('.tidy5e-sheet .items-list').addClass('alt-context');
	}
	if (game.settings.get("tidy5e-sheet", "portraitStyle") == "pc" || game.settings.get("tidy5e-sheet", "portraitStyle") == "all") {
		html.find('.tidy5e-sheet .profile').addClass('roundPortrait');
	}
	if (game.settings.get("tidy5e-sheet", "disableHpOverlay")) {
		html.find('.tidy5e-sheet .profile').addClass('disable-hp-overlay');
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
	// if (game.settings.get("tidy5e-sheet", "restOnHover")) {
	// 	html.find('.tidy5e-sheet .profile').addClass('restOnHover');
	// }
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

	// game.settings.register("tidy5e-sheet", "primaryAccent", {
  //   name: game.i18n.localize("TIDY5E.Settings.PrimaryAccentColor.name"),
  //   hint: game.i18n.localize("TIDY5E.Settings.PrimaryAccentColor.hint"),
	// 	scope: "user",
	// 	config: true,
	// 	default: "",
	// 	type: String,
	// 	onChange: data => {
	// 		if(data){
	// 			document.documentElement.style.setProperty('--default-primary-accent',data);
	// 			document.documentElement.style.setProperty('--darkmode-primary-accent',data);
	// 		} else {
	// 			document.documentElement.style.setProperty('--default-primary-accent',"#ff6400");
	// 			document.documentElement.style.setProperty('--darkmode-primary-accent',"#48BB78");
	// 		}
  //    }
	// });

	// game.settings.register("tidy5e-sheet", "secondaryAccent", {
  //   name: game.i18n.localize("TIDY5E.Settings.SecondaryAccentColor.name"),
  //   hint: game.i18n.localize("TIDY5E.Settings.SecondaryAccentColor.hint"),
	// 	scope: "user",
	// 	config: true,
	// 	default: "",
	// 	type: String,
	// 	onChange: data => {
	// 		if(data){
	// 			document.documentElement.style.setProperty('--default-secondary-accent',data);
	// 			document.documentElement.style.setProperty('--darkmode-secondary-accent',data);
	// 		} else {
	// 			document.documentElement.style.setProperty('--default-secondary-accent',"rgba(210,0,255,.1)");
	// 			document.documentElement.style.setProperty('--darkmode-secondary-accent',"rgba(0,150,150,.325)");
	// 		}
  //    }
	// });

	// game.settings.register("tidy5e-sheet", "alwaysPreparedAccent", {
  //   name: game.i18n.localize("TIDY5E.Settings.AlwaysPreparedAccentColor.name"),
  //   hint: game.i18n.localize("TIDY5E.Settings.AlwaysPreparedAccentColor.hint"),
	// 	scope: "user",
	// 	config: true,
	// 	default: "",
	// 	type: String,
	// 	onChange: data => {
	// 		if(data){
	// 			document.documentElement.style.setProperty('--always-prepared-accent',data);
	// 			document.documentElement.style.setProperty('--darkmode-always-prepared-accent',data);
	// 		} else {
	// 			document.documentElement.style.setProperty('--always-prepared-accent',"rgba(210,0,255,.1)");
	// 			document.documentElement.style.setProperty('--darkmode-always-prepared-accent',"rgba(0,150,150,.325)");
	// 		}
  //   }
	// });

  // const primaryAccentColor = game.settings.get('tidy5e-sheet', "primaryAccent");
  // if(primaryAccentColor !==  '') {
  // 	document.documentElement.style.setProperty('--default-primary-accent',primaryAccentColor);
  // }
  // if(useDarkMode === true && primaryAccentColor !==  '') {
  // 	document.documentElement.style.setProperty('--darkmode-primary-accent',primaryAccentColor);
  // }

  // const secondaryAccentColor = game.settings.get('tidy5e-sheet', "secondaryAccent");
  // if(secondaryAccentColor !==  '') {
  //  	document.documentElement.style.setProperty('--default-secondary-accent',secondaryAccentColor);	
  // }
  // if(useDarkMode === true && secondaryAccentColor !==  '') {
  //  	document.documentElement.style.setProperty('--darkmode-secondary-accent',secondaryAccentColor);	
  // }
  
  // const alwaysPreparedAccent = game.settings.get('tidy5e-sheet', "alwaysPreparedAccent");
  // if(alwaysPreparedAccent !==  '') {
  // 	document.documentElement.style.setProperty('--always-prepared-accent',alwaysPreparedAccent);
  // } 
  // if(useDarkMode === true && alwaysPreparedAccent !==  '') {
  // 	document.documentElement.style.setProperty('--darkmode-always-prepared-accent',alwaysPreparedAccent);
  // }
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
	console.log(data);
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
