import SwiftUI

@Observable
class TroubleshooterViewModel {
    var selectedIssues: Set<GrainIssue> = []
    var cropType: CropType = .corn
    var results: [TroubleshootingResult] = []
    var showResults: Bool = false

    func toggleIssue(_ issue: GrainIssue) {
        if selectedIssues.contains(issue) {
            selectedIssues.remove(issue)
        } else {
            selectedIssues.insert(issue)
        }
    }

    func diagnose() {
        guard !selectedIssues.isEmpty else { return }
        results = TroubleshootingEngine.diagnose(issues: selectedIssues, cropType: cropType)
        showResults = true
    }

    func reset() {
        selectedIssues = []
        results = []
        showResults = false
    }
}
