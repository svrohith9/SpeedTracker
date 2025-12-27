import SwiftUI

@main
struct SpeedTrackerApp: App {
    @StateObject private var settingsStore = SettingsStore()
    @StateObject private var historyStore = HistoryStore()
    @StateObject private var motionDetector = MotionDetector()

    var body: some Scene {
        WindowGroup {
            RootView()
                .environmentObject(settingsStore)
                .environmentObject(historyStore)
                .environmentObject(motionDetector)
        }
    }
}
