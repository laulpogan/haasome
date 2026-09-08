import AppKit
import MapKit
import AVKit

let arguments = CommandLine.arguments
func option(_ name: String, fallback: String) -> String {
    guard let i = arguments.firstIndex(of: name), i + 1 < arguments.count else { return fallback }
    return arguments[i + 1]
}
let bundledMedia = Bundle.main.resourceURL?.appendingPathComponent("Austin", isDirectory: true).path ?? ""
let mediaRoot = option("--media", fallback: bundledMedia)
let mediaURL = URL(fileURLWithPath: mediaRoot, isDirectory: true)
let supportURL = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask).first ?? FileManager.default.homeDirectoryForCurrentUser.appendingPathComponent("Library/Application Support")
let defaultStateURL = supportURL.appendingPathComponent("Haasome", isDirectory: true).appendingPathComponent("palace-state.json")
let stateURL = URL(fileURLWithPath: option("--state", fallback: defaultStateURL.path))
let latitude = Double(option("--latitude", fallback: "30.3163166667")) ?? 30.3163166667
let longitude = Double(option("--longitude", fallback: "-97.7277222222")) ?? -97.7277222222
let fieldCoordinate = CLLocationCoordinate2D(latitude: latitude, longitude: longitude)
let green = NSColor(calibratedRed: 0.055, green: 0.115, blue: 0.083, alpha: 1)
let paper = NSColor(calibratedRed: 0.95, green: 0.93, blue: 0.87, alpha: 1)
let gold = NSColor(calibratedRed: 0.87, green: 0.71, blue: 0.38, alpha: 1)
let muted = NSColor(calibratedRed: 0.69, green: 0.74, blue: 0.68, alpha: 1)

struct Memory {
    let id: String
    let title: String
    let cue: String
    let story: String
    let file: String
    let video: Bool
    let latOffset: Double
    let lonOffset: Double
}
let memories = [
    Memory(id: "martin-goal", title: "Martín’s goal", cue: "The corner. The goal. That feeling.", story: "Back in Austin. Back on the pitch. Tito chose this photo to remember Martín’s goal.", file: "memory-0.jpg", video: false, latOffset: 0, lonOffset: 0),
    Memory(id: "mit-save", title: "That save vs MI-CHEAT", cue: "Remember that save?", story: "A clutch save against MIT. Yeah, we call them MI-CHEAT 😂. Play the clip and go back to that moment.", file: "memory-4.mp4", video: true, latOffset: -0.00038, lonOffset: -0.00008),
    Memory(id: "team-together", title: "All of us, together", cue: "The people who made the trip.", story: "The team, together on the field in Austin. The trip comes back through the people who were there.", file: "memory-1.jpg", video: false, latOffset: -0.00016, lonOffset: 0.00045)
]
struct SavedMemory: Codable { var latitude: Double; var longitude: Double; var note: String }
struct PalaceState: Codable { var version: Int = 1; var memories: [String: SavedMemory] = [:] }
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
final class MemoryAnchor: MKPointAnnotation { var memoryIndex: Int = 0 }

final class TripApp: NSObject, NSApplicationDelegate, MKMapViewDelegate, NSWindowDelegate {
    var window: NSWindow!
    let map = MKMapView(frame: .zero)
    let status = label("Loading Apple 3D imagery…", size: 11, color: muted)
    let memoryTitle = label("Martín’s goal", size: 29, weight: .semibold)
    let memoryBody = label("", size: 14)
    let eyebrow = label("A MEMORY FROM THE PITCH", size: 10, color: gold, weight: .bold)
    let provenance = label("Selected by Tito · Austin Soccer Trek 2026", size: 11, color: muted)
    let saveStatus = label("Initial pins are approximate memory cues, not exact event locations.", size: 11, color: muted)
    let photo = MemoryImageView()
    let playerView = AVPlayerView()
    let mediaBox = NSView()
    let notes = NSTextField(string: "")
    let noteLabel = label("YOUR WORDS", size: 10, color: gold, weight: .bold)
    let noteButtons = NSStackView()
    let storyStack = NSStackView()
    let exploreStack = NSStackView()
    let orbitButton = NSButton(title: "Orbit the field", target: nil, action: nil)
    var cards: [NSButton] = []
    var memoryPane: NSView?
    var anchors: [MemoryAnchor] = []
    var current = 0
    var exploring = false
    var saved = PalaceState()
    var player: AVPlayer?
    var orbitTimer: Timer?
    var mapReady = false
    var loadMessage: String?
    var hasShownMemory = false

    func applicationDidFinishLaunching(_ notification: Notification) {
        loadState()
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
        window.minSize = NSSize(width: min(1050, width), height: min(680, height))
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
        let rail = NSView()
        let side = NSView()
        memoryPane = side
        [header, footer, rail, side, map].forEach { $0.translatesAutoresizingMaskIntoConstraints = false; root.addSubview($0) }
        let brand = label("haasome", size: 29, weight: .semibold)
        let trip = label("AUSTIN 2026  /  YOUR PLACES", size: 11, color: gold, weight: .semibold)
        let explore = NSButton(title: "Explore the field", target: self, action: #selector(exploreField))
        explore.bezelStyle = .rounded
        explore.translatesAutoresizingMaskIntoConstraints = false
        orbitButton.target = self
        orbitButton.action = #selector(toggleOrbit)
        orbitButton.bezelStyle = .rounded
        orbitButton.translatesAutoresizingMaskIntoConstraints = false
        let reset = NSButton(title: "Reset view ↗", target: self, action: #selector(resetCamera))
        reset.bezelStyle = .rounded
        reset.translatesAutoresizingMaskIntoConstraints = false
        [brand, trip, explore, orbitButton, reset].forEach { header.addSubview($0) }
        NSLayoutConstraint.activate([
            header.topAnchor.constraint(equalTo: root.topAnchor), header.leadingAnchor.constraint(equalTo: root.leadingAnchor), header.trailingAnchor.constraint(equalTo: root.trailingAnchor), header.heightAnchor.constraint(equalToConstant: 68),
            brand.leadingAnchor.constraint(equalTo: header.leadingAnchor, constant: 22), brand.centerYAnchor.constraint(equalTo: header.centerYAnchor),
            trip.leadingAnchor.constraint(equalTo: brand.trailingAnchor, constant: 24), trip.centerYAnchor.constraint(equalTo: header.centerYAnchor),
            reset.trailingAnchor.constraint(equalTo: header.trailingAnchor, constant: -20), reset.centerYAnchor.constraint(equalTo: header.centerYAnchor),
            orbitButton.trailingAnchor.constraint(equalTo: reset.leadingAnchor, constant: -12), orbitButton.centerYAnchor.constraint(equalTo: header.centerYAnchor),
            explore.trailingAnchor.constraint(equalTo: orbitButton.leadingAnchor, constant: -12), explore.centerYAnchor.constraint(equalTo: header.centerYAnchor),
            footer.leadingAnchor.constraint(equalTo: root.leadingAnchor), footer.trailingAnchor.constraint(equalTo: root.trailingAnchor), footer.bottomAnchor.constraint(equalTo: root.bottomAnchor), footer.heightAnchor.constraint(equalToConstant: 32),
            rail.leadingAnchor.constraint(equalTo: root.leadingAnchor), rail.trailingAnchor.constraint(equalTo: root.trailingAnchor), rail.bottomAnchor.constraint(equalTo: footer.topAnchor), rail.heightAnchor.constraint(equalToConstant: 56),
            map.leadingAnchor.constraint(equalTo: root.leadingAnchor), map.topAnchor.constraint(equalTo: header.bottomAnchor), map.bottomAnchor.constraint(equalTo: rail.topAnchor), map.widthAnchor.constraint(equalTo: root.widthAnchor, multiplier: 0.66),
            side.leadingAnchor.constraint(equalTo: map.trailingAnchor), side.trailingAnchor.constraint(equalTo: root.trailingAnchor), side.topAnchor.constraint(equalTo: header.bottomAnchor), side.bottomAnchor.constraint(equalTo: rail.topAnchor)
        ])
        let place = label("Charles Alan Wright Fields · Austin, Texas", size: 11, color: muted)
        footer.addSubview(place)
        footer.addSubview(status)
        NSLayoutConstraint.activate([
            place.leadingAnchor.constraint(equalTo: footer.leadingAnchor, constant: 22), place.centerYAnchor.constraint(equalTo: footer.centerYAnchor),
            status.trailingAnchor.constraint(equalTo: footer.trailingAnchor, constant: -22), status.centerYAnchor.constraint(equalTo: footer.centerYAnchor), status.leadingAnchor.constraint(greaterThanOrEqualTo: place.trailingAnchor, constant: 16)
        ])
        let cardStack = NSStackView()
        cardStack.orientation = .horizontal
        cardStack.distribution = .fillEqually
        cardStack.spacing = 12
        cardStack.translatesAutoresizingMaskIntoConstraints = false
        rail.addSubview(cardStack)
        for (i, memory) in memories.enumerated() {
            let button = NSButton(title: "0\(i + 1)   \(memory.title)", target: self, action: #selector(selectCard(_:)))
            button.tag = i
            button.bezelStyle = .rounded
            button.font = .systemFont(ofSize: 13, weight: .semibold)
            button.setAccessibilityLabel(memory.title)
            cardStack.addArrangedSubview(button)
            cards.append(button)
        }
        NSLayoutConstraint.activate([cardStack.leadingAnchor.constraint(equalTo: rail.leadingAnchor, constant: 22), cardStack.trailingAnchor.constraint(equalTo: rail.trailingAnchor, constant: -22), cardStack.centerYAnchor.constraint(equalTo: rail.centerYAnchor)])
        buildMemoryPane(side)
        configureMap()
        showMemory(0, selectPin: false)
        if let message = loadMessage { saveStatus.stringValue = message }
        window.center()
        window.makeKeyAndOrderFront(nil)
        window.setFrame(NSRect(x: visible.midX - width / 2, y: visible.midY - height / 2, width: width, height: height), display: true)
        root.layoutSubtreeIfNeeded()
        NSApp.activate(ignoringOtherApps: true)
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.2) { [weak self] in self?.setInitialCamera(animated: false) }
    }

    func buildMemoryPane(_ side: NSView) {
        mediaBox.translatesAutoresizingMaskIntoConstraints = false
        mediaBox.wantsLayer = true
        mediaBox.layer?.backgroundColor = NSColor.black.withAlphaComponent(0.25).cgColor
        mediaBox.layer?.cornerRadius = 8
        mediaBox.layer?.masksToBounds = true
        photo.imageScaling = .scaleProportionallyUpOrDown
        playerView.controlsStyle = .floating
        for view in [photo as NSView, playerView] {
            view.translatesAutoresizingMaskIntoConstraints = false
            mediaBox.addSubview(view)
            NSLayoutConstraint.activate([view.leadingAnchor.constraint(equalTo: mediaBox.leadingAnchor), view.trailingAnchor.constraint(equalTo: mediaBox.trailingAnchor), view.topAnchor.constraint(equalTo: mediaBox.topAnchor), view.bottomAnchor.constraint(equalTo: mediaBox.bottomAnchor)])
        }
        playerView.isHidden = true
        notes.placeholderString = "What do you want to remember?"
        notes.font = .systemFont(ofSize: 13)
        notes.textColor = paper
        notes.backgroundColor = NSColor.white.withAlphaComponent(0.06)
        notes.isBezeled = true
        notes.bezelStyle = .roundedBezel
        notes.usesSingleLineMode = false
        notes.lineBreakMode = .byWordWrapping
        notes.cell?.wraps = true
        notes.translatesAutoresizingMaskIntoConstraints = false
        notes.setAccessibilityLabel("Your words")
        let save = NSButton(title: "Save your words", target: self, action: #selector(saveNote))
        let place = NSButton(title: "Place memory here", target: self, action: #selector(placeMemory))
        [save, place].forEach { $0.bezelStyle = .rounded; $0.font = .systemFont(ofSize: 12); noteButtons.addArrangedSubview($0) }
        noteButtons.orientation = .horizontal
        noteButtons.spacing = 8
        storyStack.orientation = .vertical
        storyStack.alignment = .leading
        storyStack.spacing = 9
        storyStack.translatesAutoresizingMaskIntoConstraints = false
        [eyebrow, memoryTitle, memoryBody, mediaBox, provenance, noteLabel, notes, noteButtons, saveStatus].forEach { storyStack.addArrangedSubview($0) }
        side.addSubview(storyStack)
        NSLayoutConstraint.activate([
            storyStack.leadingAnchor.constraint(equalTo: side.leadingAnchor, constant: 22), storyStack.trailingAnchor.constraint(equalTo: side.trailingAnchor, constant: -22), storyStack.topAnchor.constraint(equalTo: side.topAnchor, constant: 20), storyStack.bottomAnchor.constraint(lessThanOrEqualTo: side.bottomAnchor, constant: -12),
            mediaBox.widthAnchor.constraint(equalTo: storyStack.widthAnchor), mediaBox.heightAnchor.constraint(greaterThanOrEqualToConstant: 110), notes.heightAnchor.constraint(equalToConstant: 44)
        ])
        let preferredHeight = mediaBox.heightAnchor.constraint(equalTo: side.heightAnchor, multiplier: 0.38)
        preferredHeight.priority = .defaultHigh
        preferredHeight.isActive = true
        [eyebrow, memoryTitle, memoryBody, provenance, noteLabel, notes, saveStatus].forEach { $0.widthAnchor.constraint(equalTo: storyStack.widthAnchor).isActive = true }
        let exploreTitle = label("A place to come back to.", size: 30, weight: .semibold)
        let exploreText = label("Move around the field. Find a memory through its gold pin, or choose one of the moments below.", size: 16)
        let cue = label("The corner. The save. The people.\n\nWhat comes back first?", size: 18, color: gold)
        exploreStack.orientation = .vertical
        exploreStack.alignment = .leading
        exploreStack.spacing = 26
        exploreStack.translatesAutoresizingMaskIntoConstraints = false
        [exploreTitle, exploreText, cue].forEach { exploreStack.addArrangedSubview($0) }
        side.addSubview(exploreStack)
        NSLayoutConstraint.activate([exploreStack.leadingAnchor.constraint(equalTo: side.leadingAnchor, constant: 28), exploreStack.trailingAnchor.constraint(equalTo: side.trailingAnchor, constant: -28), exploreStack.topAnchor.constraint(equalTo: side.topAnchor, constant: 45)])
        [exploreTitle, exploreText, cue].forEach { $0.widthAnchor.constraint(equalTo: exploreStack.widthAnchor).isActive = true }
        exploreStack.isHidden = true
    }

    func configureMap() {
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
        for (index, memory) in memories.enumerated() {
            let anchor = MemoryAnchor()
            anchor.memoryIndex = index
            let state = saved.memories[memory.id]!
            anchor.coordinate = CLLocationCoordinate2D(latitude: state.latitude, longitude: state.longitude)
            anchor.title = memory.title
            anchor.subtitle = memory.cue
            anchors.append(anchor)
        }
        map.addAnnotations(anchors)
    }
    func keepDraft() {
        guard hasShownMemory, !exploring else { return }
        saved.memories[memories[current].id]?.note = notes.stringValue
    }
    func showMemory(_ index: Int, selectPin: Bool = true) {
        guard memories.indices.contains(index) else { return }
        keepDraft()
        player?.pause()
        player = nil
        playerView.player = nil
        current = index
        exploring = false
        storyStack.isHidden = false
        exploreStack.isHidden = true
        let memory = memories[index]
        memoryTitle.stringValue = memory.title
        memoryBody.stringValue = memory.story
        eyebrow.stringValue = "MEMORY 0\(index + 1) / 03 · AUSTIN 2026"
        notes.stringValue = saved.memories[memory.id]?.note ?? ""
        hasShownMemory = true
        let file = mediaURL.appendingPathComponent(memory.file)
        playerView.isHidden = !memory.video
        photo.isHidden = memory.video
        if memory.video {
            player = AVPlayer(url: file)
            playerView.player = player
            photo.image = nil
        } else { photo.image = NSImage(contentsOf: file) }
        if !FileManager.default.fileExists(atPath: file.path) { memoryBody.stringValue = "This selected media file is unavailable. Check the local Austin media folder." }
        provenance.stringValue = memory.video ? "Tito’s selected match video · Austin Soccer Trek" : "Tito’s selected photo · Austin Soccer Trek"
        saveStatus.stringValue = "Pins are personal memory cues; exact event locations are not verified."
        for (i, card) in cards.enumerated() { card.contentTintColor = i == index ? gold : paper }
        if selectPin, !map.selectedAnnotations.contains(where: { ($0 as? MemoryAnchor)?.memoryIndex == index }) { map.selectAnnotation(anchors[index], animated: true) }
        status.stringValue = "Revisiting \(memory.title)"
    }
    @objc func selectCard(_ sender: NSButton) { stopOrbit(); showMemory(sender.tag) }
    @objc func exploreField() {
        keepDraft()
        player?.pause()
        exploring = true
        storyStack.isHidden = true
        exploreStack.isHidden = false
        for anchor in map.selectedAnnotations { map.deselectAnnotation(anchor, animated: false) }
        cards.forEach { $0.contentTintColor = paper }
        status.stringValue = "Explore, then return through a memory pin."
    }
    @objc func saveNote() { keepDraft(); persistState(success: "Your words are saved on this Mac.") }
    @objc func placeMemory() {
        stopOrbit()
        keepDraft()
        let center = map.camera.centerCoordinate
        guard CLLocationCoordinate2DIsValid(center) else { saveStatus.stringValue = "Move the map to a valid location first."; return }
        let id = memories[current].id
        saved.memories[id]?.latitude = center.latitude
        saved.memories[id]?.longitude = center.longitude
        anchors[current].coordinate = center
        persistState(success: "Memory placed at the center of your view and saved.")
        map.selectAnnotation(anchors[current], animated: true)
    }
    func loadState() {
        for memory in memories {
            saved.memories[memory.id] = SavedMemory(latitude: latitude + memory.latOffset, longitude: longitude + memory.lonOffset, note: "")
        }
        guard FileManager.default.fileExists(atPath: stateURL.path) else { return }
        do {
            let loaded = try JSONDecoder().decode(PalaceState.self, from: Data(contentsOf: stateURL))
            guard loaded.version == 1 else { throw NSError(domain: "Haasome", code: 1, userInfo: [NSLocalizedDescriptionKey: "Unsupported saved palace version."]) }
            for memory in memories {
                if let entry = loaded.memories[memory.id], entry.latitude.isFinite, entry.longitude.isFinite, CLLocationCoordinate2DIsValid(CLLocationCoordinate2D(latitude: entry.latitude, longitude: entry.longitude)) { saved.memories[memory.id] = entry }
            }
            loadMessage = "Your saved words and memory places have been restored."
        } catch { loadMessage = "Could not restore the saved palace: \(error.localizedDescription)" }
    }
    func persistState(success: String) {
        do {
            let encoder = JSONEncoder()
            encoder.outputFormatting = [.prettyPrinted, .sortedKeys]
            try FileManager.default.createDirectory(at: stateURL.deletingLastPathComponent(), withIntermediateDirectories: true)
            try encoder.encode(saved).write(to: stateURL, options: .atomic)
            saveStatus.stringValue = success
        } catch { saveStatus.stringValue = "Could not save: \(error.localizedDescription)" }
    }
    func setInitialCamera(animated: Bool) {
        window.contentView?.layoutSubtreeIfNeeded()
        let camera = MKMapCamera(lookingAtCenter: fieldCoordinate, fromDistance: 500, pitch: 60, heading: 15)
        map.setCamera(camera, animated: animated)
        reportGeometry("camera-reset")
    }
    @objc func resetCamera() { stopOrbit(); setInitialCamera(animated: true) }
    @objc func toggleOrbit() {
        if orbitTimer != nil { stopOrbit(); return }
        orbitButton.title = "Stop orbit"
        let center = map.camera.centerCoordinate
        let distance = max(250, min(750, map.camera.centerCoordinateDistance))
        var heading = map.camera.heading
        orbitTimer = Timer.scheduledTimer(withTimeInterval: 0.08, repeats: true) { [weak self] _ in
            guard let self else { return }
            heading = (heading + 0.32).truncatingRemainder(dividingBy: 360)
            self.map.camera = MKMapCamera(lookingAtCenter: center, fromDistance: distance, pitch: 60, heading: heading)
        }
    }
    func stopOrbit() { orbitTimer?.invalidate(); orbitTimer = nil; orbitButton.title = "Orbit the field" }
    func reportGeometry(_ reason: String) {
        let file = option("--diagnostics", fallback: "")
        guard !file.isEmpty else { return }
        let geometry: [String: Any] = ["reason": reason, "windowFrame": NSStringFromRect(window.frame), "rootBounds": NSStringFromRect(window.contentView?.bounds ?? .zero), "mapFrame": NSStringFromRect(map.frame), "mapBounds": NSStringFromRect(map.bounds), "memoryPaneFrame": NSStringFromRect(memoryPane?.frame ?? .zero), "centerLatitude": map.camera.centerCoordinate.latitude, "centerLongitude": map.camera.centerCoordinate.longitude, "pitch": map.camera.pitch, "heading": map.camera.heading, "distance": map.camera.centerCoordinateDistance, "selectedMemory": memories[current].id, "exploring": exploring]
        if let data = try? JSONSerialization.data(withJSONObject: geometry, options: [.prettyPrinted, .sortedKeys]) { try? data.write(to: URL(fileURLWithPath: file), options: .atomic) }
    }
    func windowDidEndLiveResize(_ notification: Notification) { reportGeometry("window-resize") }
    func mapView(_ mapView: MKMapView, viewFor annotation: MKAnnotation) -> MKAnnotationView? {
        guard let anchor = annotation as? MemoryAnchor else { return nil }
        let view = MKMarkerAnnotationView(annotation: annotation, reuseIdentifier: "memory")
        view.markerTintColor = gold
        view.glyphTintColor = green
        view.glyphText = "\(anchor.memoryIndex + 1)"
        view.titleVisibility = .adaptive
        view.subtitleVisibility = .adaptive
        view.displayPriority = .required
        view.canShowCallout = true
        return view
    }
    func mapView(_ mapView: MKMapView, didSelect view: MKAnnotationView) {
        guard let anchor = view.annotation as? MemoryAnchor else { return }
        stopOrbit()
        showMemory(anchor.memoryIndex, selectPin: false)
    }
    func mapViewWillStartLoadingMap(_ mapView: MKMapView) { if !mapReady { status.stringValue = "Loading Apple 3D imagery…" } }
    func mapViewDidFinishRenderingMap(_ mapView: MKMapView, fullyRendered: Bool) {
        if fullyRendered {
            mapReady = true
            if status.stringValue.hasPrefix("Loading Apple") {
                status.stringValue = "Choose a memory, or explore the field."
            }
            reportGeometry("fully-rendered")
        }
    }
    func mapViewDidFailLoadingMap(_ mapView: MKMapView, withError error: Error) { status.stringValue = "Apple Maps could not load: \(error.localizedDescription)" }
    func applicationWillTerminate(_ notification: Notification) { player?.pause(); stopOrbit() }
    func applicationShouldTerminateAfterLastWindowClosed(_ sender: NSApplication) -> Bool { true }
}
let delegate = TripApp()
NSApplication.shared.delegate = delegate
NSApplication.shared.run()
