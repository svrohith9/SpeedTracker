import SwiftUI

struct HistoryView: View {
    @EnvironmentObject private var settingsStore: SettingsStore
    @EnvironmentObject private var historyStore: HistoryStore

    private var groupedItems: [(title: String, items: [HistoryItem])] {
        historyStore.groupedByDay()
    }

    var body: some View {
        NavigationStack {
            Group {
                if historyStore.items.isEmpty {
                    VStack(spacing: 12) {
                        Image(systemName: "clock")
                            .font(.system(size: 40, weight: .semibold))
                            .foregroundStyle(.secondary)
                        Text("No History")
                            .font(.headline)
                        Text("Record a session to see it here.")
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                    }
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                    .multilineTextAlignment(.center)
                    .padding()
                } else {
                    List {
                        ForEach(groupedItems, id: \.title) { group in
                            Section(group.title.uppercased()) {
                                ForEach(group.items) { item in
                                    HistoryRow(item: item, unit: settingsStore.settings.unit)
                                }
                            }
                        }
                    }
                    .listStyle(.insetGrouped)
                }
            }
            .navigationTitle("History")
        }
    }
}

struct HistoryRow: View {
    let item: HistoryItem
    let unit: SpeedUnit

    private var speedText: String {
        let speed = unit == .mph ? item.peakSpeed * 0.621371 : item.peakSpeed
        return String(format: "%.0f", speed)
    }

    private var averageText: String {
        let speed = unit == .mph ? item.averageSpeed * 0.621371 : item.averageSpeed
        return String(format: "%.0f", speed)
    }

    private var timeText: String {
        let formatter = DateFormatter()
        formatter.dateStyle = .none
        formatter.timeStyle = .short
        return formatter.string(from: item.timestamp)
    }

    private var durationText: String {
        let formatter = DateComponentsFormatter()
        formatter.allowedUnits = [.minute, .second]
        formatter.zeroFormattingBehavior = [.pad]
        return formatter.string(from: item.duration) ?? "0:00"
    }

    var body: some View {
        HStack(spacing: 16) {
            Image(systemName: "speedometer")
                .font(.title2)
                .foregroundStyle(.blue)
                .frame(width: 36, height: 36)
                .background(Color.blue.opacity(0.15), in: Circle())

            VStack(alignment: .leading, spacing: 4) {
                Text(timeText)
                    .font(.headline)
                Text("Avg \(averageText) \(unit.label) • \(durationText)")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }

            Spacer()

            VStack(alignment: .trailing, spacing: 2) {
                Text(speedText)
                    .font(.title2.weight(.bold))
                Text(unit.label.uppercased())
                    .font(.caption2.weight(.semibold))
                    .foregroundStyle(.secondary)
            }
        }
        .padding(.vertical, 6)
    }
}
