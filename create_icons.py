#!/usr/bin/env python3
"""
Simple script to create placeholder icons for the Mermaid Visualizer extension
"""

from PIL import Image, ImageDraw, ImageFont
import os

def create_icon(size, output_path):
    """Create a simple icon with the given size"""
    # Create a new image with transparent background
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Draw a simple eye icon (representing "visualize")
    # Background circle
    center = size // 2
    radius = size // 2 - 2
    draw.ellipse([center - radius, center - radius, center + radius, center + radius], 
                 fill=(3, 102, 214, 255), outline=(2, 86, 204, 255), width=1)
    
    # Eye shape
    eye_width = radius * 0.7
    eye_height = radius * 0.4
    eye_left = center - eye_width // 2
    eye_top = center - eye_height // 2
    eye_right = center + eye_width // 2
    eye_bottom = center + eye_height // 2
    
    # Outer eye
    draw.ellipse([eye_left, eye_top, eye_right, eye_bottom], 
                 fill=(255, 255, 255, 255), outline=(255, 255, 255, 255))
    
    # Pupil
    pupil_radius = eye_height * 0.3
    draw.ellipse([center - pupil_radius, center - pupil_radius, 
                  center + pupil_radius, center + pupil_radius], 
                 fill=(3, 102, 214, 255))
    
    # Save the image
    img.save(output_path, 'PNG')
    print(f"Created icon: {output_path}")

def main():
    # Create icon directories if they don't exist
    chrome_icons_dir = "chrome/icons"
    safari_icons_dir = "safari/icons"
    
    os.makedirs(chrome_icons_dir, exist_ok=True)
    os.makedirs(safari_icons_dir, exist_ok=True)
    
    # Icon sizes needed for both Chrome and Safari
    sizes = [16, 32, 48, 128]
    
    for size in sizes:
        # Create Chrome icons
        create_icon(size, f"{chrome_icons_dir}/icon{size}.png")
        
        # Create Safari icons (copy the same icons)
        create_icon(size, f"{safari_icons_dir}/icon{size}.png")

if __name__ == "__main__":
    main()