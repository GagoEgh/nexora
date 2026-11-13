# UX/UI Concept — interactive product cards and product pages for `/our_work`

**Project:** Nexora · **Date:** 2026-11-14
**Companion to:** `PRODUCTS_ANALYSIS.md` (the evidence) and `PRODUCTS_IMPLEMENTATION_ROADMAP.md` (the build order)
**Status:** concept only. No application code was modified.

---

## 0. Position

The brief asks to turn a list of cards into a product presentation platform. **Most of that platform already exists** — see `PRODUCTS_ANALYSIS.md` §0. The honest concept is therefore not a redesign but three additions and one correction:

|                 | Ask                                           | Reality                                                      | This concept                                                          |
| --------------- | --------------------------------------------- | ------------------------------------------------------------ | --------------------------------------------------------------------- |
| Card front      | Images, name, one-line description, hierarchy | **Exists** — photograph, archetype tag, name, category, hook | Refine composition; add the second affordance the flip needs          |
| Hover flip      | Smooth flip to a detailed back                | **Removed**, for a documented accessibility reason           | **Rebuild, with the no-hover path as a peer trigger, not a fallback** |
| Product page    | 8 sections                                    | **6 exist** and are prerendered in 3 locales                 | Keep; add 2 only when assets allow                                    |
| Visual showcase | Gallery of screenshots                        | **No screenshots exist**                                     | **Deferred, explicitly** — `PRODUCTS_ANALYSIS.md` §5.1                |

Everything below works inside the existing design system: the `$breakpoints` map (`compact 0 / medium 600 / expanded 840 / large 1200 / extra-large 1600`), the `$durations` map (`fast 160ms / base 220ms / flip 520ms`), the single `out` easing `cubic-bezier(.22,.61,.36,1)`, the `rise 16px` / `lift 2px` distances, `surface.outlined()`, `text.contained()`, `reveal.*`, `IconTile`, and the Material token layer. **No new token, no new primitive, no new dependency.**

---

## 1. Design principle

> **Nothing is reachable only by hovering.**

This is the one rule the previous implementation broke, and it is what this concept is organised around. The flip is an _enhancement_ of a card whose content is already complete and reachable; it is never the only route to anything.

Three consequences, carried through every section below:

1. Every fact on the back face also exists on `/our_work/:slug`, which the card title links to. The flip is a preview, not a container.
2. The face that is turned away is removed from the accessibility tree and the tab order — `visibility: hidden`, not geometry.
3. There is a visible, focusable control that flips the card, present on every device, not only where `hover: none` matches.

---

## 2. The card front

### 2.1 Composition

```
┌──────────────────────────────────────────┐
│ ░░░░░░░░ photograph, 16/10, cover ░░░░░░ │   ← media band
│                                          │
│  ◆ MOBILE APP                      ⟳     │   ← archetype chip (bottom-left)
├──────────────────────────────────────────┤     flip control (bottom-right)
│  Draculai                                │   ← h3 > a → /our_work/draculai
│  Health & substance tracking             │   ← category, muted
│                                          │
│  FDA-backed substance research and       │   ← hook, ≤140ch, one sentence
│  intake tracking, in an app that         │
│  collects no data at all.                │
└──────────────────────────────────────────┘
```

Three changes from today's card, and only three:

| Element                 | Today                                                 | Concept                                                                                                            | Why                                                              |
| ----------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------- |
| Media                   | Photograph, 16/10, `cover`                            | Unchanged                                                                                                          | Already correct; normalises nine source shapes                   |
| Archetype chip          | Icon + label, inverse surface, bottom-left over media | Unchanged                                                                                                          | Carries the second axis that keeps 7 storefronts distinguishable |
| **Flip control**        | —                                                     | **New.** Circular icon button, bottom-right over the media, `aria-expanded`, accessible name "More about Draculai" | The peer trigger §1 requires                                     |
| Title / category / hook | `h3 > a`, muted category, body hook                   | Unchanged                                                                                                          | Already a correct hierarchy                                      |

**On "several high-quality product images" (brief §2.1).** One photograph exists per product. A multi-image front would have to mix it with the two abstract illustrations, which are captioned elsewhere as "an original composition, not a screenshot" — putting them in a product-image carousel would contradict that caption. **The front stays single-image until real screenshots exist** (`PRODUCTS_ANALYSIS.md` §5.1). If they arrive, the media band becomes a 3-dot paged strip with the photograph first; the rest of this concept is unaffected.

### 2.2 Visual hierarchy

Reading order is deliberately: **image → archetype → name → category → hook.** The archetype sits above the name because with seven storefronts in nineteen cards, "what kind of thing is this" disambiguates faster than the brand name does for a visitor who knows none of them.

Type comes from existing tokens only — `--nx-sys-title-card` (name), `--mat-sys-label-large` (category), `--nx-sys-body-copy` (hook), `text.label-caps()` (chip).

### 2.3 Resting state and hover affordance

- `surface.outlined()`, `--mat-sys-corner-large`, `overflow: hidden`.
- Grid-cell lift on hover/focus-within: `reveal.lift()` — `translate` 2px, elevated shadow.
- Photograph `scale: 1.04` under `@media (hover: hover)` only.
- **Fix required:** `products.scss:107` calls `reveal.stagger(6, 60ms, 120ms)` without `$hover: true`, so the entrance delay leaks onto the lift and it starts 120–420 ms late on fourteen of nineteen cards. One argument, three call sites. Roadmap Phase 2.

---

## 3. The flip

### 3.1 Triggers — three, all equal

| Trigger                           | Device   | Behaviour                                                                                   |
| --------------------------------- | -------- | ------------------------------------------------------------------------------------------- |
| `mouseenter` on the card          | Pointer  | Flips to back. `mouseleave` flips back — **unless focus is inside**, in which case it stays |
| **Flip button** (`aria-expanded`) | All      | Toggles. Focus moves to the back face's heading on open, returns to the button on close     |
| `Escape`                          | Keyboard | Returns to front, focus to the button                                                       |

The button is the difference from the removed implementation. Previously it was a "Details" affordance that read as optional, and when it was removed hover became the sole trigger. Here it is specified as **structural**: the flip does not ship without it, and `aria-expanded` is the state, so assistive tech reports the card correctly on every device.

### 3.2 The animation

```scss
.project-card__inner {
  display: grid; // both faces in one cell
  transform-style: preserve-3d;
  transition: transform motion.duration(flip) motion.easing(out);
}
.project-card__face {
  grid-area: 1 / 1;
  backface-visibility: hidden;
}
.project-card__face--back {
  transform: rotateY(180deg);
}
:host(.is-flipped) .project-card__inner {
  transform: rotateY(180deg);
}
```

- **520 ms**, the existing `flip` token — long enough to read as a deliberate turn, which is what its comment in `_motion.scss:5-8` already says.
- `perspective: 1400px` on the **grid cell**, not the card, so the turn has depth without the neighbours sharing a vanishing point.
- Both faces in one grid cell, so **the card sizes to its taller face** — load-bearing for `hy` and `ru`, whose copy runs longer, and already proven by the existing per-locale row-height e2e assertions.
- `prefers-reduced-motion: reduce` → `--nx-motion-duration-flip: 0ms` (already wired in `_motion.scss:55`). The faces still swap; they simply do not rotate. **Reduced motion must not disable the flip, only the turn.**

### 3.3 Hiding the turned-away face — non-negotiable

```scss
.project-card__face {
  visibility: hidden;
  transition: visibility 0s linear motion.duration(flip);
}
.project-card__face--front {
  visibility: visible;
}
:host(.is-flipped) .project-card__face--front {
  visibility: hidden;
}
:host(.is-flipped) .project-card__face--back {
  visibility: visible;
  transition-delay: 0s;
}
```

`backface-visibility` hides a face _visually_; it leaves it focusable and in the accessibility tree. Only `visibility`, `display`, `content-visibility` or `inert` remove it. The earlier implementation got this right on pointer devices and wrong on touch, which left **~55 focusable controls across nineteen cards** reachable while off screen. The delayed `visibility` transition keeps the face paintable through the turn and removes it the instant the turn ends.

`inert` bound to the flipped state is **not** the mechanism: it cannot distinguish the rotating pointer layout from the non-rotating touch layout, which is why the original code rejected it — correctly.

### 3.4 Back face content

Entirely from existing copy. Nothing new is written.

```
┌──────────────────────────────────────────┐
│  Draculai                           ✕    │  ← h4 (focus target) + close
│  ────────────────────────────────────    │
│  An iOS app for researching and logging  │  ← summary (≤170ch)
│  prescriptions, supplements and other    │
│  substances, built over FDA drug data.   │
│                                          │
│  1  FDA drug data lookup                 │  ← 4 highlights, numbered
│  2  Intake log with timestamps           │
│  3  Collapsible dosage and warnings      │
│  4  Declares no data collected           │
│                                          │
│  ◆ Seven releases Apr–Aug 2025           │  ← advantage, accented
│                                          │
│  [ View project → ]   [ Visit site ↗ ]   │  ← route + outbound (if any)
└──────────────────────────────────────────┘
```

| Slot                    | Source field                                       | Notes                                                                                                                                                 |
| ----------------------- | -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Heading                 | `name`                                             | `tabindex="-1"`, receives focus on open                                                                                                               |
| Detailed description    | `summary`                                          | Budget-enforced ≤170 chars                                                                                                                            |
| Functional capabilities | `highlights` (exactly 4)                           | Numbered, matching the detail page's treatment                                                                                                        |
| Main advantage          | `advantage`                                        | ≤130 chars, accent-toned                                                                                                                              |
| Technical solutions     | **`platform` only, where recorded**                | A single chip: `Shopify`, `Webflow`, `iOS · App Store`… **Four products have none** — the chip is omitted, not faked. See `PRODUCTS_ANALYSIS.md` §5.2 |
| Actions                 | route link; outbound link **only if `url` exists** | Two products have no honest destination (`roar-organic`, `connected-car`) and must render with one button                                             |

The outbound link's "(opens in a new tab)" notice must be **part of the accessible name**, not a visually-hidden span beside an `aria-label` — an `aria-label` discards element contents, which is exactly how the previous implementation lost it. `product-detail.html:18-24` already does this correctly and is the pattern to copy.

### 3.5 Click target

The card title links to `/our_work/:slug`. The flip button sits over the media. **The two must not overlap**, and the whole card must not be a click target — a card-wide link containing a button is an invalid nesting and makes the flip unreachable by click. Brief §2.3 asks that clicking a card navigates: the title link and the "View project" button both do that, and the media area is deliberately inert.

---

## 4. The product page

`/our_work/:slug` already exists: 19 slugs × 3 locales, 87 prerendered routes, lazy-loaded, with canonical, hreflang, `x-default` and a JSON-LD `@graph`.

| #   | Brief's section           | Status      | Concept                                                                                                                                                          |
| --- | ------------------------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Hero                      | **Exists**  | Breadcrumb · archetype eyebrow · `h1` name · `hook` lead · `category` · contact CTA · "Visit site" (if `url`) · `platform` (if recorded) · hero figure + caption |
| 2   | About                     | **Exists**  | `about`, 600–900 chars of prose. Strongest copy in the project                                                                                                   |
| 3   | Key Features              | **Exists**  | 4 numbered `highlights`                                                                                                                                          |
| 4   | Product Experience        | **Exists**  | `experienceImage` + `summary`, side by side                                                                                                                      |
| 5   | Technology & Architecture | **Missing** | **Do not build.** Only `platform` is verified, and four products lack it. Keep it as the hero chip until real facts exist — `PRODUCTS_ANALYSIS.md` §5.2          |
| 6   | Business Value            | **Exists**  | `advantage` + `value` in a two-card grid                                                                                                                         |
| 7   | Visual Showcase           | **Missing** | **Do not build.** Three images per product, two abstract. Blocked on §5.1                                                                                        |
| 8   | Call to Action            | **Exists**  | "Next project" link + `app-start-conversation`                                                                                                                   |

### 4.1 What to add instead

Rather than two sections that cannot be filled, three refinements that use what exists:

- **Hero image treatment per archetype.** `app` products get a device-framed crop; `storefront` and `trade` get full-bleed; `corporate` and `lead-generation` get an offset composition. This is the brief's "varied visual compositions" (§3), delivered through layout rather than through images that do not exist. One `[attr.data-archetype]` hook, six SCSS blocks.
- **A facts strip under the hero.** `platform`, archetype, and the single most checkable number in the copy where one exists — _"4.8/5 from 12,000+ verified reviews"_ (Hydrant), _"4.88 average"_ (LAV), _"nine Auckland stores"_ (Tai Ping), _"five showrooms"_ (Robert Irwin), _"five cities, two languages"_ (Mertel). These already sit inside `advantage`/`about` prose and are the portfolio's most persuasive assets. **Extracting them into a typed, optional `facts` field is the single highest-value copy change available** — and it is extraction, not invention.
- **Mezave given its own treatment.** It is the one non-commercial product, and its "the measure is whether a household eats" framing is the strongest trust signal on the site. It should not render identically to a Shopify storefront.

### 4.2 Typography and rhythm

Existing tokens throughout: `--nx-sys-title-card`, `--nx-sys-body-copy`, `--mat-sys-label-large`, `text.contained()` for measure control. Section rhythm from `spacing.space()`; entrance from `appReveal` with `reveal.stagger`. **No new type scale.**

---

## 5. Responsive behaviour

Mapped onto the project's own breakpoints, not invented ones.

| Brief's range | Nexora class               | Grid                                    | Card behaviour                                                                                                                                                           |
| ------------- | -------------------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 320–430 px    | `compact` (0)              | **1 column**, 20px margin, 16px gutter  | **No flip.** Back content is an in-place expansion below the front, animated `grid-template-rows: 0fr → 1fr`. Button is a full-width "More about X" with `aria-expanded` |
| 440–600 px    | `compact` → `medium` (600) | 1 column, margin → 32px                 | As above                                                                                                                                                                 |
| 768–1024 px   | `expanded` (840)           | **2 columns**, 40px margin, 24px gutter | Hybrid: flip on `hover: hover`, expansion on `hover: none`. Tablets vary, so the **media feature decides, not the width**                                                |
| 1280–1440 px  | `large` (1200)             | **3 columns**, 80px margin, 32px gutter | Full flip. Measured today: 3 × 411 × 454 px at 1440 px                                                                                                                   |
| 1600–1920 px  | `extra-large` (1600)       | 3 columns, container 1280px → widens    | Full flip, larger media                                                                                                                                                  |

**The critical rule:** the interaction model is selected by `@media (hover: hover)` / `(hover: none)`, **never by viewport width**. A phone-sized desktop window still has a pointer; a 1024 px tablet does not. The previous implementation got this right and was never tested on a device where `hover: none` actually matched — which is how the tab-order defect survived. The roadmap makes a genuinely `isMobile` Playwright project a precondition, not a follow-up.

**No-hover model, in detail.** The back content expands in place beneath the front rather than replacing it, because a 3D turn on a touch device with no hover reads as a glitch. Same content, same source fields, same `aria-expanded` button — only the transition differs. The collapsed panel carries `visibility: hidden` for the same reason as §3.3: `overflow: hidden` alone leaves it focusable.

---

## 6. Animation inventory

| Interaction                     | Duration               | Easing | Token                              |
| ------------------------------- | ---------------------- | ------ | ---------------------------------- |
| Card entrance (stagger)         | 120 ms + 60 ms/card    | `out`  | `reveal.item` / `reveal.stagger`   |
| Hover lift                      | `base` 220 ms          | `out`  | `reveal.lift`                      |
| Photograph zoom                 | `base` 220 ms          | `out`  | `scale: 1.04`, `hover: hover` only |
| **Card flip**                   | **`flip` 520 ms**      | `out`  | `rotateY(180deg)`                  |
| **Back-face reveal (no hover)** | `flip` 520 ms          | `out`  | `grid-template-rows: 0fr → 1fr`    |
| Face visibility swap            | 0 s, delayed by `flip` | linear | `visibility`                       |
| Page section entrance           | `base`                 | `out`  | `appReveal`                        |

All five motion durations collapse to `0ms` under `prefers-reduced-motion: reduce` via the existing token layer. **Reduced motion changes the transition, never the availability of content.**

---

## 7. Accessibility contract

Stated as a contract because the previous implementation failed four of these.

| #   | Requirement                                                                               | Standard                                          |
| --- | ----------------------------------------------------------------------------------------- | ------------------------------------------------- |
| A1  | No content reachable only by hover                                                        | WCAG 2.1.1 Keyboard                               |
| A2  | Turned-away face not focusable and not in the a11y tree                                   | WCAG 2.4.3 Focus Order, 1.3.2 Meaningful Sequence |
| A3  | Flip state exposed via `aria-expanded` on the trigger                                     | WAI-ARIA disclosure                               |
| A4  | Focus moves to the back heading on open and returns to the trigger on close               | WCAG 2.4.3                                        |
| A5  | `Escape` returns to the front                                                             | WAI-ARIA                                          |
| A6  | Each of 19 similar links has a distinguishing accessible name containing its visible text | WCAG 2.5.3 Label in Name                          |
| A7  | "Opens in a new tab" is part of the accessible name, not a span beside an `aria-label`    | WCAG 3.2.5                                        |
| A8  | Card photograph is `alt=""` — the name is in the adjacent heading                         | H67                                               |
| A9  | The portfolio `<section>` has an accessible name                                          | WCAG 1.3.1                                        |
| A10 | Reduced motion removes the turn, not the content                                          | WCAG 2.3.3                                        |

A9 is open today (`products.html` has no `aria-labelledby`); A6, A8 hold; A1–A5, A7 apply to the flip being reintroduced.

---

## 8. What this concept deliberately does not propose

- **A screenshot gallery.** No screenshots exist, and three images of which two are abstract is not a showcase.
- **A Technology & Architecture section.** One verified field across nineteen products, missing on four of them.
- **A card-wide click target.** It nests a button inside a link and makes the flip unreachable by click.
- **`inert` on the turned-away face.** It cannot distinguish the two layouts; the original code rejected it for the right reason.
- **New tokens, primitives or dependencies.** Everything above is reachable from `$durations`, `$breakpoints`, `$grid`, `surface`, `text`, `reveal`, `IconTile` and the Material token layer as they stand.
- **A redesign of the product page.** Six of eight sections exist and are prerendered in three locales. Replacing working, indexed pages to satisfy a section list would be the most expensive and least valuable thing in this document.
