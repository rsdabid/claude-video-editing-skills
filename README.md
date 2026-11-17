# Claude Video Editing Skills

Claude Code skills, tools and recipes for real video editing work: reels, talking-head VSLs, beat-synced edits, sound design and client review.

This is the toolkit we use in production at [ARStudioss](https://www.arstudioss.com), a video editing agency. Every rule in these skills came from a real client review round.

Most AI video tools are closed, one-click apps. This repo goes the other way. It teaches Claude Code to work like an editor: watch the footage frame by frame, cut on the beat, build motion graphics in code, measure the audio, and hand back cuts you can review and change. You stay the director.

## What's inside

### Skills (`skills/`)

Drop a skill folder into `~/.claude/skills/` (or a project's `.claude/skills/`) and restart Claude Code.

| Skill | What it does |
|---|---|
| [`reel-editor`](skills/reel-editor/SKILL.md) | Edits vertical talking-head reels (Instagram, TikTok, Shorts) with Remotion: word-by-word captions, person cut-out so graphics pass behind the speaker (Apple Vision), concept motion graphics, 60fps. |
| [`fullscreen-talking-head-edit`](skills/fullscreen-talking-head-edit/SKILL.md) | Edits talking-head VSLs and explainers with the speaker full screen and untouched, and graphics in the free space around them plus a few full-screen cutaways. Includes a drop-in Remotion kit (`reference/kit.tsx`). |

### Tools (`tools/`)

| Tool | What it does |
|---|---|
| [`review-desk`](tools/review-desk/README.md) | A Frame.io-style review page that runs locally. The reviewer pins notes to exact frames (text, time ranges, drawings, voice notes), and Claude reads them as JSON, fixes the cut and renders the next version. Node 18+, no dependencies. |

### Recipes (`recipes/`)

Python + ffmpeg scripts from real projects. Each is a working example to adapt, not a library: paths and cue lists at the top of each file point at that project's folders.

| Recipe | What it does |
|---|---|
| [`beat_synced_cut.py`](recipes/beat_synced_cut.py) | Lays shots on a song's fitted beat grid. Each shot is a fixed source window slowed (never sped up) to fill its beats, with motion-interpolated slow-mo and a warm cinematic grade. |
| [`layered_sfx_mix.py`](recipes/layered_sfx_mix.py) | Places sound effects from a cue table, aligned to each sound's loudest point (or first transient for key presses), with panning and a shared room reverb. |
| [`premiere_xml_export.py`](recipes/premiere_xml_export.py) | Exports that SFX pass as an FCP7 XML sequence Premiere Pro imports: one clip per cue on non-overlapping tracks, with editable level and pan. |
| [`example_cues.txt`](recipes/example_cues.txt) | Example cue table for the two scripts above. |

## Requirements

- [Claude Code](https://claude.com/claude-code)
- ffmpeg
- Node 18+ (Remotion skills and Review Desk)
- Python 3 with `librosa`, `numpy`, `soundfile` (recipes)
- whisper.cpp for transcription and word timings (optional, used by the reel skill and Review Desk voice notes)
- macOS for the Apple Vision person cut-out in `reel-editor`

## Works well with

- [openverse-sfx](https://github.com/varnan-tech/opendirectory) for free, licence-filtered sound effects and music
- [vibe-motion/sound](https://github.com/vibe-motion/sound) for ranked Freesound sound effects
- [Remotion's official skills](https://github.com/remotion-dev/skills)

## How we work with these

1. Organize the project folder first (raw footage, references, finals).
2. Always give Claude a reference video, or describe the look exactly.
3. Approve 10 seconds before 15, and 15 before the full video.
4. Review every cut frame by frame in Review Desk. "Good enough" is not done.

## License

MIT. See [LICENSE](LICENSE).
