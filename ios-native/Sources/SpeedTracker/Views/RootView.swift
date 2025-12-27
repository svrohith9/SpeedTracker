import SwiftUI

enum AppTab: Hashable {
    case camera
    case history
    case settings
}

struct RootView: View {
    @State private var selection: AppTab = .camera

    var body: some View {
        TabView(selection: $selection) {
            CameraView(selection: $selection)
                .tabItem {
                    Label("Camera", systemImage: "camera.viewfinder")
                }
                .tag(AppTab.camera)

            HistoryView()
                .tabItem {
                    Label("History", systemImage: "clock")
                }
                .tag(AppTab.history)

            SettingsView()
                .tabItem {
                    Label("Settings", systemImage: "gearshape")
                }
                .tag(AppTab.settings)
        }
    }
}
