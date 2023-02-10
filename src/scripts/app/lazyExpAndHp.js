import { debug } from "./logger-util.js";
import CONSTANTS from "./constants.js";
import { is_lazy_number, is_real_number } from "./helpers.js";

const signCase = {
	add: "+",
	subtract: "-",
	equals: "=",
	default: " ",
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
    debug(`[0] WARN: The xp value ${newAmountExp} is not a valid number`);
		newAmountExp = exp;
	}

	if (newAmountExp > maxExp) {
		newAmountExp = maxExp;
	}
	// if(newAmount <  minExp) {
	//     newAmount = minExp;
	// }
	if (newAmountExp < 0 || !is_real_number(newAmountExp)) {
    debug(`[1] WARN: The xp value ${newAmountExp} is not a valid number`);
		newAmountExp = 0;
	}

	sheet.submitOnChange = false;
	actor
		.update({ "system.details.xp.value": Number(newAmountExp) })
		.then(() => {
			input.value = Number(getProperty(actor, input.name));
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

	if (newAmountHpValue <  0 || !is_real_number(newAmountHpValue)) {
    debug(`[2] WARN: The hp.value value ${newAmountHpValue} is not a valid number`);
		newAmountHpValue = hp;
	}

	if (game.settings.get(CONSTANTS.MODULE_ID, "lazyHpForceHpValueLimit2")) {
		if (newAmountHpValue > maxHp) {
			let tmp = (newAmountHpValue - maxHp);
			let tmp2 = newAmountHpTemp + tmp;
			if(newAmountHpTempMax < tmp2) {
				let tmp3 = tmp2 - newAmountHpTempMax;
				newAmountHpTempMax = newAmountHpTempMax + tmp3;
			}
			newAmountHpTemp = tmp2;
			newAmountHpValue = maxHp;
		}
		// if(newAmount <  minHp) {
		//     newAmount = minHp;
		// }

		if (newAmountHpValue < 0  || !is_real_number(newAmountHpValue)) {
      debug(`[3] WARN: The hp.value value ${newAmountHpValue} is not a valid number`);
			newAmountHpValue = 0;
		}
		if (newAmountHpTemp < 0 || !is_real_number(newAmountHpTemp)) {
      debug(`[4] WARN: The hp.temp value ${newAmountHpTemp} is not a valid number`);
			newAmountHpTemp = 0;
		}
		if (newAmountHpTempMax < 0 || !is_real_number(newAmountHpTempMax)) {
      debug(`[5] WARN: The hp.tempmax value ${newAmountHpTempMax} is not a valid number`);
			newAmountHpTempMax = 0;
		}

		sheet.submitOnChange = false;
		actor
		.update({
			"system.attributes.hp.value": Number(newAmountHpValue),
			"system.attributes.hp.temp": Number(newAmountHpTemp),
			"system.attributes.hp.tempmax": Number(newAmountHpTempMax),
		})
		.then(() => {
			input.value = Number(getProperty(actor, input.name));
			sheet.submitOnChange = true;
		})
		.catch(console.log.bind(console));

	} else {

		if (newAmountHpValue < 0 || !is_real_number(newAmountHpValue)) {
      debug(`[6] WARN: The hp.value value ${newAmountHpValue} is not a valid number`);
			newAmountHpValue = 0;
		}

    if (game.settings.get(CONSTANTS.MODULE_ID, "lazyHpForceHpValueLimit1")) {
      if(newAmountHpValue > (maxHp + newAmountHpTempMax)) {
          newAmountHpValue = maxHp + newAmountHpTempMax;
      }
    }

		sheet.submitOnChange = false;
		actor
			.update({ "system.attributes.hp.value": Number(newAmountHpValue) })
			.then(() => {
				input.value = Number(getProperty(actor, input.name));
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
    debug(`[7] WARN: The hp.max value ${newAmountHpMax} is not a valid number`);
		newAmountHpMax = maxHp;
	}

	// if(newAmount > maxHp) {
	//     newAmount = maxHp;
	// }
	// if(newAmount <  minHp) {
	//     newAmount = minHp;
	// }
	if (newAmountHpMax < 0  || !is_real_number(newAmountHpMax)) {
    debug(`[8] WARN: The hp.value value ${newAmountHpMax} is not a valid number`);
		newAmountHpMax = 0;
	}

	sheet.submitOnChange = false;
	actor
		.update({ "system.attributes.hp.max": Number(newAmountHpMax) })
		.then(() => {
			input.value = Number(getProperty(actor, input.name));
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
    debug(`[9] WARN: The hp.value value ${newAmountHpValue} is not a valid number`);
		newAmountHpValue = hp;
	}

	if (newAmountHpValue < 0  || !is_real_number(newAmountHpValue)) {
    debug(`[10] WARN: The hp.value value ${newAmountHpValue} is not a valid number`);
		newAmountHpValue = 0;
	}
	if (newAmountHpTemp < 0 || !is_real_number(newAmountHpTemp)) {
    debug(`[11] WARN: The hp.temp value ${newAmountHpTemp} is not a valid number`);
		newAmountHpTemp = 0;
	}
	if (newAmountHpTempMax < 0 || !is_real_number(newAmountHpTempMax)) {
    debug(`[12] WARN: The hp.tempmax value ${newAmountHpTempMax} is not a valid number`);
		newAmountHpTempMax = 0;
	}

  if(newAmountHpValue > (maxHp + newAmountHpTempMax)) {
      newAmountHpValue = maxHp + newAmountHpTempMax;
  }

	sheet.submitOnChange = false;
	actor
		.update({
			"system.attributes.hp.value": Number(newAmountHpValue),
		})
		.then(() => {
			input.value = Number(getProperty(actor, input.name));
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
    debug(`[13] WARN: The hp.value value ${newAmountHpValue} is not a valid number`);
		newAmountHpValue = hp;
	}

  if (newAmountHpValue > maxHp) {
    let tmp = (newAmountHpValue - maxHp);
    let tmp2 = newAmountHpTemp + tmp;
    if(newAmountHpTempMax < tmp2) {
      let tmp3 = tmp2 - newAmountHpTempMax;
      newAmountHpTempMax = newAmountHpTempMax + tmp3;
    }
    newAmountHpTemp = tmp2;
    newAmountHpValue = maxHp;
  }
  // if(newAmount <  minHp) {
  //     newAmount = minHp;
  // }

	if (newAmountHpValue < 0  || !is_real_number(newAmountHpValue)) {
    debug(`[14] WARN: The hp.value value ${newAmountHpValue} is not a valid number`);
		newAmountHpValue = 0;
	}
	if (newAmountHpTemp < 0 || !is_real_number(newAmountHpTemp)) {
    debug(`[15] WARN: The hp.temp value ${newAmountHpTemp} is not a valid number`);
		newAmountHpTemp = 0;
	}
	if (newAmountHpTempMax < 0 || !is_real_number(newAmountHpTempMax)) {
    debug(`[16] WARN: The hp.tempmax value ${newAmountHpTempMax} is not a valid number`);
		newAmountHpTempMax = 0;
	}

	sheet.submitOnChange = false;
	actor
		.update({
			"system.attributes.hp.value": Number(newAmountHpValue),
			"system.attributes.hp.temp": Number(newAmountHpTemp),
			"system.attributes.hp.tempmax": Number(newAmountHpTempMax),
		})
		.then(() => {
			input.value = Number(getProperty(actor, input.name));
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

	if (newAmountHpTemp <0 ||  !is_real_number(newAmountHpTemp)) {
    debug(`[17] WARN: The hp.temp value ${newAmountHpTemp} is not a valid number`);
		newAmountHpTemp = hpTemp;
	}

	if (newAmountHpTemp < 0 || !is_real_number(newAmountHpTemp)) {
    debug(`[18] WARN: The hp.temp value ${newAmountHpTemp} is not a valid number`);
		newAmountHpTemp = 0;
	}

	sheet.submitOnChange = false;
	actor
		.update({ "system.attributes.hp.temp": Number(newAmountHpTemp) })
		.then(() => {
			input.value = Number(getProperty(actor, input.name));
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
			data: actorData,
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
					data: actorData,
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
					data: actorData,
				},
				_onChangeHpForceHpTempLimit2
			);
		}
    else if (game.settings.get(CONSTANTS.MODULE_ID, "lazyHpForceHpValueLimit1")) {
			for (const elem of html.find("input[name='system.attributes.hp.value']")) {
				elem.type = "text";
				elem.classList.add("lazyhp");
			}
			html.find("input[name='system.attributes.hp.value']").off("change");
			html.find("input[name='system.attributes.hp.value']").change(
				{
					app: app,
					data: actorData,
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
			data: actorData,
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
			data: actorData,
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
			data: actorData,
		},
		_onChangeHpForceHpTempLimit2
		);
	}
}

Hooks.on("preUpdateActor", function (actorEntity, update, options, userId) {
	if (!game.settings.get(CONSTANTS.MODULE_ID, "lazyHpAndExpEnable")) {
		return;
	}

	if (!actorEntity) {
		return;
	}
	if (hasProperty(update, "system.attributes.hp.value")) {
		let hpValue = getProperty(update, "system.attributes.hp.value") || 0;
		if (!is_lazy_number(hpValue)) {
			setProperty(update, "system.attributes.hp.value", Number(hpValue));
		}
		// Module compatibility with https://foundryvtt.com/packages/link-item-resource-5e
		else if (String(hpValue).startsWith("0")) {
			while (String(hpValue).startsWith("0")) {
				if (String(hpValue) === "0") {
					break;
				}
				hpValue = String(hpValue).slice(1);
			}
			setProperty(update, "system.attributes.hp.value", Number(hpValue));
		}
	}
	if (hasProperty(update, "system.attributes.hp.max")) {
		let hpMaxValue = getProperty(update, "system.attributes.hp.max") || 0;
		if (!is_lazy_number(hpMaxValue)) {
			setProperty(update, "system.attributes.hp.max", Number(hpMaxValue));
		}
		// Module compatibility with https://foundryvtt.com/packages/link-item-resource-5e
		else if (String(hpMaxValue).startsWith("0")) {
			while (String(hpMaxValue).startsWith("0")) {
				if (String(hpMaxValue) === "0") {
					break;
				}
				hpMaxValue = String(hpMaxValue).slice(1);
			}
			setProperty(update, "system.attributes.hp.max", Number(hpMaxValue));
		}
	}
	if (hasProperty(update, "system.details.xp.value")) {
		let xpValue = getProperty(update, "system.details.xp.value") || 0;
		if (!is_lazy_number(xpValue)) {
			setProperty(update, "system.details.xp.value", Number(xpValue));
		}
		// Module compatibility with https://foundryvtt.com/packages/link-item-resource-5e
		else if (String(xpValue).startsWith("0")) {
			while (String(xpValue).startsWith("0")) {
				if (String(xpValue) === "0") {
					break;
				}
				xpValue = String(xpValue).slice(1);
			}
			setProperty(update, "system.details.xp.value", Number(xpValue));
		}
	}
	// console.log('actor updated!')
});
