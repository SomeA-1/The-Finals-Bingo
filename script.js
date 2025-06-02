const bingoBoard = document.getElementById('bingoBoard');
const saveNameBtn = document.getElementById('saveNameBtn');
const nameLabel = document.getElementById('nameLabel');
const nameInputArea = document.getElementById('nameInputArea');
const randomizeBtn = document.getElementById('randomizeBtn');
const privPolicyBtn = document.getElementById('privPolicyBtn');
const timestampLabel = document.getElementById('timestamp');
const bingoLabel = document.getElementById('bingoLabel'); // Bingo label element
const toggleSoundBtn = document.getElementById('toggleSoundBtn'); // Sound toggle button

const sidebar = document.getElementById('sidebar');
const openSidebarBtn = document.getElementById('openSidebarBtn');
const closeSidebarBtn = document.getElementById('closeSidebarBtn');
const customCursor = document.getElementById('customCursor');

// Custom cursor functionality
document.addEventListener('DOMContentLoaded', () => {
  customCursor.style.display = 'block'; // Show the custom cursor on page load
});
document.addEventListener('mousemove', (e) => {
  const customCursor = document.getElementById('customCursor');
  if (customCursor) {
    customCursor.style.left = e.clientX + 'px';
    customCursor.style.top = e.clientY + 'px';
    customCursor.style.display = 'block';
  }
});

// Open the sidebar
openSidebarBtn.onclick = () => {
  sidebar.classList.add('open');
};

// Close the sidebar
closeSidebarBtn.onclick = () => {
  sidebar.classList.remove('open');
};

// Load sound files
const checkSound = new Audio('sounds/check.mp3'); // Sound for checking
const uncheckSound = new Audio('sounds/uncheck.mp3'); // Sound for unchecking
const confettiSound = new Audio('sounds/confetti.mp3'); // Sound for confetti

let soundsEnabled = true; // Variable to track if sounds are enabled

function shuffle(array) {
  const newArr = array.slice();
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

// Add a label to display the seed (add this to your HTML as well)
const seedLabel = document.getElementById('seedLabel');

// Seeded random number generator (simple implementation)
function mulberry32(seed) {
  let t = seed;
  return function() {
    t += 0x6D2B79F5;
    let r = Math.imul(t ^ t >>> 15, 1 | t);
    r ^= r + Math.imul(r ^ r >>> 7, 61 | r);
    return ((r ^ r >>> 14) >>> 0) / 4294967296;
  }
}

// Seeded shuffle
function seededShuffle(array, seed) {
  const rng = mulberry32(seed);
  const newArr = array.slice();
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

// Generate a random seed (6-digit number)
function generateSeed() {
  return Math.floor(100000 + Math.random() * 900000);
}

// Modified generateBoard to accept a seed
function generateBoard(entries, freeSpaceEntry, seed) {
  const shuffled = seededShuffle(entries, seed);
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
    counter.style.fontSize = '25px';
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
          if (soundsEnabled) checkSound.play(); // Play check sound if enabled
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
            if (soundsEnabled) uncheckSound.play(); // Play uncheck sound if enabled
          }
        }
      }

      // Check for bingo after each click
      if (checkBingo()) {
        bingoLabel.style.display = 'block'; // Show the Bingo label
      } else {
        bingoLabel.style.display = 'none'; // Hide the Bingo label
      }

      // After updating button state:
      saveBoardState();
    };

    // Prevent the context menu from appearing on right-click
    button.oncontextmenu = (event) => event.preventDefault();

    bingoBoard.appendChild(button);
  });

  const now = new Date();
  const options = { timeZone: 'Europe/Paris', hour12: false }; // GMT+1 timezone
  timestampLabel.textContent = `Last generated: ${now.toLocaleString('en-GB', options)}`;
  console.log(`Timestamp updated: ${timestampLabel.textContent}`);

  // Display the seed
  if (seedLabel) {
    seedLabel.textContent = `Seed: ${seed}`;
  }

  loadBoardState();
}

let previousBingoCount = 0; // Track the previous bingo count

function checkBingo() {
  const buttons = Array.from(bingoBoard.children);
  const grid = [];
  while (buttons.length) grid.push(buttons.splice(0, 5));

  let bingoCount = 0;
  let bingoIndexes = new Set();

  // Check rows
  for (let r = 0; r < grid.length; r++) {
    if (grid[r].every(button => button.classList.contains('active'))) {
      bingoCount++;
      for (let c = 0; c < 5; c++) bingoIndexes.add(r * 5 + c);
    }
  }

  // Check columns
  for (let col = 0; col < 5; col++) {
    if (grid.every(row => row[col].classList.contains('active'))) {
      for (let row = 0; row < 5; row++) bingoIndexes.add(row * 5 + col);
      bingoCount++;
    }
  }

  // Check diagonals
  if (grid.every((row, i) => row[i].classList.contains('active'))) {
    for (let i = 0; i < 5; i++) bingoIndexes.add(i * 5 + i);
    bingoCount++;
  }
  if (grid.every((row, i) => row[4 - i].classList.contains('active'))) {
    for (let i = 0; i < 5; i++) bingoIndexes.add(i * 5 + (4 - i));
    bingoCount++;
  }

  // Remove .bingo from all buttons first
  const allButtons = Array.from(bingoBoard.children);
  allButtons.forEach(btn => btn.classList.remove('bingo'));

  // Add .bingo to buttons that are part of a bingo
  bingoIndexes.forEach(idx => {
    if (allButtons[idx]) allButtons[idx].classList.add('bingo');
  });

  // Update the Bingo label based on the count
  if (bingoCount === 1) {
    bingoLabel.textContent = "Bingo!";
    bingoLabel.style.display = "block";
  } else if (bingoCount === 2) {
    bingoLabel.textContent = "Double Bingo!";
    bingoLabel.style.display = "block";
  } else if (bingoCount === 3) {
    bingoLabel.textContent = "Triple Bingo!";
    bingoLabel.style.display = "block";
  } else if (bingoCount > 3) {
    bingoLabel.textContent = `${bingoCount} Bingos!`;
    bingoLabel.style.display = "block";
  } else {
    bingoLabel.textContent = "\u00A0"; // Show a non-breaking space if no bingos
    bingoLabel.style.display = "block";
  }

  // Trigger confetti only if the bingo count increases
  if (bingoCount > previousBingoCount) {
    launchConfetti();
    if (soundsEnabled) confettiSound.play(); // Play confetti sound if enabled
  }

  // Update the previous bingo count
  previousBingoCount = bingoCount;

  return bingoCount > 0; // Return true if at least one bingo is detected
}

function launchConfetti() {
  if (popout && !popout.closed) {
    popout.postMessage('launchConfetti', '*');
  }
  if (typeof confetti === 'function') {
    confetti({
      particleCount: 500,
      spread: 180,
      gravity: 0.3,
      scalar: 1.5,
      ticks: 1000,
      startVelocity: 60,
      origin: { x: 0.5, y: 1 }
    });
  }
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

      let seed = loadSeed();
      if (!seed) {
        seed = generateSeed();
        saveSeed(seed);
      }
      const freeSpaceEntry = seededShuffle(freeSpaces, seed)[0];

      generateBoard(entries, freeSpaceEntry, seed);
      updateNameLabel();

      // shuffle and clear selection
      randomizeBtn.onclick = () => {
        const newSeed = generateSeed();
        saveSeed(newSeed);
        const newFreeSpaceEntry = seededShuffle(freeSpaces, newSeed)[0];
        generateBoard(entries, newFreeSpaceEntry, newSeed);
        clearSelection();
        updateNameLabel();
        saveBoardState();

        // Update popout with new board if open
        if (popout && !popout.closed) {
          popout.postMessage({
            type: 'replaceBoard',
            html: bingoBoard.outerHTML,
            state: JSON.parse(localStorage.getItem('bingoBoardState') || '[]')
          }, '*');
        }
      };
    })
    .catch(error => {
      console.error("Error loading JSON files:", error);
      alert("Failed to load entries or free space.");
    });
}

saveNameBtn.onclick = () => {
  const name = document.getElementById('nameInput').value.trim();
  const seed = loadSeed();
  if (name) {
    nameInputArea.style.display = 'none';
    nameLabel.textContent = `${name}'s Bingo Board (Seed: ${seed})`;
    nameLabel.style.color = 'lightgreen';
    localStorage.setItem('bingoName', name); // <-- Save to localStorage
    loadEntriesAndGenerate();
  } else {
    nameLabel.textContent = 'Please enter a name.';
    nameLabel.style.color = 'red';
  }
};

// Trigger saveNameBtn click when "Enter" is pressed in the name input field
document.getElementById('nameInput').addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    saveNameBtn.click(); // Trigger the saveNameBtn click event
  }
});

toggleSoundBtn.onclick = () => {
  soundsEnabled = !soundsEnabled; // Toggle the soundsEnabled variable
  console.log(`Sounds Enabled: ${soundsEnabled}`); // Debugging
  toggleSoundBtn.textContent = soundsEnabled ? "🔇 Disable Sounds" : "🔊 Enable Sounds"; // Update button text
};
//open privacy policy in a new tab
privPolicyBtn.onclick = () => {
  window.open('privacypolicy.html', '_blank'); // Open privacy policy in a new tab
  console.log("Privacy policy opened"); // Debugging
};

PlugBtn.onclick = () => {
  window.open('https://www.twitch.tv/aonettv', '_blank'); // Open Twitch channel in a new tab
}

let popout = null;

// Pop-out button functionality
document.getElementById('popOutBtn').onclick = function() {
  // Get the board HTML and state
  const boardHTML = document.getElementById('bingoBoard').outerHTML;
  const boardState = localStorage.getItem('bingoBoardState') || '[]';
  const boardStyles = `
    <style>
      body {
        background-color: #1e1e1e;
        color: #dddddd;
        font-family: Helvetica, Arial, sans-serif;
        margin: 0;
        padding: 10px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100vh;
        overflow: hidden;
      }
      .board {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        gap: 5px;
        width: 100%;
        max-width: 90vmin;
        height: auto;
        max-height: 90vmin;
        background: #23272e;
        border: 3px solid #23272e;
        border-radius: 16px;
        padding: 20px;
      }
      .board button {
        background-color: #333;
        color: #fff;
        border: none;
        font-size: clamp(0.8rem, 2.5vw, 1.2rem);
        cursor: pointer;
        aspect-ratio: 1 / 1;
        width: 100%;
        height: 100%;
        font-family: inherit;
        padding: 5px;
        word-break: break-word;
        white-space: normal;
        text-align: center;
        border-radius: 5px;
        position: relative;
      }
      .board button.active {
        background-color: green;
      }
      .board button:hover {
        background-color: #555;
      }
    </style>
  `;

  popout = window.open('', 'BingoBoardPopout', 'width=500,height=600,toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes');
  popout.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Bingo Board Popout</title>
      ${boardStyles}
      <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js"></script>
    </head>
    <body>
      ${boardHTML}
      <script>
        // Restore board state from main window
        const boardState = ${boardState};
        const bingoBoard = document.getElementById('bingoBoard');
        const buttons = Array.from(bingoBoard.children);
        boardState.forEach((btnState, i) => {
          if (buttons[i]) {
            buttons[i].dataset.clickCount = btnState.clickCount;
            buttons[i].classList.toggle('active', btnState.active);
            const counter = buttons[i].querySelector('span');
            counter.textContent = btnState.clickCount > 0 ? btnState.clickCount : '';
          }
        });

        // Make buttons interactive in popout
        buttons.forEach((button, idx) => {
          const counter = button.querySelector('span');
          button.onmousedown = (event) => {
            let clickCount = parseInt(button.dataset.clickCount, 10) || 0;
            if (event.button === 0) {
              if (clickCount === 0) button.classList.add('active');
              button.dataset.clickCount = clickCount + 1;
              counter.textContent = clickCount + 1;
            } else if (event.button === 2) {
              if (clickCount > 0) {
                button.dataset.clickCount = clickCount - 1;
                counter.textContent = clickCount - 1 || '';
                if (clickCount - 1 === 0) button.classList.remove('active');
              }
            }
            saveBoardState();
          };
          button.oncontextmenu = (event) => event.preventDefault();
        });

        function saveBoardState() {
          const state = buttons.map(btn => ({
            clickCount: btn.dataset.clickCount,
            active: btn.classList.contains('active')
          }));
          localStorage.setItem('bingoBoardState', JSON.stringify(state));
        }

        // Listen for confetti trigger from main window
        window.addEventListener('message', (event) => {
          if (event.data === 'launchConfetti' && window.confetti) {
            window.confetti({
              particleCount: 500,
              spread: 180,
              gravity: 0.3,
              scalar: 1.5,
              ticks: 1000,
              startVelocity: 60,
              origin: { x: 0.5, y: 1 }
            });
          }
          if (event.data === 'clearSelection') {
            buttons.forEach(btn => {
              btn.classList.remove('active');
              btn.dataset.clickCount = 0;
              const counter = btn.querySelector('span');
              if (counter) counter.textContent = '';
            });
            saveBoardState();
          }
          if (event.data && event.data.type === 'updateBoardState' && Array.isArray(event.data.state)) {
            event.data.state.forEach((btnState, i) => {
              if (buttons[i]) {
                buttons[i].dataset.clickCount = btnState.clickCount;
                buttons[i].classList.toggle('active', btnState.active);
                const counter = buttons[i].querySelector('span');
                counter.textContent = btnState.clickCount > 0 ? btnState.clickCount : '';
              }
            });
            saveBoardState();
          }
        });
      <\/script>
    </body>
    </html>
  `);
  popout.document.close();
};

function saveBoardState() {
  const buttons = Array.from(bingoBoard.children);
  const state = buttons.map(btn => ({
    clickCount: btn.dataset.clickCount,
    active: btn.classList.contains('active')
  }));
  localStorage.setItem('bingoBoardState', JSON.stringify(state));

  // Notify popout of the new state
  if (popout && !popout.closed) {
    popout.postMessage({ type: 'updateBoardState', state }, '*');
  }
}

function loadBoardState() {
  const state = JSON.parse(localStorage.getItem('bingoBoardState') || '[]');
  const buttons = Array.from(bingoBoard.children);
  state.forEach((btnState, i) => {
    if (buttons[i]) {
      buttons[i].dataset.clickCount = btnState.clickCount;
      buttons[i].classList.toggle('active', btnState.active);
      const counter = buttons[i].querySelector('span');
      counter.textContent = btnState.clickCount > 0 ? btnState.clickCount : '';
    }
  });
}

// Initial load: check if there's a saved state and load it
document.addEventListener('DOMContentLoaded', () => {
  const savedName = localStorage.getItem('bingoName');
  if (savedName) {
    document.getElementById('nameInput').value = savedName;
    nameInputArea.style.display = 'none';
    updateNameLabel();
  }
  loadEntriesAndGenerate();
});

window.addEventListener('storage', (event) => {
  if (event.key === 'bingoBoardState') {
    loadBoardState();
    // Optionally, re-check for bingo
    checkBingo();
  }
});

loadEntriesAndGenerate();

// Function to clear all selections on the board
function clearSelection() {
  const boardButtons = document.querySelectorAll('.board button');
  boardButtons.forEach(btn => {
    btn.classList.remove('active');
    btn.dataset.clickCount = 0;
    const counter = btn.querySelector('span');
    if (counter) {
      counter.textContent = '';
    }
  });
  // Hide the Bingo label if shown
  if (bingoLabel) bingoLabel.style.display = 'none';
  saveBoardState();

  // Notify popout to clear its selection
  if (popout && !popout.closed) {
    popout.postMessage('clearSelection', '*');
  }
}

// Save seed to localStorage
function saveSeed(seed) {
  localStorage.setItem('bingoSeed', seed);
}

// Load seed from localStorage
function loadSeed() {
  const s = localStorage.getItem('bingoSeed');
  return s ? Number(s) : null;
}

const seedInput = document.getElementById('seedInput');
const loadSeedBtn = document.getElementById('loadSeedBtn');
loadSeedBtn.onclick = () => {
  let newSeed = seedInput.value.trim();
  if (!/^\d+$/.test(newSeed)) {
    alert("Seed must be a number.");
    return;
  }
  saveSeed(Number(newSeed));
  loadEntriesAndGenerate();
  updateNameLabel();
};

seedInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    loadSeedBtn.click();
  }
});

document.addEventListener('DOMContentLoaded', loadEntriesAndGenerate);

// Update the name label based on the input
function updateNameLabel() {
  let name = document.getElementById('nameInput').value.trim();
  if (!name) {
    name = localStorage.getItem('bingoName') || '';
  }
  const seed = loadSeed();
  if (name) {
    nameLabel.textContent = `${name}'s Bingo Board (Seed: ${seed})`;
    nameLabel.style.color = 'lightgreen';
  } else {
    nameLabel.textContent = '';
  }
}

// Add this if not already present
document.getElementById('clearSelectionBtn').onclick = clearSelection;

const clearNameBtn = document.getElementById('clearNameBtn');
clearNameBtn.onclick = () => {
  localStorage.removeItem('bingoName');
  document.getElementById('nameInput').value = '';
  nameInputArea.style.display = 'block';
  nameLabel.textContent = '';
};

window.addEventListener('message', (event) => {
  // ...existing handlers...

  if (event.data && event.data.type === 'replaceBoard' && event.data.html) {
    // Replace the board HTML
    const temp = document.createElement('div');
    temp.innerHTML = event.data.html;
    const newBoard = temp.firstElementChild;
    const oldBoard = document.getElementById('bingoBoard');
    oldBoard.replaceWith(newBoard);

    // Re-attach button handlers
    const buttons = Array.from(newBoard.children);
    buttons.forEach((button, idx) => {
      const counter = button.querySelector('span');
      button.onmousedown = (event) => {
        let clickCount = parseInt(button.dataset.clickCount, 10) || 0;
        if (event.button === 0) {
          if (clickCount === 0) button.classList.add('active');
          button.dataset.clickCount = clickCount + 1;
          counter.textContent = clickCount + 1;
        } else if (event.button === 2) {
          if (clickCount > 0) {
            button.dataset.clickCount = clickCount - 1;
            counter.textContent = clickCount - 1 || '';
            if (clickCount - 1 === 0) button.classList.remove('active');
          }
        }
        saveBoardState();
      };
      button.oncontextmenu = (event) => event.preventDefault();
    });

    // Restore state
    if (Array.isArray(event.data.state)) {
      event.data.state.forEach((btnState, i) => {
        if (buttons[i]) {
          buttons[i].dataset.clickCount = btnState.clickCount;
          buttons[i].classList.toggle('active', btnState.active);
          const counter = buttons[i].querySelector('span');
          counter.textContent = btnState.clickCount > 0 ? btnState.clickCount : '';
        }
      });
    }

    // Redefine saveBoardState for the new buttons
    function saveBoardState() {
      const state = buttons.map(btn => ({
        clickCount: btn.dataset.clickCount,
        active: btn.classList.contains('active')
      }));
      localStorage.setItem('bingoBoardState', JSON.stringify(state));
    }
  }
});

