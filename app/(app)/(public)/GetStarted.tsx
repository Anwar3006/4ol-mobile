import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  Image,
} from 'react-native';
import {themeColors} from '../../../src/theme/colors';
import {size} from '../../../src/theme/fontStyle';
import CustomButton from '../../../src/components/common/CustomButton';
import {fonts} from '../../../src/theme/fonts';
import {useRouter} from 'expo-router';
import {
  horizontalScale,
  moderateScale,
  verticalScale,
} from '../../../src/utils/metrics';
import useUserStore from '@/store/use-userstore';

const GetStarted = () => {
  const router = useRouter();
  const {setHasSeenOnboarding} = useUserStore();

  const handleNavigation = (route: string) => {
    setHasSeenOnboarding(true);
    router.push(route);
  };

  return (
    <View style={styles.container}>
      <StatusBar hidden={true} />
      <ScrollView
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <View style={styles.logoView}>
          <Image
            source={require('../../../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.text}>Login to your existing 4OL account</Text>
        <CustomButton
          text={'Login'}
          onPress={() => handleNavigation('/(app)/(public)/Login')}
          isTransparent
        />
        <Text style={styles.text}>New to 4OL?</Text>
        <CustomButton
          text={'Create new account'}
          onPress={() => {
            handleNavigation('/(app)/(public)/VerifyPhoneNumber');
          }}
        />
      </ScrollView>

      <View style={styles.businessView}>
        <CustomButton
          text={'Login as Business'}
          onPress={() => {
            handleNavigation('/(app)/(public)/BusinessAuth');
          }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    display: 'flex',
    flexDirection: 'row',
    padding: 15,
    paddingVertical: verticalScale(130),
    backgroundColor: themeColors.white,
  },
  logoView: {
    height: verticalScale(180),
    width: horizontalScale(250),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: moderateScale(33),
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  text: {
    fontFamily: fonts.OpenSansMedium,
    fontSize: size.md,
    textAlign: 'center',
    marginVertical: 10,
    color: themeColors.black,
  },
  businessView: {
    marginVertical: 30,
    paddingHorizontal: 55,
    position: 'absolute',
    bottom: 3,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
});

export default GetStarted;
