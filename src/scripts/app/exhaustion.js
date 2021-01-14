export const activeEffectsExhaustion = function (actorObject, data) {
  if(game.settings.get('tidy5e-sheet', 'exhaustionEffects')){
    let tactor = game.actors.entities.find(a => a.data._id === actorObject.data._id);
    let eLvl = tactor.data.data.attributes.exhaustion,
        effectName = `${game.i18n.localize("DND5E.ConExhaustion")}: ${game.i18n.localize("DND5E.AbbreviationLevel")} ${eLvl}`,
        changeMode = ACTIVE_EFFECT_MODES.OVERRIDE;

    let effectTiersPresent = 0;
    let effectTierChanged = false;
    tactor.effects.forEach(effectEntity => {
      console.log(effectEntity);
      if (effectEntity.data?.flags?.tidy5e) {
        effectTiersPresent++;
        if (effectEntity.data?.flags?.tidy5e?.exhaustionTier != eLvl) {
          console.log("DELETING");
          effectEntity.delete();
          effectTiersPresent--;
          effectTierChanged = true;
        }
      }
    });
    
    if (effectTierChanged || effectTiersPresent == 0) {
      if (eLvl != 0) {
        let effectsList = [];

        if(eLvl > 0 ){
          let effect =  {
                          key: "flags.midi-qol.disadvantage.ability.check.all",
                          value: true,
                          mode: changeMode,
                          priority: 1000
                        };
          effectsList.push(effect);
        }
        if(eLvl > 1 ){
          let effect =  {
                          key: "data.attributes.movement.walk",
                          value: 0.5,
                          mode: 1,
                          priority: 1000
                        };
          effectsList.push(effect);
        }
        if(eLvl > 2 ){
          let effect =  {
                          key: "flags.midi-qol.disadvantage.ability.save.all",
                          value: true,
                          mode: changeMode,
                          priority: 1000
                        };
          effectsList.push(effect);   

          effect = {
                    key: "flags.midi-qol.disadvantage.attack.all",
                    value: true,
                    mode: changeMode,
                    priority: 1000
                  };
          effectsList.push(effect);   
        }
        if(eLvl > 3 ){
          let effect =  {
                          key: "data.attributes.hp.max",
                          value: 0.5,
                          mode: 1,
                          priority: 1000
                        };
          effectsList.push(effect);
        }
        if(eLvl > 4 ){
          let effect =  {
                          key: "data.attributes.movement.walk",
                          value: 0,
                          mode: 1,
                          priority: 1000
                        };
          effectsList.push(effect);      
        }
        if(eLvl > 5 ){
          let effect =  {
                          key: "data.attributes.hp.value",
                          value: 0,
                          mode: changeMode,
                          priority: 1000
                        };
          effectsList.push(effect);      
        }

        // create effect
        let effect = {
          label: effectName,
          icon: "icons/svg/downgrade.svg",
          changes: effectsList,
          flags: {
            tidy5e: {
              exhaustionTier: eLvl
            }
          },
          origin: `Actor.${tactor.data._id}`
        };

        // apply effect
        tactor.createEmbeddedEntity("ActiveEffect", effect);
      }
    }
  }

}