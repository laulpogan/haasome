# WhatsApp memory bundle — ready for viewer import

Title: **A smile before the corner kick**

This bundle contains a real photo exported from the presenter-selected WhatsApp
group, a screenshot of the visible source image/caption/date, and one English
memory record produced with the existing lane C exporter.

## Import on the demo machine

1. Check out branch `codex/tito-whatsapp-handoff`; this folder contains the complete bundle.
2. In the palace viewer, load B's scene and select a place.
3. Click **Open bundle** and select this entire `austin-corner-kick` folder.
4. Confirm the card shows the photo and source evidence.
5. Try **Begin recall**, visit the place, and reveal the answer.

The record passed A's existing `validateMemories` function. This is not a claim
that the UI import, scene render or recall loop has been observed for this bundle.

## Provenance and limitations

- Source: WhatsApp for Mac, Austin Soccer Trek 2026, photo sent by “You” on
  February 22, 2026 at 5:12 PM as displayed by WhatsApp.
- The named person and corner-kick detail come from the presenter's caption;
  faces were not identified by the agent.
- Evidence: real source-screen capture made through Preview's native screenshot
  menu while WhatsApp displayed the selected image and caption. Saved as JPEG.
- Capture time has minute precision: September 8, 2026, 19:24 UTC.
- The source screenshot includes the visible system chrome and media strip.
- `manifest.json` inventories the memory JSON and referenced assets by bytes/hash.
- The presenter explicitly authorized publishing this selected photo, source
  screenshot and memory bundle to GitHub. Other group material is not included.
- No Gaussian splat or reconstruction is included.

Public instructions and status are on branch `codex/tito-whatsapp-handoff` in
`services/memory/WHATSAPP_HANDOFF.md`. The selected assets are included alongside this README.
