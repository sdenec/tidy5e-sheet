export const tidy5eContextMenu = function (html, sheet) {
  if ( sheet.actor.isOwner ) {
    // Override COntext Menu
    // Item Context Menu
    // new ContextMenu(html, ".item-list .item .context-menu", [], {onOpen: sheet._onItemContext.bind(sheet)});

    Hooks.on("dnd5e.getActiveEffectContextOptions", (effect, contextOptions) => {
      // TODO
    });

    Hooks.on("dnd5e.getItemContextOptions", (item, contextOptions) => {
      tidy5eContextMenuOptions(item, contextOptions);
    });

    Hooks.on("dnd5e.getItemAdvancementContext", (html, contextOptions) => {
      // TODO
    });
  }
}

/**
 * Get the set of ContextMenu options which should be applied for advancement entries.
 * @returns {ContextMenuEntry[]}  Context menu entries.
 * @protected
 */
export const tidy5eContextMenuOptions = function(item, contextOptions) {
  if(!game.settings.get("tidy5e-sheet", "rightClickDisabled")){
    return;
  }
  contextOptions.push(
    {
      name: item.system.attunement === 2 
        ? "TIDY5E.Deattune"
        : "TIDY5E.Attune",
      icon: "<i class='fas fa-sun'></i>",
      condition: (li) => {
        return item.attunement;
      },
      callback: (li) => {
        if(item.system.attunement === 2) {
          li.classList.add("active");
        }
        const element = li[0];
      }
    }
  );

    // {
    //   name: "DND5E.AdvancementControlDuplicate",
    //   icon: "<i class='fas fa-copy fa-fw'></i>",
    //   condition: li => {
    //     const id = li[0].closest(".advancement-item")?.dataset.id;
    //     const advancement = this.item.advancement.byId[id];
    //     return condition(li) && advancement?.constructor.availableForItem(this.item);
    //   },
    //   callback: li => this._onAdvancementAction(li[0], "duplicate")
    // },
    // {
    //   name: "DND5E.AdvancementControlDelete",
    //   icon: "<i class='fas fa-trash fa-fw' style='color: rgb(255, 65, 65);'></i>",
    //   condition,
    //   callback: li => this._onAdvancementAction(li[0], "delete")
    // }
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
          html.find('.item .context-menu').hide();
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
          html.find('.item .context-menu').hide();
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
    contextWidth = $(item).find('.context-menu').width(),
    contextHeight = $(item).find('.context-menu').height(),
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
      .find('.context-menu')
      .css({'top': contextTop+'px', 'left': contextLeft+'px'})
      .fadeIn(300);
  }

  //close context menu on any click outside
  $(html).mousedown( async (event) => {
    switch (event.which) {
      case 1:
      if ( ! $(event.target).closest('.item .context-menu').length && ! $(event.target).closest('.item .activate-context-menu').length ) {
        html.find('.item').removeClass('context');
        html.find('.item .context-menu').hide();
      }
        break;
    }
  });
}