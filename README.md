# Tidy5e Sheet

![GitHub issues](https://img.shields.io/github/issues-raw/sdenec/tidy5e-sheet?style=for-the-badge) ![Latest Release Download Count](https://img.shields.io/github/downloads/sdenec/tidy5e-sheet/latest/module.zip?color=2b82fc&label=DOWNLOADS&style=for-the-badge) [![Forge Installs](https://img.shields.io/badge/dynamic/json?label=Forge%20Installs&query=package.installs&suffix=%25&url=https%3A%2F%2Fforge-vtt.com%2Fapi%2Fbazaar%2Fpackage%2Ftidy5e-sheet&colorB=006400&style=for-the-badge)](https://forge-vtt.com/bazaar#package=tidy5e-sheet) ![Foundry Core Compatible Version](https://img.shields.io/badge/dynamic/json.svg?url=https%3A%2F%2Fraw.githubusercontent.com%2Fsdenec%2Ftidy5e-sheet%2Fmaster%2Fmodule.json&label=Foundry%20Version&query=$.compatibility.verified&colorB=orange&style=for-the-badge) ![Latest Version](https://img.shields.io/badge/dynamic/json.svg?url=https%3A%2F%2Fraw.githubusercontent.com%2Fsdenec%2Ftidy5e-sheet%2Fmaster%2Fmodule.json&label=Latest%20Release&prefix=v&query=$.version&colorB=red&style=for-the-badge) [![Foundry Hub Endorsements](https://img.shields.io/endpoint?logoColor=white&url=https%3A%2F%2Fwww.foundryvtt-hub.com%2Fwp-json%2Fhubapi%2Fv1%2Fpackage%2Ftidy5e-sheet%2Fshield%2Fendorsements&style=for-the-badge)](https://www.foundryvtt-hub.com/package/tidy5e-sheet/) ![GitHub all releases](https://img.shields.io/github/downloads/sdenec/tidy5e-sheet/total?style=for-the-badge)

[![Translation status](https://weblate.foundryvtt-hub.com/widgets/tidy5e-sheet/-/287x66-black.png)](https://weblate.foundryvtt-hub.com/engage/tidy5e-sheet/)

An alternative Character Sheet for Foundry VTT dnd5e aimed at creating a cleaner UI, and many many many other features

# The module is in maintenance and will have no active developments, efforts will be made where possible to fix bug fixes. 
# The module should be rewritten for good from scratch.
# A bounty has been opened on the League's server for anyone interested in offering financial compensation.
# Or if you want to take ownership directly contact me (4535992) without any problems on the foundryvtt discord server.

## Installation

It's always better and easier to install modules through in in app browser.

To install this module manually:
1. Inside the Foundry "Configuration and Setup" screen, click "Add-on Modules"
2. Click "Install Module"
3. In the "Manifest URL" field, paste the following url:
`https://raw.githubusercontent.com/sdenec/tidy5e-sheet/master/src/module.json`
4. Click 'Install' and wait for installation to complete
5. Don't forget to enable the module in game using the "Manage Module" button

### Color Settings

This module uses the [colorsettings](https://github.com/ardittristan/VTTColorSettings). It is a optional dependency but it is recommended for the best experience and compatibility with other modules.

## Known issue / TODO

- The current template for favorite items is to complicated ... we should be apply the same template of the module, [Character Sheet Favorites](https://gitlab.com/mxzf/favorite-items), and divide as a option for the player the inventory between Weapons/Equipment/Consumables

## Macro to prepare migration from 2.0.3 to 2.1.X

```
// IMPORTANT NOTES: 
// 1) THIS MACRO MUST BE LAUNCHED IN A 2.0.3 WORLDS IF YOU DON'T HAVE A BACKUP SADLY YOU LOST THE JOURNAL DATA
// 2) THIS MACRO MUST NOT BE LAUNCHED IN A 2.1.X WORLD
// 3) BEFORE LAUNCH THIS MACRO DO A BACKUP OF THE CURRENT WORLD JUST TO BE SAFE
// Ty to @zhell for the macro
const updates = game.actors.reduce((acc, a) => {
    const flags = foundry.utils.getProperty(a, "flags.tidy5e-sheet") ?? {};
    const asd = a.system.details ?? {};
    const upd = {};
    const props = {
        "character": ["gender", "age", "height", "weight", "eyes", "skin", "hair", "maxPreparedSpells"],
        "npc": ["trait", "ideal", "bond", "flaw"]
    } [a.type];
    if (!props) {
      return acc;
    }
    for (const prop of props) {
      upd[prop] = asd[prop] || flags[prop] || "";
    }
    const notes = ["notes", "notes1", "notes2", "notes3", "notes4"];
    for (const n of notes) {
      upd[`${n}.value`] = asd[n]?.value || flags[n]?.value || "";
    }
    acc.push({
        _id: a.id,
        "flags.tidy5e-sheet": upd
    });
    return acc;
}, []);
await Actor.updateDocuments(updates);
```

## Features

### Feature: Item controls

All item controls are hidden by default - you can use right mouse click to show a context menu for all available item interaction: equip/unequip, attuned/attunement required, prepared/unprepared, add/remove favorite, delete. If you don't want the context menu - that was created to conserve space and was the only way to make the option avalable in the grid view - you can bring back the classic item controls as a user setting. The inline controls will only show for PC sheets and the item/spell inventory in list layout. For every other view or sheet it is either impracticable or too spacious.

### Feature: Sheet lock

To be able to add or delete items you'll have to "unlock" the sheet with the lock icon in the navigation bar.
The lock button in the "locked" position also hides any section that has no content to clean up the sheet a little.

### Feature: Grid/List view

You can toggle item and spell inventorys into grid or list layout. List is the default view. Grid offers a more condensed overview of your icons and spell with focus on icon art. Youll still able to see the main infos like quantity, charges, equipment/preparation/attunement and if an item is magical. Every other info will show in the info box to the left when you hover over an item.

### Feature: Better Spell Level Buttons for DnD 5e

This is an embedded version of the module [Spell Level Buttons for DnD 5e](https://github.com/Rayuaz/spell-level-buttons-for-dnd5e), replaces the spell level select dropdown menu with buttons.

![](/doc/Spell_Level_Buttons_for_DnD_5e.png)

### Feature: Multiclass Spellbook Filter

This is an embedded version of the module [Multiclass Spellbook filter for 5e (fork)](https://github.com/thatlonelybugbear/spell-class-filter-for-5e), it adds options for players to organize their spellbook by which class the spell is for. Useful for multiclass characters or characters with the magic initiate feat.

To get the filter to work, you will need to populate the data in each spell.

![](/doc/Multiclass_Spellbook_Filter_1.gif)

![](/doc/Multiclass_Spellbook_Filter_2.png)

All settings for this module are found in Foundry's settings menu under the module settings tab.

Currently all of the settings that are available are client-side settings. This means that what you change here will not have an effect on any other computer or player.

#### Using the filter

This module relies on populating data that doesn't seem to exist by default: "Is this spell a {class} spell for you?" So the first step is going to be going through each spell on your sheet and selecting the spell's class in the itemsheet's details tab.

Note: Your selection does not change which ability modifier your spell uses. That is configured elsewhere in the sheet.

Afterwards, if the proper setting is enabled, you will see a dropdown menu at the top of the spellbook with the rest of the filters. Selecting an one of the classes will hide all of the spells that don't match your selection.

#### Icon Replacement

Some players find it helpful to differentiate spells by class even when the list is not filtered. To help with that this module provides the option to 'cover' the spell's icon in the spellbook with the icon of their source class.

To enable this behavior enable it in the module's settings. This setting is disabled by default.

Note: This feature does not change any data or other behaviors. The spell's icon will still be what is displayed in chat and in other sections of the sheet.


### Feature: All your favorite items are synced between modules

The favorite system is syncronized with the module [Character Sheet Favorites](https://gitlab.com/mxzf/favorite-items) and [Favorite tab](https://github.com/syl3r86/favtab)


### Feature: Lazy Money/Hp/Experience

This is an embedded version of the module [Lazy Money](https://github.com/p4535992/foundryvtt-lazymoney-dnd5e), Easily add or remove currency, Hp and Experience with automatic conversion and no overdraft.

![](/doc/Lazy_Money_1.gif)

### Feature: Attunement Tracker

In the PC inventory you'll find the new attunement tracker at the bottom left. By default you can attune to 3 items. DMs can change the attunement limit for each character by entering a max value in the tracker.

### Feature: Exhaustion, Death Save and Rest on NPC

An 'integration more from flavor than from system functionality, a very "crude" integration of Exhaustion, Death Save and Rest (both Short and Long)  is been applied on the NPC sheet


## Settings
there are plenty of settings from dark mode to round/square portraits, health visualization and user specific options.
I tried to make each settings description as clear as possible so you should be able to carefully read an pick what you want.

## Attribution Languages

Additional Translations generously provided by:
Japanese: @BrotherSharp, @Asami
Italian: @Simone [UTC +2]
Korean: @KLO
Brazilian Portuguese: @rinnocenti
French: @temvaryen

Thank you very much!

# Build

## Install all packages

```bash
npm install
```

### dev

`dev` will let you develop you own code with hot reloading on the browser

```bash
npm run dev
```

## npm build scripts

### build

`build` will build and set up a symlink between `dist` and your `dataPath`.

```bash
npm run build
```

### build-watch

`build-watch` will build and watch for changes, rebuilding automatically.

```bash
npm run build-watch
```

### prettier-format

`prettier-format` launch the prettier plugin based on the configuration [here](./.prettierrc)

```bash
npm run-script prettier-format
```

## [Changelog](./changelog.md)

## Issues

Any issues, bugs, or feature requests are always welcome to be reported directly to the [Issue Tracker](https://github.com/p4535992/environment-interactionenvironment-interaction-multisystem/issues ), or using the [Bug Reporter Module](https://foundryvtt.com/packages/bug-reporter/).

## License

- **[Lazy Money](https://github.com/p4535992/foundryvtt-lazymoney-dnd5e)** : [MIT](https://github.com/p4535992/foundryvtt-lazymoney-dnd5e/blob/master/LICENSE)
- **[Multiclass Spellbook filter for 5e](https://github.com/MrEnigmamgine/spell-class-filter-for-5e)** : [MIT](https://github.com/thatlonelybugbear/spell-class-filter-for-5e/blob/main/LICENSE)
- **[Multiclass Spellbook filter for 5e (fork)](https://github.com/thatlonelybugbear/spell-class-filter-for-5e)** : [MIT](https://github.com/thatlonelybugbear/spell-class-filter-for-5e/blob/main/LICENSE)
- **[Spell Level Buttons for DnD 5e](https://github.com/Rayuaz/spell-level-buttons-for-dnd5e)** : [MIT](https://github.com/Rayuaz/spell-level-buttons-for-dnd5e/blob/master/LICENSE)
- **[Character Sheet Favorites](https://gitlab.com/mxzf/favorite-items)**: [MIT](https://gitlab.com/mxzf/favorite-items/-/blob/master/LICENSE)
- **[Character Actions 5e](https://github.com/ElfFriend-DnD/foundryvtt-dnd5eCharacterActions)**: [MIT](https://github.com/ElfFriend-DnD/foundryvtt-dnd5eCharacterActions/blob/main/LICENSE)
- **[Character Actions 5e (fork)](https://github.com/p4535992/foundryvtt-character-actions-dnd5e)** : [MIT](https://github.com/p4535992/foundryvtt-character-actions-dnd5e/blob/master/LICENSE)

This package, written by sdenec, is under an [Creative Commons Attribution 4.0 International License](LICENSE) and the [Foundry Virtual Tabletop Limited License Agreement for module development](https://foundryvtt.com/article/license/).

## Credits

- [p4535992](https://github.com/p4535992) for the module [Lazy Money](https://github.com/p4535992/foundryvtt-lazymoney-dnd5e)
- [MrEnigmamgine](https://github.com/MrEnigmamgine) for the module [Multiclass Spellbook filter for 5e](https://github.com/MrEnigmamgine/spell-class-filter-for-5e)
- [thatlonelybugbear](https://github.com/thatlonelybugbear) for the module [Multiclass Spellbook filter for 5e (fork)](https://github.com/thatlonelybugbear/spell-class-filter-for-5e)
- [Rayuaz](https://github.com/Rayuaz) for the module [Spell Level Buttons for DnD 5e](https://github.com/Rayuaz/spell-level-buttons-for-dnd5e)
- [mxzf](https://gitlab.com/mxzf) for the module [Character Sheet Favorites](https://gitlab.com/mxzf/favorite-items) 
- [ElfFriend-DnD](https://github.com/ElfFriend-DnD/) for the module [Character Actions 5e](https://github.com/ElfFriend-DnD/foundryvtt-dnd5eCharacterActions) 
- [p4535992](https://github.com/p4535992) for the module [Character Actions 5e (fork)](https://github.com/p4535992/foundryvtt-character-actions-dnd5e) 

