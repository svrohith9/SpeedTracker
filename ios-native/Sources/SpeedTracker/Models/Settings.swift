import Foundation

enum SpeedUnit: String, CaseIterable, Codable {
    case kmh = "KMH"
    case mph = "MPH"

    var label: String {
        switch self {
        case .kmh: return "km/h"
        case .mph: return "mph"
        }
    }
}

struct Settings: Codable, Equatable {
    var unit: SpeedUnit = .kmh
    var highPrecision: Bool = false
    var stabilization: Bool = true
    var autoDetect: Bool = true
    var sensitivity: Double = 85
    var calibration: Double = 1.0
}
