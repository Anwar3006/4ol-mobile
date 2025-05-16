import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
} from 'react-native';
import React, {useEffect, useRef} from 'react';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import {StackParams} from '../../../interfaces';
import {size} from '../../../theme/fontStyle';
import {themeColors} from '../../../theme/colors';
import {fonts} from '../../../theme/fonts';
import Icon from 'react-native-vector-icons/FontAwesome5';

const HeaderHome = () => {
  const navigation = useNavigation<NavigationProp<StackParams>>();
  const paddingAnim = useRef(new Animated.Value(0)).current;

  const paddingHorizontal = paddingAnim.interpolate({
    inputRange: [0, 10],
    outputRange: [3, 6], // Adjust these values for paddingHorizontal
  });

  const paddingVertical = paddingAnim.interpolate({
    inputRange: [0, 10],
    outputRange: [3, 6], // Adjust these values for paddingVertical
  });

  useEffect(() => {
    const animatePadding = () => {
      Animated.sequence([
        Animated.timing(paddingAnim, {
          toValue: 10, // Increase padding by 10
          duration: 1000,
          useNativeDriver: false, // Padding animation requires useNativeDriver to be false
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

  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: themeColors.white,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 3},
        shadowOpacity: 0.2,
        shadowRadius: 5,
        height: 70,
      }}>
      <View>
        <TouchableOpacity
          onPress={() => navigation.navigate('Profile')}
          activeOpacity={0.7}
          style={styles.headerSide}>
          <Image
            source={{
              uri: 'https://t4.ftcdn.net/jpg/05/49/98/39/360_F_549983970_bRCkYfk0P6PP5fKbMhZMIb07mCJ6esXL.jpg',
            }}
            style={styles.avatar}
            alt="avatar"
          />
        </TouchableOpacity>
      </View>

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
              //   paddingVertical:5,
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
                source={require('../../../assets/images/logo2.png')}
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

      <View>
        <View style={styles.headerSide}>
          <Icon
            name="bell"
            size={24}
            color={themeColors.darkGray}
            style={styles.bellIcon}
          />
        </View>
      </View>
    </View>
  );
};

export default HeaderHome;

const styles = StyleSheet.create({
  headerSide: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
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
  headerTitleContainer: {
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
  bellIcon: {
    marginRight: 15,
  },
});
