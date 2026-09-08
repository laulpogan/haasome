import AppKit
import MapKit

let arguments = CommandLine.arguments
func option(_ name: String, fallback: String) -> String {
    guard let i = arguments.firstIndex(of: name), i + 1 < arguments.count else { return fallback }
    return arguments[i + 1]
}
let mediaRoot = option("--media", fallback: "")
let latitude = Double(option("--latitude", fallback: "30.3163166667")) ?? 30.3163166667
let longitude = Double(option("--longitude", fallback: "-97.7277222222")) ?? -97.7277222222
let fieldCoordinate = CLLocationCoordinate2D(latitude: latitude, longitude: longitude)

let green = NSColor(calibratedRed: 0.055, green: 0.115, blue: 0.083, alpha: 1)
let paper = NSColor(calibratedRed: 0.95, green: 0.93, blue: 0.87, alpha: 1)
let gold = NSColor(calibratedRed: 0.87, green: 0.71, blue: 0.38, alpha: 1)
let muted = NSColor(calibratedRed: 0.69, green: 0.74, blue: 0.68, alpha: 1)

func label(_ text: String, size: CGFloat = 14, color: NSColor = paper, weight: NSFont.Weight = .regular) -> NSTextField {
    let item = NSTextField(wrappingLabelWithString: text)
    item.font = .systemFont(ofSize: size, weight: weight)
    item.textColor = color
    item.isSelectable = false
    item.translatesAutoresizingMaskIntoConstraints = false
    return item
}

final class MemoryImageView: NSImageView {
    override var intrinsicContentSize: NSSize { NSSize(width: NSView.noIntrinsicMetric, height: NSView.noIntrinsicMetric) }
}

final class TripApp: NSObject, NSApplicationDelegate, MKMapViewDelegate, NSWindowDelegate {
    var window: NSWindow!
    let map = MKMapView(frame: .zero)
    let status = label("Loading Apple 3D imagery…", size: 12, color: muted)
    let memoryTitle = label("Martín’s goal", size: 31, weight: .semibold)
    let memoryBody = label("Back in Austin. Back on the pitch. One photo that brings the moment back.", size: 17)
    let photo = MemoryImageView()
    var memoryPane: NSView?
    let anchor = MKPointAnnotation()

    func applicationDidFinishLaunching(_ notification: Notification) {
        NSApp.setActivationPolicy(.regular)
        let menu = NSMenu()
        let appMenu = NSMenu()
        let appItem = NSMenuItem()
        appItem.submenu = appMenu
        appMenu.addItem(withTitle: "Quit Haasome", action: #selector(NSApplication.terminate(_:)), keyEquivalent: "q")
        menu.addItem(appItem)
        NSApp.mainMenu = menu

        let visible = NSScreen.main?.visibleFrame ?? NSRect(x: 0, y: 0, width: 1280, height: 800)
        let width = min(1440, visible.width - 32)
        let height = min(920, visible.height - 32)
        window = NSWindow(contentRect: NSRect(x: 0, y: 0, width: width, height: height - 28), styleMask: [.titled, .closable, .miniaturizable, .resizable], backing: .buffered, defer: false)
        window.title = "Haasome — Austin, remembered"
        window.minSize = NSSize(width: min(1000, width), height: min(650, height))
        window.delegate = self
        window.collectionBehavior = [.fullScreenPrimary]
        window.appearance = NSAppearance(named: .darkAqua)
        window.backgroundColor = green
        window.isReleasedWhenClosed = false
        let root = NSView()
        root.wantsLayer = true
        root.layer?.backgroundColor = green.cgColor
        window.contentView = root

        let header = NSView()
        let footer = NSView()
        let side = NSView()
        memoryPane = side
        [header, footer, side, map].forEach { $0.translatesAutoresizingMaskIntoConstraints = false; root.addSubview($0) }

        let brand = label("haasome", size: 29, weight: .semibold)
        let trip = label("AUSTIN 2026  /  YOUR PLACES", size: 12, color: gold, weight: .semibold)
        let reset = NSButton(title: "Back to the field ↗", target: self, action: #selector(resetCamera))
        reset.bezelStyle = .rounded
        reset.translatesAutoresizingMaskIntoConstraints = false
        [brand, trip, reset].forEach { header.addSubview($0) }
        NSLayoutConstraint.activate([
            header.topAnchor.constraint(equalTo: root.topAnchor), header.leadingAnchor.constraint(equalTo: root.leadingAnchor), header.trailingAnchor.constraint(equalTo: root.trailingAnchor), header.heightAnchor.constraint(equalToConstant: 78),
            brand.leadingAnchor.constraint(equalTo: header.leadingAnchor, constant: 24), brand.centerYAnchor.constraint(equalTo: header.centerYAnchor),
            trip.leadingAnchor.constraint(equalTo: brand.trailingAnchor, constant: 30), trip.centerYAnchor.constraint(equalTo: header.centerYAnchor),
            reset.trailingAnchor.constraint(equalTo: header.trailingAnchor, constant: -24), reset.centerYAnchor.constraint(equalTo: header.centerYAnchor),
            footer.leadingAnchor.constraint(equalTo: root.leadingAnchor), footer.trailingAnchor.constraint(equalTo: root.trailingAnchor), footer.bottomAnchor.constraint(equalTo: root.bottomAnchor), footer.heightAnchor.constraint(equalToConstant: 45),
            map.leadingAnchor.constraint(equalTo: root.leadingAnchor), map.topAnchor.constraint(equalTo: header.bottomAnchor), map.bottomAnchor.constraint(equalTo: footer.topAnchor), map.widthAnchor.constraint(equalTo: root.widthAnchor, multiplier: 0.70),
            side.leadingAnchor.constraint(equalTo: map.trailingAnchor), side.trailingAnchor.constraint(equalTo: root.trailingAnchor), side.topAnchor.constraint(equalTo: header.bottomAnchor), side.bottomAnchor.constraint(equalTo: footer.topAnchor)
        ])

        let place = label("Charles Alan Wright Fields · Austin, Texas", size: 12, color: muted)
        footer.addSubview(place)
        footer.addSubview(status)
        NSLayoutConstraint.activate([
            place.leadingAnchor.constraint(equalTo: footer.leadingAnchor, constant: 24), place.centerYAnchor.constraint(equalTo: footer.centerYAnchor),
            status.trailingAnchor.constraint(equalTo: footer.trailingAnchor, constant: -24), status.centerYAnchor.constraint(equalTo: footer.centerYAnchor), status.leadingAnchor.constraint(greaterThanOrEqualTo: place.trailingAnchor, constant: 20)
        ])

        let eyebrow = label("A MEMORY FROM THE PITCH", size: 11, color: gold, weight: .bold)
        let instruction = label("Explore the field. Select the gold pin to return to this moment.", size: 14, color: muted)
        let attribution = label("Remembered by Tito · Photo selected from the Austin trip", size: 12, color: muted)
        let placement = label("Placement is a memory cue; the exact goal position is not yet set. The starting location comes from the selected field photo.", size: 11, color: muted)
        let reveal = NSButton(title: "Revisit Martín’s goal", target: self, action: #selector(revisitMemory))
        reveal.bezelStyle = .rounded
        reveal.translatesAutoresizingMaskIntoConstraints = false
        photo.translatesAutoresizingMaskIntoConstraints = false
        photo.imageScaling = .scaleProportionallyUpOrDown
        photo.wantsLayer = true
        photo.layer?.backgroundColor = NSColor.black.withAlphaComponent(0.2).cgColor
        photo.layer?.cornerRadius = 8
        photo.layer?.masksToBounds = true
        photo.toolTip = "Tito’s selected photo for Martín’s goal"
        let file = URL(fileURLWithPath: mediaRoot, isDirectory: true).appendingPathComponent("memory-0.jpg")
        photo.image = NSImage(contentsOf: file)
        if photo.image == nil { memoryBody.stringValue = "The selected photo is unavailable. Start the app with --media pointing to the selected Austin media folder." }
        let stack = NSStackView(views: [eyebrow, memoryTitle, memoryBody, photo, attribution, reveal, instruction, placement])
        stack.orientation = .vertical
        stack.alignment = .leading
        stack.spacing = 12
        stack.translatesAutoresizingMaskIntoConstraints = false
        side.addSubview(stack)
        NSLayoutConstraint.activate([
            stack.leadingAnchor.constraint(equalTo: side.leadingAnchor, constant: 20), stack.trailingAnchor.constraint(equalTo: side.trailingAnchor, constant: -20), stack.topAnchor.constraint(equalTo: side.topAnchor, constant: 24), stack.bottomAnchor.constraint(lessThanOrEqualTo: side.bottomAnchor, constant: -16),
            photo.widthAnchor.constraint(equalTo: stack.widthAnchor), photo.heightAnchor.constraint(greaterThanOrEqualToConstant: 120)
        ])
        let photoHeight = photo.heightAnchor.constraint(equalTo: side.heightAnchor, multiplier: 0.35)
        photoHeight.priority = .defaultHigh
        photoHeight.isActive = true
        photo.setContentCompressionResistancePriority(.defaultLow, for: .vertical)
        photo.setContentCompressionResistancePriority(.defaultLow, for: .horizontal)
        photo.setContentHuggingPriority(.defaultLow, for: .horizontal)
        photo.setContentHuggingPriority(.defaultLow, for: .vertical)
        [eyebrow, memoryTitle, memoryBody, attribution, instruction, placement].forEach { $0.widthAnchor.constraint(equalTo: stack.widthAnchor).isActive = true }

        map.delegate = self
        map.mapType = .satelliteFlyover
        map.isPitchEnabled = true
        map.isRotateEnabled = true
        map.isZoomEnabled = true
        map.isScrollEnabled = true
        map.showsCompass = true
        map.showsScale = false
        map.showsZoomControls = true
        map.showsPitchControl = true
        map.pointOfInterestFilter = .excludingAll
        anchor.coordinate = fieldCoordinate
        anchor.title = "Martín’s goal"
        anchor.subtitle = "A memory cue · photo location"
        map.addAnnotation(anchor)
        window.center()
        window.makeKeyAndOrderFront(nil)
        window.setFrame(NSRect(x: visible.midX - width / 2, y: visible.midY - height / 2, width: width, height: height), display: true)
        root.layoutSubtreeIfNeeded()
        NSApp.activate(ignoringOtherApps: true)
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.2) { [weak self] in
            self?.window.contentView?.layoutSubtreeIfNeeded()
            self?.setInitialCamera(animated: false)
        }
    }

    func setInitialCamera(animated: Bool) {
        window.contentView?.layoutSubtreeIfNeeded()
        let camera = MKMapCamera(lookingAtCenter: fieldCoordinate, fromDistance: 500, pitch: 60, heading: 15)
        map.setCamera(camera, animated: animated)
        reportGeometry("camera-reset")
    }
    func reportGeometry(_ reason: String) {
        let geometry: [String: Any] = ["reason": reason, "windowFrame": NSStringFromRect(window.frame), "rootBounds": NSStringFromRect(window.contentView?.bounds ?? .zero), "mapFrame": NSStringFromRect(map.frame), "mapBounds": NSStringFromRect(map.bounds), "memoryPaneFrame": NSStringFromRect(memoryPane?.frame ?? .zero), "requestedLatitude": fieldCoordinate.latitude, "requestedLongitude": fieldCoordinate.longitude, "centerLatitude": map.camera.centerCoordinate.latitude, "centerLongitude": map.camera.centerCoordinate.longitude, "pitch": map.camera.pitch, "heading": map.camera.heading, "distance": map.camera.centerCoordinateDistance]
        let data = (try? JSONSerialization.data(withJSONObject: geometry, options: [.prettyPrinted, .sortedKeys])) ?? Data()
        if let message = String(data: data, encoding: .utf8) { fputs("Haasome geometry: \(message)\n", stderr) }
        let file = option("--diagnostics", fallback: "")
        if !file.isEmpty { try? data.write(to: URL(fileURLWithPath: file), options: .atomic) }
    }
    func windowDidEndLiveResize(_ notification: Notification) { reportGeometry("window-resize") }
    @objc func resetCamera() { setInitialCamera(animated: true) }
    @objc func revisitMemory() {
        map.selectAnnotation(anchor, animated: true)
        memoryTitle.stringValue = "Martín’s goal"
        memoryBody.stringValue = "Back in Austin. Back on the pitch. One photo that brings the moment back."
    }
    func mapView(_ mapView: MKMapView, viewFor annotation: MKAnnotation) -> MKAnnotationView? {
        guard annotation is MKPointAnnotation else { return nil }
        let view = MKMarkerAnnotationView(annotation: annotation, reuseIdentifier: "memory")
        view.markerTintColor = gold
        view.glyphTintColor = green
        view.glyphText = "★"
        view.titleVisibility = .visible
        view.subtitleVisibility = .adaptive
        view.displayPriority = .required
        view.canShowCallout = true
        return view
    }
    func mapView(_ mapView: MKMapView, didSelect view: MKAnnotationView) {
        guard view.annotation === anchor else { return }
        memoryTitle.stringValue = "Martín’s goal"
        photo.alphaValue = 1
    }
    func mapViewWillStartLoadingMap(_ mapView: MKMapView) { status.stringValue = "Loading Apple 3D imagery…" }
    func mapViewDidFinishRenderingMap(_ mapView: MKMapView, fullyRendered: Bool) {
        status.stringValue = fullyRendered ? "Apple Maps · Drag to explore · Pinch to zoom" : "Apple Maps · Loading map detail…"
        if fullyRendered { reportGeometry("fully-rendered") }
    }
    func mapViewDidFailLoadingMap(_ mapView: MKMapView, withError error: Error) {
        status.stringValue = "Apple Maps could not load: \(error.localizedDescription)"
        fputs("Apple Maps load error: \(error)\n", stderr)
    }
    func applicationShouldTerminateAfterLastWindowClosed(_ sender: NSApplication) -> Bool { true }
}

let delegate = TripApp()
NSApplication.shared.delegate = delegate
NSApplication.shared.run()
