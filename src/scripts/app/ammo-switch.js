export const tidy5eAmmoSwitch = function (html, actor) {

  html.find('.ammo').each(function () {
    const element = $(this);
    const itemId = element.attr('data-id');
    const token = actor.token || null;
    if (token) actor = actor.getActiveTokens(false, true).find(t => t.data._id === token.id).actor; // get synthetic actor
    const item = actor.items.get(itemId);
    const equippedOnly = game.settings.get('tidy5e-sheet', 'ammoEquippedOnly');
    const ammoItems = actor.items.filter(x => x.data.data.consumableType === "ammo" && (!equippedOnly || x.data.data.equipped));
    const target = item.data.data.consume.target;
    const ammoItemStrings = ['<option value=""></option>']
      .concat(ammoItems.map(x => `<option value="${x.id}" ${x.id === target ? 'selected' : ''}>${x.name}</option>`))
      .join('');
    const selector = $(`<select class="ammo-switch">${ammoItemStrings}</select>`);
    selector.attr('data-item', item.id);
    selector.attr('data-actor', actor.id);
    if (token) selector.attr('data-token', token.id);
    selector.on('change', function () {
      const element = $(this);
      const val = element.val();
      let actor = game.actors.get(selector.attr('data-actor'));
      const token = selector.attr('data-token');
      if (token) actor = actor.getActiveTokens(false, true).find(t => t.data._id === token).actor; // get synthetic actor
      const item = actor.items.get(selector.attr('data-item'));
      const ammo = actor.items.get(val);
      item.update({
        data: {
          consume: {
            amount: !ammo ? null : !!item.data.data.consume.amount ? item.data.data.consume.amount : 1,
            target: !ammo ? '' : val,
            type: !ammo ? '' : ammo.data.data.consumableType
          }
        }
      });
    });
    element.after(selector);
    element.remove();
  });

}