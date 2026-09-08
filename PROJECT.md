# Project brief

## Outcome

A person opens a reconstruction of a familiar room, visits objects that hold
memories, and returns to a source-backed detail through a spatial cue. A computer-use
agent gathers one useful detail from an existing app and helps place it in the room.

Working name: Haasome / Memory Palace. Browser-first is the proposed delivery
surface because all three teammates need a common viewer. Native mobile and
virtual reality are outside this seven-hour slice.

## Current story: a frozen chapter

Recover a bounded chapter through Photos and WhatsApp, retaining the source image,
chat evidence, dates, and uncertainty. The presenter authorized both apps for this
trial. A shared date can suggest a connection; it cannot establish attendance or
photo location. Keep contrary evidence in the capsule.

Three source-backed records occupy three of five anchors in a licensed sample
room. Freeze the scene and referenced assets into one portable JSON file. Reopen
it, visit an anchor, and reveal the saved evidence. This demonstrates a recall
interaction, not improved human memory or clinical benefit.

The public technical lesson remains an alternative story. The parallel
reconstruction session owns fresh room training; this capsule uses the existing
licensed room until a new export passes viewer inspection. See
[the capsule plan](docs/CAPSULE-PLAN.md) for current scope and delivery.

## Essential slice

- One real Gaussian-splat room, with a clear label for the licensed sample.
- Five stable spatial anchors, each opening text, a selected image, or a short clip.
- Three records from actual computer use in the two selected source apps.
- Visible provenance and an editable placement; model suggestion is not fact.
- A saved palace that survives reload on the demo machine.
- One cue → visit anchor → reveal source loop.

## Assumptions to test first

- A teammate can provide a deliberate room capture or an existing licensed splat.
- A working signed-in computer-use surface is available; "Astra 6" does not by
  itself establish an API name, credential, SDK, or hackathon requirement.
- The selected source apps contain a bounded chapter with evidence worth preserving.
- Available GPU hosts have a compatible existing environment and free capacity.
- All timings below are timeboxes, not measured training or inference speeds.

## Cuts

No automatic reconstruction from unrelated camera-roll images; no whole-house
generation, automatic semantic segmentation, face recognition, voice cloning,
whole-computer federation, agent-written changes to source apps, or multi-GPU training.
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
