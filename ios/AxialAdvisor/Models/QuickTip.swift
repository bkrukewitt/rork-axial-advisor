import Foundation

nonisolated struct QuickTip: Identifiable, Codable, Sendable, Equatable {
    var id: String
    var title: String
    var subtitle: String
    var icon: String
    var content: String

    static let defaults: [QuickTip] = [
        QuickTip(
            id: "cracked_grain",
            title: "Cracked Grain",
            subtitle: "Troubleshoot kernel damage",
            icon: "xmark.circle.fill",
            content: "Reduce rotor speed 25–50 RPM. Open concave 2–3 mm. Slow ground speed. Check rasp bars for wear."
        ),
        QuickTip(
            id: "rotor_loss",
            title: "Reduce Rotor Loss",
            subtitle: "Keep grain in the tank",
            icon: "arrow.down.circle.fill",
            content: "Reduce ground speed by 0.5 mph first. Then reduce rotor speed if grain is being thrown past the concave. Verify loss monitor calibration with a drop pan test."
        ),
        QuickTip(
            id: "calibration",
            title: "Calibration Reminders",
            subtitle: "Pre-harvest checklist",
            icon: "checkmark.seal.fill",
            content: "Complete all calibrations at the start of each harvest season: concave zero, sieve, loss monitor, yield monitor, header height, moisture sensor, and ground speed."
        ),
        QuickTip(
            id: "food_grade",
            title: "Food-Grade Tips",
            subtitle: "Gentle threshing for quality",
            icon: "star.circle.fill",
            content: "Widen concave 2–3 mm beyond standard. Reduce rotor speed 50 RPM. Set automation to Quality Priority. Target < 3% cracked kernels and < 2% FM."
        ),
        QuickTip(
            id: "wet_corn",
            title: "Wet Corn Strategy",
            subtitle: "Handling high moisture",
            icon: "drop.fill",
            content: "Increase rotor speed 50–100 RPM. Tighten concave 2–3 mm. Expect higher fuel consumption and slower ground speeds. Monitor tailings closely."
        ),
        QuickTip(
            id: "automation",
            title: "Automation Guidance",
            subtitle: "Let the system work",
            icon: "gearshape.2.fill",
            content: "Allow Harvest Automation 2–3 passes to stabilize before making manual changes. Avoid adjusting during stabilization. Switch to Quality Priority if sample deteriorates."
        )
    ]
}
