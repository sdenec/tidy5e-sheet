# Tidy 5e Changelog #

## Attribution ##

Additional Translations generously provided by:

- Japanese: @BrotherSharp, @Asami
- Italian: @Simone [UTC +2]
- Korean: @KLO
- Brazilian Portuguese: @rinnocenti, @brnmuller
- French: @temvaryen, @Aymeeeric
- Chinese: @EternalRider
- Czech: @vitpetricak, @KarelZavicak

Thank you very much!

## Version History ##

### Version 0.5.22 ###

- version changed to simply "9"
- rolls adapted to be asynchronous

### Version 0.5.21 ###

- manifest update for 0.9.9

### Version 0.5.20 ###

- npc spell preparation fix
- max spell slot active effects formula fix (thanks @tposney)

### Version 0.5.19 ###

- favorites fix

### Version 0.5.18 ###

- proficiency dice variant will now show the correct die value on the sheet.
- replaced depricated .getOwnedItem with .items.get
- Currency Abbreviations are now based on the DND5e Translation strings and custom module translation for currency is removed
- Abbreviation for "Initiative" now has its own translation string - apparently "Ini" is somewhat weird in certain languages.
- resources will be hidden in locked mode when neither resource names nor quantities are assigned.

### Version 0.5.17 ###

- fixed size dropdown display bug and dark mode colors
- ability config button added (will be hidden with active sheet lock)
- skill config button added (will be hidden with active sheet lock)
- sheet lock will now also disable trait settings and max spell overrides

### Version 0.5.16 ###

- configurable sheet width (submission by @CarnVanBeck)
- fixed long rest causing negative exhaustion
- right clicking "roll hit dice" icon on NPCs will calculate average hp

### Version 0.5.15 ###

- fixed biography not expanding in width
- fixed death save display for hp values below 0
- long rest now reduces exhaustion by 1
- CUB exhaustion automatically sets correct exhaustion value for the portrait indicator and will remove inactive levels (eg. only one CUB exhaustion level will be applied)
- CUB exhaustion works from Sheet and Token (though token has to be present on canvas for CUB to work!)

### Version 0.5.14 ###

- general naming updates for 1.4.2 compatibility
- fixed empty AC field not clickable to access options
- fixed Vehicle AC field
- dark mode font color for rollable links adjusted
- fixed exhaustion not setting speed to 0

### Version 0.5.13 ###

- ac tooltip css fix
- senses error fix

### Version 0.5.12 ###

- added proficiency options in actor traits
- item sheet css fix for rarity dropdown

### Version 0.5.11 ###

- armor configuration added
- updated JP translation
- Added Ammunition selector to NPCs | thanks to @DarKDinDoN
- Added uses and actions to NPC inventory items | thanks to @DarKDinDoN
- Fixed editor button issue (still a core bug)
- new GM option to hide Death Saves and Results from Players
- restricted size of secondary fields in biography and journal tab
- added Currency section to NPC inventory
- trait labels can now be disabled for pc/npc/vehicles as a gm only setting (visible by default)

### Version 0.5.10 ###

- definately fixed type selection for newly created NPCs (maybe)

### Version 0.5.9 ###

- fixed type selection for newly created NPCs

### Version 0.5.8 ###

- actually respect the npc/vehicle injection rules for Character Actions List
- fixed exhaustion effects
- added ranged ammo selection in inventory (thanks for the contribution @flamewave000)
- ensured important input field identifiers are unique (thanks @calego)
- updated japanese translation

### Version 0.5.7 ###

- jet again: fixed a bug related to Character Actions List

### Version 0.5.6 ###

- fixed a bug related to Character Actions List

### Version 0.5.5 ###

- updated character actions list integration
- fixed display error for item info cards with 0 delay
- new per player setting to hide the journal tab
- new setting for Character Actions list module: Choose default tab for first time opening a sheet (actions or attributes)

### Version 0.5.4 ###

- added the new hit dice configurator that I was unaware of!

### Version 0.5.3 ###

- fixed alphabetical skill sorting for translations
- fixed attunement tracker
- fixed type selection for NPCs with empty type attribute
- fixed ability rolls for observer (PC/NPC)

- in sensitive data mode the skill list will keep proficiency marks while sheet is locked but prevent toggling them

### Version 0.5.2 ###

- Fix for some NPC sheets not opening due to DEFAULT_TOKEN error

### Version 0.5.1 ###

- Fixing version number issue

### Version 0.5.0 ###

- updated sheet for foundry 0.8.x and dnd5e 1.3.0 (required)
- updated korean and japanese translation

### Version 0.4.29 ###

- fix for magic items on NPCs
- fix for hidden NPC resources if actions/resistance values are 1
- added "gender" to bio info and extended character count for info fields
- added bio info to NPCs, too
- fixed errors on vehicle sheets
- added missing PC-setting to show trait labels (got lost during menu rebuild)
- added range column to PC spellbook

### Version 0.4.28 ###

- fix for death saves not resetting when healing through token

### Version 0.4.27 ###

- updated french translation
- updated Czech Translation and some minor translations fixes. Big thanks @KarelZavicak
- bug fix for midiQol buttons on NPC item cards

### Version 0.4.26 ###

- updated japanese translation
- updated spanish translation
- Added translation strings for Info Card hint section
- New setting to show field for player name below character name
- New fields for character appearance in the background tab

### Version 0.4.25 ###

- Custom Settings Menu (finally)
- Large translation string overhaul/update
- Chat Card for NPC rest can be disabled (leveraging the default function that deactivates the chat output for GM and Players)
- Exhaustion effects can now use build in or custom CUB effects
- added search filter to features
- added item value to item info card (next to quantity)
- changed equip/attune/prepare menu options to imperatives and adjusted color to make intentions clearer

### Version 0.4.24 ###

- a custom exhaustion effect icon can be set via settings
- a custom key to fix the card can be defined via settings
- a hover delay before showing the item info card can be defined via settings
- Item info cards can set to float next to the cursor (best to use with delay enabled)

### Version 0.4.23 ###

- css adjustments for item info cards (more subtle equipment highlight and always prepared highlight added)

### Version 0.4.22 ###

- exhaustion effects can be disabled by the settings option. Forgot to listen for it ...

### Version 0.4.21 ###

- compatibility-fix for variant encumbrance and exhaustion effects

### Version 0.4.20 ###

- currency fix

### Version 0.4.19 ###

- fixed a item info card display bug when using the PIN module
- changed the translation string in case you somehow add a custom currency with unknown denomination (will use the variable name as label)

### Version 0.4.18 ###

- redesigned item info cards to free up space in grid layout and made them work in list layout and for npcs as well
- hold down X-key to temporary fixate the card to interact with the content (eg. scroll long text or click buttons)
- NPC traits can now be moved below resources via sheet settings
- minor css fixes
- midi qol item buttons will no longer appear in the context menu. Instead they can be placed directly into the info cards for easy visibility.
- changed the wording for midi qol item buttons setting

### Version 0.4.17 ###

- css fix for the window header buttons hover state
- removed deprecated BetterRolls Hooks
- added automatic exhaustion active effects

### Version 0.4.16 ###

- fix for empty "actions" tab if character actions list is not installed/active

### Version 0.4.15 ###

- integrated actor actions list module
- fix for Portrait Popout and CUB not hiding Actor names
- new GM setting "total edit lock" to lock down sensitive fields when the edit lock is enabled
- new Debug setting to show a marker for items with active effects (for @tposney)

### Version 0.4.14 ###

- minor css fixes

### Version 0.4.13 ###

- fixed a problem with compendiums that would cause a render loop for actor sheets bogging down the game to a halt.

### Version 0.4.12 ###

- classic menu will no longer cause the headers to jump when rendering the sheet.
- various minor css fixes
- condensed some item information displayed on the sheet: weight, charges/uses

### Version 0.4.11 ###

- Removed deprecated legacy speed due to bug causing all movement to be deleted during data migration in dnd5e 1.2.x - I'm very sorry for any inconveniences caused by this
- fixed missing items in observer view

### Version 0.4.10 ###

- Hot fix for module settings

### Version 0.4.9 ###

- no more flicker on ability mods
- no more errors when opening actors from compendiums
- limited sheet now shows correct appearance description
- css fix for lists in item description

### Version 0.4.8 ###

- fix for ability roll errors

### Version 0.4.7 ###

- french translation update and localization fixes thanks Github @Nildran
- tried to fix strange hover behaviour of ability mods
- minor css fix for NPC CR text color
- NPC sheets now have a toggle button for the personality infos (now hidden by default) in the biography tab
- fix to prevent items sometimes becoming invisible when toggling the item details
- you now can use DAE to set a "custom" formula for "data.details.maxPreparedSpells" to calculate your available spell preparations. Thanks @tposney!

### Version 0.4.6 ###

- fixed character art popup when pressing enter/return while editing an input field

### Version 0.4.5 ###

- fixed search for grid layout

### Version 0.4.4 ###

- updated translations for german (Thanks @Fallayn)
- updated japanese translation (Thanks @BrotherSharp)
- a few more localisations added
- vehicle speed update for 5e 1.2.2
- fix: npc favorite icon
- fix: "recharge [X+]" label width
- fix: item names too long to fit are now truncated in inventory/spellbook
- NPC/Vehicle sheets will display item quanitity supported item-types (everything that is sorted under "attacks" and "inventory")
- NPC/Vehicle sheets now will show classic inline controls (settings option)
- NPC spell preparation can be toggled from the sheet
- PC spellbook now lists the Spell Attack Modifier
- PC spellbook now has a Prepared Spells tracker
- PC sheets now have a searchbox to filter item/spell inventory
- loot and tools are equippable again - like in the default sheet
- PC/NPC/Vehicle Portraits now have a right click menu to view and share actor portrait and token art
- Attribute section got a slight makeover to highlight the base ability modifier and on hover make it more obvious what the left and right values will roll.

### Version 0.4.3 ###

- fixed "empty section" bug
- editor colors fix for darkmode
- editor inline rolls css
- fix for inline rolls/links in grid view

### Version 0.4.2 ###

- new per user setting to show trait labels
- new health indicator bar below portrait, toggle per user setting
- new per user setting to show item controls without right click (only for item/spell list view and PCs - space reasons)
- fixed layout of midiQol/Better Roll buttons in the item infos
- added setting for future toggle to display roll buttons in context menu instead (has yet to be implemented by tposney - Better Rolls might come in the future)
- fixed misaligned inventory + controls in list views
- added some generic css to better support tabs added by mods into the sheet body (like downtime tracker)

### Version 0.4.1 ###

- fixed layout issue with resources plus module
- fixed missing right click context menu for npc spells
- fixed disable inspiration and exhaustion tracker (where still showing if users set additional display options)
- fixed white text in dropdown elements for dark theme

### Version 0.4.0 ###

- complete sheet rewrite for better maintainablilty.
- removed the dnd5e css class. Mod developers should target .tidy5e for sheet modifications.
- added a right click context menu for item controls.
- added middle click to quickly open item editor.
- added a grid layout for inventory and spell book.
- added a sheet lock to toggle between empty sections and add/delete button
- added attunement counter
- added NPC rest buttons
- added vehicle sheet support

### Version 0.3.7 ###

- css fix for attuned items

### Version 0.3.6 ###

- update to dnd5e 1.2.0 - thanks to akrigline
- css fix for effects text color in item sheets

### Version 0.3.5 ###

- fixed NPC health calculation issue

### Version 0.3.4 ###

- fixed convert currency button
- Korean Translation update

### Version 0.3.3 ###

- fixed death saving throw rolls
- darkmode css fixes
- added max temp hp to npc sheet

### Version 0.3.2 ###

- css fix for new magic item module features

### Version 0.3.1 ###

- fixed font color for darkmode item descriptions
- updated pc/npc sheets to 5e 1.1.0
- added temp hp to npc sheets
- added switch to show legacy speed in pc/npc sheets
- various css adjustments
- czech language support

### Version 0.3.0 ###

- updated japanese translation
- updates for the 0.99 5e dnd system and foundry 0.7.6. Big thanks to akrigline
- added journals to NPCs
- various css adjustments

### Version 0.2.30 ###

- fixed the drag and drop error in the fav tab

### Version 0.2.29 ###

- added expanded limited character sheet

### Version 0.2.28 ###

- css fix to correct dark mode font color

### Version 0.2.27 ###

- css fixes to correct tiny mce editor height and item description text
- Inventory+ doubled controls fix

### Version 0.2.26 ###

- reacivated better rolls hooks for 0.6.6 compatibility

### Version 0.2.25 ###

- updated sheet for the 0.97 update.
- css fix for paragraph spacing in item descriptions.
- removed better roll hooks. Sheets are now supported by default.
- added translation strings for module settings.
- added german translation for additional strings.

### Version 0.2.24 ###

- Chinese translation added. Thanks to EternalRider!
- CSS fix for double digit spellslots

### Version 0.2.23 ###

- changed css selectors for contenteditable fields to be more generic to better support module compatibility. Thanks to illandril.

### Version 0.2.22 ###

- better rolls support for item sheets restored. Thanks to akrigline!

### Version 0.2.21 ###

- item sheets are now registered as a specific Tidy5e-Sheet to prevent compatibitlity issues and consequently prefixing all styles to only apply to this sheet preventing default overrides. Big thanks to akrigline for the contribution :)
Please make sure to check you item sheet setting to make sure the Tidy5e Itemsheet is set as default!

### Version 0.2.20 ###

- updated Brazilian Portuguese translation by brnmuller
- fixed css-prefix errors. Thanks to akrigline for finding them!
- added "Add" Button to all spell categories in the spellbook * experimental, don't know if this somehow breaks something ###

### Version 0.2.19 ###

- fixed an issue with updating item charges from within the NPC Sheet
- option to change custom highlight colors for default and Darkmode
- option to define a separate highlight color for always prepared spells

### Version 0.2.18 ###

- minor css fix for 0.6.5

### Version 0.2.17 ###

- better simple mobile support

### Version 0.2.16 ###

- introduced an javascript error in last update and fixed it.

### Version 0.2.15 ###

- added inventory+ support

### Version 0.2.14 ###

- fix for hit point overlay issue introduced in 0.2.13

### Version 0.2.13 ###

- added support for Modesto font
- adapted 0.94 system changes  to the sheet
- added experimental settings to highlight actorLink state for NPC sheets

### Version 0.2.12 ###

- fixed margin issue inside saved editor fields

- added support for dice-tooltips thanks to @Majestic

### Version 0.2.11 ###

- fixed display of unordered lists in the sheet. again.

- fixed display of uses in the character and npc sheet

- removed appearance field from npc limited sheet

### Version 0.2.10 ###

- fixed a data-attribute issue causing sheets between player and dm to update in unexpected ways.

### Version 0.2.9 ###

- clickable ability mods now show a pointer on hover to indicate clickability
- spells in the favtab are now sorted alphabetically
- initiative is now clickable when CUB is active

- new settings: option to disable inspiration/exhaustion tracker in the case your campaign doesn't use one of them

- preventive line-height: 1 for skill icons (firefox fix)

### Version 0.2.8 ###

- editor fields now get saved when multiple ones are edited at the same time. Big Thanks to @Forien!

- fixed the spell slot/spell slot override fields in favtab

- clicking a modificator next to an attribute now let you roll an ability test or saving throws directly

### Version 0.2.7 ###

- french translation added

- traits alternate placement fix (when gm and player had different settings the sheets would flash when opened simultaneously)
- always prepared sorting fix for favorites
- always prepared css styling

- limited view css fix

- npc sheets now hide empty spellbooks. It can be shown by clicking the headline or dragging a spell onto the npc sheet.
- fixed max-length issue for CR field.

### Version 0.2.6 ###

- reverted back to Nodesto until the Modesto Font becomes the default for dnd5e System

### Version 0.2.5 ###

- translation updates
- added Support for Environment Field on NPCs
- added prepared Spells for NPCs

- updated fonts with official fonts provided by foundry

- new setting to autohide icons when their value is 0.

- added darkmode support for skill customizer module

- more darkmode css fixes

### Version 0.2.4 ###

- traits on character sheets can be placed under resources
- delete lock added to npc sheet

- new option to show the toggle button for character traits ! OFF BY DEFAULT !

- skill width adjustment to better fit the skill customizer module

- korean translation added
- brazilian portuguese translation added

### Version 0.2.3 ###

- firefox css fix
- various css width fixes
- darkmode inline rolls fixed
- more translations with default dnd5e strings
- italian translation added
- japanese translation added

### Version 0.2.2 ###

- minor css fix
- german translation added

### Version 0.2.1 ###

- minor css fix
- added language support

### Version 0.2.0 ###

- overhaul of the Character Sheet and addition of a NPC sheet, both with dark mode!
- The sheet is compatible to most languages - occasionally there is a word that is particularly long and may be cut of or break out of its field. Some modules have their own css that changes the sheets css. As far as I have tested the available languages only Korean breaks the layout with the modules css.

#### Character Sheet ####

- Attributes, Skills and Traits got a little more compact to make room for the favorites.
- Because of that there no longer is the need for the collapse-buttons for traits and favorites.
- Fvorites can still be toggled to show & edit or hide empty trait fields.
- traits got a bit reorganized: the size slect is now located below the character name, the special traits button is now below the traits list.

#### New NPC Sheet ####

The default NPC sheet was reoganized.

- The general layout was fitted to the character sheet with the option for a round portrait and Hit Point Overlay.
- The attributes were put into the header to be always visible.
- the tabs were reduced to a single tab containing all abilities.
- skills and traits only show proficient skills or available traits. They can be toggled to show all & edit.

### Version 0.1.13 ###

- fixed a class name conflict for exhaustion condition immunitiy

### Version 0.1.12 ###

- Inspiration Indicator counter fix (didn't show 1 when inspiration was active)
- minor css fixes

### Version 0.1.11 ###

- fixed rolls for Better Rolls in the Favorites section
- fixed a line break issue in the navigation for some translations
- text fields for race, background and alignment now fit to content
- d20 icon now is colored by the custom color overrides

- added two new cuts for Signika font: light and semibold to make fonts in darkmode look crisper
- various css fixed for consistent styling throughout the character and item sheet, better contrast and interaction hints

### Version 0.1.10 ###

- fix for trait selection (as of dnd5e 0.93 patch)
- added generic coloredd d20 icon for darksheet to better suite the custom colors option

### Version 0.1.9 ###

- added a custom accent color option to module settings

### Version 0.1.8 ###

Sheet:

- Dark mode for Player Character Sheets and Item Sheets added!
- minor CSS layout adjustments
- minor css fixed to support dnd5e v0.93 update

### Version 0.1.7 ###

Sheet:

- Exhaustion Tracker icon displays mood
- fixed a bug where labels would check boxes across actor sheets when multiple sheets where open

Attributes Tab:

- Dropdownboxes toggle icon adjusted to better communicate toggle state

Favorites:

- Marker is added to Attributes Tab when there are Favorites
- Favorites Dropdown only visible if there are Favorites

- Quantity can be changed
- Charges are shown
- Prepared/Equipped toggle

#### Item Sheets ####

Features

- Charged Checkbox layout fixed
