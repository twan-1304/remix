# Switching Image Crucible to ReMix

The production ReMix repository is `twan-1304/remix`, served from its root on
GitHub Pages at `https://twan-1304.github.io/remix/`.
`twan-1304/image-crucible` is now a small compatibility repository that restores
the old launch address for existing installed apps. Application development and
Git remotes must use the `remix` repository.

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

Asset paths follow the deployed module location, including `/remix/`. GitHub
does not redirect Pages URLs after repository renames. The compatibility site
therefore serves ReMix at `/image-crucible/` while installed apps pick up their
updated manifest. Reusing the old repository name also ends GitHub repository
redirects: existing Git remotes must use `https://github.com/twan-1304/remix.git`.
Browser storage is origin-based; moving to another hostname requires a separate
plan for installations, preferences, and caches.

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
| Repository | `twan-1304/remix` |
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

The manifest uses `id: "./"`, which resolves against the start URL's origin,
not its directory. On GitHub Pages the preserved installed identity is
`https://twan-1304.github.io/`. The compatibility manifest explicitly keeps
`id: "/"` and changes `start_url` and `scope` to `/remix/`. Both its original
manifest URL (including `?v=0.7.4`) and the old service worker URL are served by
the compatibility repository. Its page displays ReMix using the runtime at
`/remix/`, without a forced reload or redirect.

Keep **both** GitHub Pages deployments available for returning users during a
future Cloudflare move. Do not disable `/remix/`: the compatibility page loads
its runtime files from there. A different hostname is a separate app-origin
migration, not covered by this bridge. Browser/OS updates of installed app names
and icons may require user review. This release does not provide an offline
app-shell cache.

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
