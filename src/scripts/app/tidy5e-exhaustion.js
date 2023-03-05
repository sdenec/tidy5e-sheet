import CONSTANTS from "./constants.js";
import { debug, warn } from "./logger-util.js";

export async function updateExhaustion(actorEntity) {
	const actorC = game.actors.get(actorEntity._id);
	if (!actorC) {
		warn(`The actor with id '${actorEntity._id}' must exists for apply a Exhaustion`);
		return;
	}
	if (actorC.type !== "character" && actorC.type !== "npc") {
		warn(`The actor with id '${actorEntity._id}' must be a Character or a NPC for apply a Exhaustion`);
		return;
	}

	let exhaustion = 0;
	if (actorC.type === "character") {
		exhaustion = actorEntity.system.attributes.exhaustion ?? 0;
	} else if (actorC.type === "npc") {
		exhaustion = actorEntity.flags[CONSTANTS.MODULE_ID]?.exhaustion ?? 0;
	}

	if (game.settings.get(CONSTANTS.MODULE_ID, "exhaustionEffectsEnabled") == "tidy5e") {
		let icon = game.settings.get(CONSTANTS.MODULE_ID, "exhaustionEffectIcon");
		let currentExhaustion;
		let exhaustionPresent = null;
		let effectName = `${game.i18n.localize("DND5E.ConExhaustion")} ${game.i18n.localize(
			"DND5E.AbbreviationLevel"
		)} ${exhaustion}`;

		// define exhaustion effects by level
		let exhaustionSet = [];
		let movementSet = ["walk", "swim", "fly", "climb", "burrow"];
		if (exhaustion != 0) {
			if (exhaustion > 0) {
				let effect = {
					key: "flags.midi-qol.disadvantage.ability.check.all",
					value: true,
					mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
					priority: 20
				};
				exhaustionSet.push(effect);
			}
			if (exhaustion > 1 && exhaustion < 5) {
				if (actorEntity.system?.attributes?.movement) {
					movementSet = [];
					Object.entries(actorEntity.system.attributes.movement).forEach((speed) => {
						if (speed[0] == "hover" || speed[0] == "units") {
							return;
						}
						if (speed[1] > 0) {
							movementSet.push(speed[0]);
						}
					});
				}
				movementSet.forEach((el) => {
					const changeKey = "system.attributes.movement." + el;
					let effect = {
						key: changeKey,
						value: "0.5",
						mode: CONST.ACTIVE_EFFECT_MODES.MULTIPLY,
						priority: 20
					};
					exhaustionSet.push(effect);
				});
			}
			if (exhaustion > 2) {
				let effect = {
					key: "flags.midi-qol.disadvantage.ability.save.all",
					value: true,
					mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
					priority: 20
				};
				exhaustionSet.push(effect);

				effect = {
					key: "flags.midi-qol.disadvantage.attack.all",
					value: true,
					mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
					priority: 20
				};
				exhaustionSet.push(effect);
			}
			if (exhaustion > 3) {
				let effect = {
					key: "system.attributes.hp.max",
					value: "0.5",
					mode: 1,
					priority: 20
				};
				exhaustionSet.push(effect);
			}
			if (exhaustion > 4) {
				if (actorEntity.system?.attributes?.movement) {
					movementSet = [];
					Object.entries(actorEntity.system.attributes.movement).forEach((speed) => {
						if (speed[0] == "hover" || speed[0] == "units") {
							return;
						}
						if (speed[1] > 0) {
							movementSet.push(speed[0]);
						}
					});
				}
				movementSet.forEach((el) => {
					const changeKey = "system.attributes.movement." + el;
					let effect = {
						key: changeKey,
						value: "0",
						mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
						priority: 20
					};
					exhaustionSet.push(effect);
				});
			}
			if (exhaustion > 5) {
				let effect = {
					key: "system.attributes.hp.value",
					value: "0",
					mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
					priority: 20
				};
				exhaustionSet.push(effect);
			}
		}

		for (const effectEntity of actorEntity.effects) {
			if (typeof effectEntity.getFlag(CONSTANTS.MODULE_ID, "exhaustion") === "number") {
				exhaustionPresent = effectEntity;
				currentExhaustion = effectEntity.getFlag(CONSTANTS.MODULE_ID, "exhaustion");
				debug(`tidy5e-exhaustion | updateExhaustion | currentExhaustion: ${currentExhaustion}`);
				if (currentExhaustion != exhaustion) {
					await exhaustionPresent.delete();
					createExhaustionEffect();
				}
			}
		}

		if (!exhaustionPresent) {
			createExhaustionEffect();
		}

		async function createExhaustionEffect() {
			if (exhaustion > 0) {
				debug(`tidy5e-exhaustion | createExhaustionEffect | create Effect exhaustion lv: ${exhaustion}`);
				let effectChange = {
					disabled: false,
					label: effectName,
					icon: icon,
					changes: exhaustionSet,
					duration: { seconds: 31536000 },
					flags: {
						[CONSTANTS.MODULE_ID]: {
							exhaustion: exhaustion
						}
					},
					origin: `Actor.${actorEntity._id}`
				};

				await actorEntity.createEmbeddedDocuments("ActiveEffect", [effectChange]);
				await actorEntity.applyActiveEffects();
			}
		}
	}

	if (game.settings.get(CONSTANTS.MODULE_ID, "exhaustionEffectsEnabled") == "dfredce") {
		if (game.modules.get("dfreds-convenient-effects")?.active) {
			const levels = game.settings.get(CONSTANTS.MODULE_ID, "exhaustionEffectCustomTiers");
			const effectName = game.settings.get(CONSTANTS.MODULE_ID, "exhaustionEffectCustom");

			const id = actorEntity._id;
			const tokens = canvas.tokens.placeables;
			const index = tokens.findIndex((x) => x.actor._id === id);
			const token = tokens[index];

			const actorToCheck = token && token.actor ? token.actor : actorEntity;

			let effectNameCustom = `${effectName} ${exhaustion}`;

			for (let i = 1; i <= levels; i++) {
				let tier = `${effectName} ${i}`;
				if (tier != effectNameCustom) {
					if (game.dfreds.effectInterface.hasEffectApplied(tier, actorToCheck.uuid)) {
						debug(`tidy5e-exhaustion | createExhaustionEffect | tier: ${tier}`);
						const contextEffect = {
							effectName: tier,
							uuid: actorToCheck.uuid,
							origin: undefined
						};
						await game.dfreds.effectInterface.removeEffect(contextEffect);
					}
				}
			}

			if (exhaustion != 0) {
				let effectToCheck = game.dfreds.effectInterface.findEffectByName(effectNameCustom);
				if (!effectToCheck) {
					//ui.notifications.error(`Effect ${effectNameCustom} is not been found`);
					return;
				}
				if (game.dfreds.effectInterface.hasEffectApplied(effectNameCustom, actorToCheck.uuid)) {
					// ui.notifications.error(`Effect ${effectNameCustom} is already applied to the actor ${actorToCheck.name}`);
					return;
				}
				const contextEffect = {
					effectName: effectNameCustom,
					uuid: actorToCheck.uuid,
					origin: undefined,
					overlay: false,
					metadata: undefined
				};
				await game.dfreds.effectInterface.addEffect(contextEffect);
			}
		} else {
			warn(
				`${game.i18n.localize(
					"The module 'Dfreds Convenient Effects' is not active, but the module setting 'Auto Exhaustion effects' is enabled"
				)}`,
				true
			);
		}
	}

	if (game.settings.get(CONSTANTS.MODULE_ID, "exhaustionEffectsEnabled") == "cub") {
		if (game.modules.get("combat-utility-belt")?.active) {
			const levels = game.settings.get(CONSTANTS.MODULE_ID, "exhaustionEffectCustomTiers");
			const effectName = game.settings.get(CONSTANTS.MODULE_ID, "exhaustionEffectCustom");

			const id = actorEntity._id;
			const tokens = canvas.tokens.placeables;
			const index = tokens.findIndex((x) => x.actor._id === id);
			const token = tokens[index];

			let effectNameCustom = `${effectName} ${exhaustion}`;

			for (let i = 1; i <= levels; i++) {
				let tier = `${effectName} ${i}`;
				if (tier != effectNameCustom) {
					debug(`tidy5e-exhaustion | createExhaustionEffect | tier: ${tier}`);
					await game.cub.removeCondition(tier, [token], { warn: false });
				}
			}

			if (exhaustion != 0) {
				if (index == -1) {
					ui.notifications.warn(`${game.i18n.localize("TIDY5E.Settings.CustomExhaustionEffect.warning")}`);
					return;
				}
				game.cub.addCondition(effectNameCustom, [token], { warn: false });
			}
		} else {
			warn(
				`${game.i18n.localize(
					"The module 'CUB' is not active, but the module setting 'Auto Exhaustion effects' is enabled"
				)}`,
				true
			);
		}
	}
}

// Hooks Update Actor
// Hooks.on("updateActor", function (actorEntity, update, options, userId) {
// 	if (game.settings.get(CONSTANTS.MODULE_ID, "exhaustionEffectsEnabled") != "default") {
// 		if (game.userId !== userId || actorEntity.constructor.name != "Actor5e") {
// 			// Only act if we initiated the update ourselves, and the effect is a child of a character
// 			return;
// 		}
// 		updateExhaustion(actorEntity);
// 	}
// });

// Rest reduces by 1
Hooks.on(`dnd5e.restComplete`, (actorEntity, data) => {
	if (game.settings.get(CONSTANTS.MODULE_ID, "exhaustionEffectsEnabled") == "default") {
		return;
	}
	let actor = game.actors.get(actorEntity._id);
	if (data.longRest) {
		if (actor.type === "character") {
			let exhaustion = actorEntity.system.attributes.exhaustion;
			if (exhaustion > 0) {
				actor.update({ "system.attributes.exhaustion": exhaustion - 1 });
			}
		} else if (actor.type === "npc") {
			let exhaustion = actorEntity.flags[CONSTANTS.MODULE_ID].exhaustion;
			if (exhaustion > 0) {
				actor.update({ "flags.tidy5e-sheet.exhaustion": exhaustion - 1 });
			}
		} else {
			warn(`Long rest is not supported for actor ype '${actor.type}'`);
		}
	}
});

// set exhaustion value to dfred/cub effect level
Hooks.on(`createActiveEffect`, (effect, data, id) => {
	if (
		game.settings.get(CONSTANTS.MODULE_ID, "exhaustionEffectsEnabled") == "dfredce" ||
		game.settings.get(CONSTANTS.MODULE_ID, "exhaustionEffectsEnabled") == "cub"
	) {
		let actor = game.actors.get(effect.parent._id);
		let effectName = effect.label;
		if (effectName.includes(game.settings.get(CONSTANTS.MODULE_ID, "exhaustionEffectCustom"))) {
			debug("tidy5e-exhaustion | createActiveEffect | effectName = " + effectName);
			if (actor.type === "character") {
				let exhaustion = effectName.slice(-1);
				if (actor.system.attributes.exhaustion != exhaustion) {
					debug("tidy5e-exhaustion | createActiveEffect | exhaustion = " + exhaustion);
					actor.update({ "system.attributes.exhaustion": exhaustion });
				}
			} else if (actor.type === "npc") {
				let exhaustion = effectName.slice(-1);
				if (actor.flags[CONSTANTS.MODULE_ID].exhaustion != exhaustion) {
					debug("tidy5e-exhaustion | createActiveEffect | exhaustion = " + exhaustion);
					actor.update({ "flags.tidy5e-sheet.exhaustion": exhaustion });
				}
			} else {
				warn(`createActiveEffect is not supported for actor ype '${actor.type}'`);
			}
		}
	}
});

// reset exhaustion value when dfred/cub effect is removed
Hooks.on(`deleteActiveEffect`, (effect, data, id) => {
	if (
		game.settings.get(CONSTANTS.MODULE_ID, "exhaustionEffectsEnabled") == "dfredce" ||
		game.settings.get(CONSTANTS.MODULE_ID, "exhaustionEffectsEnabled") == "cub"
	) {
		const actor = game.actors.get(effect.parent._id);
		const effectName = game.settings.get(CONSTANTS.MODULE_ID, "exhaustionEffectCustom");
		const levels = game.settings.get(CONSTANTS.MODULE_ID, "exhaustionEffectCustomTiers");
		const effectLabel = effect.label;
		if (effectLabel.includes(effectName)) {
			const tokens = canvas.tokens.placeables;
			const index = tokens.findIndex((x) => x.actor._id === effect.parent._id);
			const token = tokens[index];

			const actorEffects = (token && token.actor ? token.actor?.effects : actor?.effects) || [];

			for (let i = 1; i <= levels; i++) {
				let tier = `${effectName} ${i}`;
				let effectIsFound = true;
				for (const effectEntity of actorEffects) {
					const effectNameToCheck = effectEntity.label;
					if (!effectNameToCheck) {
						continue;
					}
					if (effectNameToCheck == tier) {
						effectIsFound = true;
						break;
					}
				}
				if (effectIsFound) {
					return;
				}
			}
			if (actor.type === "character") {
				if (actor.system.attributes.exhaustion != 0) {
					actor.update({ "system.attributes.exhaustion": 0 });
				}
			} else if (actor.type === "npc") {
				if (actor.flags.tidy5e - sheet.exhaustion != 0) {
					actor.update({ "flags.tidy5e-sheet.exhaustion": 0 });
				}
			} else {
				warn(`deleteActiveEffect is not supported for actor ype '${actor.type}'`);
			}
		}
	}
});
