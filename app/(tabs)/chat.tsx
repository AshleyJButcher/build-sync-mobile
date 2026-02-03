import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
} from 'react-native';
import { useTheme } from '@shopify/restyle';
import { type Theme, GREEN_PRIMARY } from '../../src/theme';
import { Text } from '../../src/components/Text';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useChatMessages, useSendMessage, useUpdateMessage, useDeleteMessage, type ChatMessage } from '../../src/hooks/useChatMessages';
import { useProjectStore } from '../../src/store/useProjectStore';
import { useAuth } from '../../src/hooks/useAuth';
import { useProjectMembers } from '../../src/hooks/useProjectMembers';
import { ProjectMenuButton } from '../../src/components/ProjectMenuButton';
import { format, isToday, isYesterday } from 'date-fns';

export default function ChatScreen() {
  const theme = useTheme<Theme>();
  const insets = useSafeAreaInsets();
  const { selectedProjectId } = useProjectStore();
  const { user, role } = useAuth();
  const { data: members = [] } = useProjectMembers(selectedProjectId || '');
  const { messages, isLoading } = useChatMessages(selectedProjectId);
  const sendMessage = useSendMessage();
  const updateMessage = useUpdateMessage();
  const deleteMessage = useDeleteMessage();

  const [newMessage, setNewMessage] = useState('');
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);

  const isBuilder = role === 'builder' || role === 'administrator';

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedProjectId || !user) return;

    try {
      await sendMessage.mutateAsync({
        projectId: selectedProjectId,
        userId: user.id,
        content: newMessage,
      });
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
      Alert.alert('Error', 'Failed to send message');
    }
  };

  const handleEditMessage = async () => {
    if (!editContent.trim() || !editingMessageId || !selectedProjectId) return;

    try {
      await updateMessage.mutateAsync({
        messageId: editingMessageId,
        content: editContent,
        projectId: selectedProjectId,
      });
      setEditingMessageId(null);
      setEditContent('');
    } catch (error) {
      console.error('Failed to update message:', error);
      Alert.alert('Error', 'Failed to update message');
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!selectedProjectId) return;

    Alert.alert(
      'Delete Message',
      'Are you sure you want to delete this message?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMessage.mutateAsync({
                messageId,
                projectId: selectedProjectId,
              });
            } catch (error) {
              console.error('Failed to delete message:', error);
              Alert.alert('Error', 'Failed to delete message');
            }
          },
        },
      ]
    );
  };

  const startEditing = (message: ChatMessage) => {
    setEditingMessageId(message.id);
    setEditContent(message.content);
  };

  const cancelEditing = () => {
    setEditingMessageId(null);
    setEditContent('');
  };

  const formatMessageTime = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) {
      return format(date, 'HH:mm');
    } else if (isYesterday(date)) {
      return `Yesterday ${format(date, 'HH:mm')}`;
    }
    return format(date, 'dd/MM/yyyy HH:mm');
  };

  const getMemberName = (userId: string) => {
    if (userId === user?.id) return 'You';
    const member = members.find((m) => m.user_id === userId);
    return member?.profile?.full_name || 'Unknown';
  };

  const getMemberInitials = (userId: string) => {
    const name = getMemberName(userId);
    if (name === 'You') return user?.user_metadata?.full_name?.charAt(0) || 'Y';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (!selectedProjectId) {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: theme.colors.background, borderBottomColor: theme.colors.border }]}>
          <View style={styles.headerLeft}>
            <ProjectMenuButton />
            <Text variant="headingLarge" style={[styles.headerTitle, { color: theme.colors.text }]}>
              Chat
            </Text>
          </View>
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="chatbubbles-outline" size={64} color={theme.colors.textSecondary} />
          <Text variant="headingMedium" style={[styles.emptyText, { color: theme.colors.text }]}>
            No Project Selected
          </Text>
          <Text variant="body" style={[styles.emptySubtext, { color: theme.colors.textSecondary }]}>
            Please select a project to view chat messages
          </Text>
        </View>
      </View>
    );
  }

  const filteredMessages = messages;

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: theme.colors.background, borderBottomColor: theme.colors.border }]}>
        <View style={styles.headerLeft}>
          <ProjectMenuButton />
          <View style={styles.headerTitles}>
            <Text variant="headingLarge" style={[styles.headerTitle, { color: theme.colors.text }]}>
              Chat
            </Text>
            <Text variant="caption" style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
              {members.length} member{members.length !== 1 ? 's' : ''}
            </Text>
          </View>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          keyboardShouldPersistTaps="handled"
        >
          {filteredMessages.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubbles-outline" size={64} color={theme.colors.textSecondary} />
              <Text variant="body" style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                No messages yet
              </Text>
              <Text variant="caption" style={[styles.emptySubtext, { color: theme.colors.textSecondary }]}>
                Start the conversation with your team
              </Text>
            </View>
          ) : (
            filteredMessages.map((message) => {
              const isOwnMessage = message.user_id === user?.id;
              const isEditing = editingMessageId === message.id;
              const hasPhotos = message.photo_urls && message.photo_urls.length > 0;

              return (
                <View
                  key={message.id}
                  style={[
                    styles.messageWrapper,
                    isOwnMessage ? styles.messageWrapperOwn : styles.messageWrapperOther,
                  ]}
                >
                  {!isOwnMessage && (
                    <View
                      style={[
                        styles.avatar,
                        { backgroundColor: theme.colors.primary + '20' },
                      ]}
                    >
                      <Text
                        variant="caption"
                        style={[styles.avatarText, { color: theme.colors.primary }]}
                      >
                        {getMemberInitials(message.user_id)}
                      </Text>
                    </View>
                  )}
                  <View
                    style={[
                      styles.messageBubble,
                      isOwnMessage
                        ? [styles.messageBubbleOwn, { backgroundColor: GREEN_PRIMARY }]
                        : [styles.messageBubbleOther, { backgroundColor: theme.colors.backgroundSecondary }],
                    ]}
                  >
                    {!isOwnMessage && (
                      <Text
                        variant="caption"
                        style={[styles.messageSender, { color: theme.colors.textSecondary }]}
                      >
                        {getMemberName(message.user_id)}
                      </Text>
                    )}
                    {isEditing ? (
                      <View style={styles.editContainer}>
                        <TextInput
                          style={[
                            styles.editInput,
                            {
                              color: theme.colors.text,
                              backgroundColor: theme.colors.background,
                              borderColor: theme.colors.border,
                            },
                          ]}
                          value={editContent}
                          onChangeText={setEditContent}
                          multiline
                          autoFocus
                        />
                        <View style={styles.editActions}>
                          <TouchableOpacity
                            onPress={handleEditMessage}
                            style={[styles.editButton, { backgroundColor: GREEN_PRIMARY }]}
                          >
                            <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={cancelEditing}
                            style={[styles.editButton, { backgroundColor: theme.colors.error }]}
                          >
                            <Ionicons name="close" size={20} color="#FFFFFF" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    ) : (
                      <>
                        {hasPhotos && message.photo_urls && (
                          <View style={styles.photosContainer}>
                            {message.photo_urls.map((url, index) => (
                              <Image
                                key={index}
                                source={{ uri: url }}
                                style={styles.photo}
                                resizeMode="cover"
                              />
                            ))}
                          </View>
                        )}
                        <Text
                          variant="body"
                          style={[
                            styles.messageText,
                            { color: isOwnMessage ? '#FFFFFF' : theme.colors.text },
                          ]}
                        >
                          {message.content}
                        </Text>
                        <Text
                          variant="caption"
                          style={[
                            styles.messageTime,
                            { color: isOwnMessage ? '#FFFFFF80' : theme.colors.textSecondary },
                          ]}
                        >
                          {formatMessageTime(message.created_at)}
                        </Text>
                        {isOwnMessage && (
                          <View style={styles.messageActions}>
                            <TouchableOpacity
                              onPress={() => startEditing(message)}
                              style={styles.messageActionButton}
                            >
                              <Ionicons name="pencil" size={16} color={theme.colors.textSecondary} />
                            </TouchableOpacity>
                            <TouchableOpacity
                              onPress={() => handleDeleteMessage(message.id)}
                              style={styles.messageActionButton}
                            >
                              <Ionicons name="trash-outline" size={16} color={theme.colors.error} />
                            </TouchableOpacity>
                          </View>
                        )}
                      </>
                    )}
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
      )}

      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: theme.colors.background,
            borderTopColor: theme.colors.border,
            paddingBottom: insets.bottom,
          },
        ]}
      >
        <View
          style={[
            styles.inputWrapper,
            {
              backgroundColor: theme.colors.backgroundSecondary,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <TextInput
            style={[
              styles.input,
              {
                color: theme.colors.text,
              },
            ]}
            placeholder="Type a message..."
            placeholderTextColor={theme.colors.textSecondary}
            value={newMessage}
            onChangeText={setNewMessage}
            multiline
            maxLength={1000}
          />
          <TouchableOpacity
            onPress={handleSendMessage}
            disabled={!newMessage.trim() || sendMessage.isPending}
            style={[
              styles.sendButton,
              {
                backgroundColor: newMessage.trim() ? GREEN_PRIMARY : theme.colors.backgroundSecondary,
                opacity: newMessage.trim() ? 1 : 0.5,
              },
            ]}
          >
            {sendMessage.isPending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Ionicons name="send" size={20} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerTitles: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 24,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
  },
  messageWrapper: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  messageWrapperOwn: {
    justifyContent: 'flex-end',
  },
  messageWrapperOther: {
    justifyContent: 'flex-start',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  avatarText: {
    fontSize: 12,
    fontWeight: '600',
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 16,
  },
  messageBubbleOwn: {
    borderBottomRightRadius: 4,
  },
  messageBubbleOther: {
    borderBottomLeftRadius: 4,
  },
  messageSender: {
    fontSize: 12,
    marginBottom: 4,
    fontWeight: '600',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
  },
  messageActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  messageActionButton: {
    padding: 4,
  },
  photosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  photo: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  editContainer: {
    gap: 8,
  },
  editInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    minHeight: 40,
    fontSize: 16,
  },
  editActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputContainer: {
    borderTopWidth: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    maxHeight: 100,
    paddingVertical: 4,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
