import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Image,
  Dimensions,
  TouchableOpacity,
  Modal,
  Linking,
  Share,
  Alert,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {themeColors} from '../../theme/colors';
import {supabase} from '../../utils/supabaseClient';
import {useSelector} from 'react-redux';
import {user} from '../../store/selectors';
import {fetchFavorites, toggleFacilityFavorite} from '../../services/profile';
import {size} from '../../theme/fontStyle';
import {fonts} from '../../theme/fonts';
import {AirbnbRating} from 'react-native-ratings';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon from 'react-native-vector-icons/FontAwesome5';
import {parsePhoneNumbers, truncateString} from '../../utils/helpers';
import {useNavigationState} from '@react-navigation/native';
import {useToast} from 'react-native-toast-notifications';
import {limit} from '../../../config/variables';
import {logActivity} from '../../services/activityLogsService';
import {
  deleteFavoriteFacility,
  getFacilityRating,
  getFavoriteFacilities,
} from '../../services/favoriteFacilites';
import FacilityRating from '../../components/FacilityRating';
import Geolocation from '@react-native-community/geolocation';

const {width} = Dimensions.get('window');

type SavedItemsScreenProps = {
  navigation: NativeStackNavigationProp<any>; // Replace `any` with your specific stack params type if available
};

const SavedItemsScreen: React.FC<SavedItemsScreenProps> = ({navigation}) => {
  const toast = useToast();
  const userData: any = useSelector(user);
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorities] = useState<any>([]);
  const currentTab = useNavigationState(
    state => state.routes[state.index].name,
  );
  const [refresh, setRefresh] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [actionType, setActionType] = useState<'call' | 'whatsapp' | null>(
    // null,
    'call',
  );
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [currentLocation, setCurrentLocation] = useState({
    latitude: null as any,
    longitude: null as any,
  });

  const handleActionPress = (type: 'call' | 'whatsapp') => {
    setActionType(type);
    // setIsModalVisible(true);
  };

  const handleNumberSelect = (number: string) => {
    // setSelectedNumber(number);
    setIsModalVisible(false);
    // setActionType(null);
    // setSelectedItem(null)

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

  const handleShare = async (item: any) => {
    try {
      const result = await Share.share({
        message: `Check out this facility: ${
          item?.facility?.facility_name
        }\n\nAddress: ${item?.facility?.area}, ${item?.facility?.district}, ${
          item?.facility?.region
        }, ${
          item?.facility?.gps_address || item?.facility?.gps_location
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

  const handleRemoveFacility = (id: string) => {
    Alert.alert(
      'Remove from favorites',
      'Are you sure you want to remove facility from your favorites list?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            await deleteFavoriteFacility(id);
            setFavorities(
              favorites.filter((fav: any) => fav.facility.id !== id),
            );
          },
        },
      ],
    );
  };

  const renderFooter = () => {
    return hasMore && loading ? (
      <ActivityIndicator size="small" color={themeColors.primary} />
    ) : null;
  };

  const getFavFacilities = async () => {
    const response = await getFavoriteFacilities(0).finally(() => {
      setRefresh(false);
      setLoading(false);
    });
    console.log('Response of Favorite ', JSON.stringify(response, null, 2));
    setFavorities(response);
  };

  // Get user's current location
  useEffect(() => {
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
        console.log('Location permission denied');
        return;
      }

      Geolocation.getCurrentPosition(
        position => {
          setCurrentLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        error => {
          console.log('Error getting location:', error.message);
        },
        {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
      );
    };

    getLocation();
  }, []);

  useEffect(() => {
    getFavFacilities();
  }, [refresh]);

  const getRating = async (facilityId: string) => {
    const rating = await getFacilityRating(facilityId);
    console.log('Rating of Facility ', rating);
    return rating;
  };

  return (
    <View style={styles.container}>
      {loading && page == 0 ? ( // Show loader on initial load only
        <View style={styles.loaderContainer}>
          <ActivityIndicator color={themeColors.primary} size={'large'} />
        </View>
      ) : favorites.length === 0 ? ( // Show no data message if there are no facilities
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>No record found</Text>
        </View>
      ) : (
        <FlatList
          refreshing={refresh}
          onRefresh={() => setRefresh(!refresh)}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          data={favorites}
          keyExtractor={item => item?.id}
          numColumns={1} // Show 5 letters per row
          renderItem={({item}) => {
            const rating = getRating(item.facility.id);
            return (
              <TouchableOpacity
                key={item?.id?.toString()}
                style={styles.itemContainer}
                onPress={() => {
                  navigation.navigate('FacilityDetails', {
                    id: item?.facility.id,
                    setFavorites: setFavorities, // Pass setFavorites function
                    favorites: favorites,
                  });
                }}>
                <View style={styles.imageContainer}>
                  <Image
                    source={{uri: item.facility?.mediaUrls[0]}}
                    style={styles.image}
                  />
                  <FacilityRating facilityId={item.facility.id} />

                  <TouchableOpacity
                    style={styles.favoritesIcon}
                    onPress={() => {
                      handleRemoveFacility(item.facility.id);
                    }}>
                    <MaterialIcon
                      name={'heart'}
                      size={20}
                      color={themeColors.primary}
                    />
                  </TouchableOpacity>
                </View>
                <View style={styles.infoContainer}>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}>
                    <Text style={styles.facilityName}>
                      {item?.facility?.facility_name}
                    </Text>
                    {/* <View style={{flexDirection: 'row', alignItems: 'center'}}>
                      <Icon name="car" size={15} color={themeColors.primary} />
                      <Text style={styles.infoText}>{'N/A'}</Text>
                    </View> */}
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      marginVertical: 5,
                    }}>
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                      <Icon
                        name="map-marker-alt"
                        size={12}
                        color={themeColors.primary}
                        style={{marginRight: 5}}
                      />
                      <Text style={styles.facilityAddress}>
                        {item?.facility?.gps_address}
                      </Text>
                    </View>
                    {/* <View style={{flexDirection: 'row', alignItems: 'center'}}>
                      <Icon name="road" size={15} color={themeColors.primary} />
                      <Text style={styles.infoText}>{'N/A'}</Text>
                    </View> */}
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    navigation.navigate('FacilityDetails', {
                      id: item?.facility.id,
                      setFavorites: setFavorities, // Pass setFavorites function
                      favorites: favorites,
                    });
                  }}
                  style={{paddingRight: 15, marginBottom: 5}}>
                  <Text
                    style={{
                      color: themeColors.darkGray,
                      borderBottomColor: themeColors.darkGray,
                      borderBottomWidth: 1,
                      alignSelf: 'flex-end',
                    }}>
                    See more details
                  </Text>
                </TouchableOpacity>
                <View style={styles.fixedButtonsContainer}>
                  <TouchableOpacity
                    style={styles.button}
                    onPress={() => {
                      setSelectedItem(item);
                      setIsModalVisible(true);
                    }}>
                    <Icon
                      name="phone-alt"
                      size={15}
                      color={themeColors.white}
                    />
                    <Text style={styles.buttonText}>Contact</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    disabled={
                      !currentLocation?.latitude ||
                      !item?.facility?.latitude ||
                      !item?.facility?.longitude
                    }
                    style={[
                      styles.button,
                      (!currentLocation?.latitude ||
                        !item?.facility?.latitude ||
                        !item?.facility?.longitude) && {opacity: 0.5},
                    ]}
                    onPress={() => {
                      navigation?.navigate('DIRECTION', {
                        destination: {
                          latitude: item?.facility?.latitude || 0,
                          longitude: item?.facility?.longitude || 0,
                        },
                      });
                    }}>
                    <Icon
                      name="map-marker-alt"
                      size={15}
                      color={themeColors.white}
                    />
                    <Text style={styles.buttonText}>
                      Direction{' '}
                      {!currentLocation?.latitude ||
                      !item?.facility?.latitude ||
                      !item?.facility?.longitude
                        ? '(N/A)'
                        : ''}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.button}
                    onPress={() => handleShare(item)}>
                    <Icon
                      name="share-alt"
                      size={15}
                      color={themeColors.white}
                    />
                    <Text style={styles.buttonText}>Share</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          }}
          ListFooterComponent={renderFooter}
          //onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
        />
      )}
      <Modal
        transparent={true}
        visible={isModalVisible}
        animationType="slide"
        onRequestClose={() => {
          setIsModalVisible(false);
          // setActionType(null);
          // setSelectedItem(false);
        }}>
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
                    style={[styles.buttonText, {color: themeColors.primary}]}>
                    Call
                  </Text>
                </TouchableOpacity>
                {
                  // hasWhatsapp
                  selectedItem?.facilities?.hasWhatsapp && (
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
                  )
                }
              </View>
            ) : (
              <>
                <Text style={styles.modalTitle}>
                  {actionType === 'call'
                    ? 'Select a Number to Call'
                    : 'Select a Number for WhatsApp'}
                </Text>
                {selectedItem?.facility?.contact_num && (
                  <View style={styles.modalItemContainer}>
                    <TouchableOpacity
                      style={styles.modalItem}
                      onPress={() =>
                        handleNumberSelect(selectedItem?.facility?.contact_num)
                      }>
                      <Text style={styles.modalItemText}>
                        {selectedItem?.facility?.contact_num}
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
                )}
              </>
            )}
            <TouchableOpacity
              style={styles.modalCancel}
              onPress={() => {
                setIsModalVisible(false);
                // setSelectedItem(null);
                // hasWhatsapp;
                // if (selectedItem?.facilities?.hasWhatsapp) {
                // setActionType(null);
                // }
              }}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: themeColors.lightGray,
    // justifyContent: 'center',
    // alignItems: 'center',
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
  itemContainer: {
    backgroundColor: themeColors.white,
    marginVertical: 10,
    // padding: 10,
  },
  imageContainer: {
    marginBottom: 10,
    borderRadius: 20,
  },
  image: {
    position: 'relative',
    width: '100%',
    height: width * 0.4,
    resizeMode: 'cover',
    // borderRadius: 20,
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
  infoContainer: {
    marginVertical: 5,
    paddingHorizontal: 15,
  },
  facilityName: {
    fontSize: size.md,
    fontFamily: fonts.OpenSansBold,
    color: themeColors.darkGray,
  },
  facilityAddress: {
    fontSize: size.sl,
    fontFamily: fonts.OpenSansRegular,
    color: themeColors.darkGray,
    // marginLeft: 5,
  },
  infoText: {
    marginLeft: 5,
    fontSize: size.sl,
    fontFamily: fonts.OpenSansRegular,
    color: themeColors.darkGray,
  },
  fixedButtonsContainer: {
    marginTop: 5,
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
});

export default SavedItemsScreen;
