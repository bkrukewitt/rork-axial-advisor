import Foundation

nonisolated enum CombineModel: String, CaseIterable, Identifiable, Codable, Sendable {
    case x7250 = "7250"
    case x8250 = "8250"
    case x9250 = "9250"

    var id: String { rawValue }

    var displayName: String {
        "Axial-Flow \(rawValue)"
    }

    var rotorSpeedRange: ClosedRange<Int> {
        switch self {
        case .x7250: return 200...900
        case .x8250: return 200...900
        case .x9250: return 200...1000
        }
    }
}

nonisolated enum HeaderType: String, CaseIterable, Identifiable, Codable, Sendable {
    case cornHead = "Corn Head"
    case draperHead = "Draper Head"
    case augerHead = "Auger Head"

    var id: String { rawValue }
}

nonisolated enum CropType: String, CaseIterable, Identifiable, Codable, Sendable {
    case corn = "Corn"
    case soybeans = "Soybeans"
    case wheat = "Wheat"
    case canola = "Canola"
    case oats = "Oats"
    case barley = "Barley"
    case sorghum = "Sorghum"

    var id: String { rawValue }

    var icon: String {
        switch self {
        case .corn: return "leaf.fill"
        case .soybeans: return "leaf.circle.fill"
        case .wheat: return "wind"
        case .canola: return "drop.fill"
        case .oats: return "leaf.arrow.circlepath"
        case .barley: return "wind.circle.fill"
        case .sorghum: return "sun.max.fill"
        }
    }
}

nonisolated enum MoistureRange: String, CaseIterable, Identifiable, Codable, Sendable {
    case veryDry = "< 13%"
    case dry = "13–16%"
    case moderate = "16–20%"
    case wet = "20–25%"
    case veryWet = "> 25%"

    var id: String { rawValue }

    var midpoint: Double {
        switch self {
        case .veryDry: return 11
        case .dry: return 14.5
        case .moderate: return 18
        case .wet: return 22.5
        case .veryWet: return 27
        }
    }
}

nonisolated enum YieldEstimate: String, CaseIterable, Identifiable, Codable, Sendable {
    case low = "< 150 bu/ac"
    case moderate = "150–200 bu/ac"
    case high = "200–250 bu/ac"
    case veryHigh = "> 250 bu/ac"

    var id: String { rawValue }

    var midpoint: Int {
        switch self {
        case .low: return 120
        case .moderate: return 175
        case .high: return 225
        case .veryHigh: return 275
        }
    }
}

nonisolated enum FieldCondition: String, CaseIterable, Identifiable, Codable, Sendable {
    case normal = "Normal"
    case lodged = "Lodged Crop"
    case highMoisture = "High Moisture"
    case downedCorn = "Downed Corn"
    case droughtStressed = "Drought Stressed"
    case variableYield = "Variable Yield Zones"
    case heavyResidue = "Heavy Residue"

    var id: String { rawValue }

    var icon: String {
        switch self {
        case .normal: return "checkmark.circle"
        case .lodged: return "arrow.down.right.circle"
        case .highMoisture: return "drop.circle"
        case .downedCorn: return "arrow.down.circle"
        case .droughtStressed: return "sun.max.trianglebadge.exclamationmark"
        case .variableYield: return "chart.line.uptrend.xyaxis"
        case .heavyResidue: return "rectangle.stack"
        }
    }

    var description: String {
        switch self {
        case .normal: return "Standard field conditions"
        case .lodged: return "Crop is leaning or flattened"
        case .highMoisture: return "Grain moisture above 20%"
        case .downedCorn: return "Stalks broken or down"
        case .droughtStressed: return "Lighter test weight, brittle stalks"
        case .variableYield: return "Significant yield variation across field"
        case .heavyResidue: return "Heavy straw or stalk material"
        }
    }
}

nonisolated enum AutomationMode: String, CaseIterable, Identifiable, Codable, Sendable {
    case quality = "Quality Priority"
    case throughput = "Throughput Priority"
    case balanced = "Balanced"

    var id: String { rawValue }

    var icon: String {
        switch self {
        case .quality: return "star.circle.fill"
        case .throughput: return "speedometer"
        case .balanced: return "scale.3d"
        }
    }

    var description: String {
        switch self {
        case .quality: return "Prioritizes grain sample quality and minimal damage"
        case .throughput: return "Maximizes acres per hour while maintaining acceptable quality"
        case .balanced: return "Equal weight on quality and throughput"
        }
    }
}
