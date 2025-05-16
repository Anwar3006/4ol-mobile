import React, {useEffect, useRef, useState} from 'react';
import MapService from '../../services/getRegisteredMapMarkers';
import LocationLayout from '../../components/common/LocationLayout';
import MapView, {Marker, PROVIDER_DEFAULT} from 'react-native-maps';
import {
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Image,
  View,
  ActivityIndicator,
  PermissionsAndroid,
  Platform,
  TextInput,
  Switch,
  LayoutChangeEvent,
} from 'react-native';
import {Text} from 'react-native-paper';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import Feather from 'react-native-vector-icons/Feather';
import Entypo from 'react-native-vector-icons/Entypo';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {Dropdown} from 'react-native-element-dropdown';
import useLocation from '../../hooks/useLocation';
import Geolocation from '@react-native-community/geolocation';
import {themeColors} from '../../theme/colors';
import useGhanaPostGPS from '../../hooks/useGhanaPostGPS';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {SCREENS} from '../../constants/screens';
import {
  fetchDistanceAndDuration,
  fetchDistancesAndDurations,
} from '../../services/distanceDurationService';

type TopRatedProps = {
  navigation?: NativeStackNavigationProp<any>;
  route?: {
    params: {
      category?: string;
    };
  };
};

const RegisteredFacilites = ({navigation, route}: TopRatedProps) => {
  const [currentLocation, setCurrentLocation] = useState({
    latitude: null,
    longitude: null,
  });
  const [loading, setLoading] = useState(true); // Add loading state
  const [fetchingGPSLocation, setFetchingGPSLocation] = useState(false);
  const {fetchGhanaPostAddress, addressData} = useGhanaPostGPS();

  const [rowWidth, setRowWidth] = useState(0);
  const [isReady, setIsReady] = useState(false);

  const onTabBarLayout = (event: LayoutChangeEvent) => {
    const width = event.nativeEvent.layout.width;
    setRowWidth(width);
    setIsReady(true);
  };

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true; // iOS handles permissions automatically
  };

  const getLocation = async () => {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      console.log('Permission denied');
      setLoading(false); // Set loading to false if permission is denied
      return;
    }

    Geolocation.getCurrentPosition(
      position => {
        setCurrentLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setLoading(false); // Set loading to false when location is fetched
      },
      error => {
        console.log('Error:', error.message);
        setLoading(false); // Set loading to false if there is an error
      },
      {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
    );
  };

  useEffect(() => {
    getLocation(); // Fetch location on component mount
  }, []);

  useEffect(() => {
    if (currentLocation.latitude && currentLocation.longitude) {
      mapRef.current?.animateToRegion(
        {
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          latitudeDelta: 0.009,
          longitudeDelta: 0.009,
        },
        1000,
      );
    }
  }, [currentLocation]);

  const handleFetchAddress = async () => {
    setFetchingGPSLocation(true);
    if (currentLocation.latitude && currentLocation.longitude) {
      await fetchGhanaPostAddress(
        currentLocation.latitude,
        currentLocation.longitude,
      )
        .then(data => {
          if (data && data?.data?.Table !== null) {
            setAddress(
              data?.data?.Table[0]?.Area +
                ', ' +
                data?.data?.Table[0]?.GPSName || '',
            );
          }
        })
        .finally(() => setFetchingGPSLocation(false));
    }
  };

  const [markers, setMarkers] = useState<any[]>([]);
  const [filteredMarkers, setFilteredMarkers] = useState<any[]>([]);
  const [selectedFacilityType, setSelectedFacilityType] = useState<
    string | null
  >(null);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [selectedRadius, setSelectedRadius] = useState<number>(10);
  const mapRef = useRef<MapView>(null);
  const slideAnim = useRef(new Animated.Value(-200)).current;
  const [address, setAddress] = useState('');
  const [topRated, setTopRated] = useState<boolean>(false);
  const [baseFilteredMarkers, setBaseFilteredMarkers] = useState<any[]>([]);

  const facilityTypeMapping = {
    'Hospital/ Clinic': 'Hospital/ Clinic',
    Pharmacy: 'Pharmacy',
    'Herbal Centers': 'Herbal Hospital',
    'Diagnostic (Laboratory)': 'Diagnostic Lab',
    Dental: 'Dental',
    Ambulance: 'Ambulance',
    Homes: 'Home',
    'Eye Care': 'Eye Care',
    Osteopathy: 'Osteopathy',
    Physiotherapy: 'Physiotherapy',
    Prosthetics: 'Prosthetics',
    Psychiatric: 'Psychiatric',
  };

  const facilityIconMapping = {
    'Hospital/ Clinic': <FontAwesome6 name="house-medical" size={18} />,
    Pharmacy: <FontAwesome5 name="pills" size={18} />,
    'Herbal Centers': <FontAwesome5 name="leaf" size={18} />,
    'Diagnostic (Laboratory)': <Entypo name="lab-flask" size={18} />,
    Dental: <FontAwesome5 name="teeth" size={18} />,
    Ambulance: <FontAwesome5 name="ambulance" size={18} />,
    Homes: <Entypo name="home" size={18} />,
    'Eye Care': <FontAwesome5 name="eye" size={18} />,
    Osteopathy: <FontAwesome5 name="bone" size={18} />,
    Physiotherapy: <FontAwesome6 name="user-doctor" size={18} />,
    Prosthetics: <FontAwesome5 name="hands" size={18} />,
    Psychiatric: <Icon name="brain" size={18} />,
  };

  const facilityTypes = Object.keys(facilityTypeMapping);

  const radiusOptions = [
    {label: '2 km', value: 2},
    {label: '3 km', value: 3},
    {label: '4 km', value: 4},
    {label: '5 km', value: 5},
    {label: '6 km', value: 6},
    {label: '7 km', value: 7},
    {label: '8 km', value: 8},
    {label: '9 km', value: 9},
    {label: '10 km', value: 10},
  ];

  const parseRating = (marker: any) => {
    return marker.avg_rating
      ? parseFloat(marker.avg_rating)
      : marker.facility_ratings?.[0]?.avg
      ? parseFloat(marker.facility_ratings[0].avg)
      : 0;
  };

  const filterMarkersByDistance = async () => {
    if (!currentLocation || !markers.length) return;

    // 1. Filter by facility type
    let filteredResults = markers.filter(marker =>
      selectedFacilityType
        ? marker.facility_type === facilityTypeMapping[selectedFacilityType]
        : true,
    );

    // 2. Calculate distances all at once
    const origin = `${currentLocation.latitude},${currentLocation.longitude}`;
    const destinations = filteredResults.map(
      marker => `${marker.latitude},${marker.longitude}`,
    );

    // Get all distances in a single API call
    const distanceResults = await fetchDistancesAndDurations(
      origin,
      destinations,
    );

    // 3. Combine markers with their distance information
    const markersWithDistance = filteredResults.map((marker, index) => {
      const result = distanceResults[index] || {
        distance: '',
        distanceValue: 0,
        duration: '',
        durationValue: 0,
      };

      // Convert to km for filtering
      const distanceInKm = result.distanceValue / 1000;

      return {
        ...marker,
        distance: distanceInKm,
        distanceText: result.distance,
        duration: result.duration,
      };
    });

    // 4. Apply radius filter
    const withinRadius = markersWithDistance.filter(
      m => m.distance <= selectedRadius,
    );

    // Update base filtered markers
    setBaseFilteredMarkers(withinRadius);
  };

  // New useEffect for applying top-rated filter
  useEffect(() => {
    if (topRated) {
      const topRatedMarkers = baseFilteredMarkers.filter(
        marker => parseRating(marker) >= 4.0,
      );
      setFilteredMarkers(topRatedMarkers);
    } else {
      setFilteredMarkers(baseFilteredMarkers);
    }
  }, [baseFilteredMarkers, topRated]);

  // Update original useEffect
  useEffect(() => {
    filterMarkersByDistance();
    handleFetchAddress();
  }, [currentLocation, markers, selectedFacilityType, selectedRadius]);

  const updateMarkersByRating = () => {
    const newMarkers = filteredMarkers.filter(e => e.avg_rating > 4.0);
    setFilteredMarkers(newMarkers);
  };

  // useEffect(() => {
  //   filterMarkersByDistance();
  //   handleFetchAddress();
  // }, [
  //   currentLocation,
  //   markers,
  //   selectedFacilityType,
  //   selectedRadius,
  //   topRated,
  // ]);

  useEffect(() => {
    (async () => {
      const data = MapService;
      const markersData = await data.getMapMarkerDetails({});
      setMarkers(markersData);
    })();
  }, []);

  const showCard = () => {
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
    }).start();
  };

  const hideCard = () => {
    Animated.spring(slideAnim, {
      toValue: -200,
      useNativeDriver: true,
    }).start();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={themeColors.primary} />
      </View>
    );
  }

  return (
    <LocationLayout>
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0 /* This is to make the filter buttons stretch to the end of the screen */,
          zIndex: 1,
          gap: 10,
          paddingTop: 10,
        }}>
        {/* FACILITY TYPES  */}
        <ScrollView
          horizontal
          contentContainerStyle={{
            gap: 10,
            paddingHorizontal: 10,
          }}
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}>
          {facilityTypes.map(type => (
            <TouchableOpacity
              key={type}
              style={[
                styles.filterButton,
                selectedFacilityType === type
                  ? styles.filterButtonSelected
                  : null,
              ]}
              onPress={() => {
                // Toggle selection: If already selected, deselect it (set to null)
                setSelectedFacilityType(
                  selectedFacilityType === type ? null : type,
                );
              }}>
              {React.cloneElement(facilityIconMapping[type], {
                color: selectedFacilityType === type ? '#fff' : '#666',
              })}
              <Text
                style={[
                  styles.filterText,
                  selectedFacilityType === type
                    ? styles.filterTextSelected
                    : null,
                ]}>
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        {/* ADDRESS, RANGE FILTER ROW */}
        <View
          style={[
            styles.addressFilterContainer,
            {gap: 10, alignItems: 'center'},
          ]}>
          {/* GHANA POST GPS ADDRESS */}
          <View
            style={[
              styles.addressInput,
              {flex: 1, flexDirection: 'row', alignItems: 'center', gap: 5},
            ]}>
            <Entypo name="address" size={24} color="#666" />
            <Text style={{color: 'black'}}>
              {address || 'Loading Location'}
            </Text>
          </View>
          {/* RANGE FILTER */}
          <View style={{flex: 0.6, height: '100%'}}>
            <Dropdown
              renderLeftIcon={() => (
                <Icon
                  style={{marginRight: 10}}
                  name="map-marker-distance"
                  size={20}
                  color="#666"
                />
              )}
              itemTextStyle={{color: 'black'}}
              selectedTextStyle={{color: 'black'}}
              placeholderStyle={{color: 'black'}}
              style={styles.dropdown}
              data={radiusOptions}
              labelField="label"
              valueField="value"
              placeholder="Select radius"
              value={selectedRadius}
              onChange={item => setSelectedRadius(item.value)}
            />
          </View>
        </View>
        {/* TOP RATED FILTER */}
      </View>
      <View
        style={{
          position: 'absolute',
          bottom: 15,
          backgroundColor: 'white',
          flexDirection: 'row',
          alignItems: 'center',
          padding: 10,
          borderRadius: 8,
          marginHorizontal: 10,
          alignSelf: 'center',
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 2,
          },
          gap: 10,
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        }}>
        <Text style={{color: 'black'}}>Top Rated</Text>
        <Switch
          trackColor={{false: '#767577', true: '#3d875f'}}
          thumbColor={topRated ? themeColors.primary : '#f4f3f4'}
          ios_backgroundColor="#3e3e3e"
          onValueChange={() => setTopRated(!topRated)}
          value={topRated}
        />
      </View>
      <MapView
        customMapStyle={[{featureType: 'poi', stylers: [{visibility: 'on'}]}]}
        ref={mapRef}
        style={{width: '100%', height: '100%', zIndex: -1}}
        initialRegion={{
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          latitudeDelta: 0.009,
          longitudeDelta: 0.009,
        }}
        zoomEnabled
        scrollEnabled
        showsUserLocation
        zoomControlEnabled
        showsMyLocationButton={false}
        showsCompass={false}>
        {filteredMarkers.map((marker, index) => {
          // Log marker data to confirm rating value exists
          console.log(`Marker ${index} rating:`, marker.avg_rating);

          const currentDay = new Date()
            .toLocaleString('en-us', {weekday: 'long'})
            .toLowerCase();
          const currentTime = new Date().toTimeString().slice(0, 5);
          const isOpen =
            marker.business_hours[currentDay] &&
            currentTime >= marker.business_hours[currentDay].opening &&
            currentTime <= marker.business_hours[currentDay].closing;

          return (
            <Marker
              key={index}
              coordinate={{
                latitude: marker.latitude,
                longitude: marker.longitude,
              }}
              onPress={() => {
                setSelectedMarker(marker);
                showCard();
              }}>
              <View style={styles.markerContainer}>
                {/* Marker icon */}

                <View
                  style={[
                    styles.customMarker,
                    {
                      backgroundColor: isOpen ? themeColors.primary : '#d9534f',
                    },
                  ]}>
                  {/* {!topRated &&
                  marker.avg_rating &&
                  parseFloat(marker.avg_rating) >= 4.0 ? (
                    <View
                      style={{
                        position: 'absolute',
                        top: -1,
                        right: -10,
                        backgroundColor: '#ffc107',
                        borderRadius: 10,
                        width: 20,
                        height: 20,
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderWidth: 2,
                        borderColor: 'white',
                      }}>
                      <FontAwesome name="trophy" size={10} color="white" />
                    </View>
                  ) : null} */}
                  {React.cloneElement(
                    facilityIconMapping[
                      Object.keys(facilityTypeMapping).find(
                        key =>
                          facilityTypeMapping[key] === marker.facility_type,
                      )
                    ] || <Icon name="medical-bag" size={14} color="#fff" />,
                    {color: '#fff', size: 14},
                  )}
                </View>
              </View>
            </Marker>
          );
        })}
      </MapView>
      <Animated.View
        style={[
          styles.cardContainer,
          {
            transform: [{translateY: slideAnim}],
          },
        ]}>
        {selectedMarker && (
          <View style={styles.card}>
            <View style={styles.cardContent}>
              {/* {selectedMarker.mediaUrls?.[0] && ( */}
              <Image
                source={
                  selectedMarker.mediaUrls?.[0]
                    ? {uri: selectedMarker.mediaUrls?.[0]}
                    : require('../../../assets/hospital1.jpeg')
                }
                style={styles.facilityImage}
              />
              {/* // )} */}
              <View style={styles.detailsContainer}>
                {/* NAME & CLOSE ICON */}
                <View
                  style={{
                    flex: 1,
                    flexDirection: 'row',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                  }}>
                  <Text
                    style={[styles.facilityName, {flex: 1, color: 'black'}]}>
                    {selectedMarker.facility_name}
                  </Text>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 5,
                    }}>
                    <TouchableOpacity
                      onPress={() => {
                        hideCard();
                        setSelectedMarker(null);
                      }}>
                      <Icon name="close" size={24} color="#666" />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* <Text style={styles.facilityType}>
                  {selectedMarker.facility_type}
                </Text> */}

                <Text
                  onLayout={onTabBarLayout}
                  style={[
                    styles.address,
                    {
                      textAlign: 'auto',
                      alignSelf: 'flex-start',
                    },
                  ]}>
                  {selectedMarker.gps_address
                    ? selectedMarker.gps_address
                    : 'Street no 13 Heaven town'}
                  , {selectedMarker.district}, {selectedMarker.area}
                </Text>
                {/* DISTANCE DURAITON ROW */}
                {isReady && (
                  <View
                    style={{
                      width: rowWidth,
                      flexDirection: 'row',
                      gap: 5,
                      justifyContent: 'space-between',
                    }}>
                    <View
                      style={{
                        flexDirection: 'row',
                        gap: 5,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                      <MaterialCommunityIcons
                        name="map-marker-distance"
                        size={16}
                        color={themeColors.primary}
                      />
                      <Text style={{color: 'gray', fontSize: 12}}>
                        {selectedMarker.distance.toFixed(1) || '1'} km
                      </Text>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        gap: 5,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                      <MaterialCommunityIcons
                        name="clock"
                        size={16}
                        color={themeColors.primary}
                      />
                      <Text style={{color: 'gray', fontSize: 12}}>
                        {selectedMarker.duration || '1'}
                      </Text>
                    </View>
                  </View>
                )}
                {/* RATING */}
                {selectedMarker.avg_rating ? (
                  <View
                    style={{
                      alignItems: 'center',
                      flexDirection: 'row',
                      gap: 5,
                    }}>
                    <View
                      style={{
                        flex: 1,
                        flexDirection: 'row',
                        borderRadius: 16,
                        gap: 2,
                        paddingVertical: 5,
                        alignItems: 'center',
                      }}>
                      {[1, 2, 3, 4, 5].map(starIndex => {
                        const rating =
                          parseFloat(selectedMarker.avg_rating) || 0;
                        const filled = rating >= starIndex;
                        const half = !filled && rating > starIndex - 0.5;
                        return (
                          <FontAwesome
                            key={starIndex}
                            name={
                              filled
                                ? 'star'
                                : half
                                ? 'star-half-full'
                                : 'star-o'
                            }
                            size={16}
                            color="#FFD700"
                          />
                        );
                      })}
                    </View>
                  </View>
                ) : null}
                {/* Open/Closed Status Badge */}
                {selectedMarker.business_hours && (
                  <View
                    style={{
                      marginBottom: 8,
                      flexDirection: 'row',
                      gap: 5,
                      justifyContent: 'space-between',
                    }}>
                    {(() => {
                      const currentDay = new Date()
                        .toLocaleString('en-us', {weekday: 'long'})
                        .toLowerCase();
                      const currentTime = new Date().toTimeString().slice(0, 5);

                      // Check if facility is open now
                      const isOpen =
                        selectedMarker.business_hours[currentDay] &&
                        currentTime >=
                          selectedMarker.business_hours[currentDay].opening &&
                        currentTime <=
                          selectedMarker.business_hours[currentDay].closing;

                      // Find next opening day if not open today
                      const findNextOpeningDay = () => {
                        const daysOfWeek = [
                          'sunday',
                          'monday',
                          'tuesday',
                          'wednesday',
                          'thursday',
                          'friday',
                          'saturday',
                        ];
                        const currentDayIndex = daysOfWeek.indexOf(currentDay);

                        // Check each day starting from tomorrow
                        for (let i = 1; i <= 7; i++) {
                          const nextDayIndex = (currentDayIndex + i) % 7;
                          const nextDay = daysOfWeek[nextDayIndex];

                          if (selectedMarker.business_hours[nextDay]) {
                            return {
                              day:
                                nextDay.charAt(0).toUpperCase() +
                                nextDay.slice(1), // Capitalize first letter
                              time: selectedMarker.business_hours[nextDay]
                                .opening,
                            };
                          }
                        }
                        return null; // No open days found
                      };

                      // Get message text
                      let statusText;
                      if (isOpen) {
                        statusText = `Open • Closes at ${selectedMarker.business_hours[currentDay].closing}`;
                      } else if (selectedMarker.business_hours[currentDay]) {
                        statusText = `Closed • Opens at ${selectedMarker.business_hours[currentDay].opening}`;
                      } else {
                        const nextOpenTime = findNextOpeningDay();
                        statusText = nextOpenTime
                          ? `Closed • Opens ${nextOpenTime.day} at ${nextOpenTime.time}`
                          : 'No business hours available';
                      }

                      return (
                        <>
                          <View
                            style={{
                              maxWidth: '80%',
                              backgroundColor: isOpen ? '#e6f7ed' : '#fff8e6', // Light shade of green or yellow
                              paddingVertical: 4,
                              paddingHorizontal: 8,
                              borderRadius: 4,
                              alignSelf: 'flex-start',
                            }}>
                            <Text
                              style={{
                                color: isOpen ? '#1e8449' : '#daa520', // Darker shade of green or yellow
                                fontSize: 12,
                                fontWeight: '600',
                              }}>
                              {statusText}
                            </Text>
                          </View>
                          {/* VIEW DETAILS BTN */}
                          <TouchableOpacity
                            style={{
                              flex: 1,
                              alignItems: 'center',
                              justifyContent: 'center',
                              backgroundColor: themeColors.primary,
                              padding: 4,
                              borderRadius: 5,
                            }}
                            onPress={() => {
                              console.log('Selected Marker:', selectedMarker);

                              navigation?.navigate(SCREENS.FACILITYDETAILS, {
                                id: selectedMarker?.id,
                              });
                            }}>
                            <Feather
                              name="arrow-right"
                              size={16}
                              color="white"
                            />
                          </TouchableOpacity>
                        </>
                      );
                    })()}
                  </View>
                )}
                {/* DISTANCE & DURATION */}
                {/* {selectedMarker.distance && (
                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <Text style={styles.distance}>
                      {selectedMarker.distance.toFixed(1)} km away
                    </Text>
                    <Text style={styles.distance}>
                      {selectedMarker.duration}
                    </Text>
                  </View>
                )} */}
              </View>
            </View>
          </View>
        )}
      </Animated.View>
    </LocationLayout>
  );
};

// Add styles
const styles = StyleSheet.create({
  filterContainer: {
    //backgroundColor: '#fff',
    //paddingVertical: 10,
  },
  filterButton: {
    alignItems: 'center',
    gap: 10,
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  filterButtonSelected: {
    backgroundColor: '#47BE7D',
    borderColor: '#47BE7D',
  },
  filterText: {
    fontSize: 14,
    color: '#333',
  },
  filterTextSelected: {
    color: '#fff',
  },
  cardContainer: {
    backgroundColor: 'white',
    position: 'absolute',
    bottom: 20,
    borderRadius: 12,
    left: 10,
    right: 10,
    zIndex: 1,
  },
  card: {
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 12,
    elevation: 4,
  },
  cardContent: {
    flexDirection: 'row',
  },
  facilityImage: {
    width: 120,
    height: '100%',
    borderRadius: 8,
    marginRight: 12,
  },
  detailsContainer: {
    gap: 5,
    flex: 1,
    justifyContent: 'space-between',
  },
  facilityName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  facilityType: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  address: {
    fontSize: 12,
    color: '#888',
  },
  distance: {
    fontSize: 12,
    color: '#007AFF',
  },
  addressFilterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 10,
  },
  addressInput: {
    flex: 1,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  dropdownContainer: {
    flex: 1,
    //height:"100%",
    //width: '30%',
    zIndex: 1000,
  },
  dropdown: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
    height: '100%',
    width: '100%',
  },
  customMarker: {
    overflow: 'visible',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: themeColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default RegisteredFacilites;
