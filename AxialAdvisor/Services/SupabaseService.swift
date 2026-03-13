import Foundation

@Observable
class SupabaseService {
    static let shared = SupabaseService()

    var quickTips: [QuickTip] = QuickTip.defaults
    var quickIssues: [QuickIssue] = QuickIssue.defaults

    private let supabaseURL: String
    private let supabaseKey: String

    private init() {
        self.supabaseURL = Config.EXPO_PUBLIC_SUPABASE_URL
        self.supabaseKey = Config.EXPO_PUBLIC_SUPABASE_ANON_KEY
        loadCachedData()
    }

    private var hasValidConfig: Bool {
        !supabaseURL.isEmpty && !supabaseKey.isEmpty
    }

    func fetchAll() async {
        guard hasValidConfig else { return }
        await fetchQuickTips()
        await fetchQuickIssues()
    }

    private func fetchQuickTips() async {
        guard let url = URL(string: "\(supabaseURL)/rest/v1/quick_tips?select=*&order=id") else { return }
        var request = URLRequest(url: url)
        request.setValue("Bearer \(supabaseKey)", forHTTPHeaderField: "Authorization")
        request.setValue(supabaseKey, forHTTPHeaderField: "apikey")

        do {
            let (data, response) = try await URLSession.shared.data(for: request)
            guard let httpResponse = response as? HTTPURLResponse, httpResponse.statusCode == 200 else { return }
            let decoded = try JSONDecoder().decode([QuickTip].self, from: data)
            quickTips = decoded
            cacheData(decoded, key: "cached_quick_tips")
        } catch {}
    }

    private func fetchQuickIssues() async {
        guard let url = URL(string: "\(supabaseURL)/rest/v1/quick_issues?select=*&order=id") else { return }
        var request = URLRequest(url: url)
        request.setValue("Bearer \(supabaseKey)", forHTTPHeaderField: "Authorization")
        request.setValue(supabaseKey, forHTTPHeaderField: "apikey")

        do {
            let (data, response) = try await URLSession.shared.data(for: request)
            guard let httpResponse = response as? HTTPURLResponse, httpResponse.statusCode == 200 else { return }
            let decoded = try JSONDecoder().decode([QuickIssue].self, from: data)
            quickIssues = decoded
            cacheData(decoded, key: "cached_quick_issues")
        } catch {}
    }

    func saveQuickTips(_ tips: [QuickTip]) async {
        quickTips = tips
        cacheData(tips, key: "cached_quick_tips")
        guard hasValidConfig else { return }
        guard let url = URL(string: "\(supabaseURL)/rest/v1/quick_tips") else { return }

        for tip in tips {
            var request = URLRequest(url: url)
            request.httpMethod = "POST"
            request.setValue("Bearer \(supabaseKey)", forHTTPHeaderField: "Authorization")
            request.setValue(supabaseKey, forHTTPHeaderField: "apikey")
            request.setValue("application/json", forHTTPHeaderField: "Content-Type")
            request.setValue("resolution=merge-duplicates", forHTTPHeaderField: "Prefer")
            request.httpBody = try? JSONEncoder().encode(tip)
            _ = try? await URLSession.shared.data(for: request)
        }
    }

    func saveQuickIssues(_ issues: [QuickIssue]) async {
        quickIssues = issues
        cacheData(issues, key: "cached_quick_issues")
        guard hasValidConfig else { return }
        guard let url = URL(string: "\(supabaseURL)/rest/v1/quick_issues") else { return }

        for issue in issues {
            var request = URLRequest(url: url)
            request.httpMethod = "POST"
            request.setValue("Bearer \(supabaseKey)", forHTTPHeaderField: "Authorization")
            request.setValue(supabaseKey, forHTTPHeaderField: "apikey")
            request.setValue("application/json", forHTTPHeaderField: "Content-Type")
            request.setValue("resolution=merge-duplicates", forHTTPHeaderField: "Prefer")
            request.httpBody = try? JSONEncoder().encode(issue)
            _ = try? await URLSession.shared.data(for: request)
        }
    }

    private func cacheData<T: Encodable>(_ data: T, key: String) {
        if let encoded = try? JSONEncoder().encode(data) {
            UserDefaults.standard.set(encoded, forKey: key)
        }
    }

    private func loadCachedData() {
        if let tipsData = UserDefaults.standard.data(forKey: "cached_quick_tips"),
           let tips = try? JSONDecoder().decode([QuickTip].self, from: tipsData) {
            quickTips = tips
        }
        if let issuesData = UserDefaults.standard.data(forKey: "cached_quick_issues"),
           let issues = try? JSONDecoder().decode([QuickIssue].self, from: issuesData) {
            quickIssues = issues
        }
    }
}
