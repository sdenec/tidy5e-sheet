console.log('context menu script loaded');
// open context menu
$('.tidy5e .item-list .item').mousedown( function (event) {
  console.log('context menu click fired');
  switch (event.which) {
    case 2:
    	// middle mouse opens item editor
    	event.preventDefault();
  		let item = event.currentTarget;
  		$(item).find('.item-edit').trigger('click');
    	break;
    case 3:
    	// right click opens context menu
    	$('.item').removeClass('context');
  		$('.item .item-controls').hide();
    	itemContextMenu(event);
      break;
	}

	// context menu calculations
  function itemContextMenu(e){
  	let item = e.currentTarget,
  			mouseX = event.clientX,
  			mouseY = event.clientY,
  			itemTop = $(item).offset().top,
  			itemLeft = $(item).offset().left,
  			itemHeight = $(item).height(),
  			itemWidth = $(item).width(),
  			contextTop = mouseY-itemTop+1,
  			contextLeft = mouseX-itemLeft+1,
  			contextWidth = $(item).find('.item-controls').width(),
  			contextHeight = $(item).find('.item-controls').height(),
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
  		.find('.item-controls')
  		.css({'top': contextTop+'px', 'left': contextLeft+'px'})
  		.fadeIn(300);
  }
});

// close context menu on any click outside
$(document).mousedown( function (event) {
	switch (event.which) {
    case 1:
    if ( ! $(event.target).closest('.item .item-controls').length ) {
    	$('.tidy5e .item').removeClass('context');
      $('.tidy5e .item .item-controls').hide();
		}
    	break;
	}
});
