import React from 'react';
import {View, Text, StyleSheet, Image, FlatList} from 'react-native';
import {themeColors} from '../theme/colors';
import {fonts} from '../theme/fonts';
import moment from 'moment';
import {horizontalScale, verticalScale, moderateScale} from '../utils/metrics';

type TimelineEvent = {
  type: 'period' | 'fertility';
  startDate: string;
  endDate: string;
  ovulationDate?: string;
  periodLength?: number;
};

const getNextTwoCycles = (periodData: any): TimelineEvent[] => {
  if (!periodData || !periodData.length) return [];

  const {
    period_start_date,
    cycle_length,
    period_length,
    fertile_window_dates,
    ovulation_date,
  } = periodData[0];

  const events: TimelineEvent[] = [];
  const startDate = moment(period_start_date);

  // Calculate next 2 cycles
  for (let cycle = 0; cycle < 2; cycle++) {
    const cycleStartDate = moment(startDate).add(cycle * cycle_length, 'days');

    // Add period event
    events.push({
      type: 'period',
      startDate: cycleStartDate.format('YYYY-MM-DD'),
      endDate: cycleStartDate
        .add(period_length - 1, 'days')
        .format('YYYY-MM-DD'),
      periodLength: period_length,
    });

    // Calculate fertility window for this cycle
    const ovulationDateForCycle = moment(cycleStartDate)
      .add(cycle_length - 14, 'days')
      .format('YYYY-MM-DD');
    const fertileStartDate = moment(ovulationDateForCycle)
      .subtract(2, 'days')
      .format('YYYY-MM-DD');
    const fertileEndDate = moment(ovulationDateForCycle)
      .add(2, 'days')
      .format('YYYY-MM-DD');

    events.push({
      type: 'fertility',
      startDate: fertileStartDate,
      endDate: fertileEndDate,
      ovulationDate: ovulationDateForCycle,
    });
  }

  return events.sort((a, b) => moment(a.startDate).diff(moment(b.startDate)));
};

const Timeline = ({periodTrackerData}: {periodTrackerData: any}) => {
  const timelineEvents = getNextTwoCycles(periodTrackerData);

  console.log('TIMELINE EVENTS:', JSON.stringify(timelineEvents, null, 2));

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Timeline</Text>
      <FlatList
        scrollEnabled={false}
        contentContainerStyle={{gap: 10}}
        data={timelineEvents}
        renderItem={({item: event, index}) => (
          <View style={styles.timelineItem}>
            {/* Date Column */}
            <View
              style={{
                flex: 0.2,
                gap: 0,
                //backgroundColor: 'red',
              }}>
              <View style={styles.dateColumn}>
                <Text style={styles.dateNumber}>
                  {moment(event.startDate).format('DD')}
                </Text>
                <Text
                  style={[
                    styles.dateMonth,
                    {fontWeight: '700', color: 'black'},
                  ]}>
                  {moment(event.startDate).format('MMMM').toLowerCase()}
                </Text>
              </View>
              {/* NEXT DATE */}
              <View style={styles.dateColumn}>
                <Text style={styles.dateMonth}>
                  {moment(event.endDate).format('DD')}
                </Text>
                <Text style={styles.dateMonth}>
                  {moment(event.endDate).format('MMMM').toLowerCase()}
                </Text>
              </View>
            </View>

            {/* SEPARATOR */}
            <View
              style={{
                flex: 0.1,
                alignItems: 'center',
                gap: 5,
                paddingTop: 5,
                height: '115%',
              }}>
              <View
                style={{
                  borderWidth: 1,
                  borderColor: themeColors.darkPink,
                  padding: 2,
                  width: 10,
                  height: 10,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 10,
                }}>
                {index === 0 && (
                  <View
                    style={{
                      backgroundColor: themeColors.darkPink,
                      width: 5,
                      height: 5,
                      borderRadius: 5,
                    }}
                  />
                )}
              </View>
              <View
                style={{
                  flex: 1,
                  backgroundColor: themeColors.darkPink,
                  width: 1,
                }}
              />
            </View>
            {/* Content Column */}
            <View style={styles.contentColumn}>
              <Image
                style={styles.icon}
                source={
                  event.type === 'period'
                    ? require('../../assets/images/periodIcon.png')
                    : require('../../assets/images/ovulation-icon.jpg')
                }
              />
              <View style={styles.textContent}>
                <Text style={styles.title}>
                  {event.type === 'period' ? 'Period' : 'Fertility Window'}
                </Text>
                <Text style={styles.subtitle}>
                  {event.type === 'period'
                    ? `Duration: ${event.periodLength} days`
                    : `Ovulation: ${moment(event.ovulationDate).format(
                        'MMM DD',
                      )}`}
                </Text>
              </View>
            </View>
          </View>
        )}
        keyExtractor={(_, index: number) => index.toString()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignSelf: 'center',
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    padding: 10,
    borderRadius: 20,
  },
  heading: {
    marginLeft: 10,
    fontSize: moderateScale(20),
    color: themeColors.black,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: verticalScale(10),
  },
  timelineItem: {
    //justifyContent: 'space-between',
    marginLeft: 10,
    flexDirection: 'row',
    // backgroundColor: themeColors.white,
    borderRadius: 20,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    //elevation: 3,
  },
  dateColumn: {
    flexDirection: 'row',
    gap: 5,
    justifyContent: 'flex-start',
    width: horizontalScale(100),
    alignItems: 'center',
  },
  contentColumn: {
    backgroundColor: 'white',
    borderRadius: 20,
    flex: 0.7,
    flexDirection: 'row',
    alignItems: 'center',
    padding: horizontalScale(15),
  },
  icon: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
    marginRight: horizontalScale(10),
  },
  textContent: {
    flex: 1,
  },
  title: {
    fontSize: moderateScale(15),
    color: themeColors.darkPink,
    marginBottom: verticalScale(4),
    fontFamily: fonts.OpenSansBold,
  },
  subtitle: {
    fontSize: moderateScale(14),
    color: '#888',
    fontFamily: fonts.OpenSansMedium,
  },
  dateNumber: {
    fontSize: moderateScale(17),
    color: themeColors.black,
    fontFamily: fonts.OpenSansBold,
  },
  dateMonth: {
    fontSize: moderateScale(13),
    color: '#888',
    marginTop: verticalScale(4),
  },
  dateYear: {
    fontSize: moderateScale(13),
    color: '#888',
    marginTop: verticalScale(4),
  },
});

export default Timeline;
