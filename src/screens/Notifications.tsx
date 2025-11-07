import React, {useEffect, useRef, useState} from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
} from 'react-native';
import {themeColors} from '../theme/colors';
import {size} from '../theme/fontStyle';
import {fonts} from '../theme/fonts';
import {
  getNotifications,
  handleNotificationSeen,
} from '../services/notificationService';
import {limit} from '../../config/variables';
import {useSelector} from 'react-redux';
import {user} from '../store/selectors';
import {ActivityIndicator} from 'react-native-paper';
import {useWindowDimensions} from 'react-native';
import moment from 'moment';
import {horizontalScale, moderateScale, verticalScale} from '../utils/metrics';
import {ChatModal} from '../components/shared-components/ChatSupportModal';

const Notifications = () => {
  const userData: any = useSelector(user);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<any>([]);
  const [page, setPage] = useState(0);
  const {width} = useWindowDimensions();
  const [hasMore, setHasMore] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  const ref = useRef<TextInput>(null);

  const toggleModal = () => {
    setModalVisible(!modalVisible);
  };

  const loadNotifications = async (userId: string) => {
    if (!hasMore) return;
    getNotifications(
      userId,
      page * limit,
      () => setLoading(true),
      (successData: any) => {
        setNotifications((prev: any) => [...prev, ...successData]);
        setHasMore(successData.length === limit);
        setPage(prev => prev + 1);
        setLoading(false);
      },
      (error: any) => {
        console.log('Error while fetching notifications list', error);
        setLoading(false);
      },
    );
  };

  const updateNotificationSeen = (notificationId: string) => {
    handleNotificationSeen(
      notificationId,
      () => {
        console.log('Updating notification...');
      },
      (successData: any) => {
        setNotifications((prev: any) => {
          // Create a copy of the previous notifications
          const updatedNotifications = prev.map((notification: any) =>
            notification.id === notificationId
              ? {...notification, is_seen: true} // Update the is_seen property
              : notification,
          );
          return updatedNotifications;
        });
      },
      (error: any) => {
        console.log('Error while updating notification:', error.message);
      },
    );
  };

  useEffect(() => {
    if (userData?.id) {
      loadNotifications(userData?.id);
    }
  }, [userData?.id]);

  const renderFooter = () => {
    return hasMore && loading ? (
      <ActivityIndicator size="small" color={themeColors.primary} />
    ) : null;
  };

  const handleLoadMore = () => {
    if (!loading && userData?.id) {
      loadNotifications(userData?.id);
    }
  };

  const renderItem = ({item}: any) => (
    <View style={styles.cardContainer}>
      <View
        style={[
          styles.dot,
          {
            backgroundColor: item.is_seen ? undefined : '#ff5757',
          },
        ]}
      />
      <View style={{flex: 1, gap: 5}}>
        <View style={styles.titleHeader}>
          <Text
            style={[styles.title, {fontWeight: item.is_seen ? '100' : '900'}]}>
            {item.title}
          </Text>
        </View>
        <View>
          <Text
            style={[styles.desc, {fontWeight: item.is_seen ? '100' : '900'}]}>
            {item.body}
          </Text>
        </View>
        {!item.is_seen && (
          <TouchableOpacity onPress={() => updateNotificationSeen(item.id)}>
            <Text style={styles.mark}>Mark as read</Text>
          </TouchableOpacity>
        )}
        <Text style={[styles.time, {fontWeight: item.is_seen ? '100' : '900'}]}>
          {moment(item.created_at).format('DD-MM-YY | hh:mm A')}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        showsVerticalScrollIndicator={false}
        data={notifications}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={{paddingBottom: 15, padding: 15}}
        ListFooterComponent={renderFooter}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
      />
      <View style={styles.supportButtonView}>
        <TouchableOpacity
          style={[
            styles.supportButton,
            {backgroundColor: themeColors.primary, width: width - 60},
          ]}
          onPress={toggleModal}>
          <Text style={[styles.supportButtonText, {color: themeColors.white}]}>
            Contact Support
          </Text>
        </TouchableOpacity>
      </View>
      {/* <KeyboardAvoidingView> */}
      <ChatModal visible={modalVisible} togglemodal={toggleModal} />
      {/* </KeyboardAvoidingView> */}
    </View>
  );
};

export default Notifications;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themeColors.lightGray,
    //padding: 15,
    paddingBottom: 65,
  },
  cardContainer: {
    overflow: 'visible',
    backgroundColor: themeColors.white,
    borderRadius: 10,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  dot: {
    position: 'absolute',
    top: -5,
    left: -5,
    height: 10,
    width: 10,
    borderRadius: 50,
  },
  titleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: size.md,
    fontFamily: fonts.OpenSansRegular,
    fontWeight: '900',
    color: themeColors.black,
  },
  time: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    flex: 1,
    fontSize: size.s,
    fontFamily: fonts.OpenSansRegular,
    fontWeight: '900',
    color: themeColors.black,
    textAlign: 'right',
    alignSelf: 'flex-end',
  },
  desc: {
    fontSize: size.s,
    fontFamily: fonts.OpenSansRegular,
    fontWeight: '900',
    marginTop: 3,
    color: themeColors.black,
  },
  mark: {
    fontSize: size.sl,
    fontFamily: fonts.OpenSansRegular,
    fontWeight: '900',
    color: themeColors.primary,
    alignSelf: 'flex-start',
  },
  supportButtonView: {
    position: 'absolute',
    bottom: 20,
    height: verticalScale(65),
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  supportButton: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    // width: '100%',
    height: verticalScale(50),
    // width: horizontalScale(250),
    marginHorizontal: horizontalScale(30),
  },
  supportButtonText: {
    fontSize: moderateScale(15),
    fontWeight: 'bold',
    // width: 400,
  },
});
