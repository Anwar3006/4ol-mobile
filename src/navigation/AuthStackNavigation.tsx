import {
  ActivityIndicator,
  Animated,
  Image,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {SCREENS} from '../constants/screens';
import SplashScreen from '../screens/authStack/splashScreeen/Splash';
import {NavigationStackParams} from '../interfaces/index';
import GetStarted from '../screens/authStack/GetStarted';
import PhoneNumberVerification from '../screens/authStack/PhoneNumberVerification';
import OTPVerificationScreen from '../screens/authStack/forgetScreens/OTPVerification';
import ResetPasswordScreen from '../screens/authStack/forgetScreens/ResetPassword';
import SignupScreen from '../screens/authStack/Signup';
import LoginScreen from '../screens/authStack/Login';
import ForgotPasswordScreen from '../screens/authStack/forgetScreens/ForgotPassword';
import {NavigationContainer, useNavigation} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import {user} from '../store/selectors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useEffect, useRef, useState} from 'react';
import {themeColors} from '../theme/colors';
import {Alert} from 'react-native';
import {moderateScale} from '../utils/metrics';
import {Icon} from 'react-native-vector-icons/Icon';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

const AuthStackNavigation = () => {
  const Stack = createNativeStackNavigator();
  const [isUserLoginLoading, setIsUserLoginLoading] = useState<boolean>(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const paddingAnim = useRef(new Animated.Value(0)).current;
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

  useEffect(() => {
    const checkUserLogin = async () => {
      try {
        const isLoggedInJSON = await AsyncStorage.getItem('isLoggedIn');
        const isLogged = isLoggedInJSON ? JSON.parse(isLoggedInJSON) : false;
        setIsLoggedIn(isLogged);
        setIsUserLoginLoading(false);
      } catch (error) {
        console.log('~ ERROR :', error);
      }
    };
    checkUserLogin();
  });

  if (isUserLoginLoading) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator color={themeColors.primary} size={30} />
      </View>
    );
  }

  // const userData = useSelector(user);
  const initialRoute = !isLoggedIn ? 'Splash' : 'Login';

  const navigation = useNavigation<any>();

  return (
    <Stack.Navigator
      initialRouteName={initialRoute}
      screenOptions={{
        animation: 'slide_from_right',
        animationDuration: 10000,
      }}>
      <Stack.Screen
        name="Splash"
        component={SplashScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="GetStarted"
        component={GetStarted}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="VerifyPhoneNumber"
        component={PhoneNumberVerification}
      />
      <Stack.Screen name="OtpVerification" component={OTPVerificationScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{
          headerTransparent: true,
          headerLeft: () => (
            <TouchableOpacity
              style={{flexDirection: 'row', alignItems: 'center', gap: 10}}
              onPress={() => navigation.goBack()}>
              <FontAwesome5 name="chevron-left" size={18} color="gray" />
              <Text style={{color: 'gray', fontSize: 18}}>Back</Text>
            </TouchableOpacity>
          ),
          headerTitle: () => (
            <Animated.View
              style={{
                backgroundColor: themeColors.primary,
                paddingHorizontal: paddingHorizontal, // Animated paddingHorizontal
                // paddingVertical:5,
                paddingVertical: paddingVertical, // Animated paddingVertical
                borderRadius: 5,
                justifyContent: 'center',
                alignItems: 'center',
                alignSelf: 'center',
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
          ),
          headerRight: () => (
            <View>
              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                  opacity: 0,
                }}
                onPress={() => {
                  Alert.alert('Alert', 'This is a test alert');
                }}>
                <Text style={{color: 'red', fontSize: 18}}>Next</Text>
                <FontAwesome5 name="chevron-right" size={18} color="red" />
              </TouchableOpacity>
            </View>
          ),
        }}
      />
      <Stack.Screen name="SignUp" component={SignupScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
};

export default AuthStackNavigation;
