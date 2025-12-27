#!/usr/bin/env python3
"""
Split EACH discrete shape into its own file with nested folder structure.
This gives full control for animation - each body part can be manipulated independently.
"""

import re
import os
from collections import defaultdict

CHARACTERS = [
    ('stomach_01_love.eps', 'love', {
        (163, 5, 52): 'body_main',
        (93, 4, 28): 'body_outline',
        (253, 114, 112): 'cheeks_blush',
        (255, 255, 255): 'eyes_white',
        (211, 63, 89): 'mouth',
        (174, 117, 177): 'heart_1',
        (202, 135, 209): 'heart_2',
        (223, 149, 233): 'heart_3',
        (251, 214, 56): 'accessory',
        (251, 188, 207): 'extra_1',
        (211, 135, 0): 'extra_2',
        (255, 13, 54): 'extra_3',
        (253, 82, 121): 'extra_4',
        (255, 151, 149): 'extra_5',
    }),
    ('stomach_02_crown.eps', 'crown', {
        (163, 5, 52): 'body_main',
        (93, 4, 28): 'body_outline',
        (253, 114, 112): 'cheeks_blush',
        (255, 255, 255): 'eyes_white',
        (211, 63, 89): 'mouth',
        (239, 165, 8): 'crown_gold',
        (255, 218, 61): 'crown_light',
        (253, 255, 177): 'crown_highlight',
        (253, 237, 86): 'crown_gem',
        (252, 255, 141): 'crown_gem_light',
        (251, 188, 207): 'extra_1',
        (211, 135, 0): 'extra_2',
        (255, 13, 54): 'extra_3',
        (253, 82, 121): 'extra_4',
        (255, 151, 149): 'extra_5',
    }),
    ('stomach_03_balloon.eps', 'balloon', {
        (163, 5, 52): 'body_main',
        (93, 4, 28): 'body_outline',
        (253, 114, 112): 'cheeks_blush',
        (255, 255, 255): 'eyes_white',
        (211, 63, 89): 'mouth',
        (255, 33, 66): 'balloon_red',
        (251, 188, 207): 'extra_1',
        (211, 135, 0): 'extra_2',
        (253, 82, 121): 'extra_3',
        (255, 151, 149): 'extra_4',
    }),
    ('stomach_04_ill.eps', 'ill', {
        (163, 5, 52): 'body_main',
        (93, 4, 28): 'body_outline',
        (255, 255, 255): 'eyes_white',
        (131, 128, 36): 'sick_green_dark',
        (163, 163, 58): 'sick_green_light',
        (191, 195, 87): 'sick_gradient',
        (228, 228, 105): 'sick_pale',
        (251, 188, 207): 'extra_1',
        (253, 82, 121): 'extra_2',
        (255, 151, 149): 'extra_3',
    }),
]

def parse_rgb_color(line):
    match = re.match(r'\s*([.\d]+)\s+([.\d]+)\s+([.\d]+)\s+rgb', line)
    if match:
        r = int(float(match.group(1)) * 255)
        g = int(float(match.group(2)) * 255)
        b = int(float(match.group(3)) * 255)
        return (r, g, b)
    return None

def get_shape_bounds(path_text):
    """Get bounding box from path text."""
    coords = re.findall(r'([.\d]+)\s+([.\d]+)', path_text)
    if coords:
        xs = [float(c[0]) for c in coords]
        ys = [float(c[1]) for c in coords]
        return (min(xs), max(xs), min(ys), max(ys))
    return (0, 0, 0, 0)

def extract_all_shapes(content, color_map):
    """
    Extract EVERY discrete shape as a separate item.
    Returns: {component_name: [(shape_index, color, path_text, bounds), ...]}
    """
    lines = content.split('\n')
    shapes = defaultdict(list)

    current_color = None
    current_rgb = None
    current_path_lines = []
    shape_index = 0
    component_counter = defaultdict(int)

    for i, line in enumerate(lines):
        color = parse_rgb_color(line)

        if color:
            # Save previous shape if exists
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

        # Check if this ends a shape
        if line.strip() == 'f' and current_rgb:
            pass

    # Don't forget last shape
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

def create_nested_structure(shapes, char_name, header, trailer):
    """Create nested folder structure with each shape as separate file."""
    base_dir = f'{char_name}_parts'
    os.makedirs(base_dir, exist_ok=True)

    print(f"\n{'='*60}")
    print(f"{char_name.upper()} - Creating individual shape files:")
    print(f"{'='*60}")

    total_shapes = 0

    for component_name, shape_list in sorted(shapes.items()):
        if not shape_list:
            continue

        # Create subfolder for this component
        component_dir = os.path.join(base_dir, component_name)
        os.makedirs(component_dir, exist_ok=True)

        print(f"\n{component_name}/: {len(shape_list)} shapes")

        for shape in shape_list:
            idx = shape['index']
            rgb = shape['color']
            path = shape['path']
            min_x, max_x, min_y, max_y = shape['bounds']

            # Create individual EPS for this shape
            eps_content = f"""%!PS-Adobe-3.0 EPSF-3.0
%%Title: {char_name} - {component_name} - shape_{idx:02d}
%%BoundingBox: {int(min_x)} {int(min_y)} {int(max_x)} {int(max_y)}
%%HiResBoundingBox: {min_x} {min_y} {max_x} {max_y}
%%Creator: Individual shape extractor
%%EndComments

{header}
%%EndSetup

%% Shape {idx:02d} - RGB{rgb}
{path}

{trailer}
"""

            filename = os.path.join(component_dir, f'{char_name}_{component_name}_{idx:02d}.eps')
            with open(filename, 'w') as f:
                f.write(eps_content)

            total_shapes += 1
            print(f"  ├─ shape_{idx:02d}.eps (bounds: {int(min_x)},{int(min_y)} to {int(max_x)},{int(max_y)})")

    return total_shapes

def get_eps_header(content):
    match = re.search(r'(.*?%%BeginSetup)', content, re.DOTALL)
    if match:
        return match.group(0) + '\n'
    return content[:5000]

def get_eps_trailer(content):
    match = re.search(r'(%ADOBeginClientInjection: EndPageContent.*?%%EOF)', content, re.DOTALL)
    if match:
        return '\n' + match.group(0)
    return "\n%%EOF\n"

def process_character(filename, char_name, color_map):
    if not os.path.exists(filename):
        print(f"Warning: {filename} not found")
        return 0

    with open(filename, 'r', encoding='latin1', errors='ignore') as f:
        content = f.read()

    header = get_eps_header(content)
    trailer = get_eps_trailer(content)

    shapes = extract_all_shapes(content, color_map)
    total = create_nested_structure(shapes, char_name, header, trailer)

    return total

def main():
    print("=" * 80)
    print("SPLITTING EVERY DISCRETE SHAPE INTO SEPARATE FILES")
    print("=" * 80)

    grand_total = 0
    summary = []

    for filename, char_name, color_map in CHARACTERS:
        count = process_character(filename, char_name, color_map)
        grand_total += count
        summary.append((char_name, count))

    print("\n" + "=" * 80)
    print("COMPLETE! Nested folder structure created:")
    print("=" * 80)

    for char_name, count in summary:
        print(f"  {char_name}_parts/ - {count} individual shape files")

    print(f"\nTotal shapes extracted: {grand_total}")
    print("\nEach shape can now be:")
    print("  ✓ Animated independently (rotate, scale, translate)")
    print("  ✓ Recolored individually")
    print("  ✓ Shown/hidden for different expressions")
    print("  ✓ Combined across characters for new emotions")

if __name__ == '__main__':
    main()
