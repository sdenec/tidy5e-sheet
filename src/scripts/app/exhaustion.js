  function convertEffectSet(actorEntity) {
    let result = {}
    actorEntity.effects.forEach(effect => {
      result[effect.data._id] = effect.data;
    })
    return result;
  }


async function updateExhaustion(actorEntity, updatedEffect, mode) {
  if(game.settings.get('tidy5e-sheet', 'exhaustionEffects')){
    
    if (game.actors.get(actorEntity.data._id).data.type !== "character") {
      return;
    }
    
    let exhLvl = actorEntity._data.data.attributes.exhaustion,
    effectName = `${game.i18n.localize("DND5E.ConExhaustion")} ${game.i18n.localize("DND5E.AbbreviationLevel")} ${exhLvl}`;
    
	  const effectSet = convertEffectSet(actorEntity);

    if (updatedEffect) {
      // On update operations, the actorEntity's effects have not been updated.
      // Override the entry for this effect using the updatedActiveEffect data.
      if (mode == "add") {
        effectSet[updatedEffect._id] = updatedEffect;
      } else if (mode == "delete") {
        delete effectSet[updatedEffect._id];
      }
    }

    let effectEntityPresent = null;
    
    for (const effectEntity of actorEntity.effects) {
      if (typeof effectEntity.getFlag('tidy5e-sheet', 'exhaustion') === 'number') {
        if (!effectEntityPresent) {
          effectEntityPresent = effectEntity;
        } else {
          
          console.log('Entity present');
          // Cannot have more than one effect tier present at any one time
          await effectEntity.delete();
        }
      }
    }

    let exhaustionSet = [];
    let movementSet = ['walk', 'swim', 'fly', 'climb', 'burrow'];
    if(exhLvl != 0){
      if(exhLvl > 0 ){
        let effect =  {
          key: "flags.midi-qol.disadvantage.ability.check.all",
          value: true,
          mode: ACTIVE_EFFECT_MODES.OVERRIDE,
          priority: 1000
        };
        exhaustionSet.push(effect);
      }
      if(exhLvl > 1 && exhLvl < 5 ){
        if (actorEntity._data?.data?.attributes?.movement) {
          movementSet = [];
          Object.entries(actorEntity._data?.data?.attributes?.movement).forEach(speed => {
            if (speed[0] == "hover" || speed[0] == "units") {
              return;
            }
            if (speed[1] > 0) {
              movementSet.push(speed[0]);
            }
          });
        }
        movementSet.forEach( el => {
          const changeKey = "data.attributes.movement." + el;
          let effect = {
            key: changeKey,
            value: 0.5,
            mode: 1,
            priority: 1000
          };
          exhaustionSet.push(effect);
        });
      }
      if(exhLvl > 2 ){
        let effect =  {
          key: "flags.midi-qol.disadvantage.ability.save.all",
          value: true,
          mode: ACTIVE_EFFECT_MODES.OVERRIDE,
          priority: 1000
        };
        exhaustionSet.push(effect);   

        effect = {
          key: "flags.midi-qol.disadvantage.attack.all",
          value: true,
          mode: ACTIVE_EFFECT_MODES.OVERRIDE,
          priority: 1000
        };
        exhaustionSet.push(effect);   
      }
      if(exhLvl > 3 ){
        let effect =  {
          key: "data.attributes.hp.max",
          value: 0.5,
          mode: 1,
          priority: 1000
        };
        exhaustionSet.push(effect);
      }
      if(exhLvl > 4 ){
        if (actorEntity._data?.data?.attributes?.movement) {
          movementSet = [];
          Object.entries(actorEntity._data?.data?.attributes?.movement).forEach(speed => {
            if (speed[0] == "hover" || speed[0] == "units") {
              return;
            }
            if (speed[1] > 0) {
              movementSet.push(speed[0]);
            }
          });
        }
        movementSet.forEach( el => {
          const changeKey = "data.attributes.movement." + el;
          let effect = {
            key: changeKey,
            value: 0,
            mode: 1,
            priority: 1000
          };
          exhaustionSet.push(effect);
        });    
      }
      if(exhLvl > 5 ){
        let effect =  {
          key: "data.attributes.hp.value",
          value: 0,
          mode: ACTIVE_EFFECT_MODES.OVERRIDE,
          priority: 1000
        };
        exhaustionSet.push(effect);      
      }
    }

    let effectChange = {
      disabled: exhLvl === 0,
      label: effectName,
      icon: "./modules/tidy5e-sheet/images/exhaustion.svg",
      changes: exhaustionSet,
      flags: {
        'tidy5e-sheet': {
          exhaustion: exhLvl
        }
      },
      origin: `Actor.${actorEntity.data._id}`
    };

    if (effectChange) {
      if (effectEntityPresent) {
        await effectEntityPresent.update(effectChange);
      } else {
        await actorEntity.createEmbeddedEntity("ActiveEffect", effectChange);
      }
    }

    await actorEntity.applyActiveEffects();  
  }
}

// Hooks

Hooks.on('updateActor', function (actorEntity, _, __, userId) {
  if (game.userId !== userId || actorEntity.constructor.name != "Actor5e") {
    // Only act if we initiated the update ourselves, and the effect is a child of a character
		return;
	}
	updateExhaustion(actorEntity, undefined, "add");
});

Hooks.on('updateActiveEffect', function (actorEntity, changedEffect, _, __, userId) {
	if (game.userId !== userId || actorEntity.constructor.name != "Actor5e") {
		// Only act if we initiated the update ourselves, and the effect is a child of a character
		return;
	}

	if (!changedEffect?.flags.hasOwnProperty("tidy5e-sheet")) {
		updateExhaustion(actorEntity, changedEffect, "add");
	}
});

Hooks.on('createActiveEffect', function (actorEntity, changedEffect, _, userId) {
	if (game.userId !== userId || actorEntity.constructor.name != "Actor5e") {
		// Only act if we initiated the update ourselves, and the effect is a child of a character
		return;
	}

	if (!changedEffect?.flags.hasOwnProperty("tidy5e-sheet")) {
		updateExhaustion(actorEntity, changedEffect, "add");
	}
});

Hooks.on('deleteActiveEffect', function (actorEntity, changedEffect, _, userId) {
	if (game.userId !== userId || actorEntity.constructor.name != "Actor5e") {
		// Only act if we initiated the update ourselves, and the effect is a child of a character
		return;
	}

	if (!changedEffect?.flags.hasOwnProperty("tidy5e-sheet")) {
		updateExhaustion(actorEntity, changedEffect, "delete");
	}
});