import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import {
  Send,
  Trash2,
  Zap,
  TrendingDown,
  AlertOctagon,
  Filter,
  Droplets,
  Award,
  RefreshCw,
  Settings,
  MessageSquare,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/colors';
import { useApp } from '@/store/AppContext';
import { getExpertResponse } from '@/services/ai';
import { ChatMessage, QuickIssue } from '@/types';

const ISSUE_ICON_MAP: Record<string, React.FC<{ size: number; color: string }>> = {
  zap: ({ size, color }) => <Zap size={size} color={color} />,
  'trending-down': ({ size, color }) => <TrendingDown size={size} color={color} />,
  'alert-octagon': ({ size, color }) => <AlertOctagon size={size} color={color} />,
  filter: ({ size, color }) => <Filter size={size} color={color} />,
  droplets: ({ size, color }) => <Droplets size={size} color={color} />,
  award: ({ size, color }) => <Award size={size} color={color} />,
  'refresh-cw': ({ size, color }) => <RefreshCw size={size} color={color} />,
  settings: ({ size, color }) => <Settings size={size} color={color} />,
  default: ({ size, color }) => <MessageSquare size={size} color={color} />,
};

function IssueIcon({ name, size, color }: { name: string; size: number; color: string }) {
  const Comp = ISSUE_ICON_MAP[name] ?? ISSUE_ICON_MAP.default;
  return <Comp size={size} color={color} />;
}

interface IssueTileProps {
  issue: QuickIssue;
  onPress: (issue: QuickIssue) => void;
}

const IssueTile: React.FC<IssueTileProps> = ({ issue, onPress }) => (
  <TouchableOpacity
    style={styles.issueTile}
    onPress={() => onPress(issue)}
    activeOpacity={0.7}
    testID={`issue-${issue.id}`}
  >
    <View style={styles.issueTileIcon}>
      <IssueIcon name={issue.icon} size={20} color={Colors.red} />
    </View>
    <Text style={styles.issueTileLabel}>{issue.label}</Text>
  </TouchableOpacity>
);

interface MessageBubbleProps {
  message: ChatMessage;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';
  return (
    <View style={[styles.bubbleWrap, isUser ? styles.bubbleWrapUser : styles.bubbleWrapExpert]}>
      {!isUser && (
        <View style={styles.expertAvatar}>
          <Text style={styles.expertAvatarText}>E</Text>
        </View>
      )}
      <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleExpert]}>
        <Text style={[styles.bubbleText, isUser ? styles.bubbleTextUser : styles.bubbleTextExpert]}>
          {message.content}
        </Text>
      </View>
    </View>
  );
};

const TypingIndicator: React.FC = () => (
  <View style={[styles.bubbleWrap, styles.bubbleWrapExpert]}>
    <View style={styles.expertAvatar}>
      <Text style={styles.expertAvatarText}>E</Text>
    </View>
    <View style={[styles.bubble, styles.bubbleExpert, styles.typingBubble]}>
      <ActivityIndicator size="small" color={Colors.textSecondary} />
    </View>
  </View>
);

export const ExpertChat: React.FC = () => {
  const { quickIssues } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 150);
  }, []);

  const appendMessages = useCallback((newMsgs: ChatMessage[]) => {
    setMessages(prev => [...prev, ...newMsgs]);
    scrollToBottom();
  }, [scrollToBottom]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: text.trim(),
    };

    const allMessages = [...messages, userMsg];
    setMessages(allMessages);
    setInputText('');
    setIsLoading(true);
    scrollToBottom();

    const response = await getExpertResponse(allMessages);
    const expertMsg: ChatMessage = {
      id: `a-${Date.now()}`,
      role: 'assistant',
      content: response,
    };

    setMessages(prev => [...prev, expertMsg]);
    setIsLoading(false);
    scrollToBottom();
  }, [isLoading, messages, scrollToBottom]);

  const handleQuickIssue = useCallback((issue: QuickIssue) => {
    void Haptics.selectionAsync();
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: issue.label,
    };
    const expertMsg: ChatMessage = {
      id: `a-${Date.now() + 1}`,
      role: 'assistant',
      content: issue.response,
    };
    appendMessages([userMsg, expertMsg]);
  }, [appendMessages]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setInputText('');
  }, []);

  const handleSend = useCallback(() => {
    void sendMessage(inputText);
  }, [inputText, sendMessage]);

  const hasMessages = messages.length > 0;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 120 : 0}
    >
      {!hasMessages ? (
        <ScrollView
          style={styles.issuesScroll}
          contentContainerStyle={styles.issuesContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.issuesHeader}>
            <Text style={styles.issuesTitle}>Common Issues</Text>
            <Text style={styles.issuesSub}>Tap a topic to get expert guidance</Text>
          </View>
          <View style={styles.issueGrid}>
            {quickIssues.map(issue => (
              <IssueTile key={issue.id} issue={issue} onPress={handleQuickIssue} />
            ))}
          </View>
          <Text style={styles.freeTextHint}>Or type your question below ↓</Text>
        </ScrollView>
      ) : (
        <View style={styles.chatArea}>
          <View style={styles.chatHeader}>
            <Text style={styles.chatHeaderTitle}>Ask the Expert</Text>
            <TouchableOpacity
              onPress={clearChat}
              style={styles.clearBtn}
              testID="clear-chat-btn"
            >
              <Trash2 size={18} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <ScrollView
            ref={scrollRef}
            style={styles.messagesList}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
          >
            {messages.map(msg => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            {isLoading && <TypingIndicator />}
            <View style={styles.messageBottomPad} />
          </ScrollView>
        </View>
      )}

      <View style={styles.inputBar}>
        <TextInput
          style={styles.textInput}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Ask about settings, losses, crop issues..."
          placeholderTextColor={Colors.textTertiary}
          multiline
          maxLength={500}
          returnKeyType="send"
          onSubmitEditing={handleSend}
          testID="chat-input"
        />
        <TouchableOpacity
          style={[styles.sendBtn, (!inputText.trim() || isLoading) && styles.sendBtnDisabled]}
          onPress={handleSend}
          disabled={!inputText.trim() || isLoading}
          testID="send-btn"
        >
          <Send size={18} color={inputText.trim() && !isLoading ? Colors.text : Colors.textTertiary} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  issuesScroll: {
    flex: 1,
  },
  issuesContent: {
    padding: 20,
    paddingTop: 12,
  },
  issuesHeader: {
    marginBottom: 20,
  },
  issuesTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 4,
  },
  issuesSub: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  issueGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  issueTile: {
    width: '47.5%',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    gap: 10,
  },
  issueTileIcon: {
    width: 38,
    height: 38,
    backgroundColor: Colors.redMuted,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  issueTileLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
    lineHeight: 18,
  },
  freeTextHint: {
    fontSize: 13,
    color: Colors.textTertiary,
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 8,
  },
  chatArea: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  chatHeaderTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  clearBtn: {
    padding: 6,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
  },
  messageBottomPad: {
    height: 12,
  },
  bubbleWrap: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-end',
  },
  bubbleWrapUser: {
    justifyContent: 'flex-end',
  },
  bubbleWrapExpert: {
    justifyContent: 'flex-start',
    gap: 8,
  },
  expertAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  expertAvatarText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.red,
  },
  bubble: {
    maxWidth: '80%',
    borderRadius: 16,
    padding: 12,
  },
  bubbleUser: {
    backgroundColor: Colors.userBubble,
    borderBottomRightRadius: 4,
  },
  bubbleExpert: {
    backgroundColor: Colors.expertBubble,
    borderBottomLeftRadius: 4,
  },
  typingBubble: {
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  bubbleText: {
    fontSize: 15,
    lineHeight: 22,
  },
  bubbleTextUser: {
    color: Colors.text,
  },
  bubbleTextExpert: {
    color: Colors.text,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 10,
    paddingBottom: Platform.OS === 'ios' ? 10 : 10,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 10,
  },
  textInput: {
    flex: 1,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
    maxHeight: 100,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.red,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  sendBtnDisabled: {
    backgroundColor: Colors.surfaceElevated,
  },
});
