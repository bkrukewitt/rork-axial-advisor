import SwiftUI

struct ContentView: View {
    @State private var selectedTab: Int = 0

    var body: some View {
        TabView(selection: $selectedTab) {
            Tab("Home", systemImage: "slider.horizontal.3", value: 0) {
                HomeView()
            }
            Tab("Logs", systemImage: "folder", value: 1) {
                LogsView()
            }
            Tab("More", systemImage: "ellipsis.circle", value: 2) {
                MoreView()
            }
        }
        .tint(.red)
        .task {
            await SupabaseService.shared.fetchAll()
        }
    }
}
