# OS Compatibility Reference for Unicode Icons

**Purpose**: Knowledge base for checking if Unicode characters work across target operating systems. Use Windows 10 as the bottleneck OS shortcut.

---

## Key Facts

- **Compatibility is OS-level, not browser-level.** Browsers delegate character rendering to the OS. A character either exists in the OS's system fonts or it doesn't — the browser is irrelevant.
- **Support is per-character, not per-Unicode-version.** An OS might support 80 of 120 characters from a Unicode release and never add the other 40. Two characters from the same version can have completely different support.
- **There is no "Can I Use" for Unicode.** Emojipedia covers emoji. For non-emoji text symbols, there's no database — only heuristics and device testing.

---

## The Bottleneck OS Concept

> **One OS is almost always the bottleneck** — the one most likely to lack support.

### Bottleneck Hierarchy (Most to Least Restrictive)

```
Most likely to lack support:
┌──────────────────────────────────────────────┐
│  1. Windows 10                               │
│     - Historically slowest to add glyphs     │
│     - Users stay on old versions longest     │
│     - Most common bottleneck (90% of cases)  │
├──────────────────────────────────────────────┤
│  2. Android 10+                              │
│     - Fragmented, many old devices in use    │
│     - OEMs sometimes strip fonts             │
├──────────────────────────────────────────────┤
│  3. Linux (if targeting)                     │
│     - Depends on distro and installed fonts  │
│     - Minimal installs may lack symbol fonts │
├──────────────────────────────────────────────┤
Least likely to lack support:
│  4. macOS / iOS                              │
│     - Apple has excellent Unicode support    │
│     - Users update quickly                   │
│     - Almost never the limiting factor       │
└──────────────────────────────────────────────┘
```

### The Shortcut in Practice

**Rule**: If a character works on **Windows 10**, you can safely assume it works on macOS, iOS, and modern Android/Windows.

**Example workflow**:

```
User's targets: Windows 10+, macOS 12+, iOS 15+, Android 12+

Bottleneck: Windows 10 (oldest, least glyph coverage)

Check: Does Windows 10 have ☎ (U+260E)?
  → YES (Segoe UI Symbol since Vista 2006)
  → ✅ Safe to use on ALL targets

Check: Does Windows 10 have 🫠 (Melting Face, Unicode 14.0, 2021)?
  → Only in Windows 11 22H2+ (2022)
  → ❌ NOT safe for Windows 10 target → use SVG or skip
```

---

## Heuristic Rules for OS Support

When you don't have specific data for a character, use these rules as a rough triage guide rather than a hard compatibility matrix:

**⚠️ Critical caveat**: These heuristics estimate risk by Unicode version and character range. They do NOT guarantee that every character from a given version is supported. OS vendors cherry-pick which glyphs to include in system fonts based on demand, design priorities, and file size. Always verify the exact character via Emojipedia (for emoji) or device testing (for non-emoji) when certainty matters.

### ✅ Definitely Safe

**Latin-1 Range (U+0000 to U+00FF)**

- Universal support on ALL operating systems
- Includes: `©` (copyright), `®` (registered), `™` (trademark), `½` (fraction), `–` (en dash), `—` (em dash)
- **Verdict**: Always safe ✅

**Unicode 1.1 to 6.0 Symbols (Before 2010)**

- Usually safe on Windows Vista+ (2006)
- All macOS/iOS versions
- Android 1.0+ (2008)
- Examples: `☎` (phone), `⭐` (star), `←→` (arrows), `★☆` (stars), `✓✔` (checkmarks)
- **Verdict**: Usually safe, but still check the exact character if it is presentation-sensitive

### ⚠️ Check Carefully

**Emoji Range (U+1F300+)**

- Must check specific Unicode emoji version
- Emoji 1.0-5.0 (2015-2017): often safe on Windows 8+, but still verify the exact character
- Emoji 6.0-12.0 (2018-2019): mixed on Windows 10, especially across updates
- **Verdict**: Check Unicode version, then verify the exact character and presentation mode ⚠️

### ❌ Often Not Available

**Modern Emoji (Unicode 13.0+, 2020+)**

- High risk on Windows 10
- Often needs Windows 11 or later, but treat this as an estimate unless you checked the exact glyph
- Examples: 🫠 (Melting Face), 🫡 (Saluting Face), 🫶 (Heart Hands)
- **Verdict**: Treat as Windows 10-unsafe unless verified on the exact target build ❌

---

## Windows Font Reference

Windows uses different fonts for different character types:

| Font                | Type  | When Used                          | Styleable?               |
| ------------------- | ----- | ---------------------------------- | ------------------------ |
| **Segoe UI Symbol** | Text  | Symbols, arrows, stars, checkmarks | ✅ Yes (CSS color works) |
| **Segoe UI Emoji**  | Emoji | Modern emoji, colorful icons       | ❌ No (baked-in colors)  |
| All text fonts      | Text  | Latin-1, basic punctuation         | ✅ Yes                   |

**Key insight**: If Windows renders a character with Segoe UI Symbol, CSS `color` will work. If it uses Segoe UI Emoji, CSS color is ignored. This is a rendering hint, not a guarantee for every OS build.

---

## Decision Workflow

```
1. Identify target OSes
   └─ Example: Windows 10+, macOS 12+, iOS 15+, Android 12+

2. Identify bottleneck OS
   └─ Usually: Windows 10 (oldest Windows)

3. Check character support on bottleneck
   ├─ Primary: Check Emojipedia for specific platform data
   ├─ Fallback: Apply heuristic rules below
   │  ├─ Latin-1? → Safe ✅
   │  ├─ Unicode 1.1-6.0? → Safe for Vista+ ✅
   │  ├─ Emoji U+1F300+? → Check Unicode version ⚠️
   │  └─ Unicode 13.0+? → High risk on Windows 10 ❌
   └─ If works on Windows 10 → Usually safe for other modern platforms ✅

4. Provide verdict
   ├─ ✅ Safe: Works on all targets
   ├─ ⚠️ Check: May work, needs testing
   └─ ❌ Not safe: Use SVG or alternative
```

---

## Testing on Target OSes

**Why test OSes, not browsers**: The browser is just a window. When you test "Chrome on Windows 10", you're really checking whether Windows 10's system fonts (Segoe UI Symbol, Segoe UI Emoji) contain the glyph. Chrome, Edge, and Firefox on the same OS will show identical results.

**DevTools Check** (Chrome/Edge on Windows):

1. Right-click the symbol on webpage
2. Inspect → Computed tab
3. Scroll to "Rendered Fonts"
4. Check which font is used:
   - `Segoe UI Symbol` = Text-style, CSS color works ✅
   - `Segoe UI Emoji` = Emoji-style, CSS color ignored ❌

**Visual Check**:

- If character shows as � (missing glyph box) → Not supported
- If character shows correctly → Supported ✅

---

## Summary

**Golden Rule**: Use Windows 10 as your bottleneck OS check. If it works there, it is usually safe for other modern platforms, but still treat emoji-style rendering and iOS behavior as separate checks.

**No shortcut is 100% reliable**: Emojipedia is the best source for emoji. For non-emoji symbols, heuristics give you a risk signal, not a guarantee. When it matters, test on actual OSes (BrowserStack, real devices).

**Fast Checks**:

- Copyright/trademark symbols? → Always safe ✅
- Basic arrows/stars? → Safe (Vista+) ✅
- Older emoji (2012-2017)? → Often safe, but verify the exact character ✅
- New emoji (2020+)? → High risk on Windows 10, verify before use ❌

**When in doubt**: Check Emojipedia for specific platform data, or use SVG for guaranteed compatibility.
