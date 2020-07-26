import { DND5E } from "../../systems/dnd5e/module/config.js";
import ActorSheet5e from "../../systems/dnd5e/module/actor/sheets/base.js";
import ActorSheet5eCharacter from "../../systems/dnd5e/module/actor/sheets/character.js";

import { preloadTidy5eHandlebarsTemplates } from "./templates/tidy5e-templates.js";
import { addFavorites } from "./tidy5e-favorites.js";

let position = 0;

// handlebar helper compare string
Handlebars.registerHelper('ifEquals', function(arg1, arg2, options) {
    return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
});

export class Tidy5eSheet extends ActorSheet5eCharacter {
	
	get template() {
		if ( !game.user.isGM && this.actor.limited ) return "modules/tidy5e-sheet/templates/tidy5e-sheet-ltd.html";
		return "modules/tidy5e-sheet/templates/tidy5e-sheet.html";
	}
	
	static get defaultOptions() {
	  return mergeObject(super.defaultOptions, {
			classes: ["tidy5e", "dnd5e", "sheet", "actor", "character"],
			blockFavTab: true,
			width: 740,
			height: 720
		});
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

		// toggle item delete protection
		html.find('.tidy5e-delete-toggle').click(async (event) => {
			event.preventDefault();
			let actor = this.actor;

			if(actor.getFlag('tidy5e-sheet', 'allow-delete')){
				await actor.unsetFlag('tidy5e-sheet', 'allow-delete');
			} else {
				await actor.setFlag('tidy5e-sheet', 'allow-delete', true);
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

		// toggle favorites
 		html.find('.favorites-toggle').click(async (event) => {
			event.preventDefault();
			let actor = this.actor;

			if(actor.getFlag('tidy5e-sheet', 'favorites-compressed')){
				await actor.unsetFlag('tidy5e-sheet', 'favorites-compressed');
			} else {
				await actor.setFlag('tidy5e-sheet', 'favorites-compressed', true);
			}
 		});

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
    html.find('.item:not(.inventory-header) input').change(event => {
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


	}
}

// should no longer be needed
// Migrate Traits to default dnd5e data
// async function migrateTraits(app, html, data) {
// 	let actor = game.actors.entities.find(a => a.data._id === data.actor._id);

// 	if (!actor.getFlag('tidy5e-sheet', 'useCoreTraits')){
	
// 		console.log('Tidy5e Sheet | Data needs migration! Migrating.');

// 		let coreTrait = (actor.data.data.details.trait !== '') ? actor.data.data.details.trait+"<br>Migrated Content:" : '';
// 		let coreIdeal = (actor.data.data.details.ideal !== '') ? actor.data.data.details.trait+"<br>Migrated Content:" : '';
// 		let coreBond = (actor.data.data.details.bond !== '') ? actor.data.data.details.bond+"<br>Migrated Content:" : '';
// 		let coreFlaw = (actor.data.data.details.flaw !== '') ? actor.data.data.details.flaw+"<br>Migrated Content:" : '';

// 		let trait = (actor.data.data.details.personality && actor.data.data.details.personality.value) ? coreTrait + actor.data.data.details.personality.value : actor.data.data.details.trait;
// 		let ideal = (actor.data.data.details.ideals && actor.data.data.details.ideals.value) ? coreIdeal + actor.data.data.details.ideals.value : actor.data.data.details.ideal;
// 		let bond = (actor.data.data.details.bonds && actor.data.data.details.bonds.value) ? coreBond + actor.data.data.details.bonds.value : actor.data.data.details.bond;
// 		let flaw = (actor.data.data.details.flaws && actor.data.data.details.flaws.value) ? coreFlaw + actor.data.data.details.flaws.value : actor.data.data.details.flaw;

// 		await actor.update({
// 			"data.details.trait": trait,
// 			"data.details.ideal": ideal,
// 			"data.details.bond": bond,
// 			"data.details.flaw": flaw,
// 			"data.details.personality": null,
// 			"data.details.-=personality": null,
// 			"data.details.ideals": null,
// 			"data.details.-=ideals": null,
// 			"data.details.bonds": null,
// 			"data.details.-=bonds": null,
// 			"data.details.flaws": null,
// 			"data.details.-=flaws": null,
// 			"flags.tidy5e-sheet.useCoreTraits":true
// 		});

// 		console.log('Tidy5e Sheet | Data migrated to dnd5e core values.')
// 	}
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
async function addClassList(app, html, data) { 
	if (!game.settings.get("tidy5e-sheet", "hideClassList")) {
		let actor = game.actors.entities.find(a => a.data._id === data.actor._id);
		let classList = [];
		let items = data.actor.items;
		for (let item of items) {
			if (item.type === "class") {
				let subclass = (item.data.subclass) ? ` <div class="subclass-info has-note"><span>S</span><div class="note">${item.data.subclass}</div></div>` : ``;
				classList.push(item.name + subclass);
			}
		}
		classList = "<ul class='class-list'><li class='class-item'>" + classList.join("</li><li class='class-item'>") + "</li></ul>";
		mergeObject(actor, {"data.flags.tidy5e-sheet.classlist": classList});
		let classListTarget = html.find('.level-information');
		classListTarget.after(classList);

	}
}

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
		name: "Use alternate dark mode",
		hint: "Checking this option will enable an alternate Dark Mode version of the Tidy5e Sheet.",
		scope: "user",
		config: true,
		default: false,
		type: Boolean,
		onChange: data => {
      data === true ? document.body.classList.add("tidy5eDark"):document.body.classList.remove("tidy5eDark");
     }
	});

	game.settings.register("tidy5e-sheet", "primaryAccent", {
		name: "Primary accent color.",
		hint: "Overwrite the default primary accent color (#48BB78) for Dark Mode used to highlight e. g. buttons, input field borders or hover states. Use any valid css value like red/#ff0000/rgba(255,0,0)/rgba(255,0,0,1)",
		scope: "user",
		config: true,
		default: "",
		type: String,
		onChange: data => {
      data === true ? document.documentElement.style.setProperty('--darkmode-primary-accent',primaryAccentColor)
  :document.documentElement.style.setProperty('--darkmode-primary-accent',"#48BB78");
     }
	});

	game.settings.register("tidy5e-sheet", "secondaryAccent", {
		name: "Secondary accent color.",
		hint: "Overwrite the default secondary accent color (rgba(0,150,150,.325)) for Dark Mode used to highlight preparation states. Use any valid css value like red/#ff0000/rgba(255,0,0)/rgba(255,0,0,1)",
		scope: "user",
		config: true,
		default: "",
		type: String,
		onChange: data => {
      data === true ? document.documentElement.style.setProperty('--darkmode-secondary-accent',secondaryAccentColor)
  :document.documentElement.style.setProperty('--darkmode-secondary-accent',"rgba(0,150,150,.325)");
     }
	});

  const useDarkMode = game.settings.get('tidy5e-sheet', "useDarkMode");
  if (useDarkMode === true) {
    document.body.classList.add("tidy5eDark");
  }
  const primaryAccentColor = game.settings.get('tidy5e-sheet', "primaryAccent");
  const secondaryAccentColor = game.settings.get('tidy5e-sheet', "secondaryAccent");
  if(useDarkMode === true && primaryAccentColor !==  '') {
  	document.documentElement.style.setProperty('--darkmode-primary-accent',primaryAccentColor);
  }
  if(useDarkMode === true && secondaryAccentColor !==  '') {
   	document.documentElement.style.setProperty('--darkmode-secondary-accent',secondaryAccentColor);	
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
	if (game.modules.get("inventory-plus")?.active){
		app.inventoryPlus.addInventoryFunctions(html);
	}
	// console.log(data);
	console.log("Tidy5e Sheet rendered!");
});

Hooks.once("ready", () => {
	console.log("Tidy5e Sheet is ready!");
	
	if (window.BetterRolls) {
	  window.BetterRolls.hooks.addActorSheet("Tidy5eSheet");
	}
	
	game.settings.register("tidy5e-sheet", "useRoundPortraits", {
		name: "PC Sheets: Sheets use round portraits.",
		hint: "You should check this if you use round portraits. It will adapt the hp overlay and portait buttons to make it look nicer. Also looks nice on square portraits without a custom frame.",
		scope: "world",
		config: true,
		default: false,
		type: Boolean
	});
	game.settings.register("tidy5e-sheet", "hpOverlayBorder", {
		name: "PC Sheets: Border width for the hit point overlay",
		hint: "If your portrait has a frame you can adjust the Hit Point overlay to compensate the frame width. It might look nicer if the overlay doesn't tint the border.",
		scope: "world",
		config: true,
		default: 0,
		type: Number
	});
	game.settings.register("tidy5e-sheet", "disableHpOverlay", {
		name: "Disable the hit point overlay.",
		hint: "If you don't like the video game style Hit Point overlay on your character's portrait you can disable it.",
		scope: "user",
		config: true,
		default: false,
		type: Boolean
	});
	game.settings.register("tidy5e-sheet", "hideClassList", {
		name: "Hide character class list",
		hint: "Checking this option will hide the character's class list next to the level label. The sheet can handle 3 classes well, more than that will work but things get shifty ;)",
		scope: "user",
		config: true,
		default: false,
		type: Boolean
	});
	game.settings.register("tidy5e-sheet", "disableInspiration", {
		name: "Disable Inspiration Tracker",
		hint: "If your campaign doesn't use inspiration you can disable the tracker completely.",
		scope: "world",
		config: true,
		default: false,
		type: Boolean
	});
	game.settings.register("tidy5e-sheet", "disableExhaustion", {
		name: "Disable Exhaustion Tracker",
		hint: "If your campaign doesn't use exhaustion you can disable the tracker completely.",
		scope: "world",
		config: true,
		default: false,
		type: Boolean
	});
	game.settings.register("tidy5e-sheet", "noInspirationAnimation", {
		name: "No inspiration indicator animation.",
		hint: "If it's too distracting, you can disable the subtle animation of the glowing inspiration indicator.",
		scope: "user",
		config: true,
		default: false,
		type: Boolean
	});
	game.settings.register("tidy5e-sheet", "hideIfZero", {
		name: "Hide Exhaustion and Inspiration when not available (0)",
		hint: "Check this option if you want to hide Exhaustion if its level is 0 and Inspiration if you have none. Appears on hover.",
		scope: "user",
		config: true,
		default: false,
		type: Boolean
	});
	game.settings.register("tidy5e-sheet", "exhaustionOnHover", {
		name: "Show exhaustion tracker only on hover",
		hint: "If you check this option the exhaustion tracker will only be visible when you hover over the portrait",
		scope: "user",
		config: true,
		default: false,
		type: Boolean
	});
	game.settings.register("tidy5e-sheet", "inspirationOnHover", {
		name: "Show inspiration indicator only on hover",
		hint: "If you check this option the inspiration indicator will only be visible when you hover over the portrait",
		scope: "user",
		config: true,
		default: false,
		type: Boolean
	});
	game.settings.register("tidy5e-sheet", "restOnHover", {
		name: "Show rest button on hover",
		hint: "If you check this option the rest button will only be visible when you hover over the portrait",
		scope: "user",
		config: true,
		default: false,
		type: Boolean
	});
  game.settings.register("tidy5e-sheet", "moveTraits", {
    name: "Move traits below resources",
    hint: "Check this if you want to show the traits below the resources.",
    scope: "user",
    config: true,
    default: false,
    type: Boolean
  });
  game.settings.register("tidy5e-sheet", "pcToggleTraits", {
    name: "Show Toggle button for character traits",
    hint: "Check this if you want to show a button to toggle empty traits.",
    scope: "user",
    config: true,
    default: false,
    type: Boolean
  });
});