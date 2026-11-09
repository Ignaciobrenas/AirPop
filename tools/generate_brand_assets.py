import os
import math
from PIL import Image, ImageDraw, ImageFont

def create_brand_icon(size=512):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    margin = size * 0.05
    rect = [margin, margin, size - margin, size - margin]
    radius = size * 0.22

    for i in range(int(size * 0.04)):
        alpha = int(40 * (1.0 - i / (size * 0.04)))
        expand = i
        shadow_rect = [rect[0] - expand, rect[1] - expand + i * 0.5, rect[2] + expand, rect[3] + expand + i * 0.5]
        draw.rounded_rectangle(shadow_rect, radius=radius + expand, fill=(0, 0, 0, alpha))

    for y in range(int(rect[1]), int(rect[3])):
        ratio = (y - rect[1]) / (rect[3] - rect[1])
        r = int(14 * (1.0 - ratio) + 24 * ratio)
        g = int(16 * (1.0 - ratio) + 28 * ratio)
        b = int(28 * (1.0 - ratio) + 54 * ratio)
        draw.line([(rect[0], y), (rect[2], y)], fill=(r, g, b, 255))

    mask = Image.new("L", (size, size), 0)
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.rounded_rectangle(rect, radius=radius, fill=255)

    base = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    base.paste(img, (0, 0), mask=mask)
    draw = ImageDraw.Draw(base)

    draw.rounded_rectangle(rect, radius=radius, outline=(255, 255, 255, 45), width=max(1, int(size * 0.008)))

    cx = size * 0.5
    cy = size * 0.5

    for ring_r, width, alpha in [(size * 0.36, int(size * 0.02), 50), (size * 0.28, int(size * 0.025), 90), (size * 0.20, int(size * 0.035), 140)]:
        bbox = [cx - ring_r, cy - ring_r, cx + ring_r, cy + ring_r]
        draw.arc(bbox, start=200, end=340, fill=(0, 210, 255, alpha), width=width)
        draw.arc(bbox, start=20, end=160, fill=(0, 114, 255, alpha), width=width)

    core_r = size * 0.14
    for r in range(int(core_r), 0, -1):
        ratio = r / core_r
        cr = int(224 * (1.0 - ratio) + 0 * ratio)
        cg = int(36 * (1.0 - ratio) + 180 * ratio)
        cb = int(195 * (1.0 - ratio) + 255 * ratio)
        draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(cr, cg, cb, 255))

    wave_h = size * 0.08
    wave_w = size * 0.02
    for offset, h_mult in [(-size * 0.05, 0.65), (0, 1.0), (size * 0.05, 0.65)]:
        bx = cx + offset
        bw = wave_w
        bh = wave_h * h_mult
        draw.rounded_rectangle([bx - bw*0.5, cy - bh, bx + bw*0.5, cy + bh], radius=bw*0.5, fill=(255, 255, 255, 240))

    highlight = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    h_draw = ImageDraw.Draw(highlight)
    h_draw.ellipse([rect[0] + size * 0.05, rect[1] + size * 0.03, rect[2] - size * 0.05, rect[1] + size * 0.40], fill=(255, 255, 255, 18))
    base = Image.alpha_composite(base, highlight)

    return base

def create_nsis_header():
    w, h = 150, 57
    img = Image.new("RGB", (w, h), (18, 20, 32))
    draw = ImageDraw.Draw(img)

    for x in range(w):
        ratio = x / w
        r = int(15 * (1.0 - ratio) + 28 * ratio)
        g = int(18 * (1.0 - ratio) + 32 * ratio)
        b = int(32 * (1.0 - ratio) + 60 * ratio)
        draw.line([(x, 0), (x, h)], fill=(r, g, b))

    icon = create_brand_icon(44)
    img.paste(icon, (w - 50, (h - 44) // 2), mask=icon)

    draw.line([(0, h - 1), (w, h - 1)], fill=(45, 55, 80))
    return img

def create_nsis_sidebar():
    w, h = 164, 314
    img = Image.new("RGB", (w, h), (12, 14, 24))
    draw = ImageDraw.Draw(img)

    for y in range(h):
        ratio = y / h
        r = int(10 * (1.0 - ratio) + 22 * ratio)
        g = int(14 * (1.0 - ratio) + 26 * ratio)
        b = int(26 * (1.0 - ratio) + 52 * ratio)
        draw.line([(0, y), (w, y)], fill=(r, g, b))

    icon = create_brand_icon(96)
    img.paste(icon, ((w - 96) // 2, 45), mask=icon)

    draw.ellipse([(w // 2 - 50, 230), (w // 2 + 50, 330)], fill=(0, 114, 255, 20))
    draw.line([(w - 1, 0), (w - 1, h)], fill=(35, 45, 70))
    return img

def main():
    os.makedirs("src-tauri/icons", exist_ok=True)
    os.makedirs("src-tauri/resources", exist_ok=True)
    os.makedirs("ui/public", exist_ok=True)

    icon512 = create_brand_icon(512)
    icon512.save("src-tauri/icons/icon.png", "PNG")
    icon512.save("ui/public/icon.png", "PNG")

    icon32 = icon512.resize((32, 32), Image.Resampling.LANCZOS)
    icon32.save("src-tauri/icons/32x32.png", "PNG")

    icon128 = icon512.resize((128, 128), Image.Resampling.LANCZOS)
    icon128.save("src-tauri/icons/128x128.png", "PNG")

    icon256 = icon512.resize((256, 256), Image.Resampling.LANCZOS)
    icon256.save("src-tauri/icons/128x128@2x.png", "PNG")

    ico_sizes = [(16, 16), (24, 24), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)]
    icon512.save("src-tauri/icons/icon.ico", format="ICO", sizes=ico_sizes)
    icon512.save("ui/public/favicon.ico", format="ICO", sizes=[(16, 16), (32, 32)])

    header = create_nsis_header()
    header.save("src-tauri/resources/nsis-header.bmp", "BMP")

    sidebar = create_nsis_sidebar()
    sidebar.save("src-tauri/resources/nsis-sidebar.bmp", "BMP")

    print("Brand assets generated successfully.")

if __name__ == "__main__":
    main()
