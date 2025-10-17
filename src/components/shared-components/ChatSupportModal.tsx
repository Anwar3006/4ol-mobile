import React, {useEffect, useState} from 'react';
import {
  View,
  Modal,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  FlatList,
} from 'react-native';
import {RadioButton} from 'react-native-paper';
import {themeColors} from '../../theme/colors';
import {
  moderateScale,
  verticalScale,
  horizontalScale,
} from '../../utils/metrics';
import Icon from 'react-native-vector-icons/Entypo';
import {useSelector} from 'react-redux';
import {user} from '../../store/selectors';
import moment from 'moment';
import {
  sendMessage,
  getVisibleUsers,
  sendDirectMessage,
  getDirectMessages,
  getUserChats,
  USER_ROLES,
} from '../../services/chatsupport';
import {fontSize} from '../../responsive/index';
import {ValidateChatSupport} from '../../validation/index';
import {useFormik} from 'formik';

interface ChatModalProps {
  visible: boolean;
  togglemodal: () => void;
}
export const ChatModal: React.FC<ChatModalProps> = ({visible, togglemodal}) => {
  const userData: any = useSelector(user);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'support' | 'direct'>('support');
  const [visibleUsers, setVisibleUsers] = useState([]);
  const [userChats, setUserChats] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [directMessages, setDirectMessages] = useState([]);
  const [directMessageText, setDirectMessageText] = useState('');

  // Load data when modal opens
  useEffect(() => {
    if (visible) {
      loadChatData();
    }
  }, [visible]);

  const loadChatData = async () => {
    try {
      console.log('🔍 Loading chat data for user:', userData);
      console.log('🔍 User role:', userData?.role);
      console.log('🔍 User ID:', userData?.id);

      // Load visible users for direct chat
      const users = await getVisibleUsers(
        userData?.role || 'housekeeper',
        userData?.id,
      );
      console.log('🔍 Visible users loaded:', users);
      setVisibleUsers(users);

      // Load user's existing chats
      const chats = await getUserChats(userData?.id);
      setUserChats(chats);
    } catch (error) {
      console.error('Error loading chat data:', error);
    }
  };

  const handleUserSelect = async user => {
    setSelectedUser(user);
    try {
      const messages = await getDirectMessages(userData?.id, user.id);
      setDirectMessages(messages);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const sendDirectMessageHandler = async () => {
    if (!directMessageText.trim() || !selectedUser) return;

    try {
      setLoading(true);
      await sendDirectMessage(
        userData?.id,
        selectedUser.id,
        directMessageText,
        () => setLoading(true),
        successData => {
          setLoading(false);
          setDirectMessageText('');
          // Reload messages
          handleUserSelect(selectedUser);
          loadChatData(); // Refresh chat list
        },
        error => {
          setLoading(false);
          Alert.alert('Error', 'Failed to send message');
        },
      );
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', 'Failed to send message');
    }
  };

  const getRoleColor = role => {
    switch (role) {
      case USER_ROLES.MANAGER:
        return '#FF6B6B';
      case USER_ROLES.SUPERVISOR:
        return '#4ECDC4';
      case USER_ROLES.HOUSEKEEPER:
        return '#45B7D1';
      default:
        return themeColors.darkGray;
    }
  };

  const getRoleIcon = role => {
    switch (role) {
      case USER_ROLES.MANAGER:
        return 'user';
      case USER_ROLES.SUPERVISOR:
        return 'eye';
      case USER_ROLES.HOUSEKEEPER:
        return 'home';
      default:
        return 'user';
    }
  };

  const formik = useFormik({
    initialValues: {
      name: '',
      message: '',
      selectedOption: '',
    },
    validationSchema: ValidateChatSupport,
    onSubmit: async values => {
      const messageToSend = {
        status: 'Open',
        priority: 'Low',
        message: values.message,
        subject: values.selectedOption,
        user_name: values.name,
        requested_by: userData?.id,
        created_at: moment(new Date()).valueOf(),
        updated_at: moment(new Date()).valueOf(),
        created_by: userData?.id,
        updated_by: userData?.id,
        is_created_by_admin_panel: false,
      };

      setLoading(true);
      await sendMessage(
        messageToSend,
        () => setLoading(true),
        (successData: any) => {
          setLoading(false);
          formik.resetForm();
          togglemodal();
          console.log('Message sent successfully:', successData);
        },
        error => {
          setLoading(false);
          console.error('Error sending message:', error);
          Alert.alert(
            'Error',
            'Failed to send your message. Please try again.',
          );
        },
      );
    },
  });

  return (
    <Modal
      animationType="slide"
      visible={visible}
      onRequestClose={togglemodal}
      transparent={true}>
      <View style={[styles.modalBackground]}>
        <View
          style={[styles.modalContainer, {backgroundColor: themeColors.white}]}>
          <View
            style={[
              styles.modalHeader,
              {backgroundColor: themeColors.primary},
            ]}>
            <Text style={[styles.modalHeaderText]}>
              {activeTab === 'support' ? 'Chat with us' : 'Direct Chat'}
            </Text>
            <TouchableOpacity
              onPress={() => {
                formik.resetForm();
                setActiveTab('support');
                setSelectedUser(null);
                setDirectMessageText('');
                togglemodal();
              }}>
              <Icon name="minus" size={25} color={themeColors.white} />
            </TouchableOpacity>
          </View>

          {/* Tab Navigation */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'support' && styles.activeTab]}
              onPress={() => setActiveTab('support')}>
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'support' && styles.activeTabText,
                ]}>
                Support
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, activeTab === 'direct' && styles.activeTab]}
              onPress={() => setActiveTab('direct')}>
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'direct' && styles.activeTabText,
                ]}>
                Direct Chat
              </Text>
            </TouchableOpacity>
          </View>
          {activeTab === 'support' ? (
            <ScrollView
              style={{padding: 15}}
              contentContainerStyle={{paddingBottom: 100}}>
              <Text style={{color: themeColors.black}}>
                Sorry, we aren't online at the moment. Leave a message and we
                will get back to you
              </Text>
              <Text
                style={{
                  marginTop: 7,
                  fontSize: fontSize(15),
                  fontWeight: 'bold',
                  color: themeColors.black,
                }}>
                Name
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    borderColor: formik.errors.name
                      ? 'red'
                      : themeColors.darkGray,
                  },
                ]}
                value={formik.values.name}
                onChangeText={formik.handleChange('name')}
                onBlur={formik.handleBlur('name')}
              />
              {formik.touched.name && formik.errors.name && (
                <Text style={{fontSize: fontSize(13), color: 'red'}}>
                  {formik.errors.name}
                </Text>
              )}
              <Text
                style={{
                  marginTop: 10,
                  fontSize: fontSize(15),
                  fontWeight: 'bold',
                  color: themeColors.black,
                }}>
                What can we help you with today?
              </Text>
              <RadioButton.Group
                onValueChange={value =>
                  formik.setFieldValue('selectedOption', value)
                }
                value={formik.values.selectedOption}>
                {[
                  'General question',
                  'Feature request',
                  'Bug report',
                  'My account',
                  'Other',
                ].map(option => (
                  <View style={styles.radioItem} key={option}>
                    <RadioButton value={option} />
                    <Text
                      style={[styles.radioText, {color: themeColors.black}]}>
                      {option}
                    </Text>
                  </View>
                ))}
              </RadioButton.Group>
              {formik.touched.selectedOption &&
                formik.errors.selectedOption && (
                  <Text
                    style={{
                      fontSize: fontSize(13),
                      color: 'red',
                      marginBottom: moderateScale(10),
                    }}>
                    {formik.errors.selectedOption}
                  </Text>
                )}
              <Text
                style={{
                  fontSize: fontSize(15),
                  fontWeight: 'bold',
                  color: themeColors.black,
                  marginTop: -5,
                  marginBottom: 7,
                }}>
                Message
              </Text>
              <TextInput
                style={[
                  styles.messageInput,
                  {
                    borderColor: formik.errors.message
                      ? 'red'
                      : themeColors.darkGray,
                  },
                ]}
                multiline={true}
                textAlignVertical="top"
                value={formik.values.message}
                onChangeText={formik.handleChange('message')}
                onBlur={formik.handleBlur('message')}
              />
              {formik.touched.message && formik.errors.message && (
                <Text style={{color: 'red', fontSize: fontSize(13)}}>
                  {formik.errors.message}
                </Text>
              )}
            </ScrollView>
          ) : (
            <View style={{flex: 1, padding: 15}}>
              {!selectedUser ? (
                <View style={{flex: 1}}>
                  <Text
                    style={{
                      fontSize: fontSize(16),
                      fontWeight: 'bold',
                      color: themeColors.black,
                      marginBottom: 15,
                    }}>
                    Select a colleague to chat with:
                  </Text>
                  <Text
                    style={{
                      fontSize: fontSize(12),
                      color: themeColors.darkGray,
                      marginBottom: 10,
                    }}>
                    Debug: Found {visibleUsers.length} users. Your role:{' '}
                    {userData?.role || 'none'}
                  </Text>
                  <FlatList
                    data={visibleUsers}
                    keyExtractor={item => item.id}
                    renderItem={({item}) => (
                      <TouchableOpacity
                        style={styles.userItem}
                        onPress={() => handleUserSelect(item)}>
                        <View
                          style={[
                            styles.avatar,
                            {backgroundColor: getRoleColor(item.role)},
                          ]}>
                          <Icon
                            name={getRoleIcon(item.role)}
                            size={20}
                            color="white"
                          />
                        </View>
                        <View style={styles.userInfo}>
                          <Text style={styles.userName}>
                            {item.first_name} {item.last_name}
                          </Text>
                          <Text style={styles.userRole}>({item.role})</Text>
                        </View>
                      </TouchableOpacity>
                    )}
                    style={{flex: 1}}
                  />
                </View>
              ) : (
                <View style={{flex: 1}}>
                  {/* Chat Header */}
                  <View style={styles.chatHeader}>
                    <TouchableOpacity onPress={() => setSelectedUser(null)}>
                      <Icon
                        name="arrow-left"
                        size={20}
                        color={themeColors.primary}
                      />
                    </TouchableOpacity>
                    <View
                      style={[
                        styles.avatar,
                        {backgroundColor: getRoleColor(selectedUser.role)},
                      ]}>
                      <Icon
                        name={getRoleIcon(selectedUser.role)}
                        size={16}
                        color="white"
                      />
                    </View>
                    <View>
                      <Text style={styles.chatUserName}>
                        {selectedUser.first_name} {selectedUser.last_name}
                      </Text>
                      <Text style={styles.chatUserRole}>
                        ({selectedUser.role})
                      </Text>
                    </View>
                  </View>

                  {/* Messages */}
                  <ScrollView style={styles.messagesContainer}>
                    {directMessages.map((message, index) => (
                      <View
                        key={index}
                        style={[
                          styles.messageBubble,
                          message.sender_id === userData?.id
                            ? styles.sentMessage
                            : styles.receivedMessage,
                        ]}>
                        <Text
                          style={[
                            styles.messageText,
                            message.sender_id === userData?.id
                              ? styles.sentMessageText
                              : styles.receivedMessageText,
                          ]}>
                          {message.message}
                        </Text>
                        <Text style={styles.messageTime}>
                          {moment(message.created_at).format('HH:mm')}
                        </Text>
                      </View>
                    ))}
                  </ScrollView>

                  {/* Message Input */}
                  <View style={styles.messageInputContainer}>
                    <TextInput
                      style={styles.directMessageInput}
                      value={directMessageText}
                      onChangeText={setDirectMessageText}
                      placeholder="Type a message..."
                      multiline
                    />
                    <TouchableOpacity
                      style={styles.sendButton}
                      onPress={sendDirectMessageHandler}
                      disabled={loading || !directMessageText.trim()}>
                      <Icon name="paper-plane" size={20} color="white" />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          )}
          {activeTab === 'support' && (
            <View
              style={[
                styles.modalBottomView,
                {backgroundColor: themeColors.white, borderTopColor: '#ccc'},
              ]}>
              <View style={{justifyContent: 'flex-end'}}>
                <Text
                  style={{
                    color: themeColors.Supportcolor,
                    fontWeight: 'bold',
                    fontSize: fontSize(15),
                    marginLeft: 4,
                    marginTop: 18,
                  }}>
                  4OL Support
                </Text>
              </View>
              {loading ? (
                <ActivityIndicator size="small" color="green" />
              ) : (
                <TouchableOpacity
                  style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: verticalScale(55),
                    width: horizontalScale(155),
                    marginHorizontal: 15,
                    borderRadius: 10,
                    backgroundColor: themeColors.primary,
                  }}
                  onPress={() => formik.handleSubmit()}>
                  <Text
                    style={{fontSize: fontSize(15), color: themeColors.white}}>
                    Send Message
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    height: verticalScale(600),
    width: horizontalScale(300),
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: verticalScale(50),
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 10,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  modalHeaderText: {
    fontSize: fontSize(20),
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#fff',
    paddingLeft: horizontalScale(70),
  },
  input: {
    borderWidth: 1,
    marginTop: 10,
    borderRadius: 5,
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioText: {
    fontSize: fontSize(18),
  },
  messageInput: {
    borderWidth: 1,
    height: verticalScale(155),
    borderRadius: 5,
  },
  modalBottomView: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 0,
    height: verticalScale(90),
    width: '100%',
    borderTopWidth: 1,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    alignItems: 'center',
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  // New styles for direct chat
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: themeColors.lightGray,
    margin: moderateScale(10),
    borderRadius: moderateScale(8),
    padding: moderateScale(4),
  },
  tab: {
    flex: 1,
    paddingVertical: moderateScale(12),
    alignItems: 'center',
    borderRadius: moderateScale(6),
  },
  activeTab: {
    backgroundColor: themeColors.primary,
  },
  tabText: {
    fontSize: fontSize(14),
    color: themeColors.darkGray,
    fontWeight: '500',
  },
  activeTabText: {
    color: themeColors.white,
  },
  userItem: {
    flexDirection: 'row',
    padding: moderateScale(15),
    borderBottomWidth: 1,
    borderBottomColor: themeColors.lightGray,
    alignItems: 'center',
  },
  avatar: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: moderateScale(12),
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: fontSize(16),
    fontWeight: '600',
    color: themeColors.black,
  },
  userRole: {
    fontSize: fontSize(12),
    color: themeColors.darkGray,
    fontStyle: 'italic',
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: moderateScale(15),
    borderBottomWidth: 1,
    borderBottomColor: themeColors.lightGray,
    backgroundColor: themeColors.lightGray,
  },
  chatUserName: {
    fontSize: fontSize(16),
    fontWeight: '600',
    color: themeColors.black,
    marginLeft: moderateScale(10),
  },
  chatUserRole: {
    fontSize: fontSize(12),
    color: themeColors.darkGray,
    marginLeft: moderateScale(10),
  },
  messagesContainer: {
    flex: 1,
    padding: moderateScale(10),
  },
  messageBubble: {
    maxWidth: '80%',
    padding: moderateScale(10),
    borderRadius: moderateScale(10),
    marginVertical: moderateScale(5),
  },
  sentMessage: {
    backgroundColor: themeColors.primary,
    alignSelf: 'flex-end',
  },
  receivedMessage: {
    backgroundColor: themeColors.lightGray,
    alignSelf: 'flex-start',
  },
  messageText: {
    fontSize: fontSize(14),
    marginBottom: moderateScale(5),
  },
  sentMessageText: {
    color: themeColors.white,
  },
  receivedMessageText: {
    color: themeColors.black,
  },
  messageTime: {
    fontSize: fontSize(10),
    opacity: 0.7,
  },
  messageInputContainer: {
    flexDirection: 'row',
    padding: moderateScale(10),
    borderTopWidth: 1,
    borderTopColor: themeColors.lightGray,
    alignItems: 'flex-end',
  },
  directMessageInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: themeColors.darkGray,
    borderRadius: moderateScale(20),
    paddingHorizontal: moderateScale(15),
    paddingVertical: moderateScale(10),
    marginRight: moderateScale(10),
    maxHeight: verticalScale(100),
  },
  sendButton: {
    backgroundColor: themeColors.primary,
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    justifyContent: 'center',
    alignItems: 'center',
  },
});
