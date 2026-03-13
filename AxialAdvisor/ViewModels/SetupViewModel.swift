import SwiftUI
import SwiftData

@Observable
class SetupViewModel {
    var combineModel: CombineModel = .x8250
    var headerType: HeaderType = .cornHead
    var headerSize: Int = 12
    var cropType: CropType = .corn
    var moisture: MoistureRange = .moderate
    var yieldEstimate: YieldEstimate = .high
    var fieldConditions: Set<FieldCondition> = [.normal]
    var isFoodGrade: Bool = false
    var currentStep: Int = 0
    var recommendation: SetupRecommendation?
    var showResult: Bool = false

    let totalSteps = 4

    var stepTitle: String {
        switch currentStep {
        case 0: return "Combine & Header"
        case 1: return "Crop & Conditions"
        case 2: return "Field Conditions"
        case 3: return "Review & Generate"
        default: return ""
        }
    }

    func nextStep() {
        if currentStep < totalSteps - 1 {
            currentStep += 1
        }
    }

    func previousStep() {
        if currentStep > 0 {
            currentStep -= 1
        }
    }

    func generateRecommendation() {
        recommendation = RecommendationEngine.generateRecommendation(
            combineModel: combineModel,
            headerType: headerType,
            headerSize: headerSize,
            cropType: cropType,
            moisture: moisture,
            yieldEstimate: yieldEstimate,
            fieldConditions: fieldConditions,
            isFoodGrade: isFoodGrade
        )
        showResult = true
    }

    func toggleFieldCondition(_ condition: FieldCondition) {
        if condition == .normal {
            fieldConditions = [.normal]
        } else {
            fieldConditions.remove(.normal)
            if fieldConditions.contains(condition) {
                fieldConditions.remove(condition)
                if fieldConditions.isEmpty {
                    fieldConditions = [.normal]
                }
            } else {
                fieldConditions.insert(condition)
            }
        }
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
        combineModel = .x8250
        headerType = .cornHead
        headerSize = 12
        cropType = .corn
        moisture = .moderate
        yieldEstimate = .high
        fieldConditions = [.normal]
        isFoodGrade = false
        currentStep = 0
        recommendation = nil
        showResult = false
    }
}
