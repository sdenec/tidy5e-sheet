export function migrateFor21X(app, html, data){
    if(!isEmptyObject(app.object?.system?.details?.notes)) {
        if(!app.object.flags) {
            app.object.flags = {};
        }
        if(isEmptyObject(app.object.flags["tidy5e-sheet"]?.notes)) {
            app.object.setFlag("tidy5e-sheet", "notes", app.object?.system.details.notes);
        }
    }

    if(!isEmptyObject(app.object?.system?.details?.notes1)) {
        if(!app.object.flags) {
            app.object.flags = {};
        }
        if(isEmptyObject(app.object.flags["tidy5e-sheet"]?.notes1)) {
            app.object.setFlag("tidy5e-sheet", "notes1", app.object?.system.details.notes1);
        }
    }

    if(!isEmptyObject(app.object?.system?.details?.notes2)) {
        if(!app.object.flags) {
            app.object.flags = {};
        }
        if(isEmptyObject(app.object.flags["tidy5e-sheet"]?.notes2)) {
            app.object.setFlag("tidy5e-sheet", "notes2", app.object?.system.details.notes2);
        }
    }

    if(!isEmptyObject(app.object?.system?.details?.notes3)) {
        if(!app.object.flags) {
            app.object.flags = {};
        }
        if(isEmptyObject(app.object.flags["tidy5e-sheet"]?.notes3)) {
            app.object.setFlag("tidy5e-sheet", "notes3", app.object?.system.details.notes3);
        }
    }

    if(!isEmptyObject(app.object?.system?.details?.notes4)) {
        if(!app.object.flags) {
            app.object.flags = {};
        }
        if(isEmptyObject(app.object.flags["tidy5e-sheet"]?.notes4)) {
            app.object.setFlag("tidy5e-sheet", "notes4", app.object?.system.details.notes4);
        }
    }

    // ===================

    if(!isEmptyObject(app.object?.system?.details?.notes1name)) {
        if(!app.object.flags) {
            app.object.flags = {};
        }
        const notes1 = app.object.getFlag("tidy5e-sheet", "notes1");
        notes1.name = app.object?.system?.details?.notes1name;
        app.object.setFlag("tidy5e-sheet", "notes1", notes1);
    }

    if(!isEmptyObject(app.object?.system?.details?.notes2name)) {
        if(!app.object.flags) {
            app.object.flags = {};
        }
        const notes2 = app.object.getFlag("tidy5e-sheet", "notes2");
        notes2.name = app.object?.system?.details?.notes2name;
        app.object.setFlag("tidy5e-sheet", "notes2", notes2);
    }

    if(!isEmptyObject(app.object?.system?.details?.notes3name)) {
        if(!app.object.flags) {
            app.object.flags = {};
        }
        const notes3 = app.object.getFlag("tidy5e-sheet", "notes3");
        notes3.name = app.object?.system?.details?.notes3name;
        app.object.setFlag("tidy5e-sheet", "notes3", notes3);
    }

    if(!isEmptyObject(app.object?.system?.details?.notes4name)) {
        if(!app.object.flags) {
            app.object.flags = {};
        }
        const notes4 = app.object.getFlag("tidy5e-sheet", "notes4");
        notes4.name = app.object?.system?.details?.notes4name;
        app.object.setFlag("tidy5e-sheet", "notes4", notes4);
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
