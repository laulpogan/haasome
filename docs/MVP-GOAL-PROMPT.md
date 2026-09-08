# Goal prompt: personal spatial time capsule MVP

Continue Haasome to the original vision: a person brings selected photos/video and
context from their apps into a Gaussian-splat place, then freezes a memory capsule
they can revisit. Ship one complete personal experience within the remaining
hackathon time. Keep the reconstruction computer-use demonstration visible.
Do the work, verify the live path, and push small verified commits throughout.

## Start from what works

Read AGENTS.md and the current branches before editing. Do not rebuild the app.

- `integration/first-palace` has the working viewer, real remote Nerfstudio training,
  Gaussian export, and a screenshot-backed export lesson imported into the palace.
  A 3000-step reconstruction passed import, recall, save, and reload.
- `capsule/integration`, checkout `../haasome-capsule`, has the other session's
  portable freeze/reopen workflow, multi-source assembler, and an observed personal
  Photos/WhatsApp capsule. Read its docs/CAPSULE-PLAN.md and linked session context.
  Its existing local capture/import flow is not a raw-media GPU upload service.
- Both RTX PRO 6000 hosts are reachable. The second completed a 10000-step run;
  inspect/export that result before retraining. Both DGX Sparks are authorized,
  but use them only for an independent task that shortens delivery. Preserve other
  workloads and drivers. Reuse the isolated project environments.
- Existing assets and private captures stay under ignored artifacts/. Never place
  credentials, private source text, photos, or scene binaries in Git.

Inspect active ownership through linked-session context. Integrate reviewed changes
on a new integration branch without switching another session's checkout or merging
the default branch. Preserve both teams' working flows and shared contracts.

## One user journey

1. Create a named capsule. Select a small set of personal photos or short clips via
   a normal file picker. Offer selected media as memory content immediately.
2. Choose its place: use an existing supported splat, the working licensed room,
   or deliberately captured overlapping photos/video of one room. Clearly distinguish
   real captured, licensed, and generated settings. Unrelated camera-roll photos
   are content, not automatically a valid reconstruction dataset.
3. For a deliberate room capture, connect the selected-input flow to one real RTX
   reconstruction job. Validate files, extract bounded frames when needed, estimate
   camera poses, run the short training probe, train, export, and return the scene
   bundle through the existing importer. Show actual stage/progress/error state.
   Use private temporary storage and authenticated/private transport; no public
   upload bucket or unauthenticated GPU control. Do not expose a shell to uploads.
4. Use actual computer use to gather useful context from one bounded, selected
   source-app item or the already authorized capsule records. Retain evidence and
   source dates. Distinguish observed facts from inferred connections; let the user
   correct a proposed connection before freezing it. Do not invent biography,
   attendance, location, or people from temporal proximity.
5. Place three to five memories at recognizable objects. Each card shows selected
   media, concise context, source, and evidence. Keep user edits simple.
6. Freeze one portable capsule. Open that exact file in fresh browser state; visit
   the objects, reveal sources, and complete a recall loop. Preserve originals when
   making an editable copy. Test the real scene size, not just tiny fixtures.

## Three lanes with separate writers

- A — experienced frontend teammate: integrate the existing capsule/import UX,
  selected-media flow, real job status, and recognizable spatial placement. Own
  apps/palace/. Coordinate shared-contract changes with the coordinator.
- B — coordinator: own pipelines/scene/, the narrow remote input→poses→train→export
  path, actual Nerfstudio UI demonstration, shared contract, and final integration.
  Every new endpoint or helper must have a real caller in this same slice.
- C — newer programmer with Codex: own services/memory/. Finish the bounded batch
  packer/assembler and three to five source-backed cards using the existing tools.
  Use docs/TEAMMATE-START.md, adapting to the capsule assembler already delivered
  rather than duplicating it. No GPU installation or renderer rewrite in this lane.

Use native Codex child agents for substantial independent tasks with disjoint
ownership. Conserve Astra credits, close finished agents, and avoid recursive
Codex CLI. Reuse the completed Pro consultation; do not reopen broad ideation.
No paid API/model generation without the user's explicit spending choice.

## Time and completion rules

First deliver the personal media + existing room + portable capsule path. In parallel,
timebox the missing raw-capture registration path to 30 minutes for a decisive
attempt. This is a work budget, not a promised reconstruction duration. If no selected
room input exists, ask only for that missing input while completing independent
integration. Never browse the whole camera roll or upload unrelated personal data.
If registration fails, explain the capture problem and keep the working capsule;
do not label the fallback room as the uploaded room. Report the remaining gate.

Done means observed live execution: selected input reaches the intended consumer;
the real scene renders upright; at least three memories and one actual UI-derived
record display correctly; source correction works; freeze→fresh reopen→recall works;
required browser/network checks pass. Verify video playback if video is included.
Record setup, upload, registration, training, export, transfer, and load separately.

Show a short real Nerfstudio interaction—inspect a view and generate an export
command at minimum. Label shell setup/export as shell work. Pause/resume claims
require an active trainer and observed progress, not a stale completed-run counter.

Commit and push each verified unit. End with the runnable URL, branch/commit,
selected artifact paths, one screenshot, measured timings, and honest remaining
limits. Do not claim completion from tests, a queued job, or a fixture alone.
