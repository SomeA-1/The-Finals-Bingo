import tkinter as tk
import random
import re
import os
import sys


# Load and clean entries from file
def load_entries(file_path):
    # If running as an executable, get the correct path
    if getattr(sys, 'frozen', False):  # Check if running as a frozen executable
        file_path = os.path.join(sys._MEIPASS, file_path)  # Get path to bundled files
    with open(file_path, "r", encoding="utf-8") as f:
        lines = f.readlines()
    entries = []
    for line in lines:
        cleaned = re.sub(r"^\d+\.\s*", "", line.strip())
        if cleaned:
            entries.append(cleaned)
    return entries

# Save player name and hide input
def save_name():
    global player_name
    name = name_entry.get().strip()
    if name:
        player_name = name  # store name in memory
        name_label.config(text=f"{player_name}'s Bingo Board", fg="lightgreen")
        name_frame.grid_remove()  # Hide input after saving
    else:
        name_label.config(text="Please enter a name.", fg="red")

# Function to check for bingos
def check_bingo():
    # Get the current state of the board
    board = []
    for i in range(5):
        row = []
        for j in range(5):
            button = buttons[i][j]
            print(f"Button ({i}, {j}) color: {button.cget('bg')}")  # Debug: Check button color
            if button.cget("bg") == "green":  # Check if the button is active (green)
                row.append(1)
            else:
                row.append(0)
        board.append(row)

    print("Board state:")  # Debug: Print board state
    for row in board:
        print(row)

    # Check rows for bingo
    for row in board:
        if sum(row) == 5:  # All buttons in the row are green
            print("Bingo detected in a row!")  # Debug
            return True

    # Check columns for bingo
    for col in range(5):
        if sum(board[row][col] for row in range(5)) == 5:  # All buttons in the column are green
            print("Bingo detected in a column!")  # Debug
            return True

    # Check diagonals for bingo
    if sum(board[i][i] for i in range(5)) == 5:  # Top-left to bottom-right
        print("Bingo detected in the main diagonal!")  # Debug
        return True
    if sum(board[i][4 - i] for i in range(5)) == 5:  # Top-right to bottom-left
        print("Bingo detected in the anti-diagonal!")  # Debug
        return True

    return False

# Function to adjust button sizes dynamically for responsiveness
def adjust_layout(event=None):
    # Get the current window size
    window_width = root.winfo_width()
    window_height = root.winfo_height()

    # Calculate button size based on window size
    button_size = min(window_width // 6, window_height // 10)  # Adjust for a 5x5 grid with padding
    font_size = max(8, button_size // 5)  # Adjust font size based on button size

    # Update button sizes and fonts
    for row in buttons:
        for button in row:
            button.config(width=button_size // 10, height=button_size // 30, font=("Helvetica", font_size))

    # Update label font sizes
    name_label.config(font=("Helvetica", font_size + 4, "bold"))
    bingo_label.config(font=("Helvetica", font_size + 4, "bold"))

# Update the toggle_button function to use the new label
def toggle_button(b, i, j):
    # Toggle the button's background color
    if b.cget("bg") == "green":
        b.config(bg=button_bg)
    else:
        b.config(bg="green")

    # Check for bingo
    if check_bingo():
        bingo_label.config(text="Bingo!")
    else:
        bingo_label.config(text="")

# Update make_button to pass row and column indices
def make_button(master, text, i, j):
    button = tk.Button(
        master, text=text, width=15, height=5,
        wraplength=100, bg=button_bg, fg=button_fg,
        activebackground=button_active, activeforeground=button_fg,
        relief="raised", font=("Helvetica", 10)
    )
    button.config(command=lambda b=button: toggle_button(b, i, j))
    return button

# Load bingo entries
bingo_entries = load_entries("entries.txt")
if len(bingo_entries) < 25:
    raise ValueError("Need at least 25 entries in entries.txt")
random.shuffle(bingo_entries)
bingo_entries[12] = "Free Space"

# GUI setup
root = tk.Tk()
root.title("Bingo Board")
root.configure(bg="#1e1e1e")

# Prevent window from being resizable
root.resizable(False, False)

# Styling
button_bg = "#333333"
button_fg = "#ffffff"
button_active = "#555555"

label_fg = "#dddddd"
entry_bg = "#2a2a2a"
entry_fg = "#ffffff"

player_name = None  # Session-only variable

# Name input section
name_frame = tk.Frame(root, bg="#1e1e1e")
name_frame.grid(row=0, column=0, columnspan=5, pady=(10, 5))

tk.Label(name_frame, text="Enter your name:", fg=label_fg, bg="#1e1e1e", font=("Helvetica", 12)).pack(side="left", padx=5)
name_entry = tk.Entry(name_frame, bg=entry_bg, fg=entry_fg, insertbackground=entry_fg, font=("Helvetica", 12))
name_entry.pack(side="left", padx=5)

tk.Button(name_frame, text="Save Name", command=save_name,
          bg=button_bg, fg=button_fg, activebackground=button_active, font=("Helvetica", 12)).pack(side="left", padx=5)

name_label = tk.Label(root, text="", fg="white", bg="#1e1e1e", font=("Helvetica", 16, "bold"))
name_label.grid(row=1, column=0, columnspan=5)

# Add a new label for the Bingo message
bingo_label = tk.Label(root, text="", fg="gold", bg="#1e1e1e", font=("Helvetica", 16, "bold"))
bingo_label.grid(row=2, column=0, columnspan=5, pady=(5, 10))

# Create 5x5 Bingo board and store buttons in a 2D list
buttons = []
for i in range(5):
    row = []
    for j in range(5):
        index = i * 5 + j
        text = bingo_entries[index]
        btn = make_button(root, text, i, j)
        btn.grid(row=i + 2, column=j, padx=2, pady=2)
        row.append(btn)
    buttons.append(row)

# Bind the adjust_layout function to the window resize event
root.bind("<Configure>", adjust_layout)

# Call adjust_layout initially to set the layout
adjust_layout()

# Start the Tkinter main loop
root.mainloop()