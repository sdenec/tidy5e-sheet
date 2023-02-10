export function is_real_number(inNumber) {
	return !isNaN(inNumber) && typeof inNumber === "number" && isFinite(inNumber);
}

export function isEmptyObject(obj) {
	// because Object.keys(new Date()).length === 0;
	// we have to do some additional check
	if (obj === null || obj === undefined) {
		return true;
	}
	const result =
		obj && // null and undefined check
		Object.keys(obj).length === 0; // || Object.getPrototypeOf(obj) === Object.prototype);
	return result;
}

const signCase = {
	add: "+",
	subtract: "-",
	equals: "=",
	default: " ",
};

export function is_lazy_number(inNumber) {

	const isSign = String(inNumber).startsWith(signCase.add) || String(inNumber).startsWith(signCase.subtract) || String(inNumber).startsWith(signCase.equals) || String(inNumber).startsWith(signCase.default);
	if (isSign) {
		const withoutFirst = String(inNumber).slice(1);
		return is_real_number(withoutFirst);
	} else {
		return true;
	}
}

/**
 * Perform a death saving throw, rolling a d20 plus any global save bonuses
 * @param {object} options          Additional options which modify the roll
 * @returns {Promise<D20Roll|null>} A Promise which resolves to the Roll instance
 */
export async function rollDeathSaveForNoActorCharacter(actor, options={}) {
  const death = actor.flags[CONSTANTS.MODULE_ID].death ?? {};

  // Display a warning if we are not at zero HP or if we already have reached 3
  if ( (actor.system.attributes.hp.value > 0) || (death.failure >= 3) || (death.success >= 3) ) {
    ui.notifications.warn(game.i18n.localize("DND5E.DeathSaveUnnecessary"));
    return null;
  }

  // Evaluate a global saving throw bonus
  const speaker = options.speaker || ChatMessage.getSpeaker({actor: this});
  const globalBonuses = actor.system.bonuses?.abilities ?? {};
  const parts = [];
  const data = actor.getRollData();

  // Diamond Soul adds proficiency
  if ( actor.getFlag("dnd5e", "diamondSoul") ) {
    parts.push("@prof");
    data.prof = new Proficiency(actor.system.attributes.prof, 1).term;
  }

  // Include a global actor ability save bonus
  if ( globalBonuses.save ) {
    parts.push("@saveBonus");
    data.saveBonus = Roll.replaceFormulaData(globalBonuses.save, data);
  }

  // Evaluate the roll
  const flavor = game.i18n.localize("DND5E.DeathSavingThrow");
  const rollData = foundry.utils.mergeObject({
    data,
    title: `${flavor}: ${actor.name}`,
    flavor,
    halflingLucky: actor.getFlag("dnd5e", "halflingLucky"),
    targetValue: 10,
    messageData: {
      speaker: speaker,
      "flags.dnd5e.roll": {type: "death"}
    }
  }, options);
  rollData.parts = parts.concat(options.parts ?? []);

  // /**
  //  * A hook event that fires before a death saving throw is rolled for an Actor.
  //  * @function dnd5e.preRollDeathSave
  //  * @memberof hookEvents
  //  * @param {Actor5e} actor                Actor for which the death saving throw is being rolled.
  //  * @param {D20RollConfiguration} config  Configuration data for the pending roll.
  //  * @returns {boolean}                    Explicitly return `false` to prevent death saving throw from being rolled.
  //  */
  // if ( Hooks.call("dnd5e.preRollDeathSave", this, rollData) === false ) return;

  const roll = await d20Roll(rollData);
  if ( !roll ) return null;

  // Take action depending on the result
  const details = {};

  // Save success
  if ( roll.total >= (roll.options.targetValue ?? 10) ) {
    let successes = (death.success || 0) + 1;

    // Critical Success = revive with 1hp
    if ( roll.isCritical ) {
      details.updates = {
        "flags.tidy5e-sheet.death.success": 0,
        "flags.tidy5e-sheet.death.failure": 0,
        "system.attributes.hp.value": 1
      };
      details.chatString = "DND5E.DeathSaveCriticalSuccess";
    }

    // 3 Successes = survive and reset checks
    else if ( successes === 3 ) {
      details.updates = {
        "flags.tidy5e-sheet.death.success": 0,
        "flags.tidy5e-sheet.death.failure": 0
      };
      details.chatString = "DND5E.DeathSaveSuccess";
    }

    // Increment successes
    else details.updates = {"flags.tidy5e-sheet.death.success": Math.clamped(successes, 0, 3)};
  }

  // Save failure
  else {
    let failures = (death.failure || 0) + (roll.isFumble ? 2 : 1);
    details.updates = {"flags.tidy5e-sheet.death.failure": Math.clamped(failures, 0, 3)};
    if ( failures >= 3 ) {  // 3 Failures = death
      details.chatString = "DND5E.DeathSaveFailure";
    }
  }

  // /**
  //  * A hook event that fires after a death saving throw has been rolled for an Actor, but before
  //  * updates have been performed.
  //  * @function dnd5e.rollDeathSave
  //  * @memberof hookEvents
  //  * @param {Actor5e} actor              Actor for which the death saving throw has been rolled.
  //  * @param {D20Roll} roll               The resulting roll.
  //  * @param {object} details
  //  * @param {object} details.updates     Updates that will be applied to the actor as a result of this save.
  //  * @param {string} details.chatString  Localizable string displayed in the create chat message. If not set, then
  //  *                                     no chat message will be displayed.
  //  * @returns {boolean}                  Explicitly return `false` to prevent updates from being performed.
  //  */
  // if ( Hooks.call("dnd5e.rollDeathSave", this, roll, details) === false ) return roll;

  if ( !foundry.utils.isEmpty(details.updates) ) await actor.update(details.updates);

  // Display success/failure chat message
  if ( details.chatString ) {
    let chatData = { content: game.i18n.format(details.chatString, {name: actor.name}), speaker };
    ChatMessage.applyRollMode(chatData, roll.options.rollMode);
    await ChatMessage.create(chatData);
  }

  // Return the rolled result
  return roll;
}

/* -------------------------------------------- */
/* D20 Roll                                     */
/* -------------------------------------------- */

/**
 * Configuration data for a D20 roll.
 *
 * @typedef {object} D20RollConfiguration
 *
 * @property {string[]} [parts=[]]  The dice roll component parts, excluding the initial d20.
 * @property {object} [data={}]     Data that will be used when parsing this roll.
 * @property {Event} [event]        The triggering event for this roll.
 *
 * ## D20 Properties
 * @property {boolean} [advantage]     Apply advantage to this roll (unless overridden by modifier keys or dialog)?
 * @property {boolean} [disadvantage]  Apply disadvantage to this roll (unless overridden by modifier keys or dialog)?
 * @property {number|null} [critical=20]  The value of the d20 result which represents a critical success,
 *                                     `null` will prevent critical successes.
 * @property {number|null} [fumble=1]  The value of the d20 result which represents a critical failure,
 *                                     `null` will prevent critical failures.
 * @property {number} [targetValue]    The value of the d20 result which should represent a successful roll.
 *
 * ## Flags
 * @property {boolean} [elvenAccuracy]   Allow Elven Accuracy to modify this roll?
 * @property {boolean} [halflingLucky]   Allow Halfling Luck to modify this roll?
 * @property {boolean} [reliableTalent]  Allow Reliable Talent to modify this roll?
 *
 * ## Roll Configuration Dialog
 * @property {boolean} [fastForward]           Should the roll configuration dialog be skipped?
 * @property {boolean} [chooseModifier=false]  If the configuration dialog is shown, should the ability modifier be
 *                                             configurable within that interface?
 * @property {string} [template]               The HTML template used to display the roll configuration dialog.
 * @property {string} [title]                  Title of the roll configuration dialog.
 * @property {object} [dialogOptions]          Additional options passed to the roll configuration dialog.
 *
 * ## Chat Message
 * @property {boolean} [chatMessage=true]  Should a chat message be created for this roll?
 * @property {object} [messageData={}]     Additional data which is applied to the created chat message.
 * @property {string} [rollMode]           Value of `CONST.DICE_ROLL_MODES` to apply as default for the chat message.
 * @property {object} [flavor]             Flavor text to use in the created chat message.
 */

/**
 * A standardized helper function for managing core 5e d20 rolls.
 * Holding SHIFT, ALT, or CTRL when the attack is rolled will "fast-forward".
 * This chooses the default options of a normal attack with no bonus, Advantage, or Disadvantage respectively
 *
 * @param {D20RollConfiguration} configuration  Configuration data for the D20 roll.
 * @returns {Promise<D20Roll|null>}             The evaluated D20Roll, or null if the workflow was cancelled.
 */
export async function d20Roll({
  parts=[], data={}, event,
  advantage, disadvantage, critical=20, fumble=1, targetValue,
  elvenAccuracy, halflingLucky, reliableTalent,
  fastForward, chooseModifier=false, template, title, dialogOptions,
  chatMessage=true, messageData={}, rollMode, flavor
}={}) {

  // Handle input arguments
  const formula = ["1d20"].concat(parts).join(" + ");
  const {advantageMode, isFF} = CONFIG.Dice.D20Roll.determineAdvantageMode({
    advantage, disadvantage, fastForward, event
  });
  const defaultRollMode = rollMode || game.settings.get("core", "rollMode");
  if ( chooseModifier && !isFF ) {
    data.mod = "@mod";
    if ( "abilityCheckBonus" in data ) data.abilityCheckBonus = "@abilityCheckBonus";
  }

  // Construct the D20Roll instance
  const roll = new CONFIG.Dice.D20Roll(formula, data, {
    flavor: flavor || title,
    advantageMode,
    defaultRollMode,
    rollMode,
    critical,
    fumble,
    targetValue,
    elvenAccuracy,
    halflingLucky,
    reliableTalent
  });

  // Prompt a Dialog to further configure the D20Roll
  if ( !isFF ) {
    const configured = await roll.configureDialog({
      title,
      chooseModifier,
      defaultRollMode,
      defaultAction: advantageMode,
      defaultAbility: data?.item?.ability || data?.defaultAbility,
      template
    }, dialogOptions);
    if ( configured === null ) return null;
  } else roll.options.rollMode ??= defaultRollMode;

  // Evaluate the configured roll
  await roll.evaluate({async: true});

  // Create a Chat Message
  if ( roll && chatMessage ) await roll.toMessage(messageData);
  return roll;
}
