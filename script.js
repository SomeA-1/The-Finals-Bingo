const bingoBoard = document.getElementById('bingoBoard');
const saveNameBtn = document.getElementById('saveNameBtn');
const nameLabel = document.getElementById('nameLabel');
const nameInputArea = document.getElementById('nameInputArea');
const randomizeBtn = document.getElementById('randomizeBtn');
const timestampLabel = document.getElementById('timestamp');
const bingoLabel = document.getElementById('bingoLabel'); // Bingo label element

function shuffle(array) {
  const newArr = array.slice();
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

function generateBoard(entries, freeSpaceEntry) {
  const shuffled = shuffle(entries);
  const boardEntries = [...shuffled.slice(0, 12), freeSpaceEntry, ...shuffled.slice(12, 24)];

  bingoBoard.innerHTML = '';
  boardEntries.forEach((entry, index) => {
    const button = document.createElement('button');
    button.textContent = entry;
    button.dataset.clickCount = 0; // Initialize click count
    button.dataset.index = index; // Store the button's index for bingo detection

    // Create a small counter element
    const counter = document.createElement('span');
    counter.style.position = 'absolute';
    counter.style.bottom = '5px';
    counter.style.right = '5px';
    counter.style.fontSize = '12px';
    counter.style.color = '#fff';
    counter.textContent = ''; // Initially empty
    button.style.position = 'relative'; // Ensure the counter is positioned relative to the button
    button.appendChild(counter);

    button.onmousedown = (event) => {
      let clickCount = parseInt(button.dataset.clickCount, 10);

      if (event.button === 0) {
        // Left click: increment the counter
        if (clickCount === 0) {
          button.classList.add('active'); // First click: turn green
        }
        button.dataset.clickCount = clickCount + 1;
        counter.textContent = clickCount + 1;
      } else if (event.button === 2) {
        // Right click: decrement the counter
        if (clickCount > 0) {
          button.dataset.clickCount = clickCount - 1;
          counter.textContent = clickCount - 1 || ''; // Clear counter if it reaches 0
          if (clickCount - 1 === 0) {
            button.classList.remove('active'); // Remove green background when inactive
          }
        }
      }

      // Check for bingo after each click
      if (checkBingo()) {
        bingoLabel.style.display = 'block'; // Show the Bingo label
      } else {
        bingoLabel.style.display = 'none'; // Hide the Bingo label
      }
    };

    // Prevent the context menu from appearing on right-click
    button.oncontextmenu = (event) => event.preventDefault();

    bingoBoard.appendChild(button);
  });

  const now = new Date();
  timestampLabel.textContent = `Last generated: ${now.toLocaleString()}`;
}

function checkBingo() {
  const buttons = Array.from(bingoBoard.children);
  const grid = [];
  while (buttons.length) grid.push(buttons.splice(0, 5));

  // Check rows
  for (const row of grid) {
    if (row.every(button => button.classList.contains('active'))) return true;
  }

  // Check columns
  for (let col = 0; col < 5; col++) {
    if (grid.every(row => row[col].classList.contains('active'))) return true;
  }

  // Check diagonals
  if (grid.every((row, i) => row[i].classList.contains('active'))) return true;
  if (grid.every((row, i) => row[4 - i].classList.contains('active'))) return true;

  return false;
}

function loadEntriesAndGenerate() {
  Promise.all([
    fetch('entries.json').then(response => response.json()),
    fetch('freespace.json').then(response => response.json())
  ])
    .then(([entries, freeSpaces]) => {
      if (entries.length < 24) {
        alert("entries.json must contain at least 24 entries.");
        return;
      }
      if (freeSpaces.length === 0) {
        alert("freespace.json must contain at least one entry.");
        return;
      }

      const freeSpaceEntry = shuffle(freeSpaces)[0]; // Pick a random free space entry
      generateBoard(entries, freeSpaceEntry);

      randomizeBtn.onclick = () => generateBoard(entries, shuffle(freeSpaces)[0]);
    })
    .catch(error => {
      console.error("Error loading JSON files:", error);
      alert("Failed to load entries or free space.");
    });
}

saveNameBtn.onclick = () => {
  const name = document.getElementById('nameInput').value.trim();
  if (name) {
    nameInputArea.style.display = 'none';
    nameLabel.textContent = `${name}'s Bingo Board`;
    nameLabel.style.color = 'lightgreen';
  } else {
    nameLabel.textContent = 'Please enter a name.';
    nameLabel.style.color = 'red';
  }
};

loadEntriesAndGenerate();