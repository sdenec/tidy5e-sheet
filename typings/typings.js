export default async function registerTypes(register) {
  fetch("modules/token-factions/typings/types.d.ts")
    .then((response) => response.text())
    .then((content) => register("token-factions/types.d.ts", content));
}
