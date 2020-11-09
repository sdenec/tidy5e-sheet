import ActorSheet5e from "../../systems/dnd5e/module/actor/sheets/base.js";
import { preloadTidy5eHandlebarsTemplates } from "./templates/actors/npc/tidy5e-npc-templates.js";

/**
 * An Actor sheet for NPC type characters in the D&D5E system.
 * Extends the base ActorSheet5e class.
 * @type {ActorSheet5e}
 */

let npcScrollPos = 0;

/* handlebars helper funtio to check if strings are empty */
Handlebars.registerHelper('check', function(value, comparator) {
  return (value === comparator) ? 'No content' : value;
});

export default class Tidy5eNPC extends ActorSheet5e {

  /**
   * Define default rendering options for the NPC sheet
   * @return {Object}
   */
	static get defaultOptions() {
	  return mergeObject(super.defaultOptions, {
      classes: ["tidy5e", "dnd5e", "sheet", "actor", "npc"],
      width: 740,
      height: 720
    });
  }

  /* -------------------------------------------- */
  /*  Rendering                                   */
  /* -------------------------------------------- */

  /**
   * Get the correct HTML template path to use for rendering this particular sheet
   * @type {String}
   */
  get template() {
    if ( !game.user.isGM && this.actor.limited ) return "modules/tidy5e-sheet/templates/actors/npc/tidy5e-npc-ltd.html";
    return "modules/tidy5e-sheet/templates/actors/npc/tidy5e-npc.html";
  }

  /* -------------------------------------------- */

  /**
   * Organize Owned Items for rendering the NPC sheet
   * @private
   */
  _prepareItems(data) {


    // Categorize Items as Features and Spells
    const features = {
      passive: { label: game.i18n.localize("DND5E.Features"), items: [], dataset: {type: "feat"} },
      weapons: { label: game.i18n.localize("DND5E.AttackPl"), items: [] , hasActions: true, dataset: {type: "weapon", "weapon-type": "natural"} },
      actions: { label: game.i18n.localize("DND5E.ActionPl"), items: [] , hasActions: true, dataset: {type: "feat", "activation.type": "action"} },
      equipment: { label: game.i18n.localize("DND5E.Inventory"), items: [], dataset: {type: "loot"}}
    };

    // Start by classifying items into groups for rendering
    let [spells, other] = data.items.reduce((arr, item) => {
      item.img = item.img || DEFAULT_TOKEN;
      item.isStack = item.data.quantity ? item.data.quantity > 1 : false;
      item.hasUses = item.data.uses && (item.data.uses.max > 0);
      item.isOnCooldown = item.data.recharge && !!item.data.recharge.value && (item.data.recharge.charged === false);
      item.isDepleted = item.isOnCooldown && (item.data.uses.per && (item.data.uses.value > 0));
      item.hasTarget = !!item.data.target && !(["none",""].includes(item.data.target.type));
      if ( item.type === "spell" ) arr[0].push(item);
      else arr[1].push(item);
      return arr;
    }, [[], []]);

    // Apply item filters
    spells = this._filterItems(spells, this._filters.spellbook);
    other = this._filterItems(other, this._filters.features);

    // Organize Spellbook
    const spellbook = this._prepareSpellbook(data, spells);

    // Organize Features
    /*
    for ( let item of other ) {
      // if ( item.type === "weapon" ) features.weapons.items.push(item);
      // else 
      if ( item.type === "weapon" || item.type === "feat" ) {
        if ( item.data.activation.type ) features.actions.items.push(item);
        else features.passive.items.push(item);
      }
      else features.equipment.items.push(item);
    }
    */

    for ( let item of other ) {
      if ( item.type === "weapon" ) features.weapons.items.push(item);
      else if ( item.type === "feat" ) {
        if ( item.data.activation.type ) features.actions.items.push(item);
        else features.passive.items.push(item);
      }
      else features.equipment.items.push(item);
    }

    // Assign and return
    data.features = Object.values(features);
    data.spellbook = spellbook;
  }

  /* -------------------------------------------- */

  /**
   * Add some extra data when rendering the sheet to reduce the amount of logic required within the template.
   */
  getData() {
    const data = super.getData();

    // const environment = data.data.environment;

    // Challenge Rating
    const cr = parseFloat(data.data.details.cr || 0);
    const crLabels = {0: "0", 0.125: "1/8", 0.25: "1/4", 0.5: "1/2"};
    data.labels["cr"] = cr >= 1 ? String(cr) : crLabels[cr] || 1;
    
    Object.keys(data.data.abilities).forEach(id => {
      data.data.abilities[id].abbr = game.i18n.localize(`TIDY5E.${id}Ability`);
    });

    return data;
  }

  /* -------------------------------------------- */
  /*  Object Updates                              */
  /* -------------------------------------------- */

  /**
   * This method is called upon form submission after form data is validated
   * @param event {Event}       The initial triggering submission event
   * @param formData {Object}   The object of validated form data with which to update the object
   * @private
   */
  _updateObject(event, formData) {

    // Format NPC Challenge Rating
    const crs = {"1/8": 0.125, "1/4": 0.25, "1/2": 0.5};
    let crv = "data.details.cr";
    let cr = formData[crv];
    cr = crs[cr] || parseFloat(cr);
    if ( cr ) formData[crv] = cr < 1 ? cr : parseInt(cr);

    // Parent ActorSheet update steps
    super._updateObject(event, formData);
  }

  /* -------------------------------------------- */
  /*  Event Listeners and Handlers                */
  /* -------------------------------------------- */

  /**
   * Activate event listeners using the prepared sheet HTML
   * @param html {HTML}   The prepared HTML object ready to be rendered into the DOM
   */
	activateListeners(html) {
     super.activateListeners(html);

    // Modificator Ability Test Throw
     html.find('.ability-mod').click( async (event) => {
      event.preventDefault();
      let ability = event.currentTarget.parentElement.parentElement.dataset.ability;
      this.actor.rollAbilityTest(ability, {event: event});
    });

    // Modificator Ability Saving Throw
    html.find('.ability-save').click( async (event) => {
      event.preventDefault();
      let ability = event.currentTarget.parentElement.parentElement.dataset.ability;
      this.actor.rollAbilitySave(ability, {event: event});
    });

    // store Scroll Pos
    let attributesTab = html.find('.tab.attributes');
    attributesTab.scroll(function(){
      npcScrollPos = $(this).scrollTop();
    });
    let tabNav = html.find('a.item:not([data-tab="attributes"])');
    tabNav.click(function(){
      npcScrollPos = 0;
      attributesTab.scrollTop(npcScrollPos);
    });

    // Rollable Health Formula
    html.find(".health .rollable").click(this._onRollHealthFormula.bind(this));

    // set input fields via editable elements
    html.find('[contenteditable]').on('paste', function(e) {
      //strips elements added to the editable tag when pasting
      let $self = $(this);

      // set maxlength
      let maxlength = 40;
      if($self[0].dataset.maxlength){
        maxlength = parseInt($self[0].dataset.maxlength);
      }

      setTimeout(function() {
        let textString = $self.text();
        textString = textString.substring(0,maxlength);
        $self.html(textString);
      }, 0);

    }).on('keypress', function(e) {
      let $self = $(this);

      // set maxlength
      let maxlength = 40;
      if($self[0].dataset.maxlength){
        maxlength = parseInt($self[0].dataset.maxlength);
      }

      // only accept backspace, arrow keys and delete after maximum characters
      let keys = [8,37,38,39,40,46];

      if($(this).text().length === maxlength && keys.indexOf(e.keyCode) < 0) { 
        e.preventDefault();
      }

       if(e.keyCode===13){
        $(this).blur();
      }
    });

    html.find('[contenteditable]').blur(async (event) => {
      let value = event.target.textContent;
      let target = event.target.dataset.target;
      html.find('input[type="hidden"][data-input="'+target+'"]').val(value).submit();
    });

    // actor size menu
    html.find('.actor-size-select .size-label').on('click', function(){
      let currentSize = $(this).data('size');
      $(this).closest('ul').toggleClass('active').find('ul li[data-size="'+currentSize+'"]').addClass("current");
    });
    html.find('.actor-size-select .size-list li').on('click', async (event) => {
      let value = event.target.dataset.size;
      this.actor.update({"data.traits.size": value});
      html.find('.actor-size-select').toggleClass('active');
    });

    // toggle proficient skill visibility in the skill list
    html.find('.skills-list .toggle-proficient').click( async (event) => {
      let actor = this.actor;
      if(actor.getFlag('tidy5e-sheet', 'npcSkillsExpanded')){
        await actor.unsetFlag('tidy5e-sheet', 'npcSkillsExpanded');
      } else {
        await actor.setFlag('tidy5e-sheet', 'npcSkillsExpanded', true);
      }
    });

    // toggle empty traits visibility in the traits list
    html.find('.traits .toggle-traits').click( async (event) => {
      let actor = this.actor;
      if(actor.getFlag('tidy5e-sheet', 'npcTraitsExpanded')){
        await actor.unsetFlag('tidy5e-sheet', 'npcTraitsExpanded');
      } else {
        await actor.setFlag('tidy5e-sheet', 'npcTraitsExpanded', true);
      }
    });

    // toggle item delete protection
    html.find('.tidy5e-delete-toggle').click(async (event) => {
      event.preventDefault();
      let actor = this.actor;

      if(actor.getFlag('tidy5e-sheet', 'allow-delete')){
        await actor.unsetFlag('tidy5e-sheet', 'allow-delete');
      } else {
        await actor.setFlag('tidy5e-sheet', 'allow-delete', true);
      }
    });

    // toggle legacy speed display
    html.find('.legacy-switch').click(async (event) => {
      event.preventDefault();
      let actor = this.actor;

      if(actor.getFlag('tidy5e-sheet', 'legacy-speed')){
        await actor.unsetFlag('tidy5e-sheet', 'legacy-speed');
      } else {
        await actor.setFlag('tidy5e-sheet', 'legacy-speed', true);
      }
    });
    
    // changing item qty and charges values (removing if both value and max are 0)
    html.find('.item:not(.items-header) input').change(event => {
      let value = event.target.value;
      let actor = this.actor;
      let itemId = $(event.target).parents('.item')[0].dataset.itemId;
      let path = event.target.dataset.path;
      let data = {};
      data[path] = Number(event.target.value);
      actor.getOwnedItem(itemId).update(data);
    });

    // creating charges for the item
    html.find('.inventory-list .item .addCharges').click(event => {
      let actor = this.actor;
      let itemId = $(event.target).parents('.item')[0].dataset.itemId;
      let item = actor.getOwnedItem(itemId);

      item.data.uses = { value: 1, max: 1 };
      let data = {};
      data['data.uses.value'] = 1;
      data['data.uses.max'] = 1;

      actor.getOwnedItem(itemId).update(data);
    });

  }


  /* -------------------------------------------- */

  /**
   * Handle rolling NPC health values using the provided formula
   * @param {Event} event     The original click event
   * @private
   */
  _onRollHealthFormula(event) {
    event.preventDefault();
    const formula = this.actor.data.data.attributes.hp.formula;
    if ( !formula ) return;
    const hp = new Roll(formula).roll().total;
    AudioHelper.play({src: CONFIG.sounds.dice});
    this.actor.update({"data.attributes.hp.value": hp, "data.attributes.hp.max": hp});
  }

}

// restore scroll position
async  function restoreScrollPosition(app, html, data){
  html.find('.tab.attributes').scrollTop(npcScrollPos);
  // $('.tab.attributes').scrollTop(npcScrollPos);
}

// handle skills list display
async function toggleSkillList(app, html, data){
  html.find('.skills-list:not(.always-visible):not(.expanded) .skill:not(.proficient)').addClass('skill-hidden').hide();
  let visibleSkills = html.find('.skills-list .skill:not(.skill-hidden)');
  for (let i = 0; i < visibleSkills.length; i++) {
    if(i % 2 != 0){
      visibleSkills[i].classList.add('even');
    }
  }
}

// handle traits list display
async function toggleTraitsList(app, html, data){
  html.find('.traits:not(.always-visible):not(.expanded) .form-group.inactive').addClass('trait-hidden').hide();
  let visibleTraits = html.find('.traits .form-group:not(.trait-hidden)');
  for (let i = 0; i < visibleTraits.length; i++) {
    if(i % 2 != 0){
      visibleTraits[i].classList.add('even');
    }
  }
}

// toggle item icon
async function toggleItemMode(app, html, data){

  // let items = data.actor.items;
  // for (let item of items) {
  //   let attr = item.type === "spell" ? "preparation.prepared" : "equipped";
  //   let isActive = getProperty(item.data, attr);
  //   item.toggleClass = isActive ? "active" : "";
  //   if (item.type === "spell") {
  //     item.toggleTitle = game.i18n.localize(isActive ? "DND5E.SpellPrepared" : "DND5E.SpellUnprepared");
  //   } else {
  //     item.toggleTitle = game.i18n.localize(isActive ? "DND5E.Equipped" : "DND5E.Unequipped");
  //   }
    html.find('.item-toggle').click(ev => {
      ev.preventDefault();
      let itemId = ev.currentTarget.closest(".item").dataset.itemId;
      let item = app.actor.getOwnedItem(itemId);
      let attr = item.data.type === "spell" ? "data.preparation.prepared" : "data.equipped";
      return item.update({ [attr]: !getProperty(item.data, attr) });
    });
  // }
}

// Set Sheet Classes
async function setSheetClasses(app, html, data) {
  const {token} = app;
  if (game.settings.get("tidy5e-sheet", "useRoundNpcPortraits")) {
    html.find('.tidy5e-sheet.tidy5e-npc .profile').addClass('roundPortrait');
  }
  if (game.settings.get("tidy5e-sheet", "disableNpcHpOverlay")) {
    html.find('.tidy5e-sheet.tidy5e-npc .profile').addClass('disable-hp-overlay');
  }
  if (game.settings.get("tidy5e-sheet", "npcHpOverlayBorder") > 0) {
    html.find('.tidy5e-sheet.tidy5e-npc .profile .hp-overlay').css({'border-width':game.settings.get("tidy5e-sheet", "hpOverlayBorder")+'px'});
  }
  if (game.settings.get("tidy5e-sheet", "npcAlwaysShowTraits")) {
    html.find('.tidy5e-sheet.tidy5e-npc .traits').addClass('always-visible');
  }
  if (game.settings.get("tidy5e-sheet", "npcAlwaysShowSkills")) {
    html.find('.tidy5e-sheet.tidy5e-npc .skills-list').addClass('always-visible');
  }
  // not properly working right now
  if (token && token.data.actorLink && game.settings.get("tidy5e-sheet", "npcMarkLinked")) {
    html.find('.tidy5e-sheet.tidy5e-npc').addClass('linked');
  }
  if (token && !token.data.actorLink && game.settings.get("tidy5e-sheet", "npcMarkUnlinked")) {
    html.find('.tidy5e-sheet.tidy5e-npc').addClass('unlinked');
  }
  if (!token && game.settings.get("tidy5e-sheet", "npcMarkUnlinked")) {
    html.find('.tidy5e-sheet.tidy5e-npc').addClass('original');
  }
}

// Hide empty Spellbook
async function hideSpellbook(app, html, data) {
  let spellbook = html.find('.spellbook-header');

  if (spellbook.hasClass('spellbook-empty')){
    html.find('.spellbook-title').addClass('toggle-spellbook');
    html.find('.spellbook-title span').show();
    html.find('.spellbook-title + ol').hide();
    html.find('.spellcasting-ability').hide();

    $('.toggle-spellbook').on('click', function(){
      html.find('.spellbook-title').toggleClass('show');
      html.find('.spellbook-title + ol').toggle();
      html.find('.spellcasting-ability').toggle();
    });
  }
}

Actors.registerSheet("dnd5e", Tidy5eNPC, {
    types: ["npc"],
    makeDefault: true
});

Hooks.once("init", () => {
  preloadTidy5eHandlebarsTemplates();
});


Hooks.once("ready", () => {
  
  // can be removed when 0.7.x is stable
  if (window.BetterRolls) {
    window.BetterRolls.hooks.addActorSheet("Tidy5eNPC");
  }

  game.settings.register("tidy5e-sheet", "useRoundNpcPortraits", {
    name: `${game.i18n.localize("TIDY5E.Settings.NpcLabel")} ${game.i18n.localize("TIDY5E.Settings.UseRoundPortraits.name")}`,
    hint: game.i18n.localize("TIDY5E.Settings.UseRoundPortraits.hint"),
    scope: "world",
    config: true,
    default: false,
    type: Boolean
  });
  game.settings.register("tidy5e-sheet", "npcHpOverlayBorder", {
    name: `${game.i18n.localize("TIDY5E.Settings.NpcLabel")} ${game.i18n.localize("TIDY5E.Settings.HpOverlayBorder.name")}`,
    hint: game.i18n.localize("TIDY5E.Settings.HpOverlayBorder.hint"),
    scope: "world",
    config: true,
    default: 0,
    type: Number
  });
  game.settings.register("tidy5e-sheet", "disableNpcHpOverlay", {
    name: `${game.i18n.localize("TIDY5E.Settings.NpcLabel")} ${game.i18n.localize("TIDY5E.Settings.DisableHpOverlay.name")}`,
    hint: game.i18n.localize("TIDY5E.Settings.DisableHpOverlay.hint"),
    scope: "world",
    config: true,
    default: false,
    type: Boolean
  });
  game.settings.register("tidy5e-sheet", "npcAlwaysShowTraits", {
    name: `${game.i18n.localize("TIDY5E.Settings.NpcLabel")} ${game.i18n.localize("TIDY5E.Settings.AlwaysShowTraits.name")}`,
    hint: game.i18n.localize("TIDY5E.Settings.AlwaysShowTraits.hint"),
    scope: "world",
    config: true,
    default: false,
    type: Boolean
  });
  game.settings.register("tidy5e-sheet", "npcAlwaysShowSkills", {
    name: `${game.i18n.localize("TIDY5E.Settings.NpcLabel")} ${game.i18n.localize("TIDY5E.Settings.AlwaysShowSkills.name")}`,
    hint: game.i18n.localize("TIDY5E.Settings.AlwaysShowSkills.hint"),
    scope: "world",
    config: true,
    default: false,
    type: Boolean
  });
  game.settings.register("tidy5e-sheet", "npcMarkLinked", {
    name: `${game.i18n.localize("TIDY5E.Settings.NpcLabel")} ${game.i18n.localize("TIDY5E.Settings.MarkLinked.name")}`,
    hint: game.i18n.localize("TIDY5E.Settings.MarkLinked.hint"),
    scope: "world",
    config: true,
    default: false,
    type: Boolean
  });
  game.settings.register("tidy5e-sheet", "npcMarkUnlinked", {
    name: `${game.i18n.localize("TIDY5E.Settings.NpcLabel")} ${game.i18n.localize("TIDY5E.Settings.MarkUnlinked.name")}`,
    hint: game.i18n.localize("TIDY5E.Settings.MarkUnlinked.hint"),
    scope: "world",
    config: true,
    default: false,
    type: Boolean
  });

});

Hooks.on("renderTidy5eNPC", (app, html, data) => {
  setSheetClasses(app, html, data);
  toggleSkillList(app, html, data);
  toggleTraitsList(app, html, data);
  toggleItemMode(app, html, data);
  restoreScrollPosition(app, html, data);
  hideSpellbook(app, html, data);
  // console.log(data);
});