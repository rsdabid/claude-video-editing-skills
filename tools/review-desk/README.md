# Review Desk: setup and workflow (for Claude Code)

Review Desk is a small Frame.io-style review page that runs on this computer. The editor (you, Claude) renders a cut. The reviewer watches it and pins notes to exact frames: text, a time range, or a drawing on the frame. You read those notes from JSON files, fix the cut, and render the next version. It needs Node 18 or newer and nothing else (no npm install).

## 1. Set it up (do this once)

1. Put this folder somewhere permanent, for example next to the video project.
2. Open `config.json` and set:
   - `folders`: the folders you render videos into. Relative paths are relative to this folder. The default is `videos/`, which the server creates.
   - `reviewer`: the reviewer's name, shown on their comments.
   - `fps`: the frame rate of the cuts. Timecodes and frame-stepping use it.
   - `port`: change it only if 7905 is taken.
   - `fpsByName`: frame rate for one video name, for example `{"My Video": 60}`. Others use `fps`.
   - `whisperModel`: path to the whisper.cpp model for voice notes (default `~/whisper-models/ggml-small.bin`).
3. Start it and open it in the browser: `node open.js`. The server keeps running in the background.

## 2. Deliver a cut

- Name every render `<Name> v<N>.mp4`, for example `Sales VSL v1.mp4`, then `Sales VSL v2.mp4`. The page groups versions by the ` vN` ending, so the reviewer gets a version dropdown.
- Render into one of the `folders`, then run `node open.js "Sales VSL v2.mp4"`. To show two versions side by side: `node open.js "Sales VSL v2.mp4" "Sales VSL v1.mp4"`.
- If a file named `<Name> v<N> (phone).mp4` sits next to the master, the page hides it from the list and the Download button serves it. Make one with ffmpeg at 720 px wide for easy sharing.
- Files that start with `_` are hidden, so use that prefix for temp renders.

## 3. Read the notes

When the reviewer clicks **Send to Claude**, the page writes `notes/<file>.submitted` and they tell you "notes are in".

`notes/<file>.json` is a list of comments:

```json
{"id": "mvbcrvsj", "t": 6.875, "t_end": 8.2, "text": "This slides in too early", "drawing": "Sales VSL v2.mp4__mvbcrvsj.png",
 "done": false, "at": "2026-10-17T19:20:46Z", "replies": [{"by": "Abid", "text": "...", "at": "..."}]}
```

- `t` is seconds on that cut. `t_end` appears only on range comments.
- `drawing` is a PNG in `notes/`: the frame the reviewer paused on, with their marks on top. Open it and look at it before you change anything. The marks show what the words leave out.
- Voice notes: `audio` is the recording in `notes/`, `transcript` is the whisper text (also copied into `text`). `transcribing: true` means the text is still coming. Whisper can mishear names, so play the audio if a note reads oddly.
- `notes/<file>.status` holds `none`, `review`, `progress` or `approved` from the status dropdown.
- Never delete or rewrite the reviewer's comments.

## 4. After you fix a round

- Render the next version with the same name and the next number. **The new version starts with an empty Comments panel.**
- Optional: in the old version's JSON, add a `reply` field with one line on what you changed, and set `done: true`. The reply shows under that comment when someone opens the old version.
- If your fix moved time (you cut or added frames), write `notes/<new file>.timemap.json` so Compare stays frame-matched:
  `{"prev": "Sales VSL v1.mp4", "map": [[20.85, 0.183]]}` means that from 20.85 s on the new cut, the old cut is 0.183 s later.
- If you edit `server.js`, restart the server: stop the node process on the port, then run `node open.js` again. `index.html` changes only need a browser refresh.

## 5. What the reviewer can do

Play, frame-step, drag-scrub, hover the scrubber for a frame preview, comment at a frame or over a range (I and O keys), draw with pen, arrow or box, reply, edit, tick comments complete, search, filter, sort, set a status, compare versions, and download the phone copy. Press `?` on the page for the shortcut list.

## API (for scripts)

| Method and path | What it does |
|---|---|
| GET `/api/videos` | every video: name, base, version, notes count, status |
| GET `/api/notes?name=<file>` | the comments for one video |
| POST / PATCH / DELETE `/api/notes` | add, change, remove a comment (`{name, ...}`) |
| GET, POST `/api/status?name=<file>` | read or set the review status |
| GET `/api/config` | reviewer name, editor name, fps |
