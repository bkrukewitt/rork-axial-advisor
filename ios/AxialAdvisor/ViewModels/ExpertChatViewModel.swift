import SwiftUI

@Observable
class ExpertChatViewModel {
    var messages: [ChatMessage] = []
    var inputText: String = ""
    var isLoading: Bool = false

    func sendQuickIssue(_ issue: QuickIssue) {
        let userMessage = ChatMessage(role: .user, content: issue.label)
        messages.append(userMessage)

        let expertMessage = ChatMessage(role: .expert, content: issue.response)
        messages.append(expertMessage)
    }

    func sendMessage() {
        let text = inputText.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !text.isEmpty else { return }

        let userMessage = ChatMessage(role: .user, content: text)
        messages.append(userMessage)
        inputText = ""
        isLoading = true

        Task {
            let response = await AIService.getExpertResponse(messages: messages)
            let expertMessage = ChatMessage(role: .expert, content: response)
            messages.append(expertMessage)
            isLoading = false
        }
    }

    func clearChat() {
        messages = []
    }
}
