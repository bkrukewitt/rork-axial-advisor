import Foundation

nonisolated struct SetupRecommendation: Identifiable, Sendable {
    let id = UUID()
    let concaveClearance: String
    let rotorSpeed: String
    let fanSpeed: String
    let topSieve: String
    let bottomSieve: String
    let automationMode: AutomationMode
    let notes: [String]
    let fieldConditionNotes: [String]
    let foodGradeNotes: [String]
}

nonisolated struct SettingRange: Sendable {
    let label: String
    let value: String
    let unit: String
    let icon: String
    let detail: String
}
