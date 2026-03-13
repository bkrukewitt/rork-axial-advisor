import SwiftUI
import SwiftData

struct DashboardView: View {
    @Query(sort: \CalibrationRecord.dateCreated, order: .reverse) private var calibrations: [CalibrationRecord]
    @Query(sort: \SavedSetup.dateCreated, order: .reverse) private var savedSetups: [SavedSetup]

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 20) {
                    headerSection
                    quickActionsGrid
                    calibrationStatusCard
                    recentSetupsSection
                    disclaimerSection
                }
                .padding(.horizontal)
                .padding(.bottom, 24)
            }
            .background(Color(.systemGroupedBackground))
            .navigationTitle("Axial Advisor")
        }
    }

    private var headerSection: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack(spacing: 12) {
                Image(systemName: "engine.combustion.fill")
                    .font(.system(size: 36))
                    .foregroundStyle(.red)
                VStack(alignment: .leading, spacing: 2) {
                    Text("Harvest Command Center")
                        .font(.title3.bold())
                    Text("Axial-Flow Combine Optimization")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                }
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding()
            .background(Color(.secondarySystemGroupedBackground))
            .clipShape(.rect(cornerRadius: 16))
        }
    }

    private var quickActionsGrid: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Quick Actions")
                .font(.headline)
                .padding(.leading, 4)

            LazyVGrid(columns: [GridItem(.flexible(), spacing: 12), GridItem(.flexible(), spacing: 12)], spacing: 12) {
                QuickActionCard(
                    icon: "slider.horizontal.3",
                    title: "New Setup",
                    subtitle: "Guided config",
                    color: .red,
                    tab: 1
                )
                QuickActionCard(
                    icon: "wrench.and.screwdriver",
                    title: "Troubleshoot",
                    subtitle: "Fix issues",
                    color: .orange,
                    tab: 3
                )
                QuickActionCard(
                    icon: "checkmark.seal",
                    title: "Calibrate",
                    subtitle: "Pre-harvest",
                    color: .blue,
                    tab: 2
                )
                QuickActionCard(
                    icon: "leaf.fill",
                    title: "Food Grade",
                    subtitle: "Quality mode",
                    color: .green,
                    tab: 1
                )
            }
        }
    }

    private var calibrationStatusCard: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Calibration Status")
                .font(.headline)
                .padding(.leading, 4)

            if let record = calibrations.first {
                VStack(alignment: .leading, spacing: 12) {
                    HStack {
                        VStack(alignment: .leading, spacing: 4) {
                            Text("Season \(record.season)")
                                .font(.subheadline.bold())
                            Text("\(record.completedCount) of \(record.totalCount) complete")
                                .font(.caption)
                                .foregroundStyle(.secondary)
                        }
                        Spacer()
                        ZStack {
                            Circle()
                                .stroke(Color(.systemGray5), lineWidth: 6)
                            Circle()
                                .trim(from: 0, to: record.progressPercent)
                                .stroke(record.isComplete ? .green : .blue, style: StrokeStyle(lineWidth: 6, lineCap: .round))
                                .rotationEffect(.degrees(-90))
                            Text("\(Int(record.progressPercent * 100))%")
                                .font(.caption2.bold())
                        }
                        .frame(width: 52, height: 52)
                    }

                    if !record.isComplete {
                        Text("Complete calibrations before harvest for best results")
                            .font(.caption)
                            .foregroundStyle(.orange)
                    }
                }
                .padding()
                .background(Color(.secondarySystemGroupedBackground))
                .clipShape(.rect(cornerRadius: 14))
            } else {
                HStack(spacing: 12) {
                    Image(systemName: "exclamationmark.triangle.fill")
                        .font(.title3)
                        .foregroundStyle(.orange)
                    VStack(alignment: .leading, spacing: 2) {
                        Text("No Calibration Record")
                            .font(.subheadline.bold())
                        Text("Start your pre-harvest checklist")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                    Spacer()
                }
                .padding()
                .background(Color(.secondarySystemGroupedBackground))
                .clipShape(.rect(cornerRadius: 14))
            }
        }
    }

    private var recentSetupsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Recent Setups")
                .font(.headline)
                .padding(.leading, 4)

            if savedSetups.isEmpty {
                HStack(spacing: 12) {
                    Image(systemName: "tray")
                        .font(.title3)
                        .foregroundStyle(.secondary)
                    VStack(alignment: .leading, spacing: 2) {
                        Text("No Saved Setups")
                            .font(.subheadline.bold())
                        Text("Run the setup wizard to get started")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                    Spacer()
                }
                .padding()
                .background(Color(.secondarySystemGroupedBackground))
                .clipShape(.rect(cornerRadius: 14))
            } else {
                ForEach(savedSetups.prefix(3)) { setup in
                    SavedSetupRow(setup: setup)
                }
            }
        }
    }

    private var disclaimerSection: some View {
        VStack(spacing: 8) {
            Text("Not affiliated with Case IH or CNH Industrial.")
                .font(.caption2)
                .foregroundStyle(.tertiary)
            Text("Recommendations are guidelines. Operator judgment required.")
                .font(.caption2)
                .foregroundStyle(.tertiary)
        }
        .frame(maxWidth: .infinity)
        .padding(.top, 8)
    }
}

struct QuickActionCard: View {
    let icon: String
    let title: String
    let subtitle: String
    let color: Color
    let tab: Int

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Image(systemName: icon)
                .font(.title2)
                .foregroundStyle(color)
            Text(title)
                .font(.subheadline.bold())
            Text(subtitle)
                .font(.caption)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding()
        .background(Color(.secondarySystemGroupedBackground))
        .clipShape(.rect(cornerRadius: 14))
    }
}
