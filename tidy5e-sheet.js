import { DND5E } from "../../systems/dnd5e/module/config.js";
import ActorSheet5e from "../../systems/dnd5e/module/actor/sheets/base.js";
import ActorSheet5eCharacter from "../../systems/dnd5e/module/actor/sheets/character.js";

import { preloadTidy5eHandlebarsTemplates } from "./templates/tidy5e-templates.js";

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
		// toggle item delete protection
		html.find('.tidy5e-delete-toggle').click(async (event) => {
			event.preventDefault();
			let actor = this.actor;

			// clean up previous versions
			// await actor.update({"data.-=allow-delete": null}); 
			// await actor.update({"data.-=settings": null}); 

			// set proper flag
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

	}
}

// Handle previous editor Data
async function detectCustomEditorFields(app, html, data) {
	var actor = game.actors.entities.find(a => a.data._id === data.actor._id);
	var data = actor.data.data;

	var customFieldTrait = data.details.personality;
	var customFieldIdeal = data.details.ideals;
	var customFieldBond = data.details.bonds;
	var customFieldFlaw = data.details.flaws;

	if( customFieldTrait && customFieldTrait.value !== null || 
			customFieldIdeal && customFieldIdeal.value !== null || 
			customFieldBond && customFieldBond.value !== null || 
			customFieldFlaw && customFieldFlaw.value !== null){

		let importMessage = "<div class='data-import-message'><p>It appears you have data from custom fields for Traits, Ideals, Bonds or Flaws from either Sky's alternate 5e Sheet or a previous version of Tidy5e Sheet. This version of Tidy5e is updated to use the default fields of the dnd5e System to ensure compatibility.</p><button class='append-editor-data'>Migrate Data to this sheet.</button></div>";
		html.find('.tab.biography').prepend(importMessage);

		html.find('.data-import-message .append-editor-data').click( async (event) => {
			await actor.update({"data.details.trait": data.details.trait +"<hr>"+ customFieldTrait.value});
			await actor.update({"data.details.ideal": data.details.ideal +"<hr>"+ customFieldIdeal.value});
			await actor.update({"data.details.bond": data.details.bond +"<hr>"+ customFieldBond.value});
			await actor.update({"data.details.flaw": data.details.flaw +"<hr>"+ customFieldFlaw.value});
			discardCustomEditorData();
 		});

 		async function discardCustomEditorData(){
			await actor.update({"data.details.-=personality.value": null});
			await actor.update({"data.details.-=personality": null});
			await actor.update({"data.details.-=ideals.value": null});
			await actor.update({"data.details.-=ideals": null});
			await actor.update({"data.details.-=bonds.value": null});
			await actor.update({"data.details.-=bonds": null});
			await actor.update({"data.details.-=flaws.value": null});
			await actor.update({"data.details.-=flaws": null});
 		}
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

	// let currentHealth = actor.data.
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

// The following function is adapted for the Tidy5eSheet from the Favorites Item
// Tab Module created for Foundry VTT - by Felix Müller (Felix#6196 on Discord).
// It is licensed under a Creative Commons Attribution 4.0 International License
// and can be found at https://github.com/syl3r86/favtab.

async function addFavorites(app, html, data) {
	let favItems = [];
	let favFeats = [];
	let favSpells = {
		0: { isCantrip: true, spells: [] },
		1: { spells: [], value: data.actor.data.spells.spell1.value, max: data.actor.data.spells.spell1.max },
		2: { spells: [], value: data.actor.data.spells.spell2.value, max: data.actor.data.spells.spell2.max },
		3: { spells: [], value: data.actor.data.spells.spell3.value, max: data.actor.data.spells.spell3.max },
		4: { spells: [], value: data.actor.data.spells.spell4.value, max: data.actor.data.spells.spell4.max },
		5: { spells: [], value: data.actor.data.spells.spell5.value, max: data.actor.data.spells.spell5.max },
		6: { spells: [], value: data.actor.data.spells.spell6.value, max: data.actor.data.spells.spell6.max },
		7: { spells: [], value: data.actor.data.spells.spell7.value, max: data.actor.data.spells.spell7.max },
		8: { spells: [], value: data.actor.data.spells.spell8.value, max: data.actor.data.spells.spell8.max },
		9: { spells: [], value: data.actor.data.spells.spell9.value, max: data.actor.data.spells.spell9.max }
	}
	
	let spellCount = 0
	let items = data.actor.items;

	for (let item of items) {
		if (item.type == "class") continue;
		if (item.flags.favtab === undefined || item.flags.favtab.isFavourite === undefined) {
			item.flags.favtab = { isFavourite: false };
		}
		let isFav = item.flags.favtab.isFavourite;
		if (app.options.editable) {
			let favBtn = $(`<a class="item-control item-fav" data-fav="${isFav}" title="${isFav ? "Remove from Favourites" : "Add to Favourites"}"><i class="${isFav ? "fas fa-bookmark" : "far fa-bookmark"}"></i></a>`);
			favBtn.click(ev => {
				app.actor.getOwnedItem(item._id).update({
					"flags.favtab.isFavourite": !item.flags.favtab.isFavourite
				});
			});
			html.find(`.item[data-item-id="${item._id}"]`).find('.item-controls').prepend(favBtn);
		}
		
		if (isFav) {

			item.quantity = item.data.quantity;
			// console.log(item.quantity);
			item.showquant = false;
			if ( item.quantity != undefined && item.quantity > 1){
				item.showquant = true;
			}
			
			item.action = "";
			if (item.data.activation) {
				item.action = item.data.activation.cost +' '+item.data.activation.type;
			} 
			item.spellComps = "";
			if (item.data.components) {
				let comps = item.data.components;
				let v = (comps.vocal) ? "V" : "";
				let s = (comps.somatic) ? "S" : "";
				let m = (comps.material) ? "M" : "";
				let c = (comps.concentration) ? true : false;
				let r = (comps.ritual) ? true : false;
				item.spellComps = `${v}${s}${m}`;
				item.spellCon = c;
				item.spellRit = r;
			}
			
			item.editable = app.options.editable;
			switch (item.type) {
			case 'feat':
				if (item.flags.favtab.sort === undefined) {
					item.flags.favtab.sort = (favFeats.count + 1) * 100000; // initial sort key if not present
				}
				favFeats.push(item);
				break;
			case 'spell':
				if (item.data.preparation.mode) {
					item.spellPrepMode = ` (${CONFIG.DND5E.spellPreparationModes[item.data.preparation.mode]})`
				}
				if (item.data.level) {
					favSpells[item.data.level].spells.push(item);
				} else {
					favSpells[0].spells.push(item);
				}
				spellCount++;
				break;
			default:
				if (item.flags.favtab.sort === undefined) {
					item.flags.favtab.sort = (favItems.count + 1) * 100000; // initial sort key if not present
				}
				favItems.push(item);
				break;
			}
		}
	}
	
	// Alter core CSS to fit new button
	if (app.options.editable) {
		html.find('.spellbook .item-controls').css('flex', '0 0 70px');
		html.find('.inventory .item-controls, .features .item-controls').css('flex', '0 0 70px');
		html.find('.favourite .item-controls').css('flex', '0 0 22px');
	}
	
	let tabContainer = html.find('.favorites-target');
	data.favItems = favItems.length > 0 ? favItems.sort((a, b) => (a.flags.favtab.sort) - (b.flags.favtab.sort)) : false;
	data.favFeats = favFeats.length > 0 ? favFeats.sort((a, b) => (a.flags.favtab.sort) - (b.flags.favtab.sort)) : false;
	data.favSpells = spellCount > 0 ? favSpells : false;
	data.editable = app.options.editable;
	
	await loadTemplates(['modules/tidy5e-sheet/templates/item.hbs']);
	let favtabHtml = $(await renderTemplate('modules/tidy5e-sheet/templates/template.hbs', data));
	favtabHtml.find('.item-name h4').click(event => app._onItemSummary(event));
	
	if (app.options.editable) {
		favtabHtml.find('.item-image').click(ev => app._onItemRoll(ev));
		let handler = ev => app._onDragItemStart(ev);
		favtabHtml.find('.item').each((i, li) => {
			if (li.classList.contains("inventory-header")) return;
			li.setAttribute("draggable", true);
			li.addEventListener("dragstart", handler, false);
		});
		//favtabHtml.find('.item-toggle').click(event => app._onToggleItem(event));
		favtabHtml.find('.item-edit').click(ev => {
			let itemId = $(ev.target).parents('.item')[0].dataset.itemId;
			app.actor.getOwnedItem(itemId).sheet.render(true);
		});
		favtabHtml.find('.item-fav').click(ev => {
			let itemId = $(ev.target).parents('.item')[0].dataset.itemId;
			let val = !app.actor.getOwnedItem(itemId).data.flags.favtab.isFavourite;
			app.actor.getOwnedItem(itemId).update({
				"flags.favtab.isFavourite": val
			});
		});
		
		// Sorting
		favtabHtml.find('.item').on('drop', ev => {
			ev.preventDefault();
			ev.stopPropagation();
			
			let dropData = JSON.parse(ev.originalEvent.dataTransfer.getData('text/plain'));
			if (dropData.actorId !== app.actor.id || dropData.data.type === 'spell') return;
			let list = null;
			if (dropData.data.type === 'feat') list = favFeats;
			else list = favItems;
			let dragSource = list.find(i => i._id === dropData.data._id);
			let siblings = list.filter(i => i._id !== dropData.data._id);
			let targetId = ev.target.closest('.item').dataset.itemId;
			let dragTarget = siblings.find(s => s._id === targetId);
			
			if (dragTarget === undefined) return;
			const sortUpdates = SortingHelpers.performIntegerSort(dragSource, {
				target: dragTarget,
				siblings: siblings,
				sortKey: 'flags.favtab.sort'
			});
			const updateData = sortUpdates.map(u => {
				const update = u.update;
				update._id = u.target._id;
				return update;
			});
			app.actor.updateEmbeddedEntity("OwnedItem", updateData);
		});
	}
	tabContainer.append(favtabHtml);
	try {
		if (game.modules.get("betterrolls5e") && game.modules.get("betterrolls5e").active) BetterRolls.addItemContent(app.object, favtabHtml, ".item .item-name h4", ".item-properties", ".item > .rollable div");
	} 
	catch (err) {
		// Better Rolls not found!
	}
	Hooks.callAll("renderedTidy5eSheet", app, html, data);

}


// Preload tidy5e Handlebars Templates
Hooks.once("init", () => {
  preloadTidy5eHandlebarsTemplates();
  document.body.classList.add("useTidy5e");

	game.settings.register("tidy5e-sheet", "useDarkMode", {
		name: "Use alternate Dark Mode version of the sheet",
		hint: "Checking this option will enable an alternate Dark Mode version of the Tidy5e Sheet. Goes well with D&D5E Dark Mode or as a Standalone.",
		scope: "user",
		config: true,
		default: false,
		type: Boolean,
		onChange: data => {
      data === true ? document.body.classList.add("useTidy5eDark"):document.body.classList.remove("useTidy5eDark");
     }
	});

  const useDarkMode = game.settings.get('tidy5e-sheet', "useDarkMode");
  if (useDarkMode === true) 
      document.body.classList.add("useTidy5eDark")
});

// Register Tidy5e Sheet and make default character sheet
Actors.registerSheet("dnd5e", Tidy5eSheet, {
	types: ["character"],
	makeDefault: true
});

Hooks.on("renderTidy5eSheet", (app, html, data) => {
	detectCustomEditorFields(app, html, data);
	addClassList(app, html, data);
	setSheetClasses(app, html, data);
	addFavorites(app, html, data);
	checkDeathSaveStatus(app, html, data);
	// console.log(data);
});

/*
Hooks.on("renderItemSheet", (app, html, data) => {
	let element = app._element[0];
	let classList = element.classList;
	console.log(classList);
	console.log(app);
});
*/

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
	game.settings.register("tidy5e-sheet", "hideClassList", {
		name: "Hide Character Class List",
		hint: "Checking this option will hide the character's class list next to the level label. The sheet can handle 3 classes well, more than that will work but things get shifty ;)",
		scope: "world",
		config: true,
		default: false,
		type: Boolean
	});
});