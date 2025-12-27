#!/usr/bin/env python3
"""
Process the SECOND EPS set: Confused, Angry, Happy, Sad
Split into 4 characters, then separate ALL individual shapes.
"""

import re
import os
from collections import defaultdict

SECOND_EPS = 'set_of_cute_hand_drawn_human_stomachs_with_confused_angry_happy_sad_expressions.eps'

# Will be determined after analyzing colors
COLOR_MAP = {}  # To be filled after color analysis

def read_eps(filepath):
    with open(filepath, 'r', encoding='latin1', errors='ignore') as f:
        return f.read()

def parse_rgb_color(line):
    match = re.match(r'\s*([.\d]+)\s+([.\d]+)\s+([.\d]+)\s+rgb', line)
    if match:
        r = int(float(match.group(1)) * 255)
        g = int(float(match.group(2)) * 255)
        b = int(float(match.group(3)) * 255)
        return (r, g, b)
    return None

def get_shape_bounds(path_text):
    coords = re.findall(r'([.\d]+)\s+([.\d]+)', path_text)
    if coords:
        xs = [float(c[0]) for c in coords]
        ys = [float(c[1]) for c in coords]
        return (min(xs), max(xs), min(ys), max(ys))
    return (0, 0, 0, 0)

def classify_quadrant(x, y):
    mid_x = 451
    mid_y = 474
    if x < mid_x and y >= mid_y:
        return 'confused'  # top-left
    elif x >= mid_x and y >= mid_y:
        return 'angry'     # top-right
    elif x < mid_x and y < mid_y:
        return 'happy'     # bottom-left
    else:
        return 'sad'       # bottom-right

def analyze_colors_by_quadrant(content):
    """Analyze which colors belong to which quadrant/emotion."""
    lines = content.split('\n')

    quadrant_colors = {
        'confused': defaultdict(int),
        'angry': defaultdict(int),
        'happy': defaultdict(int),
        'sad': defaultdict(int)
    }

    current_quadrant = None
    current_color = None
    mo_pattern = re.compile(r'([.\d]+)\s+([.\d]+)\s+mo')

    for line in lines:
        color = parse_rgb_color(line)
        if color:
            current_color = color

        mo_match = mo_pattern.search(line)
        if mo_match and current_color:
            x = float(mo_match.group(1))
            y = float(mo_match.group(2))
            quadrant = classify_quadrant(x, y)
            quadrant_colors[quadrant][current_color] += 1

    return quadrant_colors

def split_by_quadrant(content):
    """Split EPS into 4 files by quadrant."""
    lines = content.split('\n')

    # Extract header
    header_match = re.search(r'(.*?%%BeginSetup)', content, re.DOTALL)
    header = header_match.group(0) + '\n' if header_match else content[:5000]

    # Extract trailer
    trailer_match = re.search(r'(%ADOBeginClientInjection: EndPageContent.*?%%EOF)', content, re.DOTALL)
    trailer = '\n' + trailer_match.group(0) if trailer_match else "\n%%EOF\n"

    # Extract path data
    path_match = re.search(r'%%EndSetup\s*(.*?)%ADOBeginClientInjection: EndPageContent', content, re.DOTALL)
    path_data = path_match.group(1) if path_match else ""

    # Split paths by quadrant
    quadrant_paths = {'confused': [], 'angry': [], 'happy': [], 'sad': []}

    mo_pattern = re.compile(r'([.\d]+)\s+([.\d]+)\s+mo')
    lines = path_data.split('\n')
    current_path = []
    current_start = None

    for line in lines:
        mo_match = mo_pattern.search(line)
        if mo_match:
            if current_path and current_start:
                path_text = ''.join(current_path)
                quadrant = classify_quadrant(current_start[0], current_start[1])
                quadrant_paths[quadrant].append(path_text)
            current_start = (float(mo_match.group(1)), float(mo_match.group(2)))
            current_path = []

        current_path.append(line + '\n')

        if re.search(r'\bf\s*$', line):
            if current_path and current_start:
                path_text = ''.join(current_path)
                quadrant = classify_quadrant(current_start[0], current_start[1])
                quadrant_paths[quadrant].append(path_text)
            current_path = []
            current_start = None

    # Save last path
    if current_path and current_start:
        path_text = ''.join(current_path)
        quadrant = classify_quadrant(current_start[0], current_start[1])
        quadrant_paths[quadrant].append(path_text)

    # Create EPS files for each character
    for name, paths in quadrant_paths.items():
        if not paths:
            continue

        # Calculate bounding box
        all_coords = []
        for p in paths:
            coords = re.findall(r'([.\d]+)\s+([.\d]+)', p)
            for cx, cy in coords:
                all_coords.append((float(cx), float(cy)))

        if all_coords:
            min_x = min(c[0] for c in all_coords)
            max_x = max(c[0] for c in all_coords)
            min_y = min(c[1] for c in all_coords)
            max_y = max(c[1] for c in all_coords)

            # Translate to origin
            offset_x, offset_y = min_x, min_y

            def translate(match):
                x = float(match.group(1)) - offset_x
                y = float(match.group(2)) - offset_y
                return f"{x:.4f} {y:.4f}"

            translated_paths = [re.sub(r'([.\d]+)\s+([.\d]+)', translate, p) for p in paths]

            eps_content = f"""%!PS-Adobe-3.0 EPSF-3.0
%%Title: Stomach - {name.capitalize()}
%%Creator: Split from second EPS set
%%BoundingBox: 0 0 {int(max_x-min_x)} {int(max_y-min_y)}
%%HiResBoundingBox: {min_x} {min_y} {max_x} {max_y}
%%EndComments

{header}
%%EndSetup
%%BeginPageSetup
%%EndPageSetup

{''.join(translated_paths)}

{trailer}
"""

            filename = f"stomach_{name}.eps"
            with open(filename, 'w') as f:
                f.write(eps_content)
            print(f"Created: {filename} ({len(paths)} paths)")

def extract_all_shapes_split(content, color_map):
    """Extract every discrete shape, organized by component name."""
    lines = content.split('\n')
    shapes = defaultdict(list)
    component_counter = defaultdict(int)

    current_color = None
    current_rgb = None
    current_path_lines = []

    for line in lines:
        color = parse_rgb_color(line)

        if color:
            if current_path_lines and current_rgb:
                path_text = ''.join(current_path_lines)
                bounds = get_shape_bounds(path_text)
                component_name = color_map.get(current_rgb, f'unknown_{current_rgb}')

                component_counter[component_name] += 1
                local_idx = component_counter[component_name]

                shapes[component_name].append({
                    'index': local_idx,
                    'color': current_rgb,
                    'path': path_text,
                    'bounds': bounds
                })

            current_rgb = color
            current_path_lines = []

        current_path_lines.append(line + '\n')

    # Last shape
    if current_path_lines and current_rgb:
        path_text = ''.join(current_path_lines)
        bounds = get_shape_bounds(path_text)
        component_name = color_map.get(current_rgb, f'unknown_{current_rgb}')

        component_counter[component_name] += 1
        local_idx = component_counter[component_name]

        shapes[component_name].append({
            'index': local_idx,
            'color': current_rgb,
            'path': path_text,
            'bounds': bounds
        })

    return shapes

def build_color_map(content):
    """Build color map based on frequency and position."""
    lines = content.split('\n')
    colors_found = []

    current_color = None
    current_coords = []
    mo_pattern = re.compile(r'([.\d]+)\s+([.\d]+)\s+mo')

    for line in lines:
        color = parse_rgb_color(line)
        if color:
            if current_color and current_coords:
                colors_found.append((current_color, len(current_coords), current_coords[:]))
            current_color = color
            current_coords = []

        mo_match = mo_pattern.search(line)
        if mo_match and current_color:
            current_coords.append((float(mo_match.group(1)), float(mo_match.group(2))))

    if current_color and current_coords:
        colors_found.append((current_color, len(current_coords), current_coords))

    # Build map - assign names based on color and frequency
    color_map = {}
    used_names = set()

    # Common body colors (likely in all emotions)
    color_map[(163, 5, 52)] = 'body_main'
    color_map[(93, 4, 28)] = 'body_outline'
    color_map[(253, 114, 112)] = 'cheeks_blush'
    color_map[(255, 255, 255)] = 'eyes_white'
    color_map[(211, 63, 89)] = 'mouth'

    # Unique colors - assign generic names
    idx = 1
    for color, count, coords in sorted(colors_found, key=lambda x: -x[1]):
        if color not in color_map:
            color_map[color] = f'extra_{idx}'
            idx += 1

    return color_map

def main():
    print("=" * 80)
    print("PROCESSING SECOND EPS SET: Confused, Angry, Happy, Sad")
    print("=" * 80)

    content = read_eps(SECOND_EPS)

    # First, analyze colors per quadrant
    print("\nAnalyzing colors per emotion...")
    quadrant_colors = analyze_colors_by_quadrant(content)

    for emotion, colors in quadrant_colors.items():
        print(f"\n{emotion.upper()}:")
        for color, count in sorted(colors.items(), key=lambda x: -x[1])[:8]:
            print(f"  RGB{color}: {count} shapes")

    # Build color map
    print("\n" + "=" * 80)
    print("Splitting into 4 character files...")
    print("=" * 80)
    split_by_quadrant(content)

    # Now process each character file
    characters = [
        ('stomach_confused.eps', 'confused'),
        ('stomach_angry.eps', 'angry'),
        ('stomach_happy.eps', 'happy'),
        ('stomach_sad.eps', 'sad'),
    ]

    print("\n" + "=" * 80)
    print("Splitting ALL individual shapes...")
    print("=" * 80)

    grand_total = 0

    for filename, char_name in characters:
        if not os.path.exists(filename):
            print(f"\nWarning: {filename} not found")
            continue

        with open(filename, 'r', encoding='latin1', errors='ignore') as f:
            char_content = f.read()

        color_map = build_color_map(char_content)

        # Get header/trailer
        header_match = re.search(r'(.*?%%BeginSetup)', char_content, re.DOTALL)
        header = header_match.group(0) + '\n' if header_match else char_content[:5000]

        trailer_match = re.search(r'(%ADOBeginClientInjection: EndPageContent.*?%%EOF)', char_content, re.DOTALL)
        trailer = '\n' + trailer_match.group(0) if trailer_match else "\n%%EOF\n"

        shapes = extract_all_shapes_split(char_content, color_map)

        # Create nested structure
        base_dir = f'{char_name}_parts'
        os.makedirs(base_dir, exist_ok=True)

        print(f"\n{char_name.upper()}: {len(shapes)} component groups")

        total_for_char = 0
        for comp_name, shape_list in sorted(shapes.items()):
            if not shape_list:
                continue

            comp_dir = os.path.join(base_dir, comp_name)
            os.makedirs(comp_dir, exist_ok=True)

            print(f"  {comp_name}/: {len(shape_list)} shapes")

            for shape in shape_list:
                idx = shape['index']
                rgb = shape['color']
                path = shape['path']
                min_x, max_x, min_y, max_y = shape['bounds']

                eps_content = f"""%!PS-Adobe-3.0 EPSF-3.0
%%Title: {char_name} - {comp_name} - shape_{idx:02d}
%%BoundingBox: {int(min_x)} {int(min_y)} {int(max_x)} {int(max_y)}
%%EndComments

{header}
%%EndSetup

{path}

{trailer}
"""

                eps_file = os.path.join(comp_dir, f'{char_name}_{comp_name}_{idx:02d}.eps')
                with open(eps_file, 'w') as f:
                    f.write(eps_content)

                total_for_char += 1

        print(f"  Total: {total_for_char} individual shape files")
        grand_total += total_for_char

    print("\n" + "=" * 80)
    print("COMPLETE! Second set processed:")
    print("=" * 80)
    print(f"Total shapes extracted: {grand_total}")
    print("\nNow you have 8 emotions total:")
    print("  Set 1: love, crown, balloon, ill")
    print("  Set 2: confused, angry, happy, sad")

if __name__ == '__main__':
    main()
