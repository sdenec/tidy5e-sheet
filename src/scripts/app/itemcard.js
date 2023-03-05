import CONSTANTS from "./constants.js";
import { debug } from "./logger-util.js";

export const tidy5eItemCard = function (html, actor) {
	// show/hide grid layout item info card on mouse enter/leave

	let itemCardsForAllItems = game.settings.get(CONSTANTS.MODULE_ID, "itemCardsForAllItems");

	let containerTrigger = itemCardsForAllItems
		? html.find(".inventory-list:not(.character-actions-dnd5e)")
		: html.find(".grid-layout .inventory-list");
	let cardTrigger = itemCardsForAllItems
		? html.find(".inventory-list:not(.character-actions-dnd5e) .item-list .item")
		: html.find(".grid-layout .item-list .item");

	let infoContainer = html.find("#item-info-container"),
		infoContainerContent = html.find("#item-info-container-content");

	let timer;
	let itemCardDelay = game.settings.get(CONSTANTS.MODULE_ID, "itemCardsDelay");
	if (!itemCardDelay || itemCardDelay == 0) itemCardDelay = false;

	let mouseOverItem = false;
	let itemCardIsFixed = false;
	let itemCardFixKey = game.settings.get(CONSTANTS.MODULE_ID, "itemCardsFixKey") || "x";

	let itemCardsAreFloating = game.settings.get(CONSTANTS.MODULE_ID, "itemCardsAreFloating");

	let sheet, sheetWidth, sheetHeight, sheetBorderRight, sheetBorderBottom;

	if (itemCardsAreFloating) {
		infoContainer.addClass("floating");

		setTimeout(function () {
			getBounds();
		}, 500);

		containerTrigger.each(function (i, el) {
			el.addEventListener("mousemove", setCardPosition);
		});
	}

	function getBounds() {
		sheet = $(".tidy5e.sheet.actor");
		if (sheet.length < 1) {
			// PoPOut "hack"
			sheet = $(html);
			sheetWidth = $(sheet[0]).width();
			sheetHeight = $(sheet[0]).height();
			sheetBorderRight = sheetWidth;
			sheetBorderBottom = sheetHeight;
		} else {
			sheetWidth = sheet.width();
			sheetHeight = sheet.height();
			sheetBorderRight = sheet.offset().left + sheetWidth;
			sheetBorderBottom = sheet.offset().top + sheetHeight;
		}
	}

	function setCardPosition(ev) {
		if (!itemCardIsFixed && mouseOverItem) {
			let card = html.find("#item-info-container.floating");
			if (card.length == 0) return;
			let mousePos = { x: ev.clientX, y: ev.clientY };
			// card height = 460px -> 1/2 = 230px
			let topPos = `${mousePos.y - 230}px`;
			let leftPos = `${mousePos.x + 24}px`;

			// wenn maus weniger als 280px zum rechten sheet-rand card auf linker seite
			// wenn maus weniger als card/2 nach unten/oben card in gegenrichtung verschieben.
			if (mousePos.x + 304 > sheetBorderRight) {
				leftPos = `${mousePos.x - 304}px`;
			}

			if (mousePos.y + 230 > sheetBorderBottom) {
				let diff = sheetBorderBottom - (mousePos.y + 230);
				topPos = `${mousePos.y - 230 + diff}px`;
			}

			card.css({
				top: topPos,
				left: leftPos
			});
		}
	}

	$(document).on("keydown", function (e) {
		if (e.key === itemCardFixKey) {
			itemCardIsFixed = true;
		}
	});

	$(document).on("keyup", function (e) {
		if (e.key === itemCardFixKey) {
			itemCardIsFixed = false;
			if (!itemCardDelay) removeCard();
			infoContainer.removeClass("open");
		}
	});

	let itemCardDelayCard = async (event) => {
		debug(`tidy5e-itemcard | itemCardDelayCard | itemCardDelaying card: ${itemCardDelay} ms`);
		timer = setTimeout(async function () {
			if (!itemCardIsFixed) {
				removeCard();
				await showCard(event);
				infoContainer.addClass("open");
			}
		}, itemCardDelay);
	};

	let resetDelay = () => {
		clearTimeout(timer);
		if (!itemCardIsFixed) infoContainer.removeClass("open");
	};

	cardTrigger.mouseenter(function (event) {
		if (!itemCardIsFixed) {
			if (!itemCardDelay) infoContainer.addClass("open");
		}
	});

	cardTrigger.mouseleave(function (event) {
		if (!itemCardIsFixed) {
			if (!itemCardDelay) hideContainer();
		}
	});

	cardTrigger.mouseenter(async (event) => {
		mouseOverItem = true;
		if (!itemCardIsFixed) {
			if (itemCardDelay) itemCardDelayCard(event);
			else showCard(event);
		}
	});

	cardTrigger.mouseleave(function (event) {
		mouseOverItem = false;
		if (!itemCardIsFixed) {
			if (!itemCardDelay) removeCard();
			else resetDelay();
		}
	});

	let item = html.find(".item");
	item.each(function () {
		this.addEventListener("mousedown", function (event) {
			// removeCard();
			switch (event.which) {
				case 3:
					// right click opens context menu
					event.preventDefault();
					mouseOverItem = false;
					hideContainer();
					break;
			}
		});

		this.addEventListener("dragstart", function () {
			// removeCard();
			mouseOverItem = false;
			hideContainer();
		});
	});

	async function showCard(event) {
		getBounds();
		event.preventDefault();
		let li = $(event.currentTarget).closest(".item");
		if (!actor.items || actor.items?.length <= 0 || !li.data("item-id")) {
			return;
		}
		let item = actor.items.get(li.data("item-id"));
		if (!item) {
			warn(
				`tidy5e-context-menu | showCard | no item found on actor '${actor.name}' with id '${li.data(
					"item-id"
				)}'`
			);
			return;
		}
		let chatData = await item.getChatData({ secrets: actor.isOwner });
		let itemDescription = chatData.description.value;

		let infoCard = li.find(".info-card");

		infoCard.clone().appendTo(infoContainerContent);

		let infoBackground = infoContainer.find(".item-info-container-background");
		let infoDescription = infoContainerContent.find(".info-card-description");
		let props = $(`<div class="item-properties"></div>`);

		infoDescription.html(itemDescription);

		chatData.properties.forEach((p) => props.append(`<span class="tag">${p}</span>`));
		infoContainerContent.find(".info-card .description-wrap").after(props);

		infoBackground.hide();

		let innerScrollHeight = infoDescription[0].scrollHeight;

		if (innerScrollHeight > infoDescription.height()) {
			infoDescription.addClass("overflowing");
		}
	}

	function removeCard() {
		html.find(".item-info-container-background").show();
		infoContainerContent.find(".info-card").remove();
	}

	function hideContainer() {
		infoContainer.removeClass("open");
	}

	$("#item-info-container").on("click", ".button", function (e) {
		e.preventDefault();
		let itemId = $(this).closest(".info-card").attr("data-item-id");
		let action = $(this).attr("data-action");
		$(`.tidy5e-sheet .item[data-item-id='${itemId}'] .item-buttons .button[data-action='${action}']`).trigger(e);
	});
};
