#!/bin/zsh
set -eu
native_dir="${0:A:h}"
bundle_dir="$native_dir/build/Haasome Apple.app"
mkdir -p "$bundle_dir/Contents/MacOS" "$native_dir/build/module-cache"
xcrun swiftc -module-cache-path "$native_dir/build/module-cache" -framework AppKit -framework MapKit -framework AVKit -framework AVFoundation "$native_dir/main.swift" -o "$bundle_dir/Contents/MacOS/HaasomeApple"
cat > "$bundle_dir/Contents/Info.plist" <<'PLIST'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
<key>CFBundleExecutable</key><string>HaasomeApple</string>
<key>CFBundleIdentifier</key><string>com.haasome.appletrip.prototype</string>
<key>CFBundleName</key><string>Haasome Apple</string>
<key>CFBundlePackageType</key><string>APPL</string>
<key>CFBundleShortVersionString</key><string>0.1</string>
<key>NSPrincipalClass</key><string>NSApplication</string>
<key>NSHighResolutionCapable</key><true/>
</dict></plist>
PLIST
xattr -cr "$bundle_dir"
codesign --force --sign - "$bundle_dir"
print -r -- "$bundle_dir"
