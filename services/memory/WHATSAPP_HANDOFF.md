# Lane C: native WhatsApp computer-use trial

## Outcome

The agent browsed a presenter-selected travel group in WhatsApp for Mac, inspected
its media gallery, opened selected photos and read their captions and message
timestamps. This establishes a real native-app read path. It does not yet establish
an unattended capture service or a completed viewer integration.

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

Private captions, identities, group title, photos and screenshots are deliberately
not embedded in this public handoff. The detailed source locators are retained in
the presenter's ignored `artifacts/memory/` directory.

## Capture and packaging procedure

1. In the running native app, verify the presenter-selected group header.
2. Open **Media, links and docs** for that group only. Browse photos and captions.
3. Open a chosen image; verify its caption, sender label and timestamp.
4. Save a local copy of the chosen media and an actual screenshot of the source
   UI with its context. Record the current capture time in UTC, separately from
   the message timestamp. Verify saved files by opening them.
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

7. Give A the entire private output folder (`memories.json` **and** `assets/`).
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
- **Public output:** this workflow and observed-status report.
- **Private notes:** `artifacts/memory/austin-review.md` and
  `artifacts/memory/austin-handoff-en.md` in the presenter's project checkout.
- **Observed result:** real UI navigation, gallery inspection and selected full-size
  image/caption reads. UI screenshots are visible in the agent conversation.
- **Remaining blocker at this revision:** export of independent photo/evidence files
  is not yet verified. Native menu attempts did not yield a confirmed saved file,
  and user activity interrupted subsequent app actions.
- **Remaining integration:** valid real-capture bundle, A's actual viewer import,
  scene consumption, evidence reveal and recall/revisit loop.
- **Validation:** documentation paths and existing exporter CLI checked; no product
  code changes or new dependencies in this handoff. No synthetic test is presented
  as computer-use evidence.

Keep all private bundles outside Git. Transfer selected assets through an approved
private channel or directly on the demo machine. The coordinator decides whether
this input is used in the final public demo.
