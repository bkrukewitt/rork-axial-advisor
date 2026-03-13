import SwiftUI
import SwiftData

@Observable
class SetupViewModel {
    var combineModel: CombineModel = .x8250
    var headerType: HeaderType = .cornHead
    var cropType: CropType = .corn
    var moisture: MoistureRange = .moderate
    var yieldEstimate: YieldEstimate = .high
    var isFoodGrade: Bool = false
    var recommendation: SetupRecommendation?
    var showResults: Bool = false

    func generateRecommendation() {
        recommendation = RecommendationEngine.generateRecommendation(
            combineModel: combineModel,
            headerType: headerType,
            headerSize: 12,
            cropType: cropType,
            moisture: moisture,
            yieldEstimate: yieldEstimate,
            fieldConditions: [.normal],
            isFoodGrade: isFoodGrade
        )
        showResults = true
    }

    func saveSetup(fieldName: String, modelContext: ModelContext) {
        guard let rec = recommendation else { return }
        let setup = SavedSetup(
            fieldName: fieldName,
            combineModel: combineModel.rawValue,
            headerType: headerType.rawValue,
            cropType: cropType.rawValue,
            moisture: moisture.rawValue,
            yieldEstimate: yieldEstimate.rawValue,
            concaveClearance: rec.concaveClearance,
            rotorSpeed: rec.rotorSpeed,
            fanSpeed: rec.fanSpeed,
            topSieve: rec.topSieve,
            bottomSieve: rec.bottomSieve,
            automationMode: rec.automationMode.rawValue,
            isFoodGrade: isFoodGrade
        )
        modelContext.insert(setup)
    }

    func reset() {
        recommendation = nil
        showResults = false
    }
}
