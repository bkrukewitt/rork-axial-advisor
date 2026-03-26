import SwiftUI
import SwiftData

struct LogsView: View {
    @Query(sort: \SavedSetup.dateCreated, order: .reverse) private var setups: [SavedSetup]
    @Environment(\.modelContext) private var modelContext
    @State private var selectedSetup: SavedSetup?

    var body: some View {
        NavigationStack {
            Group {
                if setups.isEmpty {
                    ContentUnavailableView(
                        "No Saved Setups",
                        systemImage: "tray",
                        description: Text("Generate settings and save them to see your history here.")
                    )
                } else {
                    List {
                        ForEach(setups) { setup in
                            Button {
                                selectedSetup = setup
                            } label: {
                                LogRow(setup: setup)
                            }
                            .buttonStyle(.plain)
                        }
                        .onDelete(perform: deleteSetups)
                    }
                    .listStyle(.insetGrouped)
                }
            }
            .navigationTitle("Logs")
            .sheet(item: $selectedSetup) { setup in
                LogDetailView(setup: setup)
            }
        }
    }

    private func deleteSetups(at offsets: IndexSet) {
        for index in offsets {
            modelContext.delete(setups[index])
        }
    }
}

struct LogRow: View {
    let setup: SavedSetup

    var body: some View {
        HStack(spacing: 14) {
            Image(systemName: setup.isFoodGrade ? "star.circle.fill" : "slider.horizontal.3")
                .font(.title2)
                .foregroundStyle(setup.isFoodGrade ? .green : .red)
                .frame(width: 36)

            VStack(alignment: .leading, spacing: 4) {
                Text(setup.fieldName)
                    .font(.subheadline.bold())
                HStack(spacing: 6) {
                    Text(setup.cropType)
                    Text("·")
                        .foregroundStyle(.tertiary)
                    Text("Axial-Flow \(setup.combineModel)")
                }
                .font(.caption)
                .foregroundStyle(.secondary)

                Text(setup.dateCreated.formatted(date: .abbreviated, time: .shortened))
                    .font(.caption2)
                    .foregroundStyle(.tertiary)
            }

            Spacer()

            if setup.sampleQualityRating > 0 {
                HStack(spacing: 2) {
                    Image(systemName: "star.fill")
                        .font(.caption2)
                        .foregroundStyle(.yellow)
                    Text("\(setup.sampleQualityRating)")
                        .font(.caption2.bold())
                        .foregroundStyle(.secondary)
                }
            }

            Image(systemName: "chevron.right")
                .font(.caption)
                .foregroundStyle(.tertiary)
        }
        .padding(.vertical, 4)
    }
}

struct LogDetailView: View {
    let setup: SavedSetup
    @Environment(\.dismiss) private var dismiss
    @State private var notes: String
    @State private var qualityRating: Int

    init(setup: SavedSetup) {
        self.setup = setup
        _notes = State(initialValue: setup.notes)
        _qualityRating = State(initialValue: setup.sampleQualityRating)
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 20) {
                    detailHeader
                    settingsGrid
                    qualitySection
                    notesSection
                }
                .padding(.horizontal)
                .padding(.vertical, 12)
            }
            .background(Color(.systemGroupedBackground))
            .navigationTitle(setup.fieldName)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Done") {
                        setup.notes = notes
                        setup.sampleQualityRating = qualityRating
                        dismiss()
                    }
                }
            }
        }
    }

    private var detailHeader: some View {
        HStack(spacing: 14) {
            VStack(alignment: .leading, spacing: 4) {
                Text(setup.cropType)
                    .font(.title2.bold())
                Text("Axial-Flow \(setup.combineModel) · \(setup.headerType)")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                Text(setup.dateCreated.formatted(date: .long, time: .shortened))
                    .font(.caption)
                    .foregroundStyle(.tertiary)
            }
            Spacer()
            if setup.isFoodGrade {
                Label("Food Grade", systemImage: "star.circle.fill")
                    .font(.caption2.bold())
                    .foregroundStyle(.green)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(.green.opacity(0.12))
                    .clipShape(Capsule())
            }
        }
        .padding()
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color(.secondarySystemGroupedBackground))
        .clipShape(.rect(cornerRadius: 14))
    }

    private var settingsGrid: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Settings")
                .font(.headline)
                .padding(.leading, 4)

            LazyVGrid(columns: [GridItem(.flexible(), spacing: 10), GridItem(.flexible(), spacing: 10)], spacing: 10) {
                SettingCard(icon: "circle.grid.cross", label: "Concave", value: setup.concaveClearance)
                SettingCard(icon: "arrow.trianglehead.2.counterclockwise.rotate.90", label: "Rotor Speed", value: setup.rotorSpeed)
                SettingCard(icon: "wind", label: "Fan Speed", value: setup.fanSpeed)
                SettingCard(icon: "rectangle.split.1x2", label: "Top Sieve", value: setup.topSieve)
                SettingCard(icon: "rectangle.split.1x2.fill", label: "Bottom Sieve", value: setup.bottomSieve)
            }

            HStack(spacing: 8) {
                Label(setup.automationMode, systemImage: "gearshape.2")
                    .font(.caption)
                    .foregroundStyle(.secondary)
                Spacer()
                Text("Moisture: \(setup.moisture)")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
            .padding(.horizontal, 4)
        }
    }

    private var qualitySection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Label("Sample Quality Rating", systemImage: "star")
                .font(.subheadline.bold())
                .foregroundStyle(.secondary)

            HStack(spacing: 8) {
                ForEach(1...5, id: \.self) { star in
                    Button {
                        qualityRating = star
                    } label: {
                        Image(systemName: star <= qualityRating ? "star.fill" : "star")
                            .font(.title2)
                            .foregroundStyle(star <= qualityRating ? .yellow : Color(.systemGray3))
                    }
                }
                Spacer()
                if qualityRating > 0 {
                    Text("\(qualityRating)/5")
                        .font(.subheadline.bold())
                        .foregroundStyle(.secondary)
                }
            }
        }
        .padding()
        .background(Color(.secondarySystemGroupedBackground))
        .clipShape(.rect(cornerRadius: 14))
    }

    private var notesSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Label("Field Notes", systemImage: "note.text")
                .font(.subheadline.bold())
                .foregroundStyle(.secondary)

            TextField("Add notes about this setup...", text: $notes, axis: .vertical)
                .lineLimit(3...8)
                .font(.subheadline)
        }
        .padding()
        .background(Color(.secondarySystemGroupedBackground))
        .clipShape(.rect(cornerRadius: 14))
    }
}
