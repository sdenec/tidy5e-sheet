# Tidy5e Sheet
An alternative Character Sheet for Foundry VTT dnd5e aimed at creating a cleaner UI.

## Attribution
Additional Translations generously provided by:
Japanese: @BrotherSharp, @Asami
Italian: @Simone [UTC +2]
Korean: @KLO
Brazilian Portuguese: @rinnocenti
French: @temvaryen

Thank you very much!

## Preview
![Tidy5e Sheet Preview](/preview/tidy5e_0-1-5_preview.gif)

## Installation
See https://github.com/foundry-vtt-community/wiki/wiki/Modules#installing-modules. Open the Add-on Modules tab in the Configuration and Setup dialog. Click Install Module, paste https://raw.githubusercontent.com/sdenec/tidy5e-sheet/master/module.json in as the Manifest URL, then click Install.

### Settings
In the `Configure Settings` menu for your world under `Module Settings` you can chose your prefered settings. Round Portraits and Hit Point Overlay Border can only be set by the DM for a consistent use of Portraits.

## New Character Sheet Features

I implemented a few new features or redesigned existing ones to hopefully make them more noticable and easier/more fun to use.

### Square (default) or round Profile Picture
Depending on your prefered portrait format you can display it squared (default by FVTT) or rounded. This setting is best suited for rounded profile pictures and ensures a nicer look. The hit point overlay, rest button and inspiration indicator will be rounded as well. This setting also looks good on square portrait images without custom frames as they get cropped. **This feature can be set by the DM in the settings.**

### Portrait Hit Point Overlay
When your character's hit points are reduced the portrait gradually gets covered with a red tint essentially representing a health bar.
**This feature can be disabled individually in the settings.**

#### Overlay Border
In case you are using a custom frame in your portraits you might want to adjust the overlay to only cover the portrait. You can adjust the hit point overlay border width to try and accomodate your frame.
 **This feature can be set by the DM in the settings.**

### Death Save Overlay
When your character is reduced to 0 hit points the death save box appears on the portrait. You can click the skull to roll a death saving throw or manually enter a number for success or failure.
**When manually restoring hit points the death save box will only vanish if the success or failure count is emtied or reset to '0'.**

### Rest Button
On the lower left of your portrait picture is the relocated Rest Button. When you hover over it you can chose to take a short rest (partly elapsed hourglass) or a long rest (fully elapsed hourglass).

### Animated Inspiration Indicator
On the lower right of your portrait picture is the relocated inspiration indicator. When you click the button a glowing die appears - also a label informs you if you have inspiration (1) or don't (0). The active indicator animates in a subtle pulse motion to remind players that they have inspiration to spend.
**If the animation is distracting it can be disabled individually in the settings.**

### Exhaustion Tracker
You'll find the relocated and restyled exhaustion tracker on you charater'S portrait upper left. You can click each number (0-6) to mark your character's exhaustion level, higlighted in color by severity, accompanied by a label always showing the current level and a hover label listing the current effects.

### Collapsable Trait
Traits are important but most of the time you probably won't look at them - so you can toggle them on and off depending on your preferences an needed space (for example if you use the favorites).

### Favorite Items
Inspired by The Favorites Tab and Sky's use for the favorite items and spells the sheet includes a collapsable section in the attributes tab for your favorites.

### Extendet Biography and Journal
Additionally to the default `Biography`Textfield you can enter your character's personality traits, ideals, bonds and flaws aswell as an appearance description. If you use Roll20 Coverter or the DNDBeyond Exporter these fields will be populated by the imported Data. The Journal tab offers additional space for notes separated in 4 predefines text fields. Feel free to change the labels for the left hand fields. These sections are greatly inspired by Sky's alternate 5e sheet and are compatible should you chose to switch from either one.

### Delete Protection
When you handle items, skills and spells it might happen that you delete something by accident. There are plugins to enable a delete dialogue but I find it cumbersome for deleting multiple items. I implemented a switch to show/hide the delete button from you charachter's inventory, features and spellbook. The lock ist located on the right side of the filter bar. It will remember your setting even if you refresh. For extra security you might install a delete dialogue plugin as well.

## Character Sheet Layout Changes
In general I adjusted font sizes, spacings, colors and icons to better fit the space and appear more coherent. My aim was to make the information as readable and easily navigatable as possible.

### Navigation
I rearranged the navigation items to appear more coherend and clearly indicate which tab is active.

### Attributes Tab
I rearranged the Attributes, Abilities and Traits to be more coherend and easier to scan.

The resource boxes now have a little options gear to show the recovery settings when you hover over it. This is to clean up the Interface.

I rearranged the size dropdown and special trait option to save some space and make them appear more coherend.

For the changed **exhaustion bar** see `New Character Sheet Features` above.

### Inventory Tab/Feature Tab/Spellbook Tab
The filter menu was condensed and moved to the top of the tab. For the **delete protection** see `New Character Sheet Features` above.

The inventory's **Currency Bar** has been moved to the bottom of the page but will stay in place when you scroll through your inventory. This was to make the top a lot more readable and keep the filters coherend with the inventory.

The spellbooks' **Spell DC** and **Spellcasting Ability** menu have been moved to the bottom of the page but will stay in place when you scroll through your inventory. This was to make the top a lot more readable and keep the filters coherend with the inventory.

The item list headers have been adjusted to be concise but not distracting. The labels for weight, charges and uses have been replaced by fitting icons. You can still read what they mean if you hover over them.

All items/spells are visually confined by a box to make them more easy to scan.

The **equipped/unequipped** and **prepared/unprepared** buttons have been moved to the items title to be more prominent and are replaced my more fitting icons and states. Prepared spells additionally get highlighted by a light purple tint, items become highlighted when attuned.

### Biography/Journal Tab
I adjusted the appearance of the editor to better fit the space. I moved the editor button to not cover up the top right corner of the text when you hover over a text field. For information regarding the additional text fields see `New Character Sheet Features` above.

## Item Sheet Layout Changes
To better fit the character sheet the default dnd5e item/spell sheets have been altered in the same way where possible.

My aim was to make the plethora of information represented by lots of input fields as quickly readable as possible. I adjusted the text alignment of adjacend input fields and visually grouped labels and input fields.

## License
This Foundry VTT module, written by sdenec, is licensed under a Creative Commons Attribution 4.0 International License.

This work is licensed under Foundry Virtual Tabletop EULA - Limited License Agreement for module development v 0.1.6.
