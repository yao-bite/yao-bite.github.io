#!/bin/bash

# Image compression script using ImageMagick
# Converts images to WebP format, resizes to max 1920x1080, and preserves directory structure

# Check if required arguments are provided
if [ $# -lt 2 ]; then
    echo "Usage: $0 <source_dir> <destination_dir> [quality]"
    echo "  source_dir: Directory containing images to compress"
    echo "  destination_dir: Directory where compressed images will be saved"
    echo "  quality: WebP quality (1-100, default: 85)"
    exit 1
fi

SOURCE_DIR="$1"
DEST_DIR="$2"
QUALITY="${3:-85}"

# Validate source directory exists
if [ ! -d "$SOURCE_DIR" ]; then
    echo "Error: Source directory '$SOURCE_DIR' does not exist"
    exit 1
fi

# Create destination directory if it doesn't exist
mkdir -p "$DEST_DIR"

# Check if ImageMagick is installed
if ! command -v magick &> /dev/null; then
    echo "Error: ImageMagick (magick command) is not installed"
    echo "Install it with: sudo apt install imagemagick (Ubuntu/Debian)"
    echo "               or: sudo dnf install ImageMagick (Fedora)"
    exit 1
fi

# Counter for processed files
PROCESSED=0
SKIPPED=0

echo "Starting image compression..."
echo "Source: $SOURCE_DIR"
echo "Destination: $DEST_DIR"
echo "Quality: $QUALITY"
echo "Max dimensions: 3000x"
echo ""

# Find all image files and process them
find "$SOURCE_DIR" -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" -o -iname "*.gif" -o -iname "*.bmp" -o -iname "*.tiff" -o -iname "*.webp" \) | while read -r img; do
    # Get relative path from source directory
    REL_PATH="${img#$SOURCE_DIR/}"

    # Get directory path and filename
    DIR_PATH=$(dirname "$REL_PATH")
    FILENAME=$(basename "$img")
    FILENAME_NO_EXT="${FILENAME%.*}"

    # Create destination directory structure
    DEST_SUBDIR="$DEST_DIR/$DIR_PATH"
    mkdir -p "$DEST_SUBDIR"

    # Set output file path with .webp extension
    OUTPUT_FILE="$DEST_SUBDIR/${FILENAME_NO_EXT}.webp"

    # Skip if output file already exists
    if [ -f "$OUTPUT_FILE" ]; then
        echo "Skipping (exists): $REL_PATH"
        SKIPPED=$((SKIPPED + 1))
        continue
    fi

    echo "Processing: $REL_PATH"

    # Convert and resize image
    # -resize 1920x1080> : only shrink if larger, maintain aspect ratio
    # -quality $QUALITY : WebP quality
    magick "$img" -resize 3000x\> -quality "$QUALITY" "$OUTPUT_FILE"

    if [ $? -eq 0 ]; then
        PROCESSED=$((PROCESSED + 1))
        # Show file size comparison
        ORIG_SIZE=$(du -h "$img" | cut -f1)
        NEW_SIZE=$(du -h "$OUTPUT_FILE" | cut -f1)
        echo "  ✓ $ORIG_SIZE → $NEW_SIZE"
    else
        echo "  ✗ Failed to process"
    fi

    echo ""
done

echo "================================"
echo "Compression complete!"
echo "Processed: $PROCESSED files"
echo "Skipped: $SKIPPED files (already exist)"
echo "================================"
