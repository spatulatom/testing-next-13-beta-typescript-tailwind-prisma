---
name: local-unicode-icon
description: Select context-appropriate Unicode icons with OS compatibility analysis. Checks Windows 10+ support as bottleneck, explains text-style (CSS-styleable with FE0E) vs emoji-style (platform-rendered with FE0F) presentations, and provides HTML entities, CSS examples, and cross-platform rendering guidance. Use when user needs to pick an icon, find a symbol, check Unicode/emoji support, or decide between text-style and emoji-style characters.
disable-model-invocation: true
---

# Unicode Icon Selection & OS Compatibility Skill

**Purpose**: Help select Unicode characters for web projects by analyzing OS support (using Windows 10 as bottleneck), presentation modes (text vs emoji), and CSS styleability. Provides ready-to-use HTML entities, CSS code, and platform-specific rendering guidance.

---

## Reality Check: What No Tool Can Do

Before diving in, understand these hard truths about Unicode compatibility:

1. **There is no "Can I Use" for Unicode.** No website or database gives you a clean compatibility matrix for all Unicode characters across all OSes. Emojipedia is the closest thing, but it only covers the emoji subset.
2. **Compatibility is OS-level, not browser-level.** Browsers just ask the OS to render a character. If the OS doesn't have the glyph in any installed font, you get `�`. The browser is irrelevant — what matters is which fonts the OS ships.
3. **Support is per-character, not per-version.** A Unicode release (e.g., 8.0) might add 120 emoji. An OS might ship support for 80 of them and never add the other 40. Two characters from the same Unicode version can have completely different OS support.
4. **Vendors cherry-pick.** Apple, Google, Microsoft, and Samsung each independently decide which glyphs to add to their system fonts, based on design priorities, demand, and file size constraints.
5. **The only 100% reliable check is testing on actual OSes** (e.g., via BrowserStack or real devices). Everything else — Emojipedia, heuristics, Unicode version age — is an informed shortcut, not a guarantee.

**What this skill does:** Uses the best available shortcuts (Emojipedia for emoji, heuristics for symbols) and is transparent about confidence levels. When certainty matters, it recommends SVG or device testing.

---

## Table of Contents

1. <a href="#when-to-use-this-skill">When to Use This Skill</a>
2. <a href="#-critical-two-mandatory-user-interaction-checkpoints">Critical: Two Mandatory Checkpoints</a>
3. <a href="#quick-reference-simple-cases">Quick Reference</a>
4. <a href="#core-workflow">Core Workflow</a>
   - <a href="#step-1-understand-users-context">Step 1: Understand Context</a>
   - <a href="#step-2-search-for-candidate-characters">Step 2: Search Candidates</a>
   - <a href="#step-3-check-os-support-for-all-candidates">Step 3: Check OS Support</a>
   - <a href="#step-4-present-candidates-with-verified-os-data--checkpoint-1">Step 4: Present Candidates</a>
   - <a href="#step-5-wait-for-user-selection">Step 5: Wait for Selection</a>
   - <a href="#step-6-determine-text-vs-emoji-presentation-for-selected-character--checkpoint-2">Step 6: Determine Presentation</a>
   - <a href="#step-7-generate-comprehensive-output-for-selected-character">Step 7: Generate Output</a>
   - <a href="#step-8-provide-copy-paste-code--testing">Step 8: Code & Testing</a>
5. <a href="#resources-referenced">Resources & References</a>
6. <a href="#example-session-flow">Example Session Flow</a>
7. <a href="#final-notes">Final Notes</a>

---

## When to Use This Skill

Activate when the user explicitly requests:

- **Icon/symbol selection**: "Find a phone icon", "I need a star symbol"
- **Unicode character lookup**: "Unicode for copyright", "What's the code for an arrow"
- **Support checking**: "Does this emoji work on Windows 10?", "Check iOS support"
- **Text vs emoji guidance**: "Can I style this with CSS?", "Why does this look different on iOS?"

---

## 🛑 CRITICAL: Two Mandatory User Interaction Checkpoints

This skill requires **TWO EXPLICIT STOPS** to gather user input. These are NOT optional:

### ⚠️ CHECKPOINT #1: Icon Selection (Step 4)

**STOP and ask the user to choose** from candidate icons before proceeding.

- Present 2-6 candidate options with OS support and presentation type
- **DO NOT skip this** even if only one option exists (user needs context)
- Wait for explicit user selection

### ⚠️ CHECKPOINT #2: Text vs Emoji Preference (Step 6)

**STOP and ask about styling needs** before generating final code.

- Ask if user wants text-style (CSS styleable) or emoji-style (platform-native)
- Only applicable if character supports dual-presentation
- For emoji-only characters, explain limitation and confirm acceptance

**These checkpoints ensure the LLM doesn't make assumptions about user preferences.**

**Example prompts**:

- _"Find a Unicode phone icon that works on Windows 10 and iOS, and can be styled with CSS"_
- _"I need a copyright symbol for my footer"_
- _"Show me star icons for ratings - I want to color them with CSS"_
- _"Why does my ☎ symbol look red on iPhone but white on Android?"_

---

## Quick Reference (Simple Cases)

**Use this abbreviated flow ONLY for:**

- Single, unambiguous lookups ("What's the Unicode for copyright?")
- User already knows exactly what character they want
- No styling or compatibility concerns mentioned

**Quick flow:**

1. **Search** Symbl.cc for character
2. **Verify OS support** via Emojipedia
3. **Provide** HTML entity + code point
4. **Skip** detailed workflow

**Example**: User asks "What's the Unicode for copyright?"
→ Quick answer: `© (U+00A9, &#169;) — works everywhere since Latin-1`

**⚠️ IMPORTANT: If there are multiple options OR styling considerations, you MUST follow the full workflow with both checkpoints.**

For complex cases (icon selection, styling needs, platform consistency), follow full workflow below.

**Constraint priority order** (evaluate in this sequence to avoid tracking everything at once):

1. Does it render at all on Windows 10? (bottleneck OS)
2. Does the user need CSS color styling? (rules out emoji-only)
3. Does appearance need to be consistent across platforms? (may require SVG)

---

## Core Workflow

### Step 1: Understand User's Context

Extract from the user's prompt:

- **Icon purpose**: phone link, rating, navigation, decoration, legal notice
- **Styling needs**: Must work with CSS `color`? Need consistent look? Platform-native OK?
- **Target OSes**: Windows 10+? iOS 15+? If not specified, assume: Windows 10, macOS 12+, iOS 15+, Android 12+

**Key insight from user's bottleneck OS concept**:

> If a symbol works on **Windows 10** (oldest common target), it typically works on macOS, iOS, and modern Android. Windows 10 is the bottleneck 90% of the time.

---

### Step 2: Search for Candidate Characters

Use `fetch_webpage` to search Symbl.cc:

```
URL: https://symbl.cc/en/search/?q={KEYWORD}
```

Replace `{KEYWORD}` with user's search term (e.g., "phone", "star", "arrow", "copyright").

**Collect from the fetched data**:

- Character name
- Unicode code point (U+XXXX)
- HTML decimal entity (&#DDDD;)
- HTML hex entity (&#xHHHH;)
- Related/similar characters

**Compile a list** of 3-6 candidate characters.

**⚠️ IMPORTANT**: Steps 2-3 are **INTERNAL PREPARATION**. User sees **NOTHING** until Step 4 presents verified candidates with real OS support data.

**If no suitable Unicode character is found**: Inform the user that no Unicode character meets their requirements and recommend one of these alternatives:

- **SVG icon**: Full CSS control, pixel-perfect consistency, small file size (preferred when color or cross-platform consistency is critical)
- **Icon font** (e.g., Material Icons, Font Awesome): Wide glyph coverage, CSS-styleable, but requires an external dependency
- **Custom image**: Use `<img>` with a descriptive `alt` attribute

State clearly which constraint could not be satisfied (e.g., "no Unicode phone symbol supports CSS color on iOS reliably") so the user understands the reason.

**Fallback**: If search quality is poor, try:

```
URL: https://www.fileformat.info/info/unicode/char/{CODEPOINT}/index.htm
```

---

### Step 3: Check OS Support for ALL Candidates

**For EACH candidate found in Step 2**, determine OS support using the three-tier lookup:

#### Tier 1: Emojipedia (PRIMARY — Best for Emoji)

**Scope**: Emojipedia only covers characters with emoji presentation (U+1F300+ range and older symbols that gained emoji variants like ☎ ⭐ ❤). It does NOT cover pure text symbols like © → ★ ✓. If the character is not emoji-capable, skip to Tier 2.

For each emoji-capable candidate, use `fetch_webpage`:

```
URL: https://emojipedia.org/[CHARACTER-NAME-SLUG]
```

**URL examples**:

- ☎ → `https://emojipedia.org/telephone`
- ⭐ → `https://emojipedia.org/star`
- 📞 → `https://emojipedia.org/telephone-receiver`

**Extract from the page**:

- Platform support tables (e.g., "Windows 10 version 1607", "iOS 10.0", "Android 8.0")
- Unicode version (e.g., "Unicode 1.1 (1993)", "Unicode 13.0 (2020)")
- Vendor support dates

**If platform table found** → Use this data (highest confidence ✅)

**If platform table missing or no Emojipedia page exists** → The character is likely a pure text symbol. Skip to Tier 2 heuristics

---

#### Tier 1.5: Unicode Version Page (SECONDARY - Historical Context)

**Use when**: Tier 1 page lacks platform support details, but you need to understand when this character's Unicode standard was released (for context or bottleneck estimation).

**How to access**:

```
URL: https://emojipedia.org/unicode-{VERSION}/
```

**URL examples**:

- Unicode 6.0 → `https://emojipedia.org/unicode-6.0/`
- Unicode 13.0 → `https://emojipedia.org/unicode-13.0/`
- Unicode 1.1 → `https://emojipedia.org/unicode-1.1/`

**What to extract**:

- **Release date** (e.g., "October 2010")
- **Historical notes** (when emoji presentation was added, design history)
- Timeline context for OS adoption patterns

**Purpose**: This is reference data, not definitive platform info. Use it to:

- Understand when the character became available
- Cross-reference with your **Tier 2 heuristic table** (e.g., "Unicode 6.0 (2010) typically reached Windows by 2012")
- Make educated guesses if Tier 2 heuristics seem uncertain

**Confidence**: ⚠️ Medium (historical facts verified, but doesn't have platform-specific data)

**If version page found** → Use as reference context for Tier 2 heuristics

**If version page missing or insufficient** → Proceed directly to Tier 2

---

#### Tier 2: Heuristic Rules (FALLBACK)

**Use when Tier 1 fetch fails or page lacks detailed platform support tables.**

→ See `os-compatibility-reference.md` for the full heuristic lookup tables (Unicode version risk, character range rules, bottleneck OS logic)

**Confidence**: ⚠️ Medium (estimated from heuristics)

---

**Also determine which character category** each candidate falls into:

- **Text characters** (`© ® ★ ✓ →`): Always render as text, always CSS-styleable. No Emojipedia page. No variation selector needed.
- **Symbols with emoji variants** (`☎ ⭐ ❤ ✔ ⚠`): The tricky category. Supports both FE0E (text) and FE0F (emoji). OS may override your choice.
- **Emoji** (`😀 📱 📞 🎉`): Always render as vendor artwork. CSS color won't work. No text variant.

Consult `text-vs-emoji-guide.md` for the full three-category taxonomy and character lists.

**Apply bottleneck OS logic**:

- If character works on **Windows 10** → ✅ Mark as **Safe**
- If character requires **Windows 11** → ⚠️ Mark as **Windows 11+ only**

---

### Step 4: Present Candidates with Verified OS Data 🛑 CHECKPOINT #1

**⚠️ MANDATORY STOP: Present candidates and WAIT for user selection.**

Do NOT proceed to Step 5 without explicit user choice.

**Now present candidates** with REAL OS support data from Step 3:

```
Found [N] candidate icons:

1. [Character] (U+XXXX [Name])
   OS Support: [Specific Windows/macOS/iOS/Android versions]
   Presentation: [Dual/Text-only/Emoji-only + implications]
   Confidence: [✅ Verified / ⚠️ Reference / ⚠️⚠️ Estimated]

2. [Character] (U+XXXX [Name])
   OS Support: [Specific versions]
   Presentation: [Type + implications]
   Confidence: [Level]

3. ...

Which icon do you want to use?
```

**Example presentation with real data**:

```
Found 4 phone icons:

1. ☎ (U+260E Black Telephone)
   OS Support: ✅ Windows Vista (2006), all macOS/iOS, Android 1.0+
   Presentation: Dual-presentation ✅ (CSS color works with FE0E)
   Confidence: ✅ Verified from Emojipedia

2. ☏ (U+260F White Telephone)
   OS Support: ✅ Windows Vista (2006), all macOS/iOS, Android 1.0+
   Presentation: Text-only (CSS color works)
   Confidence: ⚠️ From reference file

3. 📞 (U+1F4DE Telephone Receiver)
   OS Support: ✅ Windows 8 (2012), macOS 10.7+, iOS 6+, Android 4.3+
   Presentation: Emoji-only ❌ (CSS color ignored)
   Confidence: ✅ Verified from Emojipedia

4. 📱 (U+1F4F1 Mobile Phone)
   OS Support: ✅ Windows 8 (2012), macOS 10.7+, iOS 6+, Android 4.3+
   Presentation: Emoji-only ❌ (CSS color ignored)
   Confidence: ✅ Verified from Emojipedia

Which icon do you want to use?
```

**Highlight key information**:

- ✅ = Works on user's target platforms
- ❌ = Limitations (emoji-only means no CSS color)
- ⚠️ = Caveats (Windows 11 only, or estimated support)

**🛑 REQUIRED: End your response here with a clear question:**

- "Which icon do you want to use?" (if 3+ options)
- "Would you like option 1 or 2?" (if 2 options)
- "Should I use this one?" (if 1 option, to confirm understanding)

**DO NOT proceed to Step 5 until user responds.**

---

### Step 5: Wait for User Selection

**This is a REQUIRED interaction checkpoint.**

User must explicitly choose:

- "I'll take the first one" / "Use the star" / "Give me number 3"
- Or ask clarifying questions about the options

**Once user selects**, proceed to Step 6 to determine text vs emoji presentation.

**If user tries to skip selection**, prompt them: "Please let me know which option you prefer (1, 2, 3, etc.) so I can provide the exact code you need."

---

### Step 6: Determine Text vs Emoji Presentation (for Selected Character) 🛑 CHECKPOINT #2

**⚠️ MANDATORY STOP: Ask about styling preferences before generating code.**

Consult `text-vs-emoji-guide.md` for:

- Detailed explanation of variation selectors (FE0E/FE0F)
- Character types (dual-presentation, emoji-only, text-only)
- Platform-specific behavior and testing methods
- CSS styling compatibility matrix

**Determine character type first:**

1. **If emoji-only** (no text variant): Present limitation clearly and ask for confirmation
   - "This is emoji-only, which means CSS color won't work. The icon will always be rendered in colors predefined by the operating system or vendor (for example, yellow on Apple, blue on Google) and cannot be changed with CSS. Is that okay for your use case?"
   - Offer SVG alternative if user needs color control
2. **If dual-presentation** (supports both): Ask user to choose
   - Present comparison table showing text-style vs emoji-style trade-offs
   - Ask: "Would you like the text-style (CSS-styleable) or emoji-style (rendered in vendor-defined colors by the OS/platform)?"
3. **If text-only**: Proceed directly (no choice needed, but mention iOS considerations)

**🛑 REQUIRED: Do not generate final code until user responds to this question.**

**Quick decision matrix to show user:**

| User Need                 | Recommendation           | Why                        |
| ------------------------- | ------------------------ | -------------------------- |
| CSS color styling         | Text-style (FE0E) or SVG | Emoji ignores CSS color    |
| Pixel-perfect consistency | SVG                      | Unicode varies by platform |
| Platform-native look      | Emoji-style (FE0F)       | Accept vendor differences  |
| Performance critical      | Unicode (any style)      | Zero HTTP overhead         |

⚠️ **iOS caveat**: Often forces emoji despite FE0E - use SVG if iOS users dominant

**After presenting this information, explicitly ask:**

- For dual-presentation: "Do you want text-style (CSS colors) or emoji-style (platform colors)?"
- For emoji-only: "This character can't be styled with CSS. Is that acceptable, or would you like me to find alternatives?"

**DO NOT proceed to Step 7 until user responds.**

---

### Step 7: Generate Comprehensive Output (for Selected Character)

**Only reach this step after BOTH checkpoints (Steps 4 and 6) are completed.**

Present results in a structured format:

#### A. Character Summary Table

| Property         | Value                                |
| ---------------- | ------------------------------------ |
| **Character**    | ☎                                    |
| **Name**         | Black Telephone                      |
| **Code Point**   | U+260E                               |
| **HTML Decimal** | `&#9742;`                            |
| **HTML Hex**     | `&#x260E;`                           |
| **CSS Escape**   | `\260E` (use in `content: '\260E';`) |
| **JavaScript**   | `\u260E`                             |
| **UTF-8 Bytes**  | E2 98 8E                             |

#### B. OS Compatibility Matrix

| Platform        | Support                     | Notes                              |
| --------------- | --------------------------- | ---------------------------------- |
| **Windows 10+** | ✅ Since Vista (2006)       | Segoe UI Symbol font               |
| **macOS**       | ✅ All versions             | System font                        |
| **iOS**         | ✅ All versions             | Text or emoji depending on context |
| **Android**     | ✅ Since Android 1.0 (2008) | Roboto/Noto Sans                   |
| **Verdict**     | ✅ **SAFE**                 | Works on all common targets        |

#### C. Presentation Modes Comparison

**Text-Style (Styleable)** `&#x260E;&#xFE0E;`

- ✅ CSS `color`, `font-size`, `text-shadow` work
- ⚠️ iOS may override and show emoji anyway
- Fonts: Segoe UI Symbol (Win), SF Pro (Mac), Roboto (Android)

**Emoji-Style (Platform-Native)** `&#x260E;&#xFE0F;`

- ❌ CSS `color` ignored (baked-in colors)
- Platform-specific designs (Apple red phone vs Google white phone)

**SVG Alternative**

- ✅ 100% consistent across platforms
- ✅ Full CSS control
- ❌ Larger file size

_See `use-case-examples.md` for complete code examples_

#### D. Recommendation

Based on user's requirements:

**Recommendation: [Text-style / Emoji-style / SVG]**

**Reasoning**:

- [Explain why based on user's needs: CSS styling, consistency, performance, etc.]
- [Note any platform-specific gotchas, especially iOS behavior]
- [Reference decision matrix from use-case-examples.md if needed]

---

### Step 8: Provide Copy-Paste Code & Testing

#### A. Ready-to-Use Code

Include ready-to-use code snippets from `use-case-examples.md`:

**Quick Copy (Text-Style)**:

```html
&#x260E;&#xFE0E;
```

**Quick Copy (Emoji-Style)**:

```html
&#x260E;&#xFE0F;
```

**Full HTML Example**:

```html
<a
  href="tel:+48696482661"
  class="phone-link"
  style="color: #007aff; text-decoration: none;"
>
  &#x260E;&#xFE0E; 696 482 661
</a>
```

**CSS for Styling**:

```css
.phone-link {
  color: #007aff;
  font-size: 18px;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.phone-link:hover {
  color: #0051d5;
  text-decoration: underline;
}
```

#### B. Testing Workflow

Suggest this verification process:

**1. DevTools Inspection**:

```
Right-click symbol → Inspect → Computed tab → "Rendered Fonts"
Should show: Segoe UI Symbol (text) or Segoe UI Emoji (emoji) on Windows
```

**2. JavaScript Console Check**:

```javascript
const s = "☎️"; // Paste the symbol
Array.from(s).map((ch) => `U+${ch.codePointAt(0).toString(16).toUpperCase()}`);
// Output: ["U+260E", "U+FE0F"] means emoji-style
```

**3. CSS Color Test**:

```html
<span style="color: red;">☎︎</span>
<!-- Should be red if text-style works -->
<span style="color: red;">☎️</span>
<!-- Will NOT be red (emoji ignores CSS) -->
```

**4. Visual Test Matrix**: Windows 10/11, macOS, iOS (real device), Android

---

## Resources Referenced

This skill uses the following reference materials in this directory:

- `os-compatibility-reference.md` — OS support heuristics, bottleneck OS methodology (Windows 10 as limiting factor), Unicode version mapping
- `text-vs-emoji-guide.md` — Variation selectors (FE0E/FE0F), platform-specific behavior, dual-presentation characters, CSS styling matrix
- `use-case-examples.md` — Code snippets for common scenarios (phone, email, copyright, ratings, accessibility patterns)

**Live Data Sources**:

- **Emojipedia.org** (PRIMARY): OS version support data, vendor implementation details, Unicode version history
- **Symbl.cc**: Unicode character search and entity codes
- **FileFormat.Info**: Technical Unicode reference (fallback)

---

## Example Session Flow

**User**: "Find a phone icon for my contact page that I can style with CSS"

**Skill Response**:

1. **Search Symbl.cc** for "phone"
2. **Find candidates**: ☎ (U+260E), ☏ (U+260F), 📞 (U+1F4DE), 📱 (U+1F4F1)
3. **Check OS support** (fetch Emojipedia for each):
   - ☎ (U+260E): ✅ Windows Vista+ (2006), all platforms
   - ☏ (U+260F): ✅ Windows Vista+ (2006), all platforms
   - 📞 (U+1F4DE): ✅ Windows 8+ (2012), all modern platforms
   - 📱 (U+1F4F1): ✅ Windows 8+ (2012), all modern platforms
4. **Check presentation modes**:
   - ☎ supports dual-presentation (FE0E text ✅, FE0F emoji)
   - ☏ text-only (CSS color ✅)
   - 📞 emoji-only (CSS color ❌)
   - 📱 emoji-only (CSS color ❌)
5. **Present candidates**:

   ```
   Found 4 phone icons:

   1. ☎ (U+260E Black Telephone)
      OS Support: ✅ Windows Vista (2006), all macOS/iOS, Android 1.0+
      Presentation: Dual-presentation ✅ (CSS color works with FE0E)
      Confidence: ✅ Verified from Emojipedia

   2. ☏ (U+260F White Telephone)
      OS Support: ✅ Windows Vista (2006), all macOS/iOS, Android 1.0+
      Presentation: Text-only (CSS color works)
      Confidence: ⚠️ From reference file

   3. 📞 (U+1F4DE Telephone Receiver)
      OS Support: ✅ Windows 8 (2012), macOS 10.7+, iOS 6+, Android 4.3+
      Presentation: Emoji-only ❌ (CSS color ignored)
      Confidence: ✅ Verified from Emojipedia

   4. 📱 (U+1F4F1 Mobile Phone)
      OS Support: ✅ Windows 8 (2012), macOS 10.7+, iOS 6+, Android 4.3+
      Presentation: Emoji-only ❌ (CSS color ignored)
      Confidence: ✅ Verified from Emojipedia

   Since you need CSS styling, options 1 or 2 are best. Which do you prefer?
   ```

6. **User picks**: "I'll use option 1"
7. **Provide detailed analysis**: Text-style vs emoji-style comparison
8. **Recommendation**: ☎ with FE0E (text-style)
   - ✅ Works on Windows 10+ (user's bottleneck)
   - ✅ CSS color will work (mostly, iOS may override)
   - ✅ Lightweight (single character)
   - ⚠️ iOS caveat: May still show emoji. If consistency critical, use SVG.
9. **Provide code**:
   ```html
   <a href="tel:+1234567890" style="color: #007aff;">
     &#x260E;&#xFE0E; Call us
   </a>
   ```

---

## Final Notes

**Philosophy**: This skill borrows the mental model of browser compatibility workflows (know your targets → check the bottleneck → provide fallbacks), but with an important difference: **no "Can I Use" database exists for Unicode.** Unlike CSS features where browser support is programmatically testable, Unicode support depends on which glyphs each OS vendor chose to include in their system fonts — and that's per-character, not per-version. Emojipedia fills this gap for emoji; for everything else, we estimate from heuristics and recommend testing when certainty matters.

**OS, not browsers**: Unicode rendering is an OS-level concern. The browser just passes the character to the OS for rendering. Testing "Chrome on Windows 10" is really testing "Windows 10 fonts" — the browser is just the window you're looking through.

**Performance**: Unicode characters have zero HTTP overhead, no icon font downloads, and are greppable/searchable in code. Prefer them when OS support and styling requirements align.

**Accessibility**: Unicode symbols work with screen readers, but should still have proper semantic HTML (e.g., phone link should use `<a href="tel:">`, not just a decorative symbol).
