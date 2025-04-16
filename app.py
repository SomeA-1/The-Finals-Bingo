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

# Button maker with toggle functionality
def make_button(master, text):
    button = tk.Button(
        master, text=text, width=15, height=5,
        wraplength=100, bg=button_bg, fg=button_fg,
        activebackground=button_active, activeforeground=button_fg,
        relief="raised", font=("Helvetica", 10)
    )
    
    # Toggle background color between green and original
    def toggle_button(b):
        if b.cget("bg") == "green":
            b.config(bg=button_bg)
        else:
            b.config(bg="green")
    
    button.config(command=lambda b=button: toggle_button(b))
    return button

# Create 5x5 Bingo board
for i in range(5):
    for j in range(5):
        index = i * 5 + j
        text = bingo_entries[index]
        btn = make_button(root, text)
        btn.grid(row=i + 2, column=j, padx=2, pady=2)

# Add version number to the bottom-right corner
version_label = tk.Label(root, text="Version 1.0", fg="#dddddd", bg="#1e1e1e", font=("Helvetica", 10))
version_label.grid(row=7, column=4, padx=5, pady=5, sticky="se")

root.mainloop()
