import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  FadeIn,
  FadeInDown,
} from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Card } from '../../components/Card';
import { aiService, Message } from '../../utils/aiService';
import { colors, spacing, fontSize, fontWeight, borderRadius, shadows, animation } from '../../constants/theme';

const { width, height } = Dimensions.get('window');

const STORAGE_KEY = 'chatHistory';

export default function AIChatScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // Animation values
  const fadeAnim = useSharedValue(0);
  const typingAnim = useSharedValue(0);

  useEffect(() => {
    fadeAnim.value = withTiming(1, { duration: animation.slow });
    typingAnim.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 600 }),
        withTiming(0, { duration: 600 })
      ),
      -1,
      false
    );

    loadChatHistory();
    sendInitialMessage();
  }, []);

  const fadeStyle = useAnimatedStyle(() => ({
    opacity: fadeAnim.value,
  }));

  const typingStyle = useAnimatedStyle(() => ({
    opacity: 0.4 + typingAnim.value * 0.6,
  }));

  const loadChatHistory = async () => {
    try {
      const historyStr = await AsyncStorage.getItem(STORAGE_KEY);
      if (historyStr) {
        const history = JSON.parse(historyStr);
        setMessages(history.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        })));
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
  };

  const saveChatHistory = async (newMessages: Message[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newMessages));
    } catch (error) {
      console.error('Failed to save chat history:', error);
    }
  };

  const sendInitialMessage = () => {
    if (messages.length === 0) {
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        text: "👋 Hello! I'm your SecureScan AI assistant. I can help you with:\n\n• Understanding fraud detection results\n• Using QR scanner and link checker\n• Online safety tips\n• Explaining threat types\n\nWhat would you like to know?",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
      saveChatHistory([welcomeMessage]);
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || isSending) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputText('');
    setIsSending(true);
    setIsTyping(true);
    saveChatHistory(newMessages);

    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      // Send to Gemini API
      const response = await aiService.sendMessage(userMessage.text);

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.text,
        isUser: false,
        timestamp: new Date(),
      };

      const updatedMessages = [...newMessages, aiMessage];
      setMessages(updatedMessages);
      saveChatHistory(updatedMessages);

      // Scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I encountered an error. Please try again.',
        isUser: false,
        timestamp: new Date(),
      };
      const updatedMessages = [...newMessages, errorMessage];
      setMessages(updatedMessages);
      saveChatHistory(updatedMessages);
    } finally {
      setIsTyping(false);
      setIsSending(false);
    }
  };

  const handleClearChat = () => {
    aiService.resetConversation();
    setMessages([]);
    saveChatHistory([]);
    sendInitialMessage();
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    if (item.isUser) {
      return (
        <Animated.View
          entering={FadeInDown.delay(index * 50).duration(300)}
          style={styles.userMessageContainer}
        >
          <View style={styles.userMessageWrapper}>
            <LinearGradient
              colors={colors.gradientPrimary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.userMessageBubble}
            >
              <Text style={styles.userMessageText}>{item.text}</Text>
              <Text style={styles.userMessageTime}>{formatTime(item.timestamp)}</Text>
            </LinearGradient>
          </View>
        </Animated.View>
      );
    } else {
      return (
        <Animated.View
          entering={FadeInDown.delay(index * 50).duration(300)}
          style={styles.aiMessageContainer}
        >
          <View style={styles.aiMessageWrapper}>
            <LinearGradient
              colors={colors.gradientAccent}
              style={styles.aiAvatarContainer}
            >
              <Ionicons name="sparkles" size={16} color={colors.white} />
            </LinearGradient>
            <View style={styles.aiMessageBubble}>
              <Text style={styles.aiMessageText}>{item.text}</Text>
              <Text style={styles.aiMessageTime}>{formatTime(item.timestamp)}</Text>
            </View>
          </View>
        </Animated.View>
      );
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={colors.gradientBackground}
        style={StyleSheet.absoluteFillObject}
      />

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoid}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          {/* Header */}
          <Animated.View style={[styles.header, fadeStyle]}>
            <View style={styles.headerLeft}>
              <LinearGradient
                colors={colors.gradientAccent}
                style={styles.headerIcon}
              >
                <Ionicons name="chatbubbles" size={24} color={colors.white} />
              </LinearGradient>
              <View style={styles.headerTextContainer}>
                <Text style={styles.headerTitle}>AI Assistant</Text>
                <Text style={styles.headerSubtitle}>
                  {isTyping ? 'Typing...' : 'Online'}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={handleClearChat} style={styles.clearButton}>
              <Ionicons name="trash-outline" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </Animated.View>

          {/* Messages List */}
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderMessage}
            contentContainerStyle={styles.messagesList}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <LinearGradient
                  colors={colors.gradientPrimary}
                  style={styles.emptyIcon}
                >
                  <Ionicons name="chatbubbles-outline" size={48} color={colors.white} />
                </LinearGradient>
                <Text style={styles.emptyText}>Start a conversation</Text>
              </View>
            }
          />

          {/* Typing Indicator */}
          {isTyping && (
            <Animated.View style={[styles.typingContainer, typingStyle]}>
              <View style={styles.typingDot} />
              <View style={styles.typingDot} />
              <View style={styles.typingDot} />
            </Animated.View>
          )}

          {/* Input Area */}
          <View style={styles.inputContainer}>
            <Card variant="elevated" style={styles.inputCard}>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Ask me anything about security..."
                  placeholderTextColor={colors.textSecondary}
                  value={inputText}
                  onChangeText={setInputText}
                  multiline
                  maxLength={500}
                  onSubmitEditing={handleSendMessage}
                  editable={!isSending}
                />
                <TouchableOpacity
                  style={[
                    styles.sendButton,
                    (!inputText.trim() || isSending) && styles.sendButtonDisabled,
                  ]}
                  onPress={handleSendMessage}
                  disabled={!inputText.trim() || isSending}
                >
                  <LinearGradient
                    colors={inputText.trim() && !isSending ? colors.gradientPrimary : [colors.surfaceCard, colors.surfaceCard]}
                    style={styles.sendButtonGradient}
                  >
                    {isSending ? (
                      <ActivityIndicator size="small" color={colors.white} />
                    ) : (
                      <Ionicons name="send" size={20} color={colors.white} />
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </Card>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface + '90',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
  },
  headerTextContainer: {
    gap: spacing.xs / 2,
  },
  headerTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: fontSize.xs,
    color: colors.accent,
    fontWeight: fontWeight.medium,
  },
  clearButton: {
    padding: spacing.sm,
  },
  messagesList: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  userMessageContainer: {
    marginBottom: spacing.md,
    alignItems: 'flex-end',
  },
  userMessageWrapper: {
    maxWidth: '80%',
  },
  userMessageBubble: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    ...shadows.md,
  },
  userMessageText: {
    fontSize: fontSize.md,
    color: colors.white,
    lineHeight: 22,
    marginBottom: spacing.xs,
  },
  userMessageTime: {
    fontSize: fontSize.xs,
    color: colors.white,
    opacity: 0.7,
    textAlign: 'right',
  },
  aiMessageContainer: {
    marginBottom: spacing.md,
    alignItems: 'flex-start',
  },
  aiMessageWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    maxWidth: '80%',
  },
  aiAvatarContainer: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  aiMessageBubble: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  aiMessageText: {
    fontSize: fontSize.md,
    color: colors.text,
    lineHeight: 22,
    marginBottom: spacing.xs,
  },
  aiMessageTime: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.textSecondary,
  },
  inputContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.background,
  },
  inputCard: {
    padding: 0,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    padding: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.text,
    maxHeight: 100,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxxl,
  },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: borderRadius.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    ...shadows.xl,
  },
  emptyText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
});
