import { debug, info, warn } from "./logger-util.js";
import CONSTANTS from "./constants.js";
import { is_lazy_number, is_real_number } from "./helpers.js";
import { isEmptyObject } from "./helpers.js";

const signCase = {
	add: "+",
	subtract: "-",
	equals: "=",
	default: " "
};
function _onChangeExp(ev) {
	const input = ev.target;
	const actor = ev.data.app.actor;
	const sheet = ev.data.app.options;
	const exp = ev.data.app.actor.system.details.xp.value;
	const maxExp = ev.data.app.actor.system.details.xp.max;
	// const minExp = ev.data.app.actor.system.details.xp.min;
	const denom = input.name.split(".")[2];
	const value = input.value;
	let sign = signCase.default;
	Object.values(signCase).forEach((val) => {
		if (value.includes(val)) {
			sign = val;
		}
	});
	const splitVal = value.split(sign);
	let delta;
	if (splitVal.length > 1) {
		delta = Number(splitVal[1]);
	} else {
		delta = Number(splitVal[0]);
	}
	let newAmountExp = exp;

	switch (sign) {
		case signCase.add: {
			newAmountExp = Number(exp) + delta;
			break;
		}
		case signCase.subtract: {
			newAmountExp = Number(exp) - delta;
			break;
		}
		case signCase.equals: {
			newAmountExp = delta;
			break;
		}
		default: {
			newAmountExp = delta;
			break;
		}
	}

	if (newAmountExp < 0 || !is_real_number(newAmountExp)) {
		debug(`tidy5e-lazy-exp-and-hp | _onChangeExp | [0] WARN: The xp value ${newAmountExp} is not a valid number`);
		newAmountExp = exp;
	}
	// REMOVED NOT ESSENTIAL
	// if (newAmountExp > maxExp) {
	// 	newAmountExp = maxExp;
	// }
	// if(newAmount <  minExp) {
	//     newAmount = minExp;
	// }
	if (newAmountExp < 0 || !is_real_number(newAmountExp)) {
		debug(`tidy5e-lazy-exp-and-hp | _onChangeExp | [1] WARN: The xp value ${newAmountExp} is not a valid number`);
		newAmountExp = 0;
	}

	debug(`tidy5e-lazy-exp-and-hp | _onChangeExp | Update system.details.xp.value to ${newAmountExp}`);

	sheet.submitOnChange = false;
	actor
		.update({ "system.details.xp.value": Number(newAmountExp) })
		.then(() => {
			input.value = Number(getProperty(actor, input.name) ?? 0);
			sheet.submitOnChange = true;
		})
		.catch(console.log.bind(console));
}

function _onChangeHp(ev) {
	const input = ev.target;
	const actor = ev.data.app.actor;
	const sheet = ev.data.app.options;
	const hp = ev.data.app.actor.system.attributes.hp.value;
	const maxHp = ev.data.app.actor.system.attributes.hp.max;
	// const minHp = ev.data.app.actor.system.attributes.hp.min;
	const denom = input.name.split(".")[2];
	const value = input.value;
	let sign = signCase.default;
	Object.values(signCase).forEach((val) => {
		if (value.includes(val)) {
			sign = val;
		}
	});
	const splitVal = value.split(sign);
	let delta;
	if (splitVal.length > 1) {
		delta = Number(splitVal[1]);
	} else {
		delta = Number(splitVal[0]);
	}

	let newAmountHpValue = hp;
	let newAmountHpTemp = ev.data.app.actor.system.attributes.hp.temp;
	let newAmountHpTempMax = ev.data.app.actor.system.attributes.hp.tempmax;

	switch (sign) {
		case signCase.add: {
			newAmountHpValue = Number(hp) + delta;
			break;
		}
		case signCase.subtract: {
			newAmountHpValue = Number(hp) - delta;
			break;
		}
		case signCase.equals: {
			newAmountHpValue = delta;
			break;
		}
		default: {
			newAmountHpValue = delta;
			break;
		}
	}

	if (newAmountHpValue < 0 || !is_real_number(newAmountHpValue)) {
		debug(
			`tidy5e-lazy-exp-and-hp | _onChangeHp | [2] WARN: The hp.value value ${newAmountHpValue} is not a valid number`
		);
		newAmountHpValue = hp;
	}

	if (game.settings.get(CONSTANTS.MODULE_ID, "lazyHpForceHpValueLimit2")) {
		if (newAmountHpValue > maxHp) {
			let tmp = newAmountHpValue - maxHp;
			let tmp2 = newAmountHpTemp + tmp;
			if (newAmountHpTempMax < tmp2) {
				let tmp3 = tmp2 - newAmountHpTempMax;
				newAmountHpTempMax = newAmountHpTempMax + tmp3;
			}
			newAmountHpTemp = tmp2;
			newAmountHpValue = maxHp;
		}
		// if(newAmount <  minHp) {
		//     newAmount = minHp;
		// }

		if (newAmountHpValue < 0 || !is_real_number(newAmountHpValue)) {
			debug(
				`tidy5e-lazy-exp-and-hp | _onChangeHp | [3] WARN: The hp.value value ${newAmountHpValue} is not a valid number`
			);
			newAmountHpValue = 0;
		}
		if (newAmountHpTemp < 0 || !is_real_number(newAmountHpTemp)) {
			debug(
				`tidy5e-lazy-exp-and-hp | _onChangeHp | [4] WARN: The hp.temp value ${newAmountHpTemp} is not a valid number`
			);
			newAmountHpTemp = 0;
		}
		if (newAmountHpTempMax < 0 || !is_real_number(newAmountHpTempMax)) {
			debug(
				`tidy5e-lazy-exp-and-hp | _onChangeHp | [5] WARN: The hp.tempmax value ${newAmountHpTempMax} is not a valid number`
			);
			newAmountHpTempMax = 0;
		}

		debug(`tidy5e-lazy-exp-and-hp | _onChangeHp | Update system.attributes.hp.value to ${newAmountHpValue}`);
		debug(`tidy5e-lazy-exp-and-hp | _onChangeHp | Update system.attributes.hp.temp to ${newAmountHpTemp}`);
		debug(`tidy5e-lazy-exp-and-hp | _onChangeHp | Update system.attributes.hp.tempmax to ${newAmountHpTempMax}`);

		sheet.submitOnChange = false;
		actor
			.update({
				"system.attributes.hp.value": Number(newAmountHpValue),
				"system.attributes.hp.temp": Number(newAmountHpTemp),
				"system.attributes.hp.tempmax": Number(newAmountHpTempMax)
			})
			.then(() => {
				input.value = Number(getProperty(actor, input.name) ?? 0);
				sheet.submitOnChange = true;
			})
			.catch(console.log.bind(console));
	} else {
		if (newAmountHpValue < 0 || !is_real_number(newAmountHpValue)) {
			debug(
				`tidy5e-lazy-exp-and-hp | _onChangeHp | [6] WARN: The hp.value value ${newAmountHpValue} is not a valid number`
			);
			newAmountHpValue = 0;
		}

		if (game.settings.get(CONSTANTS.MODULE_ID, "lazyHpForceHpValueLimit1")) {
			if (newAmountHpValue > maxHp + newAmountHpTempMax) {
				newAmountHpValue = maxHp + newAmountHpTempMax;
			}
		}

		debug(`tidy5e-lazy-exp-and-hp | _onChangeHp | Update system.attributes.hp.value to ${newAmountHpValue}`);

		sheet.submitOnChange = false;
		actor
			.update({ "system.attributes.hp.value": Number(newAmountHpValue) })
			.then(() => {
				input.value = Number(getProperty(actor, input.name) ?? 0);
				sheet.submitOnChange = true;
			})
			.catch(console.log.bind(console));
	}
}

function _onChangeHpMax(ev) {
	const input = ev.target;
	const actor = ev.data.app.actor;
	const sheet = ev.data.app.options;
	const hp = ev.data.app.actor.system.attributes.hp.value;
	const maxHp = ev.data.app.actor.system.attributes.hp.max;
	// const minHp = ev.data.app.actor.system.attributes.hp.min;
	const denom = input.name.split(".")[2];
	const value = input.value;
	let sign = signCase.default;
	Object.values(signCase).forEach((val) => {
		if (value.includes(val)) {
			sign = val;
		}
	});
	const splitVal = value.split(sign);
	let delta;
	if (splitVal.length > 1) {
		delta = Number(splitVal[1]);
	} else {
		delta = Number(splitVal[0]);
	}
	let newAmountHpMax = maxHp;

	switch (sign) {
		case signCase.add: {
			newAmountHpMax = Number(maxHp) + delta;
			break;
		}
		case signCase.subtract: {
			newAmountHpMax = Number(maxHp) - delta;
			break;
		}
		case signCase.equals: {
			newAmountHpMax = delta;
			break;
		}
		default: {
			newAmountHpMax = delta;
			break;
		}
	}

	if (newAmountHpMax < 0 || !is_real_number(newAmountHpMax)) {
		debug(
			`tidy5e-lazy-exp-and-hp | _onChangeHpMax | [7] WARN: The hp.max value ${newAmountHpMax} is not a valid number`
		);
		newAmountHpMax = maxHp;
	}

	// if(newAmount > maxHp) {
	//     newAmount = maxHp;
	// }
	// if(newAmount <  minHp) {
	//     newAmount = minHp;
	// }
	if (newAmountHpMax < 0 || !is_real_number(newAmountHpMax)) {
		debug(
			`tidy5e-lazy-exp-and-hp | _onChangeHpMax | [8] WARN: The hp.value value ${newAmountHpMax} is not a valid number`
		);
		newAmountHpMax = 0;
	}

	debug(`tidy5e-lazy-exp-and-hp | _onChangeHpMax | Update system.attributes.hp.max to ${newAmountHpMax}`);

	sheet.submitOnChange = false;
	actor
		.update({ "system.attributes.hp.max": Number(newAmountHpMax) })
		.then(() => {
			input.value = Number(getProperty(actor, input.name) ?? 0);
			sheet.submitOnChange = true;
		})
		.catch(console.log.bind(console));
}

function _onChangeHpForceHpValueLimit1(ev) {
	const input = ev.target;
	const actor = ev.data.app.actor;
	const sheet = ev.data.app.options;
	const hp = ev.data.app.actor.system.attributes.hp.value;
	const maxHp = ev.data.app.actor.system.attributes.hp.max;

	let newAmountHpValue = Number(input.value);
	let newAmountHpTemp = ev.data.app.actor.system.attributes.hp.temp;
	let newAmountHpTempMax = ev.data.app.actor.system.attributes.hp.tempmax;

	if (!is_real_number(newAmountHpValue)) {
		debug(
			`tidy5e-lazy-exp-and-hp | _onChangeHpForceHpValueLimit1 | [9] WARN: The hp.value value ${newAmountHpValue} is not a valid number`
		);
		newAmountHpValue = hp;
	}

	if (newAmountHpValue < 0 || !is_real_number(newAmountHpValue)) {
		debug(
			`tidy5e-lazy-exp-and-hp | _onChangeHpForceHpValueLimit1 | [10] WARN: The hp.value value ${newAmountHpValue} is not a valid number`
		);
		newAmountHpValue = 0;
	}
	if (newAmountHpTemp < 0 || !is_real_number(newAmountHpTemp)) {
		debug(
			`tidy5e-lazy-exp-and-hp | _onChangeHpForceHpValueLimit1 | [11] WARN: The hp.temp value ${newAmountHpTemp} is not a valid number`
		);
		newAmountHpTemp = 0;
	}
	if (newAmountHpTempMax < 0 || !is_real_number(newAmountHpTempMax)) {
		debug(
			`tidy5e-lazy-exp-and-hp | _onChangeHpForceHpValueLimit1 | [12] WARN: The hp.tempmax value ${newAmountHpTempMax} is not a valid number`
		);
		newAmountHpTempMax = 0;
	}

	if (newAmountHpValue > maxHp + newAmountHpTempMax) {
		newAmountHpValue = maxHp + newAmountHpTempMax;
	}

	debug(
		`tidy5e-lazy-exp-and-hp | _onChangeHpForceHpValueLimit1 | Update system.attributes.hp.value to ${newAmountHpValue}`
	);

	sheet.submitOnChange = false;
	actor
		.update({
			"system.attributes.hp.value": Number(newAmountHpValue)
		})
		.then(() => {
			input.value = Number(getProperty(actor, input.name) ?? 0);
			sheet.submitOnChange = true;
		})
		.catch(console.log.bind(console));
}

function _onChangeHpForceHpValueLimit2(ev) {
	const input = ev.target;
	const actor = ev.data.app.actor;
	const sheet = ev.data.app.options;
	const hp = ev.data.app.actor.system.attributes.hp.value;
	const maxHp = ev.data.app.actor.system.attributes.hp.max;

	let newAmountHpValue = Number(input.value);
	let newAmountHpTemp = ev.data.app.actor.system.attributes.hp.temp;
	let newAmountHpTempMax = ev.data.app.actor.system.attributes.hp.tempmax;

	if (newAmountHpValue < 0 || !is_real_number(newAmountHpValue)) {
		debug(
			`tidy5e-lazy-exp-and-hp | _onChangeHpForceHpValueLimit2 | [13] WARN: The hp.value value ${newAmountHpValue} is not a valid number`
		);
		newAmountHpValue = hp;
	}

	if (newAmountHpValue > maxHp) {
		let tmp = newAmountHpValue - maxHp;
		let tmp2 = newAmountHpTemp + tmp;
		if (newAmountHpTempMax < tmp2) {
			let tmp3 = tmp2 - newAmountHpTempMax;
			newAmountHpTempMax = newAmountHpTempMax + tmp3;
		}
		newAmountHpTemp = tmp2;
		newAmountHpValue = maxHp;
	}
	// if(newAmount <  minHp) {
	//     newAmount = minHp;
	// }

	if (newAmountHpValue < 0 || !is_real_number(newAmountHpValue)) {
		debug(
			`tidy5e-lazy-exp-and-hp | _onChangeHpForceHpValueLimit2 | [14] WARN: The hp.value value ${newAmountHpValue} is not a valid number`
		);
		newAmountHpValue = 0;
	}
	if (newAmountHpTemp < 0 || !is_real_number(newAmountHpTemp)) {
		debug(
			`tidy5e-lazy-exp-and-hp | _onChangeHpForceHpValueLimit2 | [15] WARN: The hp.temp value ${newAmountHpTemp} is not a valid number`
		);
		newAmountHpTemp = 0;
	}
	if (newAmountHpTempMax < 0 || !is_real_number(newAmountHpTempMax)) {
		debug(
			`tidy5e-lazy-exp-and-hp | _onChangeHpForceHpValueLimit2 | [16] WARN: The hp.tempmax value ${newAmountHpTempMax} is not a valid number`
		);
		newAmountHpTempMax = 0;
	}

	debug(
		`tidy5e-lazy-exp-and-hp | _onChangeHpForceHpValueLimit2 | Update system.attributes.hp.value to ${newAmountHpValue}`
	);
	debug(
		`tidy5e-lazy-exp-and-hp | _onChangeHpForceHpValueLimit2 | Update system.attributes.hp.temp to ${newAmountHpTemp}`
	);
	debug(
		`tidy5e-lazy-exp-and-hp | _onChangeHpForceHpValueLimit2 | Update system.attributes.hp.tempmax to ${newAmountHpTempMax}`
	);

	sheet.submitOnChange = false;
	actor
		.update({
			"system.attributes.hp.value": Number(newAmountHpValue),
			"system.attributes.hp.temp": Number(newAmountHpTemp),
			"system.attributes.hp.tempmax": Number(newAmountHpTempMax)
		})
		.then(() => {
			input.value = Number(getProperty(actor, input.name) ?? 0);
			sheet.submitOnChange = true;
		})
		.catch(console.log.bind(console));
}

function _onChangeHpForceHpTempLimit2(ev) {
	const input = ev.target;
	const actor = ev.data.app.actor;
	const sheet = ev.data.app.options;
	const hpTemp = ev.data.app.actor.system.attributes.hp.temp;
	const maxHpTemp = ev.data.app.actor.system.attributes.hp.tempmax;

	let newAmountHpTemp = Number(input.value);

	if (newAmountHpTemp < 0 || !is_real_number(newAmountHpTemp)) {
		debug(
			`tidy5e-lazy-exp-and-hp | _onChangeHpForceHpTempLimit2 | [17] WARN: The hp.temp value ${newAmountHpTemp} is not a valid number`
		);
		newAmountHpTemp = hpTemp;
	}

	if (newAmountHpTemp < 0 || !is_real_number(newAmountHpTemp)) {
		debug(
			`tidy5e-lazy-exp-and-hp | _onChangeHpForceHpTempLimit2 | [18] WARN: The hp.temp value ${newAmountHpTemp} is not a valid number`
		);
		newAmountHpTemp = 0;
	}

	debug(
		`tidy5e-lazy-exp-and-hp | _onChangeHpForceHpTempLimit2 | Update system.attributes.hp.temp to ${newAmountHpTemp}`
	);

	sheet.submitOnChange = false;
	actor
		.update({ "system.attributes.hp.temp": Number(newAmountHpTemp) })
		.then(() => {
			input.value = Number(getProperty(actor, input.name) ?? 0);
			sheet.submitOnChange = true;
		})
		.catch(console.log.bind(console));
}

export function applyLazyExp(app, html, actorData) {
	if (!game.settings.get(CONSTANTS.MODULE_ID, "lazyHpAndExpEnable")) {
		return;
	}

	for (const elem of html.find("input[name='system.details.xp.value']")) {
		elem.type = "text";
		elem.classList.add("lazyexp");
	}
	html.find("input[name='system.details.xp.value']").off("change");
	html.find("input[name='system.details.xp.value']").change(
		{
			app: app,
			data: actorData
		},
		_onChangeExp
	);
}

export function applyLazyHp(app, html, actorData) {
	if (!game.settings.get(CONSTANTS.MODULE_ID, "lazyHpAndExpEnable")) {
		if (game.settings.get(CONSTANTS.MODULE_ID, "lazyHpForceHpValueLimit2")) {
			for (const elem of html.find("input[name='system.attributes.hp.value']")) {
				elem.type = "text";
				elem.classList.add("lazyhp");
			}
			html.find("input[name='system.attributes.hp.value']").off("change");
			html.find("input[name='system.attributes.hp.value']").change(
				{
					app: app,
					data: actorData
				},
				_onChangeHpForceHpValueLimit2
			);
			for (const elem of html.find("input[name='system.attributes.hp.temp']")) {
				elem.type = "text";
				elem.classList.add("lazyhp");
			}
			html.find("input[name='system.attributes.hp.temp']").off("change");
			html.find("input[name='system.attributes.hp.temp']").change(
				{
					app: app,
					data: actorData
				},
				_onChangeHpForceHpTempLimit2
			);
		} else if (game.settings.get(CONSTANTS.MODULE_ID, "lazyHpForceHpValueLimit1")) {
			for (const elem of html.find("input[name='system.attributes.hp.value']")) {
				elem.type = "text";
				elem.classList.add("lazyhp");
			}
			html.find("input[name='system.attributes.hp.value']").off("change");
			html.find("input[name='system.attributes.hp.value']").change(
				{
					app: app,
					data: actorData
				},
				_onChangeHpForceHpValueLimit1
			);
		}
		return;
	}

	for (const elem of html.find("input[name='system.attributes.hp.value']")) {
		elem.type = "text";
		elem.classList.add("lazyhp");
	}
	html.find("input[name='system.attributes.hp.value']").off("change");
	html.find("input[name='system.attributes.hp.value']").change(
		{
			app: app,
			data: actorData
		},
		_onChangeHp
	);

	for (const elem of html.find("input[name='system.attributes.hp.max']")) {
		elem.type = "text";
		elem.classList.add("lazyhp");
	}
	html.find("input[name='system.attributes.hp.max']").off("change");
	html.find("input[name='system.attributes.hp.max']").change(
		{
			app: app,
			data: actorData
		},
		_onChangeHpMax
	);

	if (game.settings.get(CONSTANTS.MODULE_ID, "lazyHpForceHpValueLimit2")) {
		for (const elem of html.find("input[name='system.attributes.hp.temp']")) {
			elem.type = "text";
			elem.classList.add("lazyhp");
		}
		html.find("input[name='system.attributes.hp.temp']").off("change");
		html.find("input[name='system.attributes.hp.temp']").change(
			{
				app: app,
				data: actorData
			},
			_onChangeHpForceHpTempLimit2
		);
	}
}

// Hooks.on("preUpdateActor", function (actorEntity, update, options, userId) {
// 	if (!game.settings.get(CONSTANTS.MODULE_ID, "lazyHpAndExpEnable")) {
// 		return;
// 	}

// 	if (!actorEntity) {
// 		return;
// 	}
// 	if (hasProperty(update, "system.attributes.hp.value")) {
// 		let hpValue = getProperty(update, "system.attributes.hp.value");
// 		if(isEmptyObject(hpValue)) {
// 			// Do nothing
// 		} else {
// 			if (!is_lazy_number(hpValue) && Number(hpValue) !== Number(actorEntity.system.attributes.hp.value)) {
// 				setProperty(update, "system.attributes.hp.value", Number(hpValue));
// 				info(`tidy5e-lazy-exp-and-hp | preUpdateActor | [0] update system.attributes.hp.value from '${hpValue}' to '${getProperty(update, "system.attributes.hp.value")}'`);
// 			}
// 			// Module compatibility with https://foundryvtt.com/packages/link-item-resource-5e
// 			else if (String(hpValue).startsWith("0") && String(hpValue) !== "0") {
// 				let hpValueTmp = hpValue;
// 				while (String(hpValueTmp).startsWith("0")) {
// 					if (String(hpValueTmp) === "0") {
// 						break;
// 					}
// 					hpValueTmp = String(hpValueTmp).slice(1);
// 				}
// 				if(Number(hpValueTmp) !== Number(actorEntity.system.attributes.hp.value)) {
// 					setProperty(update, "system.attributes.hp.value", Number(hpValueTmp ?? 0));
// 					info(`tidy5e-lazy-exp-and-hp | preUpdateActor | [1] update system.attributes.hp.value from '${hpValue}' to '${getProperty(update, "system.attributes.hp.value")}'`);
// 				}
// 			}
// 			if(!is_real_number(getProperty(update, "system.attributes.hp.value"))) {
// 				setProperty(update, "system.attributes.hp.value", 0);
// 				info(`tidy5e-lazy-exp-and-hp | preUpdateActor | [2] update system.attributes.hp.value from '${getProperty(update, "system.attributes.hp.value")}' to number 0`);
// 			}
// 		}
// 	}
// 	if (hasProperty(update, "system.attributes.hp.max")) {
// 		let hpMaxValue = getProperty(update, "system.attributes.hp.max");
// 		if(isEmptyObject(hpMaxValue)) {
// 			// Do nothing
// 		} else {
// 			if (!is_lazy_number(hpMaxValue) && Number(hpMaxValue) !== Number(actorEntity.system.attributes.hp.max)) {
// 				setProperty(update, "system.attributes.hp.max", Number(hpMaxValue ?? 0));
// 				info(`tidy5e-lazy-exp-and-hp | preUpdateActor | [0] update system.attributes.hp.max from '${hpMaxValue}' to '${getProperty(update, "system.attributes.hp.max")}'`);
// 			}
// 			// Module compatibility with https://foundryvtt.com/packages/link-item-resource-5e
// 			else if (String(hpMaxValue).startsWith("0") && String(hpMaxValue) !== "0") {
// 				let hpMaxValueTmp = hpMaxValue;
// 				while (String(hpMaxValueTmp).startsWith("0")) {
// 					if (String(hpMaxValueTmp) === "0") {
// 						break;
// 					}
// 					hpMaxValueTmp  = String(hpMaxValueTmp).slice(1);
// 				}
// 				if(Number(hpMaxValueTmp) !== Number(actorEntity.system.attributes.hp.max)) {
// 					setProperty(update, "system.attributes.hp.max", Number(hpMaxValueTmp ?? 0));
// 					info(`tidy5e-lazy-exp-and-hp | preUpdateActor | [1] update system.attributes.hp.max from '${hpMaxValue}' to '${getProperty(update, "system.attributes.hp.max")}'`);
// 				}
// 			}
// 			if(!is_real_number(getProperty(update, "system.attributes.hp.max"))) {
// 				setProperty(update, "system.attributes.hp.max", 0);
// 				info(`tidy5e-lazy-exp-and-hp | preUpdateActor | [2] update system.attributes.hp.max from '${getProperty(update, "system.attributes.hp.max")}' to number 0`);
// 			}
// 		}
// 	}
// 	if (hasProperty(update, "system.details.xp.value")) {
// 		let xpValue = getProperty(update, "system.details.xp.value");
// 		if(isEmptyObject(xpValue)) {
// 			// Do nothing
// 		} else {
// 			if (!is_lazy_number(xpValue) && Number(xpValue) !== Number(actorEntity.system.details.xp.value)) {
// 				setProperty(update, "system.details.xp.value", Number(xpValue ?? 0));
// 				info(`tidy5e-lazy-exp-and-hp | preUpdateActor | [0] update system.details.xp.value from '${xpValue}' to '${getProperty(update, "system.details.xp.value")}'`);
// 			}
// 			// Module compatibility with https://foundryvtt.com/packages/link-item-resource-5e
// 			else if (String(xpValue).startsWith("0") && String(xpValue) !== "0") {
// 				let xpValueTmp = xpValue;
// 				while (String(xpValueTmp).startsWith("0")) {
// 					if (String(xpValueTmp) === "0") {
// 						break;
// 					}
// 					xpValueTmp = String(xpValueTmp).slice(1);
// 				}
// 				if(Number(xpValueTmp) !== Number(actorEntity.system.details.xp.value)) {
// 					setProperty(update, "system.details.xp.value", Number(xpValueTmp ?? 0));
// 					info(`tidy5e-lazy-exp-and-hp | preUpdateActor | [1] update system.details.xp.value from '${xpValue}' to '${getProperty(update, "system.details.xp.value")}'`);
// 				}
// 			}
// 			if(!is_real_number(getProperty(update, "system.details.xp.value"))) {
// 				setProperty(update, "system.details.xp.value", 0);
// 				info(`tidy5e-lazy-exp-and-hp | preUpdateActor | [2] update system.details.xp.value from '${getProperty(update, "system.details.xp.value")}' to number 0`);
// 			}
// 		}
// 	}
// });
