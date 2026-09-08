#!/usr/bin/env python3
"""Install the licensed public exhibit, with pinned bytes and no model calls."""
import hashlib
from html.parser import HTMLParser
import json
from pathlib import Path
import urllib.request
import zipfile

APP = Path(__file__).resolve().parents[1]
ROOT = APP.parents[1]
BUNDLE = ROOT / 'artifacts/fallback/bundle'
AUDIT = ROOT / 'artifacts/fallback/research'
MANIFEST = json.loads((APP / 'curated/asset-verification.json').read_text())
PALACE = json.loads((APP / 'curated/capitoline.palace.json').read_text())


def fetch(url):
    with urllib.request.urlopen(url, timeout=60) as response:
        return response.read()


def checked(data, record):
    if len(data) != record['bytes'] or hashlib.sha256(data).hexdigest() != record['sha256']:
        raise RuntimeError('Asset bytes changed; review provenance before updating the manifest.')
    return data


class LicenseLinks(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'link' and 'license' in attrs.get('rel', '').split():
            self.links.append(attrs.get('href'))


def main():
    BUNDLE.mkdir(parents=True, exist_ok=True)
    AUDIT.mkdir(parents=True, exist_ok=True)
    asset = BUNDLE / PALACE['scene']['asset']
    if asset.exists():
        checked(asset.read_bytes(), MANIFEST)
        print('Existing licensed SOG matches pinned SHA-256.')
    else:
        # License is checked on the exact primary asset page BEFORE media fetch.
        page = fetch(MANIFEST['source'])
        links = LicenseLinks()
        links.feed(page.decode())
        if MANIFEST['licenseUrl'] not in links.links:
            raise RuntimeError('Primary asset page no longer declares the expected license.')
        (AUDIT / 'asset-license-page.html').write_bytes(page)
        (AUDIT / 'cc-by-4.0.html').write_bytes(fetch(MANIFEST['licenseUrl']))
        pending = asset.with_suffix('.pending')
        with zipfile.ZipFile(pending, 'w', compression=zipfile.ZIP_STORED) as archive:
            for record in MANIFEST['components']:
                data = checked(fetch(record['url']), record)
                entry = zipfile.ZipInfo(record['file'], date_time=(2026, 9, 8, 0, 0, 0))
                archive.writestr(entry, data)
        checked(pending.read_bytes(), MANIFEST)
        pending.rename(asset)
    (BUNDLE / 'palace.json').write_text(json.dumps(PALACE, indent=2) + '\n')
    for memory in PALACE['memories']:
        source = memory['source']
        note = (f"{memory['title']}\n\n{memory['body']}\n\nSource: {source['locator']}\n"
                f"Consulted: {source['capturedAt']}\n"
                'Curator paraphrase, not a source screenshot or computer-use capture.\n'
                f"Scene attribution: {PALACE['scene']['provenance']['attribution']}\n")
        (BUNDLE / source['evidenceAsset']).write_text(note)
    link = APP / 'public/curated-court'
    if link.is_symlink():
        if link.resolve() != BUNDLE.resolve():
            raise RuntimeError('Public bundle link belongs to a different directory.')
    elif link.exists():
        raise RuntimeError('Public bundle path already exists; inspect before replacing it.')
    else:
        link.symlink_to('../../../artifacts/fallback/bundle', target_is_directory=True)
    print(f"Ready: {asset} ({asset.stat().st_size} bytes)")
    print('Start: npm run dev -- --port 4189')
    print('Open: http://127.0.0.1:4189/?tour=capitoline')


if __name__ == '__main__':
    main()
