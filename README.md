# RADA Video Prep Studio

Browser-based video converter. Turns phone and desktop videos into MP4 (H.264 + AAC, 30 FPS, max 1080p, yuv420p, SDR 8-bit). Everything runs locally with FFmpeg.wasm. Nothing is uploaded.

Live: https://chocolatepapi123.github.io/ada-video-prep-studio/

## Develop
```bash
npm install
npm run dev
```
## Build
```bash
npm run build     # output in dist/, base path /ada-video-prep-studio/
npm run preview
```
`npm run build` first copies the FFmpeg core from `node_modules/@ffmpeg/core` into `public/ffmpeg/` so it is served from the same origin under the subpath.

## Deploy (GitHub Pages)
1. Repo **Settings → Pages → Source: GitHub Actions**.
2. Push to `main`. `.github/workflows/deploy.yml` builds and publishes. A `.nojekyll` file is included.
3. ZIP import: upload a ZIP of the project to `incoming/`. `.github/workflows/import-zip.yml` unzips it into the repo root, deletes the ZIP and triggers a deploy. Workflow files under `.github/` are never overwritten by the import (GitHub forbids it); edit those in the web UI.

## FFmpeg and isolation
Uses the single-threaded `@ffmpeg/core` 0.12.6. It does not need SharedArrayBuffer, so no COOP/COEP headers are required and it works on GitHub Pages.

## Limitations
- Single-threaded WebAssembly is slow: expect roughly real-time or slower on phones. Keep the tab open and the screen on.
- The whole file is loaded into browser memory. Files above ~1 GB may fail, especially on phones. The app reports the error instead of faking success.
- The browser cannot read codec or frame rate, so the compatibility check judges container and resolution only; every file is re-encoded to guarantee the target format.
- HEVC/HDR sources are converted to SDR without tone mapping, so colours may look flatter.
- Cancel stops FFmpeg; it reloads on the next conversion.
