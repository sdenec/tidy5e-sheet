import Tidy5eBaseConfigSheet from "./tidy5e-base-config-sheet.js";
import CONSTANTS from "./constants.js";

/**
 * A form for configuring actor hit points and bonuses.
 */
export default class Tidy5eActorOriginSummaryConfig extends Tidy5eBaseConfigSheet {
  constructor(...args) {
    super(...args);

    /**
     * Cloned copy of the actor for previewing changes.
     * @type {Actor5e}
     */
    this.clone = this.object.clone();
  }

  /* -------------------------------------------- */

  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["dnd5e", "actor-origin-summary-config"],
      template: `modules/${CONSTANTS.MODULE_ID}/templates/actors/parts/tidy5e-origin-summary-config.html`,
      width: 320,
      height: "auto",
      sheetConfig: false,
    });
  }

  /* -------------------------------------------- */

  /** @inheritdoc */
  get title() {
    return `${game.i18n.localize("TIDY5E.OriginSummaryConfig")}: ${this.document.name}`;
  }

  /* -------------------------------------------- */

  /** @inheritdoc */
  getData(options) {
    return {
      race: this.clone.system.details.race?.name ?? this.clone.system.details.race,
      background: this.clone.system.details.background?.name ?? this.clone.system.details.background,
      environment: this.clone.system.details.environment,
      alignment: this.clone.system.details.alignment,
      dimensions: this.clone.system.traits.dimensions,

      isCharacter: this.document.type === "character",
      isNPC: this.document.type === "npc",
      isVehicle: this.document.type === "vehicle",
      canEditBackground: !this.clone.system.details.background?.name,
      canEditRace: !this.clone.system.details.race?.name,
    };
  }

  /* -------------------------------------------- */

  /** @inheritdoc */
  _getActorOverrides() {
    return Object.keys(foundry.utils.flattenObject(this.object.overrides?.system?.details || {}));
  }

  /* -------------------------------------------- */

  /** @inheritdoc */
  async _updateObject(event, formData) {
    const race = foundry.utils.expandObject(formData).race;
    const background = foundry.utils.expandObject(formData).background;
    const environment = foundry.utils.expandObject(formData).environment;
    const alignment = foundry.utils.expandObject(formData).alignment;

    const dimensions = foundry.utils.expandObject(formData).dimensions;

    const isCharacter = this.document.type === "character";
    const isNPC = this.document.type === "npc";
    const isVehicle = this.document.type === "vehicle";

    if (isCharacter) {
      return this.document.update({
        "system.details.race": race,
        "system.details.background": background,
        "system.details.alignment": alignment,
      });
    } else if (isNPC) {
      return this.document.update({
        "system.details.environment": environment,
        "system.details.alignment": alignment,
      });
    } else if (isVehicle) {
      return this.document.update({
        "system.traits.dimensions": dimensions,
      });
    }
  }

  /* -------------------------------------------- */
  /*  Event Listeners and Handlers                */
  /* -------------------------------------------- */

  /** @inheritDoc */
  activateListeners(html) {
    super.activateListeners(html);
    for (const override of this._getActorOverrides()) {
      html.find(`input[name="${override}"],select[name="${override}"]`).each((_, el) => {
        el.disabled = true;
        el.dataset.tooltip = "DND5E.ActiveEffectOverrideWarning";
      });
    }
  }
}
