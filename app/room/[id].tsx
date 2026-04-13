import { db } from "@/utils";
import { id } from "@instantdb/react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import { useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const MAX_MESSAGE_LENGTH = 1000;

export default function RoomScreen() {
  // useLocalSearchParams can return string | string[] — always coerce to string.
  const params = useLocalSearchParams<{ id: string }>();
  const roomId = Array.isArray(params.id) ? params.id[0] : params.id;

  const { user } = db.useAuth();
  const [message, setMessage] = useState("");
  const flatListRef = useRef<FlatList>(null);

  const { isLoading, error, data } = db.useQuery(
    roomId
      ? {
          rooms: {
            $: { where: { id: roomId } },
            messages: {
              creator: {},
            },
          },
        }
      : null
  );

  function sendMessage() {
    const text = message.trim();
    // Guard: must have text, a valid room, and be authenticated.
    if (!text || !roomId || !user) return;

    const msgId = id();
    db.transact([
      db.tx.messages[msgId].update({
        text,
        createdAt: Date.now(),
        // Stored on the entity so instant.perms.ts can verify ownership
        // without resolving the link at rule-check time.
        creatorId: user.id,
      }),
      db.tx.messages[msgId].link({ room: roomId }),
      db.tx.messages[msgId].link({ creator: user.id }),
    ]);
    setMessage("");
  }

  const room = data?.rooms?.[0];
  const messages = [...(room?.messages ?? [])].sort(
    (a, b) => a.createdAt - b.createdAt
  );

  // Room not found after load — guard against invalid/manipulated IDs.
  if (!isLoading && !error && !room) {
    return (
      <View style={styles.centered}>
        <Text style={styles.statusText}>Room not found.</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{ title: room?.name ?? "Chat", headerBackTitle: "Rooms" }}
      />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        {isLoading ? (
          <View style={styles.centered}>
            <Text style={styles.statusText}>Loading messages...</Text>
          </View>
        ) : error ? (
          <View style={styles.centered}>
            <Text style={styles.statusText}>
              Failed to load messages. Please try again.
            </Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messageList}
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: true })
            }
            onLayout={() =>
              flatListRef.current?.scrollToEnd({ animated: false })
            }
            ListEmptyComponent={
              <View style={styles.centered}>
                <Text style={styles.emptyText}>
                  No messages yet.{"\n"}Say hello!
                </Text>
              </View>
            }
            renderItem={({ item }) => {
              const isMe = !!user && item.creator?.id === user.id;
              const senderLabel = item.creator?.email ?? "Guest";
              return (
                <View
                  style={[
                    styles.bubbleRow,
                    isMe ? styles.myRow : styles.otherRow,
                  ]}
                >
                  {!isMe && (
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>
                        {senderLabel.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  )}
                  <View
                    style={[
                      styles.bubble,
                      isMe ? styles.myBubble : styles.otherBubble,
                    ]}
                  >
                    {!isMe && (
                      <Text style={styles.senderName} numberOfLines={1}>
                        {senderLabel}
                      </Text>
                    )}
                    <Text
                      style={[
                        styles.messageText,
                        isMe && styles.myMessageText,
                      ]}
                    >
                      {item.text}
                    </Text>
                  </View>
                </View>
              );
            }}
          />
        )}

        {/* Input bar — hidden while loading so user can't queue messages
            before the room membership is confirmed. */}
        {!isLoading && room && (
          <View style={styles.inputBar}>
            <TextInput
              style={styles.input}
              placeholder="Message..."
              placeholderTextColor="#999"
              value={message}
              onChangeText={setMessage}
              multiline
              maxLength={MAX_MESSAGE_LENGTH}
              returnKeyType="send"
              onSubmitEditing={sendMessage}
              blurOnSubmit={false}
            />
            <TouchableOpacity
              style={[
                styles.sendBtn,
                !message.trim() && styles.sendBtnDisabled,
              ]}
              onPress={sendMessage}
              disabled={!message.trim()}
            >
              <Text style={styles.sendBtnText}>↑</Text>
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  statusText: {
    color: "#888",
    fontSize: 15,
  },
  emptyText: {
    textAlign: "center",
    color: "#aaa",
    fontSize: 16,
    lineHeight: 24,
  },
  messageList: {
    padding: 16,
    gap: 10,
    flexGrow: 1,
  },
  bubbleRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    marginBottom: 4,
  },
  myRow: {
    justifyContent: "flex-end",
  },
  otherRow: {
    justifyContent: "flex-start",
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#6C63FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 2,
  },
  avatarText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "bold",
  },
  bubble: {
    maxWidth: "75%",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 2,
  },
  myBubble: {
    backgroundColor: "#6C63FF",
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: "#fff",
    borderBottomLeftRadius: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  senderName: {
    fontSize: 11,
    fontWeight: "600",
    color: "#6C63FF",
    marginBottom: 2,
  },
  messageText: {
    fontSize: 15,
    color: "#111",
    lineHeight: 20,
  },
  myMessageText: {
    color: "#fff",
  },
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e5e5e5",
    gap: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: "#111",
    maxHeight: 120,
    backgroundColor: "#f9f9f9",
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#6C63FF",
    justifyContent: "center",
    alignItems: "center",
  },
  sendBtnDisabled: {
    backgroundColor: "#ccc",
  },
  sendBtnText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
