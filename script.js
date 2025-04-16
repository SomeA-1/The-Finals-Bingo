<!DOCTYPE html>
<html lang="en">
<head>
  <link rel="icon" href="favicon.ico" type="image/x-icon" />
  <div class="version">Version 1.0</div>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Bingo Board</title>
  <style>
    body {
      background-color: #1e1e1e;
      color: #dddddd;
      font-family: Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 20px;
    }
    .board {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 10px;
      max-width: 600px;
      margin: 0 auto;
      width: 100%;
    }
    .board button {
      background-color: #333;
      color: #fff;
      border: none;
      font-size: 16px;
      cursor: pointer;
      aspect-ratio: 1 / 1;
      width: 100%;
      font-family: inherit;
      padding: 10px;
      word-break: break-word;
      overflow-wrap: break-word;
      white-space: normal;
    }
    .board button:hover {
      background-color: #555;
    }
    .board button.active {
      background-color: green;
    }
    .name-section {
      text-align: center;
      margin-bottom: 20px;
    }
    #nameLabel {
      margin-top: 10px;
      font-size: 1.5em;
      color: lightgreen;
    }
    .version {
      position: fixed;
      bottom: 10px;
      right: 10px;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div style="text-align: center; margin-top: 20px;">
    <button id="randomizeBtn" style="padding: 10px 20px; font-size: 14px;">🔄 Randomize Board</button>
    <div id="timestamp" style="margin-top: 5px; color: #888; font-size: 12px;"></div>
  </div>

  <div class="name-section">
    <div id="nameInputArea">
      <h1>Enter your name:</h1>
      <input type="text" id="nameInput" placeholder="Enter name" />
      <button id="saveNameBtn">Save Name</button>
    </div>
    <div id="nameLabel"></div>
  </div>

  <div class="board" id="bingoBoard">
    <!-- Bingo buttons will be inserted here by JavaScript -->
  </div>

  <script>
    function updateTimestamp() {
      // Create a new Date object
      const now = new Date();

      // Convert the current time to French Time (GMT+1)
      const frenchTime = new Date(now.toLocaleString("en-US", { timeZone: "Europe/Paris" }));

      // Format the time to display as HH:mm:ss
      const hours = frenchTime.getHours().toString().padStart(2, '0');
      const minutes = frenchTime.getMinutes().toString().padStart(2, '0');
      const seconds = frenchTime.getSeconds().toString().padStart(2, '0');
      const timeString = `${hours}:${minutes}:${seconds}`;

      // Display the timestamp
      document.getElementById('timestamp').innerText = `Current Time (GMT+1): ${timeString}`;
    }

    // Update the timestamp every second
    setInterval(updateTimestamp, 1000);
  </script>

  <script src="script.js"></script>
</body>
</html>
