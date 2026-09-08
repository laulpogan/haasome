# Demo and acceptance

## Proposed 90-second story: Remember the fix

1. 0–15s: pose one technical problem and enter the licensed room.
2. 15–35s: show a labeled excerpt of a completed agent UI capture and its finding.
3. 35–65s: walk five loci: prerequisite, symptom, cause, correction, verification.
4. 65–90s: hide the cards, recall the consequential detail, and reveal its source.

These are presentation allocations, not execution-speed claims. Capture and verify
the technical lesson before the stage demo. If only manual content exists, label
the demonstration as a spatial lesson; do not substitute fixtures for agent proof.

The original table-tennis room is precomputed. The new seating-area sample was
trained during this build from licensed photographs with supplied camera poses.
Distinguish those assets; neither is a personal home or fresh phone registration.
Keep a labeled recording for connectivity failure.

## Acceptance checks on the presentation laptop

- Real scene asset decodes and renders; sample/private-capture label is accurate.
- Five anchors remain attached to the same loci after navigation and reload.
- One memory was captured by actual computer use, not a hand-authored fixture.
- Source reveal shows the matching screenshot/locator and capture time.
- New memory import, placement, save, and reload run through the viewer UI.
- Missing scene/media produces an explicit recoverable state.
- Recall hides content until reveal; no claim of measured cognitive improvement.
- No console errors or failed required assets during a complete rehearsal.

Record observed values for scene bytes, cold load seconds, navigation responsiveness,
capture duration, and total demo duration. Until exercised: `not_established`.

## First integrated verification

On 2026-09-08, the production build passed four contract tests and an isolated
Playwright browser flow with zero console errors or failed HTTP responses. The
browser consumed the scene pipeline's exact 14,955,740-byte SOG and the local memory
exporter's fixture bundle. Image/evidence display, anchor editing, recall/reveal,
save/reload, JSON round-trip, and invalid-path rejection passed. Desktop and mobile
screenshots were inspected.

One headless Metal run reported 0.74 seconds for local splat decode/load. This
excludes network download and reconstruction and is not a sustained performance
claim. Actual capture duration, presenter-room reconstruction, video playback,
five meaningful object placements, and the full stage rehearsal remain unverified.

## Fresh reconstruction and UI evidence

Dell completed a 10-step probe and 3000-step Splatfacto run. The real Nerfstudio UI
was operated to hide cameras and generate an export command. A shell export then
created a 180224929-byte PLY containing 726707 Gaussians. The palace consumed it and
the matching screenshot-backed memory bundle, then restored both after reload.
The new scene's starting orientation was corrected and visually inspected upright.
The final browser flow exercised recall/reveal with that actual captured lesson,
waited for the save confirmation, reloaded both bundles, and reported zero console,
page, or failed HTTP errors. Screenshot: `artifacts/training-ui/palace-complete.png`.
An earlier test reloaded before asynchronous saving completed; the corrected check
waits for "Saved on this device" before reload. Large scene saves need that boundary.
Artifacts and remaining limits are in [training handoff](../pipelines/scene/TRAINING.md).
