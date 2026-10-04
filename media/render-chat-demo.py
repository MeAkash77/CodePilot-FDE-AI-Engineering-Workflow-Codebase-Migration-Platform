"""Render an edited terminal replay from chat-demo.json (requires Pillow)."""
import argparse
import json
import textwrap
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--font', required=True, help='Path to a monospace TrueType font')
args = parser.parse_args()
root = Path(__file__).resolve().parents[1]
scenes = json.loads((root / 'media/chat-demo.json').read_text())['scenes']
width, height = 960, 430
background = '#101617'
foreground = '#ededed'
muted = '#a3b1b4'
green = '#22ff9c'
fonts = {size: ImageFont.truetype(args.font, size) for size in (15, 17, 20)}
line_height = 27
visible_lines = 12
columns = int((width - 48) / fonts[20].getlength('M'))
history = [
    ('FDEOps | Insurance: know-your-customer (KYC) review', muted),
    ('', muted),
]
frames, durations = [], []


def render(lines, customer, stage):
    image = Image.new('RGB', (width, height), background)
    draw = ImageDraw.Draw(image)
    draw.rectangle((0, 0, width, 42), fill='#1b2325')
    for x, color in ((18, '#ef7069'), (38, '#eabd5b'), (58, '#55bd7b')):
        draw.ellipse((x, 16, x + 10, 26), fill=color)
    draw.text((92, 12), 'FDEOps / ' + customer, font=fonts[17], fill=muted)
    for index, (line, color) in enumerate(lines[-visible_lines:]):
        assert draw.textlength(line, font=fonts[20]) <= width - 48, line
        draw.text((24, 56 + index * line_height), line, font=fonts[20], fill=color)
    draw.line((24, 388, width - 24, 388), fill='#344044')
    draw.text((24, 400), 'Illustrative demo | Local tests | Nothing deployed',
              font=fonts[15], fill=muted)
    return image


def add_frame(lines, scene, duration):
    image = render(lines, scene['customer'], scene['label'])
    frames.append(image.convert('P', palette=Image.Palette.ADAPTIVE, colors=96))
    durations.append(duration)


def wrap(text, color):
    return [(line, color) for line in textwrap.wrap(text, width=columns)] or [('', color)]


for index, scene in enumerate(scenes):
    prompt = '> ' + scene['prompt']
    for end in range(3, len(prompt), 3):
        add_frame(history + wrap(prompt[:end] + '_', green), scene, 80)
    history.extend(wrap(prompt, green))
    add_frame(history, scene, 1000)
    # Wrap complete responses to the terminal width, rather than forcing
    # every short sentence onto a separate line.
    response = ' '.join(scene['answer'].splitlines())
    for line in wrap(response, foreground):
        history.append(line)
        add_frame(history, scene, 350)
    add_frame(history, scene, scene.get('hold_ms', 10500))
    if index == 2:
        render(history, scene['customer'], scene['label']).save(root / 'media/chat-demo.png')
    history.append(('', muted))

frames[0].save(root / 'media/chat-demo.gif', save_all=True, append_images=frames[1:],
               duration=durations, loop=0, optimize=True)
print(f'Rendered {len(frames)} frames, {sum(durations) / 1000:.1f} seconds')
