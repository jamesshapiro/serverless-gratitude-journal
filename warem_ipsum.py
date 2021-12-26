import random

with open('war-and-peace.txt') as f:
    text = f.read().replace('“','"').replace('”','"').replace("’","'")
    text = text.splitlines()

def process_text(text):
    paragraphs = []
    curr_lines = []
    for line in text:
        if line.startswith('CHAPTER') or line.startswith('BOOK'):
            continue
        elif line == '':
            paragraph = ' '.join(curr_lines)
            paragraphs.append(paragraph)
            curr_lines = []
        else:
            curr_lines.append(line)
    return paragraphs

paragraphs = process_text(text)

def get_paragraph():
    return random.choice(paragraphs)
