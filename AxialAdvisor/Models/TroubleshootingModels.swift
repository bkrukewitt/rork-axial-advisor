import Foundation

nonisolated enum GrainIssue: String, CaseIterable, Identifiable, Codable, Sendable {
    case crackedGrain = "Cracked Grain"
    case foreignMaterial = "Foreign Material (FM)"
    case unthreshedKernels = "Unthreshed Kernels"
    case dirtySample = "Dirty Sample"
    case whiteCaps = "White Caps (Corn)"
    case tailingsOverload = "Tailings Overload"
    case rotorLoss = "Rotor Loss"
    case shoeLoss = "Shoe Loss"

    var id: String { rawValue }

    var icon: String {
        switch self {
        case .crackedGrain: return "xmark.circle.fill"
        case .foreignMaterial: return "leaf.circle.fill"
        case .unthreshedKernels: return "circle.dashed"
        case .dirtySample: return "aqi.medium"
        case .whiteCaps: return "circle.circle"
        case .tailingsOverload: return "arrow.uturn.backward.circle.fill"
        case .rotorLoss: return "arrow.down.circle.fill"
        case .shoeLoss: return "wind.circle.fill"
        }
    }

    var color: String {
        switch self {
        case .crackedGrain: return "red"
        case .foreignMaterial: return "orange"
        case .unthreshedKernels: return "yellow"
        case .dirtySample: return "brown"
        case .whiteCaps: return "purple"
        case .tailingsOverload: return "red"
        case .rotorLoss: return "orange"
        case .shoeLoss: return "blue"
        }
    }
}

nonisolated struct TroubleshootingResult: Identifiable, Sendable {
    let id = UUID()
    let issue: GrainIssue
    let likelyCauses: [String]
    let adjustments: [Adjustment]
    let priorityOrder: [String]
    let automationTip: String
}

nonisolated struct Adjustment: Identifiable, Sendable {
    let id = UUID()
    let parameter: String
    let direction: AdjustmentDirection
    let detail: String
    let priority: Int
}

nonisolated enum AdjustmentDirection: String, Sendable {
    case increase = "Increase"
    case decrease = "Decrease"
    case check = "Check"
    case adjust = "Adjust"

    var icon: String {
        switch self {
        case .increase: return "arrow.up.circle.fill"
        case .decrease: return "arrow.down.circle.fill"
        case .check: return "eye.circle.fill"
        case .adjust: return "slider.horizontal.3"
        }
    }
}
