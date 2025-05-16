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

let soundsEnabled = false; // Variable to track if sounds are enabled

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
    };

    // Prevent the context menu from appearing on right-click
    button.oncontextmenu = (event) => event.preventDefault();

    bingoBoard.appendChild(button);
  });

  const now = new Date();
  const options = { timeZone: 'Europe/Paris', hour12: false }; // GMT+1 timezone
  timestampLabel.textContent = `Last generated: ${now.toLocaleString('en-GB', options)}`;
  console.log(`Timestamp updated: ${timestampLabel.textContent}`);
}

let previousBingoCount = 0; // Track the previous bingo count

function checkBingo() {
  const buttons = Array.from(bingoBoard.children);
  const grid = [];
  while (buttons.length) grid.push(buttons.splice(0, 5));

  let bingoCount = 0;

  // Check rows
  for (const row of grid) {
    if (row.every(button => button.classList.contains('active'))) {
      bingoCount++;
    }
  }

  // Check columns
  for (let col = 0; col < 5; col++) {
    if (grid.every(row => row[col].classList.contains('active'))) {
      bingoCount++;
    }
  }

  // Check diagonals
  if (grid.every((row, i) => row[i].classList.contains('active'))) {
    bingoCount++;
  }
  if (grid.every((row, i) => row[4 - i].classList.contains('active'))) {
    bingoCount++;
  }

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
    bingoLabel.style.display = "none"; // Hide the label if no bingos
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
  console.log("Confetti triggered!"); // Debugging
  confetti({
    particleCount: 500,
    spread: 180,
    gravity: 0.3,
    scalar: 1.5,
    ticks: 1000,
    startVelocity: 60,
    origin: {
      x: 0.5,
      // since they fall down, start a bit higher than random
      y: 1,
    }
  });
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
    nameInputArea.style.display = 'none'; // Hide the input field and button
    nameLabel.textContent = `${name}'s Bingo Board`; // Update the name label
    nameLabel.style.color = 'lightgreen';
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
  toggleSoundBtn.textContent = soundsEnabled ? "🔊 Disable Sounds" : "🔇 Enable Sounds"; // Update button text
};
//open privacy policy in a new tab
privPolicyBtn.onclick = () => {
  window.open('privacypolicy.html', '_blank'); // Open privacy policy in a new tab
  console.log("Privacy policy opened"); // Debugging
};

PlugBtn.onclick = () => {
  window.open('https://www.twitch.tv/aonettv', '_blank'); // Open Twitch channel in a new tab
}
loadEntriesAndGenerate();