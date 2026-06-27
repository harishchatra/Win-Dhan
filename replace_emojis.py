import os
import re
import urllib.request

EMOJI_TO_LUCIDE = {
    '⚡': 'zap',
    '☀️': 'sun',
    '🔋': 'battery',
    '🚢': 'ship',
    '🎓': 'graduation-cap',
    '🔬': 'microscope',
    '🏫': 'school',
    '📞': 'phone',
    '✉️': 'mail',
    '🌐': 'globe',
    '📍': 'map-pin',
    '🏛️': 'landmark',
    '🏪': 'store',
    '⭐': 'star',
    '📂': 'folder',
    '👥': 'users',
    '👤': 'user',
    '🤝': 'handshake',
    '💳': 'credit-card',
    '🏆': 'trophy',
    '📋': 'clipboard',
    '📅': 'calendar',
    '📢': 'megaphone',
    '🖨️': 'printer',
    '⚙️': 'settings',
    '🚪': 'door-open',
    '🔍': 'search',
    '🔔': 'bell',
    '📊': 'bar-chart',
    '🗺️': 'map',
    '🛠️': 'wrench',
    '➕': 'plus',
    '➖': 'minus',
    '⟲': 'rotate-ccw',
    '🇮🇳': 'map-pin',
    '🇦🇪': 'map-pin',
    '🇸🇦': 'map-pin',
    '🇩🇪': 'map-pin',
    '🇩🇰': 'map-pin',
    '🇨🇳': 'map-pin',
    '🇯🇵': 'map-pin',
    '🇸🇬': 'map-pin',
    '🇰🇪': 'map-pin',
    '🇧🇷': 'map-pin',
}

svg_cache = {}

def get_svg(icon_name):
    if icon_name in svg_cache:
        return svg_cache[icon_name]
    
    url = f"https://unpkg.com/lucide-static@latest/icons/{icon_name}.svg"
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response:
            svg = response.read().decode('utf-8')
            # Add inline classes for sizing if needed
            svg = svg.replace('<svg', '<svg class="lucide-icon" style="width:1em; height:1em; vertical-align:-0.125em;"')
            svg_cache[icon_name] = svg
            return svg
    except Exception as e:
        print(f"Failed to fetch {icon_name}: {e}")
        return None

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    changed = False
    for emoji, icon_name in EMOJI_TO_LUCIDE.items():
        if emoji in content:
            svg = get_svg(icon_name)
            if svg:
                content = content.replace(emoji, svg)
                changed = True
    
    if changed:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filepath}")

def main():
    public_dir = 'C:\\DhanWin Website\\public'
    for root, _, files in os.walk(public_dir):
        for file in files:
            if file.endswith('.html') or file.endswith('.js'):
                process_file(os.path.join(root, file))
                
if __name__ == '__main__':
    main()
