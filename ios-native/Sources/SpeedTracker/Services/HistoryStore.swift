import Foundation

final class HistoryStore: ObservableObject {
    @Published private(set) var items: [HistoryItem] {
        didSet { persist() }
    }

    private let storageKey = "speedtracker.history"

    init() {
        if let data = UserDefaults.standard.data(forKey: storageKey),
           let decoded = try? JSONDecoder().decode([HistoryItem].self, from: data) {
            self.items = decoded
        } else {
            self.items = []
        }
    }

    func add(_ item: HistoryItem) {
        items.insert(item, at: 0)
    }

    func clear() {
        items.removeAll()
    }

    func groupedByDay() -> [(title: String, items: [HistoryItem])] {
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        formatter.timeStyle = .none

        let grouped = Dictionary(grouping: items) { item in
            formatter.string(from: item.timestamp)
        }

        return grouped
            .map { (title: $0.key, items: $0.value.sorted { $0.timestamp > $1.timestamp }) }
            .sorted { $0.title > $1.title }
    }

    private func persist() {
        guard let data = try? JSONEncoder().encode(items) else { return }
        UserDefaults.standard.set(data, forKey: storageKey)
    }
}
