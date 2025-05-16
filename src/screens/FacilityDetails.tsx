import React, {useEffect, useState} from 'react';
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
import {API_KEY} from '../../config/variables';
import LocationLayout from '../components/common/LocationLayout';
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

const {width} = Dimensions.get('window');

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
  const {id, setFavorites, favorites} = route?.params || {};
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [facilityDetails, setFacilityDetails] = useState<any>();
  const [isModalVisible, setIsModalVisible] = useState(false);
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
    latitude: null,
    longitude: null,
  });

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

  const handleActionPress = (type: 'call' | 'whatsapp') => {
    setActionType(type);
    // setIsModalVisible(true);
  };

  const handleNumberSelect = (number: string) => {
    setSelectedNumber(number);
    setIsModalVisible(false);

    if (actionType === 'call') {
      const phoneNumber = `tel:${number}`;
      Linking.canOpenURL(phoneNumber)
        .then(supported => {
          if (!supported) {
            console.log('Phone call not supported on this device');
          } else {
            return Linking.openURL(phoneNumber);
          }
        })
        .catch(err =>
          console.log('An error occurred while trying to make a call:', err),
        );
    } else if (actionType === 'whatsapp') {
      let formattedNumber = number.replace(/[-\s]/g, ''); // Remove any dashes or spaces
      // if (!formattedNumber.startsWith('+')) {
      //   formattedNumber = `+233${formattedNumber.slice(-9)}`; // Assuming Ghana country code, adjust as necessary
      // }
      const url = `whatsapp://send?phone=${formattedNumber}`;
      Linking.canOpenURL(url)
        .then(supported => {
          if (!supported) {
            console.log("WhatsApp is not installed or can't open URL");
          } else {
            return Linking.openURL(url);
          }
        })
        .catch(err =>
          console.log('An error occurred while trying to open WhatsApp:', err),
        );
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
          setHasWhatsapp(!!successData.whatsapp);
          if (!successData.whatsapp) {
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
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        console.log('Permission denied');
        setLoading(false);
        return;
      }

      Geolocation.getCurrentPosition(
        position => {
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
      if (currentLocation && destination) {
        const origin = `${currentLocation.latitude},${currentLocation.longitude}`;
        const destinations = `${destination.latitude},${destination.longitude}`;

        try {
          const {distance, duration} = await fetchDistanceAndDuration(
            origin,
            destinations,
          );
          setDistance(distance);
          setDuration(duration);
        } catch (error) {
          console.error(error);
        }
      }
    };

    getDistanceDuration();
  }, [currentLocation, destination]); // ✅ Depend on both

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
    // toggleFacilityFavorite(
    //   userData?.id,
    //   id as string,
    //   () => {},
    //   (successData: any) => {
    //     console.log('response', successData);
    //   },
    //   (error: any) => {
    //     console.log('Error', error);
    //   },
    // );
  };

  useEffect(() => {
    const fetchReviewData = async () => {
      try {
        setLoading(true);
        const data = await getFacilityRatingReview(facilityDetails?.id);
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
    <LocationLayout>
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
              <View style={styles.carouselContainer}>
                <Carousel
                  loop
                  autoPlay={!(facilityDetails.mediaUrls.length > 0)}
                  width={width}
                  height={width * 0.6}
                  data={
                    facilityDetails.mediaUrls.length > 0
                      ? facilityDetails?.mediaUrls
                      : images
                  }
                  scrollAnimationDuration={1000}
                  enabled={
                    (facilityDetails.mediaUrls.length > 0
                      ? facilityDetails?.mediaUrls.length
                      : images.length) > 1
                  } // 👈 This disables scroll when only one item
                  renderItem={({item}) => (
                    <Image
                      source={
                        //@ts-ignore
                        facilityDetails.mediaUrls.length > 0
                          ? {uri: item}
                          : item // item can be a local require()
                      }
                      style={styles.image}
                    />
                  )}
                  onSnapToItem={handleSnap}
                />
                {userReview && (
                  <FacilityRating
                    userReview={userReview ? userReview : null}
                    facilityId={facilityDetails.id}
                  />
                )}

                <TouchableOpacity
                  style={styles.favoritesIcon}
                  onPress={async () =>
                    await handleToggleFacilityFavorite(facilityDetails?.id)
                  }>
                  <MaterialIcon
                    name={isFavorited ? 'heart' : 'heart-outline'}
                    size={20}
                    color={themeColors.primary}
                  />
                </TouchableOpacity>
              </View>
              <View style={styles.paginationContainer}>
                {facilityDetails.mediaUrls.length
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
                    <Text style={{fontFamily: fonts.OpenSansBold}}>
                      Address:
                    </Text>{' '}
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
                <View style={styles.modalOverlay}>
                  <View style={styles.modalContainer}>
                    {!actionType ? (
                      <View style={{alignItems: 'center'}}>
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
                            ]}>
                            Call
                          </Text>
                        </TouchableOpacity>
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
                              ]}>
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
                        {parsePhoneNumbers(facilityDetails?.tel || '')?.map(
                          (number: string, index: number) => (
                            <View key={index} style={styles.modalItemContainer}>
                              <TouchableOpacity
                                style={styles.modalItem}
                                onPress={() => handleNumberSelect(number)}>
                                <Text style={styles.modalItemText}>
                                  {number}
                                </Text>
                              </TouchableOpacity>
                              {/* <TouchableOpacity
                              style={styles.copyButton}
                              onPress={() => handleCopyNumber(number)}>
                              <Icon
                                name="copy"
                                size={20}
                                color={themeColors.primary}
                              />
                            </TouchableOpacity> */}
                            </View>
                          ),
                        )}
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
                      <Text style={styles.modalCancelText}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>
            </ScrollView>
            <View
              onLayout={e => {
                setBottomBarHeight(e.nativeEvent.layout.height);
              }}
              style={styles.fixedButtonsContainer}>
              <TouchableOpacity
                style={styles.button}
                onPress={() => setIsModalVisible(true)}>
                <Icon name="phone-alt" size={20} color={themeColors.white} />
                <Text style={styles.buttonText}>Contact</Text>
              </TouchableOpacity>
              <TouchableOpacity
                disabled={!distance}
                style={styles.button}
                onPress={() => {
                  navigation?.navigate(SCREENS.DIRECTION, {
                    destination: {
                      latitude: facilityData?.location?.lat,
                      longitude: facilityData?.location?.lng,
                    },
                  });
                }}>
                <Icon
                  name="map-marker-alt"
                  size={20}
                  color={themeColors.white}
                />
                <Text style={styles.buttonText}>
                  Direction{' '}
                  {distance || (
                    <ActivityIndicator size={'small'} color={'#fff'} />
                  )}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={handleShare}>
                <Icon name="share-alt" size={20} color={themeColors.white} />
                <Text style={styles.buttonText}>Share</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </LocationLayout>
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
    width,
    height: width * 0.6,
  },
  image: {
    width,
    height: width * 0.6,
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
    marginBottom: 10,
    fontSize: size.md,
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
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: themeColors.white,
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
    flex: 1,
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
