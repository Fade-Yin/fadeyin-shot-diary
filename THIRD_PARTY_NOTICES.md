# Third-party software

MIT applies to Pianlala application code, not to third-party binaries or libraries.
Their copyrights and licenses remain intact.

- Electron: MIT; Chromium has additional notices shipped with Electron.
- FFmpeg / FFprobe: https://ffmpeg.org/legal.html . Builds enabling GPL components
  (including x264) must not be described as MIT or LGPL-only.
- Binary distribution and recipes: https://github.com/eugeneware/ffmpeg-static
  (FFmpeg b6.1.1; macOS FFprobe b6.0).
- FFmpeg source: https://ffmpeg.org/releases/ . Corresponding dependencies and
  build recipes must match each executable, not an arbitrary latest version.
- Windows FFmpeg upstream: https://www.gyan.dev/ffmpeg/builds/ .
- ffprobe-static wrapper: MIT, https://github.com/joshwnj/ffprobe-static .

Exact corresponding-source archives for bundled GPL binaries and dependencies
still require verification. Binary release drafts must not be described as
distribution-compliance verified until that work is completed.
