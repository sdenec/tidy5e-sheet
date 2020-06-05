/**
 * @author Felix Müller aka syl3r86
 * @version 0.5.4
 */


async function addFavTab(app, html, data) {

    // checking compatibility
    if (app.options.blockFavTab) {
        console.log(`Favtab | Favourite Item Tab has been blocked by the author of the sheet used for ${data.actor.name}`);
        return;
    }
    if (html.find('.tabs[data-group="primary"]').length === 0 || html.find('.sheet-body').length === 0) {
        console.log(`FavTab | Can't access required sheet components for acotr ${data.actor.name}. Not enabling FavTab`);
        return;
    }


    // creating the favourite tab and loading favourited items
    let favTabBtn = $('<a class="item" data-tab="favourite"><i class="fas fa-star"></i></a>');

    let favItems = [];
    let favFeats = [];
    let favSpells = {
        0: {
            isCantrip: true,
            spells: []
        }, 1: {
            spells: [],
            value: data.actor.data.spells.spell1.value,
            max: data.actor.data.spells.spell1.max
        }, 2: {
            spells: [],
            value: data.actor.data.spells.spell2.value,
            max: data.actor.data.spells.spell2.max
        }, 3: {
            spells: [],
            value: data.actor.data.spells.spell3.value,
            max: data.actor.data.spells.spell3.max
        }, 4: {
            spells: [],
            value: data.actor.data.spells.spell4.value,
            max: data.actor.data.spells.spell4.max
        }, 5: {
            spells: [],
            value: data.actor.data.spells.spell5.value,
            max: data.actor.data.spells.spell5.max
        }, 6: {
            spells: [],
            value: data.actor.data.spells.spell6.value,
            max: data.actor.data.spells.spell6.max
        }, 7: {
            spells: [],
            value: data.actor.data.spells.spell7.value,
            max: data.actor.data.spells.spell7.max
        }, 8: {
            spells: [],
            value: data.actor.data.spells.spell8.value,
            max: data.actor.data.spells.spell8.max
        }, 9: {
            spells: [],
            value: data.actor.data.spells.spell9.value,
            max: data.actor.data.spells.spell9.max
        }
    }
    
    let spellCount = 0
    let items = data.actor.items;

    let renderFavTab = false;


    // processing all items and put them in their respective lists if they're favourited
    for (let item of items) {
        // do not add the fav button for class items
        if (item.type == "class") continue;

        // making sure the flag to set favourites exists
        if (item.flags.favtab === undefined || item.flags.favtab.isFavourite === undefined) {
            item.flags.favtab = { isFavourite: false };
            // DO NOT SAVE AT THIS POINT! saving for each and every item creates unneeded data and hogs the system
            //app.actor.updateOwnedItem(item, true);
        }
        let isFav = item.flags.favtab.isFavourite;

        // add button to toggle favourite of the item in their native tab
        if (app.options.editable) {
            let favBtn = $(`<a class="item-control item-fav" data-fav="${isFav}" title="${isFav ? "remove from favourites" : "add to favourites"}"><i class="fas ${isFav ? "fa-star" : "fa-sign-in-alt"}"></i></a>`);
            favBtn.click(ev => {
                app.actor.getOwnedItem(item._id).update({ "flags.favtab.isFavourite": !item.flags.favtab.isFavourite });
            });
            html.find(`.item[data-item-id="${item._id}"]`).find('.item-controls').prepend(favBtn);
        }

        if (isFav) {
            renderFavTab = true;

            // creating specific labels to be displayed
            let labels = {};
            if (item.data.components && item.data.components.concentration) {
                labels.concentration = 'Concentration';
            }
            if (item.data.activation && item.data.activation.type) {
                labels.activation = `${item.data.activation.cost ? item.data.activation.cost+' ':''}${item.data.activation.type.capitalize()}`;
            }

            // adding info that damage and attacks are possible
            if (['mwak', 'rwak', 'msak', 'rsak'].indexOf(item.data.actionType) !== -1) {
                item.hasAttack = true;
            }
            if (item.data.damage && item.data.damage.parts.length > 0) {
                item.hasDamage = true;
            }

            let attr = item.type === "spell" ? "preparation.prepared" : "equipped";
            let isActive = getProperty(item.data, attr);
            item.toggleClass = isActive ? "active" : "";
            if (item.type === "spell") {
                item.toggleTitle = game.i18n.localize(isActive ? "DND5E.SpellPrepared" : "DND5E.SpellUnprepared");
            } else {
                item.toggleTitle = game.i18n.localize(isActive ? "DND5E.Equipped" : "DND5E.Unequipped");
            }

            item.favLabels = labels;
            
            item.editable = app.options.editable;
            switch (item.type) {
                case 'feat':
                    if (item.flags.favtab.sort === undefined) {
                        item.flags.favtab.sort = (favFeats.count + 1) * 100000; // initial sort key if not present
                    }
                    favFeats.push(item);
                    break;
                case 'spell':
                    if (item.data.preparation.mode && item.data.preparation.mode !== 'prepared') {
                        item.spellPrepMode = ` (${CONFIG.DND5E.spellPreparationModes[item.data.preparation.mode]})`;
                    } else {
                        item.canPrep = true;
                    }
                    if (item.data.level) {
                        favSpells[item.data.level].spells.push(item);
                    } else {
                        favSpells[0].spells.push(item);
                    }
                    spellCount++;
                    break;
                default:
                    if (item.flags.favtab.sort === undefined) {
                        item.flags.favtab.sort = (favItems.count + 1) * 100000; // initial sort key if not present
                    }
                    item.isItem = true;
                    favItems.push(item);
                    break;
            }
        }
    }

    // changing some css in the sheet to acomodate the new favourite button
    if (app.options.editable) {
        html.find('.spellbook .item-controls').css('flex', '0 0 88px');
        html.find('.inventory .item-controls').css('flex', '0 0 88px');
        html.find('.features .item-controls').css('flex', '0 0 66px');
        html.find('.favourite .item-controls').css('flex', '0 0 22px');
    }

    let tabs = html.find('.tabs[data-group="primary"]');
    let tabContainer = html.find('.sheet-body');
    if (renderFavTab) {

        // rendering of the favtab
        let data = {};
        data.favItems = favItems.length > 0 ? favItems.sort((a, b) => (a.flags.favtab.sort) - (b.flags.favtab.sort)) : false;
        data.favFeats = favFeats.length > 0 ? favFeats.sort((a, b) => (a.flags.favtab.sort) - (b.flags.favtab.sort)) : false;
        data.favSpells = spellCount > 0 ? favSpells : false;
        data.editable = app.options.editable;

        await loadTemplates(['modules/favtab/templates/item.hbs']);
        let favtabHtml = $(await renderTemplate('modules/favtab/templates/template.hbs', data));

        // Activating favourite-list events

        // showing item summary
        favtabHtml.find('.item-name h4').click(event => app._onItemSummary(event));

        // the rest is only needed if the sheet is editable
        if (app.options.editable) {
            // rolling the item
            favtabHtml.find('.item-image').click(ev => app._onItemRoll(ev));

            favtabHtml.find('.item-shortcuts .attack').click(ev => {
                let itemId = event.currentTarget.closest(".item").dataset.itemId;
                let item = app.actor.getOwnedItem(itemId);
                item.rollAttack();
            });

            favtabHtml.find('.item-shortcuts .damage').click(ev => {
                let itemId = event.currentTarget.closest(".item").dataset.itemId;
                let item = app.actor.getOwnedItem(itemId);
                item.rollDamage();
            });

            // Item Dragging
            let handler = ev => app._onDragItemStart(ev);
            favtabHtml.find('.item').each((i, li) => {
                if (li.classList.contains("inventory-header")) return;
                li.setAttribute("draggable", true);
                li.addEventListener("dragstart", handler, false);
            });

            // editing the item
            favtabHtml.find('.item-edit').click(ev => {
                let itemId = $(ev.target).parents('.item')[0].dataset.itemId;
                app.actor.getOwnedItem(itemId).sheet.render(true);
            });

            // toggle item icon
            favtabHtml.find('.item-toggle').click(ev => {
                event.preventDefault();
                let itemId = event.currentTarget.closest(".item").dataset.itemId;
                let item = app.actor.getOwnedItem(itemId);
                let attr = item.data.type === "spell" ? "data.preparation.prepared" : "data.equipped";
                return item.update({ [attr]: !getProperty(item.data, attr) });
                //item.update(obj);
            });

            // removing item from favourite list
            favtabHtml.find('.item-fav').click(ev => {
                let itemId = $(ev.target).parents('.item')[0].dataset.itemId;
                let val = !app.actor.getOwnedItem(itemId).data.flags.favtab.isFavourite
                app.actor.getOwnedItem(itemId).update({ "flags.favtab.isFavourite": val });
            });

            // changing the charges values (removing if both value and max are 0)
            favtabHtml.find('.item input').change(ev => {
                let itemId = $(ev.target).parents('.item')[0].dataset.itemId;
                let path = ev.target.dataset.path;
                let data = {};
                data[path] = Number(ev.target.value);
                app.actor.getOwnedItem(itemId).update(data);
                app.activateFavTab = true;
            })

            // creating charges for the item
            favtabHtml.find('.addCharges').click(ev => {
                let itemId = $(ev.target).parents('.item')[0].dataset.itemId;
                let item = app.actor.getOwnedItem(itemId);
                
                item.data.uses = { value: 1, max: 1 };
                let data = {};
                data['data.uses.value'] = 1;
                data['data.uses.max'] = 1;

                app.actor.getOwnedItem(itemId).update(data);
            });

            // hiding the "add charges" button, as well as roll buttons, and only showing it when in the apropiate item
            favtabHtml.find('.addCharges').hide();
            favtabHtml.find('.item-shortcuts').hide();

            favtabHtml.find('.item').hover(evIn => {
                $(evIn.target).parents('.item').find('.addCharges').show();
                $(evIn.target).parents('.item').find('.item-shortcuts').show();
            }, evOut => {
                $(evOut.target).parents('.item').find('.addCharges').hide();
                $(evOut.target).parents('.item').find('.item-shortcuts').hide();
            });

            // custom sorting
            favtabHtml.find('.item').on('drop', ev => {
                ev.preventDefault();
                ev.stopPropagation();

                let dropData = JSON.parse(ev.originalEvent.dataTransfer.getData('text/plain'));

                if (dropData.actorId !== app.actor.id || dropData.data.type === 'spell') {
                    // only do sorting if the item is from the same actor (not droped from outside) and is not a spell
                    return;
                }

                let list = null;
                if (dropData.data.type === 'feat') {
                    list = favFeats;
                } else {
                    list = favItems;
                }

                let dragSource = list.find(i => i._id === dropData.data._id);
                let siblings = list.filter(i=> i._id !== dropData.data._id);
                let targetId = ev.target.closest('.item').dataset.itemId;
                let dragTarget = siblings.find(s => s._id === targetId);

                if (dragTarget === undefined) {
                    // catch trying to drag from one list to the other, which is not supported
                    return;
                }

                // Perform the sort
                const sortUpdates = SortingHelpers.performIntegerSort(dragSource, { target: dragTarget, siblings: siblings, sortKey:'flags.favtab.sort'});
                const updateData = sortUpdates.map(u => {
                    const update = u.update;
                    update._id = u.target._id;
                    return update;
                });

                app.actor.updateManyEmbeddedEntities("OwnedItem", updateData);
            });
        }

        if (window.BetterRolls) {
            BetterRolls.addItemContent(app.object, favtabHtml, ".item .item-name h4", ".item-properties", ".item > .rollable");
        }

        // adding the html to the apropiate containers
        tabContainer.append(favtabHtml);
        tabs.prepend(favTabBtn);
    }

    // open the favtab if its registered as the active tab
    if (app.activateFavTab) {
        $(`.app[data-appid="${app.appId}"] .tabs .item[data-tab="favourite"]`).trigger('click');
    }

    // register the favtab as teh active tab
    html.find('.tabs .item[data-tab="favourite"]').click(ev => {
        app.activateFavTab = true;
    });
    // unregister the favtab as the active tab
    html.find('.tabs .item:not(.tabs .item[data-tab="favourite"])').click(ev => {
        app.activateFavTab = false;
    });
}


Hooks.on(`renderActorSheet`, (app, html, data) => {
    addFavTab(app, html, data);
});