import { isLessThanOneIsOne } from "./helpers.js";

/**
 * A helper Dialog subclass for rolling Hit Dice on short rest.
 *
 * @param {Actor5e} actor           Actor that is taking the short rest.
 * @param {object} [dialogData={}]  An object of dialog data which configures how the modal window is rendered.
 * @param {object} [options={}]     Dialog rendering options.
 */
export default class ShortRestDialog extends Dialog {
	constructor(actor, dialogData = {}, options = {}) {
		super(dialogData, options);

		/**
		 * Store a reference to the Actor document which is resting
		 * @type {Actor}
		 */
		this.actor = actor;

		/**
		 * Track the most recently used HD denomination for re-rendering the form
		 * @type {string}
		 */
		this._denom = null;
	}

	/* -------------------------------------------- */

	/** @inheritDoc */
	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			template: "systems/dnd5e/templates/apps/short-rest.hbs",
			classes: ["dnd5e", "dialog"]
		});
	}

	/* -------------------------------------------- */

	/** @inheritDoc */
	getData() {
		const data = super.getData();

		// Determine Hit Dice
		const hd = {};
		const hitDice = isLessThanOneIsOne(this.actor.system.details.cr) + "d6";
		const denom = hitDice ?? "d6";
		const available = 1; //parseInt(this.actor.system.details.cr ?? 1);
		hd[denom] = denom in hd ? hd[denom] + available : available;

		data.availableHD = hd;

		data.canRoll = true; //this.actor.system.attributes.hd > 0;
		data.denomination = this._denom;

		// Determine rest type
		const variant = game.settings.get("dnd5e", "restVariant");
		data.promptNewDay = variant !== "epic"; // It's never a new day when only resting 1 minute
		data.newDay = false; // It may be a new day, but not by default
		return data;
	}

	/* -------------------------------------------- */

	/** @inheritDoc */
	activateListeners(html) {
		super.activateListeners(html);
		let btn = html.find("#roll-hd");
		btn.click(this._onRollHitDie.bind(this));
		btn.hide(); // Added for tidy
	}

	/* -------------------------------------------- */

	/**
	 * Handle rolling a Hit Die as part of a Short Rest action
	 * @param {Event} event     The triggering click event
	 * @protected
	 */
	async _onRollHitDie(event) {
		event.preventDefault();
		const btn = event.currentTarget;
		this._denom = btn.form.hd.value;
		// await this.actor.rollHitDie(this._denom);
		await this.rollHitDieNPC(this._denom);
		this.render();
	}

	/* -------------------------------------------- */

	/**
	 * A helper constructor function which displays the Short Rest dialog and returns a Promise once it's workflow has
	 * been resolved.
	 * @param {object} [options={}]
	 * @param {Actor5e} [options.actor]  Actor that is taking the short rest.
	 * @returns {Promise}                Promise that resolves when the rest is completed or rejects when canceled.
	 */
	static async shortRestDialog({ actor } = {}) {
		return new Promise((resolve, reject) => {
			const dlg = new this(actor, {
				title: `${game.i18n.localize("DND5E.ShortRest")}: ${actor.name}`,
				buttons: {
					rest: {
						icon: '<i class="fas fa-bed"></i>',
						label: game.i18n.localize("DND5E.Rest"),
						callback: (html) => {
							let newDay = false;
							if (game.settings.get("dnd5e", "restVariant") !== "epic") {
								newDay = html.find('input[name="newDay"]')[0].checked;
							}
							resolve(newDay);
						}
					},
					cancel: {
						icon: '<i class="fas fa-times"></i>',
						label: game.i18n.localize("Cancel"),
						callback: reject
					}
				},
				close: reject
			});
			dlg.render(true);
		});
	}

	/* -------------------------------------------- */

	/**
	 * Roll a hit die of the appropriate type, gaining hit points equal to the die roll plus your CON modifier.
	 * @param {string} [denomination]  The hit denomination of hit die to roll. Example "d8".
	 *                                 If no denomination is provided, the first available HD will be used
	 * @param {object} options         Additional options which modify the roll.
	 * @returns {Promise<Roll|null>}   The created Roll instance, or null if no hit die was rolled
	 */
	async rollHitDieNPC(denomination, options = {}) {
		// If no denomination was provided, choose the first available
		// let cls = null;
		// if ( !denomination ) {
		//   cls = this.actor.itemTypes.class.find(c => c.system.hitDiceUsed < c.system.levels);
		//   if ( !cls ) return null;
		//   denomination = cls.system.hitDice;
		// }

		// // Otherwise, locate a class (if any) which has an available hit die of the requested denomination
		// else cls = this.actor.items.find(i => {
		//   return (i.system.hitDice === denomination) && ((i.system.hitDiceUsed || 0) < (i.system.levels || 1));
		// });

		// If no class is available, display an error notification
		// if ( !cls ) {
		//   ui.notifications.error(game.i18n.format("DND5E.HitDiceWarn", {name: this.name, formula: denomination}));
		//   return null;
		// }

		// Prepare roll data
		const flavor = game.i18n.localize("DND5E.HitDiceRoll");
		const rollConfig = foundry.utils.mergeObject(
			{
				formula: `max(0, 1${denomination} + @abilities.con.mod)`,
				data: this.actor.getRollData(),
				chatMessage: true,
				messageData: {
					speaker: ChatMessage.getSpeaker({ actor: this.actor }),
					flavor,
					title: `${flavor}: ${this.actor.name}`,
					rollMode: game.settings.get("core", "rollMode"),
					"flags.dnd5e.roll": { type: "hitDie" }
				}
			},
			options
		);

		/**
		 * A hook event that fires before a hit die is rolled for an Actor.
		 * @function dnd5e.preRollHitDie
		 * @memberof hookEvents
		 * @param {Actor5e} actor               Actor for which the hit die is to be rolled.
		 * @param {object} config               Configuration data for the pending roll.
		 * @param {string} config.formula       Formula that will be rolled.
		 * @param {object} config.data          Data used when evaluating the roll.
		 * @param {boolean} config.chatMessage  Should a chat message be created for this roll?
		 * @param {object} config.messageData   Data used to create the chat message.
		 * @param {string} denomination         Size of hit die to be rolled.
		 * @returns {boolean}                   Explicitly return `false` to prevent hit die from being rolled.
		 */
		if (Hooks.call("dnd5e.preRollHitDie", this.actor, rollConfig, denomination) === false) return;

		const roll = await new Roll(rollConfig.formula, rollConfig.data).roll({ async: true });
		if (rollConfig.chatMessage) roll.toMessage(rollConfig.messageData);

		const hp = this.actor.system.attributes.hp;
		const dhp = Math.min(hp.max + (hp.tempmax ?? 0) - hp.value, roll.total);
		const updates = {
			actor: { "system.attributes.hp.value": hp.value + dhp }
			//   class: {"system.hitDiceUsed": cls.system.hitDiceUsed + 1}
		};

		/**
		 * A hook event that fires after a hit die has been rolled for an Actor, but before updates have been performed.
		 * @function dnd5e.rollHitDie
		 * @memberof hookEvents
		 * @param {Actor5e} actor         Actor for which the hit die has been rolled.
		 * @param {Roll} roll             The resulting roll.
		 * @param {object} updates
		 * @param {object} updates.actor  Updates that will be applied to the actor.
		 * @param {object} updates.class  Updates that will be applied to the class.
		 * @returns {boolean}             Explicitly return `false` to prevent updates from being performed.
		 */
		if (Hooks.call("dnd5e.rollHitDie", this.actor, roll, updates) === false) return roll;

		// Re-evaluate dhp in the event that it was changed in the previous hook
		const updateOptions = { dhp: (updates.actor?.["system.attributes.hp.value"] ?? hp.value) - hp.value };

		// Perform updates
		if (!foundry.utils.isEmpty(updates.actor)) await this.actor.update(updates.actor, updateOptions);
		// if ( !foundry.utils.isEmpty(updates.class) ) await cls.update(updates.class);

		return roll;
	}
}
