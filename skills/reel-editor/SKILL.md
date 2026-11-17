---
name: reel-editor
description: Edit vertical talking-head reels (Instagram/TikTok/Shorts) in Rashid Abid's ARStudioss style with Remotion — word-by-word captions, person cut-out depth, concept motion graphics, 60fps. Use whenever the user wants a reel, short, or talking-head video edited, captioned, or given motion graphics.
---

# Reel Editor (Rashid / ARStudioss style)

Talking-head reel in → premium, After-Effects-feeling edit out. Remotion (React) + ffmpeg + whisper-cpp + Apple Vision.

## Non-negotiables

1. **Voice only.** No music and no sound effects unless he asks for them. Never ask him for audio; the clip already has it.
2. **No text above the head.** Hook/title text sits at chest (nipple) height. Captions sit halfway between chest and navel, never at the hips. Keep everything inside a 10% title-safe margin, and keep scenes centred, not top-heavy.
3. **Two fonts max.** Helvetica Neue (bold, lowercase) plus Snell Roundhand for a few curvy words. Never Playfair, Bodoni or Inter-style "Claude fonts".
4. **Smooth, slow, meaningful motion.** No fast punch-ins and no jerks.
   - Camera zooms are slow ease-in-out pushes between 1.06 and 1.2.
   - Render at **60fps**.
   - Camera-follow motion is averaged over about ±0.45s.
   - Landed elements keep a gentle idle float (two detuned sines).
   - Full-screen scenes **fade in** (≤40px lift), never slide up from the bottom.
   - No CameraMotionBlur; it gives a weird texture.
5. **Concept animations, not cards.** Don't fill the reel with small UI/text cards. Give it 3–4 real animations per ~45s that *visually act out what he's saying*, plus a few on-screen effects on the speaker shots. They should feel like After Effects work, not website CSS.
6. **Depth.** Cut him out (Apple Vision) so graphics pass behind him: rings and orbits split into a back half and a front half. Anything in the foreground (mic, monitor) gets its own static matte layered *above* the back FX.
7. **Colour with meaning.**
   - Negative statements get a red treatment: background-only red tint plus a big red X behind the head, with red-bracketed key words.
   - Black and white only when it means something.
   - Avoid all-one-colour scenes. Mix dark brand scenes with white/paper scenes.
8. **Use real assets.**
   - When he talks about his work, show *his* content: his Instagram grid, his portfolio, his b-roll. Don't use client footage for that.
   - When he mentions a post, comments or "this video", use a real Instagram UI: a Reels frame with his handle and like/comment/share icons, or a real dark comments sheet with the emoji row and blue send button.
   - Never invent stats or usernames. Hide like counts instead.
9. **Show the design before the full render.** For any new or redesigned section, render a short preview (`--frames=a-b`) or stills first. Full render only after he approves.

## Brand

- **Speaker:** Rashid (rsd_abid). Use the ARStudioss palette: near-black green `#00120A`, mint `#9AFFD4`, glow `#2EE59D`, plus paper `#F5F3EE` and ink `#111412`.
- **Client reels** follow the client's palette. Michael Fadaous, for example: navy `#102A43`, blue `#086B8F` and orange for the CTA.

## Captions (his reference reel style)

- Lowercase words build up one at a time into a small stacked block of 1–3 lines.
- Each word eases in (scale 0.72→1, blur 8→0, lift 14px).
- Key words go in coloured brackets `[ 12 videos ]`: mint for positive, red for negative. Use the curvy font sparingly.
- On dark backgrounds, white text with a soft dark bloom. On light/paper backgrounds, ink text with no bloom.
- During the CTA, the CTA UI replaces the captions.

## Workflow

1. **Ingest.** Copy the clip into `public/<id>/` and probe it with ffprobe.
2. **Transcribe.** Run `whisper-cli -m ~/whisper-models/ggml-small.bin -l en -ml 1 -sow -ojf` (always force `-l en`). Convert the result to `words.json` with `{w,s,e}`. Fix misheard words from the script if there is one.
3. **Person cut-out.** Run `swift scripts/segment.swift clip.mp4 outdir`, then build the alpha video:
   ```bash
   ffmpeg -i clip.mp4 -framerate <fps> -i outdir/m%05d.png -filter_complex "[1:v]scale=1080:1920,format=gray,tmix=frames=3:weights='1 2 1',curves=all='0/0 0.35/0.1 0.65/0.9 1/1',gblur=sigma=1.2[m];[0:v][m]alphamerge,format=yuva444p10le" -c:v prores_ks -profile:v 4444 -an person.mov
   ```
   Use it in Remotion as `<OffthreadVideo transparent>`.
4. **Prop matte.** The camera is static, so build a still matte for the mic and monitor. Use ffmpeg `geq` with a luminance threshold inside bounding boxes, fill holes with a solid rect, then `dilation`/`erosion` and `gblur`. Layer it over the back FX.
5. **Layer order inside the camera:** plate → back FX (red tint, X, orbits, back arcs) → prop matte → person.mov → front FX. Screen space above that: full-screen stages, then captions/CTA. A "meta" moment (the reel shrinking into a phone) wraps all of it.
6. **Design scenes from the script beats.** Pick 3–4 full-screen animations and some on-screen effects. Proven ideas:
   - A clock of his real reels around his head on "12 videos in 4 hours".
   - An ink snake line through the years on a paper background, with faint square b-roll boxes. The same line then turns green and traces a portfolio grid of rounded cards, 4×2, that pop in.
   - A white-background "skill" cube built from editing glyphs, fed with his reference frames, with a v1→v4 revision ring passing behind it.
   - The reel shrinking into an Instagram Reels phone frame on "this video you're watching".
   - An RGB glitch on "doesn't work".
   - A `</>` symbol framing his head, struck through, on "not a developer".
   - A filmstrip of his thumbnails orbiting at chest height.
7. **QA.** Render stills at key times (`npx remotion still … --scale=0.4`) and tile them. After the full render, make a 1-fps contact sheet and check that the audio level matches the source. Look for:
   - text over his face
   - lines crossing thumbnails
   - empty first frames
   - elements fading out before the next scene covers them (they should stay)
8. **Deliver.** Use h264 at crf 17, 60fps, saved to `reels/exports/`. Copy to `~/Desktop/AI video edits/Final exports/` with a version suffix, and never overwrite an earlier version.

## Remotion conventions

- One folder per clip under `src/videos/<id>`, with its own `theme.ts` (fonts, palette, `prog`/`mix`/`float`/`W(i)` helpers), `Captions.tsx`, `Stage.tsx` (dark, light or paper variants) and scene files. Register a `<Composition fps={60}>` in `Root.tsx`.
- Drive everything from **absolute time in seconds** tied to word timings (`W(i)`), not frame counts. Sequences are only for media that must start at 0.
- Easing: out is `bezier(0.16,1,0.3,1)`, in-out is `bezier(0.65,0,0.35,1)`, and pops use a soft overshoot `bezier(0.34,1.35,0.64,1)`.
- Use `@remotion/paths` for line draws, arrowheads riding a path, and arc splitting for behind/in-front rings.
- Pin all `@remotion/*` packages to the same exact version, at least two weeks old. With npm 11+, run `npm install-scripts approve esbuild`.

## Gotchas

- Instagram assets: profile grid `img.currentSrc` URLs and the pfp work with `curl`. The reel `og:image` has a play button baked in. CSP blocks `fetch` to localhost, so to get clean frames, draw the video to a canvas, show it as a full-page overlay `<img>`, screenshot it, and crop.
- macOS screenshot filenames contain a narrow no-break space before "PM", so match them with globs.
- `opacity < 1` flattens `preserve-3d`, and CSS `filter` on a parent breaks 3D too. Keep both on leaf elements.
- A 43s reel at 60fps takes about 13 minutes to render. Run it in the background and give him time estimates when asked.
- Keep replies short. He's direct and gives feedback in batches, so fix everything in one pass.
