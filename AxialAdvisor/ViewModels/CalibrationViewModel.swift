import SwiftUI
import SwiftData

@Observable
class CalibrationViewModel {
    var currentRecord: CalibrationRecord?

    func loadOrCreateRecord(modelContext: ModelContext) {
        let calendar = Calendar.current
        let year = calendar.component(.year, from: Date())
        let currentSeason = "\(year)"

        let descriptor = FetchDescriptor<CalibrationRecord>(
            predicate: #Predicate { $0.season == currentSeason },
            sortBy: [SortDescriptor(\.dateCreated, order: .reverse)]
        )

        if let existing = try? modelContext.fetch(descriptor).first {
            currentRecord = existing
        } else {
            let record = CalibrationRecord(season: currentSeason)
            modelContext.insert(record)
            currentRecord = record
        }
    }
}
