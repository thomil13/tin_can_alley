// Three Classes Needed

// 1 - Model (Game Logic)

class Model {
    constructor() {
        // 8x8 board (rows 0-7 and cols 0-7)
        this.boardSize = 8;
        this.numShips = 3;
        this.shipLength = 3;
        this.shipsSunk = 0;
        this.ships = Array.from({ length: this.numShips }, () => ({
            locations: Array(this.shipLength).fill(0),
            hits: Array(this.shipLength).fill(""),
        }));
    }

    fire(guess) {
        for (const ship of this.ships) {
            const index = ship.locations.indexOf(guess);
            if (ship.hits[index] === "hit") {
                View.displayMessage("Repeat hit on known target");
                return true;
            } else if (index >= 0) {
                ship.hits[index] = "hit";
                View.displayHit(guess);
                View.displayMessage("Confirmed hit on hostile target");

                if (this.isSunk(ship)) {
                    View.displayMessage("Hostile target confirmed sunk!");
                    this.shipsSunk++;
                }

                return true;
            }
        }
        View.displayMiss(guess);
        View.displayMessage("Negative hit!");
        return false;
    }

    isSunk(ship) {
        return ship.hits.every((hit) => hit === "hit");
    }

    generateShipLocations() {
        for (let i = 0; i < this.numShips; i++) {
            let locations;
            do {
                locations = this.generateShip();
            } while (this.collision(locations));
            this.ships[i].locations = locations;
        }
        console.log("Ships array:", this.ships);
    }

    generateShip() {
        const direction = Math.random() < 0.5;
        const row = direction
            ? Math.floor(Math.random() * this.boardSize)
            : Math.floor(
                  Math.random() * (this.boardSize - this.shipLength + 1)
              );

        const col = direction
            ? Math.floor(Math.random() * (this.boardSize - this.shipLength + 1))
            : Math.floor(Math.random() * this.boardSize);

        return Array.from({ length: this.shipLength }, (_, i) =>
            direction ? `${row}${col + i}` : `${row + i}${col}`
        );
    }

    collision(locations) {
        return this.ships.some((ship) =>
            ship.locations.some((location) => locations.includes(location))
        );
    }
}

// 2 - View (UI Messages)

class View {
    static displayMessage(msg) {
        const messageArea = document.getElementById("messageArea");
        messageArea.innerText = msg;
    }

    static displayHit(location) {
        const cell = document.getElementById(location);
        if (cell) cell.classList.add("hit");
    }

    static displayMiss(location) {
        const cell = document.getElementById(location);
        if (cell) cell.classList.add("miss");
    }
}

// 3 - Controller (Inputs and Game Management)

class Controller {
    constructor() {
        this.guesses = 0;
    }

    processGuess(guess) {
        const location = parseGuess(guess);
        if (location) {
            this.guesses++;
            const hit = model.fire(location);
            if (hit && model.shipsSunk === model.numShips) {
                View.displayMessage(
                    `You sank all my ships, in ${this.guesses} guesses!`
                );
            }
        }
    }
}

// Helper Functions & Event Handlers

function parseGuess(guess) {
    // these represent rows on the game board (A-H)
    const alphabet = ["A", "B", "C", "D", "E", "F", "G", "H"];
    if (!guess || guess.length !== 2) {
        alert("You must enter a letter and a number on the board!");
        return null;
    }

    const row = alphabet.indexOf(guess.charAt(0).toUpperCase());
    const column = Number(guess.charAt(1));

    if (row === -1 || isNaN(column)) {
        alert("Nope, that is not on the board!");
    } else if (
        row < 0 ||
        row >= model.boardSize ||
        column < 0 ||
        column >= model.boardSize
    ) {
        alert("That is not on the board!");
    } else {
        return `${row}${column}`;
    }
    return null;
}

function handleFireButton() {
    const guessInput = document.getElementById("guessInput");
    const guess = guessInput.value.toUpperCase();
    controller.processGuess(guess);
    guessInput.value = "";
}

function handleKeyPress(e) {
    if (e.key === "Enter") {
        document.getElementById("fireButton").click();
        return false;
    }
}

// Convert a cell id like "23" to a guess like "C3"
function idToGuess(id) {
    const alphabet = ["A", "B", "C", "D", "E", "F", "G", "H"];
    if (!id || id.length !== 2) return null;
    const row = Number(id.charAt(0));
    const col = Number(id.charAt(1));
    if (isNaN(row) || isNaN(col)) return null;
    if (row < 0 || row >= alphabet.length || col < 0 || col >= model.boardSize) return null;
    return `${alphabet[row]}${col}`;
}

function handleCellClick(e) {
    const target = e.currentTarget;
    if (!target || !target.id) return;
    const guess = idToGuess(target.id);
    if (guess) {
        // reuse controller logic so guesses count and parse/validation are consistent
        controller.processGuess(guess);
    }
}

// Init Function
function init() {
    const fireButton = document.getElementById("fireButton");
    const guessInput = document.getElementById("guessInput");
    if (fireButton) fireButton.addEventListener("click", handleFireButton);
    if (guessInput) guessInput.addEventListener("keypress", handleKeyPress);
    model.generateShipLocations();

    // Add click handlers to each battlefield cell so players can click to fire
    const cells = document.querySelectorAll("#battlefield table td[id]");
    cells.forEach((cell) => {
        // give a visual affordance that the cells are clickable
        cell.style.cursor = "pointer";
        cell.addEventListener("click", handleCellClick);
    });
}

const model = new Model();
const controller = new Controller();

// Wait for DOMContentLoaded to be sure elements exist
document.addEventListener("DOMContentLoaded", init);
