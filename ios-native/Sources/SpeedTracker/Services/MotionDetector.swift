import AVFoundation
import CoreML
import Foundation
import Vision

final class MotionDetector: NSObject, ObservableObject, AVCaptureVideoDataOutputSampleBufferDelegate {
    @Published var speed: Double = 0
    @Published var hasCamera: Bool = false
    @Published var isRunning: Bool = false
    @Published private(set) var session: AVCaptureSession?
    @Published var detectedObject: String = "AUTO DETECT"
    @Published var maxSpeed: Double = 0
    @Published var averageSpeed: Double = 0
    @Published var duration: TimeInterval = 0

    var sensitivity: Double = 85
    var calibration: Double = 1.0
    var autoDetect: Bool = true

    private var lastFrame: [UInt8]?
    private var smoothedSpeed: Double = 0
    private var sampleCount: Int = 0
    private var sumSpeed: Double = 0
    private var recordingStart: Date?
    private var noiseFloor: Double = 0
    private var noiseSigma: Double = 0
    private var lastFrameTime: CFTimeInterval = 0
    private var lastProcessTime: CFTimeInterval = 0
    private let minFrameInterval: CFTimeInterval = 1.0 / 20.0
    private var lastClassificationTime: CFTimeInterval = 0
    private lazy var visionModel: VNCoreMLModel? = {
        guard let url = Bundle.main.url(forResource: "MobileNetV2", withExtension: "mlmodelc"),
              let model = try? MLModel(contentsOf: url) else {
            return nil
        }
        return try? VNCoreMLModel(for: model)
    }()

    private let processingQueue = DispatchQueue(label: "speedtracker.motion.processing")

    func start() {
        let status = AVCaptureDevice.authorizationStatus(for: .video)
        switch status {
        case .authorized:
            configureSession()
        case .notDetermined:
            AVCaptureDevice.requestAccess(for: .video) { [weak self] granted in
                DispatchQueue.main.async {
                    if granted {
                        self?.configureSession()
                    } else {
                        self?.hasCamera = false
                    }
                }
            }
        default:
            hasCamera = false
        }
    }

    func stop() {
        session?.stopRunning()
        session = nil
        isRunning = false
        lastFrame = nil
        smoothedSpeed = 0
        noiseFloor = 0
        noiseSigma = 0
        lastFrameTime = 0
        lastProcessTime = 0
        lastClassificationTime = 0
    }

    func setRecording(_ recording: Bool) {
        if recording {
            recordingStart = Date()
            maxSpeed = 0
            averageSpeed = 0
            duration = 0
            sumSpeed = 0
            sampleCount = 0
        } else {
            recordingStart = nil
        }
    }

    private func configureSession() {
        guard session == nil else { return }
        let session = AVCaptureSession()
        session.beginConfiguration()
        session.sessionPreset = .vga640x480

        guard let device = AVCaptureDevice.default(.builtInWideAngleCamera, for: .video, position: .back),
              let input = try? AVCaptureDeviceInput(device: device) else {
            hasCamera = false
            return
        }

        if session.canAddInput(input) {
            session.addInput(input)
        }

        let output = AVCaptureVideoDataOutput()
        output.alwaysDiscardsLateVideoFrames = true
        output.videoSettings = [kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_32BGRA]
        output.setSampleBufferDelegate(self, queue: processingQueue)

        if session.canAddOutput(output) {
            session.addOutput(output)
        }

        if let connection = output.connection(with: .video), connection.isVideoOrientationSupported {
            connection.videoOrientation = .portrait
        }

        session.commitConfiguration()
        self.session = session
        hasCamera = true
        session.startRunning()
        isRunning = true
    }

    func captureOutput(_ output: AVCaptureOutput, didOutput sampleBuffer: CMSampleBuffer, from connection: AVCaptureConnection) {
        guard let pixelBuffer = CMSampleBufferGetImageBuffer(sampleBuffer) else { return }
        let timestamp = CMTimeGetSeconds(CMSampleBufferGetPresentationTimeStamp(sampleBuffer))
        if lastProcessTime > 0, timestamp - lastProcessTime < minFrameInterval {
            return
        }
        lastProcessTime = timestamp

        let targetWidth = 64
        let targetHeight = 48

        guard let currentFrame = downsample(buffer: pixelBuffer, targetWidth: targetWidth, targetHeight: targetHeight) else {
            return
        }

        if autoDetect, timestamp - lastClassificationTime > 0.4 {
            lastClassificationTime = timestamp
            classifyObject(in: pixelBuffer)
        }

        if let prev = lastFrame {
            var totalDiff = 0.0
            var totalDiffSq = 0.0
            for index in 0..<currentFrame.count {
                let diff = Double(abs(Int(currentFrame[index]) - Int(prev[index])))
                totalDiff += diff
                totalDiffSq += diff * diff
            }

            let pixelCount = Double(currentFrame.count)
            let avgDiff = totalDiff / pixelCount
            let variance = max((totalDiffSq / pixelCount) - (avgDiff * avgDiff), 0)
            let std = sqrt(variance)

            let fpsNorm: Double
            if lastFrameTime > 0 {
                let delta = max(0.001, timestamp - lastFrameTime)
                fpsNorm = min(2.0, 1.0 / delta / 30.0)
            } else {
                fpsNorm = 1.0
            }
            lastFrameTime = timestamp

            let noiseUpdateAlpha = 0.02
            if avgDiff < (noiseFloor + 0.5) {
                noiseFloor = (1 - noiseUpdateAlpha) * noiseFloor + noiseUpdateAlpha * avgDiff
                noiseSigma = (1 - noiseUpdateAlpha) * noiseSigma + noiseUpdateAlpha * std
            }

            let gatedDiff = max(0, avgDiff - (noiseFloor + noiseSigma * 1.5))
            let sensitivityMult = (sensitivity / 85.0) * 4.5
            var rawSpeed = pow(gatedDiff, 1.35) * sensitivityMult * fpsNorm
            if rawSpeed < 0.6 { rawSpeed = 0 }

            let smoothing = rawSpeed > smoothedSpeed ? 0.18 : 0.08
            smoothedSpeed = (smoothedSpeed * (1 - smoothing)) + (rawSpeed * smoothing)
            let calibratedSpeed = smoothedSpeed * calibration

            DispatchQueue.main.async { [weak self] in
                guard let self else { return }
                self.speed = calibratedSpeed

                if self.recordingStart != nil {
                    self.maxSpeed = max(self.maxSpeed, smoothedSpeed)
                    self.sampleCount += 1
                    self.sumSpeed += smoothedSpeed
                    self.averageSpeed = self.sampleCount > 0 ? (self.sumSpeed / Double(self.sampleCount)) : 0
                    if let start = self.recordingStart {
                        self.duration = Date().timeIntervalSince(start)
                    }
                }
            }
        }

        lastFrame = currentFrame
    }

    private func classifyObject(in pixelBuffer: CVPixelBuffer) {
        guard let model = visionModel else { return }

        let request = VNCoreMLRequest(model: model) { [weak self] request, _ in
            guard let results = request.results as? [VNClassificationObservation],
                  let top = results.first else { return }

            let label = self?.mapLabel(top.identifier, confidence: top.confidence) ?? "AUTO DETECT"
            DispatchQueue.main.async {
                self?.detectedObject = label
            }
        }
        request.imageCropAndScaleOption = .centerCrop

        let handler = VNImageRequestHandler(cvPixelBuffer: pixelBuffer, orientation: .right)
        try? handler.perform([request])
    }

    private func mapLabel(_ identifier: String, confidence: Float) -> String {
        guard confidence > 0.35 else { return "AUTO DETECT" }
        let label = identifier.lowercased()

        if label.contains("skateboard") { return "SKATEBOARD" }
        if label.contains("bicycle") || label.contains("bike") { return "BIKE" }
        if label.contains("person") { return "PERSON" }
        if label.contains("truck") || label.contains("lorry") || label.contains("pickup") { return "TRUCK" }
        if label.contains("car") || label.contains("cab") || label.contains("taxi") { return "CAR" }
        return "AUTO DETECT"
    }

    private func downsample(buffer: CVPixelBuffer, targetWidth: Int, targetHeight: Int) -> [UInt8]? {
        CVPixelBufferLockBaseAddress(buffer, .readOnly)
        defer { CVPixelBufferUnlockBaseAddress(buffer, .readOnly) }

        guard let baseAddress = CVPixelBufferGetBaseAddress(buffer) else { return nil }

        let width = CVPixelBufferGetWidth(buffer)
        let height = CVPixelBufferGetHeight(buffer)
        let bytesPerRow = CVPixelBufferGetBytesPerRow(buffer)
        let bufferPointer = baseAddress.assumingMemoryBound(to: UInt8.self)

        var output = Array(repeating: UInt8(0), count: targetWidth * targetHeight)

        for y in 0..<targetHeight {
            let srcY = y * height / targetHeight
            let rowOffset = srcY * bytesPerRow
            for x in 0..<targetWidth {
                let srcX = x * width / targetWidth
                let pixelOffset = rowOffset + srcX * 4
                let green = bufferPointer[pixelOffset + 1]
                output[(y * targetWidth) + x] = green
            }
        }

        return output
    }
}
