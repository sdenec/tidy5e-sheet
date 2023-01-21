export const tidy5eContextMenu = function (html, sheet) {
  if ( sheet.actor.isOwner ) {
    // Override COntext Menu
    // Item Context Menu
    // new ContextMenu(html, ".item-list .item #context-menu", [], {onOpen: sheet._onItemContext.bind(sheet)});

    Hooks.on("dnd5e.getActiveEffectContextOptions", (effect, contextOptions) => {
      if(game.settings.get("tidy5e-sheet", "rightClickDisabled")){
        contextOptions = [];
      } else {
        contextOptions = _getActiveEffectContextOptions(effect);
      }
      ui.context.menuItems = contextOptions;
    });

    Hooks.on("dnd5e.getItemContextOptions", (item, contextOptions) => {
      if(game.settings.get("tidy5e-sheet", "rightClickDisabled")){
        contextOptions = [];
      } else {
        contextOptions = _getItemContextOptions(item);
      }
      ui.context.menuItems = contextOptions;
    });

    Hooks.on("dnd5e.getItemAdvancementContext", (html, contextOptions) => {
      // TODO cannot recover the 'this' reference
      /*
      if(game.settings.get("tidy5e-sheet", "rightClickDisabled")){
        contextOptions = [];
      } else {
        contextOptions = _getAdvancementContextMenuOptions(html);
      }
      ui.context.menuItems = contextOptions;
      */
    });
  }
}

/**
 * Get the set of ContextMenu options which should be applied for advancement entries.
 * @returns {ContextMenuEntry[]}  Context menu entries.
 * @protected
 */
const _getAdvancementContextMenuOptions = function(html) {

  let options = [];
  // const condition = li => (this.advancementConfigurationMode || !this.isEmbedded) && this.isEditable;

  /*
  { 
    name: "DND5E.AdvancementControlEdit",
    icon: "<i class='fas fa-edit fa-fw'></i>",
    condition,
    callback: li => this._onAdvancementAction(li[0], "edit")
  },
  {
    name: "DND5E.AdvancementControlDuplicate",
    icon: "<i class='fas fa-copy fa-fw'></i>",
    condition: li => {
      const id = li[0].closest(".advancement-item")?.dataset.id;
      const advancement = this.item.advancement.byId[id];
      return condition(li) && advancement?.constructor.availableForItem(this.item);
    },
    callback: li => this._onAdvancementAction(li[0], "duplicate")
  },
  {
    name: "DND5E.AdvancementControlDelete",
    icon: "<i class='fas fa-trash fa-fw' style='color: rgb(255, 65, 65);'></i>",
    condition,
    callback: li => this._onAdvancementAction(li[0], "delete")
  }
  */

  options.push(
    {
      name: "DND5E.AdvancementControlEdit",
      icon: "<i class='fas fas fa-pencil-alt fa-fw'></i>",
      condition,
      callback: li => this._onAdvancementAction(li[0], "edit")
    },
    {
      name: "DND5E.AdvancementControlDuplicate",
      icon: "<i class='fas fa-copy fa-fw'></i>",
      condition: li => {
        const id = li[0].closest(".advancement-item")?.dataset.id;
        const advancement = this.item.advancement.byId[id];
        return condition(li) && advancement?.constructor.availableForItem(this.item);
      },
      callback: li => this._onAdvancementAction(li[0], "duplicate")
    },
    {
      name: "DND5E.AdvancementControlDelete",
      icon: "<i class='fas fa-trash fa-fw' style='color: rgb(255, 65, 65);'></i>",
      condition,
      callback: li => this._onAdvancementAction(li[0], "delete")
    }
  );
}

/**
 * Prepare an array of context menu options which are available for owned ActiveEffect documents.
 * @param {ActiveEffect5e} effect         The ActiveEffect for which the context menu is activated
 * @returns {ContextMenuEntry[]}          An array of context menu options offered for the ActiveEffect
 * @protected
 */
const _getActiveEffectContextOptions = function(effect) {
  let options = [];

  /*
  {
    name: "DND5E.ContextMenuActionEdit",
    icon: "<i class='fas fa-edit fa-fw'></i>",
    callback: () => effect.sheet.render(true)
  },
  {
    name: "DND5E.ContextMenuActionDuplicate",
    icon: "<i class='fas fa-copy fa-fw'></i>",
    callback: () => effect.clone({label: game.i18n.format("DOCUMENT.CopyOf", {name: effect.label})}, {save: true})
  },
  {
    name: "DND5E.ContextMenuActionDelete",
    icon: "<i class='fas fa-trash fa-fw'></i>",
    callback: () => effect.deleteDialog()
  },
  {
    name: effect.disabled ? "DND5E.ContextMenuActionEnable" : "DND5E.ContextMenuActionDisable",
    icon: effect.disabled ? "<i class='fas fa-check fa-fw'></i>" : "<i class='fas fa-times fa-fw'></i>",
    callback: () => effect.update({disabled: !effect.disabled})
  }
  */

  options.push(
    {
      name: effect.disabled ? "DND5E.ContextMenuActionEnable" : "DND5E.ContextMenuActionDisable",
      icon: effect.disabled ? "<i class='fas fa-check fa-fw'></i>" : "<i class='fas fa-times fa-fw'></i>",
      callback: () => effect.update({disabled: !effect.disabled})
    },
    {
      name: "DND5E.ContextMenuActionEdit",
      icon: "<i class='fas fas fa-pencil-alt fa-fw'></i>",
      callback: () => effect.sheet.render(true)
    },
    {
      name: "DND5E.ContextMenuActionDuplicate",
      icon: "<i class='fas fa-copy fa-fw'></i>",
      callback: () => effect.clone({label: game.i18n.format("DOCUMENT.CopyOf", {name: effect.label})}, {save: true})
    },
    {
      name: "DND5E.ContextMenuActionDelete",
      icon: "<i class='fas fa-trash fa-fw' style='color: rgba(255, 30, 0, 0.65);'></i>",
      callback: () => effect.deleteDialog()
    }
  );

  return options;
}


/**
 * Prepare an array of context menu options which are available for owned Item documents.
 * @param {Item5e} item                   The Item for which the context menu is activated
 * @returns {ContextMenuEntry[]}          An array of context menu options offered for the Item
 * @protected
 */
const _getItemContextOptions = function(item) {
  const allowCantripToBePreparedOnContext = game.settings.get("tidy5e-sheet", "allowCantripToBePreparedOnContext"); 

  let toggleClass = "";
  let toggleTitle = "";
  let canToggle = false;
  let options = [];
  let isActive = false;
  let canPrepare = false;

  if ( item.type === "spell" ) {
    const prep = item.system.preparation || {};
    const isAlways = prep.mode === "always";
    const isPrepared = !!prep.prepared;
    isActive = isPrepared;
    toggleClass = isPrepared ? "active" : "";
    if ( isAlways ) toggleClass = "fixed";
    if ( isAlways ) toggleTitle = CONFIG.DND5E.spellPreparationModes.always;
    else if ( isPrepared ) toggleTitle = CONFIG.DND5E.spellPreparationModes.prepared;
    else toggleTitle = game.i18n.localize("DND5E.SpellUnprepared");

    canPrepare = item.system.level >= 1;

  }
  else {
    isActive = !!item.system.equipped;
    toggleClass = isActive ? "active" : "";
    toggleTitle = game.i18n.localize(isActive ? "DND5E.Equipped" : "DND5E.Unequipped");
    canToggle = "equipped" in item.system;

    canPrepare = item.system.level >= 1;

  }

  // Toggle Attunement State
  if ( ("attunement" in item.system) && 
    (item.system.attunement !== CONFIG.DND5E.attunementTypes.NONE) ) {
    const isAttuned = item.system.attunement === CONFIG.DND5E.attunementTypes.ATTUNED;
    // options.push({
    //   name: isAttuned ? "DND5E.ContextMenuActionUnattune" : "DND5E.ContextMenuActionAttune",
    //   icon: "<i class='fas fa-sun fa-fw'></i>",
    //   callback: () => item.update({
    //     "system.attunement": CONFIG.DND5E.attunementTypes[isAttuned ? "REQUIRED" : "ATTUNED"]
    //   })
    // });
    options.push({
      name: isAttuned ? "DND5E.ContextMenuActionUnattune" : "DND5E.ContextMenuActionAttune",
      icon: "<i class='fas fa-sun fa-fw'></i>",
      callback: () => item.update({
        "system.attunement": CONFIG.DND5E.attunementTypes[isAttuned ? "REQUIRED" : "ATTUNED"]
      })
    });
  }

  // Toggle Equipped State
  if ( "equipped" in item.system ) {
    // options.push({
    //   name: item.system.equipped ? "DND5E.ContextMenuActionUnequip" : "DND5E.ContextMenuActionEquip",
    //   icon: "<i class='fas fa-shield-alt fa-fw'></i>",
    //   callback: () => item.update({"system.equipped": !item.system.equipped})
    // });
    const isEquipped = item.system.equipped;
    options.push({
      name: isEquipped? "DND5E.ContextMenuActionUnequip" : "DND5E.ContextMenuActionEquip",
      icon:  isEquipped ? "<i class='fas fa-user-alt fa-fw'></i> " : "<i class='fas fa-user-alt fa-fw'></i> ",
      callback: () => item.update({"system.equipped": !isEquipped})
    });
  }

  // Toggle Prepared State
  if ("preparation" in item.system) {
  // if ( ("preparation" in item.system) && 
  //   (item.system.preparation?.mode === "prepared") ) {
    // options.push({
    //   name: item.system?.preparation?.prepared ? "DND5E.ContextMenuActionUnprepare" : "DND5E.ContextMenuActionPrepare",
    //   icon: "<i class='fas fa-sun fa-fw'></i>",
    //   callback: () => item.update({"system.preparation.prepared": !item.system.preparation?.prepared})
    // });

    const isPrepared = item.system?.preparation?.prepared;
    if(allowCantripToBePreparedOnContext) {
      if(item.system.preparation.mode != "always") {
        options.push({
          name:  isActive ? "TIDY5E.Unprepare" : "TIDY5E.Prepare",
          icon: isActive ? "<i class='fas fa-book fa-fw'></i>" : "<i class='fas fa-book fa-fw'></i>", 
          callback: () => item.update({"system.preparation.prepared": !isPrepared})
        });
      }
    } else {
      if(canPrepare && item.system.preparation.mode != "always") {
        options.push({
          name:  isActive ? "TIDY5E.Unprepare" : "TIDY5E.Prepare",
          icon: isActive ? "<i class='fas fa-book fa-fw'></i>" : "<i class='fas fa-book fa-fw'></i>", 
          callback: () => item.update({"system.preparation.prepared": !isPrepared})
        });
      }
    }
  }

  /*
  // Standard Options
  const options = [
    {
      name: "DND5E.ContextMenuActionEdit",
      icon: "<i class='fas fa-edit fa-fw'></i>",
      callback: () => item.sheet.render(true)
    },
    {
      name: "DND5E.ContextMenuActionDuplicate",
      icon: "<i class='fas fa-copy fa-fw'></i>",
      condition: () => !["race", "background", "class", "subclass"].includes(item.type),
      callback: () => item.clone({name: game.i18n.format("DOCUMENT.CopyOf", {name: item.name})}, {save: true})
    },
    {
      name: "DND5E.ContextMenuActionDelete",
      icon: "<i class='fas fa-trash fa-fw'></i>",
      callback: () => item.deleteDialog()
    }
  ]
  */

  if ( item.type === "spell" ) {
    options.push(
      {
        name: "TIDY5E.EditSpell",
        icon: "<i class='fas fa-pencil-alt fa-fw'></i>",
        callback: () => item.sheet.render(true)
      },
      {
        name: "DND5E.ContextMenuActionDuplicate",
        icon: "<i class='fas fa-copy fa-fw'></i>",
        condition: () => !["race", "background", "class", "subclass"].includes(item.type),
        callback: () => item.clone({name: game.i18n.format("DOCUMENT.CopyOf", {name: item.name})}, {save: true})
      },
      {
        name: "TIDY5E.DeleteSpell",
        icon: "<i class='fas fa-trash fa-fw' style='color: rgba(255, 30, 0, 0.65);'></i>",
        callback: () => item.deleteDialog()
      }
    )
  } else {
    options.push(
      {
        name: "DND5E.ContextMenuActionEdit",
        icon: "<i class='fas fa-pencil-alt fa-fw'></i>",
        callback: () => item.sheet.render(true)
      },
      {
        name: "DND5E.ContextMenuActionDuplicate",
        icon: "<i class='fas fa-copy fa-fw'></i>",
        condition: () => !["race", "background", "class", "subclass"].includes(item.type),
        callback: () => item.clone({name: game.i18n.format("DOCUMENT.CopyOf", {name: item.name})}, {save: true})
      },
      {
        name: "DND5E.ContextMenuActionDelete",
        icon: "<i class='fas fa-trash fa-fw' style='color: rgba(255, 30, 0, 0.65);'></i>",
        callback: () => item.deleteDialog()
      }
    );
  }
  return options;

}

export const tidy5eContextMenuOLD = function (html) {
  // open context menu

  html.find('.item-list .item.context-enabled').mousedown( async (event) => {
    let target = event.target.class;
    let item = event.currentTarget;
    switch (event.which) {
      case 2:
        // middle mouse opens item editor
        event.preventDefault();
        if($(item).find('.item-edit')) {
          $(item).find('.item-edit').trigger('click');
        }

        if($(item).find('.effect-edit')) {
          $(item).find('.effect-edit').trigger('click');
        }

        break;
      case 3:
        // right click opens context menu
        item.addEventListener('contextmenu', e => e.preventDefault());
        event.preventDefault();
        if(!game.settings.get("tidy5e-sheet", "rightClickDisabled") && $(item).hasClass('context-enabled')){
          html.find('.item').removeClass('context');
          html.find('.item #context-menu').hide();
          itemContextMenu(event);
        }
        break;
    }
  });

  html.find('.item-list .item .activate-context-menu').mousedown( async (event) => {
    if(game.settings.get("tidy5e-sheet", "rightClickDisabled")){
      switch (event.which) {
        case 1:
          event.preventDefault();
          html.find('.item').removeClass('context');
          html.find('.item #context-menu').hide();
          itemContextMenu(event);
          break;
      }
    }
  });

  // context menu calculations
  async function itemContextMenu(event){
    let item = event.currentTarget;
    
    if($(item).hasClass('activate-context-menu')){
      item = item.parentNode;
    }
    
    let	mouseX = event.clientX,
    mouseY = event.clientY,
    itemTop = $(item).offset().top,
    itemLeft = $(item).offset().left,
    itemHeight = $(item).height(),
    itemWidth = $(item).width(),
    contextTop = mouseY-itemTop+1,
    contextLeft = mouseX-itemLeft+1,
    contextWidth = $(item).find('#context-menu').width(),
    contextHeight = $(item).find('#context-menu').height(),
    contextRightBound = mouseX + contextWidth,
    contextBottomBound = mouseY + contextHeight,
    itemsList = $(item).closest('.items-list'),
    itemsListRightBound = itemsList.offset().left + itemsList.width() - 17,
    itemsListBottomBound = itemsList.offset().top + itemsList.height();			
    
    // check right side bounds
    if(contextRightBound > itemsListRightBound) {
      let rightDiff = itemsListRightBound - contextRightBound;
      contextLeft = contextLeft + rightDiff;
    }
    
    // check bottom bounds
    if(contextBottomBound > itemsListBottomBound) {
      let bottomDiff = itemsListBottomBound - contextBottomBound;
      contextTop = contextTop + bottomDiff;
    }

    $(item)
      .addClass('context')
      .find('#context-menu')
      .css({'top': contextTop+'px', 'left': contextLeft+'px'})
      .fadeIn(300);
  }

  //close context menu on any click outside
  $(html).mousedown( async (event) => {
    switch (event.which) {
      case 1:
      if ( ! $(event.target).closest('.item #context-menu').length && ! $(event.target).closest('.item .activate-context-menu').length ) {
        html.find('.item').removeClass('context');
        html.find('.item #context-menu').hide();
      }
        break;
    }
  });
}