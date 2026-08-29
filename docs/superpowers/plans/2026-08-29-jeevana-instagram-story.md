# Jeevana Instagram Story Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produce one polished 1080 × 1920 PNG background for the approved Jeevana Instagram Story, with reserved space for Instagram-native link and mention overlays.

**Architecture:** Express the approved brand treatment as deterministic HTML/CSS at the exact Story viewport, then render it to PNG with headless Chrome. Keep the editable visual philosophy beside the PNG, use a temporary render source that is removed after export, and verify both pixel dimensions and visual safe areas before delivery.

**Tech Stack:** HTML/CSS, bundled canvas fonts, headless Google Chrome, macOS `sips`, Codex image inspection.

---

## File Structure

- Create `artifacts/jeevana-story-visual-philosophy.md`: the reusable aesthetic principles governing the artwork.
- Create temporarily `artifacts/.jeevana-instagram-story-render.html`: exact 1080 × 1920 render source; remove after the PNG passes verification.
- Create `artifacts/jeevana-instagram-story.png`: finished Instagram Story artwork.

### Task 1: Record the visual philosophy

**Files:**
- Create: `artifacts/jeevana-story-visual-philosophy.md`

- [ ] **Step 1: Write the visual philosophy**

Create a four-to-six paragraph movement named `Civic Cartography`. Define warm paper material, restrained green and marigold, editorial serif scale, administrative diagram marks, generous negative space, and master-level alignment. State that the visual reference is a humane path through fragmented public systems and that text remains sparse and structural.

- [ ] **Step 2: Check the philosophy constraints**

Run:

```bash
test -s artifacts/jeevana-story-visual-philosophy.md
for term in "Civic Cartography" paper green marigold "negative space" craft; do
  rg -q "$term" artifacts/jeevana-story-visual-philosophy.md || exit 1
done
```

Expected: the file is non-empty and each required principle is present.

- [ ] **Step 3: Commit the philosophy**

```bash
git add artifacts/jeevana-story-visual-philosophy.md
git commit -m "docs: define Jeevana story visual philosophy"
```

### Task 2: Build and render the Story artwork

**Files:**
- Create temporarily: `artifacts/.jeevana-instagram-story-render.html`
- Create: `artifacts/jeevana-instagram-story.png`

- [ ] **Step 1: Create the exact-size render source**

Write a standalone HTML document with a fixed `1080px × 1920px` canvas and no margins or overflow. Embed the local fonts with `@font-face`:

- Display: `/Users/sampathm/.agents/skills/canvas-design/canvas-fonts/InstrumentSerif-Regular.ttf`
- Sans: `/Users/sampathm/.agents/skills/canvas-design/canvas-fonts/InstrumentSans-Regular.ttf`
- Mono: `/Users/sampathm/.agents/skills/canvas-design/canvas-fonts/IBMPlexMono-Bold.ttf`

The artwork contains only these text elements:

```text
BUILT FOR BUILD WHAT MOVES INDIA
Jeevana
What if government services
followed life events—
not departments?
I built Jeevana to turn scattered portals into one guided path
through life’s biggest administrative moments.
BUILT FOR INDIA · PILOTED IN ANDHRA PRADESH
```

Use `#f4eddf` paper, `#0d5847` green, `#d79b00` marigold, and `#111310` ink. Add subtle paper grain, registration-style corner marks, one gold underline, and a dotted route with unlabelled circular nodes. Keep all essential baked artwork between y=250 and y=1350, reserving y=1350–1670 for the Link sticker and native acknowledgement. Do not bake the URL, a fake sticker, or either Instagram handle into the PNG.

- [ ] **Step 2: Validate the render source before export**

Run:

```bash
rg -n "1080px|1920px|BUILT FOR BUILD WHAT MOVES INDIA|What if government services|PILOTED IN ANDHRA PRADESH" artifacts/.jeevana-instagram-story-render.html
! rg -n "jeevana-brown|@thevarunmayya|@openai|Explore Jeevana" artifacts/.jeevana-instagram-story-render.html
```

Expected: the dimensions and approved baked copy are present; the URL, native mentions, and sticker label are absent.

- [ ] **Step 3: Render the PNG**

Run:

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless=new \
  --disable-gpu \
  --no-first-run \
  --hide-scrollbars \
  --window-size=1080,1920 \
  --force-device-scale-factor=1 \
  --screenshot=artifacts/jeevana-instagram-story.png \
  "file:///Users/sampathm/Documents/ChatGPT/Jeevana/artifacts/.jeevana-instagram-story-render.html"
```

Expected: Chrome reports a successful screenshot and creates `artifacts/jeevana-instagram-story.png`.

### Task 3: Verify and refine the final asset

**Files:**
- Modify if needed: `artifacts/.jeevana-instagram-story-render.html`
- Verify: `artifacts/jeevana-instagram-story.png`
- Remove after verification: `artifacts/.jeevana-instagram-story-render.html`

- [ ] **Step 1: Verify exact pixel dimensions**

Run:

```bash
sips -g pixelWidth -g pixelHeight artifacts/jeevana-instagram-story.png
```

Expected: `pixelWidth: 1080` and `pixelHeight: 1920`.

- [ ] **Step 2: Inspect the image at original resolution**

Open `artifacts/jeevana-instagram-story.png` with original-detail image inspection. Confirm:

- no text clips or overlaps;
- the hook is legible at phone size;
- content reads in the approved order;
- the region below y=1350 remains visually quiet for Instagram-native overlays;
- no URL, fake Link sticker, or baked handles appear;
- the texture and diagram marks remain subtle.

- [ ] **Step 3: Perform the craftsmanship pass**

If any issue is visible, adjust only spacing, scale, alignment, or contrast in the render source and repeat Tasks 2.2 through 3.2. Avoid adding decorative elements. Stop only after the restrained composition feels balanced and pristine.

- [ ] **Step 4: Remove the temporary render source**

Use `apply_patch` to delete `artifacts/.jeevana-instagram-story-render.html`. Confirm that the deliverables are only the philosophy Markdown and final PNG.

- [ ] **Step 5: Commit the final asset**

```bash
git add artifacts/jeevana-instagram-story.png
git commit -m "feat: add Jeevana Instagram story artwork"
```

- [ ] **Step 6: Provide native Instagram overlay instructions**

Tell the user to add the Link sticker labeled `Explore Jeevana ↗` with destination `https://jeevana-brown.vercel.app/`, followed by native Instagram text:

```text
Thank you @thevarunmayya for the opportunity — and @openai for helping me bring it to life.
```

Place the Link sticker above the acknowledgement. Keep both overlays inside the reserved y=1350–1670 region and above Instagram’s lower control area.
