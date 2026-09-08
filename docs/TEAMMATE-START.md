# Teammate goals

Start from `origin/integration/first-palace`, not GitHub's default branch.
Use a separate clone/worktree and a unique feature branch. Keep each goal in its
owned directory. Push verified commits; coordinator integrates them.

## Newer programmer: five-card memory pack

You own `services/memory/`. Your job is to make five cards easy to prepare and
import together. You do not need to install a trainer, use a remote GPU, or change
the 3D renderer. Paste this into Codex in your separate checkout:

```text
Read AGENTS.md, PROJECT.md, packages/contracts/README.md, and services/memory/README.md.
Create a new feature branch from origin/integration/first-palace. Own services/memory/
only. Other teammates own the viewer and trainer; do not edit their files or shared
contracts. Explain progress in plain language and make routine decisions yourself.

Goal: one command turns a presenter-edited five-card input file into ONE memory
bundle that the existing palace can import. First inspect export_memory.py and its
callers. Reuse its copying and validation behavior where practical. Add a small
batch exporter accepting a JSON array and an output directory; do not add a server,
database, agent framework, or model API. Refuse overwrites and preserve originals.
Do not weaken evidence requirements or label manual content computer-use.

Include a clearly labeled manual example with five reconstruction lesson cards:
overlapping capture, camera poses, training, inspecting coverage, and Gaussian
export. Check facts against official Nerfstudio documentation and retain source
URLs. Never claim the example describes an observed training run. Real evidence
will arrive from the coordinator later. Keep screenshots and generated bundles
under ignored artifacts/; commit the small example input and documentation only.

Finish line: run the batch command, import its actual output in the existing palace,
attach the five cards, save, reload, and reveal a card. Do not edit apps/palace/ to
make this work; report an integration bug if found. Check rejection of an invalid
entry and existing output directory. Commit and push the verified unit. Return
branch, commit, command, output path, screenshot path, and any unverified step.
If browser control is unavailable, report that boundary rather than claiming pass.
```

Expected first handoff: a working command and one imported card within 30 minutes.
Finish all five before adding features. Ask the coordinator only for a missing
source asset or a change that crosses ownership boundaries.

## Experienced frontend teammate: memorable places

Own `apps/palace/`. Start with the working room and import flow. Place five anchors
on recognizable objects, make selected/clickable states clear, and verify desktop
and phone-sized layouts. Preserve the file contract and local persistence. Rehearse
cue → visit → reveal using C's actual bundle. Push one focused change with a browser
screenshot and the observed save/reload result. Do not replace the renderer or add
new infrastructure.

## Coordinator: reconstruction and computer use

Own remote training, `pipelines/scene/`, shared docs/contracts, and integration.
Complete the short GPU probe, operate the actual Nerfstudio viewer, export a fresh
Gaussian scene, and import it into the palace. Hand C selected UI evidence and
verified facts. Keep the licensed sample available while the new scene is checked.

Share small commits as soon as their checks pass. Never wait for every lane before
pushing. No teammate merges default or rewrites another teammate's branch.
