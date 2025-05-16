import {StyleSheet, Text, TouchableOpacity, View, Image} from 'react-native';
import React from 'react';
import {horizontalScale, verticalScale} from '../../../utils/metrics';
import {themeColors} from '../../../theme/colors';

interface PeriodFlowProps {
  style: any;
  imagesrc: any;
  periodFlowType: string;
  getTintColorForFlow: (flowType: string) => string;
}
const PeriodFlowtype = ({
  style,
  imagesrc,
  periodFlowType,
  getTintColorForFlow,
}: PeriodFlowProps) => {
  return (
    <View style={style}>
      <Image
        style={{
          width: horizontalScale(50),
          height: verticalScale(50),
          resizeMode: 'center',
          alignSelf: 'center',
          tintColor:
            periodFlowType === 'select flow'
              ? themeColors.primary
              : getTintColorForFlow(periodFlowType),
        }}
        source={imagesrc}
      />
    </View>
  );
};

export default PeriodFlowtype;

const styles = StyleSheet.create({});
