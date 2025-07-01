import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import Icon from 'react-native-vector-icons/FontAwesome5';
import {themeColors} from '../../theme/colors';
import {size} from '../../theme/fontStyle';
import {fonts} from '../../theme/fonts';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {
  getFacilityListByCategory,
  getRegisteredFacilities,
} from '../../services/facility';
import {truncateString} from '../../utils/helpers';
import {limit} from '../../../config/variables';
import {SCREENS} from '../../constants/screens';
import useLocation from '../../hooks/useLocation';
import LocationLayout from '../../components/common/LocationLayout';
import {logActivity} from '../../services/activityLogsService';
import {useSelector} from 'react-redux';
import {user} from '../../store/selectors';

type TopRatedProps = {
  navigation?: NativeStackNavigationProp<any>;
  route?: {
    params: {
      category?: string;
    };
  };
};

const TopRated = ({navigation, route}: TopRatedProps) => {
  const userData = useSelector(user);
  const {category} = route?.params || {};
  const [viewType, setViewType] = useState<'list' | 'map'>('list');
  const [loading, setLoading] = useState(true);
  const [facilities, setFacilities] = useState<any>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const {location} = useLocation();

  useEffect(() => {
    console.log('Category:');
  });

  // const loadFacilities = async (category: string) => {
  //   if (!hasMore) return;
  //   getFacilityListByCategory(
  //     category,
  //     page * limit,
  //     location,
  //     () => setLoading(true),
  //     (successData: any) => {
  //       setFacilities((prev: any) => [...prev, ...successData]);
  //       setHasMore(successData.length === limit);
  //       setPage(prev => prev + 1);
  //       setLoading(false);
  //     },
  //     (error: any) => {
  //       console.log('Error while fetching facilities list', error);
  //       setLoading(false);
  //     },
  //   );
  // };

  // useEffect(() => {
  //   if (category && location) {
  //     loadFacilities(category);
  //     logActivity(
  //       {
  //         user_id: userData?.id || '',
  //         user_name: `${userData?.first_name || ''} ${
  //           userData?.last_name || ''
  //         }`,
  //         type: 'facility',
  //         description: `User has visited the Top Rated Facilities List, selecting the category: ${
  //           category?.charAt(0)?.toUpperCase() + category?.slice(1)
  //         }.`,
  //         reference: '',
  //         reference_id: '',
  //       },
  //       () => {
  //         console.log('Logging Top Rated Facilities activity...');
  //       },
  //       data => {
  //         console.log(
  //           'Top Rated Facilities activity logged successfully:',
  //           data,
  //         );
  //       },
  //       error => {
  //         console.error('Error logging Top Rated Facilities activity:', error);
  //       },
  //     );
  //   }
  // }, [category, location]);

  const renderFooter = () => {
    return hasMore && loading ? (
      <ActivityIndicator size="small" color={themeColors.primary} />
    ) : null;
  };

  const handleLoadMore = () => {
    if (!loading && category && location) {
      //loadFacilities(category);
      fetchFacilities(category);
    }
  };

  const renderItem = ({item}: {item: any}) => (
    <TouchableOpacity
      key={item.id}
      onPress={() => {
        navigation?.navigate(SCREENS.FACILITYDETAILS, {id: item?.id});
      }}
      style={styles.touchable}>
      <View style={styles.item}>
        <Image
          style={styles.image}
          source={
            item?.mediaUrls
              ? {uri: item?.mediaUrls[0]}
              : require('../../../assets/healthCareCenter.jpeg')
          }
        />
        <Text style={styles.title}>{truncateString(item?.facility_name)}</Text>
        <View style={styles.metaInfo}>
          <View style={styles.metaItem}>
            <Icon
              name={'star'}
              size={15}
              color={themeColors.primary}
              style={styles.icon}
            />
            <Text>{item?.rating || 'N/A'}</Text>
          </View>
          <View style={styles.metaItem}>
            <Icon
              name={'road'}
              size={15}
              color={themeColors.primary}
              style={styles.icon}
            />
            <Text>{item?.distance || 'N/A'}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const fetchFacilities = async (category: string) => {
    console.log('CATEGORY', category);
    if (!hasMore) return;
    setLoading(true);
    await getRegisteredFacilities(page * limit, category)
      .then((data: any) => {
        console.log('Facilities list:', data);
        setPage(prev => prev + 1);
        setFacilities((prev: any) => [...prev, ...data]);
        setHasMore(data.length === limit);
      })
      .catch((error: any) => {
        console.log('Error while fetching facilities list', error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchFacilities(category);
  }, []);

  return (
    <LocationLayout>
      <>
        {loading && page === 0 ? ( // Show loader on initial load only
          <View style={styles.loaderContainer}>
            <ActivityIndicator color={themeColors.primary} size={'large'} />
          </View>
        ) : facilities.length === 0 ? ( // Show no data message if there are no facilities
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>No record found</Text>
          </View>
        ) : (
          <>
            <View style={styles.headerContainer}>
              <View style={styles.viewSelector}>
                <TouchableOpacity onPress={() => setViewType('list')}>
                  <Text
                    style={[
                      styles.type,
                      viewType === 'list' && styles.selectedView,
                    ]}>
                    List
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setViewType('map')}>
                  <Text
                    style={[
                      styles.type,
                      viewType === 'map' && styles.selectedView,
                    ]}>
                    Map
                  </Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={styles.filterContainer}
                onPress={() => {}}>
                <Icon
                  name={'filter'}
                  size={12}
                  color={themeColors.darkGray}
                  style={styles.icon}
                />
                <Text style={styles.filter}>Filter</Text>
              </TouchableOpacity>
            </View>

            {viewType === 'list' ? (
              <View style={styles.itemsContainer}>
                <FlatList
                  data={facilities}
                  renderItem={renderItem}
                  keyExtractor={item => item.id.toString()}
                  numColumns={2}
                  columnWrapperStyle={styles.columnWrapper}
                  showsVerticalScrollIndicator={false}
                  ListFooterComponent={renderFooter}
                  onEndReached={handleLoadMore}
                  onEndReachedThreshold={0.5}
                />
              </View>
            ) : (
              <View style={styles.mapContainer}>
                <Text style={{color: themeColors.darkGray}}>Map View</Text>
              </View>
            )}
          </>
        )}
      </>
    </LocationLayout>
  );
};

export default TopRated;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themeColors.lightGray,
  },
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
  headerContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    position: 'relative',
  },
  viewSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    flex: 1,
  },
  filterContainer: {
    position: 'absolute',
    right: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  filter: {
    fontFamily: fonts.OpenSansRegular,
    fontSize: size.md,
    color: themeColors.darkGray,
  },
  type: {
    backgroundColor: 'gray',
    paddingHorizontal: 15,
    paddingVertical: 5,
    color: themeColors.white,
    fontFamily: fonts.OpenSansMedium,
    fontSize: size.md,
  },
  selectedView: {
    backgroundColor: themeColors.primary,
  },
  itemsContainer: {
    margin: 10,
    flex: 1,
  },
  touchable: {
    width: '48%',
    margin: 5,
  },
  item: {
    backgroundColor: themeColors.white,
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 120,
    borderRadius: 10,
  },
  title: {
    marginTop: 5,
    color: themeColors.black,
    fontSize: size.sl,
    fontFamily: fonts.OpenSansRegular,
    textAlign: 'center',
  },
  metaInfo: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 5,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  mapContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  mapFilterContainer: {
    position: 'absolute',
    top: 10,
    width: '100%',
    paddingHorizontal: 10,
    // flexDirection: 'row',
    // justifyContent: 'space-between',
    // alignItems: 'center',
  },
  searchBox: {
    backgroundColor: 'white',
    flex: 1,
    padding: 10,
    paddingRight: 25,
    borderRadius: 8,
    textAlign: 'center',
    position: 'relative',
    // marginRight: 10,
  },
  filterButton: {
    backgroundColor: '#ccc',
    padding: 10,
    borderRadius: 8,
  },
  categoryContainer: {
    position: 'absolute',
    top: 70,
    right: 15,
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  categoryButton: {
    // backgroundColor: 'rgba(0, 0, 0, 0.5)', // Light black with 10% opacity
    padding: 10,
    borderRadius: 8,
    marginVertical: 5,
    width: 90,
    alignItems: 'center',
  },
  suggestionList: {
    marginTop: 10,
    backgroundColor: themeColors.white,
    zIndex: 1000,
  },
  suggestionText: {
    padding: 10,
    borderBottomColor: 'gray',
    borderBottomWidth: 1,
  },
  errorText: {
    color: 'red',
    fontSize: size.md,
    textAlign: 'center',
    padding: 15,
  },
  compassButton: {
    position: 'absolute',
    bottom: 20,
    left: 20, // Position it at the bottom-left corner
    backgroundColor: 'white',
    borderRadius: 50,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    // alignItems: 'center',
  },
  modalHeading: {
    fontSize: size.md,
    fontWeight: 'bold',
    marginBottom: 10,
    color: themeColors.darkGray,
  },
  subHeading: {
    fontSize: size.sl,
    marginBottom: 5,
    color: themeColors.darkGray,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    width: '100%',
    marginBottom: 20,
  },
  picker: {
    height: 50,
    width: '100%',
  },
  closeButton: {
    // margin: 10,
    padding: 10,
    backgroundColor: themeColors.primary,
    borderRadius: 5,
    alignSelf: 'center',
    width: '100%',
  },
  closeButtonText: {
    fontSize: size.md,
    color: themeColors.white,
    textAlign: 'center',
  },
});
