import React, {useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  Image,
  SafeAreaView,
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
import { FontAwesome5 as Icon } from '@expo/vector-icons';

const BusinessAuth = () => {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.mainWrapper}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../../../assets/images/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <View style={styles.authSection}>
            <Text style={styles.sectionLabel}>
              Login to your business account
            </Text>
            <CustomButton
              text={'Login'}
              onPress={() => router.push('/(app)/(public)/Login')}
              isTransparent
            />

            <View style={styles.spacer} />

            <Text style={styles.sectionLabel}>Register your IBP account</Text>
            <CustomButton
              text={'Create new account'}
              onPress={() => router.push('/(app)/(public)/VerifyPhoneNumber')}
            />
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.footnote}>
              This registration is for Independent Business/Service Providers
              (IBP) who want to use the marketing feature of 4 Our Life.
            </Text>
            <Text style={styles.boldNote}>
              Note: Your Business/Service should be Health related
              (Product/Service)
            </Text>

            <AddtionalInfoView />

            <Text style={styles.footnote}>
              Healthcare facility registration is done in-person by 4OL
              personnel.
            </Text>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <CustomButton
            text={'Login as User'}
            onPress={() => router.push('/(app)/(public)/GetStarted')}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const AddtionalInfoView = React.memo(() => {
  const info = useMemo(
    () => [
      'Create your professional profile.',
      'Post marketing campaigns.',
      'List your services/products.',
      'Access marketing analytics.',
      'Monitor reviews and ratings.',
    ],
    [],
  );

  return (
    <View style={infoViewStyles.container}>
      <View style={infoViewStyles.grid}>
        {info.map((point, index) => (
          <View key={index} style={infoViewStyles.gridItem}>
            <View style={infoViewStyles.iconWrapper}>
              <Icon name={'check'} size={8} color={themeColors.white} />
            </View>
            <Text style={infoViewStyles.text}>{point}</Text>
          </View>
        ))}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: themeColors.white,
  },
  mainWrapper: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: horizontalScale(20),
    paddingBottom: verticalScale(30),
  },
  logoContainer: {
    height: verticalScale(140),
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: verticalScale(10),
  },
  logo: {
    width: horizontalScale(220),
    height: '100%',
  },
  authSection: {
    marginVertical: verticalScale(15),
  },
  sectionLabel: {
    fontFamily: fonts.OpenSansMedium,
    fontSize: size.md,
    textAlign: 'center',
    marginBottom: verticalScale(10),
    color: themeColors.black,
  },
  spacer: {
    height: verticalScale(20),
  },
  infoSection: {
    marginTop: verticalScale(10),
  },
  footnote: {
    fontFamily: fonts.OpenSansMedium,
    fontSize: size.s,
    textAlign: 'center',
    marginVertical: verticalScale(2),
    color: themeColors.darkGray,
    lineHeight: size.s * 1.5,
  },
  boldNote: {
    fontFamily: fonts.OpenSansBold,
    fontSize: size.s,
    textAlign: 'center',
    color: themeColors.black,
    marginBottom: verticalScale(15),
  },
  footer: {
    paddingHorizontal: horizontalScale(25),
    paddingTop: verticalScale(15),
    paddingBottom: verticalScale(15),
    backgroundColor: themeColors.white,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#f0f0f0',
  },
});

const infoViewStyles = StyleSheet.create({
  container: {
    marginVertical: verticalScale(10),
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: verticalScale(8),
  },
  iconWrapper: {
    padding: moderateScale(4),
    borderRadius: moderateScale(10),
    backgroundColor: themeColors.primary,
    marginTop: 2,
  },
  text: {
    fontFamily: fonts.OpenSansMedium,
    fontSize: size.xs,
    marginLeft: horizontalScale(8),
    color: themeColors.black,
    flex: 1,
  },
});

export default BusinessAuth;
