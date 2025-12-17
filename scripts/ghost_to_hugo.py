#!/usr/bin/env python3
"""
Ghost to Hugo migration script
Converts Ghost JSON export to Hugo content files
"""

import json
import os
import re
from datetime import datetime
from html.parser import HTMLParser
from pathlib import Path


class HTMLToMarkdown(HTMLParser):
    """Simple HTML to Markdown converter"""

    def __init__(self):
        super().__init__()
        self.markdown = []
        self.in_tag = []
        self.list_level = 0

    def handle_starttag(self, tag, attrs):
        attrs_dict = dict(attrs)

        if tag in ["h1", "h2", "h3", "h4", "h5", "h6"]:
            level = int(tag[1])
            self.markdown.append("\n" + "#" * level + " ")
        elif tag == "p":
            self.markdown.append("\n\n")
        elif tag == "br":
            self.markdown.append("  \n")
        elif tag == "strong" or tag == "b":
            self.markdown.append("**")
        elif tag == "em" or tag == "i":
            self.markdown.append("*")
        elif tag == "a":
            self.markdown.append("[")
            self.in_tag.append(("a", attrs_dict.get("href", "")))
        elif tag == "img":
            src = attrs_dict.get("src", "")
            alt = attrs_dict.get("alt", "")
            self.markdown.append(f"\n\n![{alt}]({src})\n\n")
        elif tag == "ul":
            self.markdown.append("\n")
            self.list_level += 1
        elif tag == "ol":
            self.markdown.append("\n")
            self.list_level += 1
        elif tag == "li":
            self.markdown.append("  " * (self.list_level - 1) + "- ")
        elif tag == "blockquote":
            self.markdown.append("\n> ")
        elif tag == "code":
            self.markdown.append("`")
        elif tag == "pre":
            self.markdown.append("\n```\n")
        elif tag == "hr":
            self.markdown.append("\n\n---\n\n")

    def handle_endtag(self, tag):
        if tag in ["h1", "h2", "h3", "h4", "h5", "h6"]:
            self.markdown.append("\n")
        elif tag == "p":
            self.markdown.append("\n")
        elif tag == "strong" or tag == "b":
            self.markdown.append("**")
        elif tag == "em" or tag == "i":
            self.markdown.append("*")
        elif tag == "a":
            if self.in_tag and self.in_tag[-1][0] == "a":
                _, href = self.in_tag.pop()
                self.markdown.append(f"]({href})")
        elif tag == "ul" or tag == "ol":
            self.list_level -= 1
            self.markdown.append("\n")
        elif tag == "li":
            self.markdown.append("\n")
        elif tag == "blockquote":
            self.markdown.append("\n")
        elif tag == "code":
            self.markdown.append("`")
        elif tag == "pre":
            self.markdown.append("\n```\n")

    def handle_data(self, data):
        # Clean up whitespace but preserve intentional spacing
        if data.strip():
            self.markdown.append(data)

    def get_markdown(self):
        result = "".join(self.markdown)
        # Clean up excessive newlines
        result = re.sub(r"\n{3,}", "\n\n", result)
        return result.strip()


def clean_html_to_markdown(html_content):
    """Convert HTML to clean Markdown"""
    if not html_content:
        return ""

    parser = HTMLToMarkdown()
    parser.feed(html_content)
    return parser.get_markdown()


def extract_image_urls(html_content):
    """Extract all image URLs from HTML content"""
    if not html_content:
        return []

    # Find all img src attributes
    img_pattern = r'<img[^>]+src="([^"]+)"'
    images = re.findall(img_pattern, html_content)

    # Also find figure images
    figure_pattern = r'<figure[^>]*>.*?<img[^>]+src="([^"]+)".*?</figure>'
    images.extend(re.findall(figure_pattern, html_content, re.DOTALL))

    return list(set(images))  # Remove duplicates


def determine_content_type(post, tags_map, post_tags_map):
    """Determine if post should go in works, writings, or exhibitions"""
    post_id = post["id"]

    # Get tags for this post
    post_tag_ids = [pt["tag_id"] for pt in post_tags_map if pt["post_id"] == post_id]
    post_tag_names = [
        tags_map[tid]["name"].lower() for tid in post_tag_ids if tid in tags_map
    ]

    # Check tags
    if (
        "work" in post_tag_names
        or "works" in post_tag_names
        or "artwork" in post_tag_names
    ):
        return "works"
    elif "exhibition" in post_tag_names or "show" in post_tag_names:
        return "exhibitions"
    else:
        return "writings"


def get_post_tags(post_id, tags_map, post_tags_map):
    """Get list of tag names for a post"""
    post_tag_ids = [pt["tag_id"] for pt in post_tags_map if pt["post_id"] == post_id]
    return [tags_map[tid]["name"] for tid in post_tag_ids if tid in tags_map]


def convert_post_to_hugo(post, tags_map, post_tags_map, content_dir):
    """Convert a single Ghost post to Hugo format"""

    # Determine content type
    content_type = determine_content_type(post, tags_map, post_tags_map)

    # Create slug
    slug = post["slug"]

    # Parse date
    if post["published_at"]:
        pub_date = datetime.fromisoformat(post["published_at"].replace("Z", "+00:00"))
        date_str = pub_date.strftime("%Y-%m-%dT%H:%M:%S+08:00")
    else:
        date_str = datetime.now().strftime("%Y-%m-%dT%H:%M:%S+08:00")

    # Get tags
    tags = get_post_tags(post["id"], tags_map, post_tags_map)

    # Convert HTML to Markdown
    if post["html"]:
        content = clean_html_to_markdown(post["html"])
    else:
        content = post.get("plaintext", "")

    # Extract images
    images = extract_image_urls(post["html"]) if post["html"] else []

    # Determine category based on tags and content type
    category = "Reviews" if content_type == "writings" else ""

    # Create frontmatter
    title = post["title"].replace("'", "\\'")
    frontmatter = f"""+++
date = '{date_str}'
title = '{title}'
slug = '{slug}'
"""

    if post.get("custom_excerpt"):
        excerpt = post["custom_excerpt"].replace("'", "\\'")
        frontmatter += f"description = '{excerpt}'\n"

    if category:
        frontmatter += f"category = '{category}'\n"

    if tags:
        tags_str = ", ".join([f"'{tag}'" for tag in tags])
        frontmatter += f"tags = [{tags_str}]\n"

    if post.get("feature_image"):
        frontmatter += f"feature_image = '{post['feature_image']}'\n"

    frontmatter += f"draft = false\n"
    frontmatter += "+++\n\n"

    # Combine frontmatter and content
    full_content = frontmatter + content

    # Create directory structure
    post_dir = Path(content_dir) / content_type / slug
    post_dir.mkdir(parents=True, exist_ok=True)

    # Write file
    output_file = post_dir / "index.md"
    with open(output_file, "w", encoding="utf-8") as f:
        f.write(full_content)

    return {
        "slug": slug,
        "type": content_type,
        "path": str(output_file),
        "images": images,
        "title": post["title"],
    }


def main():
    # Paths
    ghost_export = (
        "/home/wancat/src/peiyao.run/pei-yao-pei-yao.ghost.2025-12-17-16-02-35.json"
    )
    content_dir = "/home/wancat/src/peiyao.run/content"

    # Read Ghost export
    print("Reading Ghost export...")
    with open(ghost_export, "r", encoding="utf-8") as f:
        data = json.load(f)

    # Extract data
    posts = data["db"][0]["data"]["posts"]
    tags = data["db"][0]["data"]["tags"]
    posts_tags = data["db"][0]["data"]["posts_tags"]

    # Create maps
    tags_map = {tag["id"]: tag for tag in tags}

    print(f"Found {len(posts)} posts to migrate")
    print()

    # Convert each post
    results = []
    for i, post in enumerate(posts):
        if post["status"] != "published":
            print(f"Skipping unpublished post: {post['title']}")
            continue

        print(f"[{i + 1}/{len(posts)}] Converting: {post['title']}")
        try:
            result = convert_post_to_hugo(post, tags_map, posts_tags, content_dir)
            results.append(result)
            print(f"  → {result['type']}/{result['slug']}")
        except Exception as e:
            print(f"  ✗ ERROR: {e}")
            import traceback

            traceback.print_exc()

    print()
    print(f"Successfully migrated {len(results)} posts!")
    print()

    # Summary by type
    works = [r for r in results if r["type"] == "works"]
    writings = [r for r in results if r["type"] == "writings"]
    exhibitions = [r for r in results if r["type"] == "exhibitions"]

    print(f"Works: {len(works)}")
    print(f"Writings: {len(writings)}")
    print(f"Exhibitions: {len(exhibitions)}")
    print()

    # List images to download
    all_images = []
    for result in results:
        all_images.extend(result["images"])

    if all_images:
        print(f"Found {len(all_images)} images to download")
        print("Image URLs saved to images_to_download.txt")
        with open("/home/wancat/src/peiyao.run/images_to_download.txt", "w") as f:
            for img in sorted(set(all_images)):
                f.write(img + "\n")


if __name__ == "__main__":
    main()
