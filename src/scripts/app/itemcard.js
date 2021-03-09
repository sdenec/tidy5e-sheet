export const tidy5eItemCard = function (html, actor) {
// show/hide grid layout item info card on mouse enter/leave

  let fixCard = false;

  document.addEventListener('keydown', function (e) {
    if (e.key === 'x') {
      fixCard = true;
    }
  });

  document.addEventListener('keyup', function (e) {
    if (e.key === 'x') {
      fixCard = false;
      removeCard();
    }
  });

  let allItems = true;

  let containerTrigger =  allItems ? html.find('.inventory-list:not(.character-actions-dnd5e)') : html.find('.grid-layout .inventory-list');
  let cardTrigger = allItems ? html.find('.inventory-list:not(.character-actions-dnd5e) .item-list .item') : html.find('.grid-layout .item-list .item');

  let infoContainer = html.find('#item-info-container'),
      infoContainerContent = html.find('#item-info-container-content');

      html.find('.item-image').mouseenter(function() {console.log('ENTER')});

  containerTrigger.mouseenter( function(){
    if(!fixCard){
      // infoContainer.show();
      infoContainer.addClass('open');
    }
  });

  cardTrigger.mouseenter(async (event) => {
    console.log(event.currentTarget);
    if(!fixCard){
      event.preventDefault();
      let li = $(event.currentTarget).closest('.item'),
          item = actor.getOwnedItem(li.data("item-id")),
          itemData = item.data,
          // itemDescription = itemData.data.description.value,
          chatData = item.getChatData({secrets: actor.owner}),
          itemDescription = chatData.description.value,
          
          infoCard = li.find('.info-card');
          
      infoCard.clone().appendTo(infoContainerContent);

      // let	infoBackground = infoContainerContent.find('.item-info-container-background'),
      let infoDescription = infoContainerContent.find('.info-card-description'),
          props = $(`<div class="item-properties"></div>`);

      infoDescription.html(itemDescription);

      chatData.properties.forEach(p => props.append(`<span class="tag">${p}</span>`));
      infoContainerContent.find('.info-card .description-wrap').after(props);

      // infoContainer.show();
      // infoBackground.hide();

      let innerScrollHeight = infoDescription[0].scrollHeight;

      if(innerScrollHeight > infoDescription.height() ) {
        infoDescription.addClass('overflowing');
        // infoDescription.after('<span class="truncated">&hellip;</span>');
      }
      // console.log(itemData);
    }
  });

  cardTrigger.mouseleave( function (event) {
    if(!fixCard){
      removeCard();
    }
  });
  
  containerTrigger.mouseleave( function (event) {
    if(!fixCard){
      hideContainer();
    }
  });
  
  let item = html.find('.item');
  item.each(function(){
    this.addEventListener('dragstart', function() {
    removeCard();
    hideContainer();
    });
  });

  function removeCard(){
    // html.find('.item-info-container-background').show();
    infoContainerContent.find('.info-card').remove();
    // infoContainer.hide();
  }
  
  function hideContainer(){
    // html.find('.item-info-container-background').show();
    // infoContainerContent.find('.info-card').remove();
    // infoContainer.hide();
    infoContainer.removeClass('open');
  }

}