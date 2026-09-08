# Haasome — give knowledge a place

**Presentation branch: `release/museum-demo`.** Explore a real Gaussian splat of
the Capitoline courtyard, visit three marble artifacts, and recall a museum-backed
detail through its object. Freeze the chapter and reopen it with its scene and notes.

The presenter chose this route after reviewing the personal-room reconstruction.
The museum scan is licensed CC BY 4.0; regions and notes are manually curated.
No automatic recognition, historic-scene reconstruction or measured learning gain
is claimed. See [attribution and verification](docs/FALLBACK-DEMO.md).

## Run

From this branch's repository root:

```sh
cd apps/palace
npm ci --ignore-scripts
python3 scripts/prepare-fallback.py
npm run build
npm run preview -- --port 4193
```

Open **http://127.0.0.1:4193/?tour=capitoline**. The preparation script fetches and
verifies the licensed 72 MB scene; GPU training and credentials are not needed.
The tour URL starts a new public draft. Use the base URL without the query to
restore device storage or import a frozen capsule.

The presentation Mac also has the original verified worker preview at
**http://127.0.0.1:4189/?tour=capitoline**. Localhost addresses work only on the
computer running the server. Remote teammates can follow the commands above.

## Demo

Head → hand → foot → recall the hand's detail → revisit its surface → reveal source.
Use **Freeze capsule** to download the portable chapter; **Import files** reopens
it in a fresh viewer. **Save on this device** stores only in the current browser.
The app is still required to render a downloaded capsule.

See [the current runbook](docs/DEMO.md). The three artifacts have actual surface
picking, source notes and guided close views. Free navigation can expose scan gaps;
use the verified stops for the presentation. Source websites require internet,
but saved notes and scene travel inside the capsule.

## Next: a gallery of splat experiences

Read [the gallery handoff](docs/GALLERY-HANDOFF.md) for ready/candidate labels,
similar concepts, beginner-friendly prompts and file ownership. Constantine is the
first ready entry; the gallery and additional tours are the next work, not shipped
capabilities.

## Collaboration and preserved work

- Coordinator owns this release branch and presentation fixes.
- sbardacosta-code owns narration and first-time rehearsal feedback in
  [issue #1](https://github.com/laulpogan/haasome/issues/1).
- [Issue #2](https://github.com/laulpogan/haasome/issues/2) tracks technical handoffs.
- `integration/demo-polish` preserves native-resolution room training and manual
  geometry bindings with the Austin memories. Recognition remains unfinished there.
- `integration/one-chapter` preserves the original personal-capture MVP.

The personal vision remains: selected app context and photos become memories in a
familiar place. The prepared trainer reconstructed the selected short room clip,
but its moving subjects and limited coverage left the scene too rough for the
main demo. Keep that evidence separate from this licensed museum route.

Work in owned branches; do not merge default without instruction. Keep private
media, credentials, model weights and large scene artifacts outside Git.
