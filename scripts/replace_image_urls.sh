#!/bin/bash

# Replace Ghost image URLs with WebP paths
# Replaces __GHOST_URL__/content/images/*.{jpg,png} with /ghost-images/*.webp

# Check if required arguments are provided
if [ $# -lt 1 ]; then
    echo "Usage: $0 <content_dir> [--dry-run]"
    echo "  content_dir: Directory containing markdown files (e.g., ./content)"
    echo "  --dry-run: Preview changes without modifying files"
    exit 1
fi

CONTENT_DIR="$1"
DRY_RUN=false

# Check for dry-run flag
if [ "$2" = "--dry-run" ]; then
    DRY_RUN=true
    echo "DRY RUN MODE - No files will be modified"
    echo ""
fi

# Validate content directory exists
if [ ! -d "$CONTENT_DIR" ]; then
    echo "Error: Content directory '$CONTENT_DIR' does not exist"
    exit 1
fi

# Counters
TOTAL_FILES=0
MODIFIED_FILES=0
TOTAL_REPLACEMENTS=0

echo "Searching for markdown files in: $CONTENT_DIR"
echo ""

# Find all markdown files
find "$CONTENT_DIR" -type f \( -name "*.md" -o -name "*.markdown" \) | while read -r file; do
    TOTAL_FILES=$((TOTAL_FILES + 1))

    # Count matches in this file
    MATCHES=$(grep -o '__GHOST_URL__/content/images/[^)]*\.\(jpg\|png\|jpeg\|JPG\|PNG\|JPEG\)' "$file" | wc -l)

    if [ "$MATCHES" -gt 0 ]; then
        echo "File: $file"
        echo "  Found $MATCHES image reference(s)"

        if [ "$DRY_RUN" = true ]; then
            # Show what would be replaced
            echo "  Preview of changes:"
            grep -n '__GHOST_URL__/content/images/' "$file" | head -5
            echo ""
        else
            # Create backup
            cp "$file" "${file}.bak"

            # Perform replacements using sed
            # Pattern 1: __GHOST_URL__/content/images/2024/01/image.jpg -> /ghost-images/2024/01/image.webp
            sed -i -E 's#__GHOST_URL__/content/images/([^)]*)\.(jpg|png|jpeg|JPG|PNG|JPEG)#/ghost-images/\1.webp#g' "$file"

            echo "  ✓ Replaced and backed up to ${file}.bak"
            echo ""

            MODIFIED_FILES=$((MODIFIED_FILES + 1))
        fi

        TOTAL_REPLACEMENTS=$((TOTAL_REPLACEMENTS + MATCHES))
    fi
done

echo "================================"
if [ "$DRY_RUN" = true ]; then
    echo "DRY RUN SUMMARY"
    echo "Would modify: $MODIFIED_FILES file(s)"
    echo "Would replace: $TOTAL_REPLACEMENTS image reference(s)"
    echo ""
    echo "Run without --dry-run to apply changes"
else
    echo "REPLACEMENT COMPLETE"
    echo "Modified: $MODIFIED_FILES file(s)"
    echo "Replaced: $TOTAL_REPLACEMENTS image reference(s)"
    echo ""
    echo "Backups created with .bak extension"
    echo "To remove backups: find $CONTENT_DIR -name '*.bak' -delete"
fi
echo "================================"
