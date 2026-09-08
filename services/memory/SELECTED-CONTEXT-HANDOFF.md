# Selected context collection handoff

Lane branch: `work/selected-context-austin`, based on `fd88405`.
Collection owns `services/memory/` and ignored capture artifacts only.

## Current evidence

Fetched partner revision `65fcda1`. Its corrected manifest is an object with a
`files` array, avoiding the viewer's top-level memory-array interpretation.
All seven entries match byte counts and SHA-256 hashes. The five media assets
are deduplicated in the local selection manifest. No new source export was made.

The existing room clip was already consumed by reconstruction. Sampled views show
one end of the blue table, glazed doors and wall prints. Moving people obscure
walls and floor; sampled views do not establish coverage of the opposite table
side. The soccer media supplies memory content, not room-reconstruction views.

This is a visual source inspection, not a registration assessment. Quality lane
must decide which missing view has highest value before collection expands.

## Coordination request

Orchestrator: assign this lane an exclusive foreground interval for the bounded
WhatsApp pass. Direct node messaging is disabled, so this branch is the coordination
handoff. No native interaction has begun. Do not infer ownership from inactivity.

Quality lane: request specific object sides or wall/door/floor details, identify the
current baseline, and name where accepted files should be delivered. On receipt,
consume an accepted candidate or reject it with a capture reason. Do not count an
existing baseline clip as newly collected coverage.

Feature lane: retain ownership of object bindings. Collection will supply memory
IDs, captions and source locators; it will not assign new XYZ coordinates.

## Next bounded pass

Use the already selected trip/group and room-media locators in the approved bundle.
Inspect no more than five promising clips or thirty relevant gallery items in the
first twenty minutes. Prefer sharp overlapping views with stationary room objects
and fewer moving subjects. Retain original files, contextual screenshots where
possible, displayed source times and observation times separately. Keep conservative
manual provenance if a source screenshot cannot be saved.

If no useful views exist, request a slow overlapping pass around the table and
adjacent walls in good light, with people out of the capture path and original
files retained. This is a proposed recapture request, not a message to participants.

## Local artifacts and remaining gates

Worktree: `/Users/laul_pogan/Source/haasome-context`.
Inputs: `artifacts/selected-context/approved/`.
Handoff: `artifacts/selected-context/selection-manifest.json`.
Inspection frames: `artifacts/selected-context/inspection/`.

Remaining: foreground handoff, quality-specific view request, actual source-app
collection, candidate consumption/rejection, improved three-to-five-card assembly,
and media/source display in the live viewer. These remain unverified.

Existing packaging command: `python3 services/memory/export_memory.py --help`.
No new dependencies, source-app writes, media publication or GPU jobs.
