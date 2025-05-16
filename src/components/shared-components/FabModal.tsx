import {StyleSheet, Text, View} from 'react-native';
import React, {Dispatch, useState} from 'react';
import {FAB, Portal} from 'react-native-paper';
import {themeColors} from '../../theme/colors';
import {horizontalScale, verticalScale} from '../../utils/metrics';
import {
  NavigationProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import {NavigationStackParams} from '../../interfaces';

interface FabProps {
  open: any;
  label: string;
  setisFabOpen: Dispatch<boolean>;
  onStateChange: ({open}: any) => void;
}

const FabModal = ({open, onStateChange, label, setisFabOpen}: FabProps) => {
  const navigation = useNavigation<NavigationProp<NavigationStackParams>>();

  const route = useRoute(); // Get current route

  // Conditionally render FAB only on 'AddMedication' screen
  if (route.name == 'AddMedication') {
    return null; // If the route is not 'AddMedication', don't render FAB
  }

  return (
    <Portal>
      <FAB.Group
        open={open}
        visible={route.name !== 'AddMedication' ? true : false}
        icon={open ? 'close' : 'plus'}
        fabStyle={{
          backgroundColor: themeColors.primary,
          borderRadius: 200,
          height: verticalScale(45),
          width: 100,
          justifyContent: 'center',
          alignItems: 'center',
        }}
        backdropColor="rgba(0,0,0,0.5)"
        label={label}
        theme={{
          roundness: 200,
        }}
        style={{
          // position: 'absolute',
          paddingBottom: verticalScale(78),
        }}
        actions={[
          {
            icon: 'pill',
            label: 'Add Medication',
            labelTextColor: themeColors.white,
            style: {backgroundColor: themeColors.primary},
            labelStyle: {
              position: 'relative',
              left: horizontalScale(20),
            },
            onPress: () => navigation?.navigate('AddMedication'),
          },

          {
            icon: 'note',
            label: 'Add Note',
            labelTextColor: themeColors.white,
            style: {backgroundColor: themeColors.primary},
            labelStyle: {
              position: 'relative',
              left: horizontalScale(20),
            },
            onPress: () => console.log('Pressed star'),
          },

          {
            icon: 'close',
            label: 'close',
            labelTextColor: themeColors.white,

            style: {backgroundColor: themeColors.primary},
            labelStyle: {
              position: 'relative',
              left: horizontalScale(20),
            },
            onPress: () => console.log('Pressed star'),
          },
        ]}
        onStateChange={onStateChange}
        onPress={() => {
          if (open) {
            console.log('modal is open');
            // do something if the speed dial is open
          }
        }}
      />
    </Portal>
  );
};

export default FabModal;

const styles = StyleSheet.create({});
