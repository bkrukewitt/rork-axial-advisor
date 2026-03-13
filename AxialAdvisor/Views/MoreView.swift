import SwiftUI

struct MoreView: View {
    @State private var adminTapCount: Int = 0
    @State private var showAdminPanel: Bool = false
    @State private var showPasscodeEntry: Bool = false

    var body: some View {
        NavigationStack {
            List {
                Section("About") {
                    HStack {
                        Label("App Version", systemImage: "info.circle")
                        Spacer()
                        Text("1.0.0")
                            .foregroundStyle(.secondary)
                    }
                    .contentShape(Rectangle())
                    .onLongPressGesture(minimumDuration: 0.5) {
                        adminTapCount += 1
                        if adminTapCount >= 5 {
                            adminTapCount = 0
                            showPasscodeEntry = true
                        }
                    }

                    Label("Axial Advisor", systemImage: "engine.combustion.fill")

                    Link(destination: URL(string: "https://www.caseih.com")!) {
                        Label("Case IH Website", systemImage: "globe")
                    }
                }

                Section("Disclaimers") {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Non-Affiliation Notice")
                            .font(.subheadline.bold())
                        Text("This app is not affiliated with, endorsed by, or sponsored by Case IH, CNH Industrial, or any of their subsidiaries.")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                    .padding(.vertical, 4)

                    VStack(alignment: .leading, spacing: 8) {
                        Text("Recommendation Disclaimer")
                            .font(.subheadline.bold())
                        Text("All recommendations provided by this app are guidelines only. Operator judgment is always required. Actual settings may vary based on field conditions, equipment condition, and crop variety. Always prioritize safety and equipment manufacturer guidelines.")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                    .padding(.vertical, 4)
                }

                Section("Support") {
                    Label("Report an Issue", systemImage: "exclamationmark.bubble")
                    Label("Feature Request", systemImage: "lightbulb")
                }
            }
            .listStyle(.insetGrouped)
            .navigationTitle("More")
            .sheet(isPresented: $showPasscodeEntry) {
                AdminPasscodeView(isUnlocked: $showAdminPanel)
            }
            .fullScreenCover(isPresented: $showAdminPanel) {
                AdminPanelView()
            }
        }
    }
}

struct AdminPasscodeView: View {
    @Binding var isUnlocked: Bool
    @Environment(\.dismiss) private var dismiss
    @State private var passcode: String = ""
    @State private var isSettingPasscode: Bool = false
    @State private var showError: Bool = false

    private let passcodeKey = "admin_passcode"

    private var savedPasscode: String? {
        UserDefaults.standard.string(forKey: passcodeKey)
    }

    var body: some View {
        NavigationStack {
            VStack(spacing: 24) {
                Image(systemName: "lock.shield.fill")
                    .font(.system(size: 48))
                    .foregroundStyle(.red)

                Text(isSettingPasscode ? "Set Admin Passcode" : "Enter Admin Passcode")
                    .font(.title3.bold())

                SecureField("Passcode", text: $passcode)
                    .textFieldStyle(.roundedBorder)
                    .frame(maxWidth: 200)
                    .multilineTextAlignment(.center)
                    .onSubmit { verifyPasscode() }

                if showError {
                    Text("Incorrect passcode")
                        .font(.caption)
                        .foregroundStyle(.red)
                }

                Button {
                    verifyPasscode()
                } label: {
                    Text(isSettingPasscode ? "Set Passcode" : "Unlock")
                        .font(.headline)
                        .frame(maxWidth: 200)
                }
                .buttonStyle(.borderedProminent)
                .tint(.red)
                .disabled(passcode.isEmpty)
            }
            .padding()
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
            }
            .onAppear {
                isSettingPasscode = savedPasscode == nil
            }
        }
    }

    private func verifyPasscode() {
        if isSettingPasscode {
            UserDefaults.standard.set(passcode, forKey: passcodeKey)
            dismiss()
            isUnlocked = true
        } else if passcode == savedPasscode {
            dismiss()
            isUnlocked = true
        } else {
            showError = true
            passcode = ""
        }
    }
}
