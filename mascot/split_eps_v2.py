#!/usr/bin/env python3
"""
Split the 4-character EPS file into separate EPS files with translated coordinates.
Each character is moved to origin (0,0) for easier animation.
"""

import re

CANVAS_WIDTH = 902
CANVAS_HEIGHT = 948
MID_X = CANVAS_WIDTH / 2
MID_Y = CANVAS_HEIGHT / 2

QUADRANTS = {
    'upper-left': {'name': '01_love'},
    'upper-right': {'name': '02_crown'},
    'lower-left': {'name': '03_balloon'},
    'lower-right': {'name': '04_ill'},
}

def read_eps(filepath):
    with open(filepath, 'r', encoding='latin1', errors='ignore') as f:
        return f.read()

def get_header(content):
    match = re.search(r'(.*?%%BeginSetup)', content, re.DOTALL)
    if match:
        return match.group(0) + '\n'
    return content[:5000]

def get_trailer(content):
    match = re.search(r'(%ADOBeginClientInjection: EndPageContent.*?%%EOF)', content, re.DOTALL)
    if match:
        return '\n' + match.group(0)
    return "\n%%EOF\n"

def extract_all_path_data(content):
    """
    Extract the main drawing section from EPS.
    Returns the section between %%EndSetup and EndPageContent.
    """
    match = re.search(r'%%EndSetup\s*(.*?)%ADOBeginClientInjection: EndPageContent', content, re.DOTALL)
    if match:
        return match.group(1)
    return ""

def split_paths_by_moveto(path_data):
    """
    Split path data into individual paths based on 'mo' (moveto) commands.
    Each path starts with 'x y mo' and ends before the next 'mo' or end of data.
    """
    paths = []

    # Find all moveto positions
    mo_pattern = re.compile(r'(\d+\.\d+)\s+(\d+\.\d+)\s+mo')

    lines = path_data.split('\n')
    current_path = []
    current_start = None

    for i, line in enumerate(lines):
        # Check if this line starts a new path
        mo_match = mo_pattern.search(line)
        if mo_match:
            new_start = (float(mo_match.group(1)), float(mo_match.group(2)))
            if current_path and current_start:
                # Save previous path
                paths.append((''.join(current_path), current_start))
                current_path = []
            current_start = new_start

        current_path.append(line + '\n')

        # Check if path ends
        if re.search(r'\bf\b|\bcp\b\s*$', line):
            if current_path and current_start:
                paths.append((''.join(current_path), current_start))
                current_path = []
                current_start = None

    # Don't forget the last path
    if current_path and current_start:
        paths.append((''.join(current_path), current_start))

    # Filter out paths without valid start coordinates
    paths = [(p, s) for p, s in paths if s is not None]

    return paths

def classify_point(x, y):
    if x < MID_X and y >= MID_Y:
        return 'upper-left'
    elif x >= MID_X and y >= MID_Y:
        return 'upper-right'
    elif x < MID_X and y < MID_Y:
        return 'lower-left'
    else:
        return 'lower-right'

def translate_coords(text, offset_x, offset_y):
    """Translate all coordinates in text by offset."""
    def replace_coord(match):
        x = float(match.group(1)) - offset_x
        y = float(match.group(2)) - offset_y
        return f"{x:.4f} {y:.4f}"

    return re.sub(r'(\d+\.\d+)\s+(\d+\.\d+)', replace_coord, text)

def split_and_translate(content):
    header = get_header(content)
    trailer = get_trailer(content)
    path_data = extract_all_path_data(content)

    if not path_data:
        print("Error: Could not extract path data")
        return

    print("Extracting and splitting paths...")
    paths = split_paths_by_moveto(path_data)
    print(f"Found {len(paths)} paths")

    # Group by quadrant
    quadrant_paths = {q: [] for q in QUADRANTS.keys()}

    for path_text, (start_x, start_y) in paths:
        quadrant = classify_point(start_x, start_y)
        quadrant_paths[quadrant].append((path_text, start_x, start_y))

    # Statistics
    for q, path_list in quadrant_paths.items():
        print(f"{q} ({QUADRANTS[q]['name']}): {len(path_list)} paths")

    # Process each quadrant
    for quad, info in QUADRANTS.items():
        paths = quadrant_paths[quad]
        if not paths:
            print(f"Warning: No paths for {quad}")
            continue

        # Find bounding box for this quadrant
        all_coords = []
        for path_text, px, py in paths:
            coords = re.findall(r'(\d+\.\d+)\s+(\d+\.\d+)', path_text)
            for cx, cy in coords:
                all_coords.append((float(cx), float(cy)))

        if not all_coords:
            continue

        min_x = min(c[0] for c in all_coords)
        min_y = min(c[1] for c in all_coords)
        max_x = max(c[0] for c in all_coords)
        max_y = max(c[1] for c in all_coords)

        width = max_x - min_x
        height = max_y - min_y

        # Translate paths to origin
        translated_paths = []
        for path_text, px, py in paths:
            translated = translate_coords(path_text, min_x, min_y)
            translated_paths.append(translated)

        # Create EPS file
        eps_content = f"""%!PS-Adobe-3.0 EPSF-3.0
%%Title: Stomach Character - {info['name']}
%%Creator: Split from original EPS
%%BoundingBox: 0 0 {int(width)} {int(height)}
%%HiResBoundingBox: {min_x} {min_y} {max_x} {max_y}
%%CropBox: 0 0 {width} {height}
%%LanguageLevel: 2
%%DocumentData: Clean7Bit
%%Pages: 1
%%EndComments

{header}
%%EndSetup
%%BeginPageSetup
%%EndPageSetup

%% Start of character paths
{''.join(translated_paths)}
%% End of character paths
{trailer}
"""

        filename = f"stomach_{info['name']}.eps"
        with open(filename, 'w') as f:
            f.write(eps_content)

        print(f"Created: {filename} (size: {int(width)}x{int(height)}, {len(paths)} paths)")

if __name__ == '__main__':
    eps_file = 'set_of_cute_hand_drawn_human_stomachs_feeling_love_ill_holding_balloon_wearing_crown.eps'
    content = read_eps(eps_file)
    split_and_translate(content)
