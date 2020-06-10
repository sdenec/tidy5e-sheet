import { DND5E } from "../../systems/dnd5e/module/config.js";
import ActorSheet5e from "../../systems/dnd5e/module/actor/sheets/base.js";
import ActorSheet5eCharacter from "../../systems/dnd5e/module/actor/sheets/character.js";

import { preloadTidy5eHandlebarsTemplates } from "./templates/tidy5e-templates.js";
import { addFavorites } from "./tidy5e-favorites.js";

let scrollPos = 0;

export class Tidy5eSheet extends ActorSheet5eCharacter {
	
	get template() {
		if ( !game.user.isGM && this.actor.limited ) return "modules/tidy5e-sheet/templates/tidy5e-sheet-ltd.html";
		return "modules/tidy5e-sheet/templates/tidy5e-sheet.html";
	}
	
	static get defaultOptions() {
	  return mergeObject(super.defaultOptions, {
			classes: ["tidy5e", "dnd5e", "sheet", "actor", "character"],
			blockFavTab: true,
			width: 740
		});
	}
	
	_createEditor(target, editorOptions, initialContent) {
		editorOptions.min_height = 200;
		super._createEditor(target, editorOptions, initialContent);
	}

	activateListeners(html) {
		super.activateListeners(html);

		// store Scroll Pos
		let attributesTab = html.find('.tab.attributes');
		attributesTab.scroll(function(){
			scrollPos = $(this).scrollTop();
		});
		let tabNav = html.find('a.item:not([data-tab="attributes"])');
		tabNav.click(function(){
			scrollPos = 0;
			attributesTab.scrollTop(scrollPos);
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

 		// changing item qty and charges values (removing if both value and max are 0)
    html.find('.item:not(.inventory-header) input').change(event => {
    	let value = event.target.value;
    	console.log(value);
			let actor = this.actor;
      let itemId = $(event.target).parents('.item')[0].dataset.itemId;
      console.log(itemId);
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

	}
}

// Migrate Traits to default dnd5e data
async function migrateTraits(app, html, data) {
	let actor = game.actors.entities.find(a => a.data._id === data.actor._id);

	if (!actor.getFlag('tidy5e-sheet', 'useCoreTraits')){
	
		console.log('Tidy5e Sheet | Data needs migration! Migrating.');

		let coreTrait = (actor.data.data.details.trait !== '') ? actor.data.data.details.trait+"<br>Migrated Content:" : '';
		let coreIdeal = (actor.data.data.details.ideal !== '') ? actor.data.data.details.trait+"<br>Migrated Content:" : '';
		let coreBond = (actor.data.data.details.bond !== '') ? actor.data.data.details.bond+"<br>Migrated Content:" : '';
		let coreFlaw = (actor.data.data.details.flaw !== '') ? actor.data.data.details.flaw+"<br>Migrated Content:" : '';

		let trait = (actor.data.data.details.personality && actor.data.data.details.personality.value) ? coreTrait + actor.data.data.details.personality.value : actor.data.data.details.trait;
		let ideal = (actor.data.data.details.ideals && actor.data.data.details.ideals.value) ? coreIdeal + actor.data.data.details.ideals.value : actor.data.data.details.ideal;
		let bond = (actor.data.data.details.bonds && actor.data.data.details.bonds.value) ? coreBond + actor.data.data.details.bonds.value : actor.data.data.details.bond;
		let flaw = (actor.data.data.details.flaws && actor.data.data.details.flaws.value) ? coreFlaw + actor.data.data.details.flaws.value : actor.data.data.details.flaw;

		await actor.update({
			"data.details.trait": trait,
			"data.details.ideal": ideal,
			"data.details.bond": bond,
			"data.details.flaw": flaw,
			"data.details.personality": null,
			"data.details.-=personality": null,
			"data.details.ideals": null,
			"data.details.-=ideals": null,
			"data.details.bonds": null,
			"data.details.-=bonds": null,
			"data.details.flaws": null,
			"data.details.-=flaws": null,
			"flags.tidy5e-sheet.useCoreTraits":true
		});

		console.log('Tidy5e Sheet | Data migrated to dnd5e core values.')
	}
}

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
		};
		classList = "<ul class='class-list'><li class='class-item'>" + classList.join("</li><li class='class-item'>") + "</li></ul>";
		mergeObject(actor, {"data.flags.tidy5e-sheet.classlist": classList});
		let classListTarget = html.find('.level-information');
		classListTarget.after(classList);

	};
}

async function setSheetClasses(app, html, data) {
	if (game.settings.get("tidy5e-sheet", "useRoundPortraits")) {
		html.find('.tidy5e-sheet .profile').addClass('roundPortrait');
	};
	if (game.settings.get("tidy5e-sheet", "disableHpOverlay")) {
		html.find('.tidy5e-sheet .profile').addClass('disable-hp-overlay');
	};
	if (game.settings.get("tidy5e-sheet", "noInspirationAnimation")) {
		html.find('.tidy5e-sheet .inspiration label i').addClass('disable-animation');
	};
	if (game.settings.get("tidy5e-sheet", "hpOverlayBorder") > 0) {
		html.find('.tidy5e-sheet .profile .hp-overlay').css({'border-width':game.settings.get("tidy5e-sheet", "hpOverlayBorder")+'px'});
	};
}

async function hidePortraitButtons(app, html, data){
	if (game.settings.get("tidy5e-sheet", "exhaustionOnHover")) {
		html.find('.tidy5e-sheet .profile').addClass('exhaustionOnHover');
	};
	if (game.settings.get("tidy5e-sheet", "restOnHover")) {
		html.find('.tidy5e-sheet .profile').addClass('restOnHover');
	};
	if (game.settings.get("tidy5e-sheet", "inspirationOnHover")) {
		html.find('.tidy5e-sheet .profile').addClass('inspirationOnHover');
	};
}

// Preload tidy5e Handlebars Templates
Hooks.once("init", () => {
  preloadTidy5eHandlebarsTemplates();

	game.settings.register("tidy5e-sheet", "useDarkMode", {
		name: "Use alternate Dark Mode version of the sheet",
		hint: "Checking this option will enable an alternate Dark Mode version of the Tidy5e Sheet. Goes well with D&D5E Dark Mode or as a Standalone.",
		scope: "user",
		config: true,
		default: false,
		type: Boolean,
		onChange: data => {
      data === true ? document.body.classList.add("tidy5eDark"):document.body.classList.remove("tidy5eDark");
     }
	});

  const useDarkMode = game.settings.get('tidy5e-sheet', "useDarkMode");
  if (useDarkMode === true) {
    document.body.classList.add("tidy5eDark");
  }
});

// Register Tidy5e Sheet and make default character sheet
Actors.registerSheet("dnd5e", Tidy5eSheet, {
	types: ["character"],
	makeDefault: true
});

Hooks.on("renderTidy5eSheet", (app, html, data) => {
	addFavorites(app, html, data, scrollPos);
	migrateTraits(app, html, data);
	addClassList(app, html, data);
	setSheetClasses(app, html, data);
	checkDeathSaveStatus(app, html, data);
	hidePortraitButtons(app, html, data);
	console.log(data);
});

Hooks.once("ready", () => {

	if (window.BetterRolls) {
	  window.BetterRolls.hooks.addActorSheet("Tidy5eSheet");
	}
	game.settings.register("tidy5e-sheet", "useRoundPortraits", {
		name: "Character sheet uses round portraits.",
		hint: "You should check this if you use round portraits. It will adapt the hp overlay and portait buttons to make it look nicer. Also looks nice on square portraits without a custom frame.",
		scope: "world",
		config: true,
		default: false,
		type: Boolean
	});
	game.settings.register("tidy5e-sheet", "disableHpOverlay", {
		name: "Disable the Hit Point Overlay.",
		hint: "If you don't like the video game style Hit Point overlay on your character's portrait you can disable it.",
		scope: "user",
		config: true,
		default: false,
		type: Boolean
	});
	game.settings.register("tidy5e-sheet", "hpOverlayBorder", {
		name: "Border width for the Hit Point overlay",
		hint: "If your portrait has a frame you can adjust the Hit Point overlay to compensate the frame width. It might look nicer if the overlay doesn't tint the border.",
		scope: "world",
		config: true,
		default: 0,
		type: Number
	});
	game.settings.register("tidy5e-sheet", "noInspirationAnimation", {
		name: "No inspiration indicator animation.",
		hint: "If it's too distracting, you can disable the subtle animation of the glowing inspiration indicator.",
		scope: "user",
		config: true,
		default: false,
		type: Boolean
	});
	game.settings.register("tidy5e-sheet", "exhaustionOnHover", {
		name: "Show exhaustion tracker only on Hover",
		hint: "If you check this option the exhaustion tracker will only be visible when you hover over the portrait",
		scope: "user",
		config: true,
		default: false,
		type: Boolean
	});
	game.settings.register("tidy5e-sheet", "restOnHover", {
		name: "Show rest button only on Hover",
		hint: "If you check this option the rest button will only be visible when you hover over the portrait",
		scope: "user",
		config: true,
		default: false,
		type: Boolean
	});
	game.settings.register("tidy5e-sheet", "inspirationOnHover", {
		name: "Show inspiration indicator only on Hover",
		hint: "If you check this option the inspiration indicator will only be visible when you hover over the portrait",
		scope: "user",
		config: true,
		default: false,
		type: Boolean
	});
	game.settings.register("tidy5e-sheet", "hideClassList", {
		name: "Hide Character Class List",
		hint: "Checking this option will hide the character's class list next to the level label. The sheet can handle 3 classes well, more than that will work but things get shifty ;)",
		scope: "world",
		config: true,
		default: false,
		type: Boolean
	});
});