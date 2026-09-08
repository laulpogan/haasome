# Lane C: native WhatsApp computer-use trial

## Latest expanded delivery

Use `services/memory/bundles/austin-trip/`: four English cards, three original
photos and one short MP4. It includes the original corner-kick record unchanged.
The new media were exported through WhatsApp UI; their records conservatively use
`manual` packaging because no new context screenshot was successfully saved.
See the bundle README for provenance, import instructions and remaining checks.
Do not import both versions together.

## Original capture outcome

The agent browsed a presenter-selected travel group in WhatsApp for Mac, inspected
its media gallery, opened selected photos and read their captions and message
timestamps. It then saved one original photo, saved an actual source-UI screenshot,
and exported a real `computer-use` memory bundle. The viewer's existing memory
validator accepts the record. Actual viewer import and recall remain unobserved.

The useful product interaction is: **find a source-backed memory in an existing
app, propose a recall cue, and attach the resulting record to the palace**.
The current reconstruction/technical-lesson demo can remain the main story; this
is the presenter-requested personal-memory input trial, using the same contract.

## Observed scope and findings

- The selected gallery reported 109 photos and 62 videos. A thumbnail-level pass
  covered the gallery from its latest posts to its beginning. Only selected photos
  were opened at full size; videos were not fully played and the full message
  history was not read.
- Captions distinguished earlier tournaments and a later trip from the selected
  trip. Group membership alone does not establish where a photo was taken.
- A presenter-authored caption supported one concrete match memory. The caption,
  rather than face recognition, supplied the named person and event context.
- Other candidates included a team photo, a planned match schedule, arrival and
  jerseys, and a table-tennis tournament. A planned schedule is not a match result;
  a message timestamp is not necessarily a photo's capture time.
- Several clips showed the same table-tennis room. Lane B may assess that material
  privately for reconstruction coverage; no reconstruction-ready dataset or splat
  has been established by this trial.

The presenter explicitly authorized publishing the selected photo, source-UI
screenshot and memory record in `bundles/austin-corner-kick/`. Broader discovery
notes remain in the presenter's ignored `artifacts/memory/` directory.

## Capture and packaging procedure

1. In the running native app, verify the presenter-selected group header.
2. Open **Media, links and docs** for that group only. Browse photos and captions.
3. Open a chosen image; verify its caption, sender label and timestamp.
4. Save a local copy of the chosen media and an actual screenshot of the source
   UI with its context. Record the current capture time in UTC, separately from
   the message timestamp. Verify saved files by opening them.
   In this trial, WhatsApp's **download → Save as…** saved the original JPEG.
   The agent used Preview's **File → Take Screenshot → From Entire Screen**,
   brought the selected WhatsApp media viewer into view during the countdown,
   visually checked the captured caption/date, and saved the result locally.
   Native menu actions worked when the menu was read and selected in the same
   tool invocation. System screenshot keyboard shortcuts alone did not yield a
   verified file in this environment.
5. Write title/body/cue from observed source content. Retain uncertainty and
   attribute claims to captions where applicable.
6. Use the existing exporter; do not change the shared contract:

```sh
python3 services/memory/export_memory.py --help
```

For a real observed capture, supply `--kind computer-use`, `--observed-capture`,
`--evidence`, `--media`, `--captured-at`, `--app`, `--locator`, `--title`, `--body`,
`--cue`, and an unused `--output artifacts/memories/<chosen-name>` directory.
The attestation flag describes an observation; it does not create proof by itself.

7. Give A the entire output folder (`memories.json` **and** `assets/`).
   Import it through the existing viewer memory-bundle flow, attach it to an anchor,
   and observe source reveal, recall and reload. Do not call this step complete
   merely because the JSON validates.

No new dependencies, source-app writes, model API jobs, or generic scraping service
are needed for this bounded trial. The existing exporter packages captures; it
does not automate WhatsApp navigation.

## Reproducible handoff

- **Commit:** the commit containing this file on `codex/tito-whatsapp-handoff`;
  obtain its exact ID with `git log -1 --format=%H -- services/memory/WHATSAPP_HANDOFF.md`.
- **Base:** `integration/first-palace` at `3bd307e`.
- **Start command:** exporter help above. Native discovery starts in the running
  WhatsApp app; no standalone automation start command is claimed.
- **Input:** one presenter-selected group and selected visible media/captions;
  actual saved local evidence/media are required for packaging.
- **Published output:** this report and `services/memory/bundles/austin-corner-kick/`,
  containing `memories.json`, the original JPEG, the source-UI evidence JPEG,
  a SHA-256 asset manifest and English import instructions.
- **Import:** check out this branch and choose the entire `austin-corner-kick`
  folder with **Open bundle** after choosing a place in A's viewer.
- **Private notes:** `artifacts/memory/austin-review.md` and
  `artifacts/memory/austin-handoff-en.md` in the presenter's project checkout.
- **Observed result:** real UI navigation, photo save, screenshot save, export of
  one source-backed record and its two assets. The screenshot was visually checked
  in Preview. No result or personal feeling was invented beyond the source caption.
- **Capture timestamp:** source screenshot observed in the 19:24 UTC minute on
  September 8, 2026; the record uses `19:24:00Z` with minute precision, not a claim
  of second-level timing. The original message date is separate in the locator.
- **Remaining integration:** A's actual viewer import, scene consumption, evidence
  reveal and recall/revisit loop. The source-file export blocker is resolved.
- **Validation:** existing `validateMemories` from `apps/palace/src/contract.js`
  passed for the actual exported record; all referenced files exist and are
  nonempty; original and copied asset hashes match. The transfer ZIP was checked.
  No product code changes, new dependencies or synthetic capture claims.

This selected bundle is published at the presenter's explicit request. Broader
group material and local discovery notes remain outside Git. The coordinator
decides whether this input is used in the final demo.
