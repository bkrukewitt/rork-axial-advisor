import SwiftUI

struct AdminPanelView: View {
    @Environment(\.dismiss) private var dismiss
    @State private var selectedTab: Int = 0

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                Picker("Section", selection: $selectedTab) {
                    Text("Tips").tag(0)
                    Text("Quick Issues").tag(1)
                }
                .pickerStyle(.segmented)
                .padding(.horizontal)
                .padding(.top, 8)

                switch selectedTab {
                case 0:
                    AdminTipsEditor()
                case 1:
                    AdminIssuesEditor()
                default:
                    EmptyView()
                }
            }
            .background(Color(.systemGroupedBackground))
            .navigationTitle("Admin Panel")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button("Done") { dismiss() }
                }
            }
        }
    }
}

struct AdminTipsEditor: View {
    @State private var tips: [QuickTip] = SupabaseService.shared.quickTips
    @State private var isSaving: Bool = false

    var body: some View {
        List {
            ForEach($tips) { $tip in
                Section {
                    TextField("Title", text: $tip.title)
                    TextField("Subtitle", text: $tip.subtitle)
                    TextField("SF Symbol", text: $tip.icon)
                    TextEditor(text: $tip.content)
                        .frame(minHeight: 80)
                }
            }
            .onDelete { offsets in
                tips.remove(atOffsets: offsets)
            }

            Section {
                Button {
                    let newTip = QuickTip(
                        id: UUID().uuidString,
                        title: "New Tip",
                        subtitle: "Description",
                        icon: "lightbulb.fill",
                        content: "Tip content goes here."
                    )
                    tips.append(newTip)
                } label: {
                    Label("Add Tip", systemImage: "plus.circle.fill")
                }
            }
        }
        .listStyle(.insetGrouped)
        .safeAreaInset(edge: .bottom) {
            Button {
                isSaving = true
                Task {
                    await SupabaseService.shared.saveQuickTips(tips)
                    isSaving = false
                }
            } label: {
                if isSaving {
                    ProgressView()
                        .frame(maxWidth: .infinity)
                } else {
                    Text("Save Changes")
                        .font(.headline)
                        .frame(maxWidth: .infinity)
                }
            }
            .buttonStyle(.borderedProminent)
            .tint(.red)
            .disabled(isSaving)
            .padding()
            .background(.bar)
        }
    }
}

struct AdminIssuesEditor: View {
    @State private var issues: [QuickIssue] = SupabaseService.shared.quickIssues
    @State private var isSaving: Bool = false

    var body: some View {
        List {
            ForEach($issues) { $issue in
                Section {
                    TextField("Label", text: $issue.label)
                    TextField("SF Symbol", text: $issue.icon)
                    TextEditor(text: $issue.response)
                        .frame(minHeight: 100)
                }
            }
            .onDelete { offsets in
                issues.remove(atOffsets: offsets)
            }

            Section {
                Button {
                    let newIssue = QuickIssue(
                        id: UUID().uuidString,
                        label: "New Issue",
                        icon: "exclamationmark.circle.fill",
                        response: "Expert response goes here."
                    )
                    issues.append(newIssue)
                } label: {
                    Label("Add Issue", systemImage: "plus.circle.fill")
                }
            }
        }
        .listStyle(.insetGrouped)
        .safeAreaInset(edge: .bottom) {
            Button {
                isSaving = true
                Task {
                    await SupabaseService.shared.saveQuickIssues(issues)
                    isSaving = false
                }
            } label: {
                if isSaving {
                    ProgressView()
                        .frame(maxWidth: .infinity)
                } else {
                    Text("Save Changes")
                        .font(.headline)
                        .frame(maxWidth: .infinity)
                }
            }
            .buttonStyle(.borderedProminent)
            .tint(.red)
            .disabled(isSaving)
            .padding()
            .background(.bar)
        }
    }
}
