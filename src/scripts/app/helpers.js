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
	default: " "
};

export function is_lazy_number(inNumber) {
	const isSign =
		String(inNumber).startsWith(signCase.add) ||
		String(inNumber).startsWith(signCase.subtract) ||
		String(inNumber).startsWith(signCase.equals) ||
		String(inNumber).startsWith(signCase.default);
	if (isSign) {
		const withoutFirst = String(inNumber).slice(1);
		return is_real_number(withoutFirst);
	} else {
		return true;
	}
}

export function isLessThanOneIsOne(inNumber) {
	return inNumber < 1 ? 1 : inNumber;
}

export function truncate(str, n, useWordBoundary) {
	if (str.length <= n) {
		return str;
	}
	const subString = str.slice(0, n - 1); // the original check
	return (useWordBoundary ? subString.slice(0, subString.lastIndexOf(" ")) : subString) + "..."; // "&hellip;";
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
	parts = [],
	data = {},
	event,
	advantage,
	disadvantage,
	critical = 20,
	fumble = 1,
	targetValue,
	elvenAccuracy,
	halflingLucky,
	reliableTalent,
	fastForward,
	chooseModifier = false,
	template,
	title,
	dialogOptions,
	chatMessage = true,
	messageData = {},
	rollMode,
	flavor
} = {}) {
	// Handle input arguments
	const formula = ["1d20"].concat(parts).join(" + ");
	const { advantageMode, isFF } = CONFIG.Dice.D20Roll.determineAdvantageMode({
		advantage,
		disadvantage,
		fastForward,
		event
	});
	const defaultRollMode = rollMode || game.settings.get("core", "rollMode");
	if (chooseModifier && !isFF) {
		data.mod = "@mod";
		if ("abilityCheckBonus" in data) data.abilityCheckBonus = "@abilityCheckBonus";
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
	if (!isFF) {
		const configured = await roll.configureDialog(
			{
				title,
				chooseModifier,
				defaultRollMode,
				defaultAction: advantageMode,
				defaultAbility: data?.item?.ability || data?.defaultAbility,
				template
			},
			dialogOptions
		);
		if (configured === null) return null;
	} else roll.options.rollMode ??= defaultRollMode;

	// Evaluate the configured roll
	await roll.evaluate({ async: true });

	// Create a Chat Message
	if (roll && chatMessage) await roll.toMessage(messageData);
	return roll;
}
