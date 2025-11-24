import React, {useEffect, useState, useLayoutEffect} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Modal,
  Linking,
  RefreshControl,
  Platform,
  PermissionsAndroid,
  Alert,
} from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import Icon from 'react-native-vector-icons/FontAwesome5';
import {themeColors} from '../theme/colors';
import {fonts} from '../theme/fonts';
import {size} from '../theme/fontStyle';
import {getFacilityDetailsById} from '../services/facility';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {parsePhoneNumbers} from '../utils/helpers';
import {Share} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import {useToast} from 'react-native-toast-notifications';
import {AirbnbRating} from 'react-native-ratings';
import {SCREENS} from '../constants/screens';
import useLocation from '../hooks/useLocation';
import {useWindowDimensions} from 'react-native';
import {THIS_IS_MAP_KEY} from '../../config/variables';
import {checkFavoriteStatus, toggleFacilityFavorite} from '../services/profile';
import {useSelector} from 'react-redux';
import {user} from '../store/selectors';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import {logActivity} from '../services/activityLogsService';
import {
  addFavoriteFacility,
  getFacilityRatingReview,
} from '../services/favoriteFacilites';
import FacilityRating from '../components/FacilityRating';
import {horizontalScale, moderateScale, verticalScale} from '../utils/metrics';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {supabase} from '../utils/supabaseClient';
import Geolocation from '@react-native-community/geolocation';
import {fetchDistanceAndDuration} from '../services/distanceDurationService';
import DistanceCache from '../utils/distanceCache';

type FacilityDetailsProps = {
  navigation?: NativeStackNavigationProp<any>;
  route?: {
    params: {
      id?: string;
      setFavorites: any;
      favorites: any;
    };
  };
};

const FacilityDetails: React.FC<FacilityDetailsProps> = ({
  navigation,
  route,
}) => {
  const userData: any = useSelector(user);
  const [isFavorited, setIsFavorited] = useState(false);
  const [reviewData, setReviewData] = useState([]);
  const [userReview, setUserReview] = useState();
  const {width, height} = useWindowDimensions();
  const [iheight, setIheight] = useState<number>(0);
  const [imarginBottom, setIMarginBottom] = useState<number>(0);
  useEffect(() => {
    if (Platform.OS === 'android') {
      setIheight(70);
      setIMarginBottom(10);
    } else if (width <= 380) {
      setIheight(70);
      setIMarginBottom(10);
    } else {
      setIheight(90);
      setIMarginBottom(25);
    }
  }, [width]);
  console.log('width', width, 'height', height);
  const isTablet = width >= 600; // Adjust based on your tablet breakpoint

  useEffect(() => {
    (async () => {
      if (reviewData) {
        const userId = await AsyncStorage.getItem('user_id');
        const userReview = reviewData.find(
          review => review.user_profiles.id === userId,
        );
        if (userReview) {
          setUserReview(userReview);
          return;
        }
        setUserReview(null);
      }
    })();
  }, [reviewData]);

  const toast = useToast();
  const {location} = useLocation();
  const {
    id,
    setFavorites,
    favorites,
    currentLocation: passedLocation,
  } = (route?.params as any) || {};
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [facilityDetails, setFacilityDetails] = useState<any>();
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Update header title dynamically when facility details are loaded
  useLayoutEffect(() => {
    if (facilityDetails?.facility_name) {
      navigation?.setOptions({
        title: facilityDetails.facility_name,
      });
    }
  }, [facilityDetails?.facility_name, navigation]);
  const [selectedNumber, setSelectedNumber] = useState<string | null>(null);
  const [actionType, setActionType] = useState<'call' | 'whatsapp' | null>(
    null,
  );
  const [hasWhatsapp, setHasWhatsapp] = useState(false);
  const [facilityData, setFacilityData] = useState({
    id: '',
    facility_name: '',
    gps_address: '',
    hospital_services: [],
    hospital_amenities: [],
    mediaUrls: [],
    avg_rating: 0,
    business_hours: {},
    reviews: [],
    contact_num: '',
    website: '',
    location: {lat: 0, lng: 0},
    types: [],
  });
  const currentDay = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
  });
  const [distance, setDistance] = useState<string>('');
  const [duration, setDuration] = useState<string>('');
  const [curFav, setCurFav] = useState<any>(null);
  const [bottomBarHeight, setBottomBarHeight] = useState(0);
  const [refresh, setRefresh] = useState(false);
  const [destination, setDestination] = useState({
    latitude: null,
    longitude: null,
  });
  const [currentLocation, setCurrentLocation] = useState({
    latitude: passedLocation?.latitude || null,
    longitude: passedLocation?.longitude || null,
  });
  const [distanceCalculated, setDistanceCalculated] = useState(false); // Track if distance was already calculated
  const [lastCalculatedLocation, setLastCalculatedLocation] = useState(
    null as any,
  ); // Track last location used for calculation

  // useEffect(() => {
  //   if (location?.latitude && facilityData?.location) {
  //     fetchDistanceAndDuration(
  //       {
  //         lat: location?.latitude || 0,
  //         lng: location?.longitude || 0,
  //       },
  //       facilityData?.location,
  //     );
  //   }
  // }, [location?.latitude, facilityData?.location]);

  // Helpers for contact numbers selection
  const getParsedTel = (): string[] => {
    const telRaw = facilityDetails?.tel || '';
    const parsed = telRaw ? parsePhoneNumbers(telRaw) : [];
    return Array.isArray(parsed) ? parsed : [];
  };

  const getCallNumbers = (): string[] => {
    const tel = getParsedTel();
    if (tel.length > 0) return tel;
    return facilityDetails?.contact_num
      ? [String(facilityDetails.contact_num)]
      : [];
  };

  const getWhatsappNumbers = (): string[] => {
    const tel = getParsedTel();
    if (tel.length > 0) return tel; // prefer tel for WhatsApp if present
    return facilityDetails?.whatsapp ? [String(facilityDetails.whatsapp)] : [];
  };

  const dialNumber = (number: string) => {
    const phoneUrl = `tel:${number}`;
    console.log('🔍 [PHONE] Attempting to dial:', phoneUrl);

    Linking.canOpenURL(phoneUrl)
      .then(supported => {
        console.log('🔍 [PHONE] canOpenURL result:', supported);
        if (!supported) {
          console.log('🔍 [PHONE] Phone not supported, trying direct open');
          // Try to open directly even if canOpenURL returns false
          Linking.openURL(phoneUrl).catch(err => {
            console.log('🔍 [PHONE] Direct open failed:', err);
            Alert.alert(
              'Error',
              'Phone calls are not supported on this device',
            );
          });
        } else {
          return Linking.openURL(phoneUrl);
        }
      })
      .catch(err => {
        console.log('🔍 [PHONE] canOpenURL error:', err);
        // Try direct open as fallback
        Linking.openURL(phoneUrl).catch(openErr => {
          console.log('🔍 [PHONE] Fallback open failed:', openErr);
          Alert.alert('Error', 'Failed to make phone call');
        });
      });
  };

  const openWhatsApp = (rawNumber: string) => {
    const number = String(rawNumber).replace(/[-\s]/g, '');
    if (!number) {
      Alert.alert(
        'No WhatsApp Number',
        'WhatsApp number not available for this facility',
      );
      return;
    }
    const url = `whatsapp://send?phone=${number}`;
    console.log('🔍 [WHATSAPP] Attempting to open:', url);

    Linking.canOpenURL(url)
      .then(supported => {
        console.log('🔍 [WHATSAPP] canOpenURL result:', supported);
        if (!supported) {
          console.log(
            '🔍 [WHATSAPP] WhatsApp not supported, trying direct open',
          );
          // Try to open directly even if canOpenURL returns false
          Linking.openURL(url).catch(err => {
            console.log('🔍 [WHATSAPP] Direct open failed:', err);
            Alert.alert(
              'WhatsApp Not Available',
              'WhatsApp is not installed on this device',
            );
          });
        } else {
          return Linking.openURL(url);
        }
      })
      .catch(err => {
        console.log('🔍 [WHATSAPP] canOpenURL error:', err);
        // Try direct open as fallback
        Linking.openURL(url).catch(openErr => {
          console.log('🔍 [WHATSAPP] Fallback open failed:', openErr);
          Alert.alert('Error', 'Failed to open WhatsApp');
        });
      });
  };

  const handleActionPress = (type: 'call' | 'whatsapp') => {
    setActionType(type);

    if (type === 'call') {
      const numbers = getCallNumbers();
      if (numbers.length === 0) {
        Alert.alert(
          'No Phone Number',
          'Phone number not available for this facility',
        );
        return;
      }
      if (numbers.length === 1) {
        dialNumber(numbers[0]);
        return;
      }
      setIsModalVisible(true); // choose which to call
      return;
    }

    if (type === 'whatsapp') {
      const numbers = getWhatsappNumbers();
      if (numbers.length === 0) {
        Alert.alert(
          'No WhatsApp Number',
          'WhatsApp number not available for this facility',
        );
        return;
      }
      if (numbers.length === 1) {
        openWhatsApp(numbers[0]);
        return;
      }
      setIsModalVisible(true); // choose which to WhatsApp
    }
  };

  const handleNumberSelect = (number: string) => {
    setSelectedNumber(number);
    setIsModalVisible(false);

    if (actionType === 'call') {
      dialNumber(number);
    } else if (actionType === 'whatsapp') {
      openWhatsApp(number);
    }
  };

  const handleShare = async () => {
    try {
      const result = await Share.share({
        message: `Check out this facility: ${
          facilityDetails?.facility_name
        }\n\nAddress: ${
          facilityDetails?.gps_address || facilityDetails?.location
        }\n\nVisit us for more info!`,
      });
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          console.log('Shared with activity type: ' + result.activityType);
        } else {
          console.log('Shared');
        }
      } else if (result.action === Share.dismissedAction) {
        console.log('Dismissed');
      }
    } catch (error) {
      console.log('Error sharing:', error);
    }
  };

  const openInMaps = async () => {
    // Get destination coordinates
    const facilityLat =
      facilityDetails?.latitude || facilityDetails?.location?.lat;
    const facilityLng =
      facilityDetails?.longitude || facilityDetails?.location?.lng;

    if (!facilityLat || !facilityLng) {
      Alert.alert(
        'Error',
        'Location coordinates not available for this facility',
      );
      return;
    }

    const destination = `${facilityLat},${facilityLng}`;
    const googleMapsWebUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=driving`;
    const googleMapsAppUrl = `comgooglemaps://?daddr=${destination}&directionsmode=driving`;

    try {
      if (Platform.OS === 'ios') {
        const canOpenGoogleMaps = await Linking.canOpenURL('comgooglemaps://');
        if (canOpenGoogleMaps) {
          await Linking.openURL(googleMapsAppUrl);
        } else {
          await Linking.openURL(googleMapsWebUrl);
        }
      } else {
        await Linking.openURL(googleMapsWebUrl);
      }
    } catch (err) {
      console.error('Error opening Google Maps:', err);
      Alert.alert('Error', 'Failed to open Google Maps');
    }
  };

  useEffect(() => {
    console.log('favorites', JSON.stringify(favorites, null, 2));
    console.log('facilityDetails', facilityDetails);
    console.log('id', id);

    favorites?.find((f: any) => f?.facility.id == id)
      ? setIsFavorited(true)
      : setIsFavorited(false);
  }, []);

  useEffect(() => {
    if (id) {
      getFacilityDetailsById(
        id,
        () => setLoading(true),
        (successData: any) => {
          setFacilityDetails(successData);
          // getCompletePlaceDetails(successData.facility_name);
          // hasWhatsapp if tel exists or whatsapp exists
          const telParsed =
            (successData?.tel ? parsePhoneNumbers(successData?.tel) : []) || [];
          setHasWhatsapp(
            (Array.isArray(telParsed) && telParsed.length > 0) ||
              !!successData?.whatsapp,
          );
          if (
            !(
              (Array.isArray(telParsed) && telParsed.length > 0) ||
              !!successData?.whatsapp
            )
          ) {
            setActionType('call');
          }
          setLoading(false);
          logActivity(
            {
              user_id: userData?.id || '',
              user_name: `${userData?.first_name || ''} ${
                userData?.last_name || ''
              }`,
              type: 'facility',
              description: `User has viewed Facility Details`,
              reference: `${successData?.facility_name || ''}`,
              reference_id: id || '',
            },
            () => {
              console.log('Logging Facility Details activity...');
            },
            data => {
              console.log(
                'Facility Details activity logged successfully:',
                data,
              );
            },
            error => {
              console.error('Error logging Facility Details activity:', error);
            },
          );
        },
        (error: any) => {
          console.log('Error while fetching facility details', error);
          setLoading(false);
        },
      );
      checkFavoriteStatus(
        userData?.id,
        id as string,
        () => {},
        (successData: any) => {},
        (error: any) => {
          console.error('Error fetching favorite status:', error);
        },
      );
      if (favorites) {
        const currentFavorite = favorites?.find(
          (f: any) => f?.facility_id == id,
        );
        if (currentFavorite) {
          setCurFav(currentFavorite);
        } else {
          setCurFav(null);
        }
      }
    }
  }, [id]);

  const handleCopyNumber = (number: string) => {
    Clipboard.setString(number);
    setIsModalVisible(false);
    toast.show('Number copied to clipboard', {
      type: 'success',
      placement: 'top',
      duration: 4000,
      animationType: 'slide-in',
    });
  };

  const images = [
    require('../../assets/healthCareCenter.jpeg'),
    require('../../assets/healthCareCenter.jpeg'),
    require('../../assets/healthCareCenter.jpeg'),
    require('../../assets/healthCareCenter.jpeg'),
  ];

  const handleSnap = (index: number) => {
    setCurrentIndex(index);
  };

  useEffect(() => {
    const getLatLong = async () => {
      const {data, error} = await supabase
        .from('healthcare_profiles')
        .select('latitude, longitude')
        .not('latitude', 'is', null)
        .not('longitude', 'is', null)
        .eq('status', 'Approved')
        .eq('id', id);

      if (error) {
        console.error(error);
        return;
      }

      if (data) {
        setDestination(data[0] || null);
      }
    };

    getLatLong();

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
      // If location was passed from previous screen, use it
      if (passedLocation?.latitude && passedLocation?.longitude) {
        console.log(
          '📍 [FACILITY DETAILS] Using passed location:',
          passedLocation,
        );
        setCurrentLocation(passedLocation);
        setLoading(false);
        return;
      }

      // Otherwise, get location from device
      console.log(
        '📍 [FACILITY DETAILS] No passed location, getting from device...',
      );
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        console.log('Permission denied');
        setLoading(false);
        return;
      }

      Geolocation.getCurrentPosition(
        position => {
          console.log('📍 [FACILITY DETAILS] Got device location:', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setCurrentLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setLoading(false);
        },
        error => {
          console.log('Error:', error.message);
          setLoading(false);
        },
        {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
      );
    };

    getLocation();
  }, []);

  // 🛑 Now a second useEffect that waits for both destination and currentLocation
  useEffect(() => {
    const getDistanceDuration = async () => {
      // Only proceed if both locations are valid (not null)
      if (
        currentLocation?.latitude &&
        currentLocation?.longitude &&
        destination?.latitude &&
        destination?.longitude
      ) {
        const currentLocationString = `${currentLocation.latitude},${currentLocation.longitude}`;

        // Check if location has changed significantly (more than 100 meters)
        const shouldRecalculate =
          !lastCalculatedLocation ||
          Math.abs(currentLocation.latitude - lastCalculatedLocation.latitude) >
            0.001 || // ~100m
          Math.abs(
            currentLocation.longitude - lastCalculatedLocation.longitude,
          ) > 0.001;

        if (shouldRecalculate) {
          const origin = currentLocationString;
          const destinations = `${destination.latitude},${destination.longitude}`;

          try {
            // First, try to get cached distance data
            const cachedDistance = await DistanceCache.getCachedDistance(
              id as string,
              currentLocation.latitude,
              currentLocation.longitude,
            );

            if (cachedDistance) {
              // Use cached data
              setDistance(cachedDistance.distance);
              setDuration(cachedDistance.duration);
              setLastCalculatedLocation(currentLocation);
              console.log('✅ Using cached distance data');
            } else {
              // Calculate new distance and cache it
              console.log('🔄 Calculating distance and duration...');
              console.log('📍 Location changed, recalculating...');
              console.log('📍 From:', origin, 'To:', destinations);

              const {distance, duration} = await fetchDistanceAndDuration(
                origin,
                destinations,
              );

              setDistance(distance);
              setDuration(duration);
              setLastCalculatedLocation(currentLocation);

              // Cache the new distance data
              await DistanceCache.setCachedDistance(
                id as string,
                currentLocation.latitude,
                currentLocation.longitude,
                distance,
                duration,
              );

              console.log('✅ Distance calculated and cached successfully');
            }
          } catch (error) {
            console.error('❌ Error calculating distance:', error);
          }
        } else {
          console.log('📍 Location unchanged, using cached distance');
        }
      } else {
        console.log('⏳ Waiting for valid location data...', {
          currentLocation: currentLocation
            ? `${currentLocation.latitude},${currentLocation.longitude}`
            : 'null',
          destination: destination
            ? `${destination.latitude},${destination.longitude}`
            : 'null',
        });
      }
    };

    getDistanceDuration();
  }, [currentLocation, destination, lastCalculatedLocation, id]); // ✅ Depend on location changes and facility ID

  const handleToggleFacilityFavorite = async facilityId => {
    setIsFavorited(!isFavorited);
    logActivity(
      {
        user_id: userData?.id || '',
        user_name: `${userData?.first_name || ''} ${userData?.last_name || ''}`,
        type: 'facility',
        description: `User has ${
          !isFavorited ? 'added' : 'removed'
        } the facility ${!isFavorited ? 'to' : 'from'} favorites`,
        reference: `${facilityDetails?.facility_name || ''}`,
        reference_id: id || '',
      },
      () => {
        console.log('Logging toggle Favorites activity...');
      },
      data => {
        console.log('Favorites toggle activity logged successfully:', data);
      },
      error => {
        console.error('Error logging Favorites toggle activity:', error);
      },
    );
    if (setFavorites && isFavorited) {
      setFavorites((prev: any) => {
        return prev?.filter((facility: any) => facility?.facility_id !== id);
      });
    } else if (setFavorites && !isFavorited && curFav) {
      setFavorites((prev: any) => {
        return [{...curFav}, ...prev];
      });
    }
    await addFavoriteFacility(facilityId);
    toggleFacilityFavorite(
      userData?.id,
      id as string,
      () => {},
      (successData: any) => {
        console.log('response', successData);
      },
      (error: any) => {
        console.log('Error', error);
      },
    );
  };

  useEffect(() => {
    const fetchReviewData = async () => {
      if (!facilityDetails?.id) {
        return;
      }
      try {
        setLoading(true);
        const data = await getFacilityRatingReview(facilityDetails.id);
        setReviewData(data);
        setRefresh(false);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviewData();
  }, [facilityDetails, refresh]);

  const StarRating = ({rating}: {rating: number}) => {
    const fullStars = Math.floor(rating); // Full stars count
    const hasHalfStar = rating % 1 !== 0; // Check for half-star
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0); // Remaining stars

    return (
      <View style={{flexDirection: 'row'}}>
        {/* Full Stars */}
        {Array(fullStars)
          .fill(0)
          .map((_, index) => (
            <FontAwesome
              key={`full-${index}`}
              name="star"
              size={15}
              color="#ffc107"
              style={{marginHorizontal: 3}}
            />
          ))}

        {/* Half Star */}
        {hasHalfStar && (
          <FontAwesome
            name="star-half-full"
            size={15}
            color="#ffc107"
            style={{marginHorizontal: 3}}
          />
        )}

        {/* Empty Stars */}
        {Array(emptyStars)
          .fill(0)
          .map((_, index) => (
            <FontAwesome
              key={`empty-${index}`}
              name="star-o"
              size={15}
              style={{marginHorizontal: 3}}
              color="#ffc107"
            />
          ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator color={themeColors.primary} size={'large'} />
        </View>
      ) : !facilityDetails ? (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>No record found</Text>
        </View>
      ) : (
        <>
          <ScrollView
            contentContainerStyle={[
              styles.scrollViewContent,
              {paddingBottom: bottomBarHeight},
            ]}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refresh}
                onRefresh={() => setRefresh(!refresh)}
              />
            }>
            <View style={[styles.carouselContainer, {width: width}]}>
              <Carousel
                loop
                autoPlay={!(facilityDetails?.mediaUrls?.length > 0)}
                width={width}
                height={isTablet ? width * 0.4 : width * 0.6}
                data={
                  facilityDetails?.mediaUrls?.length > 0
                    ? facilityDetails?.mediaUrls
                    : images
                }
                scrollAnimationDuration={1000}
                enabled={
                  (facilityDetails?.mediaUrls?.length > 0
                    ? facilityDetails?.mediaUrls.length
                    : images.length) > 1
                } // 👈 This disables scroll when only one item
                renderItem={({item}) => (
                  <Image
                    source={
                      //@ts-ignore
                      facilityDetails?.mediaUrls?.length > 0
                        ? {uri: item}
                        : item // item can be a local require()
                    }
                    style={[
                      styles.image,
                      {
                        width: width,
                        height: isTablet ? width * 0.4 : width * 0.6,
                        resizeMode: isTablet ? 'stretch' : 'cover',
                      },
                    ]}
                  />
                )}
                onSnapToItem={handleSnap}
              />
              <FacilityRating
                userReview={userReview ? userReview : undefined}
                facilityId={facilityDetails.id}
                facilityName={facilityDetails.facility_name}
              />

              <TouchableOpacity
                style={styles.favoritesIcon}
                onPress={async () =>
                  await handleToggleFacilityFavorite(facilityDetails?.id)
                }>
                <MaterialIcon
                  name={isFavorited ? 'heart' : 'heart-outline'}
                  size={isTablet ? 35 : 24}
                  color={themeColors.primary}
                />
              </TouchableOpacity>
            </View>
            <View style={styles.paginationContainer}>
              {facilityDetails?.mediaUrls?.length
                ? facilityDetails?.mediaUrls?.map((_, index: number) => (
                    <View
                      key={index}
                      style={[
                        styles.dot,
                        {
                          backgroundColor:
                            index === currentIndex
                              ? themeColors.primary
                              : themeColors.white,
                        },
                      ]}
                    />
                  ))
                : images.map((_, index: number) => (
                    <View
                      key={index}
                      style={[
                        styles.dot,
                        {
                          backgroundColor:
                            index === currentIndex
                              ? themeColors.primary
                              : themeColors.white,
                        },
                      ]}
                    />
                  ))}
            </View>
            <View style={styles.facilityInfoContainer}>
              <Text style={styles.facilityName}>
                {facilityDetails.facility_name}{' '}
                {facilityDetails?.ownership
                  ? `(${facilityDetails?.ownership})`
                  : ''}
              </Text>
              <Text style={styles.nhisAccredited}>
                <Text style={{fontFamily: fonts.OpenSansBold}}>
                  NHIS Accredited:
                </Text>{' '}
                {facilityDetails?.hospital_services?.find((service: string) =>
                  service.includes('NHIS Accepted'),
                )
                  ? 'Yes'
                  : 'No'}
              </Text>
              <View style={styles.addressContainer}>
                {/* <Icon
                  name="map-marker-alt"
                  size={15}
                  color={themeColors.primary}
                /> */}
                <Text style={styles.facilityAddress}>
                  <Text style={{fontFamily: fonts.OpenSansBold}}>Address:</Text>{' '}
                  {facilityDetails?.gps_address || facilityDetails?.location}
                </Text>
              </View>
              <View style={styles.containerDistance}>
                <View style={styles.infoRow}>
                  <View style={styles.infoItem}>
                    <Icon name="road" size={20} color={themeColors.primary} />
                    <Text style={styles.infoText}>
                      {distance || (
                        <ActivityIndicator size={'small'} color={'green'} />
                      )}
                    </Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Icon name="car" size={20} color={themeColors.primary} />
                    <Text style={styles.infoText}>
                      {duration || (
                        <ActivityIndicator size={'small'} color={'green'} />
                      )}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Services</Text>
              <Text style={styles.sectionContent}>
                {facilityDetails?.hospital_amenities?.length
                  ? facilityDetails?.hospital_amenities.join(', ')
                  : 'N/A'}
              </Text>
            </View>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Facilities</Text>
              <Text style={styles.sectionContent}>
                {facilityDetails?.hospital_amenities &&
                  facilityDetails?.hospital_amenities.join(', ')}
              </Text>
            </View>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Working Hours</Text>
              {Object?.entries(facilityDetails?.business_hours)?.length ? (
                Object?.entries(facilityDetails?.business_hours)?.map(
                  ([day, hours]: any) => (
                    <Text
                      key={day}
                      style={[
                        styles.sectionContent,
                        day === currentDay
                          ? {fontFamily: fonts.OpenSansBold}
                          : null,
                      ]}>
                      {day.charAt(0).toUpperCase() + day.slice(1)}:{' '}
                      {hours.opening} - {hours.closing}
                    </Text>
                  ),
                )
              ) : (
                <Text style={styles.sectionContent}>N/A</Text>
              )}
            </View>
            <View style={[styles.section, {paddingBottom: 0}]}>
              <Text style={styles.sectionTitle}>Reviews</Text>
              {/*{facilityData?.reviews?.length ? (
                  facilityData?.reviews?.map((review: any, index) => (
                    <View key={index} style={styles.reviewContainer}>
                      <View
                        style={{flexDirection: 'row', alignItems: 'center'}}>
                        <Image
                          source={{uri: review?.profilePhotoUrl}}
                          width={30}
                          height={30}
                          style={{marginRight: 5}}
                        />
                        <View style={{alignItems: 'flex-start'}}>
                          <Text style={styles.sectionContent}>
                            {review?.authorName}
                          </Text>
                          <AirbnbRating
                            isDisabled
                            count={5}
                            defaultRating={review?.rating || 0}
                            size={10}
                            showRating={false}
                          />
                        </View>
                      </View>
                      <Text
                        style={[styles.sectionContent, {marginVertical: 5}]}>
                        {review?.comment}
                      </Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.sectionContent}>N/A</Text>
                )} */}
              <ScrollView
                style={{flex: 1}}
                horizontal
                // pagingEnabled
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                  paddingHorizontal: moderateScale(10),
                  paddingBottom: moderateScale(10),
                  gap: 15,
                }}>
                {reviewData.length > 0 &&
                  reviewData.map((item, index) => (
                    <View
                      key={index}
                      style={{
                        width: Dimensions.get('window').width - 100,
                        borderRadius: moderateScale(10),
                        alignItems: 'center',
                        gap: 5,
                        justifyContent: 'flex-start',
                        // backgroundColor: 'red',
                      }}>
                      <View style={{flexDirection: 'row'}}>
                        {/* Avatar Image */}
                        <Image
                          source={{uri: item?.user_profiles?.avatar_url}}
                          style={{
                            height: verticalScale(50),
                            width: verticalScale(50),
                            borderRadius: moderateScale(25),
                            marginRight: moderateScale(10),
                          }}
                        />

                        {/* User Info */}
                        <View
                          style={{
                            flex: 1,
                            justifyContent: 'center',
                          }}>
                          <Text
                            style={{
                              fontSize: moderateScale(16),
                              fontWeight: 'bold',
                              color: '#333',
                            }}>
                            {item?.user_profiles?.first_name}{' '}
                            {item?.user_profiles?.last_name}
                          </Text>
                          <StarRating rating={item?.rating} />
                        </View>
                      </View>
                      <View
                        style={{
                          backgroundColor: themeColors.primary,
                          padding: 10,
                          borderRadius: 20,
                          borderTopLeftRadius: 0,
                          alignSelf: 'flex-start',
                          // maxWidth: '80%',
                          width: '100%',
                        }}>
                        <Text
                          style={{
                            fontSize: size.default,
                            color: themeColors.white,
                            textAlign: 'justify',
                            fontStyle: 'italic',
                          }}>
                          "
                          {item.comment ||
                            'No comment  No comment found No comment found No comment found No comment found '}
                          "
                        </Text>
                      </View>
                    </View>
                  ))}
              </ScrollView>
            </View>

            {/* <View style={styles.section}>
              <Text style={styles.sectionTitle}>Comments</Text>
              <Text style={styles.sectionContent}>
                {facilityDetails?.comments || 'N/A'}
              </Text>
            </View> */}
            <Modal
              transparent={true}
              visible={isModalVisible}
              animationType="slide"
              onRequestClose={() => setIsModalVisible(false)}>
              <View
                style={[styles.modalOverlay, {width: width, height: height}]}>
                <View style={styles.modalContainer}>
                  {!actionType ? (
                    <View style={{alignItems: 'center'}}>
                      {getCallNumbers().length > 0 && (
                        <TouchableOpacity
                          style={[styles.button, {marginVertical: 15}]}
                          onPress={() => handleActionPress('call')}>
                          <Icon
                            name="phone-alt"
                            size={20}
                            color={themeColors.primary}
                          />
                          <Text
                            style={[
                              styles.buttonText,
                              {color: themeColors.primary},
                            ]}
                            onPress={() => handleActionPress('call')}>
                            Call
                          </Text>
                        </TouchableOpacity>
                      )}
                      {hasWhatsapp && (
                        <TouchableOpacity
                          style={[styles.button, {marginVertical: 15}]}
                          onPress={() => handleActionPress('whatsapp')}>
                          <Icon
                            name="whatsapp"
                            size={20}
                            color={themeColors.primary}
                          />
                          <Text
                            style={[
                              styles.buttonText,
                              {color: themeColors.primary},
                            ]}
                            onPress={() => handleActionPress('whatsapp')}>
                            WhatsApp
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  ) : (
                    <>
                      <Text style={styles.modalTitle}>
                        {actionType === 'call'
                          ? 'Select a Number to Call'
                          : 'Select a Number for WhatsApp'}
                      </Text>
                      {(actionType === 'call'
                        ? getCallNumbers()
                        : getWhatsappNumbers()
                      ).map((number: string, index: number) => (
                        <View key={index} style={styles.modalItemContainer}>
                          <TouchableOpacity
                            style={styles.modalItem}
                            onPress={() => handleNumberSelect(number)}>
                            <Text
                              style={styles.modalItemText}
                              onPress={() => handleNumberSelect(number)}>
                              {number}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      ))}
                    </>
                  )}
                  <TouchableOpacity
                    style={styles.modalCancel}
                    onPress={() => {
                      setIsModalVisible(false);
                      if (hasWhatsapp) {
                        setActionType(null);
                      }
                    }}>
                    <Text
                      style={styles.modalCancelText}
                      onPress={() => {
                        setIsModalVisible(false);
                        if (hasWhatsapp) {
                          setActionType(null);
                        }
                      }}>
                      Cancel
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          </ScrollView>
          <View
            onLayout={e => {
              setBottomBarHeight(e.nativeEvent.layout.height);
            }}
            style={[styles.fixedButtonsContainer, {height: iheight}]}>
            <TouchableOpacity
              style={[styles.button, {marginBottom: imarginBottom}]}
              onPress={() => setIsModalVisible(true)}>
              <Icon name="phone-alt" size={20} color={themeColors.white} />
              <Text style={styles.buttonText}>Contact</Text>
            </TouchableOpacity>
            <View
              style={{
                backgroundColor: 'white',
                height: 40,
                width: 2,
              }}>
              <Text></Text>
            </View>
            <TouchableOpacity
              disabled={!distance}
              style={[styles.button, {marginBottom: imarginBottom}]}
              onPress={openInMaps}>
              <Icon name="map-marker-alt" size={20} color={themeColors.white} />
              <Text style={styles.buttonText}>
                Direction{' '}
                {distance || (
                  <ActivityIndicator size={'small'} color={'#fff'} />
                )}
              </Text>
            </TouchableOpacity>
            <View
              style={{
                backgroundColor: 'white',
                height: 40,
                width: 2,
              }}>
              <Text></Text>
            </View>
            <TouchableOpacity
              style={[styles.button, {marginBottom: imarginBottom}]}
              onPress={handleShare}>
              <Icon name="share-alt" size={20} color={themeColors.white} />
              <Text style={styles.buttonText}>Share</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

export default FacilityDetails;

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
  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  carouselContainer: {
    position: 'relative',
    // width,
    // height: width * 0.6,
  },
  image: {
    // width: 500,
    // height: 300 * 0.6,
    resizeMode: 'cover',
  },
  ratingIcon: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: themeColors.white,
    padding: 8,
    borderRadius: 20,
    elevation: 3,
  },
  favoritesIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: themeColors.white,
    padding: 8,
    borderRadius: 20,
    elevation: 3,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  facilityInfoContainer: {
    backgroundColor: themeColors.white,
    padding: 15,
    marginHorizontal: 15,
    marginTop: 15,
    borderRadius: 8,
    elevation: 3,
  },
  facilityName: {
    fontSize: size.md,
    fontFamily: fonts.OpenSansBold,
    color: themeColors.darkGray,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    // marginTop: 5,
  },
  facilityAddress: {
    fontSize: size.sl,
    fontFamily: fonts.OpenSansRegular,
    color: themeColors.darkGray,
    // marginLeft: 5,
  },
  nhisAccredited: {
    fontSize: size.sl,
    fontFamily: fonts.OpenSansRegular,
    color: themeColors.darkGray,
  },
  section: {
    margin: 15,
    borderBottomWidth: 1,
    borderBottomColor: themeColors.white,
    paddingBottom: 15,
  },
  sectionTitle: {
    // marginBottom: 5,
    fontSize: size.lg,
    color: themeColors.darkGray,
    fontFamily: fonts.OpenSansBold,
    textTransform: 'uppercase',
  },
  sectionContent: {
    fontFamily: fonts.OpenSansRegular,
    fontSize: size.sl,
    color: themeColors.darkGray,
  },
  reviewContainer: {
    paddingVertical: 15,
  },
  fixedButtonsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: themeColors.primary,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderTopWidth: 1,
    borderTopColor: themeColors.white,
    // height: 90,
    width: '100%',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    marginLeft: 5,
    color: themeColors.white,
    fontFamily: fonts.OpenSansMedium,
    fontSize: size.md,
  },
  modalOverlay: {
    // flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: themeColors.white,
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: size.lg,
    fontFamily: fonts.OpenSansBold,
    color: themeColors.primary,
    marginBottom: 15,
    textAlign: 'center',
  },
  modalItem: {
    paddingVertical: 10,
  },
  modalItemText: {
    fontSize: size.md,
    fontFamily: fonts.OpenSansRegular,
    color: themeColors.darkGray,
    textAlign: 'center',
  },
  modalCancel: {
    paddingVertical: 10,
    marginTop: 10,
  },
  modalCancelText: {
    fontSize: size.md,
    fontFamily: fonts.OpenSansBold,
    color: themeColors.white,
    textAlign: 'center',
    backgroundColor: themeColors.primary,
    padding: 5,
    borderRadius: 10,
  },
  modalItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: themeColors.lightGray,
    justifyContent: 'center',
  },
  copyButton: {
    marginLeft: 10,
    padding: 5,
    borderRadius: 5,
    // backgroundColor: themeColors.lightGray,
  },
  containerDistance: {
    marginTop: 10,
  },
  infoRow: {
    flexDirection: 'row',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  infoText: {
    marginLeft: 5,
    fontSize: size.sl,
    fontFamily: fonts.OpenSansRegular,
    color: themeColors.darkGray,
  },
});
