import SwiftUI
import SwiftData

struct RecommendationResultView: View {
    let recommendation: SetupRecommendation
    let viewModel: SetupViewModel
    @Environment(\.dismiss) private var dismiss
    @Environment(\.modelContext) private var modelContext
    @State private var showSaveSheet: Bool = false
    @State private var fieldName: String = ""

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 20) {
                    automationModeCard
                    settingsGrid
                    notesSection
                    if !recommendation.fieldConditionNotes.isEmpty {
                        conditionNotesSection
                    }
                    if !recommendation.foodGradeNotes.isEmpty {
                        foodGradeSection
                    }
                    automationGuidance
                }
                .padding(.horizontal)
                .padding(.vertical, 12)
            }
            .background(Color(.systemGroupedBackground))
            .navigationTitle("Recommended Settings")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Save", systemImage: "square.and.arrow.down") {
                        showSaveSheet = true
                    }
                }
                ToolbarItem(placement: .topBarLeading) {
                    Button("Done") { dismiss() }
                }
            }
            .alert("Save Setup", isPresented: $showSaveSheet) {
                TextField("Field Name", text: $fieldName)
                Button("Save") {
                    viewModel.saveSetup(fieldName: fieldName.isEmpty ? "Unnamed Field" : fieldName, modelContext: modelContext)
                    dismiss()
                }
                Button("Cancel", role: .cancel) {}
            } message: {
                Text("Enter a name for this field setup.")
            }
        }
    }

    private var automationModeCard: some View {
        HStack(spacing: 14) {
            Image(systemName: recommendation.automationMode.icon)
                .font(.system(size: 32))
                .foregroundStyle(.red)
            VStack(alignment: .leading, spacing: 4) {
                Text("Automation Mode")
                    .font(.caption)
                    .foregroundStyle(.secondary)
                Text(recommendation.automationMode.rawValue)
                    .font(.title3.bold())
                Text(recommendation.automationMode.description)
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
            Spacer()
        }
        .padding()
        .background(Color(.secondarySystemGroupedBackground))
        .clipShape(.rect(cornerRadius: 14))
    }

    private var settingsGrid: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Starting Settings")
                .font(.headline)
                .padding(.leading, 4)

            LazyVGrid(columns: [GridItem(.flexible(), spacing: 12), GridItem(.flexible(), spacing: 12)], spacing: 12) {
                SettingCard(icon: "circle.grid.cross", label: "Concave", value: recommendation.concaveClearance)
                SettingCard(icon: "arrow.trianglehead.2.counterclockwise.rotate.90", label: "Rotor Speed", value: recommendation.rotorSpeed)
                SettingCard(icon: "wind", label: "Fan Speed", value: recommendation.fanSpeed)
                SettingCard(icon: "rectangle.split.1x2", label: "Top Sieve", value: recommendation.topSieve)
                SettingCard(icon: "rectangle.split.1x2.fill", label: "Bottom Sieve", value: recommendation.bottomSieve)
            }
        }
    }

    private var notesSection: some View {
        VStack(alignment: .leading, spacing: 8) {
            Label("Notes", systemImage: "note.text")
                .font(.subheadline.bold())
                .foregroundStyle(.secondary)
            ForEach(recommendation.notes, id: \.self) { note in
                HStack(alignment: .top, spacing: 8) {
                    Image(systemName: "info.circle.fill")
                        .font(.caption)
                        .foregroundStyle(.blue)
                        .padding(.top, 2)
                    Text(note)
                        .font(.caption)
                }
            }
        }
        .padding()
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color(.secondarySystemGroupedBackground))
        .clipShape(.rect(cornerRadius: 14))
    }

    private var conditionNotesSection: some View {
        VStack(alignment: .leading, spacing: 8) {
            Label("Field Condition Adjustments", systemImage: "map")
                .font(.subheadline.bold())
                .foregroundStyle(.secondary)
            ForEach(recommendation.fieldConditionNotes, id: \.self) { note in
                HStack(alignment: .top, spacing: 8) {
                    Image(systemName: "exclamationmark.triangle.fill")
                        .font(.caption)
                        .foregroundStyle(.orange)
                        .padding(.top, 2)
                    Text(note)
                        .font(.caption)
                }
            }
        }
        .padding()
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color.orange.opacity(0.06))
        .clipShape(.rect(cornerRadius: 14))
    }

    private var foodGradeSection: some View {
        VStack(alignment: .leading, spacing: 8) {
            Label("Food-Grade Optimization", systemImage: "star.circle.fill")
                .font(.subheadline.bold())
                .foregroundStyle(.green)
            ForEach(recommendation.foodGradeNotes, id: \.self) { note in
                HStack(alignment: .top, spacing: 8) {
                    Image(systemName: "leaf.fill")
                        .font(.caption)
                        .foregroundStyle(.green)
                        .padding(.top, 2)
                    Text(note)
                        .font(.caption)
                }
            }
        }
        .padding()
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color.green.opacity(0.06))
        .clipShape(.rect(cornerRadius: 14))
    }

    private var automationGuidance: some View {
        VStack(alignment: .leading, spacing: 8) {
            Label("Automation Guidance", systemImage: "gearshape.2") 
                .font(.subheadline.bold())
                .foregroundStyle(.secondary)
            Text("Allow Harvest Automation 2–3 passes to stabilize after initial settings are entered. Avoid making manual adjustments during the stabilization period.")
                .font(.caption)
            Text("If grain sample quality deteriorates, switch to Quality Priority mode and reduce ground speed before adjusting rotor or cleaning settings.")
                .font(.caption)
                .foregroundStyle(.secondary)
        }
        .padding()
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color(.secondarySystemGroupedBackground))
        .clipShape(.rect(cornerRadius: 14))
    }
}

struct SettingCard: View {
    let icon: String
    let label: String
    let value: String

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Image(systemName: icon)
                .font(.title3)
                .foregroundStyle(.red)
            Text(label)
                .font(.caption)
                .foregroundStyle(.secondary)
            Text(value)
                .font(.subheadline.bold())
                .fixedSize(horizontal: false, vertical: true)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(12)
        .background(Color(.tertiarySystemGroupedBackground))
        .clipShape(.rect(cornerRadius: 10))
    }
}
