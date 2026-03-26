import Foundation

struct RecommendationEngine {
    static func generateRecommendation(
        combineModel: CombineModel,
        headerType: HeaderType,
        headerSize: Int,
        cropType: CropType,
        moisture: MoistureRange,
        yieldEstimate: YieldEstimate,
        fieldConditions: Set<FieldCondition>,
        isFoodGrade: Bool
    ) -> SetupRecommendation {
        let concave = concaveClearance(crop: cropType, moisture: moisture, isFoodGrade: isFoodGrade)
        let rotor = rotorSpeed(crop: cropType, moisture: moisture, model: combineModel, isFoodGrade: isFoodGrade)
        let fan = fanSpeed(crop: cropType, moisture: moisture, yieldEstimate: yieldEstimate)
        let topSieve = topSieveOpening(crop: cropType, moisture: moisture)
        let bottomSieve = bottomSieveOpening(crop: cropType, moisture: moisture)
        let mode = recommendedAutomationMode(cropType: cropType, isFoodGrade: isFoodGrade)
        let notes = generalNotes(crop: cropType, moisture: moisture, yieldEstimate: yieldEstimate, header: headerType)
        let conditionNotes = fieldConditionNotes(conditions: fieldConditions, crop: cropType)
        let foodGrade = isFoodGrade ? foodGradeNotes(crop: cropType, moisture: moisture) : []

        return SetupRecommendation(
            concaveClearance: concave,
            rotorSpeed: rotor,
            fanSpeed: fan,
            topSieve: topSieve,
            bottomSieve: bottomSieve,
            automationMode: mode,
            notes: notes,
            fieldConditionNotes: conditionNotes,
            foodGradeNotes: foodGrade
        )
    }

    private static func concaveClearance(crop: CropType, moisture: MoistureRange, isFoodGrade: Bool) -> String {
        var base: String
        switch crop {
        case .corn:
            switch moisture {
            case .veryDry, .dry: base = "25–30 mm"
            case .moderate: base = "20–25 mm"
            case .wet, .veryWet: base = "15–20 mm"
            }
        case .soybeans:
            switch moisture {
            case .veryDry, .dry: base = "20–25 mm"
            case .moderate: base = "15–20 mm"
            case .wet, .veryWet: base = "12–18 mm"
            }
        case .wheat, .barley, .oats:
            switch moisture {
            case .veryDry, .dry: base = "12–15 mm"
            case .moderate: base = "10–12 mm"
            case .wet, .veryWet: base = "8–10 mm"
            }
        case .canola:
            base = "18–22 mm"
        case .sorghum:
            base = "15–20 mm"
        }
        if isFoodGrade && crop == .corn {
            base += " (widen 2–3 mm for food grade)"
        }
        return base
    }

    private static func rotorSpeed(crop: CropType, moisture: MoistureRange, model: CombineModel, isFoodGrade: Bool) -> String {
        var base: String
        switch crop {
        case .corn:
            switch moisture {
            case .veryDry, .dry: base = "350–450 RPM"
            case .moderate: base = "400–500 RPM"
            case .wet, .veryWet: base = "450–550 RPM"
            }
        case .soybeans:
            switch moisture {
            case .veryDry, .dry: base = "400–500 RPM"
            case .moderate: base = "450–550 RPM"
            case .wet, .veryWet: base = "500–600 RPM"
            }
        case .wheat, .barley, .oats:
            switch moisture {
            case .veryDry, .dry: base = "700–800 RPM"
            case .moderate: base = "750–850 RPM"
            case .wet, .veryWet: base = "800–900 RPM"
            }
        case .canola:
            base = "500–650 RPM"
        case .sorghum:
            base = "450–600 RPM"
        }
        if isFoodGrade && crop == .corn {
            base += " (reduce 50 RPM for food grade)"
        }
        return base
    }

    private static func fanSpeed(crop: CropType, moisture: MoistureRange, yieldEstimate: YieldEstimate) -> String {
        switch crop {
        case .corn:
            switch moisture {
            case .veryDry, .dry: return "950–1050 RPM"
            case .moderate: return "1000–1100 RPM"
            case .wet, .veryWet: return "1050–1150 RPM"
            }
        case .soybeans:
            switch moisture {
            case .veryDry, .dry: return "800–900 RPM"
            case .moderate: return "850–950 RPM"
            case .wet, .veryWet: return "900–1000 RPM"
            }
        case .wheat, .barley, .oats:
            return "750–950 RPM"
        case .canola:
            return "600–800 RPM"
        case .sorghum:
            return "800–1000 RPM"
        }
    }

    private static func topSieveOpening(crop: CropType, moisture: MoistureRange) -> String {
        switch crop {
        case .corn:
            switch moisture {
            case .veryDry, .dry: return "22–26 mm"
            case .moderate: return "24–28 mm"
            case .wet, .veryWet: return "26–30 mm"
            }
        case .soybeans:
            return "16–20 mm"
        case .wheat, .barley, .oats:
            return "10–14 mm"
        case .canola:
            return "8–12 mm"
        case .sorghum:
            return "14–18 mm"
        }
    }

    private static func bottomSieveOpening(crop: CropType, moisture: MoistureRange) -> String {
        switch crop {
        case .corn:
            switch moisture {
            case .veryDry, .dry: return "12–14 mm"
            case .moderate: return "14–16 mm"
            case .wet, .veryWet: return "14–18 mm"
            }
        case .soybeans:
            return "10–12 mm"
        case .wheat, .barley, .oats:
            return "6–8 mm"
        case .canola:
            return "4–6 mm"
        case .sorghum:
            return "8–10 mm"
        }
    }

    private static func recommendedAutomationMode(cropType: CropType, isFoodGrade: Bool) -> AutomationMode {
        if isFoodGrade { return .quality }
        switch cropType {
        case .corn, .soybeans: return .balanced
        case .wheat, .barley, .oats: return .throughput
        case .canola: return .quality
        case .sorghum: return .balanced
        }
    }

    private static func generalNotes(crop: CropType, moisture: MoistureRange, yieldEstimate: YieldEstimate, header: HeaderType) -> [String] {
        var notes: [String] = []
        notes.append("Allow Harvest Automation 2–3 passes to stabilize before making manual changes.")

        if moisture == .wet || moisture == .veryWet {
            notes.append("High moisture: expect more aggressive rotor and cleaning settings. Monitor tailings closely.")
        }
        if moisture == .veryDry {
            notes.append("Very dry conditions: reduce rotor speed to minimize cracking. Widen concave clearance.")
        }
        if yieldEstimate == .veryHigh {
            notes.append("High yield: may need to reduce ground speed to maintain sample quality.")
        }
        if crop == .canola {
            notes.append("Canola: use low fan speeds to prevent blowing lightweight seeds over.")
        }
        return notes
    }

    private static func fieldConditionNotes(conditions: Set<FieldCondition>, crop: CropType) -> [String] {
        var notes: [String] = []
        for condition in conditions {
            switch condition {
            case .normal:
                break
            case .lodged:
                notes.append("Lodged crop: reduce ground speed by 20–30%. Lower header to pick up material. Automation may fluctuate — allow extra stabilization time.")
            case .highMoisture:
                notes.append("High moisture: increase rotor speed 50–100 RPM. Tighten concave 2–3 mm. Expect higher fuel consumption.")
            case .downedCorn:
                notes.append("Downed corn: use aggressive deck plates. Reduce ground speed significantly. May need to harvest from one direction only.")
            case .droughtStressed:
                notes.append("Drought-stressed crop: reduce rotor speed to prevent shattering brittle kernels. Lighter test weight may affect yield monitor readings.")
            case .variableYield:
                notes.append("Variable yield zones: automation will adjust but allow 3–4 passes between zones. Consider manual fan speed adjustments in thin areas.")
            case .heavyResidue:
                notes.append("Heavy residue: ensure chopper/spreader is properly adjusted. May need to increase rotor speed to process heavy straw.")
            }
        }
        return notes
    }

    private static func foodGradeNotes(crop: CropType, moisture: MoistureRange) -> [String] {
        var notes: [String] = []
        notes.append("FOOD GRADE MODE: Gentle threshing is critical. Prioritize kernel integrity over throughput.")
        notes.append("Widen concave clearance 2–3 mm beyond standard settings to reduce kernel damage.")
        notes.append("Reduce rotor speed 50 RPM below standard recommendation.")
        notes.append("Set automation to Quality Priority mode.")
        if crop == .corn {
            notes.append("For food-grade corn: target < 3% cracked kernels and < 2% foreign material.")
            notes.append("Monitor grain tank sample every 15–20 minutes.")
        }
        if moisture == .veryDry || moisture == .dry {
            notes.append("Dry conditions increase cracking risk. Consider harvesting during higher-moisture hours (early morning).")
        }
        return notes
    }
}
