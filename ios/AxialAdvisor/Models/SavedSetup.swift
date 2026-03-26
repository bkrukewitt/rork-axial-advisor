import Foundation
import SwiftData

@Model
final class SavedSetup {
    var fieldName: String
    var dateCreated: Date
    var combineModel: String
    var headerType: String
    var cropType: String
    var moisture: String
    var yieldEstimate: String
    var concaveClearance: String
    var rotorSpeed: String
    var fanSpeed: String
    var topSieve: String
    var bottomSieve: String
    var automationMode: String
    var notes: String
    var sampleQualityRating: Int
    var isFoodGrade: Bool

    init(
        fieldName: String,
        dateCreated: Date = Date(),
        combineModel: String,
        headerType: String,
        cropType: String,
        moisture: String,
        yieldEstimate: String,
        concaveClearance: String,
        rotorSpeed: String,
        fanSpeed: String,
        topSieve: String,
        bottomSieve: String,
        automationMode: String,
        notes: String = "",
        sampleQualityRating: Int = 0,
        isFoodGrade: Bool = false
    ) {
        self.fieldName = fieldName
        self.dateCreated = dateCreated
        self.combineModel = combineModel
        self.headerType = headerType
        self.cropType = cropType
        self.moisture = moisture
        self.yieldEstimate = yieldEstimate
        self.concaveClearance = concaveClearance
        self.rotorSpeed = rotorSpeed
        self.fanSpeed = fanSpeed
        self.topSieve = topSieve
        self.bottomSieve = bottomSieve
        self.automationMode = automationMode
        self.notes = notes
        self.sampleQualityRating = sampleQualityRating
        self.isFoodGrade = isFoodGrade
    }
}
