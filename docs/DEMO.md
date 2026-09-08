# Demo route and acceptance

## Current route: a place to remember

Use the approved Austin capsule as the functional baseline. The quality and object
lanes are still improving it; choose the final scene only after a rendered comparison
and a complete capsule rehearsal. The collaborator drafts the spoken script in
[issue #1](https://github.com/laulpogan/haasome/issues/1).

Proposed 90-second sequence, not yet a timed rehearsal:

1. Open the room: “A place can become a way back to a memory.”
2. Visit one object and reveal a selected photo or clip.
3. Reveal the saved source. Explain manual import versus observed computer use.
4. Hide the memory, use its cue, then reveal it again.
5. Reopen the frozen chapter and revisit the same memory.

Use recognition language only after the running build demonstrates confirmed object
bindings. Baseline pins are manually placed coordinates. Describe placements as
memory cues, not proof that events occurred at those objects. Show the rough capture
as an experiment if the final route uses a cleaner licensed setting. Keep its origin
visible. A backup recording must be labeled as a recording.

## Release rehearsal gate

Run against the exact chosen scene, branch, capsule and presentation browser:

- Scene loads with correct origin and attribution; demonstrate three useful views.
- Every selected memory opens; included videos play and source evidence matches.
- Confirmed object bindings survive navigation, freeze and fresh reopen.
- Changing scene identity marks bindings stale rather than silently reusing them.
- Recall hides content until reveal; save/reload preserves the selected chapter.
- Run the complete spoken route twice and record duration and any failed step.
- Inspect console and required asset failures. Keep a tested local backup available.

Record the commit, artifact hash and observed results. Passing the old capsule flow
does not establish the new object-binding gate. New recognition, final scene quality,
and the timed stage rehearsal remain pending.

## Historical first-slice verification


On 2026-09-08, the production build passed four contract tests and an isolated
Playwright browser flow with zero console errors or failed HTTP responses. The
browser consumed the scene pipeline's exact 14,955,740-byte SOG and the local memory
exporter's fixture bundle. Image/evidence display, anchor editing, recall/reveal,
save/reload, JSON round-trip, and invalid-path rejection passed. Desktop and mobile
screenshots were inspected.

One headless Metal run reported 0.74 seconds for local splat decode/load. This
excludes network download and reconstruction and is not a sustained performance
claim. Actual capture duration, presenter-room reconstruction, video playback,
five meaningful object placements, and the full stage rehearsal were unverified in that first-slice run. The later presenter-video results are
recorded in [reconstruction evidence](../pipelines/scene/RECONSTRUCTION.md).

## Curated 3D backup: Fragments of an Emperor

Use `work/curated-spatial-demo` at `affeb0f` in its separate worktree. This route
is intentionally independent of the personal capsule's object editor. The worker's
browser run verified three actual surface selections, hidden-cue recall, portable
freeze, fresh-process reopen with original asset requests blocked, and identical
refrozen bytes. Coordinator inspected the courtyard and all three close views.

On the presentation Mac: **http://127.0.0.1:4189/?tour=capitoline**. Start with the
courtyard loaded, visit head → hand → foot, then use the hand's recall interaction.
The public licensed scan and three manually curated museum notes tell a coherent
educational story. Never narrate it as personal capture or automatic recognition.
The full setup, provenance and original verification are in that branch's
`docs/FALLBACK-DEMO.md`.

Suggested transition: “The same spatial memory interaction can help us revisit
knowledge. Here, a licensed museum scan holds three source-backed artifact notes.”
This is an alternate route, not an extra act required in the 90-second personal demo.

## Emergency content-only backup

The collection lane produced a private single-file offline timeline at
`/Users/laul_pogan/Source/haasome-context/artifacts/selected-context/timeline/austin-timeline.html`.
Coordinator opened it with browser networking disabled: five records appeared,
both videos played and no page errors or external requests occurred. Its rendered
page was inspected. Open the file directly if the 3D viewer is unavailable and
state that this is the saved chapter in a flat view. It does not demonstrate splats
or object recognition. Keep this file private; it embeds personal media.

Coordinator replay on the production museum viewer also passed two consecutive
head/hand/foot → recall/reveal action runs (2.219s and 2.425s, without narration),
then saved and reopened the tour from device storage at the base URL. No console,
page or required HTTP errors occurred. The settled reload screenshot was inspected after allowing the first sorted GPU
frame to appear. These automation durations are not stage rehearsal times. Local proof: `artifacts/rehearsal/curated-rehearsal.json` and PNG.
