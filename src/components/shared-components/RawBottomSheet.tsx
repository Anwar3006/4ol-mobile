import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import RBSheet from 'react-native-raw-bottom-sheet';
import RawBottomContent from '../screens/Home/RawBottomContent';

interface Props {
  refRB: any;
  openGallery: () => Promise<void>;
  openCamera: () => Promise<void>;
}

const RawBottomSheet = ({refRB, openGallery, openCamera}: Props) => {
  return (
    <RBSheet
      ref={refRB}
      customStyles={{
        container: {
          borderRadius: 12,
        },
        wrapper: {
          backgroundColor: 'rgba(0,0,0,0.6)',
        },
        draggableIcon: {
          backgroundColor: '#000',
        },
      }}
      customModalProps={{
        animationType: 'fade',
        statusBarTranslucent: true,
      }}
      customAvoidingViewProps={{
        enabled: false,
      }}>
      <RawBottomContent openGallery={openGallery} openCamera={openCamera} />
    </RBSheet>
  );
};

export default RawBottomSheet;

const styles = StyleSheet.create({});
