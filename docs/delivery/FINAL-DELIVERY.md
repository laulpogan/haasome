# Haasome — final Austin MVP handoff

Implementation commit: `762b3dc6d211fb1c3b92ab4a88fc0291e913cefa` on `codex/tito-museum-demo`.

Source: https://github.com/laulpogan/haasome/tree/codex/tito-museum-demo/apps/palace/native-apple

## Run

On the presentation Mac, double-click the prepared private copy at `artifacts/final-delivery/Haasome Austin.app`. It includes the three selected media files and needs no terminal. A local ZIP is at `artifacts/final-delivery/Haasome-Austin-MVP.zip`. Neither package nor personal media is stored in Git.

From source: `zsh apps/palace/native-apple/build.sh`, then `zsh apps/palace/native-apple/run.sh --media /path/to/selected/austin/media`.

Input: `memory-0.jpg` (Martín's goal photo), `memory-4.mp4` (MIT save clip), `memory-1.jpg` (team photo). These are the presenter's selected trip files. The initial place comes from the selected field photo's GPS; initial memory positions are approximate cues.

Output: native Apple Maps memory experience with three pins/cards, photos/video, explore/reveal, editable notes, saved placements, and an orbit control. Default saved state: `~/Library/Application Support/Haasome/palace-state.json`. Use `--state` to choose a different local file.

## Observed verification

On the presentation Mac on September 8, 2026:

- Real Apple Flyover imagery loaded for the Austin field, with terrain, buildings and trees in relief.
- All three memories opened from their cards. Selecting a map pin reopened the memory after Explore hid it.
- The match video played through its 7.8-second timeline.
- Orbit changed the camera viewpoint around the actual field.
- A test note and a changed anchor coordinate were written to JSON. After quit/reopen, the saved note appeared again and saved placements were restored.
- The final bundled app opened without media arguments, showed its selected photo and clean presentation state, and cleared its loading message.
- Swift compilation, ad-hoc signing verification and Git whitespace checks passed. Private output is ignored by Git.

The verification used a separate state file. It does not populate the user's presentation with test notes.

## Record now

Tito records the one-minute video himself. `ONE-MINUTE-SCRIPT.md` contains 118 English words and the screen actions. Let the map settle before starting. Use Orbit briefly, open the goal, play a short part of the save, show the team and saved words, then finish on the field.

## Remaining delivery

Tito must record the video, provide an accessible video URL and review/submit the project text. `SUBMISSION-DRAFT.md` contains the proposed description and OpenAI usage explanation. `MERT-HANDOFF.md` contains text Tito can send to Mert for the landing page. No messages, video upload or submission were sent automatically.

This MVP is native macOS. Mert can showcase the video on the website; the native Apple map cannot be placed in a web iframe. Apple provides the 3D map. Computer use happened during selected source capture in Codex; the app consumes those local outputs. No runtime Astra API, automatic reconstruction, or complete personal-library ingestion is claimed.
