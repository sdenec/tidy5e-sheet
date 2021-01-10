export const tidy5eShowActorArt = function (html,actor){
  let portrait = html.find('.portrait'),
      portraitMenu = html.find('.portrait-menu'),
      portraitButton = html.find('.showActorArt');

  portrait.mousedown( async (e) => {
    switch (e.which){
      case 3:
        portraitMenu.toggleClass('hidden');
        break;
    }
  })

  portraitButton.click( function(e){
    e.preventDefault();
    portraitMenu.addClass('hidden');
    let id = $(this).attr('id'),
        portraitImg = actor.data.img,
        tokenImg = actor.data.token.img,
        name =  actor.data.name;
    if (id == 'showPortrait'){
      name = 'Portrait: '+name;
      new ImagePopout(portraitImg, { title: name, shareable: true })
      .render(true);
    } else {
      name = 'Token: '+name;
      new ImagePopout(tokenImg, { title: name, shareable: true })
      .render(true);
    }
  })
}