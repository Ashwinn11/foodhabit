#!/usr/bin/env python3
"""
Separate each stomach character into animatable component groups.
Creates individual EPS files for each component (body, eyes, mouth, accessories).
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
    """Parse RGB color from line."""
    match = re.match(r'\s*([.\d]+)\s+([.\d]+)\s+([.\d]+)\s+rgb', line)
    if match:
        r = int(float(match.group(1)) * 255)
        g = int(float(match.group(2)) * 255)
        b = int(float(match.group(3)) * 255)
        return (r, g, b)
    return None

def extract_component_paths(content, color_map):
    """
    Extract paths grouped by component name.
    Returns dict: {component_name: [(color, path_text), ...]}
    """
    lines = content.split('\n')
    components = defaultdict(list)

    current_color = None
    current_path_lines = []
    current_rgb = None

    for i, line in enumerate(lines):
        color = parse_rgb_color(line)

        if color:
            # Save previous path group
            if current_path_lines and current_rgb:
                component_name = color_map.get(current_rgb, f'unknown_{current_rgb}')
                path_text = ''.join(current_path_lines)
                components[component_name].append({
                    'color': current_rgb,
                    'paths': path_text
                })
            current_rgb = color
            current_path_lines = []

        current_path_lines.append(line + '\n')

    # Don't forget last group
    if current_path_lines and current_rgb:
        component_name = color_map.get(current_rgb, f'unknown_{current_rgb}')
        path_text = ''.join(current_path_lines)
        components[component_name].append({
            'color': current_rgb,
            'paths': path_text
        })

    return components

def create_component_eps(components, character_name, header, trailer):
    """Create individual EPS files for each component."""
    output_dir = f'{character_name}_components'
    os.makedirs(output_dir, exist_ok=True)

    print(f"\nCreating components for {character_name}:")

    for comp_name, items in components.items():
        if not items:
            continue

        # Combine all paths for this component
        all_paths = ''.join(item['paths'] for item in items)

        # Create EPS file
        eps_content = f"""%!PS-Adobe-3.0 EPSF-3.0
%%Title: {character_name} - {comp_name}
%%Creator: Component separator
%%EndComments

{header}
%%EndSetup

%% Component: {comp_name}
{all_paths}

{trailer}
"""

        filename = os.path.join(output_dir, f'{character_name}_{comp_name}.eps')
        with open(filename, 'w') as f:
            f.write(eps_content)

        print(f"  Created: {comp_name} ({len(items)} color groups)")

def get_eps_header(content):
    """Extract EPS header."""
    match = re.search(r'(.*?%%BeginSetup)', content, re.DOTALL)
    if match:
        return match.group(0) + '\n'
    return content[:5000]

def get_eps_trailer(content):
    """Extract EPS trailer."""
    match = re.search(r'(%ADOBeginClientInjection: EndPageContent.*?%%EOF)', content, re.DOTALL)
    if match:
        return '\n' + match.group(0)
    return "\n%%EOF\n"

def process_character(filename, char_name, color_map):
    """Process a character file and separate components."""
    if not os.path.exists(filename):
        print(f"Warning: {filename} not found")
        return

    with open(filename, 'r', encoding='latin1', errors='ignore') as f:
        content = f.read()

    header = get_eps_header(content)
    trailer = get_eps_trailer(content)

    components = extract_component_paths(content, color_map)
    create_component_eps(components, char_name, header, trailer)

    # Also create a summary
    print(f"  Total components: {len(components)}")
    return components

def main():
    print("=" * 80)
    print("COMPONENT SEPARATION FOR ANIMATION")
    print("=" * 80)

    all_components = {}

    for filename, char_name, color_map in CHARACTERS:
        comps = process_character(filename, char_name, color_map)
        if comps:
            all_components[char_name] = comps

    print("\n" + "=" * 80)
    print("COMPLETE! Component folders created:")
    print("=" * 80)
    for _, char_name, _ in CHARACTERS:
        print(f"  {char_name}_components/")

    print("\nEach component can now be:")
    print("  - Animated independently")
    print("  - Recolored/styled separately")
    print("  - Combined in new configurations")

if __name__ == '__main__':
    main()
