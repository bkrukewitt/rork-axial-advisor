import Foundation

struct AIService {
    static func getExpertResponse(messages: [ChatMessage]) async -> String {
        let toolkitURL = Config.EXPO_PUBLIC_TOOLKIT_URL
        guard !toolkitURL.isEmpty,
              let url = URL(string: "\(toolkitURL)/agent/chat") else {
            return fallbackResponse(for: messages.last?.content ?? "")
        }

        let systemPrompt = """
        You are an expert Axial-Flow combine advisor for Case IH combines. \
        You provide concise, practical advice about combine setup, calibration, \
        grain quality troubleshooting, and harvest automation. Keep responses \
        focused and actionable. Use bullet points for adjustments. \
        Always mention specific RPM ranges, mm settings, or percentage changes when applicable.
        """

        var apiMessages: [[String: String]] = [
            ["role": "system", "content": systemPrompt]
        ]

        for message in messages {
            apiMessages.append([
                "role": message.role == .user ? "user" : "assistant",
                "content": message.content
            ])
        }

        let body: [String: Any] = ["messages": apiMessages]

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = try? JSONSerialization.data(withJSONObject: body)
        request.timeoutInterval = 30

        do {
            let (data, response) = try await URLSession.shared.data(for: request)
            guard let httpResponse = response as? HTTPURLResponse, httpResponse.statusCode == 200 else {
                return fallbackResponse(for: messages.last?.content ?? "")
            }

            if let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any] {
                if let text = json["text"] as? String {
                    return text
                }
                if let choices = json["choices"] as? [[String: Any]],
                   let first = choices.first,
                   let message = first["message"] as? [String: Any],
                   let content = message["content"] as? String {
                    return content
                }
            }

            if let text = String(data: data, encoding: .utf8), !text.isEmpty {
                return text
            }

            return fallbackResponse(for: messages.last?.content ?? "")
        } catch {
            return fallbackResponse(for: messages.last?.content ?? "")
        }
    }

    private static func fallbackResponse(for query: String) -> String {
        let lowered = query.lowercased()

        if lowered.contains("crack") {
            return "For cracked grain: reduce rotor speed 25–50 RPM, open concave 2–3 mm, and slow ground speed. Check rasp bars for wear. Set automation to Quality Priority."
        }
        if lowered.contains("loss") || lowered.contains("rotor loss") {
            return "For rotor loss: reduce ground speed by 0.5 mph first. Then reduce rotor speed if grain is being thrown past the concave. Verify loss monitor with a drop pan test."
        }
        if lowered.contains("wet") || lowered.contains("moisture") {
            return "For wet conditions: increase rotor speed 50–100 RPM, tighten concave 2–3 mm. Expect higher fuel consumption. Monitor tailings closely. Allow automation 3 passes to stabilize."
        }
        if lowered.contains("dirty") || lowered.contains("foreign") || lowered.contains("fm") {
            return "For dirty sample/high FM: increase fan speed 50–100 RPM, close top sieve 2–3 mm, close bottom sieve 1–2 mm. Check sieves for damage or plugging."
        }
        if lowered.contains("food") || lowered.contains("grade") {
            return "For food-grade: widen concave 2–3 mm, reduce rotor 50 RPM, use Quality Priority automation. Target < 3% cracked kernels and < 2% FM. Monitor sample every 15–20 minutes."
        }
        if lowered.contains("calibrat") {
            return "Pre-harvest calibrations: concave zero, sieve calibration, loss monitor, yield monitor, header height, moisture sensor, and ground speed. Recalibrate yield monitor every 2–3 loads."
        }

        return "I can help with combine setup, grain quality troubleshooting, calibration, and automation guidance. Try asking about specific issues like cracked grain, rotor loss, wet corn settings, or food-grade optimization."
    }
}
