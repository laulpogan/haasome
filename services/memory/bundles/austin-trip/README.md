# Austin trip — three photos and two videos

This expanded bundle contains five English memory cards: the original corner-kick photo, a team photo on the soccer field, the captioned fourth-game photo, and the short table-tennis video titled "The final games and award", plus the soccer clip "Big save against MI-CHEAT".

## Use this delivery

- Branch: `codex/tito-whatsapp-handoff`.
- Commit: obtain with `git log -1 --format=%H -- services/memory/bundles/austin-trip`.
- Input: presenter-selected Austin Soccer Trek 2026 WhatsApp media.
- Output: this entire folder, including `memories.json`, `assets/` and manifest.
- Start: run A's viewer with `npm run preview` from `apps/palace` after its normal install/build; choose a place, then **Open bundle** and select this folder.
- This replaces the one-record bundle for import; do not import both, because the original memory ID is retained.
- The existing capsule assembler can consume this `memories.json` (five records) with a scene supplied by B. No new assembler or shared contract is needed.

## Provenance and evidence boundary

All four additional files were selected, inspected and saved through native WhatsApp UI. Captions and displayed sender/message times were read directly. Both videos played in WhatsApp. The original files are copied without modification; the manifest records sizes and SHA-256 hashes.

The original corner-kick record retains its actual computer-use evidence screenshot. New context screenshot attempts did not produce verified files: entire-screen capture was blocked by automatic review and bounded-window alternatives did not save a new capture. The four additional records therefore use conservative `manual` packaging with no evidence screenshot; they are real media, not fixtures. Their source locators preserve the UI observations, and capture times use the file-save minute in UTC, not exact UI-read seconds.

Message dates do not establish photo/video capture dates. Context comes from the presenter's selected trip and observed captions. No faces were identified; no match result, winner, precise venue, or reconstruction is claimed. The selected bundle is published for the team at the presenter's request.

## Verification and remaining work

The original image and screenshot remain unchanged. All referenced media exist and match the asset manifest. Consumer schema validation is checked before push. Actual full palace import, anchor placement, video playback in the palace, freeze and fresh reopen remain integration work for A/coordinator. No Gaussian splat is included.

## Soccer clip: presenter-confirmed context

The approximately eight-second original MP4 shows play near the goal and spectators on the sideline. Kamal shared it on February 22 at 4:46 PM. The presenter identified it as a save against MIT, supplied the nickname MI-CHEAT, and approved the exact English card text. Opponent identity and interpretation come from that presenter context; the nickname is not an independently verified misconduct claim. The source-read/export minute is 19:52 UTC on September 8. No new evidence screenshot was saved.

## Folder-import compatibility fix

The manifest uses an object with a `files` array. The viewer treats any top-level JSON array as memories, so the earlier top-level manifest array could reject the whole folder import. Fetch the latest handoff branch and use this corrected folder. Import `austin-trip` itself, not its parent or only `memories.json`.
