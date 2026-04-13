import { db } from "@/utils";
import { id } from "@instantdb/react-native";
import { router } from "expo-router";
import { useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export function HomeScreen() {
  const { user } = db.useAuth();
  const { isLoading, error, data } = db.useQuery({ rooms: {} });
  const [showModal, setShowModal] = useState(false);
  const [roomName, setRoomName] = useState("");

  function createRoom() {
    if (!roomName.trim()) return;
    const roomId = id();
    db.transact(
      db.tx.rooms[roomId].update({ name: roomName.trim(), createdAt: Date.now() })
    );
    setRoomName("");
    setShowModal(false);
  }

  const rooms = [...(data?.rooms ?? [])].sort((a, b) => b.createdAt - a.createdAt);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Chats</Text>
          <Text style={styles.headerSubtitle} numberOfLines={1}>
            {user?.isGuest ? "Guest" : user?.email}
          </Text>
        </View>
        <TouchableOpacity style={styles.signOutBtn} onPress={() => db.auth.signOut()}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      {/* Room list */}
      {isLoading ? (
        <View style={styles.centered}>
          <Text style={styles.statusText}>Loading rooms...</Text>
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.statusText}>Failed to load rooms. Please try again.</Text>
        </View>
      ) : (
        <FlatList
          data={rooms}
          keyExtractor={(item) => item.id}
          contentContainerStyle={rooms.length === 0 ? styles.centered : undefined}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              No rooms yet.{"\n"}Tap + to create one!
            </Text>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.roomItem}
              onPress={() => router.push(`/room/${item.id}` as any)}
            >
              <View style={styles.roomAvatar}>
                <Text style={styles.roomAvatarText}>
                  {item.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <Text style={styles.roomName}>{item.name}</Text>
            </TouchableOpacity>
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => setShowModal(true)}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Create Room Modal */}
      <Modal visible={showModal} transparent animationType="fade">
        <Pressable style={styles.overlay} onPress={() => setShowModal(false)}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <Text style={styles.modalTitle}>New Room</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Room name..."
              placeholderTextColor="#999"
              value={roomName}
              onChangeText={setRoomName}
              autoFocus
              onSubmitEditing={createRoom}
              returnKeyType="done"
              maxLength={50}
              autoCorrect={false}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.cancelBtn]}
                onPress={() => {
                  setShowModal(false);
                  setRoomName("");
                }}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.createBtn]}
                onPress={createRoom}
              >
                <Text style={styles.createBtnText}>Create</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111",
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#888",
    maxWidth: 200,
  },
  signOutBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },
  signOutText: {
    fontSize: 14,
    color: "#555",
    fontWeight: "500",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
  roomItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: "#fff",
    gap: 14,
  },
  roomAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#6C63FF",
    justifyContent: "center",
    alignItems: "center",
  },
  roomAvatarText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  roomName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#111",
  },
  separator: {
    height: 1,
    backgroundColor: "#e5e5e5",
    marginLeft: 78,
  },
  fab: {
    position: "absolute",
    bottom: 32,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#6C63FF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  fabText: {
    fontSize: 28,
    color: "#fff",
    lineHeight: 32,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCard: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    gap: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111",
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: "#111",
  },
  modalButtons: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "flex-end",
  },
  modalBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  cancelBtn: {
    backgroundColor: "#f0f0f0",
  },
  cancelBtnText: {
    color: "#555",
    fontWeight: "600",
    fontSize: 15,
  },
  createBtn: {
    backgroundColor: "#6C63FF",
  },
  createBtnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
});
