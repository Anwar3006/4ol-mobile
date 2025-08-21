import React, {useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Modal,
  FlatList,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {themeColors} from '../../theme/colors';
import {size} from '../../theme/fontStyle';
import SearchBar from '../../components/screens/Home/SearchBar';
import {useDispatch, useSelector} from 'react-redux';
import {user} from '../../store/selectors';
import Category from '../../components/screens/Home/Category';
import Advertisement from '../../components/screens/Home/Advertisement';
import TopRated from '../../components/screens/Home/TopRated';
import {fonts} from '../../theme/fonts';
import LocationLayout from '../../components/common/LocationLayout';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import {FiltersProps, NavigationStackParams} from '../../interfaces';
import useLocation from '../../hooks/useLocation';
import {RootState} from '../../store';
import {fetchNearbyPlaces} from '../../store/slices/MarkersSlice';
import {THIS_IS_MAP_KEY} from '../../../config/variables';
import {searchAllTables} from '../../services/searchAllTables';
import {useWindowDimensions} from 'react-native';
import {
  setSearchData,
  setError,
  setResults,
} from '../../store/slices/SearchAllSlice';
import {ActivityIndicator} from 'react-native';
import {calculateAge} from '../../services/calculateAge';
import {subscribeToDemographic} from '../../services/subscribeToDemographic';

const tableNameMapping = {
  illness_and_conditions: 'Illness and Conditions',
  symptoms: 'Symptoms',
  healthy_living: 'Healthy Living',
  facilities: 'Facilities',
};

const HomeScreen = () => {
  const userData: any = useSelector(user);
  const {location} = useLocation();
  const dispatch = useDispatch();
  const {width, height} = useWindowDimensions();
  const isTablet = width >= 600; // Typical tablet breakpoint
  const searchHeight = isTablet ? 20 : 10;
  const {markers, loading, selectedDistance, selectedFilter} = useSelector(
    (state: RootState) => state.markers,
  );
  const [searchQuery, setSearchQuery] = React.useState('');
  const [searching, setSearching] = React.useState(false);

  useEffect(() => {
    const age = calculateAge(userData?.dob);
    subscribeToDemographic(age, userData?.region, userData?.sex);
  }),
    [userData];

  const filters: FiltersProps = {
    Hospital: {type: 'hospital', keyword: ''},
    Herbal: {type: 'hospital', keyword: 'herbal'},
    Laboratory: {type: 'health', keyword: 'diagnostic, laboratory'},
    Ambulance: {type: 'hospital', keyword: 'ambulance'},
    Pharmacy: {type: 'pharmacy', keyword: ''},
    Wholesale: {type: 'pharmacy', keyword: 'wholesale'},
    'Display All': {
      keyword:
        'hospital, pharmacy, herbal, diagnostic, laboratory, ambulance, wholesale, health center, clinic, urgent care, medical center, healthcare, veterinary, dental, physical therapy, wellness, nutrition, rehabilitation',
    },
  };

  const navigation = useNavigation<NavigationProp<NavigationStackParams>>();

  useEffect(() => {
    if (location && !loading && markers?.length == 0) {
      dispatch(
        //@ts-ignore
        fetchNearbyPlaces({
          latitude: location.latitude,
          longitude: location.longitude,
          selectedDistance,
          API_KEY: THIS_IS_MAP_KEY,
          filters,
        }),
      );
    }
  }, [location]);

  const getSearchQueryResults = (query: string) => {
    if (!query) return;
    setSearching(true);
    searchAllTables(query)
      .then(data => {
        dispatch(setSearchData(query, data));
        navigation.navigate('SearchScreen');
      })
      .catch(error => {
        dispatch(setError(error));
        console.log(error);
      })
      .finally(() => setSearching(false));
  };

  const LoadingModal: React.FC = () => {
    return (
      <Modal transparent visible={searching} statusBarTranslucent={true}>
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0,0,0,0.5)',
            gap: 15,
          }}>
          <ActivityIndicator size={70} color={themeColors.primary} />
          <Text style={{fontFamily: fonts.OpenSansBold, fontSize: 20}}>
            searching...
          </Text>
        </View>
      </Modal>
    );
  };

  const [searchKeyWord, setSearchKeyWord] = React.useState('');
  const [keywordLoading, setKeywordLoading] = React.useState(false);
  const [results, setResults] = React.useState([]);
  const [showDropdown, setShowDropdown] = React.useState(false);

  useEffect(() => {
    if (!searchQuery) {
      setResults([]);
      return;
    } // Prevents setting loading state if the query is empty

    setKeywordLoading(true); // Set loading state when user starts typing

    const unsubscribe = setTimeout(() => {
      setSearchKeyWord(searchQuery);

      searchAllTables(searchQuery)
        .then(data => {
          console.log('SEARCH DATA:', JSON.stringify(data, null, 2));
          setResults(data);
        })
        .catch(error => {
          dispatch(setError(error));
          console.log(error);
        })
        .finally(() => setKeywordLoading(false)); // Reset loading state after fetching
    }, 500);

    return () => clearTimeout(unsubscribe);
  }, [searchQuery]);

  return (
    <LocationLayout>
      {/* <HeaderHome /> */}
      <View style={styles.container}>
        <ScrollView
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}>
          <Text style={styles.greeting}>
            Hi, {userData?.first_name} {userData?.last_name}
          </Text>
          {/* <Text style={styles.title}>How are you today?</Text> */}
          <View style={{position: 'relative'}}>
            <SearchBar
              placeholder={'Search hospital, pharmacy, labs...'}
              showBtn
              onFocus={() => setShowDropdown(true)}
              //onBlur={() => setShowDropdown(false)}
              value={searchQuery}
              onChangeText={(text: string) => setSearchQuery(text)}
              handleSearch={() => getSearchQueryResults(searchQuery)}
            />
            {results && searchQuery && showDropdown && (
              <View
                style={{
                  flexDirection: 'row',
                  position: 'absolute',
                  width: Dimensions.get('window').width - 40,
                  height: Dimensions.get('window').height / 2.5,
                  top: 40,
                  marginTop: 10,
                  zIndex: 1000,
                }}>
                <View
                  style={{
                    borderRadius: 10,
                    padding: 10,
                    borderTopLeftRadius: 0,
                    borderTopRightRadius: 0,
                    flex: 1,
                    backgroundColor: themeColors.white,
                    elevation: 2,
                  }}>
                  {keywordLoading ? (
                    <ActivityIndicator size={30} color={themeColors.primary} />
                  ) : (
                    <>
                      <Text style={{color: 'gray'}}>Results</Text>
                      <FlatList
                        data={results}
                        renderItem={({item}) => (
                          <TouchableOpacity
                            onPress={() => {
                              setShowDropdown(false);
                              dispatch(setSearchData(searchQuery, results));
                              // Navigate to CategoryResultsScreen instead of SearchScreen
                              navigation.navigate('CategoryResultsScreen', {
                                category: item.table, // Pass the category/table name
                              });
                            }}>
                            <Text style={{color: 'black', padding: 10}}>
                              {searchQuery} in{' '}
                              <Text
                                style={{
                                  color: 'gray',
                                  textDecorationStyle: 'dashed',
                                  textDecorationLine: 'underline',
                                  fontWeight: '600',
                                }}>
                                {tableNameMapping[item.table]}
                              </Text>
                            </Text>
                          </TouchableOpacity>
                        )}
                        showsVerticalScrollIndicator={false}
                      />
                    </>
                  )}
                </View>
                <TouchableOpacity disabled style={{opacity: 0}}>
                  <Text
                    style={{
                      backgroundColor: themeColors.primary,
                      padding: 14,
                      borderRadius: 10,
                      color: themeColors.white,
                      fontSize: size.sl,
                      fontFamily: fonts.QuincyCFBold,
                      marginLeft: 10,
                    }}>
                    Search
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <Category />
          <Advertisement />
          <TopRated />
        </ScrollView>
      </View>
      {searching && <LoadingModal />}
    </LocationLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themeColors.lightGray,
    paddingHorizontal: 20,
  },
  hello: {
    color: themeColors.black,
    fontSize: size.md,
    fontFamily: fonts.OpenSansRegular,
  },
  greeting: {
    color: themeColors.darkGray,
    fontSize: size.lg,
    fontFamily: fonts.OpenSansBold,
    textTransform: 'capitalize',
    textAlign: 'center',
    paddingTop: 20,
  },
  title: {
    color: themeColors.darkGray,
    fontSize: size.s,
    fontFamily: fonts.OpenSansRegular,
    textTransform: 'capitalize',
    textAlign: 'center',
  },
  item: {
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
    backgroundColor: '#f9c2ff',
  },
  errorText: {
    color: 'red',
    fontSize: size.md,
    textAlign: 'center',
  },
  loadingText: {
    fontSize: size.md,
    color: 'gray',
    textAlign: 'center',
  },
});

export default HomeScreen;
