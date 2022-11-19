# Tidy5e Sheet

![GitHub issues](https://img.shields.io/github/issues-raw/sdenec/tidy5e-sheet?style=for-the-badge) ![Latest Release Download Count](https://img.shields.io/github/downloads/sdenec/tidy5e-sheet/latest/module.zip?color=2b82fc&label=DOWNLOADS&style=for-the-badge) [![Forge Installs](https://img.shields.io/badge/dynamic/json?label=Forge%20Installs&query=package.installs&suffix=%25&url=https%3A%2F%2Fforge-vtt.com%2Fapi%2Fbazaar%2Fpackage%2Ftidy5e-sheet&colorB=006400&style=for-the-badge)](https://forge-vtt.com/bazaar#package=tidy5e-sheet) ![Foundry Core Compatible Version](https://img.shields.io/badge/dynamic/json.svg?url=https%3A%2F%2Fraw.githubusercontent.com%2Fsdenec%2Ftidy5e-sheet%2Fmaster%2Fmodule.json&label=Foundry%20Version&query=$.compatibility.verified&colorB=orange&style=for-the-badge) ![Latest Version](https://img.shields.io/badge/dynamic/json.svg?url=https%3A%2F%2Fraw.githubusercontent.com%2Fsdenec%2Ftidy5e-sheet%2Fmaster%2Fmodule.json&label=Latest%20Release&prefix=v&query=$.version&colorB=red&style=for-the-badge) [![Foundry Hub Endorsements](https://img.shields.io/endpoint?logoColor=white&url=https%3A%2F%2Fwww.foundryvtt-hub.com%2Fwp-json%2Fhubapi%2Fv1%2Fpackage%2Ftidy5e-sheet%2Fshield%2Fendorsements&style=for-the-badge)](https://www.foundryvtt-hub.com/package/tidy5e-sheet/) ![GitHub all releases](https://img.shields.io/github/downloads/sdenec/tidy5e-sheet/total?style=for-the-badge)

[![Translation status](https://weblate.foundryvtt-hub.com/widgets/tidy5e-sheet/-/287x66-black.png)](https://weblate.foundryvtt-hub.com/engage/tidy5e-sheet/)

An alternative Character Sheet for Foundry VTT dnd5e aimed at creating a cleaner UI, and many many many other features

## Installation

It's always better and easier to install modules through in in app browser.

To install this module manually:
1. Inside the Foundry "Configuration and Setup" screen, click "Add-on Modules"
2. Click "Install Module"
3. In the "Manifest URL" field, paste the following url:
`https://raw.githubusercontent.com/sdenec/tidy5e-sheet/master/src/module.json`
4. Click 'Install' and wait for installation to complete
5. Don't forget to enable the module in game using the "Manage Module" button

## Features

### item controls
All item controls are hidden by default - you can use right mouse click to show a context menu for all available item interaction: equip/unequip, attuned/attunement required, prepared/unprepared, add/remove favorite, delete. If you don't want the context menu - that was created to conserve space and was the only way to make the option avalable in the grid view - you can bring back the classic item controls as a user setting. The inline controls will only show for PC sheets and the item/spell inventory in list layout. For every other view or sheet it is either impracticable or too spacious.

### sheet lock
To be able to add or delete items you'll have to "unlock" the sheet with the lock icon in the navigation bar.
The lock button in the "locked" position also hides any section that has no content to clean up the sheet a little.

### grid/list view
You can toggle item and spell inventorys into grid or list layout. List is the default view. Grid offers a more condensed overview of your icons and spell with focus on icon art. Youll still able to see the main infos like quantity, charges, equipment/preparation/attunement and if an item is magical. Every other info will show in the info box to the left when you hover over an item.

### Better Spell Level Buttons for DnD 5e

This is an embedded version of Rayuaz's module [Spell Level Buttons for DnD 5e](https://github.com/Rayuaz/spell-level-buttons-for-dnd5e), replaces the spell level select dropdown menu with buttons.

### settings
there are plenty of settings from dark mode to round/square portraits, health visualization and user specific options.
I tried to make each settings description as clear as possible so you should be able to carefully read an pick what you want.

### Attunement Tracker
In the PC inventory you'll find the new attunement tracker at the bottom left. By default you can attune to 3 items. DMs can change the attunement limit for each character by entering a max value in the tracker.

## Attribution Languages

Additional Translations generously provided by:
Japanese: @BrotherSharp, @Asami
Italian: @Simone [UTC +2]
Korean: @KLO
Brazilian Portuguese: @rinnocenti
French: @temvaryen

Thank you very much!

## License
This Foundry VTT module, written by sdenec, is licensed under a Creative Commons Attribution 4.0 International License.

This work is licensed under Foundry Virtual Tabletop EULA - Limited License Agreement for module development v 0.1.6.
