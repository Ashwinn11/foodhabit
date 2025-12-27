#!/usr/bin/env python3
"""
Split the 4-character EPS file into separate EPS files.
Each character is in a different quadrant of the 902x948 canvas.
"""

import re
import sys

# Canvas dimensions
CANVAS_WIDTH = 902
CANVAS_HEIGHT = 948
MID_X = CANVAS_WIDTH / 2
MID_Y = CANVAS_HEIGHT / 2

# Quadrant definitions
QUADRANTS = {
    'upper-left': {'name': '01_love', 'x_max': MID_X, 'y_min': MID_Y},
    'upper-right': {'name': '02_crown', 'x_min': MID_X, 'y_min': MID_Y},
    'lower-left': {'name': '03_balloon', 'x_max': MID_X, 'y_max': MID_Y},
    'lower-right': {'name': '04_ill', 'x_min': MID_X, 'y_max': MID_Y},
}

def read_eps(filepath):
    """Read EPS file with proper encoding."""
    with open(filepath, 'r', encoding='latin1', errors='ignore') as f:
        return f.read()

def get_header(content):
    """Extract the EPS header up to %%BeginSetup."""
    match = re.search(r'(.*?%%BeginSetup)', content, re.DOTALL)
    if match:
        return match.group(0) + '\n'
    return content[:5000]  # Fallback

def get_trailer(content):
    """Extract the trailer after path data ends."""
    # Find where path data ends (before %ADOBeginClientInjection: EndPageContent)
    match = re.search(r'(%ADOBeginClientInjection: EndPageContent.*?$)', content, re.DOTALL)
    if match:
        return match.group(0)
    return ""

def extract_paths_with_coords(content):
    """
    Extract paths from EPS with their starting coordinates.
    Returns list of (path_string, x, y) tuples.
    """
    paths = []

    # Pattern to match a complete path (mo -> cp or f)
    # This is a simplified pattern - looks for path blocks
    path_pattern = r'((?:\d+\.\d+\s+\d+\.\d+\s+mo.*?(?:cp\s+|f\s+|\n\s*\n)))'

    matches = re.finditer(path_pattern, content, re.DOTALL)

    for match in matches:
        path_text = match.group(0)
        # Extract the first moveto coordinate
        mo_match = re.search(r'(\d+\.\d+)\s+(\d+\.\d+)\s+mo', path_text)
        if mo_match:
            x = float(mo_match.group(1))
            y = float(mo_match.group(2))
            paths.append((path_text, x, y))

    return paths

def classify_path(x, y):
    """Determine which quadrant a path belongs to."""
    if x < MID_X and y >= MID_Y:
        return 'upper-left'
    elif x >= MID_X and y >= MID_Y:
        return 'upper-right'
    elif x < MID_X and y < MID_Y:
        return 'lower-left'
    else:
        return 'lower-right'

def split_eps_by_quadrant(content):
    """Split EPS into 4 files based on quadrants."""

    header = get_header(content)
    trailer = get_trailer(content)

    # Extract all paths with coordinates
    print("Extracting paths...")
    paths = extract_paths_with_coords(content)
    print(f"Found {len(paths)} paths")

    # Initialize quadrant paths
    quadrant_paths = {q: [] for q in QUADRANTS.keys()}

    # Classify each path
    for path_text, x, y in paths:
        quadrant = classify_path(x, y)
        quadrant_paths[quadrant].append((path_text, x, y))

    # Print statistics
    for q, paths in quadrant_paths.items():
        print(f"{q}: {len(paths)} paths")

    # Generate EPS files for each quadrant
    for quad, info in QUADRANTS.items():
        paths = quadrant_paths[quad]
        if not paths:
            print(f"Warning: No paths found for {quad}")
            continue

        # Calculate bounding box for this quadrant
        coords = []
        for path_text, x, y in paths:
            coord_matches = re.findall(r'(\d+\.\d+)\s+(\d+\.\d+)', path_text)
            for cx, cy in coord_matches:
                coords.append((float(cx), float(cy)))

        if coords:
            min_x = int(min(c[0] for c in coords))
            min_y = int(min(c[1] for c in coords))
            max_x = int(max(c[0] for c in coords))
            max_y = int(max(c[1] for c in coords))

            # Calculate width and height
            width = max_x - min_x
            height = max_y - min_y

            # Create the EPS file
            eps_content = f"""%!PS-Adobe-3.0 EPSF-3.0
%%BoundingBox: {min_x} {min_y} {max_x} {max_y}
%%HiResBoundingBox: {min_x} {min_y} {max_x} {max_y}
%%Title: Stomach Character - {info['name']}
%%Creator: Split from original EPS
{header}
%%EndSetup
%%BeginPageSetup
<< /PageSize [{width} {height}] >> setpagedevice
%%EndPageSetup

{"".join([p[0] for p in paths])}
{trailer}
%%EOF
"""

            filename = f"stomach_{info['name']}.eps"
            with open(filename, 'w') as f:
                f.write(eps_content)
            print(f"Created: {filename} ({len(paths)} paths, bbox: {min_x},{min_y} to {max_x},{max_y})")

if __name__ == '__main__':
    eps_file = 'set_of_cute_hand_drawn_human_stomachs_feeling_love_ill_holding_balloon_wearing_crown.eps'
    content = read_eps(eps_file)
    split_eps_by_quadrant(content)
