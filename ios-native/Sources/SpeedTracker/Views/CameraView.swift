import SwiftUI

struct CameraView: View {
    @EnvironmentObject private var settingsStore: SettingsStore
    @EnvironmentObject private var historyStore: HistoryStore
    @EnvironmentObject private var motionDetector: MotionDetector

    @Binding var selection: AppTab
    @State private var isRecording = false

    private var displaySpeed: Double {
        if settingsStore.settings.unit == .mph {
            return motionDetector.speed * 0.621371
        }
        return motionDetector.speed
    }

    private var formattedSpeed: String {
        let digits = settingsStore.settings.highPrecision ? 2 : 1
        return String(format: "%0.*f", digits, displaySpeed)
    }

    private var speedParts: (String, String) {
        let parts = formattedSpeed.split(separator: ".", maxSplits: 1).map(String.init)
        if parts.count == 2 {
            return (parts[0], parts[1])
        }
        return (parts.first ?? "0", "0")
    }

    private var durationText: String {
        let formatter = DateComponentsFormatter()
        formatter.allowedUnits = [.minute, .second]
        formatter.zeroFormattingBehavior = [.pad]
        return formatter.string(from: motionDetector.duration) ?? "0:00"
    }

    var body: some View {
        ZStack {
            if let session = motionDetector.session {
                CameraPreview(session: session)
                    .ignoresSafeArea()
            } else {
                Color.black.ignoresSafeArea()
            }

            LinearGradient(colors: [
                Color.black.opacity(0.4),
                Color.black.opacity(0.1),
                Color.black.opacity(0.6)
            ], startPoint: .top, endPoint: .bottom)
            .ignoresSafeArea()

            VStack(spacing: 16) {
                header

                Spacer()

                reticle

                speedDisplay

                Spacer()

                stats

                controls
            }
            .padding(.horizontal, 20)
            .padding(.bottom, 24)
        }
        .onAppear {
            motionDetector.sensitivity = settingsStore.settings.sensitivity
            motionDetector.calibration = settingsStore.settings.calibration
            motionDetector.autoDetect = settingsStore.settings.autoDetect
            motionDetector.start()
        }
        .onDisappear {
            motionDetector.stop()
            motionDetector.setRecording(false)
            isRecording = false
        }
        .onChange(of: settingsStore.settings.sensitivity) { newValue in
            motionDetector.sensitivity = newValue
        }
        .onChange(of: settingsStore.settings.calibration) { newValue in
            motionDetector.calibration = newValue
        }
        .onChange(of: settingsStore.settings.autoDetect) { newValue in
            motionDetector.autoDetect = newValue
            if !newValue {
                motionDetector.detectedObject = "AUTO DETECT"
            }
        }
    }

    private var header: some View {
        HStack {
            Spacer()

            HStack(spacing: 8) {
                Circle()
                    .fill(motionDetector.hasCamera ? Color.green : Color.red)
                    .frame(width: 6, height: 6)
                Text(motionDetector.hasCamera ? "OPTICAL TRACKING" : "SIMULATION")
                    .font(.caption2.weight(.bold))
                    .foregroundStyle(.white.opacity(0.9))
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 6)
            .background(.white.opacity(0.12), in: Capsule())

            Spacer()
        }
        .padding(.top, 12)
    }

    private var reticle: some View {
        ZStack {
            RoundedRectangle(cornerRadius: 22, style: .continuous)
                .stroke(.white.opacity(0.18), lineWidth: 1)
                .frame(width: 280, height: 180)

            RoundedRectangle(cornerRadius: 18, style: .continuous)
                .stroke(.white.opacity(0.5), style: StrokeStyle(lineWidth: 2, dash: [6, 6]))
                .frame(width: 250, height: 150)

            Circle()
                .fill(.white.opacity(0.8))
                .frame(width: 6, height: 6)

            if settingsStore.settings.autoDetect {
                Label(motionDetector.detectedObject, systemImage: "viewfinder")
                    .font(.caption2.weight(.bold))
                    .foregroundStyle(.white.opacity(0.9))
                    .padding(.horizontal, 10)
                    .padding(.vertical, 6)
                    .background(.black.opacity(0.35), in: Capsule())
                    .offset(y: 62)
            }
        }
        .shadow(color: .blue.opacity(settingsStore.settings.stabilization ? 0.25 : 0), radius: 22)
    }

    private var speedDisplay: some View {
        VStack(spacing: 8) {
            HStack(alignment: .firstTextBaseline, spacing: 4) {
                Text(speedParts.0)
                    .font(.system(size: 88, weight: .medium, design: .rounded))
                    .foregroundStyle(.white)
                Text("." + speedParts.1)
                    .font(.system(size: 36, weight: .light, design: .rounded))
                    .foregroundStyle(.white.opacity(0.7))
                    .padding(.bottom, 6)
            }

            Text("\(settingsStore.settings.unit.label.uppercased()) DETECTED")
                .font(.caption.weight(.bold))
                .foregroundStyle(.blue)
                .padding(.horizontal, 12)
                .padding(.vertical, 6)
                .background(.blue.opacity(0.15), in: Capsule())
        }
    }

    private var stats: some View {
        HStack(spacing: 24) {
            statBlock(title: "MAX", value: formatStat(motionDetector.maxSpeed))
            Divider()
                .frame(height: 32)
                .overlay(.white.opacity(0.2))
            statBlock(title: "AVG", value: formatStat(motionDetector.averageSpeed))
            Divider()
                .frame(height: 32)
                .overlay(.white.opacity(0.2))
            statBlock(title: "TIME", value: durationText)
        }
        .padding(.top, 6)
    }

    private func statBlock(title: String, value: String) -> some View {
        VStack(spacing: 4) {
            Text(title)
                .font(.caption2.weight(.bold))
                .foregroundStyle(.white.opacity(0.55))
            Text(value)
                .font(.headline.weight(.semibold))
                .foregroundStyle(.white)
        }
    }

    private func formatStat(_ value: Double) -> String {
        let digits = settingsStore.settings.highPrecision ? 1 : 0
        return String(format: "%0.*f", digits, value)
    }

    private var controls: some View {
        HStack(spacing: 40) {
            Button {
                Haptics.impact(.medium)
                toggleRecording()
            } label: {
                ZStack {
                    Circle()
                        .fill(.white)
                        .frame(width: 78, height: 78)
                        .shadow(radius: 12)
                    Circle()
                        .stroke(.white.opacity(0.35), lineWidth: 2)
                        .frame(width: 70, height: 70)
                    RoundedRectangle(cornerRadius: isRecording ? 6 : 20, style: .continuous)
                        .fill(Color.blue)
                        .frame(width: isRecording ? 24 : 34, height: isRecording ? 24 : 34)
                        .animation(.easeInOut(duration: 0.2), value: isRecording)
                }
            }
        }
        .padding(.top, 6)
    }

    private func toggleRecording() {
        if isRecording {
            let item = HistoryItem(
                peakSpeed: motionDetector.maxSpeed,
                averageSpeed: motionDetector.averageSpeed,
                duration: motionDetector.duration
            )
            if motionDetector.duration > 1 {
                historyStore.add(item)
            }
            motionDetector.setRecording(false)
        } else {
            motionDetector.setRecording(true)
        }
        isRecording.toggle()
    }
}
