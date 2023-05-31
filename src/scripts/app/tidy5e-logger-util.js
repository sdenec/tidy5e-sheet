import CONSTANTS from "./constants.js";

// ================================
// Logger utility
// ================================
// export let debugEnabled = 0;
// 0 = none, warnings = 1, debug = 2, all = 3
export function debug(msg, args = "") {
	if (game.settings.get(CONSTANTS.MODULE_ID, "debug")) {
		console.log(`DEBUG | ${CONSTANTS.MODULE_ID} | ${msg}`, args);
		//@ts-ignore
		if (game.modules.get("_dev-mode")?.api?.getPackageDebugValue(CONSTANTS.MODULE_ID)) {
			console.log(CONSTANTS.MODULE_ID, "|", ...args);
		}
	}
	return msg;
}
export function log(message, args = "") {
	message = `${CONSTANTS.MODULE_ID} | ${message}`;
	console.log(message.replace("<br>", "\n"));
	//@ts-ignore
	if (game.modules.get("_dev-mode")?.api?.getPackageDebugValue(CONSTANTS.MODULE_ID)) {
		console.log(CONSTANTS.MODULE_ID, "|", ...args);
	}
	return message;
}
// export function log(message) {
//   message = `${CONSTANTS.MODULE_ID} | ${message}`;
//   console.log(message.replace('<br>', '\n'));
//   return message;
// }
export function notify(message) {
	message = `${CONSTANTS.MODULE_ID} | ${message}`;
	ui.notifications?.notify(message);
	console.log(message.replace("<br>", "\n"));
	return message;
}
export function info(info, notify = false) {
	info = `${CONSTANTS.MODULE_ID} | ${info}`;
	if (notify) ui.notifications?.info(info);
	console.log(info.replace("<br>", "\n"));
	return info;
}
export function warn(warning, notify = false) {
	warning = `${CONSTANTS.MODULE_ID} | ${warning}`;
	if (notify) ui.notifications?.warn(warning);
	console.warn(warning.replace("<br>", "\n"));
	return warning;
}
export function error(error, notify = true) {
	error = `${CONSTANTS.MODULE_ID} | ${error}`;
	if (notify) ui.notifications?.error(error);
	return new Error(error.replace("<br>", "\n"));
}
