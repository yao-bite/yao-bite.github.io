# Pei Yao Portfolio Website

Artist portfolio website built with Hugo and Tailwind CSS.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Preview drafts:
```bash
npm run dev
```

Preview production:
```bash
npm run start
```

3. Build for production:
```bash
npm run build:css
npm run build
```

## Content Structure

## Add new posts

```bash
hugo new exhibitions/new-post-path
```

## Draft settings

In every file, there is a `draft` setting which hide the post.

```toml
draft = true.   # hide the post
draft = false.  # display the post
```

### Works (`content/works/`)

Each work should be a markdown file with the following front matter:

```yaml
---
title: "Work Title"
date: 2024-01-01
image: "/images/works/work-1.jpg"
images:
  - "/images/works/work-1-detail.jpg"
  - "/images/works/work-1-install.jpg"
year: "2024"
medium: "Oil on canvas"
dimensions: "100 x 150 cm"
edition: "1/5"
featured: true
exhibitions:
  - "Exhibition Name, Venue, 2024"
---

Description of the work...
```

### Exhibitions (`content/exhibitions/`)

```yaml
---
title: "Exhibition Title"
date: 2024-01-01
type: "Solo Exhibition" # or "Group Exhibition", "Performance"
venue: "Gallery Name"
location: "City, Country"
date: "Jan 1 - Feb 28, 2024"
current: true # Set to true for current exhibitions
image: "/images/exhibitions/exhibition-1.jpg"
images:
  - "/images/exhibitions/exhibition-1-view1.jpg"
  - "/images/exhibitions/exhibition-1-view2.jpg"
works:
  - "Work Title 1"
  - "Work Title 2"
---

Exhibition description and statement...
```

### Writings (`content/writings/`)

```yaml
---
title: "Article Title"
date: 2024-01-01
category: "Reviews" # or "Lyrics", "Research", "Essays"
image: "/images/writings/article-1.jpg"
tags:
  - "contemporary art"
  - "performance"
---

Article content...
```

### About Page (`content/about/_index.md`)

```yaml
---
title: "About"
image: "/images/profile.jpg"
contact:
  email: "artist@example.com"
  phone: "+1234567890"
  address: "City, Country"
links:
  - name: "Instagram"
    url: "https://instagram.com/username"
  - name: "Art Website"
    url: "https://example.com"
---

Biography content...
```

### CV Page (`content/cv/_index.md`)

```yaml
---
title: "CV"
education:
  - degree: "MFA in Fine Arts"
    institution: "University Name"
    year: "2020"
solo_exhibitions:
  - title: "Exhibition Title"
    venue: "Gallery Name"
    location: "City"
    year: "2024"
group_exhibitions:
  - title: "Exhibition Title"
    venue: "Gallery Name"
    location: "City"
    year: "2024"
performances:
  - title: "Performance Title"
    venue: "Venue Name"
    location: "City"
    year: "2024"
awards:
  - title: "Award Name"
    organization: "Organization"
    year: "2024"
publications:
  - title: "Publication Title"
    publisher: "Publisher Name"
    year: "2024"
collections:
  - "Museum Name, City"
  - "Private Collection"
residencies:
  - title: "Residency Name"
    location: "City, Country"
    year: "2024"
---
```

## Multilingual Support

The site supports English (default) and Traditional Chinese (`/tw`).

Create content for different languages:
- English: `content/works/work-title.md`
- Chinese: `content/works/work-title.tw.md`

## Design System

- Background: Light gray (`#f5f5f5`)
- Content cards: White
- Minimalist design with focus on content
- Responsive layout for all screen sizes

## Development

The site uses:
- Hugo static site generator
- Tailwind CSS for styling (CDN in development, compiled for production)
- Responsive design with mobile-first approach
