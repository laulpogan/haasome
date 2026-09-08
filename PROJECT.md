# Project brief

## Outcome

A person opens a reconstruction of a familiar room, visits objects that hold
memories, and returns to a source-backed detail through a spatial cue. A computer-use
agent gathers one useful detail from an existing app and helps place it in the room.

Working name: Haasome / Memory Palace. Browser-first is the proposed delivery
surface because all three teammates need a common viewer. Native mobile and
virtual reality are outside this seven-hour slice.

## Proposed first story

"Help me remember the story behind these things."

Use one presenter-owned room and five selected memories. Capture one fact from an
already accessible app, show its screenshot/source, attach it to a chosen object,
walk away, then return through a cue. A short recall prompt makes spatial placement
functional. This demonstrates a recall interaction; it does not establish improved
human memory or a clinical benefit.

The earlier engineering/legacy-app suggestions are context, not selected integrations.
A dense app is worthwhile only if it supplies a detail the presenter wants to remember.
Do not install a new engineering suite merely to produce a complex screen.

## Essential slice

- One captured Gaussian-splat room, with a clear label if a sample scene is used.
- Five stable spatial anchors, each opening text, a selected image, or a short clip.
- One new memory from actual computer use in one allowed source app.
- Visible provenance and an editable placement; model suggestion is not fact.
- A saved palace that survives reload on the demo machine.
- One cue → visit anchor → reveal source loop.

## Assumptions to test first

- A teammate can provide a deliberate room capture or an existing licensed splat.
- A working signed-in computer-use surface is available; "Astra 6" does not by
  itself establish an API name, credential, SDK, or hackathon requirement.
- One selected app has accessible non-sensitive demonstration content.
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
Availability, exact GPU variants, host architecture, environment, and capacity
remain unverified until the lane owner checks the actual host.

Give B one compatible free RTX host for reconstruction; keep the other as a
separate fallback, not distributed training. Use a Spark only if C already has a
working compatible inference service and approved model. Leave spare machines idle
when they do not shorten the critical path. The demo viewer must work without an
SSH round trip for every camera movement.
