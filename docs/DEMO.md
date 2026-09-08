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
