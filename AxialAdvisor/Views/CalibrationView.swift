import SwiftUI
import SwiftData

struct CalibrationView: View {
    @State private var viewModel = CalibrationViewModel()
    @Environment(\.modelContext) private var modelContext

    var body: some View {
        NavigationStack {
            Group {
                if let record = viewModel.currentRecord {
                    calibrationContent(record: record)
                } else {
                    ProgressView()
                }
            }
            .background(Color(.systemGroupedBackground))
            .navigationTitle("Pre-Harvest Calibration")
            .task {
                viewModel.loadOrCreateRecord(modelContext: modelContext)
            }
        }
    }

    private func calibrationContent(record: CalibrationRecord) -> some View {
        ScrollView {
            VStack(spacing: 20) {
                progressHeader(record: record)
                checklistSection(record: record)
                tipsSection
            }
            .padding(.horizontal)
            .padding(.vertical, 12)
        }
    }

    private func progressHeader(record: CalibrationRecord) -> some View {
        VStack(spacing: 12) {
            ZStack {
                Circle()
                    .stroke(Color(.systemGray5), lineWidth: 10)
                Circle()
                    .trim(from: 0, to: record.progressPercent)
                    .stroke(
                        record.isComplete ? .green : .blue,
                        style: StrokeStyle(lineWidth: 10, lineCap: .round)
                    )
                    .rotationEffect(.degrees(-90))
                    .animation(.spring(duration: 0.5), value: record.progressPercent)

                VStack(spacing: 2) {
                    Text("\(record.completedCount)")
                        .font(.system(size: 36, weight: .bold, design: .rounded))
                    Text("of \(record.totalCount)")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
            }
            .frame(width: 100, height: 100)

            Text(record.isComplete ? "All Calibrations Complete!" : "Season \(record.season)")
                .font(.headline)

            if record.isComplete {
                Label("Ready for Harvest", systemImage: "checkmark.seal.fill")
                    .font(.subheadline)
                    .foregroundStyle(.green)
            }
        }
        .frame(maxWidth: .infinity)
        .padding()
        .background(Color(.secondarySystemGroupedBackground))
        .clipShape(.rect(cornerRadius: 16))
    }

    private func checklistSection(record: CalibrationRecord) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Calibration Checklist")
                .font(.headline)
                .padding(.leading, 4)

            VStack(spacing: 1) {
                CalibrationRow(
                    title: "Concave Zero",
                    subtitle: "Set concave to zero position",
                    icon: "circle.grid.cross",
                    isComplete: record.concaveZero,
                    action: { record.concaveZero.toggle() }
                )
                CalibrationRow(
                    title: "Sieve Calibration",
                    subtitle: "Calibrate sieve openings",
                    icon: "rectangle.split.1x2",
                    isComplete: record.sieveCalibration,
                    action: { record.sieveCalibration.toggle() }
                )
                CalibrationRow(
                    title: "Loss Monitor",
                    subtitle: "Calibrate grain loss sensors",
                    icon: "sensor.tag.radiowaves.forward",
                    isComplete: record.lossMonitor,
                    action: { record.lossMonitor.toggle() }
                )
                CalibrationRow(
                    title: "Yield Monitor",
                    subtitle: "Calibrate yield measurement system",
                    icon: "chart.bar",
                    isComplete: record.yieldMonitor,
                    action: { record.yieldMonitor.toggle() }
                )
                CalibrationRow(
                    title: "Header Height",
                    subtitle: "Set header height sensors",
                    icon: "arrow.up.and.down.text.horizontal",
                    isComplete: record.headerHeight,
                    action: { record.headerHeight.toggle() }
                )
                CalibrationRow(
                    title: "Moisture Sensor",
                    subtitle: "Calibrate grain moisture sensor",
                    icon: "drop",
                    isComplete: record.moistureSensor,
                    action: { record.moistureSensor.toggle() }
                )
                CalibrationRow(
                    title: "Ground Speed",
                    subtitle: "Verify ground speed calibration",
                    icon: "speedometer",
                    isComplete: record.groundSpeed,
                    action: { record.groundSpeed.toggle() }
                )
            }
            .clipShape(.rect(cornerRadius: 14))
        }
    }

    private var tipsSection: some View {
        VStack(alignment: .leading, spacing: 8) {
            Label("Tips", systemImage: "lightbulb")
                .font(.subheadline.bold())
                .foregroundStyle(.secondary)
            Text("Complete all calibrations at the beginning of each harvest season. Recalibrate if changing crop types or after significant maintenance.")
                .font(.caption)
            Text("Yield monitor should be recalibrated every 2–3 loads with weigh wagon data for best accuracy.")
                .font(.caption)
                .foregroundStyle(.secondary)
        }
        .padding()
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color(.secondarySystemGroupedBackground))
        .clipShape(.rect(cornerRadius: 14))
    }
}

struct CalibrationRow: View {
    let title: String
    let subtitle: String
    let icon: String
    let isComplete: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 14) {
                Image(systemName: icon)
                    .font(.title3)
                    .frame(width: 28)
                    .foregroundStyle(isComplete ? .green : .secondary)
                VStack(alignment: .leading, spacing: 2) {
                    Text(title)
                        .font(.subheadline.bold())
                        .foregroundStyle(.primary)
                    Text(subtitle)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
                Spacer()
                Image(systemName: isComplete ? "checkmark.circle.fill" : "circle")
                    .font(.title3)
                    .foregroundStyle(isComplete ? .green : Color(.systemGray3))
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 14)
            .background(Color(.secondarySystemGroupedBackground))
        }
        .buttonStyle(.plain)
        .sensoryFeedback(.impact(weight: .light), trigger: isComplete)
    }
}
