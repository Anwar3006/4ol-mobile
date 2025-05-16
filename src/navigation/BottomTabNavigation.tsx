import React, {useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Animated,
  TouchableOpacity,
} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/FontAwesome5';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import HomeScreen from '../screens/Home/Home';
import {SCREENS} from '../constants/screens';
import {themeColors} from '../theme/colors';
import LocatorScreen from '../screens/Locator/Locator';
import PillsReminderScreen from '../screens/pillreminder/PillsReminder';
import SavedItemsScreen from '../screens/savedItems/SavedItems';
import SettingsScreen from '../screens/settings/Settings';
import {height, size} from '../theme/fontStyle';
import {fonts} from '../theme/fonts';
import {useSelector} from 'react-redux';
import {user, userData} from '../store/selectors';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import {BottomTabSchema, StackParams} from '../interfaces';
import RegisteredFacilites from '../screens/Locator/RegisteredFacilites';
import {verticalScale} from '../utils/metrics';

const Tab = createBottomTabNavigator<any>();

const BottomTabNavigation: React.FC = () => {
  const userData: any = useSelector(user);
  const paddingAnim = useRef(new Animated.Value(0)).current;

  const navigation = useNavigation<NavigationProp<BottomTabSchema>>();

  useEffect(() => {
    const animatePadding = () => {
      Animated.sequence([
        Animated.timing(paddingAnim, {
          toValue: 10, // Increase padding by 10
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(paddingAnim, {
          toValue: 0, // Reset padding to original value
          duration: 1000,
          useNativeDriver: false,
        }),
      ]).start(() => animatePadding());
    };

    animatePadding();
  }, [paddingAnim]);

  const paddingHorizontal = paddingAnim.interpolate({
    inputRange: [0, 10],
    outputRange: [3, 6],
  });

  const paddingVertical = paddingAnim.interpolate({
    inputRange: [0, 10],
    outputRange: [3, 6],
  });

  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        tabBarHideOnKeyboard: true,
        // tabBarStyle: {height: 70},
        headerStyle: {
          backgroundColor: themeColors.white,
          elevation: 5,
          shadowColor: '#000',
          shadowOffset: {width: 0, height: 3},
          shadowOpacity: 0.2,
          shadowRadius: 5,
        },
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => navigation.navigate('Profile')}
            activeOpacity={0.7}
            style={styles.profile_logo_container}>
            <Text
              style={{
                color: themeColors.darkPink,
                textTransform: 'uppercase',
                fontWeight: '900',
                fontSize: size.lg,
              }}>{`${userData?.first_name?.slice(
              0,
              1,
            )}${userData?.last_name?.slice(0, 1)}`}</Text>
            {/* <Image
              source={{
                uri: 'https://t4.ftcdn.net/jpg/05/49/98/39/360_F_549983970_bRCkYfk0P6PP5fKbMhZMIb07mCJ6esXL.jpg',
              }}
              style={styles.avatar}
              alt="avatar"
            /> */}
          </TouchableOpacity>
        ),

        headerTitleAlign: 'center',

        headerTitle: () => (
          <View style={styles.headerTitleContainer}>
            <View
              style={{
                width: 50,
                justifyContent: 'center',
                alignItems: 'center',
                height: 50,
                // position:'relative'
              }}>
              <Animated.View
                style={{
                  backgroundColor: themeColors.primary,
                  paddingHorizontal: paddingHorizontal, // Animated paddingHorizontal
                  // paddingVertical:5,
                  paddingVertical: paddingVertical, // Animated paddingVertical
                  borderRadius: 5,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <View
                  style={{
                    width: 28, // Fixed width
                    height: 28, // Fixed height
                    justifyContent: 'center', // Center the image within the fixed view
                    alignItems: 'center',
                  }}>
                  <Image
                    source={require('../../assets/images/logo2.png')}
                    style={{width: '100%', height: '100%'}} // Keep image dimensions fixed
                  />
                </View>
              </Animated.View>
            </View>
            {/* <Text style={styles.headerTitle}>4 Our Life</Text> */}
            {/* <Text style={styles.headerTitle}>
              Hi, {userData?.first_name} {userData?.last_name}
            </Text> */}
          </View>
        ),
        headerRight: () => (
          <TouchableOpacity
            onPress={() => navigation.navigate('Notifications')}
            style={styles.headerSide}>
            <Icon
              name="bell"
              size={24}
              color={themeColors.darkGray}
              style={styles.bellIcon}
            />
          </TouchableOpacity>
        ),
        tabBarIcon: ({focused, color, size}) => {
          let iconName: string;
          if (route.name === SCREENS.HOME) {
            iconName = 'home';
          } else if (route.name === SCREENS.LOCATOR) {
            iconName = 'location-arrow';
          } else if (route.name === SCREENS.PILLSREMINDER) {
            iconName = 'medkit';
          } else if (route.name === SCREENS.SAVEDITEMS) {
            iconName = 'favorite';
          } else {
            iconName = 'cog';
          }

          return (
            <View
              style={
                focused ? styles.iconContainerFocused : styles.iconContainer
              }>
              {iconName == 'favorite' ? (
                <MaterialIcon
                  name={iconName}
                  size={20}
                  color={focused ? themeColors.white : themeColors.darkGray}
                />
              ) : iconName == 'medkit' ? (
                <Image
                  source={require('../../assets/images/pillsReminderIcon2.png')}
                  style={{width: 22, height: 22}}
                />
              ) : (
                <Icon
                  name={iconName}
                  size={20}
                  color={focused ? themeColors.white : themeColors.darkGray}
                />
              )}
            </View>
          );
        },
        tabBarShowLabel: false,
      })}>
      <Tab.Screen name={SCREENS.HOME} component={HomeScreen} />
      {/* <Tab.Screen name={SCREENS.LOCATOR} component={LocatorScreen} /> */}
      <Tab.Screen name={SCREENS.LOCATOR} component={RegisteredFacilites} />
      <Tab.Screen
        name={SCREENS.PILLSREMINDER}
        component={PillsReminderScreen}
        listeners={({navigation, route}) => ({
          tabPress: e => {
            if (!route.params?.initialTab) {
              return;
            }
            e.preventDefault();
            navigation.navigate(SCREENS.PILLSREMINDER, route.params);
          },
        })}
      />
      <Tab.Screen name={SCREENS.SAVEDITEMS} component={SavedItemsScreen} />
      <Tab.Screen name={SCREENS.SETTINGS} component={SettingsScreen} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainerFocused: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: themeColors.primary,
    borderRadius: 25,
    padding: 8,
  },
  headerSide: {
    marginBottom: verticalScale(15),

    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  headerTitleContainer: {
    marginBottom: verticalScale(15),

    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 50,
  },
  headerTitle: {
    fontSize: size.xlg,
    color: themeColors.primary,
    // textAlign: 'center',
    fontFamily: fonts.OpenSansBold,
    // marginTop: 10,
    textTransform: 'uppercase',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  bellIcon: {
    marginRight: 15,
  },
  profile_logo_container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'lightgrey',
    // paddingHorizontal: 10,
    width: 40,
    height: 40,
    marginBottom: verticalScale(15),
    borderRadius: 50,
    justifyContent: 'center',
    marginLeft: 15,
  },
});

export default BottomTabNavigation;
