# Memory bundle exporter

Package one selected memory and its local evidence/media for lane A's file import.
Python standard library only; run from repository root. No source app automation
or model API is installed. This CLI packages operator-supplied content.

```sh
python3 services/memory/export_memory.py \
  --title 'The story behind the desk' \
  --body 'A selected detail, checked against its source.' \
  --cue 'What happened at the desk?' \
  --app 'Selected source app' \
  --locator 'Visible source title or URL' \
  --captured-at '2026-09-08T18:00:00Z' \
  --kind manual \
  --output artifacts/memories/desk
```

Import `artifacts/memories/desk/memories.json` and its `assets/` files in the viewer.
Repeat `--media /absolute/path/to/selected-image.jpg` to include selected media.
`--evidence /absolute/path/to/screenshot.png` adds source evidence. Output paths use
generated identifiers, and existing bundles are refused. Originals are copied,
never moved. Keep generated bundles out of Git.

## Actual computer-use handoff

1. The operator/agent reads an allowed source app through its visible UI.
2. Capture its relevant visible state to an allowed local screenshot.
3. Check the proposed memory against that evidence; retain source title/locator.
4. Run the exporter with the actual capture time, `--kind computer-use`,
   `--evidence <screenshot>`, and `--observed-capture`.
5. Import that bundle into A's viewer and attach it to a locus.

The flag is an operator attestation, not independent verification. A screenshot's
existence cannot prove an autonomous action or the truth of the supplied caption.
Use `fixture` for synthetic checks; use `manual` for manually supplied memories.
The exporter checks local file existence/type extension, not media decoding; the
viewer must reject undecodable media and render supplied text as text.
