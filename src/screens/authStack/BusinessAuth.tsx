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
import {themeColors} from '../../theme/colors';
import {size} from '../../theme/fontStyle';
import CustomButton from '../../components/common/CustomButton';
import {fonts} from '../../theme/fonts';
import {useNavigation} from '@react-navigation/native';
import {
  horizontalScale,
  moderateScale,
  verticalScale,
} from '../../utils/metrics';
import Icon from 'react-native-vector-icons/FontAwesome5';

const BusinessAuth = () => {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      {/* 1. Main Wrapper */}
      <View style={styles.mainWrapper}>
        {/* 2. Scrollable Content (Takes up all remaining space) */}
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
              onPress={() => navigation.navigate('Login')}
              isTransparent
            />

            <View style={styles.spacer} />

            <Text style={styles.sectionLabel}>Register your IBP account</Text>
            <CustomButton
              text={'Create new account'}
              onPress={() => navigation.navigate('BusinessSignUpScreen')}
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

        {/* 3. Footer (Pinned to bottom, never overlaps) */}
        <View style={styles.footer}>
          <CustomButton
            text={'Login as User'}
            onPress={() => navigation.navigate('GetStarted')}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

// Memoizing static content to prevent unnecessary re-renders
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

// ... AddtionalInfoView code (keep as memoized from previous response)

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: themeColors.white,
  },
  mainWrapper: {
    flex: 1, // Crucial: fills the safe area
  },
  scrollView: {
    flex: 1, // Takes up all space not used by the footer
  },
  scrollContent: {
    paddingHorizontal: horizontalScale(20),
    paddingBottom: verticalScale(30), // Extra space at the bottom of the list
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
    paddingBottom: verticalScale(15), // Adds breathing room from the home indicator
    backgroundColor: themeColors.white,
    // Optional: add a light shadow to separate it visually from content
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
    width: '48%', // Allows for gutter between columns
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
