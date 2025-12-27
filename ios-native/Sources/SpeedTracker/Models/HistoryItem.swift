import Foundation

struct HistoryItem: Identifiable, Codable {
    let id: UUID
    let timestamp: Date
    let peakSpeed: Double
    let averageSpeed: Double
    let duration: TimeInterval

    init(id: UUID = UUID(), timestamp: Date = Date(), peakSpeed: Double, averageSpeed: Double, duration: TimeInterval) {
        self.id = id
        self.timestamp = timestamp
        self.peakSpeed = peakSpeed
        self.averageSpeed = averageSpeed
        self.duration = duration
    }
}
