const signCase = {
    add: "+",
    subtract: "-",
    equals: "=",
    default: " ",
};
function _onChangeCurrency(ev) {
    const input = ev.target;
    const actor = ev.data.app.actor;
    const sheet = ev.data.app.options;
    const money = ev.data.app.actor.system.currency;
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
    }
    else {
        delta = Number(splitVal[0]);
        chatLog(actor, `${game.user?.name} on ${actor.name} has replaced ${money[denom]} ${denom} with ${delta} ${denom}.`);
        return;
    }
    let newAmount = {};
    if (!(denom === "ep" && game.settings.get('tidy5e-sheet', "lazyMoneyIgnoreElectrum"))) {
        switch (sign) {
            case signCase.add: {
                newAmount = addMoney(money, delta, denom);
                chatLog(actor, `${game.user?.name} on ${actor.name} has added ${delta} ${denom}.`);
                break;
            }
            case signCase.subtract: {
                newAmount = removeMoney(money, delta, denom);
                chatLog(actor, `${game.user?.name} on ${actor.name} has removed ${delta} ${denom}.`);
                if (!newAmount) {
                    flash(input);
                    newAmount = money;
                }
                break;
            }
            case signCase.equals: {
                newAmount = updateMoney(money, delta, denom);
                chatLog(actor, `${game.user?.name} on ${actor.name} has replaced ${money[denom]} ${denom} with ${delta} ${denom}.`);
                break;
            }
            default: {
                newAmount = updateMoney(money, delta, denom);
                chatLog(actor, `${game.user?.name} on ${actor.name} has replaced ${money[denom]} ${denom} with ${delta} ${denom}.`);
                break;
            }
        }
    }
    if (Object.keys(newAmount).length > 0) {
        sheet.submitOnChange = false;
        actor
            .update({ "system.currency": newAmount })
            .then(() => {
            input.value = Number(getProperty(actor, input.name));
            sheet.submitOnChange = true;
        })
            .catch(console.log.bind(console));
    }
}
function chatLog(actor, money) {
    console.log("tidy5e-sheet | " + money);
    if (game.settings.get('tidy5e-sheet', "lazyMoneyChatLog")) {
        const msgData = {
            content: money,
            speaker: ChatMessage.getSpeaker({ actor: actor }),
            whisper: ChatMessage.getWhisperRecipients("GM"),
        };
        return ChatMessage.create(msgData);
    }
    else {
        return undefined;
    }
}
function getCpValue() {
    let cpValue = {};
    if (game.modules.get("world-currency-5e")?.active) {
        const ignorePP = game.settings.get("world-currency-5e", "ppAltRemove");
        const ignoreGP = game.settings.get("world-currency-5e", "gpAltRemove");
        const ignoreEP = game.settings.get("world-currency-5e", "epAltRemove");
        const ignoreSP = game.settings.get("world-currency-5e", "spAltRemove");
        const ignoreCP = game.settings.get("world-currency-5e", "cpAltRemove");
        let gpConvertb = game.settings.get("world-currency-5e", "gpConvert");
        if (!is_real_number(gpConvertb)) {
            gpConvertb = 1;
        }
        else {
            gpConvertb = gpConvertb;
        }
        let ppConvertb = game.settings.get("world-currency-5e", "ppConvert");
        if (!is_real_number(ppConvertb)) {
            ppConvertb = 0.1;
        }
        else {
            if (ppConvertb >= 1) {
                ppConvertb = gpConvertb / ppConvertb;
            }
            else {
                ppConvertb = gpConvertb * ppConvertb;
            }
        }
        let epConvertb = game.settings.get("world-currency-5e", "epConvert");
        if (!is_real_number(epConvertb)) {
            epConvertb = 5;
        }
        else {
            if (epConvertb >= 1) {
                epConvertb = gpConvertb * epConvertb;
            }
            else {
                epConvertb = gpConvertb / epConvertb;
            }
        }
        let spConvertb = game.settings.get("world-currency-5e", "spConvert");
        if (!is_real_number(spConvertb)) {
            spConvertb = 10;
        }
        else {
            if (spConvertb >= 1) {
                spConvertb = gpConvertb * spConvertb;
            }
            else {
                spConvertb = gpConvertb / spConvertb;
            }
        }
        let cpConvertb = game.settings.get("world-currency-5e", "cpConvert");
        if (!is_real_number(cpConvertb)) {
            cpConvertb = 100;
        }
        else {
            if (cpConvertb >= 1) {
                cpConvertb = gpConvertb * cpConvertb;
            }
            else {
                cpConvertb = gpConvertb / cpConvertb;
            }
        }
        // Reconvert gold calculation to copper calculation
        const ppConvert = (gpConvertb / ppConvertb) * cpConvertb;
        const gpConvert = gpConvertb * cpConvertb;
        const epConvert = (gpConvertb / epConvertb) * cpConvertb;
        const spConvert = (gpConvertb / spConvertb) * cpConvertb;
        const cpConvert = 1;
        if (ignorePP && ignoreGP && ignoreEP && ignoreSP && ignoreCP) {
            cpValue = {};
        }
        if (ignorePP && ignoreGP && ignoreEP && ignoreSP && !ignoreCP) {
            cpValue = {
                cp: { value: cpConvert, up: "", down: "" },
            };
        }
        if (ignorePP && ignoreGP && ignoreEP && !ignoreSP && ignoreCP) {
            cpValue = {
                sp: { value: cpConvert, up: "", down: "" },
            };
        }
        if (ignorePP && ignoreGP && ignoreEP && !ignoreSP && !ignoreCP) {
            cpValue = {
                sp: { value: spConvert, up: "", down: "cp" },
                cp: { value: cpConvert, up: "sp", down: "" },
            };
        }
        if (ignorePP && ignoreGP && !ignoreEP && ignoreSP && ignoreCP) {
            cpValue = {
                ep: { value: cpConvert, up: "", down: "" },
            };
        }
        if (ignorePP && ignoreGP && !ignoreEP && ignoreSP && !ignoreCP) {
            cpValue = {
                ep: { value: epConvert, up: "", down: "sp" },
                cp: { value: cpConvert, up: "ep", down: "" },
            };
        }
        if (ignorePP && ignoreGP && !ignoreEP && !ignoreSP && ignoreCP) {
            cpValue = {
                ep: { value: epConvert, up: "", down: "sp" },
                sp: { value: spConvert, up: "ep", down: "" },
            };
        }
        if (ignorePP && ignoreGP && !ignoreEP && !ignoreSP && !ignoreCP) {
            cpValue = {
                ep: { value: epConvert, up: "", down: "sp" },
                sp: { value: spConvert, up: "ep", down: "cp" },
                cp: { value: cpConvert, up: "sp", down: "" },
            };
        }
        if (ignorePP && !ignoreGP && ignoreEP && ignoreSP && ignoreCP) {
            cpValue = {
                gp: { value: gpConvert, up: "", down: "sp" },
                sp: { value: spConvert, up: "gp", down: "cp" },
                cp: { value: cpConvert, up: "sp", down: "" },
            };
        }
        if (ignorePP && !ignoreGP && ignoreEP && ignoreSP && !ignoreCP) {
            cpValue = {
                gp: { value: gpConvert, up: "", down: "cp" },
                cp: { value: cpConvert, up: "gp", down: "" },
            };
        }
        if (ignorePP && !ignoreGP && ignoreEP && !ignoreSP && ignoreCP) {
            cpValue = {
                gp: { value: gpConvert, up: "", down: "sp" },
                sp: { value: spConvert, up: "gp", down: "" },
            };
        }
        if (ignorePP && !ignoreGP && ignoreEP && !ignoreSP && !ignoreCP) {
            cpValue = {
                gp: { value: gpConvert, up: "", down: "sp" },
                sp: { value: spConvert, up: "gp", down: "cp" },
                cp: { value: cpConvert, up: "sp", down: "" },
            };
        }
        if (ignorePP && !ignoreGP && !ignoreEP && ignoreSP && ignoreCP) {
            cpValue = {
                gp: { value: gpConvert, up: "", down: "ep" },
                ep: { value: epConvert, up: "gp", down: "" },
            };
        }
        if (ignorePP && !ignoreGP && !ignoreEP && ignoreSP && !ignoreCP) {
            cpValue = {
                gp: { value: gpConvert, up: "", down: "ep" },
                ep: { value: epConvert, up: "gp", down: "cp" },
                cp: { value: cpConvert, up: "ep", down: "" },
            };
        }
        if (ignorePP && !ignoreGP && !ignoreEP && !ignoreSP && ignoreCP) {
            cpValue = {
                gp: { value: gpConvert, up: "", down: "ep" },
                ep: { value: epConvert, up: "gp", down: "sp" },
                sp: { value: spConvert, up: "ep", down: "" },
            };
        }
        if (ignorePP && !ignoreGP && !ignoreEP && !ignoreSP && !ignoreCP) {
            cpValue = {
                gp: { value: gpConvert, up: "", down: "ep" },
                ep: { value: epConvert, up: "gp", down: "sp" },
                sp: { value: spConvert, up: "ep", down: "cp" },
                cp: { value: cpConvert, up: "sp", down: "" },
            };
        }
        if (!ignorePP && ignoreGP && ignoreEP && ignoreSP && ignoreCP) {
            cpValue = {
                pp: { value: cpConvert, up: "", down: "" },
            };
        }
        if (!ignorePP && ignoreGP && ignoreEP && ignoreSP && !ignoreCP) {
            cpValue = {
                pp: { value: ppConvert, up: "", down: "cp" },
                cp: { value: cpConvert, up: "pp", down: "" },
            };
        }
        if (!ignorePP && ignoreGP && ignoreEP && !ignoreSP && ignoreCP) {
            cpValue = {
                pp: { value: ppConvert, up: "", down: "sp" },
                sp: { value: spConvert, up: "pp", down: "" },
            };
        }
        if (!ignorePP && ignoreGP && ignoreEP && !ignoreSP && !ignoreCP) {
            cpValue = {
                pp: { value: ppConvert, up: "", down: "sp" },
                sp: { value: spConvert, up: "pp", down: "cp" },
                cp: { value: cpConvert, up: "sp", down: "" },
            };
        }
        if (!ignorePP && ignoreGP && !ignoreEP && ignoreSP && ignoreCP) {
            cpValue = {
                pp: { value: ppConvert, up: "", down: "ep" },
                ep: { value: epConvert, up: "pp", down: "" },
            };
        }
        if (!ignorePP && ignoreGP && !ignoreEP && ignoreSP && !ignoreCP) {
            cpValue = {
                pp: { value: ppConvert, up: "", down: "ep" },
                ep: { value: epConvert, up: "pp", down: "cp" },
                cp: { value: cpConvert, up: "ep", down: "" },
            };
        }
        if (!ignorePP && ignoreGP && !ignoreEP && !ignoreSP && ignoreCP) {
            cpValue = {
                pp: { value: ppConvert, up: "", down: "ep" },
                ep: { value: epConvert, up: "pp", down: "sp" },
                sp: { value: spConvert, up: "ep", down: "" },
            };
        }
        if (!ignorePP && ignoreGP && !ignoreEP && !ignoreSP && !ignoreCP) {
            cpValue = {
                pp: { value: ppConvert, up: "", down: "ep" },
                ep: { value: epConvert, up: "pp", down: "sp" },
                sp: { value: spConvert, up: "ep", down: "cp" },
                cp: { value: cpConvert, up: "sp", down: "" },
            };
        }
        if (!ignorePP && !ignoreGP && ignoreEP && ignoreSP && ignoreCP) {
            cpValue = {
                pp: { value: ppConvert, up: "", down: "gp" },
                gp: { value: gpConvert, up: "pp", down: "" },
            };
        }
        if (!ignorePP && !ignoreGP && ignoreEP && ignoreSP && !ignoreCP) {
            cpValue = {
                pp: { value: ppConvert, up: "", down: "gp" },
                gp: { value: gpConvert, up: "pp", down: "cp" },
                cp: { value: cpConvert, up: "gp", down: "" },
            };
        }
        if (!ignorePP && !ignoreGP && ignoreEP && !ignoreSP && ignoreCP) {
            cpValue = {
                pp: { value: ppConvert, up: "", down: "gp" },
                gp: { value: gpConvert, up: "pp", down: "sp" },
                sp: { value: spConvert, up: "gp", down: "" },
            };
        }
        if (!ignorePP && !ignoreGP && ignoreEP && !ignoreSP && !ignoreCP) {
            cpValue = {
                pp: { value: ppConvert, up: "", down: "gp" },
                gp: { value: gpConvert, up: "pp", down: "sp" },
                sp: { value: spConvert, up: "gp", down: "cp" },
                cp: { value: cpConvert, up: "sp", down: "" },
            };
        }
        if (!ignorePP && !ignoreGP && !ignoreEP && ignoreSP && ignoreCP) {
            cpValue = {
                pp: { value: ppConvert, up: "", down: "gp" },
                gp: { value: gpConvert, up: "pp", down: "ep" },
                ep: { value: epConvert, up: "gp", down: "" },
            };
        }
        if (!ignorePP && !ignoreGP && !ignoreEP && ignoreSP && !ignoreCP) {
            cpValue = {
                pp: { value: ppConvert, up: "", down: "gp" },
                gp: { value: gpConvert, up: "pp", down: "ep" },
                ep: { value: epConvert, up: "gp", down: "cp" },
                cp: { value: cpConvert, up: "ep", down: "" },
            };
        }
        if (!ignorePP && !ignoreGP && !ignoreEP && !ignoreSP && ignoreCP) {
            cpValue = {
                pp: { value: ppConvert, up: "", down: "gp" },
                gp: { value: gpConvert, up: "pp", down: "ep" },
                ep: { value: epConvert, up: "gp", down: "sp" },
                sp: { value: spConvert, up: "ep", down: "" },
            };
        }
        if (!ignorePP && !ignoreGP && !ignoreEP && !ignoreSP && !ignoreCP) {
            cpValue = {
                pp: { value: ppConvert, up: "", down: "gp" },
                gp: { value: gpConvert, up: "pp", down: "ep" },
                ep: { value: epConvert, up: "gp", down: "sp" },
                sp: { value: spConvert, up: "ep", down: "cp" },
                cp: { value: cpConvert, up: "sp", down: "" },
            };
        }
    }
    else {
        if (game.settings.get('tidy5e-sheet', "lazyMoneyIgnoreElectrum")) {
            cpValue = {
                pp: { value: 1000, up: "", down: "gp" },
                gp: { value: 100, up: "pp", down: "sp" },
                sp: { value: 10, up: "gp", down: "cp" },
                cp: { value: 1, up: "sp", down: "" },
            };
        }
        else {
            cpValue = {
                pp: { value: 1000, up: "", down: "gp" },
                gp: { value: 100, up: "pp", down: "ep" },
                ep: { value: 50, up: "gp", down: "sp" },
                sp: { value: 10, up: "ep", down: "cp" },
                cp: { value: 1, up: "sp", down: "" },
            };
        }
    }
    let total = 1;
    //@ts-ignore
    const convert = CONFIG.DND5E.currencies;
    Object.values(convert)
        .reverse()
        .forEach((v) => {
        if (v.conversion !== undefined) {
            total *= v.conversion.each;
            if (cpValue[v.conversion.into]) {
                cpValue[v.conversion.into].value = total;
            }
        }
    });
    // if (game.settings.get('tidy5e-sheet', "ignoreElectrum")) {
    // 	cpValue.gp.down = "sp";
    // 	cpValue.sp.up = "gp";
    // 	delete cpValue.ep;
    // }
    return cpValue;
}
function getDelta(delta, denom) {
    const cpValue = getCpValue();
    let newDelta = {};
    delta *= cpValue[denom].value;
    for (let key in cpValue) {
        const myValue = cpValue[key].value;
        let intDiv = Number(~~(delta / myValue));
        if (intDiv > 0) {
            newDelta[key] = intDiv;
            delta %= myValue;
        }
    }
    return newDelta;
}
function scaleDown(oldAmount, denom) {
    const cpValue = getCpValue();
    const up = cpValue[denom].up;
    let newAmount = oldAmount;
    if (newAmount[up] > 0) {
        newAmount[up] -= 1;
        newAmount[denom] += ~~(cpValue[up].value / cpValue[denom].value);
        return newAmount;
    }
    else if (newAmount[up] === 0) {
        newAmount = scaleDown(newAmount, up);
        scaleDown(newAmount, denom);
        return newAmount;
    }
    else {
        return false;
    }
}
function addMoney(oldAmount, delta, denom) {
    const cpValue = getCpValue();
    let newAmount = {};
    if (game.settings.get('tidy5e-sheet', "lazyMoneyAddConvert")) {
        let cpDelta = delta * cpValue[denom].value;
        for (let key in cpValue) {
            const myValue = cpValue[key].value;
            newAmount[key] = oldAmount[key] + ~~(cpDelta / myValue);
            cpDelta %= myValue;
        }
    }
    else {
        newAmount[denom] = oldAmount[denom] + delta;
    }
    return newAmount;
}
function removeMoney(oldAmount, delta, denom) {
    const cpValue = getCpValue();
    let newAmount = oldAmount;
    let newDelta = {};
    let down;
    if (oldAmount[denom] >= delta) {
        newAmount[denom] = oldAmount[denom] - delta;
        return newAmount;
    }
    else {
        newDelta = getDelta(delta, denom);
        const myValue = cpValue[denom].value;
        delta = delta * myValue;
    }
    if (totalMoney(oldAmount) >= delta) {
        for (let [key, value] of Object.entries(newDelta)) {
            if (newAmount[key] >= value) {
                newAmount[key] -= value;
            }
            else if (scaleDown(newAmount, key)) {
                newAmount[key] -= value;
            }
            else {
                newAmount = oldAmount;
                while (newAmount[key] <= value && totalMoney(newAmount) > 0 && key !== "cp") {
                    down = cpValue[key].down;
                    value -= newAmount[key];
                    newAmount[key] = 0;
                    const myValue = cpValue[key].value;
                    const myDown = cpValue[down].value;
                    value *= ~~(myValue / myDown);
                    key = down;
                }
                newAmount[key] -= value;
            }
        }
        return newAmount;
    }
    else {
        return false;
    }
}
function updateMoney(oldAmount, delta, denom) {
    let newAmount = {};
    newAmount[denom] = delta;
    return newAmount;
}
function totalMoney(money) {
    const cpValue = getCpValue();
    let total = 0;
    for (let key in cpValue) {
        const myValue = cpValue[key].value;
        total += money[key] * myValue;
    }
    return total;
}
function flash(input) {
    input.style.backgroundColor = "rgba(255,0,0,0.5)";
    setTimeout(() => {
        input.style.backgroundColor = "";
    }, 150);
}
export function applyLazyMoney(app, html, actorData) {
    if (!game.settings.get('tidy5e-sheet', "lazyMoneyEnable")) {
        return;
    }
    // The module already do the job so for avoid redundance...
    if (game.modules.get('lazymoney')?.active) {
      return;
    }

    for (const elem of html.find("input[name^='system.currency']")) {
        elem.type = "text";
        elem.classList.add("lazymoney");
    }
    html.find("input[name^='system.currency']").off("change");
    html.find("input[name^='system.currency']").change({
        app: app,
        data: actorData,
    }, _onChangeCurrency);

}
function is_real_number(inNumber) {
    return !isNaN(inNumber) && typeof inNumber === "number" && isFinite(inNumber);
}
function is_lazy_number(inNumber) {
    const isSign = String(inNumber).startsWith(signCase.add) ||
        String(inNumber).startsWith(signCase.subtract) ||
        String(inNumber).startsWith(signCase.equals) ||
        String(inNumber).startsWith(signCase.default);
    if (isSign) {
        const withoutFirst = String(inNumber).slice(1);
        return is_real_number(withoutFirst);
    }
    else {
        return true;
    }
}
Hooks.on("preUpdateActor", function (actorEntity, update, options, userId) {
    if (!game.settings.get('tidy5e-sheet', "lazyMoneyEnable")) {
        return;
    }
    // The module already do the job so for avoid redundance...
    if (game.modules.get('lazymoney')?.active) {
      return;
    }
    if (!actorEntity) {
        return;
    }
    const currency = getProperty(update, "system.currency");
    const isCurrencyUndefined = currency == undefined || currency == null;
    if (isCurrencyUndefined) {
        setProperty(update, "system.currency", {
            pp: 0,
            gp: 0,
            ep: 0,
            sp: 0,
            cp: 0,
        });
    }
    if (hasProperty(update, "system.currency")) {
        if (isCurrencyUndefined) {
            setProperty(update, "system.currency", {
                pp: 0,
                gp: 0,
                ep: 0,
                sp: 0,
                cp: 0,
            });
        }
        else {
            if (hasProperty(update, "system.currency.pp")) {
                let ppValue = getProperty(update, "system.currency.pp") || 0;
                if (!is_lazy_number(ppValue)) {
                    setProperty(update, "system.currency.pp", Number(ppValue));
                }
                // Module compatibility with https://foundryvtt.com/packages/link-item-resource-5e
                else if (String(ppValue).startsWith("0")) {
                    while (String(ppValue).startsWith("0")) {
                        ppValue = String(ppValue).slice(1);
                    }
                    setProperty(update, "system.currency.pp", Number(ppValue));
                }
            }
            if (hasProperty(update, "system.currency.gp")) {
                let gpValue = getProperty(update, "system.currency.gp") || 0;
                if (!is_lazy_number(gpValue)) {
                    setProperty(update, "system.currency.gp", Number(gpValue));
                }
                // Module compatibility with https://foundryvtt.com/packages/link-item-resource-5e
                else if (String(gpValue).startsWith("0")) {
                    while (String(gpValue).startsWith("0")) {
                        gpValue = String(gpValue).slice(1);
                    }
                    setProperty(update, "system.currency.gp", Number(gpValue));
                }
            }
            if (hasProperty(update, "system.currency.ep")) {
                let epValue = getProperty(update, "system.currency.ep") || 0;
                if (!is_lazy_number(epValue)) {
                    setProperty(update, "system.currency.ep", Number(epValue));
                }
                // Module compatibility with https://foundryvtt.com/packages/link-item-resource-5e
                else if (String(epValue).startsWith("0")) {
                    while (String(epValue).startsWith("0")) {
                        epValue = String(epValue).slice(1);
                    }
                    setProperty(update, "system.currency.ep", Number(epValue));
                }
            }
            if (hasProperty(update, "system.currency.sp")) {
                let spValue = getProperty(update, "system.currency.sp") || 0;
                if (!is_lazy_number(spValue)) {
                    setProperty(update, "system.currency.sp", Number(spValue));
                }
                // Module compatibility with https://foundryvtt.com/packages/link-item-resource-5e
                else if (String(spValue).startsWith("0")) {
                    while (String(spValue).startsWith("0")) {
                        spValue = String(spValue).slice(1);
                    }
                    setProperty(update, "system.currency.sp", Number(spValue));
                }
            }
            if (hasProperty(update, "system.currency.cp")) {
                let cpValue = getProperty(update, "system.currency.cp") || 0;
                if (!is_lazy_number(cpValue)) {
                    setProperty(update, "system.currency.cp", Number(cpValue));
                }
                // Module compatibility with https://foundryvtt.com/packages/link-item-resource-5e
                else if (String(cpValue).startsWith("0")) {
                    while (String(cpValue).startsWith("0")) {
                        cpValue = String(cpValue).slice(1);
                    }
                    setProperty(update, "system.currency.cp", Number(cpValue));
                }
            }
        }
    }
    // console.log('actor updated!')
});
