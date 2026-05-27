from pathlib import Path
from PIL import Image, ImageOps


ROOT = Path(__file__).resolve().parents[1]
IMAGE_DIRS = [ROOT / "assets" / "img"]
ROOT_IMAGES = [ROOT / "assets" / "img" / "hero_banner.png"]

QUALITY = 78
HERO_MAX_WIDTH = 1920
CONTENT_MAX_WIDTH = 1400


def target_width(path: Path) -> int:
    if path.name == "hero_banner.png":
        return HERO_MAX_WIDTH
    return CONTENT_MAX_WIDTH


def optimize(path: Path) -> tuple[int, int]:
    output = path.with_suffix(".webp")
    before = path.stat().st_size

    with Image.open(path) as image:
        image = ImageOps.exif_transpose(image)

        if image.mode not in ("RGB", "RGBA"):
            image = image.convert("RGBA" if "A" in image.getbands() else "RGB")

        max_width = target_width(path)
        if image.width > max_width:
            ratio = max_width / image.width
            new_size = (max_width, max(1, round(image.height * ratio)))
            image = image.resize(new_size, Image.Resampling.LANCZOS)

        save_kwargs = {
            "format": "WEBP",
            "quality": QUALITY,
            "method": 6,
        }

        if image.mode == "RGBA":
            image.save(output, lossless=False, **save_kwargs)
        else:
            image.save(output, **save_kwargs)

    return before, output.stat().st_size


def main() -> None:
    sources = []
    for image_dir in IMAGE_DIRS:
        sources.extend(image_dir.rglob("*.png"))
        sources.extend(image_dir.rglob("*.jpg"))
        sources.extend(image_dir.rglob("*.jpeg"))
    sources.extend(path for path in ROOT_IMAGES if path.exists())

    total_before = 0
    total_after = 0

    for source in sorted(set(sources)):
        before, after = optimize(source)
        total_before += before
        total_after += after
        print(f"{source.relative_to(ROOT)} -> {source.with_suffix('.webp').relative_to(ROOT)}")

    saved = total_before - total_after
    percent = (saved / total_before * 100) if total_before else 0
    print(f"\nBefore: {total_before / 1024 / 1024:.2f} MB")
    print(f"After:  {total_after / 1024 / 1024:.2f} MB")
    print(f"Saved:  {saved / 1024 / 1024:.2f} MB ({percent:.1f}%)")


if __name__ == "__main__":
    main()
