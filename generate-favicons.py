#!/usr/bin/env python3
"""
Generate favicons in multiple sizes from SVG
Usage: python3 generate-favicons.py
"""
import cairosvg
from PIL import Image
import io

# Sizes needed for optimal Google Search appearance
sizes = {
    'favicon-16x16.png': 16,
    'favicon-32x32.png': 32,
    'apple-touch-icon.png': 180,
    'android-chrome-192x192.png': 192,
    'android-chrome-512x512.png': 512,
}

svg_path = 'public/claude-logo.svg'
output_dir = 'public'

for filename, size in sizes.items():
    print(f"Generating {filename} ({size}x{size})...")

    # Convert SVG to PNG at specified size
    png_data = cairosvg.svg2png(
        url=svg_path,
        output_width=size,
        output_height=size
    )

    # Save PNG
    output_path = f'{output_dir}/{filename}'
    with open(output_path, 'wb') as f:
        f.write(png_data)

    print(f"✓ Saved {output_path}")

# Also create favicon.ico (multi-size ICO file)
print("\nGenerating favicon.ico with 16x16 and 32x32...")
img16 = Image.open(io.BytesIO(cairosvg.svg2png(url=svg_path, output_width=16, output_height=16)))
img32 = Image.open(io.BytesIO(cairosvg.svg2png(url=svg_path, output_width=32, output_height=32)))
img16.save(f'{output_dir}/favicon.ico', format='ICO', sizes=[(16, 16), (32, 32)], append_images=[img32])
print(f"✓ Saved {output_dir}/favicon.ico")

print("\n✅ All favicons generated successfully!")
