# Fragments of an Emperor

A three-stop learning journey in a genuine Gaussian splat of the Capitoline
Museum courtyard. Click Constantine's head, restored hand and colossal foot;
read a museum-backed detail; revisit its object to reveal it during recall.
This independent fallback uses public, manually curated material. It makes no
personal-capture, automatic-recognition or improved-memory claim.

Branch: `work/curated-spatial-demo`, based on `fd88405`. Implementation commit:
`de44e3a`. The following evidence commit changes only the test and this handoff.
Main/default and other worktrees were not edited.

## Decision

Scores are curator judgments on a 1–5 scale, not measurements or calibrated
confidence. Columns: usable licensed splat now; object clarity; primary facts;
learning story; demo value; setup ease. Rights are a hard gate regardless of sum.
Only the winner was downloaded and rendered locally. Alternative fidelity
scores remain provisional, based on their primary asset listings.

| Concept and concrete asset | Licensed / objects / facts / story / demo / ease | Decision |
| --- | --- | --- |
| Archaeology: [Capitoline courtyard, artfletch](https://superspl.at/scene/5ab604fa) | 5 / 5 / 5 / 5 / 5 / 4 = 29 | **Winner.** CC BY 4.0, 68.77 MiB published components, named artifacts and official object catalogs. Modern photographed scene; close views verified in Spark. |
| Computer nostalgia: [RE-PC Computer Museum, tosolini](https://superspl.at/scene/04ff1ba2) | 5 / 5 / 4 / 5 / 4 / 4 = 27 | Strong runner-up. CC BY 4.0, 44.98 MiB, PortalCam scan and creator-provided SPLAT link. More work to distinguish similar machines and establish each scanned model. |
| Firefighting museum: [3D Fire House Museum Exhibit, ethan3111](https://superspl.at/scene/561345ca) | 4 / 4 / 4 / 4 / 4 / 3 = 23 | CC BY 4.0, 67.29 MiB; reconstructed exhibit trained from a linked museum model. Requires tracing the underlying collection/model and artifact identities. Not a photographed historic firehouse. |
| Apollo: [Moon Lander, walhargohar](https://superspl.at/scene/797f5c99) | 1 / 5 / 5 / 5 / 5 / 1 = 22 | Rights gate failed for this task: no download/license offered on the inspected listing. It is a rendered Unreal/Mission AR reconstruction, not lunar photography. NASA facts alone cannot clear model rights. |
| WWII battlefield/artifacts: [Bunker, walhargohar](https://superspl.at/scene/55792704) | 2 / 3 / 4 / 4 / 4 / 1 = 18 | The 13.53 MiB splat says CC BY 4.0, but identifies only an Unreal source scene. Original scene rights and a WWII association were not established. No invented soldier identities or historical setting. |

The existing seating-quality and table-tennis-room assets were considered as
available technical fallbacks. Neither supplies this historical artifact story;
neither was substituted for the museum. No training, generation credits, new
dependency or remote GPU job was needed.

Primary sources were read on 2026-09-08. Source tier P: creator asset listings
for provenance, official museum catalogs for historical claims. Numerical trust
priors are `[TBD: verify]`; none were invented. Candidate scores above express
selection preferences, not source probabilities. This was a bounded asset search,
not an exhaustive market survey.

## Attribution and exact bytes

**Capitoline Museum Courtyard — artfletch**, [source](https://superspl.at/scene/5ab604fa),
[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
The creator reports 987 photographs taken in February 2026 with a Sony a7R V,
processed in RealityScan and Postshot. This is a modern scan of displayed ancient
artifacts, not a reconstruction of ancient Rome. Visitors are not identified.
No museum endorsement is implied.

The original published SOG components were repackaged into a deterministic ZIP
SOG. No training, mesh conversion or generated still is involved. A 180-degree
X display rotation makes the scan upright in Spark. Scene-local regions and
camera poses were added by a curator. Each runtime load hashes the actual bytes
before enabling the region interaction.

- Gaussian count in original metadata: **4,998,324**.
- Packaged asset: **72,114,959 bytes**.
- SHA-256: `b58988bd19ff2001b69b9454e5c069c99b6b5db964b1b5ab2b85359ccd57f6dc`.
- Per-component source URLs, byte counts and SHA-256:
  [asset-verification.json](../apps/palace/curated/asset-verification.json).
- The preparation script checks the exact asset page's license before downloading,
  rejects changed bytes and preserves attribution in the palace and reading notes.
- Asset/license page captures live under ignored `artifacts/fallback/research/`.
  Large media and capsules are not committed.

## Three useful memories

1. **Head → identity.** Constantine's official image; catalog date 313–324 CE;
   surviving head 260 cm high. [Museum object catalog](https://museicapitolini.org/en/opera/statua-colossale-di-costantino-testa).
2. **Hand → restoration.** The raised finger is a modern addition; a sceptre is
   the museum's probable interpretation, retained as uncertain.
   [Museum object catalog](https://www.museicapitolini.org/en/node/2695).
3. **Foot → divinity and construction.** Feet over two metres long; bare feet
   evoke a god; metal supports held the mixed-material statue together.
   [Museum object catalog](https://www.museicapitolini.org/en/node/1014233).

The capsule carries concise paraphrased reading notes and the original source
links. Those notes are labeled manual curation, not source screenshots or
computer-use capture. Historical dimensions come from the catalog; scene units
are not a physical measuring instrument.

## Run and adopt

From this worktree:

```sh
cd apps/palace
npm ci --ignore-scripts
python3 scripts/prepare-fallback.py
npm run build
npm run preview -- --port 4189
```

Open **http://127.0.0.1:4189/?tour=capitoline**. The explicit tour URL starts a
new public draft without overwriting saved device storage. For development use
`npm run dev -- --port 4189`. To restore a saved palace or import a capsule, open
**http://127.0.0.1:4189/** without the tour query.

Use the three buttons for guided close views or click the marble surfaces.
Begin recall hides the selected object's detail. Visit its surface, then choose
“Reveal memory & source.” Freeze downloads one portable JSON container. In a new
browser, open the base URL and import that file. Source websites are only needed
when opening the catalog links, not for the saved scene or reading notes.

The ordinary scene/anchors/memories and capsule format stay intact. Optional
`curatedTour` metadata carries three scene-local boxes, camera poses and the
scene hash. Older consumers can read the standard palace content; the region
interaction needs this viewer change. No shared-contract or other-lane files
were changed. The public asset is installed through an ignored symlink;
Vite copies it into the production build. Keep the binary out of Git.

## Verification and artifacts

Production-browser verification command:

```sh
PALACE_BASE_URL=http://127.0.0.1:4189 PALACE_CURATED=1 npx playwright test tests/curated.spec.js --reporter=line
```

Artifact root: `/Users/laul_pogan/Source/haasome-fallback/artifacts/fallback/`.

- Asset: `bundle/capitoline.sog`; importable draft: `bundle/palace.json`.
- Portable capsule: `proof/capitoline.capsule.json`.
- Screenshots: `proof/01-courtyard.png`, `proof/02-head.png`,
  `proof/02-hand.png`, `proof/02-foot.png`, `proof/03-recall-revealed.png`,
  `proof/04-fresh-browser-reopen.png`, `proof/05-mobile.png`.
- Machine-readable observed outcomes: `proof/verification.json`.

Observed on the production build on 2026-09-08, at 20:47 UTC:

- Six contract/unit tests passed; Vite production build passed. Its existing large
  JavaScript bundle warning remains.
- The real-scene Playwright test passed in 3.3 minutes. Head, hand and foot were
  selected by canvas clicks through Spark raycasting, with the correct note and
  region highlight. A bare-wall click selected no object.
- Recall hid the detail, required visiting the hand and then revealed the note.
- Freeze included exactly four assets: the 72,114,959-byte SOG and three reading
  notes. A fresh Chromium process imported the single file with requests to the
  original bundle blocked. All three surface clicks still worked.
- Re-downloading from that fresh browser produced a byte-identical capsule.
  Capsule size: 96,162,004 bytes; SHA-256:
  `b14f2ddf2e82d001d23365060d4d93e41a0c96875fb4d8a7d9b4119ab924eeab`.
- Frozen controls were disabled; device save succeeded. A 390px viewport had no
  horizontal document overflow. Desktop and mobile screenshots were inspected.
- Console errors: **0**. Failed requests: **0**. Original-bundle requests during
  fresh-browser import: **0**. No native browser or foreground app was used.

The first broad run timed out after fresh-browser round-trip and device save,
while reaching an extra reload check under severe host contention. The final
bounded test uses raw file hashes instead of another 96 MB JSON comparison and
omits that extra reload. Device reload is **not verified in this run**; portable
reopen is verified. No application change was needed after the visual check.

## Boundaries

Regions are manually placed boxes, not masks or automatic object recognition.
The nearest visible Spark raycast hit is converted to scene-local coordinates;
no stable per-splat identity is assumed. Boxes can include nearby background;
extreme viewpoints and free navigation can expose scan holes or floaters. The
curated close views are the presentation path. Keyboard navigation uses the same
object notes and poses. A fresh browser still needs the viewer application;
the capsule carries its scene and evidence, not an executable app.

The work proves an educational interaction and byte portability, not human
learning gains, historical omniscience, or the personal-capture team's goal.
Catalog links need internet. Mobile screenshots do not establish phone GPU
performance. Host load during this run was severe, so load times are observations
from this machine, not a benchmark. Human rehearsal remains the collaborator's lane.
