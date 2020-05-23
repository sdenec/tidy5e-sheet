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
			blockFavTab: false,
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
		html.find('.allow-delete-toggle').click(event => {
			event.preventDefault();
			let actor = this.actor;
			if (actor.getFlag("tidy5e-sheet", "allow-delete")) {
				actor.unsetFlag("tidy5e-sheet", "allow-delete");
			} else {
				actor.setFlag("tidy5e-sheet", "allow-delete", true);
			}
		});

		// set exhaustion level with tracking bar
		html.find('.level-selection span').click(event => {
			event.preventDefault();
			let actor = this.actor;
			let data = actor.data.data;
			let target = event.currentTarget;
			let value = target.dataset.elvl;
			actor.update({"data.attributes.exhaustion": value});
 		});

	}

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

// Preload tidy5e Handlebars Templates
Hooks.once("init", function() {
  preloadTidy5eHandlebarsTemplates();
});

// Register Tidy5e Sheet and make default character sheet
Actors.registerSheet("dnd5e", Tidy5eSheet, {
	types: ["character"],
	makeDefault: true
});

Hooks.on("renderTidy5eSheet", (app, html, data) => {
	setSheetClasses(app, html, data);
});

Hooks.once("ready", () => {
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
		scope: "module",
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
		scope: "module",
		config: true,
		default: false,
		type: Boolean
	});
});