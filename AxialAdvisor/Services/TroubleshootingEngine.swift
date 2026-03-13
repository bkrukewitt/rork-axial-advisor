import Foundation

struct TroubleshootingEngine {
    static func diagnose(issues: Set<GrainIssue>, cropType: CropType) -> [TroubleshootingResult] {
        issues.map { issue in
            diagnoseIssue(issue, cropType: cropType)
        }.sorted { $0.adjustments.count > $1.adjustments.count }
    }

    private static func diagnoseIssue(_ issue: GrainIssue, cropType: CropType) -> TroubleshootingResult {
        switch issue {
        case .crackedGrain:
            return TroubleshootingResult(
                issue: issue,
                likelyCauses: [
                    "Rotor speed too high",
                    "Concave clearance too tight",
                    "Low grain moisture (brittle kernels)",
                    "Worn rasp bars or concave"
                ],
                adjustments: [
                    Adjustment(parameter: "Rotor Speed", direction: .decrease, detail: "Reduce 25–50 RPM at a time", priority: 1),
                    Adjustment(parameter: "Concave Clearance", direction: .increase, detail: "Open 2–3 mm", priority: 2),
                    Adjustment(parameter: "Ground Speed", direction: .decrease, detail: "Slow down to reduce material load", priority: 3),
                    Adjustment(parameter: "Rasp Bars", direction: .check, detail: "Inspect for wear — replace if leading edge is rounded", priority: 4)
                ],
                priorityOrder: ["Reduce rotor speed first", "Then widen concave", "Finally reduce ground speed"],
                automationTip: "Set automation to Quality Priority mode. Allow 2–3 passes to stabilize after changes."
            )
        case .foreignMaterial:
            return TroubleshootingResult(
                issue: issue,
                likelyCauses: [
                    "Fan speed too low",
                    "Top sieve opening too wide",
                    "Bottom sieve opening too wide",
                    "Sieve condition — damaged or worn"
                ],
                adjustments: [
                    Adjustment(parameter: "Fan Speed", direction: .increase, detail: "Increase 25–50 RPM", priority: 1),
                    Adjustment(parameter: "Top Sieve", direction: .decrease, detail: "Close 1–2 mm", priority: 2),
                    Adjustment(parameter: "Bottom Sieve", direction: .decrease, detail: "Close 1 mm", priority: 3),
                    Adjustment(parameter: "Sieves", direction: .check, detail: "Inspect for damage or plugging", priority: 4)
                ],
                priorityOrder: ["Increase fan speed first", "Then tighten top sieve", "Check sieves for damage"],
                automationTip: "Automation may widen sieves in heavy material. Override temporarily if FM is unacceptable."
            )
        case .unthreshedKernels:
            return TroubleshootingResult(
                issue: issue,
                likelyCauses: [
                    "Rotor speed too low",
                    "Concave clearance too wide",
                    "High grain moisture",
                    "Ground speed too fast"
                ],
                adjustments: [
                    Adjustment(parameter: "Rotor Speed", direction: .increase, detail: "Increase 25–50 RPM", priority: 1),
                    Adjustment(parameter: "Concave Clearance", direction: .decrease, detail: "Tighten 2–3 mm", priority: 2),
                    Adjustment(parameter: "Ground Speed", direction: .decrease, detail: "Reduce to allow more processing time", priority: 3)
                ],
                priorityOrder: ["Increase rotor speed", "Tighten concave", "Reduce ground speed"],
                automationTip: "Automation should increase rotor aggressiveness. Allow 3 passes before manual changes."
            )
        case .dirtySample:
            return TroubleshootingResult(
                issue: issue,
                likelyCauses: [
                    "Fan speed too low",
                    "Sieve openings too large",
                    "Sieve damage or plugging",
                    "Excessive green material in crop"
                ],
                adjustments: [
                    Adjustment(parameter: "Fan Speed", direction: .increase, detail: "Increase 50–100 RPM", priority: 1),
                    Adjustment(parameter: "Top Sieve", direction: .decrease, detail: "Close 2–3 mm", priority: 2),
                    Adjustment(parameter: "Bottom Sieve", direction: .decrease, detail: "Close 1–2 mm", priority: 3),
                    Adjustment(parameter: "Sieves", direction: .check, detail: "Clean and inspect for plugging", priority: 4)
                ],
                priorityOrder: ["Increase fan speed significantly", "Tighten both sieves", "Clean sieves if plugged"],
                automationTip: "If running in Throughput mode, switch to Balanced or Quality to prioritize sample cleanliness."
            )
        case .whiteCaps:
            return TroubleshootingResult(
                issue: issue,
                likelyCauses: [
                    "Rotor speed too low for corn",
                    "Concave clearance too wide",
                    "Corn not fully mature",
                    "High moisture content"
                ],
                adjustments: [
                    Adjustment(parameter: "Rotor Speed", direction: .increase, detail: "Increase 25–50 RPM carefully", priority: 1),
                    Adjustment(parameter: "Concave Clearance", direction: .decrease, detail: "Tighten 1–2 mm", priority: 2),
                    Adjustment(parameter: "Ground Speed", direction: .decrease, detail: "Allow more processing time", priority: 3)
                ],
                priorityOrder: ["Small rotor speed increase first", "Tighten concave slightly", "Monitor for cracking"],
                automationTip: "Balance between white caps and cracking. Adjust in small increments."
            )
        case .tailingsOverload:
            return TroubleshootingResult(
                issue: issue,
                likelyCauses: [
                    "Sieves too tight",
                    "Fan speed too high",
                    "Rotor speed too low (unthreshed material recirculating)",
                    "Ground speed too fast"
                ],
                adjustments: [
                    Adjustment(parameter: "Top Sieve", direction: .increase, detail: "Open 2–3 mm", priority: 1),
                    Adjustment(parameter: "Fan Speed", direction: .decrease, detail: "Reduce 25–50 RPM", priority: 2),
                    Adjustment(parameter: "Rotor Speed", direction: .increase, detail: "Increase if unthreshed material in tailings", priority: 3),
                    Adjustment(parameter: "Ground Speed", direction: .decrease, detail: "Reduce material throughput", priority: 4)
                ],
                priorityOrder: ["Open top sieve", "Reduce fan if blowing grain over", "Check tailings for unthreshed"],
                automationTip: "High tailings return triggers automation adjustments. Let it stabilize for 2 passes."
            )
        case .rotorLoss:
            return TroubleshootingResult(
                issue: issue,
                likelyCauses: [
                    "Ground speed too fast",
                    "Rotor speed too high (throwing grain out)",
                    "Concave clearance too tight",
                    "Worn concave or rotor components"
                ],
                adjustments: [
                    Adjustment(parameter: "Ground Speed", direction: .decrease, detail: "Primary adjustment — reduce 0.5 mph", priority: 1),
                    Adjustment(parameter: "Rotor Speed", direction: .decrease, detail: "Reduce if grain is being thrown past concave", priority: 2),
                    Adjustment(parameter: "Concave Clearance", direction: .adjust, detail: "May need slight opening to prevent grain bouncing off", priority: 3),
                    Adjustment(parameter: "Loss Monitor", direction: .check, detail: "Verify calibration — do a drop pan test", priority: 4)
                ],
                priorityOrder: ["Reduce ground speed first", "Then adjust rotor speed", "Verify with drop pan test"],
                automationTip: "Loss sensors must be calibrated for accurate automation response. Recalibrate if readings seem off."
            )
        case .shoeLoss:
            return TroubleshootingResult(
                issue: issue,
                likelyCauses: [
                    "Fan speed too high",
                    "Sieves too tight",
                    "Uneven material distribution",
                    "Operating on slopes"
                ],
                adjustments: [
                    Adjustment(parameter: "Fan Speed", direction: .decrease, detail: "Reduce 25–50 RPM", priority: 1),
                    Adjustment(parameter: "Top Sieve", direction: .increase, detail: "Open 1–2 mm to allow grain through faster", priority: 2),
                    Adjustment(parameter: "Bottom Sieve", direction: .increase, detail: "Open 1 mm", priority: 3),
                    Adjustment(parameter: "Self-Leveling", direction: .check, detail: "Verify cleaning shoe leveling system is functioning on slopes", priority: 4)
                ],
                priorityOrder: ["Reduce fan speed", "Open sieves slightly", "Check leveling on slopes"],
                automationTip: "Shoe loss on slopes may not be correctable by automation alone. Reduce ground speed on hillsides."
            )
        }
    }
}
