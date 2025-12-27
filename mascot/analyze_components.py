#!/usr/bin/env python3
"""
Analyze and separate components within each stomach character for animation.
Components are identified by color and spatial grouping.
"""

import re
from collections import defaultdict

CHARACTERS = [
    ('stomach_01_love.eps', 'Love'),
    ('stomach_02_crown.eps', 'Crown'),
    ('stomach_03_balloon.eps', 'Balloon'),
    ('stomach_04_ill.eps', 'Ill')
]

def parse_rgb_color(line):
    """Parse RGB color from line like '.988235 .839216 .219608 rgb'"""
    match = re.match(r'\s*([.\d]+)\s+([.\d]+)\s+([.\d]+)\s+rgb', line)
    if match:
        r = int(float(match.group(1)) * 255)
        g = int(float(match.group(2)) * 255)
        b = int(float(match.group(3)) * 255)
        return (r, g, b)
    return None

def extract_colored_groups(content):
    """
    Extract groups of paths with their colors.
    Each group ends with 'f' (fill) after an rgb color declaration.
    """
    lines = content.split('\n')
    groups = []
    current_color = None
    current_paths = []
    current_coords = []

    mo_pattern = re.compile(r'([.\d]+)\s+([.\d]+)\s+mo')

    for i, line in enumerate(lines):
        # Check for color declaration
        color = parse_rgb_color(line)
        if color:
            # Save previous group
            if current_paths and current_color:
                groups.append({
                    'color': current_color,
                    'paths': current_paths[:],
                    'coords': current_coords[:],
                    'line_start': current_paths[0] if current_paths else None
                })
            current_color = color
            current_paths = []
            current_coords = []

        # Track moveto coordinates for spatial analysis
        mo_match = mo_pattern.search(line)
        if mo_match:
            x = float(mo_match.group(1))
            y = float(mo_match.group(2))
            current_coords.append((x, y))
            if not current_paths:
                current_paths.append(i)

        # Check for fill (end of current shape)
        if line.strip() == 'f' and current_color:
            pass  # Shape ends

    # Don't forget the last group
    if current_paths and current_color:
        groups.append({
            'color': current_color,
            'paths': current_paths,
            'coords': current_coords,
            'line_start': current_paths[0] if current_paths else None
        })

    return groups

def analyze_character(filepath):
    """Analyze a character's EPS file and identify components."""
    with open(filepath, 'r', encoding='latin1', errors='ignore') as f:
        content = f.read()

    groups = extract_colored_groups(content)

    # Group by color
    color_groups = defaultdict(lambda: {'count': 0, 'all_coords': []})
    for group in groups:
        color = group['color']
        color_groups[color]['count'] += 1
        color_groups[color]['all_coords'].extend(group['coords'])

    # Calculate bounding boxes for each color
    result = {}
    for color, data in color_groups.items():
        if data['all_coords']:
            xs = [c[0] for c in data['all_coords']]
            ys = [c[1] for c in data['all_coords']]
            result[color] = {
                'count': data['count'],
                'bbox': (min(xs), max(xs), min(ys), max(ys)),
                'center': ((min(xs)+max(xs))/2, (min(ys)+max(ys))/2)
            }

    return result

def main():
    print("=" * 80)
    print("COMPONENT ANALYSIS - Stomach Characters")
    print("=" * 80)

    all_data = {}
    for filename, name in CHARACTERS:
        try:
            data = analyze_character(filename)
            all_data[name] = data
            print(f"\n{name} ({filename}):")
            print(f"  Total color components: {len(data)}")
            for color in sorted(data.keys()):
                info = data[color]
                print(f"    RGB{color}: {info['count']} shapes")
                print(f"      Position: center=({info['center'][0]:.0f}, {info['center'][1]:.0f})")
        except Exception as e:
            print(f"\n{name}: Error - {e}")
            import traceback
            traceback.print_exc()

    # Find common colors (base anatomy)
    if len(all_data) == 4:
        all_color_sets = {name: set(data.keys()) for name, data in all_data.items()}

        common = set.intersection(*all_color_sets.values())
        print(f"\n{'='*80}")
        print("BASE ANATOMY (colors in ALL 4 characters):")
        print(f"{'='*80}")
        for color in sorted(common):
            print(f"  RGB{color}")

        print(f"\n{'='*80}")
        print("UNIQUE COMPONENTS (accessories/emotions):")
        print(f"{'='*80}")

        for name, colors in all_color_sets.items():
            others = set()
            for other_name, other_colors in all_color_sets.items():
                if other_name != name:
                    others.update(other_colors)
            unique = colors - others
            if unique:
                print(f"\n{name}:")
                for color in sorted(unique):
                    info = all_data[name][color]
                    print(f"  RGB{color}: {info['count']} shapes at ({info['center'][0]:.0f}, {info['center'][1]:.0f})")
            else:
                print(f"\n{name}: No unique colors")

if __name__ == '__main__':
    main()
