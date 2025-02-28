const gridElement = document.getElementById("grid");
const scoreElement = document.getElementById("score");

let grid = [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
];

let health = 5; // Health counter for "D"
let spawnRNext = true; // Control spawning of "R" instead of "C"
let score = 0;

// Initialize the game
function initGame() {
    grid = [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ];
    health = 5;
    spawnRNext = true;
    score = 0;
    addRandomTile(); // Add a random "C" or "R"
    addRandomTile(); // Add a random "C" or "R"
    spawnDTile();    // Place "D" in a random spot
    renderGrid();
}

// Add a random "C" or "R" tile
function addRandomTile() {
    const emptyCells = getEmptyCells();
    if (emptyCells.length > 0) {
        const [r, c] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        if(spawnRNext){
            grid[r][c] = "R";
            spawnRNext = false;
            addRandomTile()
        }
        else{
            grid[r][c] = "C";
        }
         // Reset "R" spawning flag
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

            // Hvis værdien er "D", tilføj billede
            if (value === "D") {
                const img = document.createElement("img");
                img.src = getDImage(); // Hent billede afhængigt af health
                tile.appendChild(img);
            }
             // Hvis værdien er "R", tilføj billede af R
             if (value === "R") {
                const img = document.createElement("img");
                img.src = "rab.jpg"; // Faste billede for R
                tile.appendChild(img);
            }

            // Hvis værdien er "C", tilføj billede af C
            if (value === "C") {
                const img = document.createElement("img");
                img.src = "carrot.jpg"; // Faste billede for C
                tile.appendChild(img);
            }
            gridElement.appendChild(tile);
        });
    });
    scoreElement.textContent = `Score: ${score}`;
}

function getDImage() {
    if (health > 4) {
        return "happy.gif";  // Billede for højt health
    } else if (health > 2) {
        return "mid.png";  // Billede for mellem health
    } else {
        return "sad.jpg";  // Billede for lavt health
    }
}

// Slide and merge a row
function slideAndMergeRow(row) {
    const newRow = row.filter(value => value !== 0);

    for (let i = 0; i < newRow.length - 1; i++) {
        if (newRow[i] === "D" && newRow[i + 1] === "R" || newRow[i] === "R" && newRow[i + 1] === "D") {
            newRow[i] = "D"; // Keep "D"
            newRow[i + 1] = 0; // Remove "R"
            health+=2; // Increase health for "D"
            score +=2;
        } else if (newRow[i] === "D" && newRow[i + 1] === "C" || newRow[i] === "C" && newRow[i + 1] === "D") {
            newRow[i] = "D"; // Keep "D"
            newRow[i + 1] = 0; // Remove "C"
            score -=1;
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
        health--;
        addRandomTile();
        renderGrid();
        renderGrid();
        if (isGameOver()) {
            alert(`Game Over! Dinoen blev for sulten. Du fik ${score} point.`);
            initGame();
        }
        if (!areRabbitsLeft()) {
            alert(`Game Over! Dinoen spiste den sidste kanin. Du fik ${score} point.`);
            initGame();
        }
    }
}

function areRabbitsLeft() {
    // Gennemgår hele grid'et og tjekker for kaniner (R)
    for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
            if (grid[r][c] === "R") {
                return true;  // Hvis vi finder en kanin, returnér true
            }
        }
    }
    return false;  // Hvis der ikke er nogen kaniner, returnér false
}

// Check if the game is over
function isGameOver() {
    return health < 1; // Game over if no empty cells
}

// Listen for arrow key presses
document.addEventListener("keydown", event => {
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) {
        move(event.key);
    }
});

// Start the game
initGame();
