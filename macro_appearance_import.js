// migrates old appearance data
// select the token for data migration and execute macro
let tokens = canvas.tokens.controlled;
let currentActor = tokens[0].actor;
let data = currentActor.data.data.details;
let migratedData = data.appearance + data.description.value;
currentActor.update({'data.details.appearance': migratedData});