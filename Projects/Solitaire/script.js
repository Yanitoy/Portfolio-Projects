// ====== CONFIG ======
const SUITS = ["♠", "♥", "♦", "♣"];
const RANKS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
const TABLEAU_COLUMNS = 7;

let stock = [];
let waste = [];
let foundations = [[], [], [], []]; // 4 suit piles
let tableau = [[], [], [], [], [], [], []];

let selected = null; // { type, pileIndex, cardIndex? }
let dragMeta = null; // current drag metadata
let statusTextEl;
let stockEl, wasteEl, foundationEls, tableauEls;

// ====== INIT DOM REFERENCES ======
window.addEventListener("DOMContentLoaded", () => {
  stockEl = document.getElementById("stock");
  wasteEl = document.getElementById("waste");
  foundationEls = Array.from(document.querySelectorAll(".foundation"));
  tableauEls = Array.from(document.querySelectorAll(".tableau"));
  statusTextEl = document.getElementById("status-text");

  document.getElementById("new-game-btn").addEventListener("click", newGame);
  stockEl.addEventListener("click", onStockClick);
  enableDropTargets();

  newGame();
});

// ====== GAME SETUP ======
function newGame() {
  // Clear state
  stock = [];
  waste = [];
  foundations = [[], [], [], []];
  tableau = [[], [], [], [], [], [], []];
  selected = null;
  statusTextEl.textContent = "";

  // Create & shuffle deck
  const deck = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({
        suit,
        rank,
        faceUp: false,
      });
    }
  }
  shuffle(deck);

  // Deal to tableau (Klondike)
  for (let col = 0; col < TABLEAU_COLUMNS; col++) {
    for (let i = 0; i <= col; i++) {
      const card = deck.pop();
      // Last card in column should be face up
      card.faceUp = i === col;
      tableau[col].push(card);
    }
  }

  // Remaining cards to stock
  stock = deck; // all face-down

  renderAll();
}

// Fisher-Yates shuffle
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

// ====== RENDERING ======
function renderAll() {
  renderStock();
  renderWaste();
  renderFoundations();
  renderTableau();
  updateStatus();
}

function renderStock() {
  stockEl.innerHTML = "";
  if (stock.length === 0) {
    stockEl.classList.add("empty");
  } else {
    stockEl.classList.remove("empty");
    const topCard = createCardElement({ faceDown: true });
    stockEl.appendChild(topCard);
  }
}

function renderWaste() {
  wasteEl.innerHTML = "";
  if (waste.length === 0) {
    wasteEl.classList.add("empty");
    return;
  }
  wasteEl.classList.remove("empty");

  const topCard = waste[waste.length - 1];
  const cardEl = createCardElement(topCard, {
    type: "waste",
    pileIndex: 0,
    cardIndex: waste.length - 1,
  });
  cardEl.style.top = "0px";
  wasteEl.appendChild(cardEl);
}

function renderFoundations() {
  foundations.forEach((pile, idx) => {
    const pileEl = foundationEls[idx];
    pileEl.innerHTML = "";

    if (pile.length === 0) return;

    const topCard = pile[pile.length - 1];
    const cardEl = createCardElement(topCard, {
      type: "foundation",
      pileIndex: idx,
      cardIndex: pile.length - 1,
    });
    cardEl.style.top = "0px";
    pileEl.appendChild(cardEl);
  });
}

function renderTableau() {
  tableau.forEach((column, colIndex) => {
    const pileEl = tableauEls[colIndex];
    pileEl.innerHTML = "";

    if (column.length === 0) {
      pileEl.classList.add("empty");
    } else {
      pileEl.classList.remove("empty");
    }

    column.forEach((card, cardIndex) => {
      const cardEl = createCardElement(card, {
        type: "tableau",
        pileIndex: colIndex,
        cardIndex,
      });
      const offset = cardIndex * 26; // vertical stack spacing
      cardEl.style.top = offset + "px";

      // Highlight if part of selected stack
      if (selected && selected.type === "tableau" &&
          selected.pileIndex === colIndex &&
          cardIndex >= selected.cardIndex) {
        cardEl.classList.add("selected");
      }

      pileEl.appendChild(cardEl);
    });
  });
}

function createCardElement(cardOrNull, meta) {
  const cardEl = document.createElement("div");
  cardEl.classList.add("card");

  if (cardOrNull.faceDown || cardOrNull.faceDown === true) {
    cardEl.classList.add("face-down");
    return cardEl;
  }

  const { suit, rank } = cardOrNull;
  const redSuit = suit === "♥" || suit === "♦";
  cardEl.classList.add(redSuit ? "red" : "black");

  const valueTop = document.createElement("div");
  valueTop.classList.add("card-value-top");
  valueTop.textContent = formatRank(rank) + suit;

  const suitCenter = document.createElement("div");
  suitCenter.classList.add("card-suit-center");
  suitCenter.textContent = suit;

  const valueBottom = document.createElement("div");
  valueBottom.classList.add("card-value-bottom");
  valueBottom.textContent = formatRank(rank) + suit;

  cardEl.appendChild(valueTop);
  cardEl.appendChild(suitCenter);
  cardEl.appendChild(valueBottom);

  if (meta) {
    cardEl.dataset.type = meta.type;
    cardEl.dataset.pileIndex = meta.pileIndex;
    cardEl.dataset.cardIndex = meta.cardIndex;
    cardEl.addEventListener("click", onCardClick);
    if (!cardOrNull.faceDown) {
      cardEl.draggable = true;
      cardEl.addEventListener("dragstart", onCardDragStart);
      cardEl.addEventListener("dragend", onCardDragEnd);
    }
  }

  return cardEl;
}

// ====== DRAG & DROP ======
function enableDropTargets() {
  tableauEls.forEach((el, idx) => {
    el.addEventListener("dragover", (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
    });
    el.addEventListener("drop", (e) => {
      e.preventDefault();
      const meta = parseMetaFromTransfer(e);
      if (!meta) return;
      selected = meta;
      removeDraggingHighlight();
      tryMoveSelectedToTableau(idx);
    });
  });

  foundationEls.forEach((el, idx) => {
    el.addEventListener("dragover", (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
    });
    el.addEventListener("drop", (e) => {
      e.preventDefault();
      const meta = parseMetaFromTransfer(e);
      if (!meta) return;
      selected = meta;
      removeDraggingHighlight();
      tryMoveSelectedToFoundation(idx);
    });
  });
}

function onCardDragStart(e) {
  const meta = getMetaFromElement(e.currentTarget);
  if (!meta) {
    e.preventDefault();
    return;
  }
  const card = resolveCardFromMeta(meta);
  if (!card || card.faceDown) {
    e.preventDefault();
    return;
  }

  selected = meta;
  dragMeta = meta;
  addDraggingHighlight(meta);

  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", JSON.stringify(meta));
  }
}

function onCardDragEnd() {
  dragMeta = null;
  removeDraggingHighlight();
  clearSelection();
  renderAll();
}

function getMetaFromElement(el) {
  const type = el.dataset.type;
  if (!type) return null;
  return {
    type,
    pileIndex: Number(el.dataset.pileIndex),
    cardIndex: Number(el.dataset.cardIndex),
  };
}

function parseMetaFromTransfer(e) {
  if (!e.dataTransfer) return null;
  const text = e.dataTransfer.getData("text/plain");
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function addDraggingHighlight(meta) {
  removeDraggingHighlight();
  if (meta.type === "tableau") {
    const pileEl = tableauEls[meta.pileIndex];
    pileEl
      .querySelectorAll(".card")
      .forEach((cardEl) => {
        const idx = Number(cardEl.dataset.cardIndex);
        if (idx >= meta.cardIndex) {
          cardEl.classList.add("dragging");
        }
      });
  } else {
    document
      .querySelectorAll(
        `.card[data-type="${meta.type}"][data-pile-index="${meta.pileIndex}"]`
      )
      .forEach((cardEl) => cardEl.classList.add("dragging"));
  }
}

function removeDraggingHighlight() {
  document
    .querySelectorAll(".card.dragging")
    .forEach((el) => el.classList.remove("dragging"));
}

function resolveCardFromMeta(meta) {
  if (meta.type === "waste") {
    return waste[waste.length - 1];
  }
  if (meta.type === "foundation") {
    const pile = foundations[meta.pileIndex];
    return pile[pile.length - 1];
  }
  if (meta.type === "tableau") {
    const col = tableau[meta.pileIndex];
    return col[meta.cardIndex];
  }
  return null;
}

function formatRank(rank) {
  if (rank === 1) return "A";
  if (rank === 11) return "J";
  if (rank === 12) return "Q";
  if (rank === 13) return "K";
  return String(rank);
}

// ====== CLICK HANDLERS ======
function onStockClick() {
  // If stock has cards, flip one to waste
  if (stock.length > 0) {
    const card = stock.pop();
    card.faceUp = true;
    waste.push(card);
  } else {
    // Recycle waste back into stock
    if (waste.length > 0) {
      stock = waste.reverse().map((c) => ({ ...c, faceUp: false }));
      waste = [];
    }
  }
  clearSelection();
  renderAll();
}

function onCardClick(e) {
  e.stopPropagation();
  const cardEl = e.currentTarget;
  const type = cardEl.dataset.type;
  const pileIndex = parseInt(cardEl.dataset.pileIndex, 10);
  const cardIndex = parseInt(cardEl.dataset.cardIndex, 10);

  if (type === "tableau") {
    handleTableauCardClick(pileIndex, cardIndex);
  } else if (type === "waste") {
    handleWasteCardClick();
  } else if (type === "foundation") {
    handleFoundationCardClick(pileIndex);
  }
}

// Clicking in tableau
function handleTableauCardClick(colIndex, cardIndex) {
  const column = tableau[colIndex];
  const card = column[cardIndex];
  if (!card.faceUp) {
    // Can't select a face-down card
    clearSelection();
    renderAll();
    return;
  }

  if (!selected) {
    // Select this card and everything under it
    selected = {
      type: "tableau",
      pileIndex: colIndex,
      cardIndex,
    };
    renderAll();
  } else {
    // Try moving selected stack to this column (destination)
    if (selected.type === "tableau" &&
        selected.pileIndex === colIndex &&
        selected.cardIndex === cardIndex) {
      // Clicking the same card again: deselect
      clearSelection();
      renderAll();
      return;
    }
    tryMoveSelectedToTableau(colIndex);
  }
}

// Clicking waste always selects top card
function handleWasteCardClick() {
  if (waste.length === 0) return;

  if (!selected || selected.type !== "waste") {
    selected = {
      type: "waste",
      pileIndex: 0,
      cardIndex: waste.length - 1,
    };
    renderAll();
  } else {
    // If already selected waste and click again, try to auto send to foundation
    if (tryMoveSelectedToFoundationAny()) {
      return;
    }
    clearSelection();
    renderAll();
  }
}

// Clicking foundation: either select top card or move selected onto foundation
function handleFoundationCardClick(fIndex) {
  if (!selected) {
    const pile = foundations[fIndex];
    if (pile.length === 0) return;
    // Allow moving from foundation back to tableau
    selected = {
      type: "foundation",
      pileIndex: fIndex,
      cardIndex: pile.length - 1,
    };
    renderAll();
  } else {
    tryMoveSelectedToFoundation(fIndex);
  }
}

// Clicking empty tableau areas
tableauEls.forEach((el, idx) => {
  el.addEventListener("click", () => {
    if (!selected) return;
    tryMoveSelectedToTableau(idx);
  });
});

// Clicking foundation background
foundationEls.forEach((el, idx) => {
  el.addEventListener("click", () => {
    if (!selected) return;
    tryMoveSelectedToFoundation(idx);
  });
});

// ====== MOVE LOGIC ======
function tryMoveSelectedToTableau(destIndex) {
  if (!selected) return;
  const destColumn = tableau[destIndex];
  const destTop = destColumn[destColumn.length - 1];

  const movingCards = getSelectedCards();
  const firstMoving = movingCards[0];

  // Tableau rules:
  // - Empty column: only King (rank 13) can be placed as first
  // - Otherwise: card must be 1 rank lower & opposite color from destTop
  if (destColumn.length === 0) {
    if (firstMoving.rank !== 13) {
      // must be King
      clearSelection();
      renderAll();
      return;
    }
  } else {
    if (!canPlaceOnTableau(firstMoving, destTop)) {
      clearSelection();
      renderAll();
      return;
    }
  }

  // Perform the move
  removeSelectedCards();
  destColumn.push(...movingCards);

  // If we moved from tableau, flip new top card if face down
  if (selected.type === "tableau") {
    const srcCol = tableau[selected.pileIndex];
    const newTop = srcCol[srcCol.length - 1];
    if (newTop && !newTop.faceUp) {
      newTop.faceUp = true;
    }
  }

  clearSelection();
  renderAll();
  checkWin();
}

function tryMoveSelectedToFoundation(fIndex) {
  if (!selected) return;

  const pile = foundations[fIndex];
  const movingCards = getSelectedCards();
  if (movingCards.length > 1) {
    // only single card allowed to foundation
    clearSelection();
    renderAll();
    return;
  }

  const card = movingCards[0];
  if (!canPlaceOnFoundation(card, pile)) {
    clearSelection();
    renderAll();
    return;
  }

  // Perform move
  removeSelectedCards();
  pile.push(card);

  // If from tableau, flip new top
  if (selected.type === "tableau") {
    const srcCol = tableau[selected.pileIndex];
    const newTop = srcCol[srcCol.length - 1];
    if (newTop && !newTop.faceUp) {
      newTop.faceUp = true;
    }
  }

  clearSelection();
  renderAll();
  checkWin();
}

// From waste auto-foundation helper
function tryMoveSelectedToFoundationAny() {
  if (!selected) return false;
  const moving = getSelectedCards();
  if (moving.length !== 1) return false;
  const card = moving[0];

  for (let i = 0; i < 4; i++) {
    if (canPlaceOnFoundation(card, foundations[i])) {
      removeSelectedCards();
      foundations[i].push(card);
      clearSelection();
      renderAll();
      checkWin();
      return true;
    }
  }
  return false;
}

function getSelectedCards() {
  if (!selected) return [];

  if (selected.type === "waste") {
    return [waste[waste.length - 1]];
  }
  if (selected.type === "foundation") {
    const pile = foundations[selected.pileIndex];
    return [pile[pile.length - 1]];
  }
  if (selected.type === "tableau") {
    const col = tableau[selected.pileIndex];
    return col.slice(selected.cardIndex);
  }
  return [];
}

function removeSelectedCards() {
  if (!selected) return;

  if (selected.type === "waste") {
    waste.pop();
  } else if (selected.type === "foundation") {
    const pile = foundations[selected.pileIndex];
    pile.pop();
  } else if (selected.type === "tableau") {
    const col = tableau[selected.pileIndex];
    col.splice(selected.cardIndex);
  }
}

function clearSelection() {
  selected = null;
}

// ====== RULE HELPERS ======
function isRedCard(card) {
  return card.suit === "♥" || card.suit === "♦";
}

function canPlaceOnTableau(moving, destTop) {
  // Must be opposite color & rank exactly 1 less than destTop
  if (isRedCard(moving) === isRedCard(destTop)) return false;
  if (moving.rank !== destTop.rank - 1) return false;
  return true;
}

function canPlaceOnFoundation(card, pile) {
  if (pile.length === 0) {
    return card.rank === 1; // must be Ace
  }
  const top = pile[pile.length - 1];
  if (card.suit !== top.suit) return false;
  if (card.rank !== top.rank + 1) return false;
  return true;
}

// ====== STATUS / WIN ======
function updateStatus() {
  const totalOnFoundations = foundations.reduce(
    (sum, pile) => sum + pile.length,
    0
  );
  statusTextEl.textContent = `Cards on Foundations: ${totalOnFoundations} / 52`;
}

function checkWin() {
  const totalOnFoundations = foundations.reduce(
    (sum, pile) => sum + pile.length,
    0
  );
  if (totalOnFoundations === 52) {
    statusTextEl.textContent = "🎉 You won! All cards on foundations!";
  }
}
