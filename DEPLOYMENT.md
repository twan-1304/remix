# Switching Image Crucible to ReMix

This is a prepared replacement for the files currently served by
`twan-1304/image-crucible`. Preparing or opening a draft PR does not deploy it.
The current publishing setup serves the repository root on GitHub Pages.

## GitHub Pages

1. Replace the old website files with the extracted release contents in the
   repository root. Preserve `.git` and the existing history. Commit the
   additions, replacements and removal of the old `icons/icon*` assets.
   Push to `main` (or merge your migration branch) when ready to switch.
2. Keep Settings → Pages → Deploy from a branch → `main` → `/ (root)`.
3. Wait for the Pages deployment to succeed, then open the site.

The runtime files are already built; do not add an extra enclosing `dist/`
folder. `.nojekyll` prevents Jekyll processing. No package installation, Node
runtime, secrets or database are required. Keep the complete `ai/` directory,
including both sets of model weights, all WASM variants and licenses.

A repository rename is optional and separate. Asset paths follow the deployed
module location, including `/remix/`. A changed URL also changes browser storage
and installed-shortcut behavior; do not assume the old Pages URL redirects.

GitHub Pages does not interpret the Cloudflare `_headers` file. The document's
meta CSP remains active, but it does not provide the full HTTP response policy
or a worker response policy. The earlier final-host security-header requirement
therefore remains open if GitHub Pages is the final host.

## Cloudflare Pages

Choose the intended Cloudflare account and create a Pages project. This repository
has no embedded Cloudflare account ID, API token, or pre-existing project binding.
The supplied `wrangler.jsonc` uses `remix` as the intended project name; change it
if that name is unavailable or you choose another name.

For Git integration:

| Setting | Value |
| --- | --- |
| Repository | `twan-1304/image-crucible` (or its renamed successor) |
| Production branch | `main` |
| Framework preset | None |
| Build command | `exit 0` |
| Build output directory | `.` (repository root) |
| Root directory | Repository root |

Alternatively, upload the release ZIP's contents through Pages Direct Upload.
The ZIP has `index.html` and `_headers` at its root. With an existing Pages
project, the CLI equivalent from the extracted release directory is
`npx wrangler pages deploy . --project-name remix`.
Creating/configuring a project and deploying it are separate from this package.

`_headers` supplies CSP, nosniff, no-referrer, Permissions-Policy, HSTS, and
X-Frame-Options for static responses. If a Worker/Pages Function later generates
responses, it must apply the relevant headers itself. No Functions are needed
for this release. Do not disable GitHub Pages or change any custom-domain DNS
until the Cloudflare deployment has been checked.

## Returning Image Crucible users

Keep `service-worker.js` at its old URL for returning visitors. It replaces the
old worker with one that has no fetch handler, deletes only `image-crucible-*`
caches, and unregisters itself. `legacy-migration.js` requests an update only for
the matching registration at this application's exact scope. It does not touch
unrelated service workers, ReMix's AI model cache, presets or local preferences.
There is no forced reload or navigation of an open editor. Existing media already
in an Image Crucible tab should be saved before manually reloading that tab.

The manifest keeps `id`, `scope` and `start_url` relative to this directory, with
ReMix's name and icons. Browser/OS updates of installed app labels and icons may
be delayed. This release does not provide an offline app-shell cache.

## Verify the deployed URL

- Open a clean browser session and a previously used Image Crucible profile.
- Run ordinary image conversion and download a single output and a ZIP.
- Run AI 2× and 4×. Network requests must load `ai/wasm/*.wasm` and each
  `ai/esrgan-medium-v1/x2/` or `x4/` model and weight file below the app's URL.
- Edit/export a video using a supported codec.
- Confirm returning profiles no longer retain the Image Crucible registration
  or shell cache after its replacement activates, then verify a normal reload.
- On Cloudflare, check all six headers on the document, `engine.worker.js`,
  `ai-upscale.js` and a WASM asset, and verify their JavaScript/WASM MIME types.

The local regression harness checks the actual bundled AI at `/`,
`/image-crucible/` and `/remix/`. Its HTTP preview cannot exercise HTTPS-only
service-worker activation; the cleanup logic has separate automated checks.

## Rollback

Revert the migration commit and push to `main`, then wait for Pages to
redeploy. The original Image Crucible release remains in Git history at
`21050fe46914f29aba1f2073e3de68f2f4edb5a3`. On Cloudflare, the previous successful
deployment can be restored through the project's deployment history.

## References

- https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site
- https://developers.cloudflare.com/pages/framework-guides/deploy-anything/
- https://developers.cloudflare.com/pages/functions/wrangler-configuration/
- https://developers.cloudflare.com/pages/configuration/headers/
