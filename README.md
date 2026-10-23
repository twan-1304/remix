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
