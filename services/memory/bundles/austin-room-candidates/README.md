# Additional Austin room candidates

Presenter-authorized selection from 18 supplied videos and five photos. Three original MP4s and one photo are included in `media/`; `selection.json` records dimensions, durations, hashes and selection reasons. This is an input selection, not a memory-import bundle. No source app was browsed for this delivery.

## Suggested evaluation order

1. **17-02-00**: glazed-door and floor coverage, then the table and wall.
2. **17-02-15**: a wider and relatively unobstructed table/wall/floor view in sampled frames. Camera motion may be limited; test against the baseline.
3. **17-04-31**: longer clip with varied viewpoints. Select useful short subsequences; do not blindly feed the full clip or only its first 120 seconds to the existing runner. A sampled late view has a different table-side perspective.
4. **photo-5.jpg**: medal-presentation memory context. The five supplied photos are similar, so only one is included. Avoid using moving people or mirror reflections as static geometry evidence.

All videos are 464 × 832: more footage does not add native pixel detail. Review sampled frames locally identified matching table, prints, mirror and doors, but does not prove every frame has a compatible room layout. People, blur and reflections remain substantial limitations. No registration, GPU training or reconstruction-quality improvement is claimed.

The supplied 17-01-54 clip matches the existing baseline byte-for-byte and is omitted. Other short clips mostly repeat this table-side composition; originals remain local. Three 10%/50%/90% samples per video were decoded using macOS AVFoundation; this is sampled inspection, not a full-watch claim.

## Handoff

- Branch: `codex/tito-whatsapp-handoff`; commit: `git log -1 --format=%H -- services/memory/bundles/austin-room-candidates`.
- Input: the presenter-selected attachments; output: this folder's `media/` and `selection.json`.
- Start: use the quality lane's existing room-capture runner on selected subsequences; no new runner or dependencies supplied.
- Observed: all 18 videos decoded at sampled timestamps; exported selections copied unchanged and hashes recorded.
- Remaining gate: quality lane must accept/reject candidates through registration and compare the resulting scene. No object coordinates or new memory cards were changed.

Paul's newer assignment to sbardacosta-code is issue #1 (demo rehearsal). This closes the already-authorized media handoff; active technical collection remains with `work/selected-context-austin`.
