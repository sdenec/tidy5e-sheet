async function updateExhaustion(actorEntity) {
  
  if (game.actors.get(actorEntity.data._id).data.type !== "character") {
    return;
  }
  
  let exhaustion = actorEntity.data._source.data.attributes.exhaustion;

  if(game.settings.get('tidy5e-sheet', 'exhaustionEffectsEnabled') == 'tidy5e') {
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
          mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
          priority: 20
        };
        exhaustionSet.push(effect);
      }
      if(exhaustion > 1 && exhaustion < 5 ){
        if (actorEntity.data?._source?.data?.attributes?.movement) {
          movementSet = [];
          Object.entries(actorEntity.data?._source?.data?.attributes?.movement).forEach(speed => {
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
            value: "0.5",
            mode: CONST.ACTIVE_EFFECT_MODES.MULTIPLY,
            priority: 20
          };
          exhaustionSet.push(effect);
        });
      }
      if(exhaustion > 2 ){
        let effect =  {
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
      if(exhaustion > 3 ){
        let effect =  {
          key: "data.attributes.hp.max",
          value: "0.5",
          mode: 1,
          priority: 20
        };
        exhaustionSet.push(effect);
      }
      if(exhaustion > 4 ){
        if (actorEntity.data?._source?.data?.attributes?.movement) {
          movementSet = [];
          Object.entries(actorEntity.data?._source?.data?.attributes?.movement).forEach(speed => {
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
            value: "0",
            mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
            priority: 20
          };
          exhaustionSet.push(effect);
        });    
      }
      if(exhaustion > 5 ){
        let effect =  {
          key: "data.attributes.hp.value",
          value: "0",
          mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
          priority: 20
        };
        exhaustionSet.push(effect);      
      }
    }

    for (const effectEntity of actorEntity.effects) {
      if (typeof effectEntity.getFlag('tidy5e-sheet', 'exhaustion') === 'number') {
        exhaustionPresent = effectEntity;
        currentExhaustion = effectEntity.getFlag('tidy5e-sheet', 'exhaustion');
        // console.log(currentExhaustion);
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
        // console.log('create Effect!');
    
        let effectChange = {
          disabled: false,
          label: effectName,
          icon: icon,
          changes: exhaustionSet,
          duration: {'seconds': 31536000},
          flags: {
            'tidy5e-sheet': {
              'exhaustion': exhaustion
            }
          },
          origin: `Actor.${actorEntity.data._id}`
        };
        
        await actorEntity.createEmbeddedDocuments("ActiveEffect", [effectChange]);
        await actorEntity.applyActiveEffects();  
      }
    }
  }

  if(game.settings.get('tidy5e-sheet', 'exhaustionEffectsEnabled') == 'custom'){	
    const levels = game.settings.get('tidy5e-sheet', 'exhaustionEffectCustomTiers');
    const effectName = game.settings.get('tidy5e-sheet', 'exhaustionEffectCustom');

    const id = actorEntity.data._id;
    const tokens = canvas.tokens.placeables;
    const index = tokens.findIndex(x => x.data.actorId === id);
    const token = tokens[index];
    
    for(let i = 1; i<=levels; i++){
      let tier = `${effectName} ${i}`;
      if (game.cub.hasCondition(tier, [token]) && tier != `${effectName} ${exhaustion}`){
        // console.log(tier);
        await game.cub.removeCondition(tier, [token]);
      }
    }

    if(exhaustion != 0){
      let effect = `${effectName} ${exhaustion}`;
      if(index == -1){
        ui.notifications.warn(`${game.i18n.localize("TIDY5E.Settings.CustomExhaustionEffect.warning")}`);
        return;
      }
      game.cub.addCondition(effect, [token])
    }
  }
}

// Hooks Update Actor
Hooks.on('updateActor', function (actorEntity, _, __, userId) {
  if(game.settings.get('tidy5e-sheet', 'exhaustionEffectsEnabled') != 'default') {
    if (game.userId !== userId || actorEntity.constructor.name != "Actor5e") {
      // Only act if we initiated the update ourselves, and the effect is a child of a character
      return;
    }
    updateExhaustion(actorEntity);
  }
  // console.log('actor updated!')
});

// Rest reduces by 1
Hooks.on(`restCompleted`, (actorEntity, data) => { 
  if(game.settings.get('tidy5e-sheet', 'exhaustionEffectsEnabled') == 'default') {
    return
  }
  let actor = game.actors.get(actorEntity.data._id);
  if(data.longRest){
    let exhaustion = actorEntity.data._source.data.attributes.exhaustion;
    if (exhaustion > 0) actor.update({"data.attributes.exhaustion": exhaustion-1});
  }
});

// set exhaustion value to cub effect level
Hooks.on(`createActiveEffect`, (effect, data, id) => { 
  if(game.settings.get('tidy5e-sheet', 'exhaustionEffectsEnabled') == 'custom') {

    let actor = game.actors.get(effect.parent.data._id);
    let effectName = effect.data.label;
    if (effectName.includes(game.settings.get('tidy5e-sheet', 'exhaustionEffectCustom'))) {
      // console.log(effectName);
      let exhaustion = effectName.slice(-1);
      // console.log(exhaustion);
      actor.update({"data.attributes.exhaustion": exhaustion});
    }
  }
});

// reset exhaustion value when cub effect is removed
Hooks.on(`deleteActiveEffect`, (effect, data, id) => { 
  if(game.settings.get('tidy5e-sheet', 'exhaustionEffectsEnabled') == 'custom') {
    const actor = game.actors.get(effect.parent.data._id);
    const effectName = game.settings.get('tidy5e-sheet', 'exhaustionEffectCustom');
    const levels = game.settings.get('tidy5e-sheet', 'exhaustionEffectCustomTiers');
    const effectLabel = effect.data.label;
    if (effectLabel.includes(effectName)) {

    const tokens = canvas.tokens.placeables;
    const index = tokens.findIndex(x => x.data.actorId === effect.parent.data._id);
    const token = tokens[index];

      for(let i = 1; i<=levels; i++){
        let tier = `${effectName} ${i}`;
        if (game.cub.hasCondition(tier, [token])){
          return
        }
      }

      actor.update({"data.attributes.exhaustion": 0});
    }
  }
});
