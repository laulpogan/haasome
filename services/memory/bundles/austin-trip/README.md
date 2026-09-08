# Austin trip — three photos and one video

This expanded bundle contains four English memory cards: the original corner-kick photo, a team photo on the soccer field, the captioned fourth-game photo, and the short table-tennis video titled "The final games and award".

## Use this delivery

- Branch: `codex/tito-whatsapp-handoff`.
- Commit: obtain with `git log -1 --format=%H -- services/memory/bundles/austin-trip`.
- Input: presenter-selected Austin Soccer Trek 2026 WhatsApp media.
- Output: this entire folder, including `memories.json`, `assets/` and manifest.
- Start: run A's viewer with `npm run preview` from `apps/palace` after its normal install/build; choose a place, then **Open bundle** and select this folder.
- This replaces the one-record bundle for import; do not import both, because the original memory ID is retained.
- The existing capsule assembler can consume this `memories.json` (four records) with a scene supplied by B. No new assembler or shared contract is needed.

## Provenance and evidence boundary

All three new files were selected, inspected and saved through native WhatsApp UI. Captions and displayed sender/message times were read directly. The video played in WhatsApp. The original files are copied without modification; the manifest records sizes and SHA-256 hashes.

The original corner-kick record retains its actual computer-use evidence screenshot. New context screenshot attempts did not produce verified files: entire-screen capture was blocked by automatic review and bounded-window alternatives did not save a new capture. The three additional records therefore use conservative `manual` packaging with no evidence screenshot; they are real media, not fixtures. Their source locators preserve the UI observations, and capture times use the file-save minute in UTC, not exact UI-read seconds.

Message dates do not establish photo/video capture dates. Context comes from the presenter's selected trip and observed captions. No faces were identified; no match result, winner, precise venue, or reconstruction is claimed. The selected bundle is published for the team at the presenter's request.

## Verification and remaining work

The original image and screenshot remain unchanged. All referenced media exist and match the asset manifest. Consumer schema validation is checked before push. Actual full palace import, anchor placement, video playback in the palace, freeze and fresh reopen remain integration work for A/coordinator. No Gaussian splat is included.
