//Color Picker by kaelad02
//License: MIT
//Documentation: https://github.com/kaelad02/adv-reminder/blob/54207ec1ef0500439e57521f15956c07e4c02af4/src/settings.js#L91-L104

import CONSTANTS from "./constants.js";

export function colorPicker(moduleId, settingId, html) {
	const settingInput = html.find(`input[name="${moduleId}.${settingId}"]`);
	if (!settingInput.length) {
		return;
	}
	const settingValue = game.settings.get(moduleId, settingId);

	const colorPickerElement = document.createElement("input");
	colorPickerElement.setAttribute("type", "color");
	colorPickerElement.setAttribute("data-edit", `${moduleId}.${settingId}`);
	colorPickerElement.value = settingValue;

	// Add color picker
	const stringInputElement = html[0].querySelector(`input[name="${moduleId}.${settingId}"]`);
	stringInputElement.classList.add("color");
	stringInputElement.after(colorPickerElement);
}

/**
 * @href https://stackoverflow.com/questions/49974145/how-to-convert-rgba-to-hex-color-code-using-javascript
 * @href https://css-tricks.com/converting-color-spaces-in-javascript/
 * @param {*} rgba
 * @param {*} forceRemoveAlpha
 * @returns
 */
export function RGBAToHexAFromString(rgba, forceRemoveAlpha = false) {
	return (
		"#" +
		rgba
			.replace(/^rgba?\(|\s+|\)$/g, "") // Get's rgba / rgb string values
			.split(",") // splits them at ","
			.filter((string, index) => !forceRemoveAlpha || index !== 3)
			.map((string) => parseFloat(string)) // Converts them to numbers
			.map((number, index) => (index === 3 ? Math.round(number * 255) : number)) // Converts alpha to 255 number
			.map((number) => number.toString(16)) // Converts numbers to hex
			.map((string) => (string.length === 1 ? "0" + string : string)) // Adds 0 when length of one number is 1
			.join("")
	); // Puts the array to togehter to a string
}

export function RGBAToHexAFromColor(r, g, b, a) {
	r = r.toString(16);
	g = g.toString(16);
	b = b.toString(16);
	a = Math.round(a * 255).toString(16);

	if (r.length == 1) {
		r = "0" + r;
	}
	if (g.length == 1) {
		g = "0" + g;
	}
	if (b.length == 1) {
		b = "0" + b;
	}
	if (a.length == 1) {
		a = "0" + a;
	}
	return "#" + r + g + b + a;
}

/**
 * @href https://gist.github.com/danieliser/b4b24c9f772066bcf0a6
 * @href https://stackoverflow.com/questions/21646738/convert-hex-to-rgba
 * @param {*} hex
 * @returns
 */
export function HexToRGBA(hexCode, opacity = 1) {
	/*
	let hex = hexCode.replace("#", "");

	if (hex.length === 3) {
		hex = `${hex[0]}${hex[0]}${hex[1]}${hex[1]}${hex[2]}${hex[2]}`;
	}

	let r = parseInt(hex.substring(0, 2), 16);
	let g = parseInt(hex.substring(2, 4), 16);
	let b = parseInt(hex.substring(4, 6), 16);

	// Backward compatibility for whole number based opacity values.
	if (opacity > 1 && opacity <= 100) {
		opacity = opacity / 100;
	}
	return `rgba(${r},${g},${b},${opacity})`;
	*/
	let rgba = _hexToRGBA(hexCode);
	let r = rgba[0];
	let g = rgba[1];
	let b = rgba[2];
	let a = rgba[3];
	return `rgba(${r},${g},${b},${a})`;
}

// Hex to rgba
function _convertHexUnitTo256(hexStr) {
	return parseInt(hexStr.repeat(2 / hexStr.length), 16);
}

/**
 * turn hex rgba into rgba string
 * @param {String} hex 8 long hex value in string form, eg: "#123456ff"
 * @returns Array of rgba[r, g, b, a]
 */
function _hexToRGBA(hex) {
	const hexArr = hex.slice(1).match(new RegExp(".{2}", "g"));
	const [r, g, b, a] = hexArr.map(_convertHexUnitTo256);
	return [r, g, b, Math.round((a / 256 + Number.EPSILON) * 100) / 100];
}

export const mapDefaultColorsRGB = {
	t5e_primary_font: "rgb(0, 0, 0)",
	t5e_background: "rgb(236, 233, 223)",
	t5e_faintest_color: "rgb(0, 0, 0)",
	t5e_faint_color: "rgb(0, 0, 0)",
	t5e_light_color: "rgb(0, 0, 0)",
	t5e_primary_color: "rgb(0, 0, 0)",
	t5e_secondary_color: "rgb(0, 0, 0)",
	t5e_tertiary_color: "rgb(0, 0, 0)",
	t5e_primary_accent: "rgb(255, 100, 0)",
	t5e_white: "rgb(255, 255, 255)",
	t5e_faint_white: "rgb(255, 255, 255)",
	t5e_linked_accent: "rgb(0, 255, 0)",
	t5e_unlinked_accent: "rgb(255, 0, 0)",
	t5e_linked_light: "rgb(0, 255, 0)",
	t5e_unlinked_light: "rgb(255, 0, 0)",
	t5e_safe_accent: "rgb(0, 150, 100)",
	t5e_unsafe_accent: "rgb(255, 0, 0)",
	t5e_header_background: "rgb(255, 255, 255)",
	t5e_header_border: "rgb(0, 0, 0)",
	t5e_stat_font: "rgb(236, 233, 223)",
	t5e_prepareable: "rgb(119, 136, 153)",
	t5e_equipped: "rgb(50, 205, 50)",
	t5e_equipped_outline: "rgb(50, 205, 50)",
	t5e_equipped_accent: "rgb(173, 255, 47)",
	t5e_prepared: "rgb(50, 205, 50)",
	t5e_prepared_outline: "rgb(50, 205, 50)",
	t5e_prepared_accent: "rgb(173, 255, 47)",
	t5e_pact: "rgb(250, 0, 180)",
	t5e_pact_outline: "rgb(250, 50, 213)",
	t5e_pact_accent: "rgb(198, 119, 193)",
	t5e_atwill: "rgb(226, 246, 4)",
	t5e_atwill_outline: "rgb(163, 165, 50)",
	t5e_atwill_accent: "rgb(255, 242, 0)",
	t5e_innate: "rgb(255, 0, 0)",
	t5e_innate_outline: "rgb(231, 23, 23)",
	t5e_innate_accent: "rgb(195, 69, 69)",
	t5e_alwaysprepared: "rgb(0, 0, 255)",
	t5e_alwaysprepared_outline: "rgb(65, 105, 225)",
	t5e_alwaysprepared_accent: "rgb(0, 191, 255)",
	t5e_magic_accent: "rgb(255, 255, 0)",
	t5e_faint_magic_accent: "rgb(255, 255, 0)",
	t5e_magic_outline: "rgb(175, 255, 47)",
	t5e_attunement_required: "rgb(205, 92, 92)",
	t5e_icon_attuned: "rgb(0, 0, 0)",
	t5e_xp_bar: "rgb(94, 225, 146)",
	t5e_encumbrance_bar: "rgb(108, 138, 165)",
	t5e_encumbrance_bar_outline: "rgb(205, 228, 255)",
	t5e_encumbrance_outline: "rgb(0, 0, 0)",
	t5e_warning_accent: "rgb(255, 0, 0)",
	t5e_icon_background: "rgb(236, 233, 223)",
	t5e_icon_shadow: "rgb(0, 0, 0)",
	t5e_icon_outline: "rgb(0, 0, 0)",
	t5e_icon_font: "rgb(0, 0, 0)",
	t5e_exhaustion_font: "rgb(0, 0, 0)",
	t5e_icon_hover: "rgb(0, 0, 0)",
	t5e_note_background: "rgb(0, 0, 0)",
	t5e_exhaustion_lvl1: "rgb(255, 230, 0)",
	t5e_exhaustion_lvl2: "rgb(255, 130, 0)",
	t5e_exhaustion_lvl3: "rgb(255, 50, 0)",
	t5e_ability_accent: "darkslategrey",
	t5e_context_outline: "rgb(0, 0, 0)",
	t5e_context_shadow: "rgb(0, 0, 0)",
	t5e_checkbox_font: "rgb(0, 0, 0)",
	t5e_checkbox_outline: "rgb(150, 150, 150)",
	t5e_checkbox_unchecked: "#D8D7D1",
	t5e_checkbox_checked: "rgb(0, 255, 0)"
};
export const mapDefaultColorsRGBA = {
	t5e_primary_font: "rgba(0, 0, 0, 0.9)",
	t5e_background: "rgba(236, 233, 223, 1)",
	t5e_faintest_color: "rgba(0, 0, 0, 0.05)",
	t5e_faint_color: "rgba(0, 0, 0, 0.1)",
	t5e_light_color: "rgba(0, 0, 0, 0.25)",
	t5e_primary_color: "rgba(0, 0, 0, 0.9)",
	t5e_secondary_color: "rgba(0, 0, 0, 0.65)",
	t5e_tertiary_color: "rgba(0, 0, 0, 0.4)",
	t5e_primary_accent: "rgba(255, 100, 0, 1)",
	t5e_white: "rgba(255, 255, 255, 1)",
	t5e_faint_white: "rgba(255, 255, 255, 0.2)",
	t5e_linked_accent: "rgba(0, 255, 0, 0.75)",
	t5e_unlinked_accent: "rgba(255, 0, 0, 0.75)",
	t5e_linked_light: "rgba(0, 255, 0, 0.4)",
	t5e_unlinked_light: "rgba(255, 0, 0, 0.4)",
	t5e_safe_accent: "rgba(0, 150, 100, 0.6)",
	t5e_unsafe_accent: "rgba(255, 0, 0, 0.6)",
	t5e_header_background: "rgba(255, 255, 255, 0.2)",
	t5e_header_border: "rgba(0, 0, 0, 0.25)",
	t5e_stat_font: "rgba(236, 233, 223, 1)",
	t5e_prepareable: "rgba(119, 136, 153, 1)",
	t5e_equipped: "rgba(50, 205, 50, 0.3)",
	t5e_equipped_outline: "rgba(50, 205, 50, 1)",
	t5e_equipped_accent: "rgba(173, 255, 47, 1)",
	t5e_prepared: "rgba(50, 205, 50, 0.3)",
	t5e_prepared_outline: "rgba(50, 205, 50, 1)",
	t5e_prepared_accent: "rgba(173, 255, 47, 1)",
	t5e_pact: "rgba(250, 0, 180, 0.3)",
	t5e_pact_outline: "rgba(250, 50, 213, 1)",
	t5e_pact_accent: "rgba(198, 119, 193, 1)",
	t5e_atwill: "rgba(226, 246, 4, 0.3)",
	t5e_atwill_outline: "rgba(163, 165, 50, 1)",
	t5e_atwill_accent: "rgba(255, 242, 0, 1)",
	t5e_innate: "rgba(255, 0, 0, 0.3)",
	t5e_innate_outline: "rgba(231, 23, 23, 1)",
	t5e_innate_accent: "rgba(195, 69, 69, 1)",
	t5e_alwaysprepared: "rgba(0, 0, 255, 0.15)",
	t5e_alwaysprepared_outline: "rgba(65, 105, 225, 1)",
	t5e_alwaysprepared_accent: "rgba(0, 191, 255, 1)",
	t5e_magic_accent: "rgba(255, 255, 0, 1)",
	t5e_faint_magic_accent: "rgba(255, 255, 0, 0.6)",
	t5e_magic_outline: "rgba(175, 255, 47, 1)",
	t5e_attunement_required: "rgba(205, 92, 92, 1)",
	t5e_icon_attuned: "rgba(0, 0, 0, 0.4)",
	t5e_xp_bar: "rgba(94, 225, 146, 1)",
	t5e_encumbrance_bar: "rgba(108, 138, 165, 1)",
	t5e_encumbrance_bar_outline: "rgba(205, 228, 255, 1)",
	t5e_encumbrance_outline: "rgba(0, 0, 0, 0.9)",
	t5e_warning_accent: "rgba(255, 0, 0, 0.6)",
	t5e_icon_background: "rgba(236, 233, 223, 1)",
	t5e_icon_shadow: "rgba(0, 0, 0, 0.4)",
	t5e_icon_outline: "rgba(0, 0, 0, 0.4)",
	t5e_icon_font: "rgba(0, 0, 0, 0.4)",
	t5e_exhaustion_font: "rgba(0, 0, 0, 0.4)",
	t5e_icon_hover: "rgba(0, 0, 0, 0.9)",
	t5e_note_background: "rgba(0, 0, 0, 0.9)",
	t5e_exhaustion_lvl1: "rgba(255, 230, 0, 1)",
	t5e_exhaustion_lvl2: "rgba(255, 130, 0, 1)",
	t5e_exhaustion_lvl3: "rgba(255, 50, 0, 1)",
	t5e_ability_accent: "darkslategrey",
	t5e_context_outline: "rgba(0, 0, 0, 0.4)",
	t5e_context_shadow: "rgba(0, 0, 0, 0.65)",
	t5e_checkbox_font: "rgba(0, 0, 0, 0.9)",
	t5e_checkbox_outline: "rgba(150, 150, 150, 1)",
	t5e_checkbox_unchecked: "#D8D7D1",
	t5e_checkbox_checked: "rgba(0, 255, 0, 0.3)"
};

export const mapDefaultColorsDarkRGBA = {
	t5e_primary_font: "rgba(255, 255, 255, 0.8)",
	t5e_background: "rgb(30, 30, 30)",
	t5e_white: "rgba(0, 0, 0, 1)",
	t5e_primary_color: "rgba(255, 255, 255, 0.8)",
	t5e_secondary_color: "rgba(255, 255, 255, 0.65)",
	t5e_tertiary_color: "rgba(255, 255, 255, 0.4)",
	t5e_light_color: "rgba(255, 255, 255, 0.25)",
	t5e_faint_color: "rgba(255, 255, 255, 0.1)",
	t5e_faintest_color: "rgba(255, 255, 255, 0.05)",
	t5e_ability_accent: "darkslategrey",
	t5e_header_background: "rgba(255, 255, 255, 0.05)",
	t5e_header_border: "rgba(255, 255, 255, 0.25)",
	t5e_primary_accent: "rgba(255, 100, 0, 1)",
	t5e_equipped: "rgba(0, 250, 180, 0.3)",
	t5e_prepared: "rgba(0, 250, 180, 0.3)",
	t5e_pact: "rgba(250, 0, 180, 0.3)",
	t5e_atwill: "rgba(226, 246, 4, 0.3)",
	t5e_innate: "rgba(255, 0, 0, 0.3)",
	t5e_alwaysprepared: "rgba(0, 100, 255, 0.3)",
	t5e_icon_background: "rgb(30, 30, 30)",
	t5e_icon_shadow: "rgba(0, 0, 0, 0.4)",
	t5e_icon_outline: "rgba(0, 0, 0, 0.4)",
	t5e_icon_font: "rgba(255, 255, 255, 0.4)",
	t5e_icon_hover: "rgba(255, 255, 255, 0.8)",
	t5e_warning_accent: "rgba(255, 30, 0, 0.65)",
	t5e_checkbox_font: "rgba(255, 255, 255, 0.8)",
	t5e_checkbox_outline: "rgba(50, 50, 50, 1)",
	t5e_checkbox_unchecked: "rgba(75, 75, 75, 1)",
	t5e_checkbox_checked: "rgba(0, 255, 0, 0.5)",

	/* added from default tidy */

	t5e_equipped_outline: "rgba(50, 205, 50, 1)",
	t5e_equipped_accent: "rgba(173, 255, 47, 1)",

	t5e_prepared_outline: "rgba(50, 205, 50, 1)",
	t5e_prepared_accent: "rgba(173, 255, 47, 1)",

	t5e_pact_outline: "rgba(250, 50, 213, 1)",
	t5e_pact_accent: "rgba(198, 119, 193, 1)",

	t5e_atwill_outline: "rgba(163, 165, 50, 1)",
	t5e_atwill_accent: "rgba(255, 242, 0, 1)",

	t5e_innate_outline: "rgba(231, 23, 23, 1)",
	t5e_innate_accent: "rgba(195, 69, 69, 1)",

	t5e_alwaysprepared_outline: "rgba(65, 105, 225, 1)",
	t5e_alwaysprepared_accent: "rgba(0, 191, 255, 1)",

	t5e_magic_accent: "rgba(255, 255, 0, 1)",
	t5e_faint_magic_accent: "rgba(255, 255, 0, 0.6)",
	t5e_magic_outline: "rgba(175, 255, 47, 1)",
	t5e_attunement_required: "rgba(205, 92, 92, 1)",
	t5e_icon_attuned: "rgba(0, 0, 0, 0.4)",
	t5e_xp_bar: "rgba(94, 225, 146, 1)",
	t5e_encumbrance_bar: "rgba(108, 138, 165, 1)",
	t5e_encumbrance_bar_outline: "rgba(205, 228, 255, 1)",
	t5e_encumbrance_outline: "rgba(0, 0, 0, 0.9)",

	t5e_exhaustion_font: "rgba(0, 0, 0, 0.4)",
	t5e_icon_hover: "rgba(0, 0, 0, 0.9)",
	t5e_note_background: "rgba(0, 0, 0, 0.9)",
	t5e_exhaustion_lvl1: "rgba(255, 230, 0, 1)",
	t5e_exhaustion_lvl2: "rgba(255, 130, 0, 1)",
	t5e_exhaustion_lvl3: "rgba(255, 50, 0, 1)",
	t5e_ability_accent: "darkslategrey",
	t5e_context_outline: "rgba(0, 0, 0, 0.4)",
	t5e_context_shadow: "rgba(0, 0, 0, 0.65)"
};

export const mapDefaultColorsDarkRGB = {
	t5e_primary_font: "rgb(255, 255, 255",
	t5e_background: "rgb(30, 30, 30)",
	t5e_white: "rgb(0, 0, 0)",
	t5e_primary_color: "rgb(255, 255, 255)",
	t5e_secondary_color: "rgb(255, 255, 255)",
	t5e_tertiary_color: "rgb(255, 255, 255)",
	t5e_light_color: "rgb(255, 255, 255)",
	t5e_faint_color: "rgb(255, 255, 255)",
	t5e_faintest_color: "rgb(255, 255, 255)",
	t5e_ability_accent: "darkslategrey",
	t5e_header_background: "rgb(255, 255, 255)",
	t5e_header_border: "rgb(255, 255, 255)",
	t5e_primary_accent: "rgb(255, 100, 0)",
	t5e_equipped: "rgb(0, 250, 180)",
	t5e_prepared: "rgb(0, 250, 180)",
	t5e_pact: "rgb(250, 0, 180)",
	t5e_atwill: "rgb(226, 246, 4)",
	t5e_innate: "rgb(255, 0, 0)",
	t5e_alwaysprepared: "rgb(0, 100, 255)",
	t5e_icon_background: "rgb(30, 30, 30)",
	t5e_icon_shadow: "rgb(0, 0, 0)",
	t5e_icon_outline: "rgb(0, 0, 0)",
	t5e_icon_font: "rgb(255, 255, 255)",
	t5e_icon_hover: "rgb(255, 255, 255)",
	t5e_warning_accent: "rgb(255, 30, 0)",
	t5e_checkbox_font: "rgb(255, 255, 255)",
	t5e_checkbox_outline: "rgb(50, 50, 50)",
	t5e_checkbox_unchecked: "rgb(75, 75, 75)",
	t5e_checkbox_checked: "rgb(0, 255, 0)",

	/* added from default tidy */

	t5e_equipped_outline: "rgb(50, 205, 50)",
	t5e_equipped_accent: "rgb(173, 255, 47)",

	t5e_prepared_outline: "rgb(50, 205, 50)",
	t5e_prepared_accent: "rgb(173, 255, 47)",

	t5e_pact_outline: "rgb(250, 50, 213)",
	t5e_pact_accent: "rgb(198, 119, 193)",

	t5e_atwill_outline: "rgb(163, 165, 50)",
	t5e_atwill_accent: "rgb(255, 242, 0)",

	t5e_innate_outline: "rgb(231, 23, 23)",
	t5e_innate_accent: "rgb(195, 69, 69)",

	t5e_alwaysprepared_outline: "rgb(65, 105, 225)",
	t5e_alwaysprepared_accent: "rgb(0, 191, 255)",

	t5e_magic_accent: "rgb(255, 255, 0)",
	t5e_faint_magic_accent: "rgb(255, 255, 0)",
	t5e_magic_outline: "rgb(175, 255, 47)",
	t5e_attunement_required: "rgb(205, 92, 92)",
	t5e_icon_attuned: "rgb(0, 0, 0)",
	t5e_xp_bar: "rgb(94, 225, 146)",
	t5e_encumbrance_bar: "rgb(108, 138, 165)",
	t5e_encumbrance_bar_outline: "rgb(205, 228, 255)",
	t5e_encumbrance_outline: "rgb(0, 0, 0)",

	t5e_exhaustion_font: "rgb(0, 0, 0)",
	t5e_icon_hover: "rgb(0, 0, 0)",
	t5e_note_background: "rgb(0, 0, 0)",
	t5e_exhaustion_lvl1: "rgb(255, 230, 0)",
	t5e_exhaustion_lvl2: "rgb(255, 130, 0)",
	t5e_exhaustion_lvl3: "rgb(255, 50, 0)",
	t5e_ability_accent: "darkslategrey",
	t5e_context_outline: "rgb(0, 0, 0)",
	t5e_context_shadow: "rgb(0, 0, 0)"
};

export function applyColorPickerCustomization(html) {
	if (game.settings.get(CONSTANTS.MODULE_ID, "colorPickerEnabled")) {
		// Color picker settings
		const vColorPickerEquipped = HexToRGBA(game.settings.get(CONSTANTS.MODULE_ID, "colorPickerEquipped"), 0.3);
		const vColorPickerEquippedOutline = HexToRGBA(
			game.settings.get(CONSTANTS.MODULE_ID, "colorPickerEquippedOutline")
		);
		const vColorPickerEquippedAccent = HexToRGBA(
			game.settings.get(CONSTANTS.MODULE_ID, "colorPickerEquippedAccent")
		);
		const vColorPickerPrepared = HexToRGBA(game.settings.get(CONSTANTS.MODULE_ID, "colorPickerPrepared"), 0.3);
		const vColorPickerPreparedOutline = HexToRGBA(
			game.settings.get(CONSTANTS.MODULE_ID, "colorPickerPreparedOutline")
		);
		const vColorPickerPreparedAccent = HexToRGBA(
			game.settings.get(CONSTANTS.MODULE_ID, "colorPickerPreparedAccent")
		);
		const vColorPickerPact = HexToRGBA(game.settings.get(CONSTANTS.MODULE_ID, "colorPickerPact"), 0.3);
		const vColorPickerPactOutline = HexToRGBA(game.settings.get(CONSTANTS.MODULE_ID, "colorPickerPactOutline"));
		const vColorPickerPactAccent = HexToRGBA(game.settings.get(CONSTANTS.MODULE_ID, "colorPickerPactAccent"));
		const vColorPickerAtWill = HexToRGBA(game.settings.get(CONSTANTS.MODULE_ID, "colorPickerAtWill"), 0.3);
		const vColorPickerAtWillOutline = HexToRGBA(game.settings.get(CONSTANTS.MODULE_ID, "colorPickerAtWillOutline"));
		const vColorPickerAtWillAccent = HexToRGBA(game.settings.get(CONSTANTS.MODULE_ID, "colorPickerAtWillAccent"));
		const vColorPickerInnate = HexToRGBA(game.settings.get(CONSTANTS.MODULE_ID, "colorPickerInnate"), 0.3);
		const vColorPickerInnateOutline = HexToRGBA(game.settings.get(CONSTANTS.MODULE_ID, "colorPickerInnateOutline"));
		const vColorPickerInnateAccent = HexToRGBA(game.settings.get(CONSTANTS.MODULE_ID, "colorPickerInnateAccent"));
		const vColorPickerAlwaysPrepared = HexToRGBA(
			game.settings.get(CONSTANTS.MODULE_ID, "colorPickerAlwaysPrepared"),
			0.3
		);
		const vColorPickerAlwaysPreparedOutline = HexToRGBA(
			game.settings.get(CONSTANTS.MODULE_ID, "colorPickerAlwaysPreparedOutline")
		);
		const vColorPickerAlwaysPreparedAccent = HexToRGBA(
			game.settings.get(CONSTANTS.MODULE_ID, "colorPickerAlwaysPreparedAccent")
		);

		// Equipped

		html.find(".tidy5e-sheet #item-info-container-content .info-card.equipped").each(function (index, element) {
			const curValue = $(element).css(`background`);
			let newValue =
				game.settings.get(CONSTANTS.MODULE_ID, "colorScheme") === "dark"
					? curValue.replace(mapDefaultColorsDarkRGBA.t5e_equipped, vColorPickerEquipped)
					: curValue.replace(mapDefaultColorsRGBA.t5e_equipped, vColorPickerEquipped);

			newValue =
				game.settings.get(CONSTANTS.MODULE_ID, "colorScheme") === "dark"
					? newValue.replace(mapDefaultColorsDarkRGB.t5e_equipped, vColorPickerEquipped)
					: newValue.replace(mapDefaultColorsRGB.t5e_equipped, vColorPickerEquipped);

			$(element).css(`background`, newValue);
		});

		html.find(".tidy5e-sheet .items-list .item.equipped").each(function (index, element) {
			const curValue = $(element).css(`background`);
			let newValue =
				game.settings.get(CONSTANTS.MODULE_ID, "colorScheme") === "dark"
					? curValue.replace(mapDefaultColorsDarkRGBA.t5e_equipped, vColorPickerEquipped)
					: curValue.replace(mapDefaultColorsRGBA.t5e_equipped, vColorPickerEquipped);

			newValue =
				game.settings.get(CONSTANTS.MODULE_ID, "colorScheme") === "dark"
					? newValue.replace(mapDefaultColorsDarkRGB.t5e_equipped, vColorPickerEquipped)
					: newValue.replace(mapDefaultColorsRGB.t5e_equipped, vColorPickerEquipped);

			$(element).css(`background`, newValue);
		});

		html.find(".tidy5e-sheet .grid-layout .item-list .item.equipped").each(function (index, element) {
			const curValue = $(element).css(`-webkit-box-shadow`);
			let newValue =
				game.settings.get(CONSTANTS.MODULE_ID, "colorScheme") === "dark"
					? curValue.replace(mapDefaultColorsDarkRGBA.t5e_equipped_outline, vColorPickerEquippedOutline)
					: curValue.replace(mapDefaultColorsRGBA.t5e_equipped_outline, vColorPickerEquippedOutline);

			newValue =
				game.settings.get(CONSTANTS.MODULE_ID, "colorScheme") === "dark"
					? newValue.replace(mapDefaultColorsDarkRGB.t5e_equipped_outline, vColorPickerEquippedOutline)
					: newValue.replace(mapDefaultColorsRGB.t5e_equipped_outline, vColorPickerEquippedOutline);

			$(element).css(`-webkit-box-shadow`, newValue);

			const curValue2 = $(element).css(`box-shadow`);
			let newValue2 =
				game.settings.get(CONSTANTS.MODULE_ID, "colorScheme") === "dark"
					? curValue2.replace(mapDefaultColorsDarkRGBA.t5e_equipped_outline, vColorPickerEquippedOutline)
					: curValue2.replace(mapDefaultColorsRGBA.t5e_equipped_outline, vColorPickerEquippedOutline);

			newValue2 =
				game.settings.get(CONSTANTS.MODULE_ID, "colorScheme") === "dark"
					? newValue2.replace(mapDefaultColorsDarkRGB.t5e_equipped_outline, vColorPickerEquippedOutline)
					: newValue2.replace(mapDefaultColorsRGB.t5e_equipped_outline, vColorPickerEquippedOutline);

			$(element).css(`box-shadow`, newValue2);
		});

		html.find(".tidy5e-sheet .grid-layout .item-list .item.equipped .item-image").each(function (index, element) {
			const curValue = $(element).css(`-webkit-box-shadow`);
			let newValue =
				game.settings.get(CONSTANTS.MODULE_ID, "colorScheme") === "dark"
					? curValue.replace(mapDefaultColorsDarkRGBA.t5e_equipped_accent, vColorPickerEquippedAccent)
					: curValue.replace(mapDefaultColorsRGBA.t5e_equipped_accent, vColorPickerEquippedAccent);

			newValue =
				game.settings.get(CONSTANTS.MODULE_ID, "colorScheme") === "dark"
					? newValue.replace(mapDefaultColorsDarkRGB.t5e_equipped_accent, vColorPickerEquippedAccent)
					: newValue.replace(mapDefaultColorsRGB.t5e_equipped_accent, vColorPickerEquippedAccent);

			$(element).css(`-webkit-box-shadow`, newValue);

			const curValue2 = $(element).css(`box-shadow`);
			let newValue2 =
				game.settings.get(CONSTANTS.MODULE_ID, "colorScheme") === "dark"
					? curValue2.replace(mapDefaultColorsDarkRGBA.t5e_equipped_accent, vColorPickerEquippedAccent)
					: curValue2.replace(mapDefaultColorsRGBA.t5e_equipped_accent, vColorPickerEquippedAccent);

			newValue2 =
				game.settings.get(CONSTANTS.MODULE_ID, "colorScheme") === "dark"
					? newValue2.replace(mapDefaultColorsDarkRGB.t5e_equipped_accent, vColorPickerEquippedAccent)
					: newValue2.replace(mapDefaultColorsRGB.t5e_equipped_accent, vColorPickerEquippedAccent);

			$(element).css(`box-shadow`, newValue2);
		});

		// Prepared

		html.find(".tidy5e-sheet #item-info-container-content .info-card.prepared").each(function (index, element) {
			const curValue = $(element).css(`background`);
			let newValue =
				game.settings.get(CONSTANTS.MODULE_ID, "colorScheme") === "dark"
					? curValue.replace(mapDefaultColorsDarkRGBA.t5e_prepared, vColorPickerPrepared)
					: curValue.replace(mapDefaultColorsRGBA.t5e_prepared, vColorPickerPrepared);

			newValue =
				game.settings.get(CONSTANTS.MODULE_ID, "colorScheme") === "dark"
					? newValue.replace(mapDefaultColorsDarkRGB.t5e_prepared, vColorPickerPrepared)
					: newValue.replace(mapDefaultColorsRGB.t5e_prepared, vColorPickerPrepared);

			$(element).css(`background`, newValue);
		});

		html.find(".tidy5e-sheet .items-list .item.prepared").each(function (index, element) {
			const curValue = $(element).css(`background`);
			let newValue =
				game.settings.get(CONSTANTS.MODULE_ID, "colorScheme") === "dark"
					? curValue.replace(mapDefaultColorsDarkRGBA.t5e_prepared, vColorPickerPrepared)
					: curValue.replace(mapDefaultColorsRGBA.t5e_prepared, vColorPickerPrepared);

			newValue =
				game.settings.get(CONSTANTS.MODULE_ID, "colorScheme") === "dark"
					? newValue.replace(mapDefaultColorsDarkRGB.t5e_prepared, vColorPickerPrepared)
					: newValue.replace(mapDefaultColorsRGB.t5e_prepared, vColorPickerPrepared);

			$(element).css(`background`, newValue);
		});

		html.find(".tidy5e-sheet .grid-layout .item-list .item.prepared").each(function (index, element) {
			const curValue = $(element).css(`-webkit-box-shadow`);
			let newValue =
				game.settings.get(CONSTANTS.MODULE_ID, "colorScheme") === "dark"
					? curValue.replace(mapDefaultColorsDarkRGBA.t5e_prepared_outline, vColorPickerPreparedOutline)
					: curValue.replace(mapDefaultColorsRGBA.t5e_prepared_outline, vColorPickerPreparedOutline);

			newValue =
				game.settings.get(CONSTANTS.MODULE_ID, "colorScheme") === "dark"
					? newValue.replace(mapDefaultColorsDarkRGB.t5e_prepared_outline, vColorPickerPreparedOutline)
					: newValue.replace(mapDefaultColorsRGB.t5e_prepared_outline, vColorPickerPreparedOutline);

			$(element).css(`-webkit-box-shadow`, newValue);

			const curValue2 = $(element).css(`box-shadow`);
			let newValue2 =
				game.settings.get(CONSTANTS.MODULE_ID, "colorScheme") === "dark"
					? curValue2.replace(mapDefaultColorsDarkRGBA.t5e_prepared_outline, vColorPickerPreparedOutline)
					: curValue2.replace(mapDefaultColorsRGBA.t5e_prepared_outline, vColorPickerPreparedOutline);

			newValue2 =
				game.settings.get(CONSTANTS.MODULE_ID, "colorScheme") === "dark"
					? newValue2.replace(mapDefaultColorsDarkRGB.t5e_prepared_outline, vColorPickerPreparedOutline)
					: newValue2.replace(mapDefaultColorsRGB.t5e_prepared_outline, vColorPickerPreparedOutline);

			$(element).css(`box-shadow`, newValue2);
		});

		html.find(".tidy5e-sheet .grid-layout .item-list .item.prepared .item-image").each(function (index, element) {
			const curValue = $(element).css(`-webkit-box-shadow`);
			let newValue =
				game.settings.get(CONSTANTS.MODULE_ID, "colorScheme") === "dark"
					? curValue.replace(mapDefaultColorsDarkRGBA.t5e_prepared_accent, vColorPickerPreparedAccent)
					: curValue.replace(mapDefaultColorsRGBA.t5e_prepared_accent, vColorPickerPreparedAccent);

			newValue =
				game.settings.get(CONSTANTS.MODULE_ID, "colorScheme") === "dark"
					? newValue.replace(mapDefaultColorsDarkRGB.t5e_prepared_accent, vColorPickerPreparedAccent)
					: newValue.replace(mapDefaultColorsRGB.t5e_prepared_accent, vColorPickerPreparedAccent);

			$(element).css(`-webkit-box-shadow`, newValue);

			const curValue2 = $(element).css(`box-shadow`);
			let newValue2 =
				game.settings.get(CONSTANTS.MODULE_ID, "colorScheme") === "dark"
					? curValue2.replace(mapDefaultColorsDarkRGBA.t5e_prepared_accent, vColorPickerPreparedAccent)
					: curValue2.replace(mapDefaultColorsRGBA.t5e_prepared_accent, vColorPickerPreparedAccent);

			newValue2 =
				game.settings.get(CONSTANTS.MODULE_ID, "colorScheme") === "dark"
					? newValue2.replace(mapDefaultColorsDarkRGB.t5e_prepared_accent, vColorPickerPreparedAccent)
					: newValue2.replace(mapDefaultColorsRGB.t5e_prepared_accent, vColorPickerPreparedAccent);

			$(element).css(`box-shadow`, newValue2);
		});

		// Pact

		html.find(".tidy5e-sheet #item-info-container-content .info-card.pact").each(function (index, element) {
			const curValue = $(element).css(`background`);
			let newValue =
				game.settings.get(CONSTANTS.MODULE_ID, "colorScheme") === "dark"
					? curValue.replace(mapDefaultColorsDarkRGBA.t5e_pact, vColorPickerPact)
					: curValue.replace(mapDefaultColorsRGBA.t5e_pact, vColorPickerPact);

			newValue =
				game.settings.get(CONSTANTS.MODULE_ID, "colorScheme") === "dark"
					? newValue.replace(mapDefaultColorsDarkRGB.t5e_pact, vColorPickerPact)
					: newValue.replace(mapDefaultColorsRGB.t5e_pact, vColorPickerPact);

			$(element).css(`background`, newValue);
		});

		html.find(".tidy5e-sheet .items-list .item.pact").each(function (index, element) {
			const curValue = $(element).css(`background`);
			let newValue =
				game.settings.get(CONSTANTS.MODULE_ID, "colorScheme") === "dark"
					? curValue.replace(mapDefaultColorsDarkRGBA.t5e_pact, vColorPickerPact)
					: curValue.replace(mapDefaultColorsRGBA.t5e_pact, vColorPickerPact);

			newValue =
				game.settings.get(CONSTANTS.MODULE_ID, "colorScheme") === "dark"
					? newValue.replace(mapDefaultColorsDarkRGB.t5e_pact, vColorPickerPact)
					: newValue.replace(mapDefaultColorsRGB.t5e_pact, vColorPickerPact);

			$(element).css(`background`, newValue);
		});

		html.find(".tidy5e-sheet .grid-layout .item-list .item.pact").each(function (index, element) {
			const curValue = $(element).css(`-webkit-box-shadow`);
			let newValue =
				game.settings.get(CONSTANTS.MODULE_ID, "colorScheme") === "dark"
					? curValue.replace(mapDefaultColorsDarkRGBA.t5e_pact_outline, vColorPickerPactOutline)
					: curValue.replace(mapDefaultColorsRGBA.t5e_pact_outline, vColorPickerPactOutline);

			newValue =
				game.settings.get(CONSTANTS.MODULE_ID, "colorScheme") === "dark"
					? newValue.replace(mapDefaultColorsDarkRGB.t5e_pact_outline, vColorPickerPactOutline)
					: newValue.replace(mapDefaultColorsRGB.t5e_pact_outline, vColorPickerPactOutline);

			$(element).css(`-webkit-box-shadow`, newValue);

			const curValue2 = $(element).css(`box-shadow`);
			let newValue2 =
				game.settings.get(CONSTANTS.MODULE_ID, "colorScheme") === "dark"
					? curValue2.replace(mapDefaultColorsDarkRGBA.t5e_pact_outline, vColorPickerPactOutline)
					: curValue2.replace(mapDefaultColorsRGBA.t5e_pact_outline, vColorPickerPactOutline);

			newValue2 =
				game.settings.get(CONSTANTS.MODULE_ID, "colorScheme") === "dark"
					? newValue2.replace(mapDefaultColorsDarkRGB.t5e_pact_outline, vColorPickerPactOutline)
					: newValue2.replace(mapDefaultColorsRGB.t5e_pact_outline, vColorPickerPactOutline);

			$(element).css(`box-shadow`, newValue2);
		});

		html.find(".tidy5e-sheet .grid-layout .item-list .item.pact .item-image").each(function (index, element) {
			const curValue = $(element).css(`-webkit-box-shadow`);
			let newValue =
				game.settings.get(CONSTANTS.MODULE_ID, "colorScheme") === "dark"
					? curValue.replace(mapDefaultColorsDarkRGBA.t5e_pact_accent, vColorPickerPactAccent)
					: curValue.replace(mapDefaultColorsRGBA.t5e_pact_accent, vColorPickerPactAccent);

			newValue =
				game.settings.get(CONSTANTS.MODULE_ID, "colorScheme") === "dark"
					? newValue.replace(mapDefaultColorsDarkRGB.t5e_pact_accent, vColorPickerPactAccent)
					: newValue.replace(mapDefaultColorsRGB.t5e_pact_accent, vColorPickerPactAccent);

			$(element).css(`-webkit-box-shadow`, newValue);

			const curValue2 = $(element).css(`box-shadow`);
			let newValue2 =
				game.settings.get(CONSTANTS.MODULE_ID, "colorScheme") === "dark"
					? curValue2.replace(mapDefaultColorsDarkRGBA.t5e_pact_accent, vColorPickerPactAccent)
					: curValue2.replace(mapDefaultColorsRGBA.t5e_pact_accent, vColorPickerPactAccent);

			newValue2 =
				game.settings.get(CONSTANTS.MODULE_ID, "colorScheme") === "dark"
					? newValue2.replace(mapDefaultColorsDarkRGB.t5e_pact_accent, vColorPickerPactAccent)
					: newValue2.replace(mapDefaultColorsRGB.t5e_pact_accent, vColorPickerPactAccent);

			$(element).css(`box-shadow`, newValue2);
		});

		// At Will

		html.find(".tidy5e-sheet #item-info-container-content .info-card.atwill").each(function (index, element) {
			const curValue = $(element).css(`background`);
			let newValue =
				game.settings.get(CONSTANTS.MODULE_ID, "colorScheme") === "dark"
					? curValue.replace(mapDefaultColorsDarkRGBA.t5e_atwill, vColorPickerAtWill)
					: curValue.replace(mapDefaultColorsRGBA.t5e_atwill, vColorPickerAtWill);

			newValue =
				game.settings.get(CONSTANTS.MODULE_ID, "colorScheme") === "dark"
					? newValue.replace(mapDefaultColorsDarkRGB.t5e_atwill, vColorPickerAtWill)
					: newValue.replace(mapDefaultColorsRGB.t5e_atwill, vColorPickerAtWill);

			$(element).css(`background`, newValue);
		});

		html.find(".tidy5e-sheet .items-list .item.atwill").each(function (index, element) {
			const curValue = $(element).css(`background`);
			let newValue =
				game.settings.get(CONSTANTS.MODULE_ID, "colorScheme") === "dark"
					? curValue.replace(mapDefaultColorsDarkRGBA.t5e_atwill, vColorPickerAtWill)
					: curValue.replace(mapDefaultColorsRGBA.t5e_atwill, vColorPickerAtWill);

			newValue =
				game.settings.get(CONSTANTS.MODULE_ID, "colorScheme") === "dark"
					? newValue.replace(mapDefaultColorsDarkRGB.t5e_atwill, vColorPickerAtWill)
					: newValue.replace(mapDefaultColorsRGB.t5e_atwill, vColorPickerAtWill);

			$(element).css(`background`, newValue);
		});

		html.find(".tidy5e-sheet .grid-layout .item-list .item.atwill").each(function (index, element) {
			const curValue = $(element).css(`-webkit-box-shadow`);
			let newValue =
				game.settings.get(CONSTANTS.MODULE_ID, "colorScheme") === "dark"
					? curValue.replace(mapDefaultColorsDarkRGBA.t5e_atwill_outline, vColorPickerAtWillOutline)
					: curValue.replace(mapDefaultColorsRGBA.t5e_atwill_outline, vColorPickerAtWillOutline);

			newValue =
				game.settings.get(CONSTANTS.MODULE_ID, "colorScheme") === "dark"
					? newValue.replace(mapDefaultColorsDarkRGB.t5e_atwill_outline, vColorPickerAtWillOutline)
					: newValue.replace(mapDefaultColorsRGB.t5e_atwill_outline, vColorPickerAtWillOutline);

			$(element).css(`-webkit-box-shadow`, newValue);

			const curValue2 = $(element).css(`box-shadow`);
			let newValue2 =
				game.settings.get(CONSTANTS.MODULE_ID, "colorScheme") === "dark"
					? curValue2.replace(mapDefaultColorsDarkRGBA.t5e_atwill_outline, vColorPickerAtWillOutline)
					: curValue2.replace(mapDefaultColorsRGBA.t5e_atwill_outline, vColorPickerAtWillOutline);

			newValue2 =
				game.settings.get(CONSTANTS.MODULE_ID, "colorScheme") === "dark"
					? newValue2.replace(mapDefaultColorsDarkRGB.t5e_atwill_outline, vColorPickerAtWillOutline)
					: newValue2.replace(mapDefaultColorsRGB.t5e_atwill_outline, vColorPickerAtWillOutline);

			$(element).css(`box-shadow`, newValue2);
		});

		html.find(".tidy5e-sheet .grid-layout .item-list .item.atwill .item-image").each(function (index, element) {
			const curValue = $(element).css(`-webkit-box-shadow`);
			let newValue =
				game.settings.get(CONSTANTS.MODULE_ID, "colorScheme") === "dark"
					? curValue.replace(mapDefaultColorsDarkRGBA.t5e_atwill_accent, vColorPickerAtWillAccent)
					: curValue.replace(mapDefaultColorsRGBA.t5e_atwill_accent, vColorPickerAtWillAccent);

			newValue =
				game.settings.get(CONSTANTS.MODULE_ID, "colorScheme") === "dark"
					? newValue.replace(mapDefaultColorsDarkRGB.t5e_atwill_accent, vColorPickerAtWillAccent)
					: newValue.replace(mapDefaultColorsRGB.t5e_atwill_accent, vColorPickerAtWillAccent);

			$(element).css(`-webkit-box-shadow`, newValue);

			const curValue2 = $(element).css(`box-shadow`);
			let newValue2 =
				game.settings.get(CONSTANTS.MODULE_ID, "colorScheme") === "dark"
					? curValue2.replace(mapDefaultColorsDarkRGBA.t5e_atwill_accent, vColorPickerAtWillAccent)
					: curValue2.replace(mapDefaultColorsRGBA.t5e_atwill_accent, vColorPickerAtWillAccent);

			newValue2 =
				game.settings.get(CONSTANTS.MODULE_ID, "colorScheme") === "dark"
					? newValue2.replace(mapDefaultColorsDarkRGB.t5e_atwill_accent, vColorPickerAtWillAccent)
					: newValue2.replace(mapDefaultColorsRGB.t5e_atwill_accent, vColorPickerAtWillAccent);

			$(element).css(`box-shadow`, newValue2);
		});

		// Innate

		html.find(".tidy5e-sheet #item-info-container-content .info-card.innate").each(function (index, element) {
			const curValue = $(element).css(`background`);
			let newValue =
				game.settings.get(CONSTANTS.MODULE_ID, "colorScheme") === "dark"
					? curValue.replace(mapDefaultColorsDarkRGBA.t5e_innate, vColorPickerInnate)
					: curValue.replace(mapDefaultColorsRGBA.t5e_innate, vColorPickerInnate);

			newValue =
				game.settings.get(CONSTANTS.MODULE_ID, "colorScheme") === "dark"
					? newValue.replace(mapDefaultColorsDarkRGB.t5e_innate, vColorPickerInnate)
					: newValue.replace(mapDefaultColorsRGB.t5e_innate, vColorPickerInnate);

			$(element).css(`background`, newValue);
		});

		html.find(".tidy5e-sheet .items-list .item.innate").each(function (index, element) {
			const curValue = $(element).css(`background`);
			let newValue =
				game.settings.get(CONSTANTS.MODULE_ID, "colorScheme") === "dark"
					? curValue.replace(mapDefaultColorsDarkRGBA.t5e_innate, vColorPickerInnate)
					: curValue.replace(mapDefaultColorsRGBA.t5e_innate, vColorPickerInnate);

			newValue =
				game.settings.get(CONSTANTS.MODULE_ID, "colorScheme") === "dark"
					? newValue.replace(mapDefaultColorsDarkRGB.t5e_innate, vColorPickerInnate)
					: newValue.replace(mapDefaultColorsRGB.t5e_innate, vColorPickerInnate);

			$(element).css(`background`, newValue);
		});

		html.find(".tidy5e-sheet .grid-layout .item-list .item.innate").each(function (index, element) {
			const curValue = $(element).css(`-webkit-box-shadow`);
			let newValue =
				game.settings.get(CONSTANTS.MODULE_ID, "colorScheme") === "dark"
					? curValue.replace(mapDefaultColorsDarkRGBA.t5e_innate_outline, vColorPickerInnateOutline)
					: curValue.replace(mapDefaultColorsRGBA.t5e_innate_outline, vColorPickerInnateOutline);

			newValue =
				game.settings.get(CONSTANTS.MODULE_ID, "colorScheme") === "dark"
					? newValue.replace(mapDefaultColorsDarkRGB.t5e_innate_outline, vColorPickerInnateOutline)
					: newValue.replace(mapDefaultColorsRGB.t5e_innate_outline, vColorPickerInnateOutline);

			$(element).css(`-webkit-box-shadow`, newValue);

			const curValue2 = $(element).css(`box-shadow`);
			let newValue2 =
				game.settings.get(CONSTANTS.MODULE_ID, "colorScheme") === "dark"
					? curValue2.replace(mapDefaultColorsDarkRGBA.t5e_innate_outline, vColorPickerInnateOutline)
					: curValue2.replace(mapDefaultColorsRGBA.t5e_innate_outline, vColorPickerInnateOutline);

			newValue2 =
				game.settings.get(CONSTANTS.MODULE_ID, "colorScheme") === "dark"
					? newValue2.replace(mapDefaultColorsDarkRGB.t5e_innate_outline, vColorPickerInnateOutline)
					: newValue2.replace(mapDefaultColorsRGB.t5e_innate_outline, vColorPickerInnateOutline);

			$(element).css(`box-shadow`, newValue2);
		});

		html.find(".tidy5e-sheet .grid-layout .item-list .item.innate .item-image").each(function (index, element) {
			const curValue = $(element).css(`-webkit-box-shadow`);
			let newValue =
				game.settings.get(CONSTANTS.MODULE_ID, "colorScheme") === "dark"
					? curValue.replace(mapDefaultColorsDarkRGBA.t5e_innate_accent, vColorPickerInnateAccent)
					: curValue.replace(mapDefaultColorsRGBA.t5e_innate_accent, vColorPickerInnateAccent);

			newValue =
				game.settings.get(CONSTANTS.MODULE_ID, "colorScheme") === "dark"
					? newValue.replace(mapDefaultColorsDarkRGB.t5e_innate_accent, vColorPickerInnateAccent)
					: newValue.replace(mapDefaultColorsRGB.t5e_innate_accent, vColorPickerInnateAccent);

			$(element).css(`-webkit-box-shadow`, newValue);

			const curValue2 = $(element).css(`box-shadow`);
			let newValue2 =
				game.settings.get(CONSTANTS.MODULE_ID, "colorScheme") === "dark"
					? curValue2.replace(mapDefaultColorsDarkRGBA.t5e_innate_accent, vColorPickerInnateAccent)
					: curValue2.replace(mapDefaultColorsRGBA.t5e_innate_accent, vColorPickerInnateAccent);

			newValue2 =
				game.settings.get(CONSTANTS.MODULE_ID, "colorScheme") === "dark"
					? newValue2.replace(mapDefaultColorsDarkRGB.t5e_innate_accent, vColorPickerInnateAccent)
					: newValue2.replace(mapDefaultColorsRGB.t5e_innate_accent, vColorPickerInnateAccent);

			$(element).css(`box-shadow`, newValue2);
		});

		// Always Prepared

		html.find(".tidy5e-sheet #item-info-container-content .info-card.alwaysprepared").each(function (
			index,
			element
		) {
			const curValue = $(element).css(`background`);
			let newValue =
				game.settings.get(CONSTANTS.MODULE_ID, "colorScheme") === "dark"
					? curValue.replace(mapDefaultColorsDarkRGBA.t5e_alwaysprepared, vColorPickerAlwaysPrepared)
					: curValue.replace(mapDefaultColorsRGBA.t5e_alwaysprepared, vColorPickerAlwaysPrepared);

			newValue =
				game.settings.get(CONSTANTS.MODULE_ID, "colorScheme") === "dark"
					? newValue.replace(mapDefaultColorsDarkRGB.t5e_alwaysprepared, vColorPickerAlwaysPrepared)
					: newValue.replace(mapDefaultColorsRGB.t5e_alwaysprepared, vColorPickerAlwaysPrepared);

			$(element).css(`background`, newValue);
		});

		html.find(".tidy5e-sheet .items-list .item.alwaysprepared").each(function (index, element) {
			const curValue = $(element).css(`background`);
			let newValue =
				game.settings.get(CONSTANTS.MODULE_ID, "colorScheme") === "dark"
					? curValue.replace(mapDefaultColorsDarkRGBA.t5e_alwaysprepared, vColorPickerAlwaysPrepared)
					: curValue.replace(mapDefaultColorsRGBA.t5e_alwaysprepared, vColorPickerAlwaysPrepared);

			newValue =
				game.settings.get(CONSTANTS.MODULE_ID, "colorScheme") === "dark"
					? newValue.replace(mapDefaultColorsDarkRGB.t5e_alwaysprepared, vColorPickerAlwaysPrepared)
					: newValue.replace(mapDefaultColorsRGB.t5e_alwaysprepared, vColorPickerAlwaysPrepared);

			$(element).css(`background`, newValue);
		});

		html.find(".tidy5e-sheet .grid-layout .item-list .item.alwaysprepared").each(function (index, element) {
			const curValue = $(element).css(`-webkit-box-shadow`);
			let newValue =
				game.settings.get(CONSTANTS.MODULE_ID, "colorScheme") === "dark"
					? curValue.replace(
							mapDefaultColorsDarkRGBA.t5e_alwaysprepared_outline,
							vColorPickerAlwaysPreparedOutline
					  )
					: curValue.replace(
							mapDefaultColorsRGBA.t5e_alwaysprepared_outline,
							vColorPickerAlwaysPreparedOutline
					  );

			newValue =
				game.settings.get(CONSTANTS.MODULE_ID, "colorScheme") === "dark"
					? newValue.replace(
							mapDefaultColorsDarkRGB.t5e_alwaysprepared_outline,
							vColorPickerAlwaysPreparedOutline
					  )
					: newValue.replace(
							mapDefaultColorsRGB.t5e_alwaysprepared_outline,
							vColorPickerAlwaysPreparedOutline
					  );

			$(element).css(`-webkit-box-shadow`, newValue);

			const curValue2 = $(element).css(`box-shadow`);
			let newValue2 =
				game.settings.get(CONSTANTS.MODULE_ID, "colorScheme") === "dark"
					? curValue2.replace(
							mapDefaultColorsDarkRGBA.t5e_alwaysprepared_outline,
							vColorPickerAlwaysPreparedOutline
					  )
					: curValue2.replace(
							mapDefaultColorsRGBA.t5e_alwaysprepared_outline,
							vColorPickerAlwaysPreparedOutline
					  );

			newValue2 =
				game.settings.get(CONSTANTS.MODULE_ID, "colorScheme") === "dark"
					? newValue2.replace(
							mapDefaultColorsDarkRGB.t5e_alwaysprepared_outline,
							vColorPickerAlwaysPreparedOutline
					  )
					: newValue2.replace(
							mapDefaultColorsRGB.t5e_alwaysprepared_outline,
							vColorPickerAlwaysPreparedOutline
					  );

			$(element).css(`box-shadow`, newValue2);
		});

		html.find(".tidy5e-sheet .grid-layout .item-list .item.alwaysprepared .item-image").each(function (
			index,
			element
		) {
			const curValue = $(element).css(`-webkit-box-shadow`);
			let newValue =
				game.settings.get(CONSTANTS.MODULE_ID, "colorScheme") === "dark"
					? curValue.replace(
							mapDefaultColorsDarkRGBA.t5e_alwaysprepared_accent,
							vColorPickerAlwaysPreparedAccent
					  )
					: curValue.replace(
							mapDefaultColorsRGBA.t5e_alwaysprepared_accent,
							vColorPickerAlwaysPreparedAccent
					  );

			newValue =
				game.settings.get(CONSTANTS.MODULE_ID, "colorScheme") === "dark"
					? newValue.replace(
							mapDefaultColorsDarkRGB.t5e_alwaysprepared_accent,
							vColorPickerAlwaysPreparedAccent
					  )
					: newValue.replace(mapDefaultColorsRGB.t5e_alwaysprepared_accent, vColorPickerAlwaysPreparedAccent);

			$(element).css(`-webkit-box-shadow`, newValue);

			const curValue2 = $(element).css(`box-shadow`);
			let newValue2 =
				game.settings.get(CONSTANTS.MODULE_ID, "colorScheme") === "dark"
					? curValue2.replace(
							mapDefaultColorsDarkRGBA.t5e_alwaysprepared_accent,
							vColorPickerAlwaysPreparedAccent
					  )
					: curValue2.replace(
							mapDefaultColorsRGBA.t5e_alwaysprepared_accent,
							vColorPickerAlwaysPreparedAccent
					  );

			newValue2 =
				game.settings.get(CONSTANTS.MODULE_ID, "colorScheme") === "dark"
					? newValue2.replace(
							mapDefaultColorsDarkRGB.t5e_alwaysprepared_accent,
							vColorPickerAlwaysPreparedAccent
					  )
					: newValue2.replace(
							mapDefaultColorsRGB.t5e_alwaysprepared_accent,
							vColorPickerAlwaysPreparedAccent
					  );

			$(element).css(`box-shadow`, newValue2);
		});
	}
}
