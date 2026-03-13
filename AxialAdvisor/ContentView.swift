import SwiftUI

struct ContentView: View {
    @State private var selectedTab: Int = 0

    var body: some View {
        TabView(selection: $selectedTab) {
            Tab("Dashboard", systemImage: "gauge.with.dots.needle.33percent", value: 0) {
                DashboardView()
            }
            Tab("Setup", systemImage: "slider.horizontal.3", value: 1) {
                SetupWizardView()
            }
            Tab("Calibrate", systemImage: "checkmark.seal", value: 2) {
                CalibrationView()
            }
            Tab("Diagnose", systemImage: "wrench.and.screwdriver", value: 3) {
                TroubleshooterView()
            }
            Tab("Saved", systemImage: "folder", value: 4) {
                SavedSetupsView()
            }
        }
        .tint(Color(.systemRed))
    }
}
