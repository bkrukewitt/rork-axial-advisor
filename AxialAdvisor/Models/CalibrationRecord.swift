import Foundation
import SwiftData

@Model
final class CalibrationRecord {
    var season: String
    var dateCreated: Date
    var concaveZero: Bool
    var sieveCalibration: Bool
    var lossMonitor: Bool
    var yieldMonitor: Bool
    var headerHeight: Bool
    var moistureSensor: Bool
    var groundSpeed: Bool

    var completedCount: Int {
        [concaveZero, sieveCalibration, lossMonitor, yieldMonitor, headerHeight, moistureSensor, groundSpeed]
            .filter { $0 }.count
    }

    var totalCount: Int { 7 }

    var isComplete: Bool { completedCount == totalCount }

    var progressPercent: Double {
        Double(completedCount) / Double(totalCount)
    }

    init(
        season: String = "",
        dateCreated: Date = Date()
    ) {
        self.season = season
        self.dateCreated = dateCreated
        self.concaveZero = false
        self.sieveCalibration = false
        self.lossMonitor = false
        self.yieldMonitor = false
        self.headerHeight = false
        self.moistureSensor = false
        self.groundSpeed = false
    }
}
