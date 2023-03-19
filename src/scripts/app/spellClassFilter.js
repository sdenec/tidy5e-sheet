import CONSTANTS from "./constants.js";

const classesConfiguration = {
	artificer: "TIDY5E.ClassArtificer",
	barbarian: "TIDY5E.ClassBarbarian",
	bard: "TIDY5E.ClassBard",
	cleric: "TIDY5E.ClassCleric",
	druid: "TIDY5E.ClassDruid",
	fighter: "TIDY5E.ClassFighter",
	monk: "TIDY5E.ClassMonk",
	paladin: "TIDY5E.ClassPaladin",
	ranger: "TIDY5E.ClassRanger",
	rogue: "TIDY5E.ClassRogue",
	sorcerer: "TIDY5E.ClassSorcerer",
	warlock: "TIDY5E.ClassWarlock",
	wizard: "TIDY5E.ClassWizard",
	custom: "TIDY5E.ClassCustom"
};

let classesConfigurationTmp = {};

export async function applySpellClassFilterItemSheet(app, html, itemData) {
	if (!game.settings.get(CONSTANTS.MODULE_ID, "spellClassFilterSelect")) {
		return;
	}
	// The module already do the job so for avoid redundance...
	if (game.modules.get("spell-class-filter-for-5e")?.active) {
		return;
	}
	// collect relevant settings first
	const user_setting_filterSelect = game.settings.get(CONSTANTS.MODULE_ID, "spellClassFilterSelect");
	const user_setting_iconReplace = game.settings.get(CONSTANTS.MODULE_ID, "spellClassFilterIconReplace");

	const item = app.object;
	const type = item.type;

	// If this is a spell construct the HTML and inject it onto the page.
	if (type == "spell") {
		classesConfigurationTmp = classesConfiguration;
		const user_setting_addClasses = game.settings.get(CONSTANTS.MODULE_ID, "spellClassFilterAdditionalClasses");
		if(user_setting_addClasses && user_setting_addClasses.includes("|")){
			let classes = [];
			if(user_setting_addClasses.includes(",") ) {
				classes = user_setting_addClasses.split(",");
			} else {
				classes = [user_setting_addClasses];
			}
			for(let clazz of classes) {
				const c = clazz.split("|");
				const id = c[0];
				const name = c[1];
				if(id && name) {
					classesConfigurationTmp[id] = name;
				}
			}
		}

		const spellDetailsDiv = html.find(".tab.details");
		const firstChild = spellDetailsDiv.children("h3:first");
		const spellClassForm = await renderTemplate(
			"modules/tidy5e-sheet/templates/items/tidy5e-spell-class-filter-form.html",
			{
				SCF: classesConfigurationTmp,
				item,
				flags: item.flags
			}
		);
		// Under the first header in the details tab.
		firstChild.after(spellClassForm);
	}
}

// Any time an actor sheet is rendered check if it is a player character.  If so add the option to set the filter.
// Then hide elements that do not match the filter.
export async function applySpellClassFilterActorSheet(app, html, actorData) {
	if (!game.settings.get(CONSTANTS.MODULE_ID, "spellClassFilterSelect")) {
		return;
	}
	// The module already do the job so for avoid redundance...
	if (game.modules.get("spell-class-filter-for-5e")?.active) {
		return;
	}
	// collect relevant settings first
	const user_setting_filterSelect = game.settings.get(CONSTANTS.MODULE_ID, "spellClassFilterSelect");
	const user_setting_iconReplace = game.settings.get(CONSTANTS.MODULE_ID, "spellClassFilterIconReplace");

	// collect some data to use later
	const actor = app.object;
	const type = actor.type;
	const flags = actor.flags;
	const actorSCFlags = flags[CONSTANTS.MODULE_ID];

	if (type == "character") {
		const spellbook = html.find(".tab.spellbook");
		const filterList = spellbook.find("ul.filter-list");
		const firstItem = filterList.children("li.filter-item:first");
		// const itemData = actor.items
		const actorItems = actor.items;

		// Inject a simple dropdown menu.
		if (user_setting_filterSelect) {
			classesConfigurationTmp = classesConfiguration;
			const user_setting_addClasses = game.settings.get(CONSTANTS.MODULE_ID, "spellClassFilterAdditionalClasses");
			if(user_setting_addClasses && user_setting_addClasses.includes("|")){
				let classes = [];
				if(user_setting_addClasses.includes(",") ) {
					classes = user_setting_addClasses.split(",");
				} else {
					classes = [user_setting_addClasses];
				}
				for(let clazz of classes) {
					const c = clazz.split("|");
					const id = c[0];
					const name = c[1];
					if(id && name) {
						classesConfigurationTmp[id] = name;
					}
				}
			}
			const actorClassFilter = await renderTemplate(
				"modules/tidy5e-sheet/templates/actors/parts/tidy5e-spellbook-class-filter.html",
				{
					SCF: classesConfigurationTmp,
					actor,
					flags: flags,
					scFlags: actor.flags[CONSTANTS.MODULE_ID]
				}
			);
			firstItem.before(actorClassFilter);
		}

		// Get a list of classes for the actor and store their img.
		let classes = {};
		for (let item of actorItems) {
			if (item.type == "class") {
				let className = item.name.toLowerCase();
				let classImg = item.img;
				classes[className] = classImg;
			}
		}
		// spellClassFilter.log(true, classes)
		// Loop through some elements and get thier data
		const spellList = spellbook.find(".inventory-list");
		const items = spellList.find(".item");
		items.each(function () {
			let itemID = $(this).data("item-id");
			let item = actorItems.get(itemID);
			let itemFlags = item.flags;
			let itemSCFlags = itemFlags[CONSTANTS.MODULE_ID]; //Should return undefined if doesn't exist.

			if (user_setting_iconReplace) {
				// Replace spell icon image
				if (itemSCFlags) {
					if (classes.hasOwnProperty(itemSCFlags.parentClass)) {
						// spellClassFilter.log(false, $(this))
						// $(this).css('background-image', 'url('+classes[itemSCFlags.parentClass]+')')
						let imgdiv = $(this).find(".item-image");
						imgdiv.css("background-image", `url(${classes[itemSCFlags.parentClass]})`);
					}
				}
			}

			if (user_setting_filterSelect) {
				if (hasProperty(actorSCFlags, "classFilter")) {
					// Hide each element that doesn't match. Or don't hide anything if nothing is selected.
					if (actorSCFlags.classFilter != "") {
						if (itemSCFlags) {
							if (!(itemSCFlags.parentClass == actorSCFlags.classFilter)) {
								$(this).hide();
							}
						} else {
							$(this).hide();
						}
					}
				}
			}
		});
	} //end if character
} //end actorsheet hook
