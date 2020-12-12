import { DND5E } from "../../../systems/dnd5e/module/config.js";
import ActorSheet5e from "../../../systems/dnd5e/module/actor/sheets/base.js";
import ActorSheet5eCharacter from "../../../systems/dnd5e/module/actor/sheets/character.js";

import { preloadTidy5eHandlebarsTemplates } from "./tidy5e-templates.js";
import { addFavorites } from "./tidy5e-favorites.js";

let position = 0;

// handlebar helper compare string
Handlebars.registerHelper('ifEquals', function(arg1, arg2, options) {
    return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
});

Handlebars.registerHelper('ifNotEquals', function(arg1, arg2, options) {
    return (arg1 !== arg2) ? options.fn(this) : options.inverse(this);
});

export class Tidy5eSheet extends ActorSheet5eCharacter {
	
	get template() {
		if ( !game.user.isGM && this.actor.limited && game.settings.get("tidy5e-sheet", "useExpandedSheet")) return "modules/tidy5e-sheet/templates/actors/tidy5e-sheet-expanded.html";
		if ( !game.user.isGM && this.actor.limited ) return "modules/tidy5e-sheet/templates/actors/tidy5e-sheet-ltd.html";
		return "modules/tidy5e-sheet/templates/actors/tidy5e-sheet.html";
	}
	
	static get defaultOptions() {
	  return mergeObject(super.defaultOptions, {
			classes: ["tidy5e", "sheet", "actor", "character"],
			blockFavTab: true,
			width: 740,
			// height: 720
			height: 840
		});
	}

	/**
   * Add some extra data when rendering the sheet to reduce the amount of logic required within the template.
   */
  getData() {
    const data = super.getData();

    Object.keys(data.data.abilities).forEach(id => {
      data.data.abilities[id].abbr = game.i18n.localize(`TIDY5E.${id}Ability`);
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

		// Modificator Ability Check
    html.find('.ability-mod').click( async (event) => {
    	event.preventDefault();
	    let ability = event.currentTarget.parentElement.parentElement.dataset.ability;
	    this.actor.rollAbilityTest(ability, {event: event});
    });

		// Modificator Ability Saving Throw
    html.find('.ability-save').click( async (event) => {
    	event.preventDefault();
	    let ability = event.currentTarget.parentElement.parentElement.dataset.ability;
	    this.actor.rollAbilitySave(ability, {event: event});
    });

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
			let actor = this.actor;

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

		// toggle legacy speed display
		html.find('.legacy-switch').click(async (event) => {
			event.preventDefault();
			let actor = this.actor;

			if(actor.getFlag('tidy5e-sheet', 'legacy-speed')){
				await actor.unsetFlag('tidy5e-sheet', 'legacy-speed');
			} else {
				await actor.setFlag('tidy5e-sheet', 'legacy-speed', true);
			}
 		});

		// toggle traits
 		html.find('.traits-toggle').click(async (event) => {
			event.preventDefault();
			let actor = this.actor;

			if(actor.getFlag('tidy5e-sheet', 'traits-compressed')){
				await actor.unsetFlag('tidy5e-sheet', 'traits-compressed');
			} else {
				await actor.setFlag('tidy5e-sheet', 'traits-compressed', true);
			}
 		});

		// toggle favorites - deprecated
 		// html.find('.favorites-toggle').click(async (event) => {
			// event.preventDefault();
			// let actor = this.actor;

			// if(actor.getFlag('tidy5e-sheet', 'favorites-compressed')){
			// 	await actor.unsetFlag('tidy5e-sheet', 'favorites-compressed');
			// } else {
			// 	await actor.setFlag('tidy5e-sheet', 'favorites-compressed', true);
			// }
 		// });

		// set exhaustion level with portrait icon
		html.find('.exhaust-level li').click(async (event) => {
			event.preventDefault();
			let actor = this.actor;
			let data = actor.data.data;
			let target = event.currentTarget;
			let value = target.dataset.elvl;
			await actor.update({"data.attributes.exhaustion": value});
 		});

 		// set input fields via editable elements
    html.find('[contenteditable]').on('paste', function(e) {
      //strips elements added to the editable tag when pasting
      let $self = $(this);

      // set maxlength
      let maxlength = 40;
      if($self[0].dataset.maxlength){
        maxlength = parseInt($self[0].dataset.maxlength);
      }

      setTimeout(function() {
        let textString = $self.text();
        textString = textString.substring(0,maxlength);
        $self.html(textString);
      }, 0);

    }).on('keypress', function(e) {
      let $self = $(this);

      // set maxlength
      let maxlength = 40;
      if($self[0].dataset.maxlength){
        maxlength = parseInt($self[0].dataset.maxlength);
      }

      // only accept backspace, arrow keys and delete after maximum characters
      let keys = [8,37,38,39,40,46];

      if($(this).text().length === maxlength && keys.indexOf(e.keyCode) < 0) { 
        e.preventDefault();
      }

       if(e.keyCode===13){
        $(this).blur();
      }
    });

    html.find('[contenteditable]').blur(async (event) => {
      let value = event.target.textContent;
      let target = event.target.dataset.target;
      html.find('input[type="hidden"][data-input="'+target+'"]').val(value).submit();
    });

 		html.find('[contenteditable]').blur(async (event) => {
    	let value = event.target.textContent;
    	let target = event.target.dataset.target;
    	html.find('input[type="hidden"][data-input="'+target+'"]').val(value).submit();
 		});

    // actor size menu
    html.find('.actor-size-select .size-label').on('click', function(){
      let currentSize = $(this).data('size');
      $(this).closest('ul').toggleClass('active').find('ul li[data-size="'+currentSize+'"]').addClass("current");
    });
    html.find('.actor-size-select .size-list li').on('click', async (event) => {
      let value = event.target.dataset.size;
      this.actor.update({"data.traits.size": value});
      html.find('.actor-size-select').toggleClass('active');
    });

 		// changing item qty and charges values (removing if both value and max are 0)
    html.find('.item:not(.items-header) input').change(event => {
    	let value = event.target.value;
			let actor = this.actor;
      let itemId = $(event.target).parents('.item')[0].dataset.itemId;
      let path = event.target.dataset.path;
      let data = {};
      data[path] = Number(event.target.value);
      actor.getOwnedItem(itemId).update(data);
    });

    // creating charges for the item
    html.find('.inventory-list .item .addCharges').click(event => {
			let actor = this.actor;
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
      let actor = this.actor;
      if(actor.getFlag('tidy5e-sheet', 'traitsExpanded')){
        await actor.unsetFlag('tidy5e-sheet', 'traitsExpanded');
      } else {
        await actor.setFlag('tidy5e-sheet', 'traitsExpanded', true);
      }
    });

    // open context menu
    $('.tidy5e .item-list .item').mousedown( function (event) {
	    switch (event.which) {
	      case 2:
	      	// middle mouse opens item editor
	      	event.preventDefault();
	    		let item = event.currentTarget;
	    		$(item).find('.item-edit').trigger('click');
	      	break;
	      case 3:
	      	// right click opens context menu
	      	$('.item').removeClass('context');
	    		$('.item .item-controls').hide();
	      	itemContextMenu(event);
	        break;
	  	}

	  	// context menu calculations
	    function itemContextMenu(e){
	    	let item = e.currentTarget,
	    			mouseX = event.clientX,
	    			mouseY = event.clientY,
	    			itemTop = $(item).offset().top,
	    			itemLeft = $(item).offset().left,
	    			itemHeight = $(item).height(),
	    			itemWidth = $(item).width(),
	    			contextTop = mouseY-itemTop+1,
	    			contextLeft = mouseX-itemLeft+1,
	    			contextWidth = $(item).find('.item-controls').width(),
	    			contextHeight = $(item).find('.item-controls').height(),
	    			contextRightBound = mouseX + contextWidth,
	    			contextBottomBound = mouseY + contextHeight,
	    			itemsList = $(item).closest('.items-list'),
	    			itemsListRightBound = itemsList.offset().left + itemsList.width() - 17,
	    			itemsListBottomBound = itemsList.offset().top + itemsList.height();

	    	// check right side bounds
	    	if(contextRightBound > itemsListRightBound) {
	    		let rightDiff = itemsListRightBound - contextRightBound;
	    		contextLeft = contextLeft + rightDiff;
	    	}

	    	// check bottom bounds
				if(contextBottomBound > itemsListBottomBound) {
	    		let bottomDiff = itemsListBottomBound - contextBottomBound;
	    		contextTop = contextTop + bottomDiff;
	    	}

	    	$(item)
	    		.addClass('context')
	    		.find('.item-controls')
	    		.css({'top': contextTop+'px', 'left': contextLeft+'px'})
	    		.fadeIn(300);
	    }
		});

    // close context menu on any click outside
    $(document).mousedown( function (event) {
    	switch (event.which) {
	      case 1:
	      if ( ! $(event.target).closest('.item .item-controls').length ) {
	      	$('.tidy5e .item').removeClass('context');
	        $('.tidy5e .item .item-controls').hide();
  			}
	      	break;
	  	}
		});

		// update item attunement
		html.find('.item-control.item-attunement').click( async (event) => {
	    event.preventDefault();
 			let li = $(event.currentTarget).closest('.item'),
 					actor = this.actor,
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
 					item = this.actor.getOwnedItem(li.data("item-id")),
 					itemData = item.data,
 					itemDescription = itemData.data.description.value,
	        chatData = item.getChatData({secrets: this.actor.owner}),
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
	    console.log(itemData);
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

// check magic items
// async function checkMagicItems(app, html, data){

// 	let actor = game.actors.entities.find(a => a.data._id === data.actor._id);

//   html.find('.tab.inventory .item').each(function(){
//  		let li = $(this),
// 				item = actor.getOwnedItem(li.data("item-id")),
// 				itemData = item.data;
// 		if(itemData.flags.magicitems && itemData.flags.magicitems.enabled) {
// 			li.addClass('magic-item');
// 		}
//   });
// }

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

// Add Character Class List
// async function addClassList(app, html, data) { 
// 	if (!game.settings.get("tidy5e-sheet", "hideClassList")) {
// 		let actor = game.actors.entities.find(a => a.data._id === data.actor._id);
// 		let classList = [];
// 		let items = data.actor.items;
// 		for (let item of items) {
// 			if (item.type === "class") {
// 				let subclass = (item.data.subclass) ? ` <div class="subclass-info has-note"><span>S</span><div class="note">${item.data.subclass}</div></div>` : ``;
// 				classList.push(item.name + subclass);
// 			}
// 		}
// 		classList = "<ul class='class-list'><li class='class-item'>" + classList.join("</li><li class='class-item'>") + "</li></ul>";
// 		mergeObject(actor, {"data.flags.tidy5e-sheet.classlist": classList});
// 		let classListTarget = html.find('.level-information');
// 		classListTarget.after(classList);

// 	}
// }
	async function addClassList(app, html, data) { 
		if (!game.settings.get("tidy5e-sheet", "hideClassList")) {
			let actor = game.actors.entities.find(a => a.data._id === data.actor._id);
			let classList = [];
			let items = data.actor.items;
			console.log(items);
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
// Copy magic item spell to favorites
// async function copyMagicItems(app, html, data) { 
// 	if ($('.tidy5e .magic-items-spells-content')) {
// 		setTimeout(function(){ 
// 		let magicItems = $('.tidy5e .magic-items-spells-content'),
// 				target = $('.tidy5e .favorites-target .favorites'),
// 				listWrapper = '<ul class="inventory-list items-list magic-list"></ul>';

// 				target.append(listWrapper);

// 				console.log(magicItems);
// 				console.log(target);

// 				magicItems.clone().appendTo($('.inventory-list.items-list.magic-list'));
// 		 }, 50);
// 	}
// }

// Manage Sheet Options
async function setSheetClasses(app, html, data) {
	let actor = game.actors.entities.find(a => a.data._id === data.actor._id);
	if (game.settings.get("tidy5e-sheet", "useRoundPortraits")) {
		html.find('.tidy5e-sheet .profile').addClass('roundPortrait');
	}
	if (game.settings.get("tidy5e-sheet", "disableHpOverlay")) {
		html.find('.tidy5e-sheet .profile').addClass('disable-hp-overlay');
	}
	if (game.settings.get("tidy5e-sheet", "disableInspiration")) {
		html.find('.tidy5e-sheet .profile .inspiration').addClass('disabled');
	}
	if (game.settings.get("tidy5e-sheet", "noInspirationAnimation")) {
		html.find('.tidy5e-sheet .profile .inspiration label i').addClass('disable-animation');
	}
	if (game.settings.get("tidy5e-sheet", "hpOverlayBorder") > 0) {
		html.find('.tidy5e-sheet .profile .hp-overlay').css({'border-width':game.settings.get("tidy5e-sheet", "hpOverlayBorder")+'px'});
	}
	if(game.settings.get("tidy5e-sheet", "hideIfZero")) {
		html.find('.tidy5e-sheet .profile').addClass('autohide');
	}
	if (game.settings.get("tidy5e-sheet", "disableExhaustion")) {
		html.find('.tidy5e-sheet .profile .exhaustion-container').addClass('disabled');
	}
	if (game.settings.get("tidy5e-sheet", "exhaustionOnHover")) {
		html.find('.tidy5e-sheet .profile').addClass('exhaustionOnHover');
	}
	if (game.settings.get("tidy5e-sheet", "restOnHover")) {
		html.find('.tidy5e-sheet .profile').addClass('restOnHover');
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
}

// Preload tidy5e Handlebars Templates
Hooks.once("init", () => {
  preloadTidy5eHandlebarsTemplates();

	game.settings.register("tidy5e-sheet", "useDarkMode", {
    name: game.i18n.localize("TIDY5E.Settings.UseDarkMode.name"),
    hint: game.i18n.localize("TIDY5E.Settings.UseDarkMode.hint"),
		scope: "user",
		config: true,
		default: false,
		type: Boolean,
		onChange: data => {
      data === true ? document.body.classList.add("tidy5eDark"):document.body.classList.remove("tidy5eDark");
     }
	});

	game.settings.register("tidy5e-sheet", "primaryAccent", {
    name: game.i18n.localize("TIDY5E.Settings.PrimaryAccentColor.name"),
    hint: game.i18n.localize("TIDY5E.Settings.PrimaryAccentColor.hint"),
		scope: "user",
		config: true,
		default: "",
		type: String,
		onChange: data => {
			if(data){
				document.documentElement.style.setProperty('--default-primary-accent',data);
				document.documentElement.style.setProperty('--darkmode-primary-accent',data);
			} else {
				document.documentElement.style.setProperty('--default-primary-accent',"#ff6400");
				document.documentElement.style.setProperty('--darkmode-primary-accent',"#48BB78");
			}
     }
	});

	game.settings.register("tidy5e-sheet", "secondaryAccent", {
    name: game.i18n.localize("TIDY5E.Settings.SecondaryAccentColor.name"),
    hint: game.i18n.localize("TIDY5E.Settings.SecondaryAccentColor.hint"),
		scope: "user",
		config: true,
		default: "",
		type: String,
		onChange: data => {
			if(data){
				document.documentElement.style.setProperty('--default-secondary-accent',data);
				document.documentElement.style.setProperty('--darkmode-secondary-accent',data);
			} else {
				document.documentElement.style.setProperty('--default-secondary-accent',"rgba(210,0,255,.1)");
				document.documentElement.style.setProperty('--darkmode-secondary-accent',"rgba(0,150,150,.325)");
			}
     }
	});

	game.settings.register("tidy5e-sheet", "alwaysPreparedAccent", {
    name: game.i18n.localize("TIDY5E.Settings.AlwaysPreparedAccentColor.name"),
    hint: game.i18n.localize("TIDY5E.Settings.AlwaysPreparedAccentColor.hint"),
		scope: "user",
		config: true,
		default: "",
		type: String,
		onChange: data => {
			if(data){
				document.documentElement.style.setProperty('--always-prepared-accent',data);
				document.documentElement.style.setProperty('--darkmode-always-prepared-accent',data);
			} else {
				document.documentElement.style.setProperty('--always-prepared-accent',"rgba(210,0,255,.1)");
				document.documentElement.style.setProperty('--darkmode-always-prepared-accent',"rgba(0,150,150,.325)");
			}
    }
	});

  const useDarkMode = game.settings.get('tidy5e-sheet', "useDarkMode");
  if (useDarkMode === true) {
    document.body.classList.add("tidy5eDark");
  }

  const primaryAccentColor = game.settings.get('tidy5e-sheet', "primaryAccent");
  if(primaryAccentColor !==  '') {
  	document.documentElement.style.setProperty('--default-primary-accent',primaryAccentColor);
  }
  if(useDarkMode === true && primaryAccentColor !==  '') {
  	document.documentElement.style.setProperty('--darkmode-primary-accent',primaryAccentColor);
  }

  const secondaryAccentColor = game.settings.get('tidy5e-sheet', "secondaryAccent");
  if(secondaryAccentColor !==  '') {
   	document.documentElement.style.setProperty('--default-secondary-accent',secondaryAccentColor);	
  }
  if(useDarkMode === true && secondaryAccentColor !==  '') {
   	document.documentElement.style.setProperty('--darkmode-secondary-accent',secondaryAccentColor);	
  }
  
  const alwaysPreparedAccent = game.settings.get('tidy5e-sheet', "alwaysPreparedAccent");
  if(alwaysPreparedAccent !==  '') {
  	document.documentElement.style.setProperty('--always-prepared-accent',alwaysPreparedAccent);
  } 
  if(useDarkMode === true && alwaysPreparedAccent !==  '') {
  	document.documentElement.style.setProperty('--darkmode-always-prepared-accent',alwaysPreparedAccent);
  }
});

// Register Tidy5e Sheet and make default character sheet
Actors.registerSheet("dnd5e", Tidy5eSheet, {
	types: ["character"],
	makeDefault: true
});

Hooks.on("renderTidy5eSheet", (app, html, data) => {
	// migrateTraits(app, html, data);
	addFavorites(app, html, data, position);
	addClassList(app, html, data);
	setSheetClasses(app, html, data);
	toggleTraitsList(app, html, data)
	checkDeathSaveStatus(app, html, data);
	countInventoryItems(app,html,data);
	// checkMagicItems(app, html, data);
	countAttunedItems(app, html, data);
	// console.log(data);
	console.log("Tidy5e Sheet rendered!");
});

Hooks.once("ready", () => {
	console.log("Tidy5e Sheet is ready!");
	
	// can be removed when 0.7.x is stable
	if (window.BetterRolls) {
	  window.BetterRolls.hooks.addActorSheet("Tidy5eSheet");
	}

  game.settings.register("tidy5e-sheet", "useExpandedSheet", {
    name: game.i18n.localize("TIDY5E.Settings.UseExpandedSheet.name"),
    hint: game.i18n.localize("TIDY5E.Settings.UseExpandedSheet.hint"),
    scope: "world",
    config: true,
    default: false,
    type: Boolean
  });

	game.settings.register("tidy5e-sheet", "useRoundPortraits", {
		name: game.i18n.localize("TIDY5E.Settings.UseRoundPortraits.name"),
		hint: game.i18n.localize("TIDY5E.Settings.UseRoundPortraits.hint"),
		scope: "world",
		config: true,
		default: false,
		type: Boolean
	});
	game.settings.register("tidy5e-sheet", "hpOverlayBorder", {
		name: game.i18n.localize("TIDY5E.Settings.HpOverlayBorder.name"),
		hint: game.i18n.localize("TIDY5E.Settings.HpOverlayBorder.hint"),
		scope: "world",
		config: true,
		default: 0,
		type: Number
	});
	game.settings.register("tidy5e-sheet", "disableHpOverlay", {
		name: game.i18n.localize("TIDY5E.Settings.DisableHpOverlay.name"),
		hint: game.i18n.localize("TIDY5E.Settings.DisableHpOverlay.hint"),
		scope: "user",
		config: true,
		default: false,
		type: Boolean
	});
	game.settings.register("tidy5e-sheet", "hideClassList", {
		name: game.i18n.localize("TIDY5E.Settings.HideClassList.name"),
		hint: game.i18n.localize("TIDY5E.Settings.HideClassList.hint"),
		scope: "user",
		config: true,
		default: false,
		type: Boolean
	});
	game.settings.register("tidy5e-sheet", "disableInspiration", {
		name: game.i18n.localize("TIDY5E.Settings.DisableInspiration.name"),
		hint: game.i18n.localize("TIDY5E.Settings.DisableInspiration.hint"),
		scope: "world",
		config: true,
		default: false,
		type: Boolean
	});
	game.settings.register("tidy5e-sheet", "disableExhaustion", {
		name: game.i18n.localize("TIDY5E.Settings.DisableExhaustion.name"),
		hint: game.i18n.localize("TIDY5E.Settings.DisableExhaustion.hint"),
		scope: "world",
		config: true,
		default: false,
		type: Boolean
	});
	game.settings.register("tidy5e-sheet", "noInspirationAnimation", {
		name: game.i18n.localize("TIDY5E.Settings.DisableInspirationAnimation.name"),
		hint: game.i18n.localize("TIDY5E.Settings.DisableInspirationAnimation.hint"),
		scope: "user",
		config: true,
		default: false,
		type: Boolean
	});
	game.settings.register("tidy5e-sheet", "hideIfZero", {
		name: game.i18n.localize("TIDY5E.Settings.HideIfZero.name"),
		hint: game.i18n.localize("TIDY5E.Settings.HideIfZero.hint"),
		scope: "user",
		config: true,
		default: false,
		type: Boolean
	});
	game.settings.register("tidy5e-sheet", "exhaustionOnHover", {
		name: game.i18n.localize("TIDY5E.Settings.ExhaustionOnHover.name"),
		hint: game.i18n.localize("TIDY5E.Settings.ExhaustionOnHover.hint"),
		scope: "user",
		config: true,
		default: false,
		type: Boolean
	});
	game.settings.register("tidy5e-sheet", "inspirationOnHover", {
		name: game.i18n.localize("TIDY5E.Settings.InspirationOnHover.name"),
		hint: game.i18n.localize("TIDY5E.Settings.InspirationOnHover.hint"),
		scope: "user",
		config: true,
		default: false,
		type: Boolean
	});
	game.settings.register("tidy5e-sheet", "restOnHover", {
		name: game.i18n.localize("TIDY5E.Settings.RestOnHover.name"),
		hint: game.i18n.localize("TIDY5E.Settings.RestOnHover.hint"),
		scope: "user",
		config: true,
		default: false,
		type: Boolean
	});
  game.settings.register("tidy5e-sheet", "moveTraits", {
		name: game.i18n.localize("TIDY5E.Settings.MoveTraits.name"),
		hint: game.i18n.localize("TIDY5E.Settings.MoveTraits.hint"),
    scope: "user",
    config: true,
    default: false,
    type: Boolean
  });
  game.settings.register("tidy5e-sheet", "pcToggleTraits", {
		name: game.i18n.localize("TIDY5E.Settings.PcToggleTraits.name"),
		hint: game.i18n.localize("TIDY5E.Settings.PcToggleTraits.hint"),
    scope: "user",
    config: true,
    default: false,
    type: Boolean
  });
});