"use strict";
const Puzzle = {
  elementsGame: {
    main: null,
    playingField: null,
    chips: [],
  },

  properties: {
    value: "",
  },

  init() {
    // Create main elements
    this.elementsGame.main = document.createElement("div");
    this.elementsGame.playingField = document.createElement("div");

    // Setup main elements
    this.elementsGame.main.classList.add("main__container");
    this.elementsGame.playingField.classList.add("playing__field");
    this.elementsGame.playingField.appendChild(this.createChipsLayout());
    this.elementsGame.chips =
      this.elementsGame.playingField.querySelectorAll(".chip");

    // Add to DOM
    this.elementsGame.main.appendChild(this.elementsGame.playingField);
    document.body.appendChild(this.elementsGame.main);
  },

  //generate a random number from min to max+1
  randomInteger(min, max) {
    let rand = min + Math.random() * (max + 1 - min);
    return Math.floor(rand);
  },

  //create a solvable combination of chips
  createChipsLayout() {
    let fragment = document.createDocumentFragment();
    let chipsLayout = [];
    let valueChips;

    while (chipsLayout.length < 16) {
      valueChips = this.randomInteger(1, 16);

      if (chipsLayout.indexOf(valueChips) < 0) {
        chipsLayout.push(valueChips);
      }
    }

    //check the layout for solvability (https://ru.wikipedia.org/wiki/%D0%98%D0%B3%D1%80%D0%B0_%D0%B2_15)
    let numberStringEmptyChip;
    if (chipsLayout.indexOf(16) < 4) {
      numberStringEmptyChip = 1;
    } else if (chipsLayout.indexOf(16) > 3 && chipsLayout.indexOf(16) < 8) {
      numberStringEmptyChip = 2;
    } else if (chipsLayout.indexOf(16) > 7 && chipsLayout.indexOf(16) < 12) {
      numberStringEmptyChip = 3;
    } else {
      numberStringEmptyChip = 4;
    }

    let indexLastChip = chipsLayout.indexOf(16);
    let copyChipsLayout = chipsLayout.slice();
    copyChipsLayout.splice(indexLastChip, 1); //Deleted elem with value "16"

    let solvability = copyChipsLayout.reduce(
      (accumulate, elValue, indexValue, arr) => {
        for (let i = indexValue; i < arr.length; ++i) {
          if (elValue > arr[i]) {
            ++accumulate;
          }
        }
        return accumulate;
      },
      0
    );

    if ((solvability + numberStringEmptyChip) % 2 === 0) {
      console.log("решаемая");
      chipsLayout.forEach((chip) => {
        let chipElement = document.createElement("div");
        chipElement.classList.add("chip");
        chipElement.textContent = chip;
        //make the sixteenth chip empty
        if (chip == 16) {
          chipElement.classList.add("empty");
          chipElement.id = "empty";
        }
        fragment.appendChild(chipElement);
      });
    } else {
      console.log("нерешаемая");
      this.elementsGame.playingField.appendChild(this.createChipsLayout());
    }

    return fragment;
  },

  //assign dragged chips
  assignDraggedChips() {
    let emptyChip = document.getElementById("empty");
    let coordinatesEmptyChip = emptyChip.getBoundingClientRect();

    let leftDraggedChipX =
      coordinatesEmptyChip.left - coordinatesEmptyChip.width / 2;
    let leftDraggedChipY =
      coordinatesEmptyChip.top + coordinatesEmptyChip.height / 2;
    let leftDraggingChip = document.elementFromPoint(
      leftDraggedChipX,
      leftDraggedChipY
    );
    if (leftDraggingChip.className === "chip") {
      leftDraggingChip.classList.add("dragged");
    }

    let upperDraggedChipX =
      coordinatesEmptyChip.left + coordinatesEmptyChip.width / 2;
    let upperDraggedChipY =
      coordinatesEmptyChip.top - coordinatesEmptyChip.height / 2;
    let upperDraggingChip = document.elementFromPoint(
      upperDraggedChipX,
      upperDraggedChipY
    );
    if (upperDraggingChip.className === "chip") {
      upperDraggingChip.classList.add("dragged");
    }

    let rightDraggedChipX =
      coordinatesEmptyChip.left +
      coordinatesEmptyChip.width +
      coordinatesEmptyChip.width / 2;
    let rightDraggedChipY =
      coordinatesEmptyChip.top + coordinatesEmptyChip.height / 2;
    let rightDraggingChip = document.elementFromPoint(
      rightDraggedChipX,
      rightDraggedChipY
    );
    if (rightDraggingChip.className === "chip") {
      rightDraggingChip.classList.add("dragged");
    }

    let bottomDraggedChipX =
      coordinatesEmptyChip.left + coordinatesEmptyChip.width / 2;
    let bottomDraggedChipY =
      coordinatesEmptyChip.top +
      coordinatesEmptyChip.height +
      coordinatesEmptyChip.height / 2;
    let bottomDraggingChip = document.elementFromPoint(
      bottomDraggedChipX,
      bottomDraggedChipY
    );
    if (bottomDraggingChip.className === "chip") {
      bottomDraggingChip.classList.add("dragged");
    }
  },

  startPositionChips() {
    let chips = document.getElementsByClassName("chip");
    for (let i = chips.length - 1; i >= 0; i--) {
      let chip = chips[i];
      chip.style.left = chip.offsetLeft + "px";
      chip.style.top = chip.offsetTop + "px";
      chip.style.position = "absolute";
    }
  },

  moveChip(event) {
    event.preventDefault();
    let mouseDownCoordsX = event.pageX;
    let mouseDownCoordsY = event.pageY;
    let emptyChip = document.getElementById("empty");
    let emptyChipCoordsX = emptyChip.offsetLeft;
    let emptyChipCoordsY = emptyChip.offsetTop;
    let target = event.target;

    if (target.className == "chip dragged") {
      let draggedChip = target;
      let draggedChipCoordsX = draggedChip.offsetLeft;
      let draggedChipCoordsY = draggedChip.offsetTop;
      let shiftX = event.pageX - draggedChipCoordsX;
      let shiftY = event.pageY - draggedChipCoordsY;

      document.onmousemove = chipMouseMove;
      function chipMouseMove(event) {
        draggedChip.style.left = event.pageX - shiftX + "px";
        draggedChip.style.top = event.pageY - shiftY + "px";
        draggedChip.style.zIndex = 1000;
      }

      document.onmouseup = chipMouseUp;
      function chipMouseUp(event) {
        event.preventDefault();
        document.onmousemove = null;

        if (
          event.pageX > emptyChip.getBoundingClientRect().left &&
          event.pageX <
            emptyChip.getBoundingClientRect().left +
              emptyChip.getBoundingClientRect().width &&
          event.pageY > emptyChip.getBoundingClientRect().top &&
          event.pageY <
            emptyChip.getBoundingClientRect().top +
              emptyChip.getBoundingClientRect().height
        ) {
          console.log("Отпущен над пустой клеткой");
          // console.log(this.elementsGame.chips);
          emptyChip.style.left = draggedChipCoordsX + "px";
          emptyChip.style.top = draggedChipCoordsY + "px";
          draggedChip.style.left = emptyChipCoordsX + "px";
          draggedChip.style.top = emptyChipCoordsY + "px";

          let chips = document.getElementsByClassName("chip");
          for (let i = chips.length - 1; i >= 0; i--) {
            let chip = chips[i];
            if (chip.textContent != 16) {
              chip.className = "chip";
              draggedChip.style.zIndex = 0;
            }
          }
          Puzzle.assignDraggedChips();
        } else if (
          mouseDownCoordsX == event.pageX &&
          mouseDownCoordsY == event.pageY
        ) {
          console.log("перемещены по щелчку");
          emptyChip.style.left = draggedChipCoordsX + "px";
          emptyChip.style.top = draggedChipCoordsY + "px";
          draggedChip.style.left = emptyChipCoordsX + "px";
          draggedChip.style.top = emptyChipCoordsY + "px";

          let chips = document.getElementsByClassName("chip");
          for (let i = chips.length - 1; i >= 0; i--) {
            let chip = chips[i];
            if (chip.textContent != 16) {
              chip.className = "chip";
              draggedChip.style.zIndex = 0;
            }
          }
          Puzzle.assignDraggedChips();
        } else {
          console.log("Отпущен над своим местом");
          emptyChip.style.left = emptyChipCoordsX + "px";
          emptyChip.style.top = emptyChipCoordsY + "px";
          draggedChip.style.left = draggedChipCoordsX + "px";
          draggedChip.style.top = draggedChipCoordsY + "px";

          let chips = document.getElementsByClassName("chip");
          for (let i = chips.length - 1; i >= 0; i--) {
            let chip = chips[i];
            if (chip.textContent != 16) {
              draggedChip.style.zIndex = 0;
            }
          }
        }
      }
    }
  },
};

window.addEventListener("DOMContentLoaded", function () {
  Puzzle.init();
  Puzzle.assignDraggedChips();
  Puzzle.startPositionChips();
  document.addEventListener("mousedown", Puzzle.moveChip);
});
