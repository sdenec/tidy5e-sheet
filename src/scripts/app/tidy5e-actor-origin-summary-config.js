import Tidy5eBaseConfigSheet from "./tidy5e-base-config-sheet.js";
import CONSTANTS from "./constants.js";

/**
 * A form for configuring actor hit points and bonuses.
 */
export default class Tidy5eActorOriginSummaryConfig extends Tidy5eBaseConfigSheet {
	constructor(...args) {
		super(...args);

		/**
		 * Cloned copy of the actor for previewing changes.
		 * @type {Actor5e}
		 */
		this.clone = this.object.clone();
	}

	/* -------------------------------------------- */

	/** @override */
	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			classes: ["dnd5e", "actor-origin-summary-config"],
			template: `modules/${CONSTANTS.MODULE_ID}/templates/actors/parts/tidy5e-origin-summary-config.html`,
			width: 320,
			height: "auto",
			sheetConfig: false
		});
	}

	/* -------------------------------------------- */

	/** @inheritdoc */
	get title() {
		return `${game.i18n.localize("TIDY5E.OriginSummaryConfig")}: ${this.document.name}`;
	}

	/* -------------------------------------------- */

	/** @inheritdoc */
	getData(options) {
		return {
			race: this.clone.system.details.race,
			background: this.clone.system.details.background,
			environment: this.clone.system.details.environment,
			alignment: this.clone.system.details.alignment,
			source: this.clone.system.details.source,
			dimensions: this.clone.system.traits.dimensions,

			isCharacter: this.document.type === "character",
			isNPC: this.document.type === "npc",
			isVehicle: this.document.type === "vehicle"
		};
	}

	/* -------------------------------------------- */

	/** @inheritdoc */
	_getActorOverrides() {
		return Object.keys(foundry.utils.flattenObject(this.object.overrides?.system?.details || {}));
	}

	/* -------------------------------------------- */

	/** @inheritdoc */
	async _updateObject(event, formData) {
		const race = foundry.utils.expandObject(formData).race;
		const background = foundry.utils.expandObject(formData).background;
		const environment = foundry.utils.expandObject(formData).environment;
		const alignment = foundry.utils.expandObject(formData).alignment;
		const source = foundry.utils.expandObject(formData).source;

		const dimensions = foundry.utils.expandObject(formData).dimensions;

		const isCharacter = this.document.type === "character";
		const isNPC = this.document.type === "npc";
		const isVehicle = this.document.type === "vehicle";

		if (isCharacter) {
			// this.clone.updateSource({
			//   "system.details.race": race,
			//   "system.details.background": background,
			//   "system.details.alignment": alignment
			// });

			return this.document.update({
				"system.details.race": race,
				"system.details.background": background,
				"system.details.alignment": alignment
			});
		} else if (isNPC) {
			// this.clone.updateSource({
			//   "system.details.environment": environment,
			//   "system.details.alignment": alignment,
			//   "system.details.source": source,
			// });

			return this.document.update({
				"system.details.environment": environment,
				"system.details.alignment": alignment,
				"system.details.source": source
			});
		} else if (isVehicle) {
			// this.clone.updateSource({
			//   "system.traits.dimensions": dimensions,
			//   "system.details.source": source,
			// });

			return this.document.update({
				"system.traits.dimensions": dimensions
			});
		}
	}

	/* -------------------------------------------- */
	/*  Event Listeners and Handlers                */
	/* -------------------------------------------- */

	/** @inheritDoc */
	activateListeners(html) {
		super.activateListeners(html);
		// html.find(".roll-hit-points").click(this._onRollHPFormula.bind(this));
	}

	/* -------------------------------------------- */

	// /** @inheritdoc */
	// async _onChangeInput(event) {
	//   await super._onChangeInput(event);
	//   const t = event.currentTarget;

	//   if(t.value === "" || t.value === "0" || t.value === null || t.value === undefined) {
	//       const rollData = this.object.getRollData();
	//       // strange patch ...
	//       this.object.system._source.attributes.hp.max = null;
	//       this.object._prepareHitPoints(rollData);
	//       t.value = this.object.system.attributes.hp.max;
	//   }

	//   // Update clone with new data & re-render
	//   this.clone.updateSource({ [`system.attributes.${t.name}`]: t.value || null });
	// }

	/* -------------------------------------------- */
}
