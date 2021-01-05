export const tidy5eContextMenu = function (html) {
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
        event.preventDefault();
        if(!game.settings.get("tidy5e-sheet", "disableRightClick") && $(item).hasClass('context-enabled')){
          $('.item').removeClass('context');
          $('.item .context-menu').hide();
          itemContextMenu(event);
        }
        break;
    }
  });

  html.find('.item-list .item .activate-context-menu').mousedown( async (event) => {
    if(game.settings.get("tidy5e-sheet", "disableRightClick")){
      switch (event.which) {
        case 1:
          event.preventDefault();
          $('.item').removeClass('context');
          $('.item .context-menu').hide();
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

  // close context menu on any click outside
  $(document).mousedown( async (event) => {
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