import Foundation

nonisolated struct QuickIssue: Identifiable, Codable, Sendable, Equatable {
    var id: String
    var label: String
    var icon: String
    var response: String

    static let defaults: [QuickIssue] = [
        QuickIssue(
            id: "cracked_grain",
            label: "Seeing Cracked Grain",
            icon: "xmark.circle.fill",
            response: "Cracked grain is usually caused by rotor speed being too high or concave clearance too tight.\n\n**Try these adjustments in order:**\n1. Reduce rotor speed 25–50 RPM\n2. Open concave clearance 2–3 mm\n3. Slow ground speed to reduce material load\n4. Inspect rasp bars for wear\n\nSet automation to Quality Priority mode. Allow 2–3 passes to stabilize after changes."
        ),
        QuickIssue(
            id: "high_rotor_loss",
            label: "High Rotor Loss",
            icon: "arrow.down.circle.fill",
            response: "High rotor loss is often caused by excessive ground speed or incorrect rotor/concave settings.\n\n**Try these adjustments:**\n1. Reduce ground speed by 0.5 mph\n2. Reduce rotor speed if grain is being thrown past the concave\n3. Slightly open concave to prevent grain bouncing off\n4. Verify loss monitor calibration with a drop pan test\n\nLoss sensors must be calibrated for accurate automation response."
        ),
        QuickIssue(
            id: "wet_corn",
            label: "Starter Settings for Wet Corn",
            icon: "drop.fill",
            response: "For wet corn (>20% moisture):\n\n**Starting settings:**\n- Rotor Speed: 450–550 RPM\n- Concave: 15–20 mm\n- Fan Speed: 1050–1150 RPM\n- Top Sieve: 26–30 mm\n- Bottom Sieve: 14–18 mm\n\nExpect more aggressive settings overall. Monitor tailings closely. Allow automation 3 passes to stabilize between adjustments."
        ),
        QuickIssue(
            id: "dirty_sample",
            label: "Dirty Sample",
            icon: "aqi.medium",
            response: "A dirty sample means cleaning shoe isn't removing enough material.\n\n**Try these adjustments:**\n1. Increase fan speed 50–100 RPM\n2. Close top sieve 2–3 mm\n3. Close bottom sieve 1–2 mm\n4. Clean and inspect sieves for plugging\n\nIf running in Throughput mode, switch to Balanced or Quality to prioritize sample cleanliness."
        ),
        QuickIssue(
            id: "foreign_material",
            label: "Too Much FM",
            icon: "leaf.circle.fill",
            response: "High foreign material (FM) is usually a cleaning shoe issue.\n\n**Adjustments in priority order:**\n1. Increase fan speed 25–50 RPM\n2. Close top sieve 1–2 mm\n3. Close bottom sieve 1 mm\n4. Inspect sieves for damage or plugging\n\nAutomation may widen sieves in heavy material. Override temporarily if FM is unacceptable."
        ),
        QuickIssue(
            id: "tailings_overload",
            label: "Tailings Overload",
            icon: "arrow.uturn.backward.circle.fill",
            response: "High tailings return means material is recirculating instead of being cleaned properly.\n\n**Try these adjustments:**\n1. Open top sieve 2–3 mm\n2. Reduce fan speed 25–50 RPM if blowing grain over\n3. Increase rotor speed if unthreshed material is in tailings\n4. Reduce ground speed\n\nHigh tailings triggers automation adjustments. Let it stabilize for 2 passes."
        )
    ]
}
