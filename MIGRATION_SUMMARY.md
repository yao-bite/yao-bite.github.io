# Ghost to Hugo Migration Summary

## Migration Complete ✓

Successfully migrated **34 articles** from Ghost CMS to Hugo.

### Content Breakdown

- **Works**: 12 posts
- **Writings**: 22 posts
- **Exhibitions**: 0 posts

### What Was Migrated

✓ All post content (HTML converted to Markdown)
✓ Post metadata (titles, dates, slugs)
✓ Tags and categories
✓ Feature images
✓ Custom excerpts/descriptions
✓ Publication dates

### File Structure

Posts are organized as:
```
content/
├── works/
│   ├── doublechannel-ii/
│   │   └── index.md
│   ├── givemefive/
│   │   └── index.md
│   └── ...
└── writings/
    ├── artreview-alchemizingmist/
    │   └── index.md
    ├── art-review-hernia-maniac/
    │   └── index.md
    └── ...
```

### Next Steps Required

#### 1. Download Images

Run the image download script:
```bash
./download_images.sh
```

This will:
- Download 309 images from the Ghost site
- Save them to `downloaded_images/` directory
- Preserve the original directory structure

#### 2. Organize Images

After downloading, you need to:
- Review images in `downloaded_images/`
- Move images to appropriate post directories (e.g., `content/works/doublechannel-ii/`)
- Update image paths in markdown files from `/images/...` to relative paths

#### 3. Update Image References

Replace all `__GHOST_URL__` placeholders in markdown files with proper paths:

**Option A**: Keep images in centralized location
```bash
# Replace __GHOST_URL__ with /images or your static path
find content -name "*.md" -type f -exec sed -i 's|/images|/images|g' {} +
```

**Option B**: Use relative paths per post
- Move images to each post's directory
- Update references to `image.jpg` (relative path)

#### 4. Review Migration Quality

Check a few posts to ensure:
- [ ] Markdown formatting is correct
- [ ] Chinese characters display properly
- [ ] Code blocks and lists render correctly
- [ ] Links are working
- [ ] Metadata is accurate

#### 5. Handle Duplicate/Similar Posts

Some posts may have multiple versions (EN/TW or similar slugs):
- `ontheground` vs `ontheground-en`
- `doublechannel-ii` vs `double-channel-ii` (existing)
- `the-dual-double-channel` appears multiple times
- `cv-en-2` vs existing CV pages

Review and merge/organize these as needed.

### Migration Files

- **Migration Script**: `ghost_to_hugo.py`
- **Image Download Script**: `download_images.sh`
- **Image List**: `images_to_download.txt` (309 images)
- **Ghost Export**: `pei-yao-pei-yao.ghost.2025-12-17-16-02-35.json`

### Example Migrated Post

**Location**: `content/writings/artreview-alchemizingmist/index.md`

```toml
+++
date = '2023-03-30T14:53:47+08:00'
title = '鄭文豪、劉書妤《冶煉是水氣》：時空的合成與析出'
slug = 'artreview-alchemizingmist'
description = '在這檔展覽中，兩位創作者看似呈現出截然不同的狀態...'
category = 'Reviews'
tags = ['藝術評論 art reviews']
draft = false
+++
```

### Notes

- All posts are set to `draft = false` (published)
- Dates are preserved from Ghost with +08:00 timezone
- HTML has been converted to Markdown format
- Image URLs contain `__GHOST_URL__` placeholder that needs to be replaced
- Some posts were automatically categorized based on tags

### Issues to Address

1. **Images**: All image URLs need to be updated after download
2. **Duplicates**: Some posts may have English and Chinese versions that could be combined using Hugo's multilingual features (index.md + index.tw.md)
3. **Categories**: Review if automatic categorization is correct
4. **Feature Images**: Currently referenced with `__GHOST_URL__`, need to update paths

---

Generated: 2025-12-18
