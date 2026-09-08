# First-pass feasibility — 2026-09-08

## Recommendation

Build the spatial memory loop on a licensed real room first. Make personal room
capture an asset substitution, not a blocker for viewer and app integration.
Hardware is available; capture quality, environment setup, and source-app access
dominate the schedule. No measured end-to-end latency exists yet.

## Candidate stories

These are coordinator judgments, not measured probabilities or GPT Pro findings.

| Story | Delivery risk | Visible intelligence | Why space matters | Decision |
| --- | --- | --- | --- | --- |
| Five personal memories in one familiar room | Lower once room/media exist | Source selection and grounded captions | Objects cue autobiographical stories | Initial emotional story |
| Five facts from one study app placed along a route | Lower once source UI works | Extraction, cue creation, source verification | Repeatable route supports recall interaction | Strong alternate if personal assets are missing |
| Remember an inherited engineering workflow | Higher | Interpret a dense UI and explain a constrained task | Room loci can encode steps, but may feel arbitrary | Use only with an already working source project |
| Automatically rebuild your life/home from the camera roll | Highest | Broad selection and reconstruction | Strong premise; weak bounded input | Cut from seven-hour build |

## Technical facts checked against primary documentation

- Spark documents Gaussian file loading, scene transforms, and click raycasting.
  Its raycast walks splats and can stall on large scenes; use named anchor hit
  targets for routine navigation. [P, Spark documentation, TBD: verify numeric
  trust score] [SplatMesh](https://sparkjs.dev/docs/splat-mesh/).
- Nerfstudio Splatfacto documents structure-from-motion initialization and Gaussian
  PLY export. This establishes an available workflow, not compatibility or speed on
  our machines. [P, Nerfstudio documentation, TBD: verify numeric trust score]
  [Splatfacto](https://docs.nerf.studio/nerfology/methods/splat.html).

Inference: unrelated camera-roll images are memory content, not a dependable room
capture. Plan overlapping deliberate views of one mostly static room. Validate
camera registration before committing the demo to a new reconstruction.

## Live infrastructure findings

Read-only scout reached both reported GB10 systems and one x86_64 RTX PRO 6000
Blackwell system through configured identities. Existing GPU workloads remain
untouched. No ready reconstruction toolchain was found. The GB10 environments
emitted a PyTorch/CUDA architecture-support warning. The second reported RTX GPU
remains unverified. Keep addresses, identities, and process inventories outside Git.

Do not repair all machines. One compatible trainer is sufficient once room input
exists. Split timing into setup, registration, training, export, transfer, and viewer
load; a fast training step cannot establish reconstruction success.

## Model consultation

GPT-6 Pro idea consultation was submitted through signed-in ChatGPT. Retrieval
encountered browser timeouts; no answer has yet been incorporated. Save the actual
answer and decision changes only after reading it. Do not infer a recommendation
from the submitted prompt or the model's progress messages.
