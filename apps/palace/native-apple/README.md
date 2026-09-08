# Haasome — Austin, remembered

A local macOS memory palace built with AppKit, Apple MapKit Flyover and AVKit. Return to the actual Austin field, revisit three selected memories, and save your own words and spatial cues on your Mac. Apple supplies the map imagery; this app does not train a Gaussian splat or upload the selected media.

## Open the private demo

Double-click the prepared **Haasome Apple.app**. A prepared private copy contains its selected media in `Contents/Resources/Austin/`. The source repository does not include these personal files.

For development, run `zsh build.sh`, then `zsh run.sh --media /path/to/selected/austin/media`. The folder needs `memory-0.jpg` (Martín’s goal), `memory-4.mp4` (the save against MIT), and `memory-1.jpg` (the team). The build requires the macOS command line tools and uses only Apple system frameworks.

## Revisit loop

- Choose a gold map pin or a bottom memory card to open its photo or playable video.
- **Explore the field** hides the story and media. Explore the real 3D place, then return through a pin or card.
- Add **Your words** and press **Save your words**.
- Move the map to the desired cue location and press **Place memory here** to save that memory at the map center.
- **Orbit the field** toggles a slow, real camera orbit; **Reset view** returns to the starting camera. The map also supports normal zoom, rotation and tilt.

Saved notes and coordinates are stored as local JSON in `~/Library/Application Support/Haasome/palace-state.json`. Optional `--state /path/to/local/palace-state.json` overrides that location. Note drafts survive switching cards during the session; Save or Place writes the current palace to disk. Unsaved drafts are not promised to survive quitting.

The initial camera uses the selected field photo’s GPS. The three initial anchor coordinates are approximate mnemonic placements, not verified locations of the goal, save or team photo. The user can correct their own cue positions. Reopening with the same state file restores saved notes and positions.

## Verification and boundaries

The earlier one-memory prototype was tested on the presentation Mac on September 8, 2026: Apple’s photorealistic Wright Fields loaded with buildings and trees in relief, zoom changed the view, pin selection worked, and the selected goal photo appeared. Window fitting was corrected; native scale is hidden because it initially displayed a stale value.

The three-memory MVP was then verified on the presentation Mac: all three memory cards opened; the match video played through its 7.8-second timeline; Explore hid the memory and selecting a map point revealed it again; orbit changed the actual camera view; a test note and changed anchor coordinate were written to local JSON; after quitting and reopening, the saved note and location were restored. This verification used a separate local state file, leaving the presentation state clean. Rendering can take several seconds to settle. Apple map attribution remains in the native view.

This is a local native app, not a browser embed, hosted product, automatic reconstruction pipeline or claim of measured memory improvement. It requires network access for Apple imagery. Its private media and saved palace remain local. No API key, paid API integration or external package is included.

Optional `--latitude` and `--longitude` override the starting field coordinate. Optional `--diagnostics /path/to/local/layout.json` writes camera/window geometry for troubleshooting. Keep diagnostics and state outside Git. Build output remains in ignored `build/`.
