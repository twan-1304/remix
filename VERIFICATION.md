# ReMix migration verification — 23 October 2026

Prepared from the ReMix v28 source (`d45ecdab52cc3e7d3e2702ee029fdc146d654a41`)
with the module-relative ESRGAN path and legacy-cache migration changes.
This package has not been deployed to GitHub Pages or Cloudflare.

## Passed

- All 14 release suites, including real image/ZIP processing, native video
  encode/decode and cuts, security regressions, and migration behavior.
- Real shipped ESRGAN Medium 2×/4× inference through WASM in the native tests:
  tile/whole-image agreement, alpha retention, tensor release, cancellation,
  unavailable-model errors and recovery, and early size limits.
- Actual browser exports through the rebuilt production worker at `/`,
  `/image-crucible/`, and `/remix/`: correct 2×/4× dimensions and model report,
  PNG bytes, both model manifests and weight files, and WASM requested below
  the correct deployment prefix. No AI requests escaped that prefix.
- Relative ReMix manifest, launch URL and all three icon assets at each mount.
- Full workspace boot under `/image-crucible/`.
- Cleanup logic: only the exact legacy worker registration is updated;
  unrelated registrations and caches survive; registration is retired even
  if legacy-cache access/deletion fails. No fetch interception or forced reload.
- Release archive CRC and exact byte agreement with the staged runtime files.

The preview serves exact built files for deployment checks. Its ordinary Vite
asset rewriting initially caused a root-only runtime failure; serving the same
unmodified release bytes used at the repository paths resolved it. No runtime
security policy was weakened for the checks.

## Deployment checks still required

The preview uses HTTP and cannot exercise HTTPS-only service-worker activation.
Verify that a returning Image Crucible profile updates and retires its old
registration after the production deployment. Browser/OS-installed app labels
and icons may refresh later.

The six configured HTTP security headers require a host that interprets the
configuration. GitHub Pages does not apply Cloudflare's `_headers` file. Verify
live document, worker and WASM responses on the chosen Cloudflare deployment,
then run image, ZIP, AI and video smoke checks there.

This migration does not change dependencies or certify every browser/OS codec
combination. The earlier dependency audit's development/unreachable advisories
were not upgraded as part of this path/configuration change.
