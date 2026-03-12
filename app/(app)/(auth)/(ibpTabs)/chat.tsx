import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

const ChatScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Ionicons name="chatbubble-ellipses" size={64} color="#94a3b8" />
        <Text style={styles.title}>Messages</Text>
        <Text style={styles.subtitle}>Your conversations will appear here.</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white" },
  content: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", color: "#0f172a", marginTop: 16 },
  subtitle: { fontSize: 16, color: "#64748b", marginTop: 8, textAlign: "center" },
});

export default ChatScreen;
