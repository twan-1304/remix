# ReMix

A free, local browser workspace for images and videos: resize, compress, convert,
restore, upscale, cut clips, and export individual files or ZIP archives.
Media stays on your device. No account, API key, Node server or database is needed.

This repository contains the ready-to-serve release. `index.html`, scripts,
`ai/`, `icons/`, and `assets/` belong together at the publishing root.

## AI upscaling

AI 2× and AI 4× run the shipped UpscalerJS ESRGAN Medium 1.0.0 models through
TensorFlow.js 4.11's WASM backend. These are separate native 2× and 4× models;
processing is tiled and performed locally. Model weights and WASM are loaded
on demand from the same site, relative to `ai-upscale.js`.

The same files support `/image-crucible/`, `/remix/`, and a domain root without
editing paths. Output is limited to 20 megapixels. AI may alter fine details;
video codec availability depends on the browser and operating system.

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for the existing GitHub Pages setup, Cloudflare
Pages settings, cache migration, smoke checks, and rollback instructions.

Keep `service-worker.js`: it retires the old Image Crucible caches and unregisters
itself. ReMix does not install a replacement caching worker or promise offline
startup. The manifest retains the relative application identity and updates its
name and icons; installed shortcuts may refresh on the browser/OS's own schedule.

Third-party licenses are preserved in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)
and under `ai/`. This release does not ship Image Crucible's old FFmpeg CDN runtime.

## Output filenames

In the Inspector, **Output filename** accepts a name for that file only. Leave it
blank to use your workspace default. Open **Naming defaults & batch preview**, or
**Settings → Workspace → Output filenames**, to choose a prefix/suffix or template.
The initial default remains `{name}-remix.{ext}`; clear the suffix to remove `-remix`.

Templates support `{name}` (original stem), `{ext}` (actual output extension) and
`{index}` (queue position, with configurable start and padding). For example,
`{index}-{name}-final.{ext}`. The **Append batch number** option also works with
prefixes/suffixes and file-specific names. Unknown tokens remain literal text.
Defaults save locally with workspace preferences; file-specific names last for
this session and are independent of media presets.

Naming changes apply immediately to completed downloads without re-encoding.
The complete queue determines names before unfinished/failed/cancelled items are
filtered, so partial exports keep their numbers and duplicate suffixes. Explicit
renames or removing queue items recompute the plan. Preview names match individual
batch downloads, separate downloads and ZIP entries. Repeated downloads request
the same name; your browser handles files already in its downloads folder.

Extensions come from the completed output (MIME type or its header for temporary
files without a MIME type). A typed media extension cannot relabel the result.
The existing sanitizer removes paths, invalid/control/bidi characters and reserved
device names, normalizes Unicode, and deduplicates case-insensitively. Long stems
are shortened with space reserved for numbering and collision suffixes. The ZIP
archive itself retains its existing `remix-batch-YYYY-MM-DD.zip` name.

### Filename checks

- `node --test tests/output-names.mjs`
- `node tests/pwa-install.mjs`
- `node tests/output-names-browser.mjs` (requires Playwright and Chromium;
  optionally set `CHROMIUM_EXECUTABLE_PATH` to an existing Chromium executable)

The browser suite uses real image and WebM exports and reads ZIP directory entries.
It covers preview/download parity, changed format settings after export, duplicate
names, Unicode, device names, archive invalidation, cancellation/partial batches,
retries, persistence and mobile layout. It does not certify every browser/OS
combination or MP4/MOV encoder availability. No app build step is required.
