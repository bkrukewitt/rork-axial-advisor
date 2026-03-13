import SwiftUI
import SwiftData

struct SetupWizardView: View {
    @State private var viewModel = SetupViewModel()

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                progressBar
                    .padding(.horizontal)
                    .padding(.top, 8)

                TabView(selection: $viewModel.currentStep) {
                    step0CombineHeader
                        .tag(0)
                    step1CropConditions
                        .tag(1)
                    step2FieldConditions
                        .tag(2)
                    step3Review
                        .tag(3)
                }
                .tabViewStyle(.page(indexDisplayMode: .never))
                .animation(.easeInOut(duration: 0.3), value: viewModel.currentStep)

                navigationButtons
                    .padding()
            }
            .background(Color(.systemGroupedBackground))
            .navigationTitle(viewModel.stepTitle)
            .navigationBarTitleDisplayMode(.inline)
            .sheet(isPresented: $viewModel.showResult) {
                if let rec = viewModel.recommendation {
                    RecommendationResultView(recommendation: rec, viewModel: viewModel)
                }
            }
        }
    }

    private var progressBar: some View {
        HStack(spacing: 4) {
            ForEach(0..<viewModel.totalSteps, id: \.self) { step in
                Capsule()
                    .fill(step <= viewModel.currentStep ? Color.red : Color(.systemGray4))
                    .frame(height: 4)
            }
        }
    }

    private var step0CombineHeader: some View {
        ScrollView {
            VStack(spacing: 20) {
                SectionCard(title: "Combine Model", icon: "engine.combustion") {
                    Picker("Model", selection: $viewModel.combineModel) {
                        ForEach(CombineModel.allCases) { model in
                            Text(model.displayName).tag(model)
                        }
                    }
                    .pickerStyle(.segmented)
                }

                SectionCard(title: "Header Type", icon: "rectangle.split.3x1") {
                    Picker("Header", selection: $viewModel.headerType) {
                        ForEach(HeaderType.allCases) { header in
                            Text(header.rawValue).tag(header)
                        }
                    }
                    .pickerStyle(.segmented)
                }

                SectionCard(title: "Header Size", icon: "ruler") {
                    VStack(spacing: 8) {
                        HStack {
                            Text("\(viewModel.headerSize) rows")
                                .font(.title3.bold())
                                .monospacedDigit()
                            Spacer()
                        }
                        Picker("Rows", selection: $viewModel.headerSize) {
                            ForEach([6, 8, 12, 16, 18], id: \.self) { size in
                                Text("\(size)").tag(size)
                            }
                        }
                        .pickerStyle(.segmented)
                    }
                }
            }
            .padding(.horizontal)
            .padding(.vertical, 12)
        }
    }

    private var step1CropConditions: some View {
        ScrollView {
            VStack(spacing: 20) {
                SectionCard(title: "Crop Type", icon: "leaf") {
                    LazyVGrid(columns: [GridItem(.adaptive(minimum: 90), spacing: 8)], spacing: 8) {
                        ForEach(CropType.allCases) { crop in
                            Button {
                                viewModel.cropType = crop
                            } label: {
                                VStack(spacing: 6) {
                                    Image(systemName: crop.icon)
                                        .font(.title3)
                                    Text(crop.rawValue)
                                        .font(.caption)
                                }
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 10)
                                .background(viewModel.cropType == crop ? Color.red.opacity(0.15) : Color(.tertiarySystemGroupedBackground))
                                .foregroundStyle(viewModel.cropType == crop ? .red : .primary)
                                .clipShape(.rect(cornerRadius: 10))
                                .overlay(
                                    RoundedRectangle(cornerRadius: 10)
                                        .stroke(viewModel.cropType == crop ? Color.red : .clear, lineWidth: 1.5)
                                )
                            }
                            .buttonStyle(.plain)
                        }
                    }
                }

                SectionCard(title: "Grain Moisture", icon: "drop") {
                    Picker("Moisture", selection: $viewModel.moisture) {
                        ForEach(MoistureRange.allCases) { range in
                            Text(range.rawValue).tag(range)
                        }
                    }
                    .pickerStyle(.menu)
                    .frame(maxWidth: .infinity, alignment: .leading)
                }

                SectionCard(title: "Yield Estimate", icon: "chart.bar") {
                    Picker("Yield", selection: $viewModel.yieldEstimate) {
                        ForEach(YieldEstimate.allCases) { estimate in
                            Text(estimate.rawValue).tag(estimate)
                        }
                    }
                    .pickerStyle(.menu)
                    .frame(maxWidth: .infinity, alignment: .leading)
                }

                SectionCard(title: "Food-Grade Mode", icon: "star.circle") {
                    Toggle(isOn: $viewModel.isFoodGrade) {
                        VStack(alignment: .leading, spacing: 2) {
                            Text("Food-Grade Optimization")
                                .font(.subheadline)
                            Text("Prioritizes kernel integrity and sample quality")
                                .font(.caption)
                                .foregroundStyle(.secondary)
                        }
                    }
                    .tint(.green)
                }
            }
            .padding(.horizontal)
            .padding(.vertical, 12)
        }
    }

    private var step2FieldConditions: some View {
        ScrollView {
            VStack(spacing: 20) {
                SectionCard(title: "Field Conditions", icon: "map") {
                    VStack(spacing: 8) {
                        ForEach(FieldCondition.allCases) { condition in
                            Button {
                                viewModel.toggleFieldCondition(condition)
                            } label: {
                                let isSelected = viewModel.fieldConditions.contains(condition)
                                HStack(spacing: 12) {
                                    Image(systemName: condition.icon)
                                        .font(.title3)
                                        .frame(width: 32)
                                        .foregroundStyle(isSelected ? .red : .secondary)
                                    VStack(alignment: .leading, spacing: 2) {
                                        Text(condition.rawValue)
                                            .font(.subheadline.bold())
                                        Text(condition.description)
                                            .font(.caption)
                                            .foregroundStyle(.secondary)
                                    }
                                    Spacer()
                                    Image(systemName: isSelected ? "checkmark.circle.fill" : "circle")
                                        .foregroundStyle(isSelected ? .red : Color(.systemGray3))
                                }
                                .padding(12)
                                .background(isSelected ? Color.red.opacity(0.08) : Color(.tertiarySystemGroupedBackground))
                                .clipShape(.rect(cornerRadius: 10))
                            }
                            .buttonStyle(.plain)
                        }
                    }
                }
            }
            .padding(.horizontal)
            .padding(.vertical, 12)
        }
    }

    private var step3Review: some View {
        ScrollView {
            VStack(spacing: 20) {
                SectionCard(title: "Setup Summary", icon: "list.clipboard") {
                    VStack(spacing: 12) {
                        ReviewRow(label: "Combine", value: viewModel.combineModel.displayName)
                        ReviewRow(label: "Header", value: "\(viewModel.headerType.rawValue) (\(viewModel.headerSize) rows)")
                        ReviewRow(label: "Crop", value: viewModel.cropType.rawValue)
                        ReviewRow(label: "Moisture", value: viewModel.moisture.rawValue)
                        ReviewRow(label: "Yield", value: viewModel.yieldEstimate.rawValue)
                        ReviewRow(label: "Food Grade", value: viewModel.isFoodGrade ? "Yes" : "No")
                        ReviewRow(label: "Conditions", value: viewModel.fieldConditions.map(\.rawValue).joined(separator: ", "))
                    }
                }

                if viewModel.isFoodGrade {
                    HStack(spacing: 10) {
                        Image(systemName: "star.circle.fill")
                            .foregroundStyle(.green)
                        Text("Food-Grade mode will prioritize gentle threshing and kernel integrity.")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                    .padding()
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(Color.green.opacity(0.08))
                    .clipShape(.rect(cornerRadius: 12))
                }
            }
            .padding(.horizontal)
            .padding(.vertical, 12)
        }
    }

    private var navigationButtons: some View {
        HStack(spacing: 12) {
            if viewModel.currentStep > 0 {
                Button {
                    viewModel.previousStep()
                } label: {
                    Label("Back", systemImage: "chevron.left")
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(.bordered)
            }

            if viewModel.currentStep < viewModel.totalSteps - 1 {
                Button {
                    viewModel.nextStep()
                } label: {
                    Label("Next", systemImage: "chevron.right")
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(.borderedProminent)
                .tint(.red)
            } else {
                Button {
                    viewModel.generateRecommendation()
                } label: {
                    Label("Generate Settings", systemImage: "sparkles")
                        .frame(maxWidth: .infinity)
                        .fontWeight(.semibold)
                }
                .buttonStyle(.borderedProminent)
                .tint(.red)
            }
        }
    }
}

struct SectionCard<Content: View>: View {
    let title: String
    let icon: String
    @ViewBuilder let content: Content

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Label(title, systemImage: icon)
                .font(.subheadline.bold())
                .foregroundStyle(.secondary)
            content
        }
        .padding()
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color(.secondarySystemGroupedBackground))
        .clipShape(.rect(cornerRadius: 14))
    }
}

struct ReviewRow: View {
    let label: String
    let value: String

    var body: some View {
        HStack {
            Text(label)
                .font(.subheadline)
                .foregroundStyle(.secondary)
            Spacer()
            Text(value)
                .font(.subheadline.bold())
                .multilineTextAlignment(.trailing)
        }
    }
}
