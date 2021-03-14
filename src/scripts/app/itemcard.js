export const tidy5eItemCard = function (html, actor) {
// show/hide grid layout item info card on mouse enter/leave

  let allItems = game.settings.get("tidy5e-sheet", "allItemCards");

  let containerTrigger =  allItems ? html.find('.inventory-list:not(.character-actions-dnd5e)') : html.find('.grid-layout .inventory-list');
  let cardTrigger = allItems ? html.find('.inventory-list:not(.character-actions-dnd5e) .item-list .item') : html.find('.grid-layout .item-list .item');

  let infoContainer = html.find('#item-info-container'),
      infoContainerContent = html.find('#item-info-container-content');

  let timer;
  let delay = game.settings.get('tidy5e-sheet', 'itemCardsDelay');
  if(!delay || delay == 0) delay = false;

  let onItem = false;
  let fixCard = false;
  let fixCardKey =  game.settings.get('tidy5e-sheet', 'fixCardKey') || "x";

  let floatingCard = game.settings.get('tidy5e-sheet', 'floatingItemCards');

  let sheet, sheetWidth, sheetHeight, sheetBorderRight, sheetBorderBottom;

  if(floatingCard) {
    infoContainer.addClass('floating');

    setTimeout(function(){ 
      getBounds();
    }, 500);
   
    containerTrigger.each( function(i, el) {
      el.addEventListener('mousemove', setCardPosition);
    });
  }


  function getBounds(){
    sheet = $('.tidy5e.sheet.actor');
    if(sheet.length < 1) {
      // PoPOut "hack"
      sheet = $(html);
      sheetWidth = $(sheet[0]).width();
      sheetHeight = $(sheet[0]).height();
      sheetBorderRight = sheetWidth;
      sheetBorderBottom = sheetHeight;
    } else {
      sheetWidth = sheet.width();
      sheetHeight = sheet.height();
      sheetBorderRight = sheet.offset().left + sheetWidth;
      sheetBorderBottom = sheet.offset().top + sheetHeight;
    }
  }


  function setCardPosition(ev) {
    if(!fixCard && onItem) {
      let card = html.find('#item-info-container.floating');
      if (card.length == 0) return;
      let mousePos = { x: ev.clientX, y: ev.clientY };
      // card height = 460px -> 1/2 = 230px
      let topPos = `${mousePos.y - 230}px`;
      let leftPos = `${mousePos.x + 24}px`;

      // wenn maus weniger als 280px zum rechten sheet-rand card auf linker seite
      // wenn maus weniger als card/2 nach unten/oben card in gegenrichtung verschieben.
      if(mousePos.x + 304 > sheetBorderRight) {
        leftPos = `${mousePos.x - 304}px`;
      }

      if(mousePos.y + 230 > sheetBorderBottom){
        let diff = sheetBorderBottom - (mousePos.y + 230);
        topPos = `${mousePos.y - 230 + diff}px`;
      }

      card.css({
        'top' : topPos,
        'left': leftPos
      });
    }
  }

  $(document).on('keydown', function (e) {
    if (e.key === fixCardKey) {
      fixCard = true;
    }
  });

  $(document).on('keyup', function (e) {
    if (e.key === fixCardKey) {
      fixCard = false;
      if(!delay) removeCard();
      infoContainer.removeClass('open');
    }
  });

  let delayCard = (event) => {
    // console.log(`delaying card: ${delay} ms`);
    timer = setTimeout(function(){ 
      if(!fixCard) {
        removeCard();
        showCard(event);
        infoContainer.addClass('open'); 
      }
    }, delay);
  };

  let resetDelay = () => {
    clearTimeout(timer);
    if(!fixCard) infoContainer.removeClass('open');
  };

  containerTrigger.mouseenter( function(event){
    if(!fixCard){
      if(!delay) infoContainer.addClass('open');
    }
  });

  containerTrigger.mouseleave( function (event) {
    if(!fixCard){
      if(!delay) hideContainer();
    }
  });

  cardTrigger.mouseenter(async (event) => {
    onItem = true;
    if(!fixCard){
      if(delay) delayCard(event);
      else showCard(event);
    }
  });

  cardTrigger.mouseleave( function (event) {
    onItem = false;
    if(!fixCard){
      if(!delay) removeCard();
      else resetDelay();
    }
  });
  
  let item = html.find('.item');
  item.each(function(){
    this.addEventListener('mousedown', function(event) {
      // removeCard();
      switch (event.which) {
      case 3:
        // right click opens context menu
        event.preventDefault();
          onItem = false;
          hideContainer();
        break;
      }
    });

    this.addEventListener('dragstart', function() {
    // removeCard();
      onItem = false;
      hideContainer();
    });
  });

  function showCard(event){
    getBounds();
    event.preventDefault();
    let li = $(event.currentTarget).closest('.item'),
        item = actor.getOwnedItem(li.data("item-id")),
        itemData = item.data,
        chatData = item.getChatData({secrets: actor.owner}),
        itemDescription = chatData.description.value,
        
        infoCard = li.find('.info-card');
        
    infoCard.clone().appendTo(infoContainerContent);

    let	infoBackground = infoContainer.find('.item-info-container-background'),
        infoDescription = infoContainerContent.find('.info-card-description'),
        props = $(`<div class="item-properties"></div>`);

    infoDescription.html(itemDescription);

    chatData.properties.forEach(p => props.append(`<span class="tag">${p}</span>`));
    infoContainerContent.find('.info-card .description-wrap').after(props);

    infoBackground.hide();

    let innerScrollHeight = infoDescription[0].scrollHeight;

    if(innerScrollHeight > infoDescription.height() ) {
      infoDescription.addClass('overflowing');
    }
  }

  function removeCard(){
    html.find('.item-info-container-background').show();
    infoContainerContent.find('.info-card').remove();
  }
  
  function hideContainer(){
    infoContainer.removeClass('open');
  }

  $('#item-info-container').on('click', '.button', function(e){
    e.preventDefault();
    let itemId = $(this).closest('.info-card').attr('data-item-id');
    let action = $(this).attr('data-action');
    $(`.tidy5e-sheet .item[data-item-id='${itemId}'] .item-buttons .button[data-action='${action}']`).trigger(e);
  })

}