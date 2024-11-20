const gridElement = document.getElementById("grid");
const scoreElement = document.getElementById("score");

let grid = [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
];

let health = 0; // Health counter for "D"
let spawnRNext = true; // Control spawning of "R" instead of "C"

// Initialize the game
function initGame() {
    addRandomTile(); // Add a random "C" or "R"
    spawnDTile();    // Place "D" in a random spot
    renderGrid();
}

// Add a random "C" or "R" tile
function addRandomTile() {
    const emptyCells = getEmptyCells();
    if (emptyCells.length > 0) {
        const [r, c] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        grid[r][c] = spawnRNext ? "R" : "C";
        spawnRNext = false; // Reset "R" spawning flag
    }
}

// Place the "D" tile
function spawnDTile() {
    const emptyCells = getEmptyCells();
    if (emptyCells.length > 0) {
        const [r, c] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        grid[r][c] = "D";
    }
}

// Get empty cells
function getEmptyCells() {
    const emptyCells = [];
    grid.forEach((row, r) => {
        row.forEach((value, c) => {
            if (value === 0) {
                emptyCells.push([r, c]);
            }
        });
    });
    return emptyCells;
}

// Render the grid in the DOM
function renderGrid() {
    gridElement.innerHTML = "";
    grid.forEach(row => {
        row.forEach(value => {
            const tile = document.createElement("div");
            tile.className = "tile";
            tile.setAttribute("data-value", value); // Tilføj data-value-attribut
            tile.textContent = value || ""; // Display value ("D", "R", "C", or empty)
            gridElement.appendChild(tile);
        });
    });
    scoreElement.textContent = `Health: ${health} | Reward: +${reward}`;
}
// Slide and merge a row
function slideAndMergeRow(row) {
    const newRow = row.filter(value => value !== 0);

    for (let i = 0; i < newRow.length - 1; i++) {
        if (newRow[i] === "D" && newRow[i + 1] === "R" || newRow[i] === "R" && newRow[i + 1] === "D") {
            newRow[i] = "D"; // Keep "D"
            newRow[i + 1] = 0; // Remove "R"
            health += reward; // Add current reward to health
            if (reward > 1) reward--; // Reduce reward for the next time
        } else if (newRow[i] === "D" && newRow[i + 1] === "C" || newRow[i] === "C" && newRow[i + 1] === "D") {
            newRow[i] = "D"; // Keep "D"
            newRow[i + 1] = 0; // Remove "C"
        } else if (newRow[i] === "R" && newRow[i + 1] === "C" || newRow[i] === "C" && newRow[i + 1] === "R") {
            newRow[i] = "R"; // Keep "R"
            newRow[i + 1] = 0; // Remove "C"
            spawnRNext = true; // Set flag to spawn "R" next time
        }
    }

    return newRow.filter(value => value !== 0).concat(Array(4 - newRow.filter(value => value !== 0).length).fill(0));
}

// Move tiles in a specified direction
function move(direction) {
    let moved = false;
    if (["ArrowUp", "ArrowDown"].includes(direction)) {
        for (let c = 0; c < 4; c++) {
            let column = grid.map(row => row[c]);
            if (direction === "ArrowDown") column.reverse();
            const newColumn = slideAndMergeRow(column);
            if (direction === "ArrowDown") newColumn.reverse();
            newColumn.forEach((value, r) => {
                if (grid[r][c] !== value) moved = true;
                grid[r][c] = value;
            });
        }
    } else if (["ArrowLeft", "ArrowRight"].includes(direction)) {
        grid.forEach((row, r) => {
            const original = [...row];
            if (direction === "ArrowRight") row.reverse();
            const newRow = slideAndMergeRow(row);
            if (direction === "ArrowRight") newRow.reverse();
            if (!original.every((val, idx) => val === newRow[idx])) moved = true;
            grid[r] = newRow;
        });
    }
    if (moved) {
        health--; // Træk 1 fra health for hvert træk
        addRandomTile();
        renderGrid();
        if (health <= 0) {
            alert(`Game Over! Your final score is ${health}.`);
        }
    }
}

// Check if the game is over
function isGameOver() {
    return !getEmptyCells().length; // Game over if no empty cells
}

// Listen for arrow key presses
document.addEventListener("keydown", event => {
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) {
        move(event.key);
    }
});

// Start the game
initGame();
