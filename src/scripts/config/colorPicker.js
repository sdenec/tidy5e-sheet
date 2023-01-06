//Color Picker by kaelad02
//License: MIT
//Documentation: https://github.com/kaelad02/adv-reminder/blob/54207ec1ef0500439e57521f15956c07e4c02af4/src/settings.js#L91-L104

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
	return "#" + rgba.replace(/^rgba?\(|\s+|\)$/g, '') // Get's rgba / rgb string values
	  .split(',') // splits them at ","
	  .filter((string, index) => !forceRemoveAlpha || index !== 3)
	  .map(string => parseFloat(string)) // Converts them to numbers
	  .map((number, index) => index === 3 ? Math.round(number * 255) : number) // Converts alpha to 255 number
	  .map(number => number.toString(16)) // Converts numbers to hex
	  .map(string => string.length === 1 ? "0" + string : string) // Adds 0 when length of one number is 1
	  .join("") // Puts the array to togehter to a string
}

export function RGBAToHexAFromColor(r,g,b,a) {
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