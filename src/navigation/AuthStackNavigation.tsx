import {ActivityIndicator, Animated, View} from 'react-native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import SplashScreen from '../screens/authStack/splashScreeen/Splash';
import GetStarted from '../screens/authStack/GetStarted';
import PhoneNumberVerification from '../screens/authStack/PhoneNumberVerification';
import OTPVerificationScreen from '../screens/authStack/forgetScreens/OTPVerification';
import ResetPasswordScreen from '../screens/authStack/forgetScreens/ResetPassword';
import SignupScreen from '../screens/authStack/Signup';
import LoginScreen from '../screens/authStack/Login';
import ForgotPasswordScreen from '../screens/authStack/forgetScreens/ForgotPassword';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useEffect, useRef, useState} from 'react';
import {themeColors} from '../theme/colors';

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
        <ActivityIndicator color={themeColors.primary} size={'large'} />
      </View>
    );
  }

  // const userData = useSelector(user);
  const initialRoute = !isLoggedIn ? 'Splash' : 'Login';

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
        options={{title: 'Verify Phone'}}
      />
      <Stack.Screen
        name="OtpVerification"
        component={OTPVerificationScreen}
        options={{title: 'OTP Verification'}}
      />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{
          headerTitle: '',
          headerTransparent: true,
          headerShown: true,
          // headerLeft: () => <BackButton />,
          // headerTitle: () => (
          //   <Animated.View
          //     style={{
          //       backgroundColor: themeColors.primary,
          //       paddingHorizontal: paddingHorizontal, // Animated paddingHorizontal
          //       // paddingVertical:5,
          //       paddingVertical: paddingVertical, // Animated paddingVertical
          //       borderRadius: 5,
          //       justifyContent: 'center',
          //       alignItems: 'center',
          //       alignSelf: 'center',
          //     }}>
          //     <View
          //       style={{
          //         width: 28, // Fixed width
          //         height: 28, // Fixed height
          //         justifyContent: 'center', // Center the image within the fixed view
          //         alignItems: 'center',
          //       }}>
          //       <Image
          //         source={require('../../assets/images/logo2.png')}
          //         style={{width: '100%', height: '100%'}} // Keep image dimensions fixed
          //       />
          //     </View>
          //   </Animated.View>
          // ),
          // headerRight: () => (
          //   <View>
          //     <TouchableOpacity
          //       style={{
          //         flexDirection: 'row',
          //         alignItems: 'center',
          //         gap: 10,
          //         opacity: 0,
          //       }}
          //       onPress={() => {
          //         Alert.alert('Alert', 'This is a test alert');
          //       }}>
          //       <Text style={{color: 'red', fontSize: 18}}>Next</Text>
          //       <FontAwesome5 name="chevron-right" size={18} color="red" />
          //     </TouchableOpacity>
          //   </View>
          // ),
        }}
      />
      <Stack.Screen
        name="SignUp"
        component={SignupScreen}
        options={{title: 'Sign Up'}}
      />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
};

export default AuthStackNavigation;
