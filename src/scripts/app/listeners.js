import CONSTANTS from "./constants.js";
import Tidy5eActorHitPointsConfig from "./tidy5e-actor-hit-points-config.js";
import Tidy5eActorOriginSummaryConfig from "./tidy5e-actor-origin-summary-config.js";

export const tidy5eListeners = function (html, actor, app) {
	// set input fields via editable elements
	html.find("[contenteditable]")
		.on("paste", function (e) {
			//strips elements added to the editable tag when pasting
			let $self = $(this);

			// set maxlength
			let maxlength = 40;
			if ($self[0].dataset.maxlength) {
				maxlength = parseInt($self[0].dataset.maxlength);
			}

			setTimeout(function () {
				let textString = $self.text();
				textString = textString.substring(0, maxlength);
				$self.html(textString);
			}, 0);
		})
		.on("keypress", function (e) {
			let $self = $(this);

			// set maxlength
			let maxlength = 40;
			if ($self[0].dataset.maxlength) {
				maxlength = parseInt($self[0].dataset.maxlength);
			}

			// only accept backspace, arrow keys and delete after maximum characters
			let keys = [8, 37, 38, 39, 40, 46];

			if ($(this).text().length === maxlength && keys.indexOf(e.keyCode) < 0) {
				e.preventDefault();
			}

			if (e.keyCode === 13) {
				$(this).blur();
			}
		});

	html.find("[contenteditable]").blur(async (event) => {
		let value = event.target.textContent;
		let target = event.target.dataset.target;
		html.find('input[type="hidden"][data-input="' + target + '"]')
			.val(value)
			.submit();
	});

	// actor size menu
	html.find(".actor-size-select .size-label").on("click", function () {
		let currentSize = $(this).data("size");
		$(this)
			.closest("ul")
			.toggleClass("active")
			.find('ul li[data-size="' + currentSize + '"]')
			.addClass("current");
	});
	html.find(".actor-size-select .size-list li").on("click", async (event) => {
		let value = event.target.dataset.size;
		actor.update({ "data.traits.size": value });
		html.find(".actor-size-select").toggleClass("active");
	});

	// Modificator Ability Test Throw
	html.find(".ability-mod.rollable").click(async (event) => {
		event.preventDefault();
		let ability = event.currentTarget.parentElement.parentElement.dataset.ability;
		actor.rollAbilityTest(ability, { event: event });
	});

	// Modificator Ability Saving Throw
	html.find(".ability-save.rollable").click(async (event) => {
		event.preventDefault();
		let ability = event.currentTarget.parentElement.parentElement.dataset.ability;
		actor.rollAbilitySave(ability, { event: event });
	});

	// toggle item edit protection
	html.find(".toggle-allow-edit span").click(async (event) => {
		event.preventDefault();

		if (actor.getFlag(CONSTANTS.MODULE_ID, "allow-edit")) {
			await actor.unsetFlag(CONSTANTS.MODULE_ID, "allow-edit");
		} else {
			await actor.setFlag(CONSTANTS.MODULE_ID, "allow-edit", true);
		}
	});

	// html.on("click", "[data-action='delete']", app._onItemDelete.bind(app));
	// html.on("click", "[data-action='duplicate']", app._onItemDuplicate.bind(app));
	html.on("click", "[data-action='itemDuplicate']", app._onItemDuplicate.bind(app));

	html.find(".hit-points-tidy").click(() => {
		let app = new Tidy5eActorHitPointsConfig(actor);
		app?.render(true);
	});

	html.find(".origin-summary-tidy").click(() => {
		let app = new Tidy5eActorOriginSummaryConfig(actor);
		app?.render(true);
	});
};
