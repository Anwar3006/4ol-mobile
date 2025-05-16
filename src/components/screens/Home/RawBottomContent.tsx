import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import {themeColors} from '../../../theme/colors';
import {fonts} from '../../../theme/fonts';
import ImagePicker from 'react-native-image-crop-picker';
import {useDispatch} from 'react-redux';
import {saveimage} from '../../../store/slices/User';

interface Props {
  openGallery: () => Promise<void>;
  openCamera: () => Promise<void>;
}

const RawBottomContent = ({openCamera, openGallery}: Props) => {

  return (
    <View>
      <TouchableOpacity
        onPress={openCamera}
        activeOpacity={0.6}
        style={{
          borderBottomWidth: 0.5,
          height: 60,
          justifyContent: 'center',
          alignItems: 'center',
          borderBottomColor: 'grey',
        }}>
        <Text
          style={{
            color: themeColors.black,
            fontSize: 16,
            fontFamily: fonts.OpenSansRegular,
          }}>
          Open Camera
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={openGallery}
        activeOpacity={0.6}
        style={{
          borderBottomWidth: 0.5,
          height: 60,
          justifyContent: 'center',
          alignItems: 'center',
          borderBottomColor: 'grey',
        }}>
        <Text
          style={{
            color: themeColors.black,
            fontSize: 16,
            fontFamily: fonts.OpenSansRegular,
          }}>
          Open Gallery
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default RawBottomContent;

const styles = StyleSheet.create({});
