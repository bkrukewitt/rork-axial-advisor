import SwiftUI
import SwiftData

struct SettingsAdvisorView: View {
    @Bindable var viewModel: SetupViewModel
    @Environment(\.modelContext) private var modelContext
    @State private var showSaveAlert: Bool = false
    @State private var fieldName: String = ""

    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                configForm
                showSettingsButton
                if viewModel.showResults, let rec = viewModel.recommendation {
                    resultsSection(rec)
                }
                quickTipsSection
            }
            .padding(.horizontal)
            .padding(.vertical, 12)
        }
        .scrollDismissesKeyboard(.interactively)
        .alert("Save Setup", isPresented: $showSaveAlert) {
            TextField("Field Name", text: $fieldName)
            Button("Save") {
                viewModel.saveSetup(
                    fieldName: fieldName.isEmpty ? "Unnamed Field" : fieldName,
                    modelContext: modelContext
                )
                fieldName = ""
            }
            Button("Cancel", role: .cancel) {}
        } message: {
            Text("Enter a name for this field setup.")
        }
    }

    private var configForm: some View {
        VStack(spacing: 14) {
            formRow(label: "Combine Model", icon: "engine.combustion") {
                Picker("Model", selection: $viewModel.combineModel) {
                    ForEach(CombineModel.allCases) { model in
                        Text(model.displayName).tag(model)
                    }
                }
            }

            formRow(label: "Header Type", icon: "rectangle.split.3x1") {
                Picker("Header", selection: $viewModel.headerType) {
                    ForEach(HeaderType.allCases) { header in
                        Text(header.rawValue).tag(header)
                    }
                }
            }

            formRow(label: "Crop Type", icon: "leaf") {
                Picker("Crop", selection: $viewModel.cropType) {
                    ForEach(CropType.allCases) { crop in
                        Text(crop.rawValue).tag(crop)
                    }
                }
            }

            formRow(label: "Moisture Level", icon: "drop") {
                Picker("Moisture", selection: $viewModel.moisture) {
                    ForEach(MoistureRange.allCases) { range in
                        Text(range.rawValue).tag(range)
                    }
                }
            }

            formRow(label: "Yield Estimate", icon: "chart.bar") {
                Picker("Yield", selection: $viewModel.yieldEstimate) {
                    ForEach(YieldEstimate.allCases) { estimate in
                        Text(estimate.rawValue).tag(estimate)
                    }
                }
            }

            HStack {
                Label("Food-Grade Mode", systemImage: "star.circle")
                    .font(.subheadline)
                Spacer()
                Toggle("", isOn: $viewModel.isFoodGrade)
                    .labelsHidden()
                    .tint(.red)
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 12)
            .background(Color(.secondarySystemGroupedBackground))
            .clipShape(.rect(cornerRadius: 12))
        }
    }

    private func formRow<Content: View>(label: String, icon: String, @ViewBuilder content: () -> Content) -> some View {
        HStack {
            Label(label, systemImage: icon)
                .font(.subheadline)
            Spacer()
            content()
                .tint(.red)
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 12)
        .background(Color(.secondarySystemGroupedBackground))
        .clipShape(.rect(cornerRadius: 12))
    }

    private var showSettingsButton: some View {
        Button {
            withAnimation(.snappy) {
                viewModel.generateRecommendation()
            }
        } label: {
            Label("Show Settings", systemImage: "sparkles")
                .font(.headline)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 14)
        }
        .buttonStyle(.borderedProminent)
        .tint(.red)
        .sensoryFeedback(.impact(weight: .medium), trigger: viewModel.showResults)
    }

    private func resultsSection(_ rec: SetupRecommendation) -> some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack {
                Text("Recommended Settings")
                    .font(.headline)
                Spacer()
                Button {
                    showSaveAlert = true
                } label: {
                    Label("Save", systemImage: "square.and.arrow.down")
                        .font(.subheadline)
                }
                .tint(.red)
            }

            LazyVGrid(columns: [GridItem(.flexible(), spacing: 10), GridItem(.flexible(), spacing: 10)], spacing: 10) {
                SettingCard(icon: "circle.grid.cross", label: "Concave", value: rec.concaveClearance)
                SettingCard(icon: "arrow.trianglehead.2.counterclockwise.rotate.90", label: "Rotor Speed", value: rec.rotorSpeed)
                SettingCard(icon: "wind", label: "Fan Speed", value: rec.fanSpeed)
                SettingCard(icon: "rectangle.split.1x2", label: "Top Sieve", value: rec.topSieve)
                SettingCard(icon: "rectangle.split.1x2.fill", label: "Bottom Sieve", value: rec.bottomSieve)
            }

            HStack(spacing: 8) {
                Image(systemName: rec.automationMode.icon)
                    .foregroundStyle(.red)
                Text(rec.automationMode.rawValue)
                    .font(.subheadline.bold())
                Text("— \(rec.automationMode.description)")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
            .padding(12)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(Color.red.opacity(0.06))
            .clipShape(.rect(cornerRadius: 10))

            if !rec.notes.isEmpty {
                VStack(alignment: .leading, spacing: 6) {
                    ForEach(rec.notes, id: \.self) { note in
                        HStack(alignment: .top, spacing: 8) {
                            Image(systemName: "info.circle.fill")
                                .font(.caption)
                                .foregroundStyle(.blue)
                                .padding(.top, 2)
                            Text(note)
                                .font(.caption)
                                .foregroundStyle(.secondary)
                        }
                    }
                }
            }

            if !rec.foodGradeNotes.isEmpty {
                VStack(alignment: .leading, spacing: 6) {
                    Label("Food-Grade", systemImage: "star.circle.fill")
                        .font(.caption.bold())
                        .foregroundStyle(.green)
                    ForEach(rec.foodGradeNotes, id: \.self) { note in
                        Text("• \(note)")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                }
                .padding(12)
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(Color.green.opacity(0.06))
                .clipShape(.rect(cornerRadius: 10))
            }
        }
        .padding(16)
        .background(Color(.secondarySystemGroupedBackground))
        .clipShape(.rect(cornerRadius: 14))
        .transition(.move(edge: .top).combined(with: .opacity))
    }

    private var quickTipsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Quick Tips")
                .font(.headline)
                .padding(.leading, 4)

            ScrollView(.horizontal) {
                HStack(spacing: 12) {
                    ForEach(SupabaseService.shared.quickTips) { tip in
                        QuickTipCard(tip: tip)
                    }
                }
            }
            .contentMargins(.horizontal, 4)
            .scrollIndicators(.hidden)
        }
    }
}

struct QuickTipCard: View {
    let tip: QuickTip
    @State private var showDetail: Bool = false

    var body: some View {
        Button {
            showDetail = true
        } label: {
            VStack(alignment: .leading, spacing: 8) {
                Image(systemName: tip.icon)
                    .font(.title2)
                    .foregroundStyle(.red)
                Text(tip.title)
                    .font(.subheadline.bold())
                    .foregroundStyle(.primary)
                Text(tip.subtitle)
                    .font(.caption)
                    .foregroundStyle(.secondary)
                    .lineLimit(2)
            }
            .frame(width: 150, alignment: .leading)
            .padding(14)
            .background(Color(.secondarySystemGroupedBackground))
            .clipShape(.rect(cornerRadius: 12))
        }
        .buttonStyle(.plain)
        .sheet(isPresented: $showDetail) {
            NavigationStack {
                ScrollView {
                    VStack(alignment: .leading, spacing: 16) {
                        HStack(spacing: 12) {
                            Image(systemName: tip.icon)
                                .font(.title)
                                .foregroundStyle(.red)
                            VStack(alignment: .leading, spacing: 2) {
                                Text(tip.title)
                                    .font(.title3.bold())
                                Text(tip.subtitle)
                                    .font(.subheadline)
                                    .foregroundStyle(.secondary)
                            }
                        }

                        Text(tip.content)
                            .font(.body)
                    }
                    .padding()
                }
                .navigationTitle("Tip")
                .navigationBarTitleDisplayMode(.inline)
                .toolbar {
                    ToolbarItem(placement: .topBarTrailing) {
                        Button("Done") { showDetail = false }
                    }
                }
            }
            .presentationDetents([.medium])
            .presentationDragIndicator(.visible)
        }
    }
}
