# Main demo: Fragments of an Emperor

Use `release/museum-demo`. Start at `http://127.0.0.1:4193/?tour=capitoline` after
the README setup. For the library introduction, start at `?gallery` and Explore
Constantine; four other entries are proposals. The worker's existing port 4189
remains a tested local backup.
Preload the courtyard and wait until the actual scene appears; decode-ready text
can precede the first sorted GPU frame.

## Proposed 90-second route

1. Courtyard: explain that knowledge can be attached to a place.
2. Select the head: show its saved museum note and source link.
3. Select the hand: introduce the distinction between artifact and restoration.
4. Select the foot: show the third object and its note.
5. Begin recall on the hand. Its detail stays hidden until the hand surface is visited.
6. Click the visible hand, reveal the saved detail, then end recall.
7. Reopen the prepared frozen capsule and revisit the same object.

Suggested narration, pending spoken rehearsal:

> Haasome gives knowledge a place. This is a licensed scan of a museum courtyard.
> We attached three source-backed notes to the objects you can see.
>
> Start with the head: it gives us an identity. Move to the hand: its note separates
> the surviving artifact from a later restoration. The foot gives us a third cue.
> Each object keeps its museum source beside the explanation.
>
> Now hide the hand's detail. Visit its surface, then reveal what the saved note
> says. The place becomes a way back to the information.
>
> Freeze the chapter and reopen it: the scene and notes travel together. These
> regions are curated. Our broader vision brings the same interaction to familiar
> rooms and selected personal memories. Haasome: a place to remember.

Do not call this automatic recognition or claim measured improvement in memory.
The modern scan is not a reconstruction of ancient Rome. Keep CC BY attribution
visible. The museum catalogs are sources, not endorsement of this app.

## Rehearsal checks

Use the exact release build and capsule. Visit all three surfaces; reveal each
matching note. Test background misses, recall/reveal, freeze, fresh browser import,
and device save/reload. Inspect the settled image and browser errors. Run the
spoken route twice and record actual duration; automated action timings are not
spoken timing. The collaborator owns that report in GitHub issue #1.

Worker verification at affeb0f covers three real surface clicks, recall, freeze,
fresh-process reopen without original bundle requests and identical capsule
re-download. Coordinator also verified device reload and inspected the settled
courtyard. Full source, asset hashes and evidence paths: [museum handoff](FALLBACK-DEMO.md).

Release replay at `2f2b1ac` passed on port 4193 on September 8: all three
surface targets, recall, freeze, fresh-process reopen, identical re-download,
mobile width and zero browser/network errors. A separate save/reload check restored
all three places and the hand note without page errors. The reopened courtyard
image was inspected. Local evidence: `artifacts/fallback/proof/verification.json`
and `device-reload.json`; large capsules and screenshots remain ignored.
The 1.7-minute automated test duration is not spoken presentation timing.

Integrated gallery replay at `e350cb0` also passed on port 4193 (51.1 seconds):
no scene/WebGL on gallery entry, three surface selections, recall, freeze, fresh
reopen, gallery return and saved-palace restore; zero console/network errors.
The gallery was also opened and inspected in native Chrome through computer use.
This launch does not establish computer-use collection of museum notes.

## Fallback order

1. Current release viewer with its prepared public bundle.
2. Worker preview on port 4189 and its frozen museum capsule.
3. Local `artifacts/fallback/recording/automated-museum-walkthrough.mp4`: a
   95-second silent automated walkthrough (5.6 MB), with initial loading trimmed.
   Interaction timing and the freeze/reopen wait are retained. Tell the audience
   this is recorded playback, not live computer use or a spoken rehearsal.
   The reopened hand note and sampled video frames were inspected; page errors
   were empty. This local video is ignored by Git and does not ship with a clone.
   Screenshots under `artifacts/fallback/proof/` are another local backup.

The Austin personal capsule and private offline timeline remain separate evidence
of the original vision. They are not needed to run or distribute this public demo.
Do not upload private Austin assets when sharing the museum release.
