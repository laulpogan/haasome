# Lane B: licensed sample room

For selected room photos/video and the private trainer, see the
[capture runner](RECONSTRUCTION.md). Raw registration remains a separate gate
from the verified posed-data training and licensed sample below.

For an authorized local Marble SPZ/PLY export, use the [Marble import runbook](MARBLE.md).
It emits the same `scene.json` handoff with `kind: generated`; coordinator must
land that provenance support in the viewer. The licensed fallback below is unchanged.

Fetch and package the selected Table Tennis Room with Python 3's standard library:

```sh
# From repository root:
python3 pipelines/scene/fetch_sample.py
```

Input: six pinned resources in `sample-manifest.json`, fetched from the scene's
CloudFront directory. Payload total: 14,955,138 bytes. No trainer, GPU job,
package installation, account, or paid API is used. Network reads have a 30-second
timeout per resource. Any size/hash mismatch aborts before publishing the asset.

Output bundle root:
`artifacts/scene/table-tennis-room/` under the current repository checkout.

- `table-tennis-room.sog`: ZIP with `meta.json` and five WebP payloads at its root.
- `scene.json`: producer's scene object, using contract v0 plus `schemaVersion: 0`.
- `ATTRIBUTION.txt`: credit to keep with the file and display in the viewer.
- `provenance.json`: source links, member hashes, archive hash, decoded bounds,
  splat count, and verification limits.

The whole output is ignored by Git. Reruns refuse to replace an existing asset or
scene JSON; move the old output aside first if a new fetch is needed. Temporary
downloads are removed on failure. `scene.template.json` is the contract shape:
the script replaces its placeholder position, scale and camera using source bounds.
Use the generated `scene.json` for import.

## A/coordinator import

Copy the four output files together through the approved asset channel. Import
`scene.json` and supply `table-tennis-room.sog` as the asset at bundle-root-relative
path `table-tennis-room.sog`. If A serves it under another directory, coordinator
must update `scene.asset` to that bundle-relative path. Do not import unpacked
`meta.json` as the scene asset. A assembles this scene with A-owned anchors and
C-owned memories; this producer does not invent either.

Apply the quaternion `[0, 0, 1, 0]`, scale and translation to geometry only. Camera
and target already use world coordinates. The provisional Z half-turn follows
the secondary catalog's viewpoint; it is not verified orientation evidence.
The script inverts SOG v2's signed-log bounds, centers the rotated bounding box,
sets its largest extent to 10 scene units, and normalizes the secondary catalog's
room-facing camera/target into that same world. Full bounds include outliers,
so they establish normalization, not a room-sized camera fit. Start at the catalog's
75-degree vertical field of view. Scale its 0.05 near clip by the scene scale
(about 0.00146); a near clip of 0.1 can cut through this normalized room.
Adjust navigation speed/camera and confirm floor direction,
room visibility and clipping in A's viewer before freezing transform and placing
five loci. Units are not meters. No preview or live viewer proof is claimed.

## Provenance and verification

Primary source checked 2026-09-08: [Table Tennis Room by Ethan (ethan3111)](https://superspl.at/scene/0d9e613b)
lists CC BY 4.0. [License](https://creativecommons.org/licenses/by/4.0/) permits
sharing/adaptation with credit, license link and changes noted. Keep that credit
visible in the sample demo and preserve it when copying the bundle. Label this
as a licensed sample, not the presenter's room. Repackaging changes the container;
the six payloads remain byte-identical. No endorsement is implied.

[Primary SOG manifest](https://d28zzqy0iyovbz.cloudfront.net/0d9e613b/v1/meta.json)
declares version 2 and 1,244,410 splats, with only means, scales, quats and sh0
resources. [Secondary catalog](https://raw.githubusercontent.com/cjami/better-backgrounds/main/src/better_backgrounds/assets/sample-scenes-v1.json)
supplies reference hashes; the script checks each against bytes from the primary
CDN. It omits the catalog's preview, which the SOG manifest does not reference.
Hash matches establish byte identity, not visual correctness.

The [PlayCanvas decoder](https://github.com/playcanvas/splat-transform/blob/main/src/lib/readers/read-sog.ts)
defines the signed-log inverse used here. No renderer dependency is installed by
this lane. ZIP integrity, member identity and metadata checks establish packaging;
A's installed Spark/Three viewer remains the consumer and acceptance gate.

## Capture next

Follow [CAPTURE.md](CAPTURE.md) when the presenter supplies one selected room.
Current boundary: licensed sample package; no presenter capture or reconstruction.
