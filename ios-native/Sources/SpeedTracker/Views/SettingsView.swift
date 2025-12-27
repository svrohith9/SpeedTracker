import SwiftUI

struct SettingsView: View {
    @EnvironmentObject private var settingsStore: SettingsStore
    @EnvironmentObject private var historyStore: HistoryStore
    @State private var showClearAlert = false

    var body: some View {
        NavigationStack {
            Form {
                Section("Measurements") {
                    Picker("Speed Units", selection: $settingsStore.settings.unit) {
                        ForEach(SpeedUnit.allCases, id: \.self) { unit in
                            Text(unit.label.uppercased()).tag(unit)
                        }
                    }
                    Toggle("High Precision", isOn: $settingsStore.settings.highPrecision)
                }

                Section("Camera") {
                    Toggle("Stabilization", isOn: $settingsStore.settings.stabilization)
                }

                Section("Tracking Engine") {
                    Toggle("Auto-Detect Vehicles", isOn: $settingsStore.settings.autoDetect)
                    VStack(alignment: .leading, spacing: 8) {
                        HStack {
                            Text("Sensitivity")
                            Spacer()
                            Text(String(Int(settingsStore.settings.sensitivity)))
                                .foregroundStyle(.secondary)
                        }
                        Slider(value: $settingsStore.settings.sensitivity, in: 0...100, step: 1)
                    }
                    .padding(.vertical, 6)

                    VStack(alignment: .leading, spacing: 8) {
                        HStack {
                            Text("Speed Scale")
                            Spacer()
                            Text(String(format: "%.2fx", settingsStore.settings.calibration))
                                .foregroundStyle(.secondary)
                        }
                        Slider(value: $settingsStore.settings.calibration, in: 0.5...3.0, step: 0.05)
                    }
                    .padding(.vertical, 6)
                }

                Section("Data & Storage") {
                    Button("Export History") {
                        Haptics.impact()
                    }

                    Button(role: .destructive) {
                        showClearAlert = true
                        Haptics.impact(.medium)
                    } label: {
                        Text("Clear All Data")
                    }
                }

                Section {
                    VStack(alignment: .center, spacing: 6) {
                        Text("SpeedTracker")
                            .font(.footnote.weight(.semibold))
                        Text("Version 1.0.0")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 6)
                }
            }
            .navigationTitle("Settings")
            .alert("Clear all history?", isPresented: $showClearAlert) {
                Button("Cancel", role: .cancel) {}
                Button("Clear", role: .destructive) {
                    historyStore.clear()
                }
            } message: {
                Text("This will remove all saved sessions from this device.")
            }
        }
        .onChange(of: settingsStore.settings.unit) { _ in
            Haptics.impact()
        }
        .onChange(of: settingsStore.settings.highPrecision) { _ in
            Haptics.impact()
        }
        .onChange(of: settingsStore.settings.stabilization) { _ in
            Haptics.impact()
        }
        .onChange(of: settingsStore.settings.autoDetect) { _ in
            Haptics.impact()
        }
    }
}
