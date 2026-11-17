---
name: fullscreen-talking-head-edit
description: Edit a talking-head video (VSL, reel, explainer) in code with the speaker full screen and untouched, and motion graphics above his head, below his chin and in a few full-screen cutaways. Navy "blue" look, show-not-tell visuals, real elements (real cash, real logos, real app UI), Apple-style flat icons. Built with Remotion + ffmpeg. Use when asked to edit a talking-head or VSL video with graphics, to make it look like the "blue" edit, or to add b-roll/graphics without a split screen.
---

# Full-screen talking-head edit (the "blue" look)

The speaker stays full screen and untouched. Graphics live in the free space around him and in a few full-screen cutaways. No split screen and no box around him. Every graphic shows what he is saying at that moment.

These rules come from real review rounds, where a client watched each cut and wrote frame-level notes. Each rule below fixed a note.

## 1. Before you edit

1. **Transcribe with word timings.** faster-whisper (large-v3-turbo) with word timestamps. Fix the words by hand. Keep a `[word, start_seconds]` list; captions and every graphic cue hang off it.
2. **Find his own hard cuts.** Compare frames (ffmpeg, scaled to 54x96 grey, mean absolute difference) and list every jump above the noise. Transitions must cover these cuts (section 4).
3. **Find the free space.** Grab a few frames. Mark where his head is, the safe area above it, and the area below his chin. Graphics never cover his face or eyes.
4. **Write a beat sheet:** `time | words | what we see`. One graphic per beat, literal to the words. "Clients judge you" gets a client's confused reply in a chat. A vague glow does not count.
5. **Long videos (VSL):** edit in sections of 1 to 2 minutes, each its own composition file with the same style kit. A whole long video in one pass comes out worse. Render each section, review it, then join.

## 2. Layout (1080x1920; scale the zones for 16:9)

- **Headline zone:** the band above his head (y 40 to 310). Serif headline, word by word, one accent word in italic and a lighter accent colour.
- **Graphic zone:** below his chin (y 1040 to 1500). Cut-out objects with no box around the group.
- **Captions:** a line under the graphic zone (y about 1560). Active word gets a filled colour chip that moves word to word. No pop or bounce on captions.
- **Behind the head:** big section numbers (1, 2, 3) can sit behind him through a person matte (RobustVideoMatting). Composite: footage, back layer, him again through the matte, front layer.
- **Stickers or mascots:** in the graphic zone at the side, never beside his face. Only on big beats, a few per video.
- **Scrims:** a soft navy gradient at the top and bottom so white type reads on a light wall. Keep the top one light (about 0.6 to 0.35 alpha). A heavy scrim looks muddy.

## 3. Show, don't tell

- **Real elements beat drawn ones.** Use a real banknote photo (public-domain scans work), real brand logos as vector, the real YouTube thumbnail, title and channel picture, a real screenshot or capture of the actual website. Drawn placeholders read as cheap.
- **Copy real app UI so it passes for a screen recording.** YouTube feed card (dark #0F0F0F, Roboto, 12 px radius thumbnail, duration badge, avatar, two-line title, grey channel line). WhatsApp chat (dark: #0B141A background, #005C4B outgoing, #202C33 incoming, blue double ticks when read, "typing…" under the name, a link preview card). Instagram post (header with Follow button #0095F6 that becomes "Following", double-tap heart, red liked heart, "1,205 likes", a comment typed into "Add a comment…", Post). Act the story out in the UI: send, read, typing, reply.
- **Highlight with a red box that draws itself** around the part of a screenshot he talks about, such as a results section or a video.
- **Literal beats:** "nobody pays big" means real notes fan out, then drop away. "Hire" means a button that gets struck through and greys out. "Not some BS" means a crossed-out poop. "Pro" means a gold verified seal. "You go to them" means a paper plane flying from You to three client profiles that light up.
- **No emoji as icons.** Use vector icons (Lucide paths, MIT) inside icon tiles.
- **No random decoration** (stars, arrows, squiggles popping around him). They pull the eye off the speaker. One focal graphic per moment.
- Never show real client faces or private data unless the client says so. Blur names, emails and amounts in captures.

## 4. Motion

- **Enter:** rise from below at an angle (rotateX about 28 degrees to 0), scale 0.72 to 1, fade and blur in, on a spring (damping 10, stiffness 190, mass 0.7). Settle flat. Float 5 px slowly while held.
- **Exit:** slide aside, scale down a little, blur out over 0.22 s.
- **Cutaways (full-screen pages):** a circular iris (clip-path circle from 0 to 125% over 0.22 s, ease-out cubic). The page must **fully cover the frame before his own hard cut**, so start the iris about 0.25 s before it. Hold the page until his next cut, then slide it down and blur it out. A light band sweeping across the page as it lands adds polish.
- **Anything that spans a cut you made in the footage** (a removed sentence) must run on the output clock, or it will jump at the cut. Map output time to source time with one function, and give graphics that cross the cut their timing in output seconds.
- **Cursor moves:** one eased curve (ease-in-out cubic on a quadratic Bézier), a press with a ring on the click, then a slow sway (a few px of sine) while it waits.
- **Nothing pops in without a transition,** and nothing changes layout when it appears (reserve space for a label that fades in later).
- **Round-cap strokes drawn with a dash offset show a dot at zero length.** Hide the path until it starts drawing.
- 60 fps graphics.

## 5. Look

- **Palette:** navy (#090A13 to #2E3478 radial for pages), accent blue #4A5BFF, light accent #A3AFFF for italic words, white type.
- **Fonts:** Fraunces 900 for headlines, numbers and English accent words; a clean sans for UI labels; Roboto inside copies of Android or YouTube UI.
- **Icons Apple style, not 3D.** A squircle (radius 22.5% of the size), a gentle top-to-bottom gradient, a hairline top highlight, a white glyph at stroke 2.2, and a soft shadow in the icon's own colour. No glossy blobs, no heavy bevels.
- **Glow only where the object has one, in its own colour:** green shadow under green ticks, red glow on a red-orange fire, gold under a gold seal. Never one blue glow on everything. Keep glows small enough that ticks and text stay sharp.
- **Cards:** dark frosted panels with a 1 px top highlight and a soft drop shadow.
- See `reference/kit.tsx` for the icon tile, flat disc, glass card, default avatar and the colour helper.

## 6. Sound

- Do not touch the speaker's audio: no normalising, no limiter, no gain. Cuts get 6 ms fades only.
- SFX from a real library: soft swooshes on entries, a click when an icon lands or a UI button is tapped, typing under typed text, an impact on section numbers. Keep it sparse, and none while a website or screen capture is on screen.
- **Render audio separately.** Running amix in the same ffmpeg command as a heavy overlay graph dropped chunks of voice. Render picture with `-an`, mix the audio alone, mux with `-c:v copy`, and check that video and audio durations match.

## 7. Render pipeline (Remotion + ffmpeg)

1. Render the graphics as transparent PNG sequences: a front layer, and a back layer if you use the matte. Render only the frame windows that have back-layer content, and fill the rest with one blank PNG.
2. Convert every PNG to RGBA before compositing. Remotion saves fully opaque frames (the cutaways) as RGB, and ffmpeg's image sequence stops where RGB switches to RGBA.
3. Composite in ffmpeg over the untouched footage (NVENC or x264 at high quality), at the footage's own pixels.
4. If the source ends on a black frame, drop it and hold the frame before.
5. Re-render only the seconds you changed (`--frames=A-B`), not the whole video.
6. Make a 720 px phone copy for review.

## 8. Quality bar before the reviewer sees it

- Render stills at each beat and look at them in a contact sheet. Check face clear, text readable, one focal graphic, the UI looks real.
- For motion notes (smooth, jittery), extract a 10 fps strip of the moment and check that it moves on a curve.
- Score the cut 1 to 10 on readability, polish, hierarchy, consistency, motion, literal meaning, face safety and "looks premium". Fix the three worst things until it reaches 8.
- Deliver through the Review Desk (separate zip) and read the frame notes from its JSON.
