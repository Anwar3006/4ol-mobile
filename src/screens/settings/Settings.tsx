import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import {themeColors} from '../../theme/colors';
import {size} from '../../theme/fontStyle';
import Icon from 'react-native-vector-icons/FontAwesome5';
import {SCREENS} from '../../constants/screens';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {logout} from '../../services/auth';
import {useToast} from 'react-native-toast-notifications';
import {useDispatch, useSelector} from 'react-redux';
import {setUserData} from '../../store/slices/User';
import {fonts} from '../../theme/fonts';
import {Share} from 'react-native';
import {Linking} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TouchID from 'react-native-touch-id';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import {NavigationStackParams} from '../../interfaces';
import {logActivity} from '../../services/activityLogsService';
import {user} from '../../store/selectors';

const SettingsScreen = () => {
  const userData: any = useSelector(user);
  const toast = useToast();
  const dispatch = useDispatch();
  const navigation = useNavigation<NavigationProp<NavigationStackParams>>();
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const value = await AsyncStorage.getItem('biometricEnabled');
        setIsBiometricEnabled(value ? JSON.parse(value) : false);
      } catch (error) {
        console.error('Failed to load settings', error);
      }
    };

    loadSettings();
  }, []);

  const toggleSwitch = async () => {
    try {
      const isBiometricSupported = await TouchID.isSupported();
      if (!isBiometricSupported) {
        toast.show(
          'Biometric authentication is not available or has not been set up on this device.',
          {
            type: 'warning',
            placement: 'top',
            duration: 4000,
            animationType: 'slide-in',
          },
        );
        return;
      }
      const newValue = !isBiometricEnabled;
      setIsBiometricEnabled(newValue);
      await AsyncStorage.setItem('biometricEnabled', JSON.stringify(newValue));
      if (!isBiometricEnabled) {
        await AsyncStorage.setItem('isAuthenticated', JSON.stringify(true));
      }
      toast.show(
        isBiometricEnabled
          ? 'Biometric Login Disabled'
          : 'Biometric Login Enabled',
        {
          type: 'success',
          placement: 'top',
          duration: 4000,
          animationType: 'slide-in',
        },
      );
      logActivity(
        {
          user_id: userData?.id || '',
          user_name: `${userData?.first_name || ''} ${
            userData?.last_name || ''
          }`,
          type: 'authentication',
          description: `User ${
            isBiometricEnabled ? 'enabled' : 'disabled'
          } biometric login for the app`,
          reference: 'biometric_login',
          reference_id: userData?.id || '',
        },
        () => {
          console.log('Logging biometric login enable activity...');
        },
        data => {
          console.log(
            'Biometric login enable activity logged successfully:',
            data,
          );
        },
        error => {
          console.error(
            'Error logging biometric login enable activity:',
            error,
          );
        },
      );
    } catch (error) {
      console.log('Failed to save settings', error);
      toast.show(
        'Biometric authentication is not available or has not been set up on this device.',
        {
          type: 'warning',
          placement: 'top',
          duration: 4000,
          animationType: 'slide-in',
        },
      );
    }
  };

  const handleLogOut = () => {
    logout(
      () => {},
      async () => {
        toast.show('Logged out successfully', {
          type: 'success',
          placement: 'top',
          duration: 4000,
          animationType: 'slide-in',
        });
        logActivity(
          {
            user_id: userData?.id || '',
            user_name: `${userData?.first_name || ''} ${
              userData?.last_name || ''
            }`,
            type: 'authentication',
            description: 'User logged out of the app',
            reference: 'logout',
            reference_id: userData?.id || '',
          },
          () => {
            console.log('Logging logout activity...');
          },
          data => {
            console.log('Logout activity logged successfully:', data);
          },
          error => {
            console.error('Error logging logout activity:', error);
          },
        );
        dispatch(setUserData({}));
        navigation.navigate('GetStarted');
      },
      (error: any) => {
        console.log('Error while log out user:', error);
        toast.show(error.message, {
          type: 'danger',
          placement: 'top',
          duration: 4000,
          animationType: 'slide-in',
        });
      },
    );
  };

  const handleToggleBiometric = () => {
    // setBiometricEnabled(!biometricEnabled);
    // toast.show(
    //   biometricEnabled ? 'Biometric Login Disabled' : 'Biometric Login Enabled',
    //   {
    //     type: 'info',
    //     placement: 'top',
    //     duration: 2000,
    //   },
    // );
  };

  // const handleShareApp = () => {
  //   Share.open({
  //     title: 'Share App',
  //     message: 'Check out this amazing app on the App Store and Play Store!',
  //     url: 'https://play.google.com/store/apps/details?id=com.example.app', // replace with your app link
  //   }).catch(err => console.log('Error sharing app:', err));
  // };

  const handleShareApp = async () => {
    try {
      const result = await Share.share({
        message: `Check out this amazing app on the App Store and Play Store!\n\nApp Store: https://play.google.com/store/apps/details?id=com.example.app\n\nPlay Store: https://play.google.com/store/apps/details?id=com.example.app`,
      });
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          console.log('Shared with activity type: ' + result.activityType);
        } else {
          console.log('Shared');
        }
      } else if (result.action === Share.dismissedAction) {
        console.log('Dismissed');
      }
    } catch (error) {
      console.log('Error sharing:', error);
    }
  };

  const handleRateApp = () => {
    const appStoreLink = 'https://apps.apple.com/app/id1234567890'; // replace with your app store link
    const playStoreLink =
      'https://play.google.com/store/apps/details?id=com.example.app'; // replace with your play store link

    // For simplicity, only open Play Store link on Android and App Store link on iOS
    Linking.openURL(playStoreLink);
  };

  const handleGetInTouch = () => {
    Linking.openURL('mailto:support@example.com?subject=App Support'); // replace with your support email
  };

  const handleDeleteData = () => {
    Alert.alert(
      'Delete Data',
      'Are you sure you want to delete all your data?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            toast.show('Your data has been deleted', {
              type: 'success',
              placement: 'top',
              duration: 4000,
            });
          },
        },
      ],
    );
  };

  const renderItem = (
    iconName: string,
    title: string,
    description: string,
    onPress: () => void,
  ) => (
    <TouchableOpacity
      activeOpacity={0.5}
      onPress={onPress}
      style={styles.itemContainer}>
      <View style={styles.iconContainer}>
        <Icon name={iconName} size={15} color={themeColors.white} />
      </View>
      <View>
        <Text style={styles.itemTitle}>{title}</Text>
        <Text style={styles.itemDesc}>{description}</Text>
      </View>
      {iconName == 'fingerprint' ? (
        <Switch
          value={isBiometricEnabled}
          onValueChange={toggleSwitch}
          style={styles.switch}
        />
      ) : (
        <Icon
          name={'arrow-right'}
          size={15}
          color={themeColors.darkGray}
          style={styles.arrowIcon}
        />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* General & Security Settings */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.title, {marginTop: 0}]}>
            General & Security Settings
          </Text>
          {renderItem(
            'key',
            'Change Password',
            'Change your password',
            () => navigation.navigate('ChangePassword'), // navigate to Change Password screen
          )}
          {renderItem(
            'fingerprint',
            'Enable Biometric Login',
            'Use fingerprint or face ID',
            () => {},
          )}
          {renderItem(
            'sign-out-alt',
            'Sign Out',
            'Sign out of your account',
            handleLogOut,
          )}
          {/* <Switch
            value={biometricEnabled}
            onValueChange={handleToggleBiometric}
            style={styles.switch}
          /> */}
        </View>

        {/* Notification Settings */}
        <View style={styles.sectionContainer}>
          <Text style={styles.title}>Notification Settings</Text>
          {renderItem(
            'bell',
            'Notification Display',
            'Manage notification preferences',
            () => {},
          )}
          {renderItem(
            'volume-up',
            'Reminder Sound',
            'Set reminder sound',
            () => {},
          )}
          {renderItem(
            'sync',
            'Continuous Reminder',
            'Repeat reminder until action is taken',
            () => {},
          )}
        </View>

        {/* Access Protection & Privacy */}
        <View style={styles.sectionContainer}>
          <Text style={styles.title}>Access Protection & Privacy</Text>
          {renderItem(
            'file-contract',
            'Terms of Use',
            'View our terms of use',
            () => {},
          )}
          {renderItem(
            'shield-alt',
            'Privacy Policy',
            'View our privacy policy',
            () => {},
          )}
        </View>

        {/* Additional Settings */}
        <View style={styles.sectionContainer}>
          <Text style={styles.title}>Additional Settings</Text>
          {renderItem(
            'trash',
            'Delete Data',
            'Delete your account and all data',
            handleDeleteData,
          )}
          {renderItem(
            'share-alt',
            'Share App',
            'Share the app via Play Store & App Store',
            handleShareApp,
          )}
          {renderItem(
            'star',
            'Rate App',
            'Rate the app on Play Store & App Store',
            handleRateApp,
          )}
          {renderItem(
            'envelope',
            'Get in Touch',
            'Contact us via email',
            handleGetInTouch,
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themeColors.lightGray,
  },
  sectionContainer: {
    // marginVertical: 20,
  },
  title: {
    fontFamily: fonts.OpenSansMedium,
    paddingHorizontal: 20,
    marginVertical: 10,
    color: themeColors.black,
    fontSize: size.xlg,
    backgroundColor: themeColors.white,
    paddingVertical: 20,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    // backgroundColor: themeColors.white,
    borderBottomWidth: 1,
    borderBottomColor: themeColors.lightGray,
  },
  iconContainer: {
    backgroundColor: themeColors.darkGray,
    width: 35,
    height: 35,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  itemTitle: {
    fontFamily: fonts.OpenSansBold,
    fontSize: size.md,
    color: themeColors.black,
  },
  itemDesc: {
    fontFamily: fonts.OpenSansRegular,
    fontSize: size.s,
    color: themeColors.black,
  },
  arrowIcon: {
    position: 'absolute',
    right: 20,
  },
  switch: {
    position: 'absolute',
    right: 0,
  },
});

export default SettingsScreen;
