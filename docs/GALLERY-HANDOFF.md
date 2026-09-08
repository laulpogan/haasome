# Handoff: a gallery of places to learn and remember

## Direction

Haasome is a library of explorable Gaussian-splat places. Each place has a small
set of objects, source-backed notes or selected memories, and a recall/revisit loop.
**Fragments of an Emperor is the first ready entry.** Keep that experience working
while adding others. The next UI milestone is a gallery that opens these experiences.
The gallery itself is not implemented in this handoff.

Start from **`origin/release/museum-demo`**, in an owned branch/worktree. Do not
start from the old default `setup/memory-palace`; it is an early scaffold. Do not
merge default. The coordinator reconciles app changes.

## Labels the gallery must use

| Status | Meaning and action |
| --- | --- |
| Ready | Licensed asset prepared; real viewer, object selection, recall and capsule reopen verified. Show **Explore**. |
| Candidate | Promising concept or asset listing; not yet a tested experience. Show **View proposal**, never Explore. |
| Rights unresolved | Underlying asset permissions or attribution incomplete. No download or scene launch. |
| Capture experiment | Real reconstruction with visible quality limitations. Keep separate from ready educational tours. |

Also show scene origin (**licensed modern scan**, **personal capture**, or
**generated setting**) and attachment method (**curated regions** or **verified
recognition**). Status, origin and attachment method describe different things.
Never turn curated labels into an automatic-recognition claim.

## Seed collection

These candidates come from the prior bounded asset review, not a new full audit.
Only Constantine was downloaded and inspected in the real viewer. Recheck exact
rights, identity and bytes before promoting any other entry.

| Entry | Status now | Proposed experience | Next gate |
| --- | --- | --- | --- |
| Fragments of an Emperor — Capitoline courtyard | **Ready** | Head, hand and foot; identity, restoration and construction; three source notes and recall | Preserve `?tour=capitoline`, attribution and portable replay. |
| A History of Personal Computing — RE-PC Computer Museum | **Candidate; recommended next** | Three distinguishable machines, what changed between them, one recall cue per machine | Confirm scanned machine identities, source facts and exact licensed asset. Similar-looking machines need care. |
| Tools of a Firehouse — museum exhibit | **Candidate** | Three tools and the jobs they served | Trace original model/collection rights; verify object identities. Listing describes a reconstructed exhibit, not a photographed historic firehouse. |
| A Mission in Objects — lunar lander | **Rights unresolved** | Landing, life support and communications | Prior listing offered no downloadable license. Find a permitted asset before implementation. NASA facts do not license another creator's model. |
| Inside a Wartime Bunker | **Rights unresolved** | Equipment, construction and daily use | Prior asset cited an Unreal source; underlying rights and WWII association were not established. Do not invent a battlefield or soldier identities. |
| Austin trip — a room to remember | **Capture experiment; private** | Five selected trip memories in a reconstructed room | Capture remains rough. Keep private and outside the public ready gallery. |

Source listings from the completed candidate review:

- [Capitoline courtyard](https://superspl.at/scene/5ab604fa)
- [RE-PC Computer Museum](https://superspl.at/scene/04ff1ba2)
- [Fire House Museum Exhibit](https://superspl.at/scene/561345ca)
- [Moon Lander](https://superspl.at/scene/797f5c99)
- [Bunker](https://superspl.at/scene/55792704)

Detailed Constantine attribution, pinned asset hashes, museum sources and actual
verification: [museum handoff](FALLBACK-DEMO.md). Its title still says fallback
because it records how the route was developed; it is now the main demo.

## Work split

### sbardacosta-code: content and first-time walkthrough

Own only `docs/LIBRARY-CANDIDATES.md` on a new branch. No app code, GPU work,
credentials or private media. Prepare four short gallery-card drafts: Constantine,
computer museum, firehouse and one rights-unresolved concept. Each needs a title,
one-sentence learning promise, status, scene origin, source link and exact missing
gate. Use placeholders for thumbnails until rights are verified. Then run the
Constantine README setup and report where you get stuck. An issue comment is enough
if setup is blocked; do not invent a successful run.

Copy-paste goal:

```text
Read README.md, docs/GALLERY-HANDOFF.md and docs/FALLBACK-DEMO.md on
origin/release/museum-demo. Help me prepare four concise gallery-card drafts in
docs/LIBRARY-CANDIDATES.md only. Explain each step as to a beginner. Constantine
is ready; all other entries keep their documented candidate or rights-unresolved
status. Do not download unverified assets or make claims about unseen objects.
Then guide me through the existing Constantine viewer and record only what I
actually observed. Commit and push my owned document on a new branch; do not merge.
```

### Coordinator or one frontend writer: gallery

Own `apps/palace/` in a separate branch. Reuse this viewer and capsule importer.
Implement one gallery page with the ready Constantine card and clearly separated
candidate proposals. Clicking Explore opens the existing tour. Add a visible return
to gallery. Preserve direct tour URLs, saved local capsules and file import.
Do not load every scene on gallery entry. Use small permitted thumbnails and fetch
only the chosen scene. Keep empty/offline/missing-asset states clear.

Move tour selection out of the single hard-coded Constantine dispatch into a small
local catalog only when the gallery consumes it. Keep each tour's existing palace
bundle, hash, provenance, regions and source notes together. No new backend,
accounts, model service or dependency is needed for this milestone.

Finish line: gallery → Constantine → actual surface selection → recall → freeze
→ fresh reopen → return to gallery, observed in the production build. Candidate
cards cannot launch missing assets. Verify console, required requests and a phone
layout. Push a reviewed unit; preserve the current tour as a regression case.

### Next scene owner: one public tour

Start with the computer museum candidate after its rights and object-identity gates
pass. Own one tour's metadata, evidence notes and ignored assets; coordinate any
renderer changes with the single frontend writer. Deliver three useful objects,
permitted source facts, actual surface selections, scene hash and camera poses,
portable reopen proof, and clear curation labels. Do not start four new scenes at
once. No GPU job is required if a licensed ready splat is available.

## Where recent work lives

| Branch | Contents |
| --- | --- |
| `release/museum-demo` | Current presentation route, gallery handoff and teammate starting point. |
| `work/curated-spatial-demo` | Euler's verified museum implementation (`affeb0f`). |
| `integration/demo-polish` | Personal pipeline integration, native training and manual object-memory sidecar. |
| `work/room-quality-native` | Latest quality comparisons, limitations and capture requests. |
| `work/object-memory-surface` | Manual geometry binding milestone; automatic recognition unfinished. |
| `work/selected-context-austin` | Selected-context and offline timeline handoffs; private assets ignored. |
| `integration/one-chapter` | Original functional Austin capture/capsule baseline. |

Recent work is preserved across these branches, not merged into default. Do not
blindly merge the two viewer implementations: the museum uses `curatedTour` boxes
and guided poses; the personal lane uses `objectMemory` surface samples. Both bind
to scene bytes, but they have different validation and interaction semantics.
Unifying them is a later deliberate integration task, not a prerequisite for the
first gallery. Scene changes require bindings to be checked again.

Large splats, portable capsules, personal media and screenshots stay outside Git.
The release's preparation script fetches/verifies the public asset for teammates.
Museum notes are manual curation; Austin's actual computer-use evidence is a separate
experiment. Neither automated walkthrough timings nor UI tests prove learning gains.
