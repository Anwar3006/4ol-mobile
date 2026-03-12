import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import useUserStore from "@/store/use-userstore";
import { router } from "expo-router";
import { useCreateSupportTicket } from "@/hooks/use-support-tickets";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
type Tab = "chats" | "groups" | "support";
type SupportType = "issue" | "feature";

interface ChatItem {
  id: string;
  name: string;
  avatar?: string;
  initials: string;
  avatarColor: string;
  lastMessage: string;
  messageType: "text" | "voice" | "image";
  time: string;
  unread: number;
  pinned?: boolean;
  typing?: boolean;
  online?: boolean;
}

interface GroupItem {
  id: string;
  name: string;
  memberCount: number;
  lastMessage: string;
  time: string;
  unread: number;
  avatarColor: string;
  initials: string;
}

interface SupportItem {
  id: string;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBg: string;
  badge?: string;
  action: "help" | "live-chat" | "issue" | "feature" | "contact";
}

// ─────────────────────────────────────────────────────────────────────────────
// Mock data
// ─────────────────────────────────────────────────────────────────────────────
const MOCK_CHATS: ChatItem[] = [
  {
    id: "1",
    name: "Dr. Amara Mensah",
    initials: "AM",
    avatarColor: "#6366f1",
    lastMessage: "Your prescription has been updated.",
    messageType: "text",
    time: "09:38 AM",
    unread: 0,
    pinned: true,
    online: true,
  },
  {
    id: "2",
    name: "Natalie Nora",
    initials: "NN",
    avatarColor: "#ec4899",
    lastMessage: "Natalie is typing...",
    messageType: "text",
    time: "09:15 AM",
    unread: 2,
    typing: true,
    online: true,
  },
  {
    id: "3",
    name: "Pharm A Cee #4",
    initials: "PA",
    avatarColor: "#10b981",
    lastMessage: "Voice message",
    messageType: "voice",
    time: "02:03 AM",
    unread: 0,
  },
  {
    id: "4",
    name: "Dr. Kofi Asante",
    initials: "KA",
    avatarColor: "#f59e0b",
    lastMessage: "See you at your next appointment.",
    messageType: "text",
    time: "Yesterday",
    unread: 0,
  },
  {
    id: "5",
    name: "Korle Bu Hospital",
    initials: "KB",
    avatarColor: "#3b82f6",
    lastMessage: "Your results are ready for pickup.",
    messageType: "text",
    time: "26 May",
    unread: 1,
  },
  {
    id: "6",
    name: "Wellness Center GH",
    initials: "WC",
    avatarColor: "#8b5cf6",
    lastMessage: "Thank you for visiting us today!",
    messageType: "text",
    time: "12 Jun",
    unread: 0,
  },
  {
    id: "7",
    name: "Lister Hospital",
    initials: "LH",
    avatarColor: "#ef4444",
    lastMessage: "Image",
    messageType: "image",
    time: "10 Jun",
    unread: 0,
  },
];

const MOCK_GROUPS: GroupItem[] = [
  {
    id: "g1",
    name: "General Health",
    memberCount: 420,
    lastMessage: "Anyone tried the new GH Health app?",
    time: "10:02 AM",
    unread: 14,
    avatarColor: "#10b981",
    initials: "GH",
  },
  {
    id: "g2",
    name: "Corporate Wellness",
    memberCount: 59,
    lastMessage: "Reminder: Monthly check-up this Friday.",
    time: "08:47 AM",
    unread: 3,
    avatarColor: "#3b82f6",
    initials: "CW",
  },
  {
    id: "g3",
    name: "Tertiary Health Hub",
    memberCount: 614,
    lastMessage: "NHIS extension deadline extended to July.",
    time: "Yesterday",
    unread: 0,
    avatarColor: "#6366f1",
    initials: "TH",
  },
  {
    id: "g4",
    name: "Expats in Ghana",
    memberCount: 120,
    lastMessage: "Which clinic takes international insurance?",
    time: "2 Jun",
    unread: 7,
    avatarColor: "#f59e0b",
    initials: "EG",
  },
];

const MOCK_SUPPORT: SupportItem[] = [
  {
    id: "s1",
    title: "Help Centre",
    subtitle: "Browse FAQs and how-to guides",
    icon: "help-circle-outline",
    iconColor: "#10b981",
    iconBg: "#d1fae5",
    action: "help",
  },
  {
    id: "s2",
    title: "Live Chat Support",
    subtitle: "Chat with our support team",
    icon: "chatbubble-ellipses-outline",
    iconColor: "#3b82f6",
    iconBg: "#dbeafe",
    badge: "Online",
    action: "live-chat",
  },
  {
    id: "s3",
    title: "Report an Issue",
    subtitle: "Let us know about bugs or problems",
    icon: "bug-outline",
    iconColor: "#ef4444",
    iconBg: "#fee2e2",
    action: "issue",
  },
  {
    id: "s4",
    title: "Feature Requests",
    subtitle: "Suggest something new",
    icon: "bulb-outline",
    iconColor: "#f59e0b",
    iconBg: "#fef3c7",
    action: "feature",
  },
  {
    id: "s5",
    title: "Contact Us",
    subtitle: "Email or call our team directly",
    icon: "mail-outline",
    iconColor: "#8b5cf6",
    iconBg: "#ede9fe",
    action: "contact",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

const Avatar = ({
  initials,
  color,
  size = 52,
  online,
}: {
  initials: string;
  color: string;
  size?: number;
  online?: boolean;
}) => (
  <View style={{ width: size, height: size }}>
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color + "22",
        borderWidth: 1.5,
        borderColor: color + "44",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text style={{ color, fontWeight: "800", fontSize: size * 0.3 }}>
        {initials}
      </Text>
    </View>
    {online && (
      <View
        style={{
          position: "absolute",
          bottom: 1,
          right: 1,
          width: 12,
          height: 12,
          borderRadius: 6,
          backgroundColor: "#10b981",
          borderWidth: 2,
          borderColor: "#fff",
        }}
      />
    )}
  </View>
);

const ChatRow = ({ item }: { item: ChatItem }) => {
  const isTyping = item.typing;

  const renderMessagePreview = () => {
    if (isTyping) {
      return (
        <Text style={[styles.lastMsg, { color: "#10b981", fontStyle: "italic" }]}>
          typing...
        </Text>
      );
    }
    if (item.messageType === "voice") {
      return (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          <Ionicons name="mic-outline" size={13} color="#94a3b8" />
          <Text style={styles.lastMsg}>Voice message</Text>
        </View>
      );
    }
    if (item.messageType === "image") {
      return (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          <Ionicons name="image-outline" size={13} color="#94a3b8" />
          <Text style={styles.lastMsg}>Image</Text>
        </View>
      );
    }
    return <Text style={styles.lastMsg} numberOfLines={1}>{item.lastMessage}</Text>;
  };

  return (
    <TouchableOpacity style={styles.chatRow} activeOpacity={0.7}>
      <Avatar initials={item.initials} color={item.avatarColor} online={item.online} />
      <View style={styles.chatMeta}>
        <View style={styles.chatTopRow}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 5, flex: 1 }}>
            <Text style={styles.chatName} numberOfLines={1}>{item.name}</Text>
            {item.pinned && (
              <Ionicons name="pin" size={12} color="#94a3b8" style={{ transform: [{ rotate: "45deg" }] }} />
            )}
          </View>
          <Text style={[styles.chatTime, item.unread > 0 && { color: "#10b981", fontWeight: "700" }]}>
            {item.time}
          </Text>
        </View>
        <View style={styles.chatBottomRow}>
          <View style={{ flex: 1 }}>{renderMessagePreview()}</View>
          {item.unread > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{item.unread}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const GroupRow = ({ item }: { item: GroupItem }) => (
  <TouchableOpacity style={styles.chatRow} activeOpacity={0.7}>
    <Avatar initials={item.initials} color={item.avatarColor} size={52} />
    <View style={styles.chatMeta}>
      <View style={styles.chatTopRow}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, flex: 1 }}>
          <Text style={styles.chatName} numberOfLines={1}>{item.name}</Text>
          <View style={styles.memberBadge}>
            <Ionicons name="people-outline" size={10} color="#64748b" />
            <Text style={styles.memberText}>{item.memberCount}</Text>
          </View>
        </View>
        <Text style={[styles.chatTime, item.unread > 0 && { color: "#10b981", fontWeight: "700" }]}>
          {item.time}
        </Text>
      </View>
      <View style={styles.chatBottomRow}>
        <Text style={styles.lastMsg} numberOfLines={1}>{item.lastMessage}</Text>
        {item.unread > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>{item.unread}</Text>
          </View>
        )}
      </View>
    </View>
  </TouchableOpacity>
);

const SupportRow = ({
  item,
  onPress,
}: {
  item: SupportItem;
  onPress: (item: SupportItem) => void;
}) => (
  <TouchableOpacity style={styles.supportRow} activeOpacity={0.7} onPress={() => onPress(item)}>
    <View style={[styles.supportIcon, { backgroundColor: "#e2e8f0" }]}>
      <Ionicons name={item.icon} size={22} color="#000000" />
    </View>
    <View style={{ flex: 1 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Text style={styles.supportTitle}>{item.title}</Text>
        {item.badge && (
          <View style={styles.onlineBadge}>
            <View style={styles.onlineDot} />
            <Text style={styles.onlineBadgeText}>{item.badge}</Text>
          </View>
        )}
      </View>
      <Text style={styles.supportSubtitle}>{item.subtitle}</Text>
    </View>
    <Ionicons name="chevron-forward" size={18} color="#cbd5e1" />
  </TouchableOpacity>
);

// ─────────────────────────────────────────────────────────────────────────────
// Support Ticket Modal
// ─────────────────────────────────────────────────────────────────────────────
interface SupportTicketModalProps {
  visible: boolean;
  supportType: SupportType;
  onClose: () => void;
  onSubmitSuccess: () => void;
  userId: string;
  userName: string;
}

const SupportTicketModal = ({
  visible,
  supportType,
  onClose,
  onSubmitSuccess,
  userId,
  userName,
}: SupportTicketModalProps) => {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const { mutate: createTicket, isPending } = useCreateSupportTicket();

  const isIssue = supportType === "issue";
  const title = isIssue ? "Report an Issue" : "Request a Feature";
  const subjectPlaceholder = isIssue
    ? "e.g. App crashes on login"
    : "e.g. Dark mode support";
  const messagePlaceholder = isIssue
    ? "Describe the issue in detail — what happened, and what you expected..."
    : "Describe the feature you'd like and how it would help you...";
  const accentColor = isIssue ? "#ef4444" : "#f59e0b";
  const accentBg = isIssue ? "#fee2e2" : "#fef3c7";

  const handleClose = () => {
    setSubject("");
    setMessage("");
    onClose();
  };

  const handleSubmit = () => {
    const trimmedSubject = subject.trim();
    const trimmedMessage = message.trim();

    if (!trimmedSubject) {
      Alert.alert("Subject required", "Please enter a subject for your ticket.");
      return;
    }
    if (!trimmedMessage) {
      Alert.alert("Message required", "Please describe your issue or request.");
      return;
    }

    createTicket(
      {
        subject: trimmedSubject,
        message: trimmedMessage,
        requested_by: userId,
        user_name: userName,
        priority: "Low",
        status: "Open",
      },
      {
        onSuccess: () => {
          setSubject("");
          setMessage("");
          onSubmitSuccess();
        },
        onError: (error) => {
          Alert.alert(
            "Submission failed",
            error.message || "Something went wrong. Please try again."
          );
        },
      }
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      {/* pageSheet modals on iOS manage keyboard insets natively —
          no KeyboardAvoidingView needed. The ScrollView + 
          automaticallyAdjustKeyboardInsets handles everything cleanly
          without causing layout thrash on every keystroke. */}
      <View style={modalStyles.container}>

        {/* ── Modal Header ── */}
        <View style={modalStyles.header}>
          <TouchableOpacity
            onPress={handleClose}
            style={modalStyles.closeBtn}
            disabled={isPending}
          >
            <Ionicons name="close" size={22} color="#64748b" />
          </TouchableOpacity>
          <Text style={modalStyles.headerTitle}>{title}</Text>
          <View style={{ width: 38 }} />
        </View>

        {/* ── Scrollable body — submit button lives here, not in a floating footer ── */}
        <ScrollView
          contentContainerStyle={modalStyles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          // Automatically shrinks the scroll area when the keyboard appears
          // (iOS 13+ / RN 0.68+). No layout thrash, no flickering.
          automaticallyAdjustKeyboardInsets
        >
          {/* Icon Badge */}
          <View style={[modalStyles.iconBadge, { backgroundColor: accentBg }]}>
            <Ionicons
              name={isIssue ? "bug-outline" : "bulb-outline"}
              size={32}
              color={accentColor}
            />
          </View>

          <Text style={modalStyles.description}>
            {isIssue
              ? "Help us improve by telling us what went wrong. Our team reviews every report."
              : "Have an idea that would make 4 Our Life better? We'd love to hear it."}
          </Text>

          {/* Subject Field */}
          <View style={modalStyles.fieldGroup}>
            <Text style={modalStyles.label}>
              Subject <Text style={{ color: "#ef4444" }}>*</Text>
            </Text>
            <TextInput
              style={modalStyles.input}
              placeholder={subjectPlaceholder}
              placeholderTextColor="#94a3b8"
              value={subject}
              onChangeText={setSubject}
              maxLength={120}
              returnKeyType="next"
              editable={!isPending}
            />
            <Text style={modalStyles.charCount}>{subject.length}/120</Text>
          </View>

          {/* Description Field */}
          <View style={modalStyles.fieldGroup}>
            <Text style={modalStyles.label}>
              Description <Text style={{ color: "#ef4444" }}>*</Text>
            </Text>
            <TextInput
              style={[modalStyles.input, modalStyles.textArea]}
              placeholder={messagePlaceholder}
              placeholderTextColor="#94a3b8"
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={5}
              maxLength={1000}
              textAlignVertical="top"
              editable={!isPending}
            />
            <Text style={modalStyles.charCount}>{message.length}/1000</Text>
          </View>

          {/* Info note */}
          <View style={modalStyles.infoRow}>
            <Ionicons name="information-circle-outline" size={14} color="#94a3b8" />
            <Text style={modalStyles.infoText}>
              Priority and status are set to{" "}
              <Text style={{ fontWeight: "700" }}>Low / Open</Text> by default.
              An admin can update these later.
            </Text>
          </View>

          {/* ── Submit button — inside the scroll, never in a floating footer ── */}
          <TouchableOpacity
            style={[
              modalStyles.submitBtn,
              { backgroundColor: accentColor },
              isPending && { opacity: 0.7 },
            ]}
            onPress={handleSubmit}
            activeOpacity={0.85}
            disabled={isPending}
          >
            {isPending ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Ionicons
                  name={isIssue ? "send-outline" : "sparkles-outline"}
                  size={18}
                  color="#fff"
                />
                <Text style={modalStyles.submitText}>
                  {isIssue ? "Submit Report" : "Submit Request"}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main screen
// ─────────────────────────────────────────────────────────────────────────────
const ChatsScreen = () => {
  const insets = useSafeAreaInsets();
  const { user } = useUserStore();
  const [activeTab, setActiveTab] = useState<Tab>("chats");

  // Support ticket modal state
  const [supportModalVisible, setSupportModalVisible] = useState(false);
  const [supportType, setSupportType] = useState<SupportType>("issue");

  const tabs: { key: Tab; label: string }[] = [
    { key: "chats", label: "All Chats" },
    { key: "groups", label: "Groups" },
    { key: "support", label: "Support" },
  ];

  const handleSupportItemPress = (item: SupportItem) => {
    switch (item.action) {
      case "help":
        router.push("/(app)/(auth)/(tabs)/My Account/HelpCenter" as any);
        break;
      case "contact":
        router.push("/(app)/(auth)/(tabs)/My Account/HelpCenter" as any);
        break;
      case "live-chat":
        // Placeholder until live chat is implemented
        break;
      case "issue":
        setSupportType("issue");
        setSupportModalVisible(true);
        break;
      case "feature":
        setSupportType("feature");
        setSupportModalVisible(true);
        break;
    }
  };

  const handleModalClose = () => setSupportModalVisible(false);

  const handleSubmitSuccess = () => {
    setSupportModalVisible(false);
    Alert.alert(
      "Ticket Submitted ✓",
      supportType === "issue"
        ? "Thanks for reporting! Our team will look into this shortly."
        : "Thanks for the suggestion! We'll review your feature request.",
      [{ text: "OK" }]
    );
  };

  const userName = user
    ? `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim()
    : "";

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.push("/(app)/(auth)/(tabs)/My Account/UserProfile")}
          style={styles.avatarBtn}
        >
          <Text style={styles.avatarText}>
            {`${user?.first_name?.[0] ?? ""}${user?.last_name?.[0] ?? ""}`}
          </Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Messages</Text>

        <TouchableOpacity style={styles.bellBtn}>
          <Ionicons name="notifications-outline" size={24} color="#0f172a" />
          <View style={styles.bellDot} />
        </TouchableOpacity>
      </View>

      {/* ── Tab bar ── */}
      <View style={styles.tabBar}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key)}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab.key && styles.tabTextActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Content ── */}
      {activeTab === "chats" && (
        <FlatList
          data={MOCK_CHATS}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ChatRow item={item} />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}

      {activeTab === "groups" && (
        <>
          <View style={styles.groupsHint}>
            <Ionicons name="information-circle-outline" size={15} color="#64748b" />
            <Text style={styles.groupsHintText}>
              Join a group by invite link or group admin approval
            </Text>
          </View>
          <FlatList
            data={MOCK_GROUPS}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <GroupRow item={item} />}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        </>
      )}

      {activeTab === "support" && (
        <FlatList
          data={MOCK_SUPPORT}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <SupportRow item={item} onPress={handleSupportItemPress} />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 20, paddingTop: 8 }}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListHeaderComponent={
            <View style={styles.supportHeader}>
              <Text style={styles.supportHeaderTitle}>How can we help?</Text>
              <Text style={styles.supportHeaderSub}>
                We're here for you — choose an option below
              </Text>
            </View>
          }
        />
      )}

      {/* ── FAB (new chat / new group) ── */}
      {activeTab !== "support" && (
        <TouchableOpacity
          style={[styles.fab, { bottom: insets.bottom + 24 }]}
          activeOpacity={0.85}
        >
          <Ionicons
            name={activeTab === "groups" ? "people" : "create-outline"}
            size={24}
            color="#fff"
          />
        </TouchableOpacity>
      )}

      {/* ── Support Ticket Modal ── */}
      <SupportTicketModal
        visible={supportModalVisible}
        supportType={supportType}
        onClose={handleModalClose}
        onSubmitSuccess={handleSubmitSuccess}
        userId={user?.user_id ?? ""}
        userName={userName}
      />
    </View>
  );
};

export default ChatsScreen;

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#fff",
  },

  // Header
  header: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0f172a",
    letterSpacing: -0.3,
  },
  avatarBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#fce7f3",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#db2777",
  },
  bellBtn: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
  },
  bellDot: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ef4444",
    borderWidth: 1.5,
    borderColor: "#fff",
  },

  // Tab bar
  tabBar: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginVertical: 14,
    backgroundColor: "#f1f5f9",
    borderRadius: 14,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 9,
    alignItems: "center",
    borderRadius: 11,
  },
  tabActive: {
    backgroundColor: "#10b981",
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  tabText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748b",
  },
  tabTextActive: {
    color: "#fff",
    fontWeight: "800",
  },

  // Chat row
  chatRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  chatMeta: {
    flex: 1,
  },
  chatTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  chatBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  chatName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0f172a",
    flex: 1,
  },
  chatTime: {
    fontSize: 12,
    color: "#94a3b8",
    fontWeight: "500",
    marginLeft: 8,
  },
  lastMsg: {
    fontSize: 13,
    color: "#94a3b8",
    fontWeight: "400",
    flex: 1,
  },
  unreadBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#10b981",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
    marginLeft: 8,
  },
  unreadText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#fff",
  },
  memberBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 3,
  },
  memberText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#64748b",
  },
  separator: {
    height: 1,
    backgroundColor: "#f8fafc",
    marginLeft: 80,
  },

  // Groups hint
  groupsHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: "#f8fafc",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  groupsHintText: {
    fontSize: 12,
    color: "#64748b",
    flex: 1,
  },

  // Support tab
  supportHeader: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
  },
  supportHeaderTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 4,
  },
  supportHeaderSub: {
    fontSize: 14,
    color: "#64748b",
  },
  supportRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 14,
  },
  supportIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  supportTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0f172a",
  },
  supportSubtitle: {
    fontSize: 12,
    color: "#94a3b8",
    marginTop: 2,
  },
  onlineBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#d1fae5",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 4,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#10b981",
  },
  onlineBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#065f46",
  },

  // FAB
  fab: {
    position: "absolute",
    right: 20,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#10b981",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// Modal styles
// ─────────────────────────────────────────────────────────────────────────────
const modalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0f172a",
  },
  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    padding: 20,
    // Extra bottom padding so the submit button sits comfortably above
    // the home indicator / bottom safe area
    paddingBottom: Platform.OS === "ios" ? 48 : 32,
  },
  iconBadge: {
    width: 68,
    height: 68,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 16,
    marginTop: 4,
  },
  description: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 21,
    marginBottom: 28,
    paddingHorizontal: 8,
  },
  fieldGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: "#0f172a",
  },
  textArea: {
    height: 120,
    paddingTop: 12,
  },
  charCount: {
    fontSize: 11,
    color: "#94a3b8",
    textAlign: "right",
    marginTop: 4,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    backgroundColor: "#f8fafc",
    borderRadius: 10,
    padding: 12,
    marginBottom: 24,
  },
  infoText: {
    fontSize: 12,
    color: "#94a3b8",
    flex: 1,
    lineHeight: 18,
  },
  // Submit button now lives inside the ScrollView — no floating footer
  submitBtn: {
    height: 52,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  submitText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: 0.2,
  },
});
