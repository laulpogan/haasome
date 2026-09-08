# Apple Maps local prototype

Native macOS viewer using AppKit and Apple's MapKit satellite Flyover. This is a local prototype, not an embeddable web map. It needs an internet connection for Apple map imagery; no private media is uploaded by this app.

Build with `zsh build.sh`. Launch with `zsh run.sh --media /path/to/selected/austin/media`. The media directory must contain the selected `memory-0.jpg` photo. Optional `--latitude` and `--longitude` set the map's initial location and memory cue. The defaults are the exported field photo's GPS, not a claim about the goal's exact position.

Apple supplies the map data and attribution. Native map controls support camera movement, rotation, tilt and zoom. The gold annotation shows the selected memory. The footer reports map loading errors. The initial camera is 500 meters from its target, tilted 60 degrees. The scale is hidden because the native control displayed a stale value during the first test.

## Observed on the presentation Mac, September 8, 2026

The native viewer loaded Apple's photorealistic Wright Fields imagery with surrounding buildings and trees in relief. Zoom changed the view, selecting the gold marker expanded its title, and the selected goal photo appeared alongside the field. Window sizing was corrected after the image's intrinsic size initially expanded the layout. Build and ad-hoc signing passed.

This is a one-memory local native prototype. It is not a browser embed or a trained Gaussian splat, and does not yet implement editable placement or saved multi-memory palaces. The initial marker uses the selected field photo's location; it does not establish the goal's exact position. Rendering may take a few seconds to settle. Reopen via the launch command with the same selected media folder.

Optional `--diagnostics /path/to/local/layout.json` writes camera and window geometry to that local file for troubleshooting. Keep this output outside Git along with the selected media.

The build output stays in ignored `build/`; private media remains outside this directory. No external packages, API keys or account credentials are included.
