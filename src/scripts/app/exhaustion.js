async function updateExhaustion(actorEntity) {
  
  if (game.actors.get(actorEntity.data._id).data.type !== "character") {
    return;
  }
  
  let exhaustion = actorEntity._data.data.attributes.exhaustion;
  let icon = game.settings.get('tidy5e-sheet', 'exhaustionEffectIcon');
  let currentExhaustion;
  let exhaustionPresent = null;
  let effectName = `${game.i18n.localize("DND5E.ConExhaustion")} ${game.i18n.localize("DND5E.AbbreviationLevel")} ${exhaustion}`;

  // define exhaustion effects by level
  let exhaustionSet = [];
  let movementSet = ['walk', 'swim', 'fly', 'climb', 'burrow'];
  if(exhaustion != 0){
    if(exhaustion > 0 ){
      let effect =  {
        key: "flags.midi-qol.disadvantage.ability.check.all",
        value: true,
        mode: ACTIVE_EFFECT_MODES.OVERRIDE,
        priority: 20
      };
      exhaustionSet.push(effect);
    }
    if(exhaustion > 1 && exhaustion < 5 ){
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
          priority: 20,
          duration: 0,
          origin: effectName
        };
        exhaustionSet.push(effect);
      });
    }
    if(exhaustion > 2 ){
      let effect =  {
        key: "flags.midi-qol.disadvantage.ability.save.all",
        value: true,
        mode: ACTIVE_EFFECT_MODES.OVERRIDE,
        priority: 20
      };
      exhaustionSet.push(effect);   

      effect = {
        key: "flags.midi-qol.disadvantage.attack.all",
        value: true,
        mode: ACTIVE_EFFECT_MODES.OVERRIDE,
        priority: 20
      };
      exhaustionSet.push(effect);   
    }
    if(exhaustion > 3 ){
      let effect =  {
        key: "data.attributes.hp.max",
        value: 0.5,
        mode: 1,
        priority: 20
      };
      exhaustionSet.push(effect);
    }
    if(exhaustion > 4 ){
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
          priority: 20,
          duration: 0,
          origin: effectName
        };
        exhaustionSet.push(effect);
      });    
    }
    if(exhaustion > 5 ){
      let effect =  {
        key: "data.attributes.hp.value",
        value: 0,
        mode: ACTIVE_EFFECT_MODES.OVERRIDE,
        priority: 20
      };
      exhaustionSet.push(effect);      
    }
  }

  for (const effectEntity of actorEntity.effects) {
    if (typeof effectEntity.getFlag('tidy5e-sheet', 'exhaustion') === 'number') {
      exhaustionPresent = effectEntity;
      currentExhaustion = effectEntity.getFlag('tidy5e-sheet', 'exhaustion');
      console.log(currentExhaustion);
      if (currentExhaustion != exhaustion) {
        await exhaustionPresent.delete();
        createExhaustionEffect();
      }
    }
  }

  if(!exhaustionPresent) {
    createExhaustionEffect();
  }
  
  async function createExhaustionEffect(){
    if (exhaustion > 0){
      console.log('create Effect!');
  
      let effectChange = {
        disabled: false,
        label: effectName,
        icon: icon,
        changes: exhaustionSet,
        flags: {
          'tidy5e-sheet': {
            'exhaustion': exhaustion
          }
        },
        origin: `Actor.${actorEntity.data._id}`
      };
      
      await actorEntity.createEmbeddedEntity("ActiveEffect", effectChange);
      await actorEntity.applyActiveEffects();  
    }
  }
  
}

// Hooks Update Actor

Hooks.on('updateActor', function (actorEntity, _, __, userId) {
  if(game.settings.get('tidy5e-sheet', 'exhaustionEffectsEnabled') == 'tidy5e') {
    if (game.userId !== userId || actorEntity.constructor.name != "Actor5e") {
      // Only act if we initiated the update ourselves, and the effect is a child of a character
      return;
    }
    updateExhaustion(actorEntity);
  }
});