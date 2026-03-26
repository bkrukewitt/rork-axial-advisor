import SwiftUI

struct HomeView: View {
    @State private var selectedTab: Int = 0
    @State private var setupViewModel = SetupViewModel()
    @State private var chatViewModel = ExpertChatViewModel()

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                Picker("Mode", selection: $selectedTab) {
                    Text("Settings Advisor").tag(0)
                    Text("Ask the Expert").tag(1)
                }
                .pickerStyle(.segmented)
                .padding(.horizontal)
                .padding(.top, 8)
                .padding(.bottom, 4)

                if selectedTab == 0 {
                    SettingsAdvisorView(viewModel: setupViewModel)
                } else {
                    ExpertChatView(viewModel: chatViewModel)
                }
            }
            .background(Color(.systemGroupedBackground))
            .navigationTitle("Axial Advisor")
            .animation(.easeInOut(duration: 0.2), value: selectedTab)
        }
    }
}
