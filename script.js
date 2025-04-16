const bingoBoard = document.getElementById('bingoBoard');
const saveNameBtn = document.getElementById('saveNameBtn');
const nameLabel = document.getElementById('nameLabel');
const nameInputArea = document.getElementById('nameInputArea');
const randomizeBtn = document.getElementById('randomizeBtn');
const timestampLabel = document.getElementById('timestamp');

function shuffle(array) {
  const newArr = array.slice();
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

function generateBoard(entries) {
    const shuffled = shuffle(entries);
    const boardEntries = [...shuffled.slice(0, 12), "Free Space", ...shuffled.slice(12, 24)];
  
    bingoBoard.innerHTML = '';
    boardEntries.forEach(entry => {
      const button = document.createElement('button');
      button.textContent = entry;
      button.dataset.clickCount = 0; // Initialize click count
  
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
      };
  
      // Prevent the context menu from appearing on right-click
      button.oncontextmenu = (event) => event.preventDefault();
  
      bingoBoard.appendChild(button);
    });
  
    const now = new Date();
    timestampLabel.textContent = `Last generated: ${now.toLocaleString()}`;
  }

function loadEntriesAndGenerate() {
  fetch('entries.json')
    .then(response => response.json())
    .then(entries => {
      if (entries.length < 24) {
        alert("entries.json must contain at least 24 entries.");
        return;
      }
      generateBoard(entries);
      randomizeBtn.onclick = () => generateBoard(entries);
    })
    .catch(error => {
      console.error("Error loading entries.json:", error);
      alert("Failed to load entries.");
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
