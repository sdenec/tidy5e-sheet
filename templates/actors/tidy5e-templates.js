/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
 
export const preloadTidy5eHandlebarsTemplates = async function() {

  // Define template paths to load
  const tidy5etemplatePaths = [

    // Actor Sheet Partials
    "modules/tidy5e-sheet/templates/actors/parts/tidy5e-traits.html",
    "modules/tidy5e-sheet/templates/actors/parts/tidy5e-inventory.html",
    "modules/tidy5e-sheet/templates/actors/parts/tidy5e-features.html",
    "modules/tidy5e-sheet/templates/actors/parts/tidy5e-spellbook.html",
    "modules/tidy5e-sheet/templates/actors/parts/tidy5e-effects.html"
  ];

  // Load the template parts
  return loadTemplates(tidy5etemplatePaths);
};