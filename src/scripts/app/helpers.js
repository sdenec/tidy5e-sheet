export function is_real_number(inNumber) {
	return !isNaN(inNumber) && typeof inNumber === "number" && isFinite(inNumber);
}

export function isEmptyObject(obj) {
	// because Object.keys(new Date()).length === 0;
	// we have to do some additional check
	if (obj === null || obj === undefined) {
		return true;
	}
	const result =
		obj && // null and undefined check
		Object.keys(obj).length === 0; // || Object.getPrototypeOf(obj) === Object.prototype);
	return result;
}

const signCase = {
	add: "+",
	subtract: "-",
	equals: "=",
	default: " ",
};

export function is_lazy_number(inNumber) {

	const isSign = String(inNumber).startsWith(signCase.add) || String(inNumber).startsWith(signCase.subtract) || String(inNumber).startsWith(signCase.equals) || String(inNumber).startsWith(signCase.default);
	if (isSign) {
		const withoutFirst = String(inNumber).slice(1);
		return is_real_number(withoutFirst);
	} else {
		return true;
	}
}
