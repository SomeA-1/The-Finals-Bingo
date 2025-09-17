from flask import Flask, render_template, request, jsonify
import random
import re
import os

app = Flask(__name__)

# Load and clean entries from file
def load_entries(file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        lines = f.readlines()
    entries = []
    for line in lines:
        cleaned = re.sub(r"^\d+\.\s*", "", line.strip())
        if cleaned:
            entries.append(cleaned)
    return entries

# Load bingo entries
bingo_entries = load_entries("entries.txt")
if len(bingo_entries) < 24:
    raise ValueError("Need at least 24 custom entries for a 5x5 board (center is Free Space)")
random.shuffle(bingo_entries)
bingo_entries = bingo_entries[:12]+ bingo_entries[12:24]


@app.route('/')
def index():
    return render_template('index.html', bingo_entries=bingo_entries)

@app.route('/save_name', methods=['POST'])
def save_name():
    player_name = request.form['name']
    if player_name:
        return jsonify({"status": "success", "name": player_name})
    return jsonify({"status": "error", "message": "Name is required"})

if __name__ == '__main__':
    app.run(debug=True)
