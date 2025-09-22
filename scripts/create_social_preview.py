#!/usr/bin/env python3
"""
Create a social preview image for the GitHub repository
"""
import os

from PIL import Image, ImageDraw, ImageFont


def create_social_preview():
    # Social preview dimensions (GitHub recommended)
    width, height = 1280, 640

    # 40pt margins as recommended
    margin = 40

    # Create a new image with a dark background
    img = Image.new("RGB", (width, height), color="#1a1a2e")
    draw = ImageDraw.Draw(img)  # Try to load the screenshot as background
    try:
        screenshot = Image.open("game/screencap/screencap1.png")
        # Resize screenshot to fit left side with margins
        max_screenshot_width = (width // 2) - (margin * 2)
        max_screenshot_height = height - (margin * 2)
        screenshot.thumbnail(
            (max_screenshot_width, max_screenshot_height),
            Image.Resampling.LANCZOS,
        )
        # Create a semi-transparent overlay
        screenshot = screenshot.convert("RGBA")
        overlay = Image.new(
            "RGBA", screenshot.size, (26, 26, 46, 50)
        )  # Semi-transparent dark overlay
        screenshot = Image.alpha_composite(screenshot, overlay)
        # Position with margins
        x_pos = margin
        y_pos = margin + ((height - margin * 2 - screenshot.size[1]) // 2)
        img.paste(screenshot, (x_pos, y_pos), screenshot)
    except Exception as e:
        print(f"Could not load screenshot: {e}")

    # Try to use default fonts, fall back to basic if not available
    try:
        title_font = ImageFont.truetype(
            "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 48
        )
        subtitle_font = ImageFont.truetype(
            "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 28
        )
        code_font = ImageFont.truetype(
            "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf", 20
        )
    except:
        try:
            title_font = ImageFont.load_default()
            subtitle_font = ImageFont.load_default()
            code_font = ImageFont.load_default()
        except:
            title_font = None
            subtitle_font = None
            code_font = None

    # Right side text area (with proper margins)
    text_x = width // 2 + margin
    text_width = width - text_x - margin  # Available text width

    # Main title (shortened to fit)
    title = "LLM Training"
    if title_font:
        draw.text((text_x, margin + 80), title, font=title_font, fill="#ffffff")
    else:
        draw.text((text_x, margin + 80), title, fill="#ffffff")

    # Subtitle
    subtitle = "Game Integration Framework"
    if subtitle_font:
        draw.text(
            (text_x, margin + 140), subtitle, font=subtitle_font, fill="#64b5f6"
        )
    else:
        draw.text((text_x, margin + 140), subtitle, fill="#64b5f6")

    # Description lines
    desc_lines = [
        "• Fine-tune LLMs for game mechanics",
        "• Structured JSON action outputs",
        "• Real-time character interactions",
        "• Customizable training framework",
    ]

    y_pos = margin + 200
    for line in desc_lines:
        if subtitle_font:
            draw.text((text_x, y_pos), line, font=subtitle_font, fill="#e0e0e0")
        else:
            draw.text((text_x, y_pos), line, fill="#e0e0e0")
        y_pos += 35

    # Code example
    code_example = '{"give": [], "take": ["item"], "attack": true}'
    if code_font:
        draw.text(
            (text_x, margin + 380), code_example, font=code_font, fill="#4caf50"
        )
    else:
        draw.text((text_x, margin + 380), code_example, fill="#4caf50")

    # GitHub info - shortened to fit better
    github_text = "GoOcto/ChatbotAdventureGame-withTraining"
    if code_font:
        draw.text(
            (text_x, height - margin - 30),
            github_text,
            font=code_font,
            fill="#90caf9",
        )
    else:
        draw.text((text_x, height - margin - 30), github_text, fill="#90caf9")

    # Save the image
    img.save("social-preview.png", "PNG")
    print("Social preview image created: social-preview.png")
    print(f"Image dimensions: {width}x{height}")


if __name__ == "__main__":
    create_social_preview()
