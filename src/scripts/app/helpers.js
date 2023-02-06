export function is_real_number(inNumber) {
	return !isNaN(inNumber) && typeof inNumber === "number" && isFinite(inNumber);
}