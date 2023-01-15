
export function migrateFor21X(app, html, data){
    return migrateActorFor21X(app.object);
}
export function migrateActorFor21X(actor){
    if(!isEmptyObject(actor?.system?.details?.notes)) {
        if(!actor.flags) {
            actor.flags = {};
        }
        if(isEmptyObject(actor.flags["tidy5e-sheet"]?.notes)) {
            actor.setFlag("tidy5e-sheet", "notes", actor?.system.details.notes);
        }
    }

    if(!isEmptyObject(actor?.system?.details?.notes1)) {
        if(!actor.flags) {
            actor.flags = {};
        }
        if(isEmptyObject(actor.flags["tidy5e-sheet"]?.notes1)) {
            actor.setFlag("tidy5e-sheet", "notes1", actor?.system.details.notes1);
        }
    }

    if(!isEmptyObject(actor?.system?.details?.notes2)) {
        if(!actor.flags) {
            actor.flags = {};
        }
        if(isEmptyObject(actor.flags["tidy5e-sheet"]?.notes2)) {
            actor.setFlag("tidy5e-sheet", "notes2", actor?.system.details.notes2);
        }
    }

    if(!isEmptyObject(actor?.system?.details?.notes3)) {
        if(!actor.flags) {
            actor.flags = {};
        }
        if(isEmptyObject(actor.flags["tidy5e-sheet"]?.notes3)) {
            actor.setFlag("tidy5e-sheet", "notes3", actor?.system.details.notes3);
        }
    }

    if(!isEmptyObject(actor?.system?.details?.notes4)) {
        if(!actor.flags) {
            actor.flags = {};
        }
        if(isEmptyObject(actor.flags["tidy5e-sheet"]?.notes4)) {
            actor.setFlag("tidy5e-sheet", "notes4", actor?.system.details.notes4);
        }
    }

    // ===================

    if(!isEmptyObject(actor?.system?.details?.notes1name)) {
        if(!actor.flags) {
            actor.flags = {};
        }
        const notes1 = actor.getFlag("tidy5e-sheet", "notes1");
        notes1.name = actor?.system?.details?.notes1name;
        actor.setFlag("tidy5e-sheet", "notes1", notes1);
    }

    if(!isEmptyObject(actor?.system?.details?.notes2name)) {
        if(!actor.flags) {
            actor.flags = {};
        }
        const notes2 = actor.getFlag("tidy5e-sheet", "notes2");
        notes2.name = actor?.system?.details?.notes2name;
        actor.setFlag("tidy5e-sheet", "notes2", notes2);
    }

    if(!isEmptyObject(actor?.system?.details?.notes3name)) {
        if(!actor.flags) {
            actor.flags = {};
        }
        const notes3 = actor.getFlag("tidy5e-sheet", "notes3");
        notes3.name = actor?.system?.details?.notes3name;
        actor.setFlag("tidy5e-sheet", "notes3", notes3);
    }

    if(!isEmptyObject(actor?.system?.details?.notes4name)) {
        if(!actor.flags) {
            actor.flags = {};
        }
        const notes4 = actor.getFlag("tidy5e-sheet", "notes4");
        notes4.name = actor?.system?.details?.notes4name;
        actor.setFlag("tidy5e-sheet", "notes4", notes4);
    }

    if(!isEmptyObject(actor?.system?.details?.gender)) {
        if(!actor.flags) {
            actor.flags = {};
        }
        if(isEmptyObject(actor.flags["tidy5e-sheet"]?.gender)) {
            actor.setFlag("tidy5e-sheet", "gender", actor?.system.details.gender);
        }
    }

    if(!isEmptyObject(actor?.system?.details?.age)) {
        if(!actor.flags) {
            actor.flags = {};
        }
        if(isEmptyObject(actor.flags["tidy5e-sheet"]?.age)) {
            actor.setFlag("tidy5e-sheet", "age", actor?.system.details.age);
        }
    }

    if(!isEmptyObject(actor?.system?.details?.height)) {
        if(!actor.flags) {
            actor.flags = {};
        }
        if(isEmptyObject(actor.flags["tidy5e-sheet"]?.height)) {
            actor.setFlag("tidy5e-sheet", "height", actor?.system.details.height);
        }
    }

    if(!isEmptyObject(actor?.system?.details?.weight)) {
        if(!actor.flags) {
            actor.flags = {};
        }
        if(isEmptyObject(actor.flags["tidy5e-sheet"]?.weight)) {
            actor.setFlag("tidy5e-sheet", "weight", actor?.system.details.weight);
        }
    }

    if(!isEmptyObject(actor?.system?.details?.eyes)) {
        if(!actor.flags) {
            actor.flags = {};
        }
        if(isEmptyObject(actor.flags["tidy5e-sheet"]?.eyes)) {
            actor.setFlag("tidy5e-sheet", "eyes", actor?.system.details.eyes);
        }
    }

    if(!isEmptyObject(actor?.system?.details?.skin)) {
        if(!actor.flags) {
            actor.flags = {};
        }
        if(isEmptyObject(actor.flags["tidy5e-sheet"]?.skin)) {
            actor.setFlag("tidy5e-sheet", "skin", actor?.system.details.skin);
        }
    }

    if(!isEmptyObject(actor?.system?.details?.hair)) {
        if(!actor.flags) {
            actor.flags = {};
        }
        if(isEmptyObject(actor.flags["tidy5e-sheet"]?.hair)) {
            actor.setFlag("tidy5e-sheet", "hair", actor?.system.details.hair);
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
