# Text vs Emoji Presentation Guide

**Purpose**: Understanding the three Unicode character categories, variation selectors (FE0E/FE0F), and when CSS styling works. Critical for choosing the right approach.

---

## Important Terminology Clarification

When this guide says **"text"**, it does **NOT** mean "only letters and numbers you type on a keyboard." It means **anything that's not emoji**:

- ✅ Text includes: `a-z`, `0-9`, `©`, `®`, `™`, `→`, `←`, `★`, `☆`, `✓`, `✖`, accented characters, symbols, etc.
- ✅ Text = Everything you can type via keyboard + Unicode symbols + special characters
- ❌ Emoji = The colorful, vendor-designed glyphs (U+1F300+)

**This guide focuses on symbols with emoji variants** — the middle ground where **you have a choice** between:

- Monochrome, styleable **text version** (FE0E)
- Colorful, unstyable **emoji version** (FE0F)

The guide is really answering: **"Should I use the text-style ☎︎ or emoji-style ☎️ version of this symbol?"**

---

## Unicode's Actual Scope: Meaning vs Appearance

You might wonder: **Isn't Unicode supposed to unify how characters look?** The short answer: **No. Unicode standardizes meaning, not appearance.**

### What Unicode DOES Standardize

✅ **Character identity and meaning:**

- U+1F4DE = "TELEPHONE RECEIVER" on all platforms
- U+1F60A = "SMILING FACE WITH SMILING EYES" everywhere
- 😀 means "happy/smile" on iOS, Android, Windows, and everywhere else

**The meaning is universal.** All users recognize 😀 as a smiling face.

### What Unicode Does NOT Standardize

❌ **Visual appearance/design:**

- Each OS vendor (Apple, Google, Microsoft) designs their own emoji artwork
- Apple's 😀 looks different from Google's 😀
- Windows' 😀 looks different from both

**This is intentional.** Unicode leaves rendering to vendors.

### Why This Design?

1. **Consistency with platform design language:**
   - iOS emoji should feel native to iOS (use Apple's design language)
   - Android emoji should feel native to Android (use Google's design language)
   - Windows emoji should feel native to Windows (use Microsoft's design language)

2. **Flexibility and evolution:**
   - Apple can update their emoji designs without breaking Unicode
   - New vendors can implement Unicode with their own aesthetic
   - Similar to how fonts work — "A" is the same letter in Arial, Helvetica, or Times New Roman

3. **Performance and storage:**
   - Each OS optimizes emoji for their platform (resolution, color, file size)
   - Vendors choose which Unicode characters to support based on user needs

### Real Example: The Telephone Emoji

```
☎️ (U+260E in emoji-style)
```

Same character, different meanings visually:

| Platform      | Look                       | Design Philosophy                                              |
| ------------- | -------------------------- | -------------------------------------------------------------- |
| **iOS/macOS** | 🔴 Red telephone           | Apple's design language: rounded, colorful, friendly           |
| **Android**   | ⚪ White telephone         | Google's design language: varies by version; flat modern style |
| **Windows**   | ⚪ White outline telephone | Microsoft's design language: outline style                     |

**The meaning is identical:** All three are "telephone." Users understand them as the same concept, even though they look different.

### Implications for Web Development

- ✅ **Meaning is guaranteed:** Emoji 😀 will always be understood as happy
- ❌ **Appearance is NOT guaranteed:** You can't control how it looks
- 🎨 **For brand consistency:** Use SVG if exact colors/design matter
- 🌍 **For platform-native feel:** Use emoji-style (FE0F) and accept the visual differences

This is why the guide emphasizes **SVG for pixel-perfect consistency** — if you need exact control over how an icon looks on all platforms, Unicode characters (whether text or emoji) can't guarantee it. SVG gives you that control.

---

## The Three Character Categories

Before understanding presentation modes, know that Unicode characters fall into three categories with fundamentally different behavior:

| Category                        | What they are                                                                                                      | Examples                      | CSS `color` works?                   | Emojipedia has data? |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------ | ----------------------------- | ------------------------------------ | -------------------- |
| **Text characters**             | Basic characters that were never adopted as emoji. Always render as monochrome text glyphs.                        | `© ® ™ « » — … ° ¶ → ← ★ ☆ ✓` | ✅ Always                            | ❌ No                |
| **Symbols with emoji variants** | Older symbols (pre-emoji era) that were later adopted into the emoji standard. Can render as EITHER text or emoji. | `☎ ⭐ ❤ ✔ ⚠ ☀ ☁ ☕ ⚡`        | ✅ In text-style / ❌ In emoji-style | ✅ Yes               |
| **Emoji**                       | Characters born as emoji (U+1F300+ range). Always render as full-color vendor artwork. No text variant exists.     | `😀 📱 📞 🎉 🔥 💬 🔍`        | ❌ Never                             | ✅ Yes               |

**Why this matters:**

- **Text characters** → always safe to style with CSS, but no Emojipedia page exists for compatibility checking
- **Symbols with emoji variants** → the tricky middle ground. You must choose text-style (FE0E) or emoji-style (FE0F), and the OS may override your choice
- **Emoji** → accept vendor artwork or use SVG instead. CSS `color` will never work

The rest of this guide focuses on the **presentation modes** that apply to the middle category (symbols with emoji variants), and explains why they don't apply to the other two.

---

## Hierarchical Structure & Historical Context

### The Family Tree

```
Unicode Characters
│
├─ Text Characters (Unicode 1.1+, 1993)
│  ├─ Pure text-only (never adopted as emoji)
│  │  └─ Examples: © ® ™ → ← ★ ☆ ✓ ✖
│  │
│  └─ Symbols with emoji variants (text first, emoji later)
│     └─ Examples: ☎ ⭐ ❤ ✔ ⚠ ☀ ☁ ☕ ⚡
│     └─ Adopted by Emoji 1.0 (2010) and later versions
│
└─ Emoji (Emoji 1.0+, 2010)
   ├─ Originally adopted symbols (see above)
   └─ Born-as-emoji characters (U+1F300+)
      └─ Examples: 😀 📱 📞 🎉 🔥 💬 🔍
```

### Historical Development

| Era                             | What Happened              | Key Detail                                                                                                                                                                                                 |
| ------------------------------- | -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Unicode 1.1 (1993)**          | Text symbols standardized  | ☎ ⭐ ❤ ✔ ⚠ existed as monochrome text glyphs in Segoe UI Symbol, Wingdings, etc. No emoji concept yet.                                                                                                     |
| **Early 2000s**                 | Emoji in Japan             | Japanese mobile carriers (DoCoMo, KDDI, SoftBank) had proprietary emoji sets, but they weren't standardized.                                                                                               |
| **Unicode 6.0 (2010)**          | **Emoji 1.0 standardized** | Unicode adopted emoji as a formal standard. Key decision: **reuse existing symbols** (☎ ⭐ ❤ etc) as emoji, not create from scratch. Vendors added emoji-style artwork alongside the original text glyphs. |
| **Unicode 7.0–8.0 (2014–2015)** | Emoji explosion            | Added hundreds of new emoji-only characters (U+1F300+). These had no text predecessor.                                                                                                                     |
| **Unicode 13.0+ (2020+)**       | Continuous additions       | New emoji added yearly; rarely any new emoji variants of existing symbols.                                                                                                                                 |

### Why This Matters

**Symbols with emoji variants are historically text characters first.** They didn't start as emoji — they were adopted into the emoji standard years after Unicode 1.1. This is why:

- They exist in system fonts as **monochrome text glyphs** (Segoe UI Symbol on Windows, SF Pro on macOS)
- Vendors later **added full-color emoji artwork** for the same characters
- You can **request either presentation** (FE0E for text, FE0F for emoji)
- The OS **defaults based on platform preference** (Windows prefers text, iOS prefers emoji)

**Pure emoji (U+1F300+)** were born as emoji. They have no text history, never existed as monochrome symbols, and only have the colorful emoji presentation.

---

## The Two Presentation Modes

**These only matter for symbols with emoji variants** (the middle category above). Text characters are always text. Emoji are always emoji.

Symbols with emoji variants can be rendered in **two fundamentally different ways**:

### 1. Text Presentation (Monochrome Glyph)

**Rendered by**: Normal text font (Arial, Segoe UI Symbol, Roboto, SF Pro)

**Characteristics**:

- ✅ **Monochrome** (single color)
- ✅ **CSS `color` works** — inherits text color
- ✅ **CSS `font-size` works** — scales like text
- ✅ **Inherits text formatting** (bold, italic if font supports)
- ⚠️ **Looks different across OSes** (depends on system fonts)
- Used by default on **Windows** for many symbols

**Requested with**: U+FE0E (Text Presentation Selector)

**Example**:

```html
<!-- Black Telephone in text-style -->
<span style="color: blue;">&#x260E;&#xFE0E;</span>
<!-- Result: Blue telephone symbol ☎︎ -->
```

### 2. Emoji Presentation (Full-Color Glyph)

**Rendered by**: Emoji font (Apple Color Emoji, Noto Color Emoji, Segoe UI Emoji)

**Characteristics**:

- 🎨 **Full-color image** (pre-colored by vendor)
- ❌ **CSS `color` does NOT work** — colors are baked in
- ✅ **CSS `font-size` works** — scales the image
- 🔀 **Vendor-specific artwork** (Apple ≠ Google ≠ Microsoft)
- ⚠️ **Looks different across OSes** (different graphic designs)
- Used by default on **iOS/Android** for many symbols

**Requested with**: U+FE0F (Emoji Presentation Selector)

**Example**:

```html
<!-- Black Telephone in emoji-style -->
<span style="color: blue;">&#x260E;&#xFE0F;</span>
<!-- Result: CSS color IGNORED, shows platform emoji ☎️ -->
<!-- Windows: white phone, iOS: red phone, Android: white phone -->
```

---

## Variation Selectors Explained

### U+FE0E — Text Presentation Selector

**Purpose**: Request monochrome, text-style rendering

**HTML**: `&#xFE0E;` (place immediately after base character)

**Example**:

```html
&#x260E;&#xFE0E;
<!-- ☎︎ text-style -->
&#x2B50;&#xFE0E;
<!-- ⭐︎ text-style -->
&#x2764;&#xFE0E;
<!-- ❤︎ text-style -->
```

**When it works**:

- ✅ Windows: Usually respects FE0E
- ✅ macOS: Usually respects FE0E
- ❌ **iOS: Often ignores FE0E** and forces emoji anyway
- ⚠️ Android: Partial support (varies by version)

### U+FE0F — Emoji Presentation Selector

**Purpose**: Request full-color, emoji-style rendering

**HTML**: `&#xFE0F;` (place immediately after base character)

**Example**:

```html
&#x260E;&#xFE0F;
<!-- ☎️ emoji-style -->
&#x2B50;&#xFE0F;
<!-- ⭐️ emoji-style -->
&#x2764;&#xFE0F;
<!-- ❤️ emoji-style -->
```

**When it works**:

- ✅ All platforms respect FE0F (more reliable than FE0E)

### No Selector (Platform Decides)

If you don't specify FE0E or FE0F, the platform chooses:

| Platform    | Default Preference      |
| ----------- | ----------------------- |
| **Windows** | Text-style (monochrome) |
| **macOS**   | Text-style (usually)    |
| **iOS**     | Emoji-style (colorful)  |
| **Android** | Emoji-style (usually)   |

**Example**:

```html
&#x260E;
<!-- No selector -->
```

- Windows → Likely black phone (text)
- iOS → Likely red phone (emoji)

---

## Platform-Specific Behavior

> **Note**: Rendering is an OS-level concern, not a browser concern. The platform behavior below describes how each OS renders characters, regardless of which browser is used. "Test in Chrome on iOS" is really testing "iOS system fonts."

### Windows 10/11

- **Default**: Text-style for dual-presentation characters
- **Text font**: Segoe UI Symbol
- **Emoji font**: Segoe UI Emoji
- **Respects FE0E**: ✅ Yes
- **Respects FE0F**: ✅ Yes
- **CSS color with FE0E**: ✅ Works well

### macOS

- **Default**: Text-style (context-dependent)
- **Text font**: SF Pro, Helvetica Neue
- **Emoji font**: Apple Color Emoji
- **Respects FE0E**: ✅ Usually yes
- **Respects FE0F**: ✅ Yes
- **CSS color with FE0E**: ✅ Usually works

### iOS (Mobile Safari)

- **Default**: Emoji-style (aggressive)
- **Text font**: SF Pro
- **Emoji font**: Apple Color Emoji
- **Respects FE0E**: ❌ **Often ignores it!**
- **Respects FE0F**: ✅ Yes
- **CSS color with FE0E**: ❌ Unreliable
- **CRITICAL**: iOS is the most aggressive about forcing emoji, even when you request text-style

### Android

- **Default**: Emoji-style (varies by version/OEM)
- **Text font**: Roboto, Noto Sans
- **Emoji font**: Noto Color Emoji
- **Respects FE0E**: ⚠️ Partial (varies)
- **Respects FE0F**: ✅ Yes
- **CSS color with FE0E**: ⚠️ Inconsistent

---

## Which Characters Fall Into Each Category?

### ✅ Text Characters (Always Text, Always Styleable)

These have NO emoji variant. CSS `color` always works. No Emojipedia page.

**Pure symbols**:

- ★ U+2605 (Black Star)
- ☆ U+2606 (White Star)
- ✓ U+2713 (Check Mark)
- ✖ U+2716 (Heavy Multiplication X)
- ← → ↑ ↓ (Arrows)
- © ® ™ (Legal symbols)

### ↔️ Symbols with Emoji Variants (Dual-Presentation)

These support BOTH text-style (FE0E) and emoji-style (FE0F). This is where variation selectors matter.

**Older symbols that later became emoji**:

- ☎ U+260E (Black Telephone)
- ⭐ U+2B50 (White Medium Star)
- ✔ U+2714 (Heavy Check Mark)
- ❗ U+2757 (Heavy Exclamation Mark)
- ⚠ U+26A0 (Warning Sign)
- ❤ U+2764 (Heavy Black Heart)
- ☺ U+263A (White Smiling Face)
- ☀ U+2600 (Black Sun with Rays)
- ☁ U+2601 (Cloud)
- ☂ U+2602 (Umbrella)
- ⛄ U+26C4 (Snowman Without Snow)
- ⚡ U+26A1 (High Voltage Sign)
- ❄ U+2744 (Snowflake)
- ☕ U+2615 (Hot Beverage)
- ☮ U+262E (Peace Symbol)
- ☘ U+2618 (Shamrock)
- ⚽ U+26BD (Soccer Ball)

**Pattern**: Characters from Unicode 1.1-7.0 that were later added to emoji standards (Emoji 1.0+). They lived as text symbols for years before emoji existed.

### ❌ Emoji (Always Emoji, Never Styleable)

These ONLY support emoji-style (no text-style variant). Born as emoji, never had a text life.

**Modern emoji** (U+1F300+):

- 📞 U+1F4DE (Telephone Receiver)
- 📱 U+1F4F1 (Mobile Phone)
- 📧 U+1F4E7 (E-Mail Symbol)
- 💡 U+1F4A1 (Electric Light Bulb)
- 🔥 U+1F525 (Fire)
- 💬 U+1F4AC (Speech Balloon)
- 🌐 U+1F310 (Globe with Meridians)
- 📍 U+1F4CD (Round Pushpin)
- 🔍 U+1F50D (Magnifying Glass)
- 🔒 U+1F512 (Lock)
- ✅ U+2705 (White Heavy Check Mark in box)
- ❌ U+274C (Cross Mark)

**No FE0E support**: CSS color will NEVER work on these.

---

## CSS Styling: What Works and What Doesn't

| CSS Property       | Text-Style (FE0E)           | Emoji-Style (FE0F)                 |
| ------------------ | --------------------------- | ---------------------------------- |
| `color`            | ✅ Works perfectly          | ❌ Ignored                         |
| `font-size`        | ✅ Works                    | ✅ Works (scales image)            |
| `background-color` | ✅ Works                    | ✅ Works (background behind emoji) |
| `text-shadow`      | ✅ Works                    | ⚠️ Works but looks odd             |
| `font-weight`      | ✅ Works (if font supports) | ❌ Ignored                         |
| `opacity`          | ✅ Works                    | ✅ Works                           |
| `transform`        | ✅ Works                    | ✅ Works                           |
| `filter`           | ✅ Works                    | ⚠️ Limited (grayscale/invert only) |

### Example CSS

```css
/* Text-style telephone (fully styleable) */
.phone-text {
  color: #007aff; /* ✅ Blue color applies */
  font-size: 24px; /* ✅ Works */
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2); /* ✅ Works */
}

/* Emoji-style telephone (limited styling) */
.phone-emoji {
  color: #007aff; /* ❌ Ignored - emoji stays red (iOS) or white (Android/Windows) */
  font-size: 24px; /* ✅ Works - scales the image */
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2); /* ⚠️ Works but looks odd on color image */
}
```

---

## Decision Matrix: When to Use What

| Requirement                        | Recommended Approach      | Why                                  |
| ---------------------------------- | ------------------------- | ------------------------------------ |
| **Need CSS color styling**         | Text-style (FE0E) or SVG  | Emoji ignores CSS color              |
| **Need pixel-perfect consistency** | SVG                       | Unicode rendering varies by platform |
| **Need to match brand colors**     | SVG                       | Emoji colors are fixed by vendor     |
| **Simple decorative icon**         | Text-style (FE0E)         | Lightweight, inherits text styling   |
| **Want platform-native look**      | Emoji-style (FE0F)        | Each OS uses its design language     |
| **Need accessibility**             | Either (with ARIA labels) | Both work with screen readers        |
| **Performance critical**           | Unicode character         | Smaller than SVG, no HTTP request    |
| **Need animation/complex styling** | SVG                       | Full CSS/JS control                  |
| **iOS users dominant**             | SVG or accept emoji       | iOS forces emoji despite FE0E        |
| **Windows users dominant**         | Text-style (FE0E)         | Windows respects FE0E well           |

---

## Common Pitfalls

### Pitfall 1: "I added FE0E but iOS still shows emoji"

**Problem**: iOS often ignores FE0E and forces emoji presentation.

**Solution**:

- Use SVG for guaranteed consistency
- OR accept that iOS will show emoji
- Test on real iOS devices, not just desktop browsers

### Pitfall 2: "Emoji looks different on every device"

**Problem**: Each vendor (Apple, Google, Microsoft) has unique emoji artwork.

**Result**:

- iOS/macOS: Red telephone ☎️
- Windows: White outline telephone
- Android: White telephone (different design)

**Solution**: This is expected behavior for emoji-style. Use SVG if consistency is critical.

### Pitfall 3: "CSS color works on desktop but not mobile"

**Problem**:

- Desktop (Windows) → Often uses text font → CSS color works
- Mobile (iOS/Android) → Forces emoji font → CSS color ignored

**Solution**:

- Explicitly use FE0E for text-style
- Test on actual mobile devices
- Use SVG for guaranteed color control

### Pitfall 4: "The emoji color doesn't match my design"

**Problem**: Emoji colors are baked in by the OS vendor (red vs white phone).

**Solution**: Don't use emoji-style if you need specific colors. Use text-style (FE0E) or SVG.

---

## Testing in DevTools

### Check Which Font is Rendering

**Chrome/Edge/Firefox**:

1. Right-click symbol → Inspect
2. Computed tab
3. Scroll to "Rendered Fonts"

**Result**:

- `Segoe UI Symbol` (Windows) = Text-style ✅ CSS color works
- `Segoe UI Emoji` (Windows) = Emoji-style ❌ CSS color ignored
- `Apple Color Emoji` (macOS/iOS) = Emoji-style ❌ CSS color ignored
- `Noto Color Emoji` (Android) = Emoji-style ❌ CSS color ignored

### Check Codepoints in JavaScript Console

```javascript
const s = "☎️"; // Paste the symbol from your page
Array.from(s).map((ch) => `U+${ch.codePointAt(0).toString(16).toUpperCase()}`);
```

**Results**:

```javascript
["U+260E"][("U+260E", "U+FE0E")][("U+260E", "U+FE0F")]; // Base character only (platform decides) // Text-style explicitly requested // Emoji-style explicitly requested
```

### Visual Test with CSS Color

```html
<p style="color: red;">
  <span>Text-style: &#x260E;&#xFE0E;</span><br />
  <span>Emoji-style: &#x260E;&#xFE0F;</span>
</p>
```

**Expected**:

- Text-style: Should be red (if platform respects FE0E)
- Emoji-style: Will NOT be red (emoji has fixed colors)

---

## Quick Reference

### Writing Variation Selectors in HTML

```html
<!-- Method 1: Numeric entities (most reliable) -->
&#x260E;
<!-- Base character -->
&#x260E;&#xFE0E;
<!-- Base + text selector -->
&#x260E;&#xFE0F;
<!-- Base + emoji selector -->

<!-- Method 2: Literal (less obvious in code) -->
☎
<!-- Platform decides -->
☎︎
<!-- Text-style (U+260E + U+FE0E) -->
☎️
<!-- Emoji-style (U+260E + U+FE0F) -->
```

### Quick Platform Behavior Summary

| Platform | Respects FE0E?   | Respects FE0F? | CSS Color with FE0E? |
| -------- | ---------------- | -------------- | -------------------- |
| Windows  | ✅ Yes           | ✅ Yes         | ✅ Yes               |
| macOS    | ✅ Usually       | ✅ Yes         | ✅ Usually           |
| iOS      | ❌ Often ignores | ✅ Yes         | ❌ Unreliable        |
| Android  | ⚠️ Partial       | ✅ Yes         | ⚠️ Inconsistent      |

---

## Summary

**The Golden Rule**: Variation selectors (FE0E/FE0F) are **requests, not guarantees**. iOS is the problem child.

Safe Choices:

- Need CSS color? → Text-style (FE0E) + test on iOS, or use SVG
- Need consistency? → SVG always
- Want native look? → Emoji-style (FE0F) + accept platform differences
- Performance matters? → Unicode text-style (zero HTTP overhead)

When in doubt: Use SVG for complete control.

---

## Identifying the Category: Using Symbols.cc & Emojipedia

When researching a character, here's how to identify which of the three categories it falls into:

### Using Emojipedia

**If the character HAS an Emojipedia page:**

- Look at the "Emoji Codepoint" or "Unicode version" section
- If it says **"Unicode 6.0–7.0"** or earlier → **Symbol with emoji variant** (adopted from existing text symbol)
- If it says **"Emoji 1.0+"** alongside a **"U+1F3xx"** or higher range → **Born-as-emoji** (never was text-only)

**Example searches:**

- ☎ (U+260E) → Emojipedia shows "Unicode 1.1" first, then "Emoji 1.0 added" → **Symbol with emoji variant**
- ❤ (U+2764) → Shows "Unicode 1.1" first, then adopted to emoji → **Symbol with emoji variant**
- 😀 (U+1F600) → Shows "Emoji 1.0", range U+1F3xx → **Born-as-emoji**

**If the character has NO Emojipedia page:**

- It's either **text-only** or too obscure to have emoji support
- Check symbols.cc for confirmation

### Using Symbols.cc

**If the character appears on Symbols.cc:**

1. **Check the "Presentation" or "Variants" section:**
   - If it mentions "emoji variant", "emoji support", or "FE0E/FE0F" → **Symbol with emoji variant**
   - If it says "text only" or has no emoji mention → **Text-only character**

2. **Check the Unicode version:**
   - If Unicode **1.1–7.0** and also has emoji support → **Symbol with emoji variant**
   - If Unicode **1.1–7.0** and NO emoji mention → **Text-only character**

3. **Check the codepoint range:**
   - If **U+1F300 or higher** → **Born-as-emoji** (but symbols.cc may not list these)

**Example searches:**

- ✓ (U+2713) → "Unicode 1.1, text variant" → **Text-only character** (no emoji)
- ☎ (U+260E) → "Unicode 1.1, emoji support, FE0E/FE0F variants" → **Symbol with emoji variant**
- → (U+2192) → "Unicode 1.1, pure symbol" → **Text-only character** (no emoji)

### Quick Decision Tree

```
Does it appear on Emojipedia?
│
├─ YES → Check Unicode version in Emojipedia
│  │
│  ├─ Unicode 1.1–7.0 (not 1F3xx) → Symbol with emoji variant ↔️
│  └─ Emoji 1.0+ with U+1F3xx range → Born-as-emoji 😀
│
└─ NO → Check symbols.cc
   │
   ├─ Found + mentions emoji → Symbol with emoji variant ↔️
   ├─ Found + no emoji mention → Text-only character ✓
   └─ Not found anywhere → Likely text-only or very obscure ✓
```

### Why The Tools Don't Perfectly Distinguish

- **Emojipedia** covers emoji-capable characters, but doesn't explicitly label "adopted symbols" vs "born-as-emoji"
- **Symbols.cc** covers all Unicode, but focuses on the text/symbol aspect
- **You need both** to reliably identify which category a character belongs to

**Best Practice**: Cross-check both tools. Look for:

1. When was it added to Unicode? (1.1–7.0 = old symbol)
2. Does it have emoji support? (Emojipedia + FE0E/FE0F mention on symbols.cc)
3. What's the codepoint range? (U+1F3xx+ = almost certainly born-as-emoji)
