#!/usr/bin/env python3
"""Create desktop-width wallpapers from existing MangaLog library artwork.

The 941x1672 sources are preserved for phone layouts. Desktop output is a
2560x1440 composition, not an invented higher-resolution source: it keeps the
original scene legible without stretching the same source across 2560 pixels.
"""
from pathlib import Path
from PIL import Image, ImageEnhance, ImageFilter, ImageOps

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets"
SIZE = (2560, 1440)
DARK = {
    "blue": (2, 9, 25),
    "red": (21, 3, 11),
    "violet": (14, 3, 29),
    "white": (5, 10, 19),
}


def make_desktop(theme):
    original = ASSETS / f"library-{theme}.webp"
    output = ASSETS / f"library-{theme}-desktop.webp"
    image = Image.open(original).convert("RGB")
    width, height = image.size
    if width < 900 or height < 1500:
        raise ValueError(f"Unexpected original artwork dimensions for {theme}: {image.size}")

    # Soft atmospheric fill comes from the original picture, darkened so that
    # foreground text remains readable on large monitors.
    fill = ImageOps.fit(image, SIZE, Image.Resampling.LANCZOS, centering=(0.65, 0.43))
    fill = fill.filter(ImageFilter.GaussianBlur(15))
    fill = Image.blend(fill, Image.new("RGB", SIZE, DARK[theme]), .75)

    # Sharp, aligned version of the original is not enlarged to fill the
    # entire 2560px canvas, preserving the fine illustrated manga spines.
    hero_width = 1370
    hero_height = round(image.height * hero_width / image.width)
    hero = image.resize((hero_width, hero_height), Image.Resampling.LANCZOS)
    hero = hero.filter(ImageFilter.UnsharpMask(radius=1.1, percent=120, threshold=3))
    top = int((hero_height - SIZE[1]) * .30)
    hero = hero.crop((0, top, hero_width, top + SIZE[1]))
    alpha = Image.new("L", (hero_width, SIZE[1]), 255)
    fade_width = 450
    for x in range(fade_width):
        alpha.paste(round(255 * (x / fade_width) ** 1.4), (x, 0, x+1, SIZE[1]))
    fill.paste(hero, (SIZE[0] - hero_width, 0), alpha)

    # Unobtrusive darkness to the left under the app's navigation/content.
    shade = Image.new("RGBA", SIZE, (*DARK[theme], 0))
    mask = Image.new("L", SIZE, 0)
    for x in range(SIZE[0]):
        amt = round(150 * (1 - min(1, x / 1770)) ** 2)
        if amt:
            mask.paste(amt, (x, 0, x+1, SIZE[1]))
    shade.putalpha(mask)
    fill = Image.alpha_composite(fill.convert("RGBA"), shade).convert("RGB")
    fill.save(output, "WEBP", quality=89, method=6)
    print(f"{output.relative_to(ROOT)}: {fill.width}x{fill.height}, {output.stat().st_size//1024} KB")


if __name__ == "__main__":
    for name in ("blue", "red", "violet", "white"):
        make_desktop(name)
