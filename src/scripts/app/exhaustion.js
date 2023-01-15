async function updateExhaustion(actorEntity) {
  
  if (game.actors.get(actorEntity._id).type !== "character") {
    return;
  }
  
  let exhaustion = actorEntity.system.attributes.exhaustion;

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
        if (actorEntity.system?.attributes?.movement) {
          movementSet = [];
          Object.entries(actorEntity.system.attributes.movement).forEach(speed => {
            if (speed[0] == "hover" || speed[0] == "units") {
              return;
            }
            if (speed[1] > 0) {
              movementSet.push(speed[0]);
            }
          });
        }
        movementSet.forEach( el => {
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
          key: "system.attributes.hp.max",
          value: "0.5",
          mode: 1,
          priority: 20
        };
        exhaustionSet.push(effect);
      }
      if(exhaustion > 4 ){
        if (actorEntity.system?.attributes?.movement) {
          movementSet = [];
          Object.entries(actorEntity.system.attributes.movement).forEach(speed => {
            if (speed[0] == "hover" || speed[0] == "units") {
              return;
            }
            if (speed[1] > 0) {
              movementSet.push(speed[0]);
            }
          });
        }
        movementSet.forEach( el => {
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
      if(exhaustion > 5 ){
        let effect =  {
          key: "system.attributes.hp.value",
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
          origin: `Actor.${actorEntity._id}`
        };
        
        await actorEntity.createEmbeddedDocuments("ActiveEffect", [effectChange]);
        await actorEntity.applyActiveEffects();  
      }
    }
  }

  if(game.settings.get('tidy5e-sheet', 'exhaustionEffectsEnabled') == 'dfredce'){	
    if (game.modules.get('dfreds-convenient-effects')?.active) {
      const levels = game.settings.get('tidy5e-sheet', 'exhaustionEffectCustomTiers');
      const effectName = game.settings.get('tidy5e-sheet', 'exhaustionEffectCustom');

      const id = actorEntity._id;
      const tokens = canvas.tokens.placeables;
      const index = tokens.findIndex(x => x.actor._id === id);
      const token = tokens[index];

      const actorToCheck = token && token.actor 
        ? token.actor 
        : actorEntity;

      let effectNameCustom = `${effectName} ${exhaustion}`;

      for(let i = 1; i<=levels; i++){
        let tier = `${effectName} ${i}`;
        if(tier != effectNameCustom) {
          if (game.dfreds.effectInterface.hasEffectApplied(tier,actorToCheck.uuid)){
            // console.log(tier);
            const contextEffect = {
              effectName: tier,
              uuid: actorToCheck.uuid,
              origin: undefined,
            }
            await game.dfreds.effectInterface.removeEffect(contextEffect);
          }
        }
      }

      if(exhaustion != 0){
        let effectToCheck = game.dfreds.effectInterface.findEffectByName(effectNameCustom);
        if (!effectToCheck) {
          //ui.notifications.error(`Effect ${effectNameCustom} is not been found`);
          return;
        }
        if (game.dfreds.effectInterface.hasEffectApplied(effectNameCustom,actorToCheck.uuid)){
          // ui.notifications.error(`Effect ${effectNameCustom} is already applied to the actor ${actorToCheck.name}`);
          return;
        }
        const contextEffect = {
          effectName: effectNameCustom,
          uuid: actorToCheck.uuid,
          origin: undefined,
          overlay: false, 
          metadata: undefined
        }
        await game.dfreds.effectInterface.addEffect(contextEffect);
      }
    }
    else {
      ui.notifications.warn(`${game.i18n.localize("The module 'Dfreds Convenient Effects' is not active, but the module setting 'Auto Exhaustion effects' is enabled")}`);
    }
  }

  if(game.settings.get('tidy5e-sheet', 'exhaustionEffectsEnabled') == 'cub'){	
    if (game.modules.get('combat-utility-belt')?.active) {
      const levels = game.settings.get('tidy5e-sheet', 'exhaustionEffectCustomTiers');
      const effectName = game.settings.get('tidy5e-sheet', 'exhaustionEffectCustom');

      const id = actorEntity._id;
      const tokens = canvas.tokens.placeables;
      const index = tokens.findIndex(x => x.actor._id === id);
      const token = tokens[index];

      let effectNameCustom = `${effectName} ${exhaustion}`;

      for(let i = 1; i<=levels; i++){
        let tier = `${effectName} ${i}`;
        if (tier != effectNameCustom){
          // console.log(tier);
          await game.cub.removeCondition(tier, [token], {warn: false});
        }
      }

      if(exhaustion != 0){
        if(index == -1){
          ui.notifications.warn(`${game.i18n.localize("TIDY5E.Settings.CustomExhaustionEffect.warning")}`);
          return;
        }
        game.cub.addCondition(effectNameCustom, [token], {warn: false})
      }
    }
    else {
      ui.notifications.warn(`${game.i18n.localize("The module 'CUB' is not active, but the module setting 'Auto Exhaustion effects' is enabled")}`);
    }
  }
}

// Hooks Update Actor
Hooks.on('updateActor', function (actorEntity, update, options, userId) {
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
Hooks.on(`dnd5e.restComplete`, (actorEntity, data) => { 
  if(game.settings.get('tidy5e-sheet', 'exhaustionEffectsEnabled') == 'default') {
    return
  }
  let actor = game.actors.get(actorEntity._id);
  if(data.longRest){
    let exhaustion = actorEntity.system.attributes.exhaustion;
    if (exhaustion > 0) actor.update({"system.attributes.exhaustion": exhaustion-1});
  }
});

// set exhaustion value to dfred/cub effect level
Hooks.on(`createActiveEffect`, (effect, data, id) => { 
  if(game.settings.get('tidy5e-sheet', 'exhaustionEffectsEnabled') == 'dfredce' ||
    game.settings.get('tidy5e-sheet', 'exhaustionEffectsEnabled') == 'cub') {

    let actor = game.actors.get(effect.parent._id);
    let effectName = effect.label;
    if (effectName.includes(game.settings.get('tidy5e-sheet', 'exhaustionEffectCustom'))) {
      // console.log(effectName);
      let exhaustion = effectName.slice(-1);
      if(actor.system.attributes.exhaustion != exhaustion) {
        // console.log(exhaustion);
        actor.update({"system.attributes.exhaustion": exhaustion});
      }
    }
  }
});

// reset exhaustion value when dfred/cub effect is removed
Hooks.on(`deleteActiveEffect`, (effect, data, id) => { 
  if(game.settings.get('tidy5e-sheet', 'exhaustionEffectsEnabled') == 'dfredce' ||
    game.settings.get('tidy5e-sheet', 'exhaustionEffectsEnabled') == 'cub') {

    const actor = game.actors.get(effect.parent._id);
    const effectName = game.settings.get('tidy5e-sheet', 'exhaustionEffectCustom');
    const levels = game.settings.get('tidy5e-sheet', 'exhaustionEffectCustomTiers');
    const effectLabel = effect.label;
    if (effectLabel.includes(effectName)) {

      const tokens = canvas.tokens.placeables;
      const index = tokens.findIndex(x => x.actor._id === effect.parent._id);
      const token = tokens[index];

      const actorEffects = (token && token.actor 
        ? token.actor?.effects 
        : actor?.effects) || [];

      for(let i = 1; i<=levels; i++){
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
        if(effectIsFound){
          return;
        }
      }
      if(actor.system.attributes.exhaustion != 0) {
        actor.update({"system.attributes.exhaustion": 0});
      }
    }
  }
});
