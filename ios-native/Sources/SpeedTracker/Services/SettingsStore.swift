import Foundation

final class SettingsStore: ObservableObject {
    @Published var settings: Settings {
        didSet { persist() }
    }

    private let storageKey = "speedtracker.settings"

    init() {
        if let data = UserDefaults.standard.data(forKey: storageKey),
           let decoded = try? JSONDecoder().decode(Settings.self, from: data) {
            self.settings = decoded
        } else {
            self.settings = Settings()
        }
    }

    private func persist() {
        guard let data = try? JSONEncoder().encode(settings) else { return }
        UserDefaults.standard.set(data, forKey: storageKey)
    }
}
