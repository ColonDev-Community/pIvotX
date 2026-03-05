"""
Generate simple pixel-art game assets for pIvotX examples.
All assets are original works, free to use.

Run: python3 generate-assets.py
Output: hero-sheet.png, tileset.png, coin-sheet.png, sky-tile.png, hills-tile.png
"""

from PIL import Image, ImageDraw
import os

OUT = os.path.dirname(os.path.abspath(__file__))

# ─── Colors ──────────────────────────────────────────────────────────────────

TRANSPARENT = (0, 0, 0, 0)
SKIN    = (255, 200, 150, 255)
HAIR    = (80, 50, 30, 255)
SHIRT   = (70, 130, 220, 255)
PANTS   = (50, 80, 140, 255)
SHOES   = (60, 40, 30, 255)
EYES    = (30, 30, 30, 255)
OUTLINE = (40, 40, 40, 255)

GRASS_TOP    = (80, 160, 60, 255)
GRASS_DARK   = (60, 130, 45, 255)
DIRT         = (140, 100, 60, 255)
DIRT_DARK    = (110, 75, 45, 255)
STONE        = (130, 130, 130, 255)
STONE_DARK   = (100, 100, 100, 255)
STONE_LIGHT  = (160, 160, 160, 255)

COIN_GOLD    = (255, 210, 50, 255)
COIN_LIGHT   = (255, 235, 120, 255)
COIN_DARK    = (200, 160, 20, 255)

SKY_TOP      = (100, 170, 240, 255)
SKY_BOT      = (180, 220, 255, 255)

HILL_GREEN   = (60, 140, 50, 255)
HILL_DARK    = (45, 110, 35, 255)


def draw_pixel_char(draw, ox, oy, shirt_color=SHIRT, facing_right=True):
    """Draw a 16x16 pixel character at offset (ox, oy)."""
    # Head (skin)
    for x in range(5, 11):
        for y in range(1, 6):
            draw.point((ox + x, oy + y), SKIN)
    # Hair
    for x in range(5, 11):
        draw.point((ox + x, oy + 1), HAIR)
    if facing_right:
        for y in range(1, 4):
            draw.point((ox + 5, oy + y), HAIR)
    else:
        for y in range(1, 4):
            draw.point((ox + 10, oy + y), HAIR)
    # Eyes
    if facing_right:
        draw.point((ox + 8, oy + 3), EYES)
    else:
        draw.point((ox + 7, oy + 3), EYES)
    # Body (shirt)
    for x in range(5, 11):
        for y in range(6, 10):
            draw.point((ox + x, oy + y), shirt_color)
    # Arms
    draw.point((ox + 4, oy + 7), SKIN)
    draw.point((ox + 11, oy + 7), SKIN)
    # Pants
    for x in range(5, 11):
        for y in range(10, 13):
            draw.point((ox + x, oy + y), PANTS)
    # Legs gap
    draw.point((ox + 7, oy + 12), TRANSPARENT)
    draw.point((ox + 8, oy + 12), TRANSPARENT)
    # Shoes
    for x in range(5, 8):
        draw.point((ox + x, oy + 13), SHOES)
    for x in range(8, 11):
        draw.point((ox + x, oy + 13), SHOES)


def draw_run_char(draw, ox, oy, frame, shirt_color=SHIRT, facing_right=True):
    """Draw running character variation."""
    draw_pixel_char(draw, ox, oy, shirt_color, facing_right)
    # Animate legs
    if frame % 2 == 0:
        # Left leg forward
        draw.point((ox + 5, oy + 13), TRANSPARENT)
        draw.point((ox + 4, oy + 13), SHOES)
        draw.point((ox + 10, oy + 13), TRANSPARENT)
        draw.point((ox + 11, oy + 12), SHOES)
    else:
        # Right leg forward
        draw.point((ox + 10, oy + 13), TRANSPARENT)
        draw.point((ox + 11, oy + 13), SHOES)
        draw.point((ox + 5, oy + 13), TRANSPARENT)
        draw.point((ox + 4, oy + 12), SHOES)
    # Animate arms
    if frame % 2 == 0:
        draw.point((ox + 4, oy + 7), TRANSPARENT)
        draw.point((ox + 4, oy + 8), SKIN)
        draw.point((ox + 11, oy + 7), TRANSPARENT)
        draw.point((ox + 11, oy + 6), SKIN)
    else:
        draw.point((ox + 4, oy + 7), TRANSPARENT)
        draw.point((ox + 4, oy + 6), SKIN)
        draw.point((ox + 11, oy + 7), TRANSPARENT)
        draw.point((ox + 11, oy + 8), SKIN)


def draw_jump_char(draw, ox, oy, frame, shirt_color=SHIRT, facing_right=True):
    """Draw jumping character."""
    draw_pixel_char(draw, ox, oy, shirt_color, facing_right)
    # Arms up
    draw.point((ox + 4, oy + 7), TRANSPARENT)
    draw.point((ox + 4, oy + 5), SKIN)
    draw.point((ox + 3, oy + 4), SKIN)
    draw.point((ox + 11, oy + 7), TRANSPARENT)
    draw.point((ox + 11, oy + 5), SKIN)
    draw.point((ox + 12, oy + 4), SKIN)
    # Legs together
    if frame == 0:
        draw.point((ox + 7, oy + 12), PANTS)
        draw.point((ox + 8, oy + 12), PANTS)


# ─── 1. Hero spritesheet (16x16 per frame, 8 columns) ───────────────────────
# Layout: idle(0-3), run(4-7), jump(8-9)
# Total: 10 frames, 2 rows of 5

FRAME_W, FRAME_H = 16, 16
COLS = 5
TOTAL_FRAMES = 10
ROWS = 2

hero_img = Image.new('RGBA', (COLS * FRAME_W, ROWS * FRAME_H), TRANSPARENT)
hero_draw = ImageDraw.Draw(hero_img)

# Idle frames (0-3) — slight bob
for i in range(4):
    ox = (i % COLS) * FRAME_W
    oy = (i // COLS) * FRAME_H
    y_off = 1 if i in [1, 2] else 0
    draw_pixel_char(hero_draw, ox, oy + y_off)

# Run frames (4-7)
for i in range(4):
    idx = 4 + i
    ox = (idx % COLS) * FRAME_W
    oy = (idx // COLS) * FRAME_H
    draw_run_char(hero_draw, ox, oy, i)

# Jump frames (8-9)
for i in range(2):
    idx = 8 + i
    ox = (idx % COLS) * FRAME_W
    oy = (idx // COLS) * FRAME_H
    draw_jump_char(hero_draw, ox, oy, i)

hero_img.save(os.path.join(OUT, 'hero-sheet.png'))
print(f'✓ hero-sheet.png  ({hero_img.width}x{hero_img.height}, {TOTAL_FRAMES} frames of {FRAME_W}x{FRAME_H})')


# ─── 2. Tileset (16x16 per tile, 4 columns × 2 rows = 8 tiles) ─────────────
# Layout:
# Row 0: grass-left(0), grass-mid(1), grass-right(2), grass-single(3)
# Row 1: dirt-left(4),  dirt-mid(5),  dirt-right(6),  stone(7)

TILE = 16
T_COLS = 4
T_ROWS = 2

tile_img = Image.new('RGBA', (T_COLS * TILE, T_ROWS * TILE), TRANSPARENT)
tile_draw = ImageDraw.Draw(tile_img)

def draw_grass_tile(draw, ox, oy, left_edge=False, right_edge=False):
    """Draw a grass-top tile."""
    # Grass top strip
    for x in range(TILE):
        for y in range(0, 5):
            c = GRASS_TOP if (x + y) % 3 != 0 else GRASS_DARK
            draw.point((ox + x, oy + y), c)
    # Dirt below
    for x in range(TILE):
        for y in range(5, TILE):
            c = DIRT if (x + y) % 4 != 0 else DIRT_DARK
            draw.point((ox + x, oy + y), c)
    # Edge highlights
    if left_edge:
        for y in range(TILE):
            draw.point((ox, oy + y), OUTLINE if y < 5 else DIRT_DARK)
    if right_edge:
        for y in range(TILE):
            draw.point((ox + TILE - 1, oy + y), OUTLINE if y < 5 else DIRT_DARK)

def draw_dirt_tile(draw, ox, oy, left_edge=False, right_edge=False):
    """Draw a pure dirt tile."""
    for x in range(TILE):
        for y in range(TILE):
            c = DIRT if (x + y) % 4 != 0 else DIRT_DARK
            draw.point((ox + x, oy + y), c)
    if left_edge:
        for y in range(TILE):
            draw.point((ox, oy + y), DIRT_DARK)
    if right_edge:
        for y in range(TILE):
            draw.point((ox + TILE - 1, oy + y), DIRT_DARK)

def draw_stone_tile(draw, ox, oy):
    """Draw a stone block tile."""
    for x in range(TILE):
        for y in range(TILE):
            if x == 0 or y == 0:
                draw.point((ox + x, oy + y), STONE_LIGHT)
            elif x == TILE - 1 or y == TILE - 1:
                draw.point((ox + x, oy + y), STONE_DARK)
            else:
                c = STONE if (x * 3 + y * 7) % 5 != 0 else STONE_DARK
                draw.point((ox + x, oy + y), c)

# Row 0: grass tiles
draw_grass_tile(tile_draw, 0 * TILE, 0, left_edge=True)   # 0: grass-left
draw_grass_tile(tile_draw, 1 * TILE, 0)                     # 1: grass-mid
draw_grass_tile(tile_draw, 2 * TILE, 0, right_edge=True)   # 2: grass-right
draw_grass_tile(tile_draw, 3 * TILE, 0, left_edge=True, right_edge=True)  # 3: grass-single

# Row 1: dirt + stone
draw_dirt_tile(tile_draw, 0 * TILE, 1 * TILE, left_edge=True)   # 4: dirt-left
draw_dirt_tile(tile_draw, 1 * TILE, 1 * TILE)                     # 5: dirt-mid
draw_dirt_tile(tile_draw, 2 * TILE, 1 * TILE, right_edge=True)   # 6: dirt-right
draw_stone_tile(tile_draw, 3 * TILE, 1 * TILE)                    # 7: stone

tile_img.save(os.path.join(OUT, 'tileset.png'))
print(f'✓ tileset.png     ({tile_img.width}x{tile_img.height}, {T_COLS * T_ROWS} tiles of {TILE}x{TILE})')


# ─── 3. Coin spritesheet (16x16, 6 frames — spinning animation) ─────────────

COIN_FRAMES = 6
coin_img = Image.new('RGBA', (COIN_FRAMES * TILE, TILE), TRANSPARENT)
coin_draw = ImageDraw.Draw(coin_img)

for f in range(COIN_FRAMES):
    ox = f * TILE
    cx, cy = ox + 8, 8
    # Simulate coin rotation by varying width
    widths = [6, 5, 3, 1, 3, 5]
    w = widths[f]
    for dy in range(-6, 7):
        for dx in range(-w, w + 1):
            dist = (dx * dx / max(w * w, 1) + dy * dy / 36)
            if dist <= 1.0:
                if dist > 0.7:
                    coin_draw.point((cx + dx, cy + dy), COIN_DARK)
                elif dx < 0:
                    coin_draw.point((cx + dx, cy + dy), COIN_GOLD)
                else:
                    coin_draw.point((cx + dx, cy + dy), COIN_LIGHT)

coin_img.save(os.path.join(OUT, 'coin-sheet.png'))
print(f'✓ coin-sheet.png  ({coin_img.width}x{coin_img.height}, {COIN_FRAMES} frames of {TILE}x{TILE})')


# ─── 4. Sky tile (seamless, for TiledBackground) ────────────────────────────

SKY_W, SKY_H = 128, 128
sky_img = Image.new('RGBA', (SKY_W, SKY_H), TRANSPARENT)
sky_draw = ImageDraw.Draw(sky_img)

for y in range(SKY_H):
    t = y / SKY_H
    r = int(SKY_TOP[0] + (SKY_BOT[0] - SKY_TOP[0]) * t)
    g = int(SKY_TOP[1] + (SKY_BOT[1] - SKY_TOP[1]) * t)
    b = int(SKY_TOP[2] + (SKY_BOT[2] - SKY_TOP[2]) * t)
    for x in range(SKY_W):
        sky_draw.point((x, y), (r, g, b, 255))

# A few simple clouds
import random
random.seed(42)
for _ in range(3):
    cx = random.randint(10, SKY_W - 10)
    cy = random.randint(10, 50)
    for dx in range(-12, 13):
        for dy in range(-4, 5):
            if dx * dx / 144 + dy * dy / 16 < 1:
                cloud_alpha = int(180 * (1 - (dx * dx / 144 + dy * dy / 16)))
                px, py = cx + dx, cy + dy
                if 0 <= px < SKY_W and 0 <= py < SKY_H:
                    base = sky_img.getpixel((px, py))
                    nr = min(255, base[0] + cloud_alpha // 2)
                    ng = min(255, base[1] + cloud_alpha // 2)
                    nb = min(255, base[2] + cloud_alpha // 2)
                    sky_draw.point((px, py), (nr, ng, nb, 255))

sky_img.save(os.path.join(OUT, 'sky-tile.png'))
print(f'✓ sky-tile.png    ({SKY_W}x{SKY_H})')


# ─── 5. Hills tile (seamless silhouette, for parallax mid-layer) ─────────────

HILL_W, HILL_H = 256, 128
hill_img = Image.new('RGBA', (HILL_W, HILL_H), TRANSPARENT)
hill_draw = ImageDraw.Draw(hill_img)

import math

for x in range(HILL_W):
    # Rolling hills using sine waves
    h1 = math.sin(x / HILL_W * math.pi * 2) * 25
    h2 = math.sin(x / HILL_W * math.pi * 4 + 1.5) * 12
    h3 = math.sin(x / HILL_W * math.pi * 6 + 3.0) * 6
    hill_top = int(HILL_H * 0.45 + h1 + h2 + h3)

    for y in range(hill_top, HILL_H):
        t = (y - hill_top) / max(1, HILL_H - hill_top)
        r = int(HILL_GREEN[0] + (HILL_DARK[0] - HILL_GREEN[0]) * t)
        g = int(HILL_GREEN[1] + (HILL_DARK[1] - HILL_GREEN[1]) * t)
        b = int(HILL_GREEN[2] + (HILL_DARK[2] - HILL_GREEN[2]) * t)
        hill_draw.point((x, y), (r, g, b, 255))

hill_img.save(os.path.join(OUT, 'hills-tile.png'))
print(f'✓ hills-tile.png  ({HILL_W}x{HILL_H})')


# ─── 6. Platform texture (small repeatable strip) ───────────────────────────

PLAT_W, PLAT_H = 32, 8
plat_img = Image.new('RGBA', (PLAT_W, PLAT_H), TRANSPARENT)
plat_draw = ImageDraw.Draw(plat_img)

WOOD      = (160, 120, 70, 255)
WOOD_DARK = (130, 95, 55, 255)
WOOD_LT   = (185, 145, 90, 255)

for x in range(PLAT_W):
    for y in range(PLAT_H):
        if y == 0:
            plat_draw.point((x, y), WOOD_LT)
        elif y == PLAT_H - 1:
            plat_draw.point((x, y), WOOD_DARK)
        else:
            c = WOOD if (x + y * 3) % 5 != 0 else WOOD_DARK
            plat_draw.point((x, y), c)

plat_img.save(os.path.join(OUT, 'platform.png'))
print(f'✓ platform.png    ({PLAT_W}x{PLAT_H})')

print('\nAll assets generated successfully!')
