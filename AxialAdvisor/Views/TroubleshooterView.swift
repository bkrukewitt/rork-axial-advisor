import SwiftUI

struct TroubleshooterView: View {
    @State private var viewModel = TroubleshooterViewModel()

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 20) {
                    cropSelector
                    issueSelector
                    diagnoseButton
                }
                .padding(.horizontal)
                .padding(.vertical, 12)
            }
            .background(Color(.systemGroupedBackground))
            .navigationTitle("Sample Troubleshooter")
            .toolbar {
                if viewModel.showResults || !viewModel.selectedIssues.isEmpty {
                    ToolbarItem(placement: .topBarTrailing) {
                        Button("Reset") {
                            viewModel.reset()
                        }
                    }
                }
            }
            .sheet(isPresented: $viewModel.showResults) {
                DiagnosisResultsView(results: viewModel.results)
            }
        }
    }

    private var cropSelector: some View {
        SectionCard(title: "Current Crop", icon: "leaf") {
            ScrollView(.horizontal) {
                HStack(spacing: 8) {
                    ForEach(CropType.allCases) { crop in
                        Button {
                            viewModel.cropType = crop
                        } label: {
                            HStack(spacing: 6) {
                                Image(systemName: crop.icon)
                                    .font(.caption)
                                Text(crop.rawValue)
                                    .font(.caption)
                            }
                            .padding(.horizontal, 12)
                            .padding(.vertical, 8)
                            .background(viewModel.cropType == crop ? Color.red.opacity(0.15) : Color(.tertiarySystemGroupedBackground))
                            .foregroundStyle(viewModel.cropType == crop ? .red : .primary)
                            .clipShape(Capsule())
                            .overlay(
                                Capsule().stroke(viewModel.cropType == crop ? Color.red : .clear, lineWidth: 1)
                            )
                        }
                        .buttonStyle(.plain)
                    }
                }
            }
            .scrollIndicators(.hidden)
        }
    }

    private var issueSelector: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Label("Select Issues Observed", systemImage: "exclamationmark.triangle")
                    .font(.headline)
                Spacer()
                if !viewModel.selectedIssues.isEmpty {
                    Text("\(viewModel.selectedIssues.count) selected")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
            }
            .padding(.leading, 4)

            ForEach(GrainIssue.allCases) { issue in
                Button {
                    viewModel.toggleIssue(issue)
                } label: {
                    let isSelected = viewModel.selectedIssues.contains(issue)
                    HStack(spacing: 14) {
                        Image(systemName: issue.icon)
                            .font(.title2)
                            .frame(width: 32)
                            .foregroundStyle(issueColor(issue))
                        VStack(alignment: .leading, spacing: 2) {
                            Text(issue.rawValue)
                                .font(.subheadline.bold())
                                .foregroundStyle(.primary)
                        }
                        Spacer()
                        Image(systemName: isSelected ? "checkmark.circle.fill" : "circle")
                            .font(.title3)
                            .foregroundStyle(isSelected ? .red : Color(.systemGray3))
                    }
                    .padding(14)
                    .background(isSelected ? Color.red.opacity(0.06) : Color(.secondarySystemGroupedBackground))
                    .clipShape(.rect(cornerRadius: 12))
                    .overlay(
                        RoundedRectangle(cornerRadius: 12)
                            .stroke(isSelected ? Color.red.opacity(0.3) : .clear, lineWidth: 1)
                    )
                }
                .buttonStyle(.plain)
            }
        }
    }

    private var diagnoseButton: some View {
        Button {
            viewModel.diagnose()
        } label: {
            Label("Diagnose Issues", systemImage: "stethoscope")
                .frame(maxWidth: .infinity)
                .fontWeight(.semibold)
        }
        .buttonStyle(.borderedProminent)
        .tint(.red)
        .disabled(viewModel.selectedIssues.isEmpty)
        .padding(.bottom, 12)
    }

    private func issueColor(_ issue: GrainIssue) -> Color {
        switch issue.color {
        case "red": return .red
        case "orange": return .orange
        case "yellow": return .yellow
        case "brown": return .brown
        case "purple": return .purple
        case "blue": return .blue
        default: return .secondary
        }
    }
}

struct DiagnosisResultsView: View {
    let results: [TroubleshootingResult]
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 24) {
                    ForEach(results) { result in
                        issueResultCard(result)
                    }
                }
                .padding(.horizontal)
                .padding(.vertical, 12)
            }
            .background(Color(.systemGroupedBackground))
            .navigationTitle("Diagnosis")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Done") { dismiss() }
                }
            }
        }
    }

    private func issueResultCard(_ result: TroubleshootingResult) -> some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack(spacing: 10) {
                Image(systemName: result.issue.icon)
                    .font(.title2)
                    .foregroundStyle(.red)
                Text(result.issue.rawValue)
                    .font(.title3.bold())
            }

            VStack(alignment: .leading, spacing: 6) {
                Text("Likely Causes")
                    .font(.caption.bold())
                    .foregroundStyle(.secondary)
                ForEach(result.likelyCauses, id: \.self) { cause in
                    HStack(alignment: .top, spacing: 8) {
                        Circle()
                            .fill(.red.opacity(0.6))
                            .frame(width: 5, height: 5)
                            .padding(.top, 6)
                        Text(cause)
                            .font(.subheadline)
                    }
                }
            }

            VStack(alignment: .leading, spacing: 8) {
                Text("Recommended Adjustments")
                    .font(.caption.bold())
                    .foregroundStyle(.secondary)
                ForEach(result.adjustments.sorted(by: { $0.priority < $1.priority })) { adj in
                    HStack(alignment: .top, spacing: 10) {
                        Image(systemName: adj.direction.icon)
                            .foregroundStyle(adjustmentColor(adj.direction))
                            .frame(width: 22)
                        VStack(alignment: .leading, spacing: 2) {
                            HStack {
                                Text(adj.parameter)
                                    .font(.subheadline.bold())
                                Text("— \(adj.direction.rawValue)")
                                    .font(.caption)
                                    .foregroundStyle(.secondary)
                            }
                            Text(adj.detail)
                                .font(.caption)
                                .foregroundStyle(.secondary)
                        }
                    }
                }
            }

            VStack(alignment: .leading, spacing: 6) {
                Text("Priority Order")
                    .font(.caption.bold())
                    .foregroundStyle(.secondary)
                ForEach(Array(result.priorityOrder.enumerated()), id: \.offset) { index, step in
                    HStack(spacing: 8) {
                        Text("\(index + 1)")
                            .font(.caption2.bold())
                            .frame(width: 20, height: 20)
                            .background(.red.opacity(0.15))
                            .foregroundStyle(.red)
                            .clipShape(Circle())
                        Text(step)
                            .font(.caption)
                    }
                }
            }

            HStack(alignment: .top, spacing: 8) {
                Image(systemName: "gearshape.2.fill")
                    .font(.caption)
                    .foregroundStyle(.blue)
                    .padding(.top, 2)
                Text(result.automationTip)
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
            .padding(10)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(Color.blue.opacity(0.06))
            .clipShape(.rect(cornerRadius: 8))
        }
        .padding()
        .background(Color(.secondarySystemGroupedBackground))
        .clipShape(.rect(cornerRadius: 16))
    }

    private func adjustmentColor(_ direction: AdjustmentDirection) -> Color {
        switch direction {
        case .increase: return .orange
        case .decrease: return .blue
        case .check: return .purple
        case .adjust: return .green
        }
    }
}
