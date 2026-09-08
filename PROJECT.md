# Project brief

## Outcome

A person opens a reconstruction of a familiar room, visits objects that hold
memories, and returns to a source-backed detail through a spatial cue. A computer-use
agent gathers one useful detail from an existing app and helps place it in the room.

Working name: Haasome / Memory Palace. Browser-first is the proposed delivery
surface because all three teammates need a common viewer. Native mobile and
virtual reality are outside this seven-hour slice.

## First story after Pro iteration

"Remember the fix."

Recover a useful technical lesson from a public issue or documentation through its
app UI. A candidate is a splat-import problem in GitHub: distinguish an outdated
workaround from the documented requirement, retaining evidence. Source selection
and actual capture are still unverified; do not invent a resolved issue.

Use five loci for prerequisite, symptom, cause, correction, and verification.
These are deliberate mnemonic associations, not claims that the room represents
the software. Capture the source first, then show a labeled trace excerpt and the
source-backed memory during the stage demo. Live extraction is outside the fixed
90-second presentation path until its duration is measured.

Fallback: a five-step workflow from one public documentation page. A hand-authored
lesson proves the spatial interaction only. Nostalgia becomes the next story once
the presenter selects personal media and provides a room capture. This demonstrates
a recall interaction; it does not establish improved human memory or clinical benefit.

The earlier engineering/legacy-app suggestions are context, not selected integrations.
A dense app is worthwhile only if it supplies a detail the presenter wants to remember.
Do not install a new engineering suite merely to produce a complex screen.

## Essential slice

- One real Gaussian-splat room, with a clear label for the licensed sample.
- Five stable spatial anchors, each opening text, a selected image, or a short clip.
- One new memory from actual computer use in one allowed source app.
- Visible provenance and an editable placement; model suggestion is not fact.
- A saved palace that survives reload on the demo machine.
- One cue → visit anchor → reveal source loop.

## Assumptions to test first

- A teammate can provide a deliberate room capture or an existing licensed splat.
- A working signed-in computer-use surface is available; "Astra 6" does not by
  itself establish an API name, credential, SDK, or hackathon requirement.
- One public source app has a meaningful technical detail we can capture and verify.
- Available GPU hosts have a compatible existing environment and free capacity.
- All timings below are timeboxes, not measured training or inference speeds.

## Cuts

No automatic reconstruction from unrelated camera-roll images; no whole-house
generation, automatic semantic segmentation, face recognition, voice cloning,
multi-app federation, agent-written changes to source apps, or multi-GPU training.
No invented biography or synthesized people. Memory content remains separate from
scene geometry so a new splat does not require rebuilding the ingestion flow.

## Infrastructure allocation

Reported resources: two DGX Sparks and two RTX Pro 6000 GPUs over Tailscale.
Read-only checks on 2026-09-08 reached both GB10 hosts and one RTX PRO 6000 Blackwell
Workstation Edition through established SSH aliases. The second reported RTX GPU
has not been verified. No ready room-reconstruction stack was found on the checked
hosts; the GB10 Python environments also emitted a CUDA architecture warning.

Give B one compatible free RTX host for reconstruction; keep the other as a
separate fallback, not distributed training. Use a Spark only if C already has a
working compatible inference service and approved model. Leave spare machines idle
when they do not shorten the critical path. The demo viewer must work without an
SSH round trip for every camera movement.

Use an existing licensed room splat for the first integrated slice. Fresh capture
and environment setup remain a separate lane B milestone. No reconstruction timing
or browser performance has been measured. See [feasibility](docs/FEASIBILITY.md).
