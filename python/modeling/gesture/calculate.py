import os
import re

# Files to exclude from counting
exclude_files = ['file1.txt', 'file2.py']

# Get the list of all files in the repository
all_files = []
for root, dirs, files in os.walk('.'):
    for file in files:
        all_files.append(os.path.join(root, file))

# Filter out the files mentioned in the .gitignore file and the user-specified list of files to not count
with open('.gitignore', 'r') as f:
    gitignore = f.read().splitlines()
exclude_files += gitignore
count_files = [file for file in all_files if file not in exclude_files]

# Count the number of lines, words, characters, and characters excluding spaces for each file
total_lines = 0
total_words = 0
total_chars = 0
total_chars_no_spaces = 0
for file in count_files:
    if (file.endswith('.py') or file.endswith('.txt') or file.endswith('.js') or file.endswith('.html') or file.endswith('.css') or file.endswith('.json')) and ("node_modules" not in file and "noduro_python" not in file and "loader.js" not in file and "icons.css" not in file):
        with open(file, 'r') as f:
            lines = f.readlines()
            num_lines = len(lines)
            num_words = sum(len(line.split()) for line in lines)
            num_chars = sum(len(line) for line in lines)
            num_chars_no_spaces = sum(len(line.replace(' ', '')) for line in lines)
            total_lines += num_lines
            total_words += num_words
            total_chars += num_chars
            total_chars_no_spaces += num_chars_no_spaces

# Print the final result
print(f"Total lines: {total_lines}")
print(f"Total words: {total_words}")
print(f"Total characters: {total_chars}")
print(f"Total characters excluding spaces: {total_chars_no_spaces}")

