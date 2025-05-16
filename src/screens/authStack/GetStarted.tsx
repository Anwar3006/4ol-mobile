import React, {useState} from 'react';
import {View, Text, StyleSheet, ScrollView, StatusBar} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {themeColors} from '../../theme/colors';
import {size} from '../../theme/fontStyle';
import CustomButton from '../../components/common/CustomButton';
import {SCREENS} from '../../constants/screens';
import {fonts} from '../../theme/fonts';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import {NavigationStackParams} from '../../interfaces';

const GetStarted = () => {
  const navigation = useNavigation<NavigationProp<NavigationStackParams>>();

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
        <Text style={styles.title}>4 Our Life</Text>
        <Text style={styles.subTitle}>
          Healthcare Simplified, Longevity Amplified
        </Text>
        <Text style={styles.text}>Login to your existing 4OL account</Text>
        <CustomButton
          text={'Login'}
          onPress={() => navigation.navigate('Login')}
          isTransparent
        />
        <Text style={styles.text}>New to 4OL?</Text>
        <CustomButton
          text={'Create new account'}
          onPress={() => navigation.navigate('VerifyPhoneNumber')}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: themeColors.white,
  },
  title: {
    fontSize: size.xxxlg,
    color: themeColors.primary,
    textAlign: 'center',
    fontFamily: fonts.QuincyCFBold,
  },
  subTitle: {
    fontSize: size.xlg,
    color: themeColors.primary,
    marginBottom: 80,
    textAlign: 'center',
    fontFamily: fonts.QuincyCFBold,
  },
  text: {
    fontFamily: fonts.OpenSansMedium,
    fontSize: size.md,
    textAlign: 'center',
    marginVertical: 10,
    color: themeColors.black,
  },
});

export default GetStarted;
