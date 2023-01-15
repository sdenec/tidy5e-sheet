export function migrateFor21X(app, html, data){
    if(!isEmptyObject(app.object?.system.details.notes)) {
        if(!app.object.flags) {
            app.object.flags = {};
        }
        if(isEmptyObject(app.object.flags["tidy5e-sheet"]?.notes)) {
            app.object.setFlag("tidy5e-sheet", "notes", app.object?.system.details.notes);
        }
    }
}

function isEmptyObject(obj) {
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
