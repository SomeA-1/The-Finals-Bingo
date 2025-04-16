const originalEntries = [
    // Replace these with your actual 24 entries from entries.txt
    "Entry 1", "Entry 2", "Entry 3", "Entry 4", "Entry 5",
    "Entry 6", "Entry 7", "Entry 8", "Entry 9", "Entry 10",
    "Entry 11", "Entry 12", "Entry 13", "Entry 14", "Entry 15",
    "Entry 16", "Entry 17", "Entry 18", "Entry 19", "Entry 20",
    "Entry 21", "Entry 22", "Entry 23", "Entry 24"
  ];
  
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
      button.onclick = () => button.classList.toggle('active');
      bingoBoard.appendChild(button);
    });
  
    const now = new Date();
    timestampLabel.textContent = `Last generated: ${now.toLocaleString()}`;
  }
  
  generateBoard(originalEntries);
  
  randomizeBtn.onclick = () => generateBoard(originalEntries);
  
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
  