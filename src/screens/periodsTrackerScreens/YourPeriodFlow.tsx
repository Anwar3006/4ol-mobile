// imports libraries_____
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Modal,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import React, {useState} from 'react';
// imports components_____
import {
  horizontalScale,
  moderateScale,
  verticalScale,
} from '../../utils/metrics';
import {themeColors} from '../../theme/colors';
import {fonts} from '../../theme/fonts';
import {size} from '../../theme/fontStyle';
import {useNavigation} from '@react-navigation/native';
import {PeriodTrackerData} from '../../interfaces';

interface PeriodFlowRoutes {
  route: {
    params: {
      markedDates: {
        [key: string]: {selected: boolean; marked: boolean; color: string};
      };
      period_consistent_text: string;
      trackLengthCycle: number;
      trackLengthPeriods: number;
      your_goal: string;
      user_age: number;
      periodTrackerData: PeriodTrackerData[];
    };
  };
}

const YourPeriodFlow = ({route}: PeriodFlowRoutes) => {
  // navigation_____
  const navigation = useNavigation<any>();
  // marked_dates_____
  const {
    markedDates,
    period_consistent_text,
    trackLengthCycle,
    trackLengthPeriods,
    your_goal,
    user_age,
  } = route.params;

  // modal_visible_____
  const [modalVisible, setModalVisible] = useState(false);
  const [flowPerDate, setFlowPerDate] = useState<{[key: string]: string}>({});
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const colorValuesText = ['light', 'medium', 'heavy', 'super heavy'];
  // Convert markedDates object to array with icons_____
  const {periodTrackerData} = route.params;
  const datesArray = Object.entries(markedDates).map(
    ([date, {color}]: any) => ({
      date,
      icon: 'calendar',
      title: date,
      color: color,
      selectedFlow: flowPerDate[date] || 'select flow',
    }),
  );

  console.log('route.params in yourperiodFLow', route.params);
  const getTintColorForFlow = (flow: string) => {
    switch (flow) {
      case 'light':
        return '#FFCCCC';
      case 'medium':
        return '#FF6666';
      case 'heavy':
        return '#FF3333';
      case 'super heavy':
        return '#CC0000';
      default:
        return 'gray';
    }
  };

  // handle-flow-select__________

  const handleFlowSelect = (flowType: string) => {
    if (selectedDate) {
      setFlowPerDate(prev => ({
        ...prev,
        [selectedDate]: flowType,
      }));
    }
    setModalVisible(false);
  };

  return (
    <>
      <FlatList
        style={{maxHeight: verticalScale(650)}}
        data={datesArray}
        keyExtractor={item => item.date}
        renderItem={({item}) => (
          <TouchableOpacity
            activeOpacity={0.5}
            onPress={() => {
              setSelectedDate(item.date); // Set the selected date for modal
              setModalVisible(true);
            }}
            style={{
              padding: verticalScale(22),
              flexDirection: 'row',
              alignItems: 'center',
              borderBottomWidth: 1,
              borderBottomColor: '#ddd',
            }}>
            <Icon
              name={item.icon}
              color={item.color}
              size={20}
              style={{marginRight: 10}}
            />
            <Text style={{color: '#333', flex: 1}}>{item.title}</Text>
            <Text
              style={{color: themeColors.red, fontFamily: fonts.OpenSansBold}}>
              {item.selectedFlow}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* modal */}

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}>
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0,0,0,0.5)',
          }}>
          <View
            style={{
              backgroundColor: '#fff',
              padding: 20,
              borderRadius: 10,
              width: horizontalScale(300),
            }}>
            <Text
              style={{
                fontSize: moderateScale(18),
                marginBottom: 10,
                textAlign: 'center',
                color: themeColors.red,
                fontFamily: fonts.OpenSansBold,
              }}>
              Select Period Flow
            </Text>

            {colorValuesText.map((flowType: any) => (
              <TouchableOpacity
                key={flowType}
                style={{
                  padding: 10,
                  borderBottomWidth: 0.5,
                  borderBottomColor: 'gray',
                  flexDirection: 'row',
                }}
                activeOpacity={0.5}
                onPress={() => handleFlowSelect(flowType)}>
                <Image
                  style={{
                    width: 20,
                    height: 20,
                    resizeMode: 'center',
                    tintColor: getTintColorForFlow(flowType),
                  }}
                  source={require('../../../assets/images/periodIcon.png')}
                />

                <Text
                  style={{
                    color: themeColors.black,
                    fontFamily: fonts.OpenSansBold,
                    fontSize: moderateScale(15),
                    marginLeft: 10,
                  }}>
                  {flowType}
                </Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={{
                backgroundColor: '#e0e0e0',
                padding: 10,
                borderRadius: 10,
                marginTop: 10,
                alignSelf: 'center',
              }}>
              <Text style={{color: '#333', textAlign: 'center'}}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* modal-content-close */}

      <TouchableOpacity
        activeOpacity={0.7}
        // disabled={isLoading ? true : false}
        style={styles.actionBtnText}
        onPress={() =>
          navigation.navigate('TrackPeriod', {
            datesArray: datesArray,
            periodTrackerData: periodTrackerData,
            period_consistent_text,
            trackLengthCycle,
            trackLengthPeriods,
            your_goal,
            user_age,
          })
        }>
        <Text style={styles.donetext}>{'Next'}</Text>
      </TouchableOpacity>
    </>
  );
};

export default YourPeriodFlow;

const styles = StyleSheet.create({
  periodFlowcontainer: {
    flex: 1,
  },
  flow_type_text: {
    color: themeColors.black,
    fontFamily: fonts.OpenSansBold,
    fontSize: moderateScale(15),
    textAlign: 'center',
    paddingTop: verticalScale(24),
  },
  actionBtnText: {
    color: themeColors.white,
    fontFamily: fonts.OpenSansBold,
    width: horizontalScale(330),
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: themeColors.primary,
    padding: 10,
    borderRadius: 10,
  },
  donetext: {
    color: themeColors.white,
    fontSize: moderateScale(15),
    fontFamily: fonts.OpenSansBold,
  },
});
