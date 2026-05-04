# Unicode Icon Use Case Examples

**Purpose**: Code snippets demonstrating key concepts: text-style (FE0E), emoji-style (FE0F), CSS styling, and SVG alternatives.

**⚠️ IMPORTANT**: These are **code examples only**. OS compatibility has NOT been verified. Use the skill workflow (Emojipedia → heuristics) to check if characters work on your target platforms before using in production.

**Terminology reminder**:

- **"Text-style"** = Monochrome, CSS-styleable presentation (not just letters — includes all Unicode symbols)
- **"Emoji-style"** = Colorful, vendor-designed presentation (fixed colors, can't be styled)

---

## 1. Phone/Contact Links

### Option A: Text-Style (CSS Styleable) ⭐ Recommended for branding

```html
<a href="tel:+48696482661" class="phone-link"> &#x260E;&#xFE0E; 696 482 661 </a>
```

```css
.phone-link {
  color: #007aff;
  font-size: 18px;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.phone-link:hover {
  color: #0051d5;
  text-decoration: underline;
}
```

**Notes**:

- `&#x260E;` = U+260E (Black Telephone)
- `&#xFE0E;` = Text presentation selector
- CSS color works on Windows/macOS, iOS may override

### Option B: Emoji-Style (Platform Native)

```html
<a href="tel:+48696482661" class="phone-link-emoji">
  &#x260E;&#xFE0F; 696 482 661
</a>
```

**Notes**:

- `&#xFE0F;` = Emoji presentation selector
- CSS color will NOT work (emoji has fixed colors)
- Red phone on iOS, white phone on Windows/Android
- Use when platform-native look is desired

### Option C: SVG (Pixel-Perfect Consistency)

```html
<a href="tel:+48696482661" class="phone-link-svg">
  <svg
    width="18"
    height="18"
    fill="currentColor"
    viewBox="0 0 16 16"
    aria-hidden="true"
  >
    <path
      d="M3.654 1.328a.678.678 0 0 0-1.015-.063L1.605 2.3c-.483.484-.661 1.169-.45 1.77a17.568 17.568 0 0 0 4.168 6.608 17.569 17.569 0 0 0 6.608 4.168c.601.211 1.286.033 1.77-.45l1.034-1.034a.678.678 0 0 0-.063-1.015l-2.307-1.794a.678.678 0 0 0-.58-.122l-2.19.547a1.745 1.745 0 0 1-1.657-.459L5.482 8.062a1.745 1.745 0 0 1-.46-1.657l.548-2.19a.678.678 0 0 0-.122-.58L3.654 1.328z"
    />
  </svg>
  <span>696 482 661</span>
</a>
```

```css
.phone-link-svg {
  color: #007aff;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 16px;
}

.phone-link-svg svg {
  flex-shrink: 0;
}

.phone-link-svg:hover {
  color: #0051d5;
}
```

**Notes**:

- `fill="currentColor"` inherits text color
- Looks identical on all platforms ✅
- Slightly larger file size vs single character

---

## 2. Rating Stars (CSS Styling Example)

### Option A: Text-Style Stars (Styleable) ⭐ Recommended

```html
<div class="rating" role="img" aria-label="4 out of 5 stars">
  <span class="star filled">&#x2B50;&#xFE0E;</span>
  <span class="star filled">&#x2B50;&#xFE0E;</span>
  <span class="star filled">&#x2B50;&#xFE0E;</span>
  <span class="star filled">&#x2B50;&#xFE0E;</span>
  <span class="star">&#x2B50;&#xFE0E;</span>
</div>
```

```css
.rating {
  display: inline-flex;
  gap: 2px;
}

.star {
  color: #ddd;
  font-size: 20px;
}

.star.filled {
  color: #ffc107; /* Gold color */
}
```

**Notes**:

- `&#x2B50;` = U+2B50 (White Medium Star ⭐)
- `&#xFE0E;` forces text-style (CSS color works)
- iOS may override and show emoji

### Option B: Solid/Outline Text Stars

```html
<div class="rating-solid">
  <span class="star-solid">&#x2605;</span
  ><!-- ★ filled -->
  <span class="star-solid">&#x2605;</span>
  <span class="star-outline">&#x2606;</span
  ><!-- ☆ outline -->
  <span class="star-outline">&#x2606;</span>
  <span class="star-outline">&#x2606;</span>
</div>
```

```css
.star-solid {
  color: #ffc107;
  font-size: 20px;
}

.star-outline {
  color: #ddd;
  font-size: 20px;
}
```

**Notes**:

- `&#x2605;` = U+2605 (Black Star ★) - filled
- `&#x2606;` = U+2606 (White Star ☆) - outline
- Text-only (no emoji variants), always styleable ✅

---

## 3. Legal Notices (Universal Support)

```html
<footer>
  <p>&copy; 2026 Company Name. All rights reserved.</p>
  <p>ProductName&reg; and ServiceName&trade; are registered trademarks.</p>
</footer>
```

**Alternative (Numeric Entities)**:

```html
<footer>
  <p>&#xA9; 2026 Company Name. All rights reserved.</p>
  <p>ProductName&#xAE; and ServiceName&#x2122; are registered trademarks.</p>
</footer>
```

```css
footer {
  padding: 20px;
  text-align: center;
  font-size: 14px;
  color: #666;
  border-top: 1px solid #ddd;
}
```

**Notes**:

- `&copy;` / `&#xA9;` = © (Copyright Sign)
- `&reg;` / `&#xAE;` = ® (Registered Trademark)
- `&trade;` / `&#x2122;` = ™ (Trademark)
- Latin-1 range, universal support ✅
- Text-only, fully styleable

---

## 4. SVG Alternative Template

When a Unicode character doesn't meet your needs (no CSS control, platform inconsistency, missing glyph), use this SVG template:

```html
<span class="icon-container" aria-label="Icon description">
  <svg
    width="20"
    height="20"
    fill="currentColor"
    viewBox="0 0 16 16"
    aria-hidden="true"
  >
    <!-- Replace with your SVG path -->
    <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0z" />
  </svg>
</span>
```

```css
.icon-container {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: inherit; /* Inherits from parent */
}

.icon-container svg {
  flex-shrink: 0;
  width: 1em; /* Scales with font-size */
  height: 1em;
}
```

**SVG Source Recommendations**:

- **Bootstrap Icons**: https://icons.getbootstrap.com/ (MIT license)
- **Heroicons**: https://heroicons.com/ (MIT license)
- **Feather Icons**: https://feathericons.com/ (MIT license)
- **Material Icons**: https://fonts.google.com/icons (Apache 2.0)

**Benefits**:

- ✅ Pixel-perfect consistency across all platforms
- ✅ Full CSS control (`fill="currentColor"` inherits text color)
- ✅ Scales with `font-size` using `em` units
- ✅ Animatable with CSS/JS
- ✅ Accessible with proper ARIA labels

**When to Use SVG**:

- Need brand color matching (emoji colors are fixed)
- iOS users dominant (iOS forces emoji despite FE0E)
- Complex icon not available in Unicode
- Pixel-perfect design requirements

---

## Accessibility Quick Reference

- **Semantic HTML**: Use proper elements (`<a href="tel:">`, `<a href="mailto:">`)
- **ARIA labels**: Decorative icons `aria-hidden="true"`, meaningful icons need `aria-label`
- **Don't rely on icons alone**: Include text labels or screen reader text

```html
<!-- Good: Icon + visible text -->
<a href="tel:+1234567890">
  <span aria-hidden="true">☎︎</span>
  <span>Call us</span>
</a>

<!-- Good: Icon with aria-label -->
<a href="tel:+1234567890" aria-label="Call us">
  <span aria-hidden="true">☎︎</span>
</a>
```

---

**End of Examples**
