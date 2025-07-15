import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import {themeColors} from '../../../theme/colors';
import {size} from '../../../theme/fontStyle';
import {fonts} from '../../../theme/fonts';
import {NavigationStackParams, TopRatedItem} from '../../../interfaces';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {SCREENS} from '../../../constants/screens';
import {getTopRatedFacility} from '../../../services/facility';
import {truncateString} from '../../../utils/helpers';
import useLocation from '../../../hooks/useLocation';
import {NavigationProp, useNavigation} from '@react-navigation/native';

interface TopRatednavigationParams {
  FacilityDetails: {
    id: number;
  };
  TopRated: {
    category: string | undefined;
  };
}

const TopRated = () => {
  const [loading, setLoading] = useState(false);
  const [facilities, setFacilities] = useState<any>([]);
  const {location, locationError, retryLocation} = useLocation();
  const navigation = useNavigation<NavigationProp<TopRatednavigationParams>>();

  useEffect(() => {
    if (location) {
      getTopRatedFacility(
        'hospital',
        location,
        () => setLoading(true),
        (successData: any) => {
          setFacilities((prev: any) => [...prev, ...successData]);
          setLoading(false);
        },
        (error: any) => {
          console.log('Error while fetching top facilities', error);
          setLoading(false);
        },
      );
    }
  }, [location]);

  const renderItem = ({item}: {item: any}) => (
    <TouchableOpacity
      key={item.id}
      onPress={() => {
        navigation.navigate('FacilityDetails', {id: item?.id});
      }}>
      <View style={styles.item}>
        <Image
          style={styles.image}
          source={
            item?.mediaUrls
              ? {uri: item?.mediaUrls[0]}
              : require('../../../../assets/healthCareCenter.jpeg')
          }
        />
        <Text style={styles.title}>{truncateString(item.facility_name)}</Text>
        <View style={styles.metaInfo}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Icon
              name={'star'}
              size={12}
              color={themeColors.primary}
              style={{marginRight: 5}}
            />
            <Text style={{fontSize: size.sl}}>{item?.rating || 'N/A'}</Text>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Icon
              name={'road'}
              size={12}
              color={themeColors.primary}
              style={{marginRight: 5}}
            />
            <Text style={{fontSize: size.sl}}>{item?.distance || 'N/A'}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headingLabel}>Top Rated</Text>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate('TopRated', {category: 'hospital'})
          }>
          <Text style={styles.seeAll}>See all</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.itemsContainer}>
        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator color={themeColors.primary} size={'small'} />
          </View>
        ) : facilities.length === 0 ? ( // Show no data message if there are no facilities
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>No record found</Text>
          </View>
        ) : (
          <FlatList
            horizontal
            data={facilities}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            showsHorizontalScrollIndicator={false}
          />
        )}
      </View>
    </View>
  );
};

export default TopRated;

const styles = StyleSheet.create({
  container: {},
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    fontSize: size.lg,
    fontFamily: fonts.OpenSansRegular,
    color: themeColors.darkGray,
  },
  header: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headingLabel: {
    fontSize: size.md,
    color: themeColors.darkGray,
    fontFamily: fonts.OpenSansBold,
    textTransform: 'uppercase',
  },
  seeAll: {
    fontSize: size.s,
    color: themeColors.primary,
    fontFamily: fonts.OpenSansBold,
    textTransform: 'uppercase',
  },
  itemsContainer: {
    marginVertical: 10,
  },
  item: {
    display: 'flex',
    // justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: themeColors.white,
    marginRight: 15,
    padding: 10,
    borderRadius: 10,
    width: 180,
    // height: 200,
  },
  image: {
    width: '100%',
    height: 110,
    borderRadius: 10,
  },
  title: {
    marginTop: 5,
    color: themeColors.black,
    fontSize: size.sl,
    fontFamily: fonts.OpenSansMedium,
    // fontWeight: '600',
  },
  metaInfo: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
});
