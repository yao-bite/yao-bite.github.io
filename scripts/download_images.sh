#!/bin/bash
# Download images from Ghost export and organize them

GHOST_URL="https://peiyao.run"
IMAGE_LIST="images_to_download.txt"
CONTENT_DIR="content"

echo "Downloading images from Ghost export..."
echo "Total images to download: $(wc -l < $IMAGE_LIST)"
echo ""

# Create a temporary directory for downloaded images
mkdir -p downloaded_images

# Read each image URL and download
while IFS= read -r img_url; do
    # Replace __GHOST_URL__ with actual URL
    actual_url="${img_url/__GHOST_URL__/$GHOST_URL}"

    # Extract the relative path after content/images/
    if [[ $img_url =~ content/images/(.+)$ ]]; then
        rel_path="${BASH_REMATCH[1]}"

        # Create directory structure
        img_dir="downloaded_images/$(dirname "$rel_path")"
        mkdir -p "$img_dir"

        # Download image
        output_file="downloaded_images/$rel_path"

        if [ -f "$output_file" ]; then
            echo "Skip (exists): $rel_path"
        else
            echo "Downloading: $rel_path"
            wget -q -O "$output_file" "$actual_url" 2>/dev/null

            if [ $? -eq 0 ]; then
                echo "  ✓ Success"
            else
                echo "  ✗ Failed"
            fi
        fi
    fi
done < "$IMAGE_LIST"

echo ""
echo "Download complete!"
echo "Images saved to: downloaded_images/"
echo ""
echo "Next steps:"
echo "1. Review downloaded images in downloaded_images/"
echo "2. Move images to appropriate content directories"
echo "3. Update image paths in markdown files"
