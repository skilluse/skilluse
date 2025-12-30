# Blog Typography Enhancement

## Overview

Improve blog/article typography styling by referencing best practices from the OpenAlternative project to enhance reading experience and visual appeal.

## Background

Current project blog typography has the following issues:
- Layout density is too compact, reading experience is not comfortable enough
- Link styles are basic, lacking interaction animations
- List spacing control is not refined enough
- Blog listing page uses simple list layout, not modern enough
- Missing heading anchor link functionality

Reference project: `/Users/yuanjiwei/Documents/GitHub/openalternative`

## Requirements

### 1. Prose Typography Optimization
- Adjust paragraphs to `leading-relaxed` line height
- Optimize link styles: semi-transparent underline `prose-a:decoration-foreground/30`
- Add link hover effects: `prose-a:hover:text-primary prose-a:hover:decoration-primary/60`
- Improve list spacing: `prose-ul:first:mt-0`, `prose-ul:last:mb-0`, `prose-li:mt-2`
- Optimize inline code: use em units `prose-code:mx-[0.088em] prose-code:px-[0.33em] prose-code:py-[0.166em]`
- Add heading scroll offset: `prose-headings:scroll-mt-20`
- Strong text styling: `prose-strong:text-foreground`
- Image borders: `prose-img:border`

### 2. Heading Anchor Links
- Display `#` anchor link on heading hover
- Position anchor link to the left of heading
- Smooth opacity transition animation

### 3. Link Interaction Animations
- Global link transitions: `ease-out duration-100`
- External link icon rotation effect on hover

### 4. Blog Listing Page Improvements
- Change to responsive Grid layout
- Add blog post featured images (image frontmatter)
- Card-based design with image, title, description, date

### 5. Blog Detail Page Improvements
- Optimize page spacing: `gap-8 md:gap-10 lg:gap-12`
- Add featured image display area
- Optimize share button styles

### 6. Global Style Optimizations
- Max-width constraints for images/videos/iframes
- Underline offset: `underline-offset-[3px]`
- Decoration thickness: `decoration-[0.075em]`

## Technical Details

### Files to Modify

1. **`packages/websites/components/shared/prose.tsx`**
   - Update Prose component Tailwind classes
   - Add new typography styles

2. **`packages/websites/components/mdx/mdx-components.tsx`**
   - Optimize external link component animations
   - Add heading anchor link support

3. **`packages/websites/app/globals.css`**
   - Add heading anchor link styles
   - Add global link animations
   - Add prose media element styles

4. **`packages/websites/app/(web)/blog/page.tsx`**
   - Change to Grid layout
   - Support featured image display

5. **`packages/websites/app/(web)/blog/[slug]/page.tsx`**
   - Optimize page spacing
   - Add featured image area

6. **`packages/websites/content-collections.ts`**
   - Add `image` frontmatter field support

7. **`packages/websites/components/posts/post-card.tsx`**
   - Refactor to card-based design
   - Support featured images

## Acceptance Criteria

See `features.json` for testable criteria.

## Dependencies

- web04-blog-setup (completed)
- web10-docs-typography (completed)

## Out of Scope

- Blog post sidebar (author info, related posts)
- Comment system
- Table of contents (TOC) - already implemented in docs, can migrate later
