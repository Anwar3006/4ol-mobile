// import {
//   FlatList,
//   Image,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
//   ActivityIndicator,
//   TextInput,
//   Modal,
//   Switch,
//   ScrollView,
// } from 'react-native';
// import React, {useCallback, useEffect, useRef, useState} from 'react';
// import EntypoIcon from 'react-native-vector-icons/Entypo';
// import Fontisto from 'react-native-vector-icons/Fontisto';
// import {themeColors} from '../../theme/colors';
// import {size} from '../../theme/fontStyle';
// import {fonts} from '../../theme/fonts';
// import {NativeStackNavigationProp} from '@react-navigation/native-stack';
// import {THIS_IS_MAP_KEY} from '../../../config/variables';
// import useLocation from '../../hooks/useLocation';
// import LocationLayout from '../../components/common/LocationLayout';
// import MapView, {Marker} from 'react-native-maps';
// import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
// import {Picker} from '@react-native-picker/picker';
// import Icon from 'react-native-vector-icons/FontAwesome5';
// import {useDispatch, useSelector} from 'react-redux';
// import {RootState} from '../../store';
// import {
//   fetchNearbyPlaces,
//   filterMarkers,
//   setSelectedDistance,
//   setSelectedFilter,
// } from '../../store/slices/MarkersSlice';
// import {logActivity} from '../../services/activityLogsService';
// import {user} from '../../store/selectors';
// import type {AppDispatch} from '../../store/index'; // Adjust path as needed
// import {horizontalScale, verticalScale} from '../../utils/metrics';
// import MarkModal from './MarkerModal';
// export const useAppDispatch: () => AppDispatch = useDispatch;

// type TopRatedProps = {
//   navigation?: NativeStackNavigationProp<any>;
// };
// const categories = [
//   {category: 'Display All'},
//   {category: 'Hospital', icon: 'local-hospital', library: MaterialIcons},
//   {category: 'Pharmacy', icon: 'local-pharmacy', library: MaterialIcons},
//   {category: 'Laboratory', icon: 'laboratory', library: Fontisto},
//   {category: 'Herbal', icon: 'feather', library: EntypoIcon},
//   {category: 'Ambulance', icon: 'ambulance', library: Icon},
//   {category: 'Wholesale', icon: 'store', library: MaterialIcons},
// ];

// const TopRated: React.FC<TopRatedProps> = ({navigation}) => {
//   const userData = useSelector(user);
//   const {location} = useLocation();
//   const [searchText, setSearchText] = useState('');
//   const [currentLocation, setCurrentLocation] = useState('');
//   const [suggestions, setSuggestions] = useState([]);
//   const [selectedLocation, setSelectedLocation] = useState<any>(null);
//   const [modalVisible, setModalVisible] = useState(false);
//   const dispatch = useAppDispatch();
//   const {markers, loading, selectedDistance, selectedFilter} = useSelector(
//     (state: RootState) => state.markers,
//   );
//   const [isEnabled, setIsEnabled] = useState(false);
//   const [markModal, setMarkModal] = useState(false);
//   const [image, setImage] = useState<string | null>(null);
//   const [markerInfo, setMarkerInfo] = useState<{
//     name: string;
//     vicinity: string;
//     distance: any;
//     travelTime: any;
//   } | null>(null);

//   const filters: any = {
//     Hospital: {type: 'hospital', keyword: ''},
//     Herbal: {type: 'hospital', keyword: 'herbal'},
//     Laboratory: {type: 'health', keyword: 'diagnostic, laboratory'},
//     Ambulance: {type: 'hospital', keyword: 'ambulance'},
//     Pharmacy: {type: 'pharmacy', keyword: ''},
//     Wholesale: {type: 'pharmacy', keyword: 'wholesale'},
//     'Display All': {
//       keyword:
//         'hospital, pharmacy, herbal, diagnostic, laboratory, ambulance, wholesale, health center, clinic, urgent care, medical center, healthcare, veterinary, dental, physical therapy, wellness, nutrition, rehabilitation',
//     },
//   };

//   const toggleSwitch = () => setIsEnabled(previousState => !previousState);

//   const fetchAutocompleteSuggestions = async (query: any) => {
//     if (query.length === 0) {
//       setSuggestions([]);
//       return;
//     }
//     try {
//       const response = await fetch(
//         `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${query}&key=${THIS_IS_MAP_KEY}`,
//       );
//       const data = await response.json();
//       if (response.ok) {
//         setSuggestions(data.predictions);
//       } else {
//         console.error('Error fetching autocomplete suggestions:', data.status);
//       }
//     } catch (error) {
//       console.error('Error:', error);
//     }
//   };

//   const fetchLocationName = async (latitude: any, longitude: any) => {
//     try {
//       const response = await fetch(
//         `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${THIS_IS_MAP_KEY}`,
//       );
//       const data = await response.json();

//       if (response.ok) {
//         const locationName =
//           data?.plus_code?.compound_code || 'Unknown Location';
//         setCurrentLocation(locationName);
//         setSearchText(locationName);
//       } else {
//         console.error('Error fetching location:', data.status);
//       }
//     } catch (error) {
//       console.error('Error:', error);
//     }
//   };

//   const onFilterPress = (filter: any) => {
//     dispatch(setSelectedFilter(filter));
//   };

//   useEffect(() => {
//     if (location && !loading && markers?.length == 0) {
//       dispatch(
//         //@ts-ignore
//         fetchNearbyPlaces({
//           latitude: location.latitude,
//           longitude: location.longitude,
//           selectedDistance,
//           API_KEY: THIS_IS_MAP_KEY,
//           filters,
//         }),
//       );
//     }
//   }, [location]);

//   useEffect(() => {
//     if (location && !loading) {
//       //@ts-ignore
//       dispatch(
//         //@ts-ignore
//         fetchNearbyPlaces({
//           latitude: location.latitude,
//           longitude: location.longitude,
//           selectedDistance,
//           API_KEY: THIS_IS_MAP_KEY,
//           filters,
//         }),
//       ).then(() => {
//         dispatch(filterMarkers(selectedFilter)); // Apply the filter after fetching places
//         logActivity(
//           {
//             user_id: userData?.id || '',
//             user_name: `${userData?.first_name || ''} ${
//               userData?.last_name || ''
//             }`,
//             type: 'facility',
//             description: `User has used the location indicator and filtered facilities by distance (${
//               selectedDistance == 10000
//                 ? '10 kms'
//                 : selectedDistance == 8000
//                 ? '8 kms'
//                 : selectedDistance == 6000
//                 ? '6 kms'
//                 : selectedDistance == 4000
//                 ? '4 kms'
//                 : '2 kms'
//             })`,
//             reference: '',
//             reference_id: '',
//           },
//           () => {
//             console.log('Logging Location Indicator Filter activity...');
//           },
//           data => {
//             console.log(
//               'Location Indicator Filter activity logged successfully:',
//               data,
//             );
//           },
//           error => {
//             console.error(
//               'Error logging Location Indicator Filter activity:',
//               error,
//             );
//           },
//         );
//       });
//     }
//   }, [selectedDistance]);

//   useEffect(() => {
//     if (location && !loading) {
//       dispatch(filterMarkers(selectedFilter));
//       logActivity(
//         {
//           user_id: userData?.id || '',
//           user_name: `${userData?.first_name || ''} ${
//             userData?.last_name || ''
//           }`,
//           type: 'facility',
//           description: `User has used the location indicator and filtered facilities by type (${selectedFilter})`,
//           reference: '',
//           reference_id: '',
//         },
//         () => {
//           console.log('Logging Location Indicator Filter activity...');
//         },
//         data => {
//           console.log(
//             'Location Indicator Filter activity logged successfully:',
//             data,
//           );
//         },
//         error => {
//           console.error(
//             'Error logging Location Indicator Filter activity:',
//             error,
//           );
//         },
//       );
//     }
//   }, [selectedFilter]);

//   useEffect(() => {
//     if (location) {
//       fetchLocationName(location?.latitude, location?.longitude);
//     }
//   }, [location]);

//   const fetchPlaceDetails = async (placeId: any) => {
//     try {
//       const response = await fetch(
//         `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${THIS_IS_MAP_KEY}`,
//       );
//       const data = await response.json();
//       if (response.ok) {
//         const {lat, lng} = data.result.geometry.location;
//         setSelectedLocation({latitude: lat, longitude: lng});
//       } else {
//         console.error('Error fetching place details:', data.status);
//       }
//     } catch (error) {
//       console.error('Error:', error);
//     }
//   };

//   const mapRef = useRef<any>(null);
//   const handleCurrentLocationPress = () => {
//     if (location) {
//       mapRef.current.animateToRegion({
//         latitude: location.latitude,
//         longitude: location.longitude,
//         latitudeDelta: 0.0922,
//         longitudeDelta: 0.0421,
//       });
//     }
//   };

//   const handleSelectSuggestion = (placeId: any, description: any) => {
//     setSearchText(description);
//     fetchPlaceDetails(placeId);
//     setSuggestions([]);
//   };

//   const handleSearch = () => {
//     setSuggestions([]);
//   };

//   const CustomMarker = useCallback(
//     ({markerType}) => {
//       return (
//         <View style={{alignItems: 'center'}}>
//           <Image
//             source={
//               markerType?.opening_hours?.open_now
//                 ? require('../../../assets/images/location2.png')
//                 : require('../../../assets/images/location.png')
//             }
//             style={{width: horizontalScale(30), height: verticalScale(40)}}
//             resizeMode="center"
//           />
//           <Text
//             style={{
//               position: 'absolute', // Overlay the text
//               color: themeColors.marker,
//               fontWeight: 'bold',
//               fontSize: size.default,
//             }}>
//             {markerType.category && markerType.category === 'Herbal'
//               ? 'T'
//               : markerType.category?.[0] || '?'}
//           </Text>
//         </View>
//       );
//     },
//     [selectedFilter],
//   );

//   const fetchImage = async (placeId: string) => {
//     try {
//       const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${THIS_IS_MAP_KEY}`;
//       const response = await fetch(url);
//       const data = await response.json();
//       if (data?.result?.photos && data?.result?.photos?.length > 0) {
//         const reference = data?.result?.photos[0]?.photo_reference;
//         return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${reference}&key=${THIS_IS_MAP_KEY}`;
//       } else {
//         console.log('error fetching image');
//         return null;
//       }
//     } catch (error) {
//       console.error('Error fetching image:', error);
//       return null;
//     }
//   };

//   const openMarkModal = async (marker: any) => {
//     const imageUrl = await fetchImage(marker.place_id);
//     setImage(imageUrl ?? null);

//     if (!location) {
//       console.error('User location not available');
//       return;
//     }
//     const origin = `${location?.latitude},${location?.longitude}`;
//     const destination = `${marker?.geometry?.location?.lat},${marker?.geometry?.location?.lng}`;

//     const distanceAndDuration = await fetchDistanceAndDuration(
//       origin,
//       destination,
//     );

//     setMarkerInfo({
//       name: marker?.name || 'unknown',
//       vicinity: marker?.vicinity || 'unknown place',
//       distance: distanceAndDuration?.distance,
//       travelTime: distanceAndDuration?.duration,
//     });
//     setMarkModal(true);
//   };

//   const fetchDistanceAndDuration = async (
//     origin: string,
//     destination: string,
//   ) => {
//     try {
//       let distance = '';
//       let duration = '';
//       const distanceMatrixUrl = `https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=${origin}&destinations=${destination}&key=${THIS_IS_MAP_KEY}`;
//       const response = await fetch(distanceMatrixUrl);
//       const data = await response.json();

//       if (data?.status === 'OK') {
//         const element = data?.rows[0]?.elements[0];
//         if (element?.status === 'OK') {
//           // setDistance(element.distance.textelement.distance.text);
//           // setDuration(element.duration.text);
//           distance = element?.distance?.text;
//           duration = element?.duration?.text;
//         } else {
//           console.log('Distance Matrix API response status: 1', element.status);
//         }
//       } else {
//         console.log('Distance Matrix API response status: 2', data.status);
//       }
//       return {
//         distance,
//         duration,
//       };
//     } catch (error) {
//       console.log('Error fetching distance and duration:', error);
//     }
//   };

//   return (
//     <LocationLayout>
//       <Modal visible={loading} transparent={true} animationType="fade">
//         <View style={styles.loadingOverlay}>
//           <ActivityIndicator size="large" color={themeColors.primary} />
//           <Text style={styles.loadingText}>Fetching Nearby Places...</Text>
//         </View>
//       </Modal>
//       <View style={styles.mapContainer}>
//         {location && (
//           <MapView
//             customMapStyle={[
//               {
//                 featureType: 'poi',
//                 stylers: [{visibility: 'off'}], // Always hide POIs
//               },
//               {
//                 featureType: 'poi.business',
//                 stylers: [{visibility: 'off'}], // Explicitly hide business POIs
//               },
//             ]}
//             ref={mapRef}
//             style={styles.map}
//             initialRegion={{
//               latitude:
//                 selectedLocation?.latitude || location?.latitude || 37.78825,
//               longitude:
//                 selectedLocation?.longitude || location?.longitude || -122.4324,
//               latitudeDelta: 0.0922,
//               longitudeDelta: 0.0421,
//             }}
//             zoomEnabled={true}
//             scrollEnabled={true}
//             showsUserLocation={true}
//             zoomControlEnabled={true}
//             showsCompass={false}>
//             {/* <Marker coordinate={location} title={'Your Location'} /> */}
//             {selectedLocation && (
//               <Marker
//                 coordinate={selectedLocation}
//                 title="Searched Location"
//                 pinColor={themeColors.primary}
//               />
//             )}
//             {currentLocation && (
//               <Marker
//                 coordinate={location}
//                 title="Current Location"
//                 pinColor={'#5990FA'}
//               />
//             )}
//             {markers?.map((marker: any, index: number) => (
//               <Marker
//                 key={index}
//                 coordinate={{
//                   latitude: marker?.geometry?.location?.lat,
//                   longitude: marker?.geometry?.location?.lng,
//                 }}
//                 title={marker?.name}
//                 onPress={() => openMarkModal(marker)}
//                 pinColor={
//                   marker?.opening_hours?.open_now
//                     ? themeColors.primaryLight
//                     : themeColors.red
//                 }>
//                 {/* <CustomMarker markerType={marker} /> */}
//               </Marker>
//             ))}
//           </MapView>
//         )}
//         <View style={styles.mapFilterContainer}>
//           <View style={{}}>
//             <View style={{flex: 1}}>
//               <TextInput
//                 style={styles.searchBox}
//                 placeholder="Search Location..."
//                 value={searchText}
//                 onChangeText={text => {
//                   if (!text) {
//                     setSelectedLocation(null);
//                   }
//                   setSearchText(text);
//                   fetchAutocompleteSuggestions(text);
//                 }}
//                 onSubmitEditing={handleSearch}
//               />
//               {searchText && (
//                 <EntypoIcon
//                   name={'cross'}
//                   size={20}
//                   color={themeColors.primary}
//                   style={{position: 'absolute', right: 15, top: 8}}
//                   onPress={() => {
//                     setSearchText('');
//                     setSelectedLocation(null);
//                   }}
//                 />
//               )}
//               {suggestions.length > 0 && (
//                 <FlatList
//                   data={suggestions}
//                   keyExtractor={(item: any) => item.place_id}
//                   renderItem={({item}) => (
//                     <TouchableOpacity
//                       onPress={() =>
//                         handleSelectSuggestion(item.place_id, item.description)
//                       }>
//                       <Text style={styles.suggestionText}>
//                         {item.description}
//                       </Text>
//                     </TouchableOpacity>
//                   )}
//                   style={styles.suggestionList}
//                 />
//               )}
//             </View>
//             <ScrollView horizontal showsHorizontalScrollIndicator={false}>
//               <View style={styles.categoryContainer}>
//                 {categories.map((filter, index) => {
//                   const IconComp = filter.library;
//                   return (
//                     <TouchableOpacity
//                       key={index}
//                       style={[
//                         styles.categoryButton,
//                         {
//                           backgroundColor:
//                             selectedFilter !== filter.category
//                               ? 'rgba(246, 127, 48, 0.7)'
//                               : 'rgba(71, 190, 125, 0.6)',
//                           marginTop: index === 0 ? 0 : 4,
//                         },
//                       ]}
//                       onPress={() => onFilterPress(filter.category)}>
//                       {IconComp ? (
//                         <IconComp
//                           name={filter.icon}
//                           size={20}
//                           color={themeColors.white}
//                         />
//                       ) : null}
//                       <Text
//                         style={{
//                           fontFamily: fonts.OpenSansBold,
//                           color: themeColors.white,
//                           fontSize: size.s,
//                           marginLeft: 5,
//                         }}>
//                         {filter.category}
//                       </Text>
//                     </TouchableOpacity>
//                   );
//                 })}
//               </View>
//             </ScrollView>
//             <View style={{width: 100, alignSelf: 'flex-end'}}>
//               <TouchableOpacity
//                 style={styles.filterContainer}
//                 onPress={() => {
//                   setModalVisible(true);
//                 }}>
//                 <Icon
//                   name={'filter'}
//                   size={12}
//                   color={themeColors.darkPink}
//                   style={styles.icon}
//                 />
//                 <Text style={styles.filter}>Filter</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>

//         <TouchableOpacity
//           style={styles.compassButton}
//           onPress={handleCurrentLocationPress}>
//           <MaterialIcons
//             name="my-location"
//             size={22}
//             color={themeColors.black}
//           />
//         </TouchableOpacity>
//         <View style={[styles.switchContainer]}>
//           <Switch
//             trackColor={{
//               false: themeColors.darkGray,
//               true: themeColors.primary,
//             }} // Red background
//             thumbColor={isEnabled ? '#FFFFFF' : '#FFFFFF'} // White color for the switch thumb
//             ios_backgroundColor="#FF6347"
//             onValueChange={toggleSwitch}
//             value={isEnabled}
//           />
//           <Text
//             style={{
//               color: themeColors.black,
//               fontFamily: fonts.OpenSansRegular,
//             }}>
//             Business Pins
//           </Text>
//         </View>
//         <Modal
//           visible={modalVisible}
//           transparent
//           animationType="none"
//           onRequestClose={() => setModalVisible(false)}>
//           <View style={styles.modalContainer}>
//             <View style={[styles.modalContent, {width: '80%'}]}>
//               <Text style={styles.modalHeading}>Sort By</Text>
//               <Text style={styles.subHeading}>Distance (kms):</Text>
//               <View style={styles.pickerContainer}>
//                 <Picker
//                   selectedValue={selectedDistance}
//                   style={styles.picker}
//                   onValueChange={itemValue => {
//                     dispatch(setSelectedDistance(itemValue));
//                     setModalVisible(false);
//                   }}>
//                   <Picker.Item label="2 kms" value={2000} />
//                   <Picker.Item label="4 kms" value={4000} />
//                   <Picker.Item label="6 kms" value={6000} />
//                   <Picker.Item label="8 kms" value={8000} />
//                   <Picker.Item label="10 kms" value={10000} />
//                 </Picker>
//               </View>

//               <TouchableOpacity
//                 style={[styles.closeButton]}
//                 onPress={() => setModalVisible(false)}>
//                 <Text style={[styles.closeButtonText]}>Cancel</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </Modal>
//         {markModal && (
//           <MarkModal
//             visible={markModal}
//             hideModal={() => setMarkModal(false)}
//             image={image}
//             name={markerInfo?.name ?? 'unknown'}
//             vicinity={markerInfo?.vicinity ?? 'unknown location'}
//             distance={markerInfo?.distance || 'unknown'}
//             duration={markerInfo?.travelTime || 'unknown'}
//           />
//         )}
//       </View>
//     </LocationLayout>
//   );
// };

// export default TopRated;

// const styles = StyleSheet.create({
//   loadingOverlay: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'rgba(0, 0, 0, 0.7)', // Semi-transparent background
//   },
//   loadingText: {
//     marginTop: 10,
//     fontSize: 16,
//     color: themeColors.primary,
//     fontFamily: fonts.OpenSansBold,
//   },
//   mapContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   map: {
//     width: '100%',
//     height: '100%',
//   },
//   mapFilterContainer: {
//     position: 'absolute',
//     top: 10,
//     width: '100%',
//     paddingHorizontal: 15,
//     // flexDirection: 'row',
//     // justifyContent: 'space-between',
//     // alignItems: 'center',
//   },
//   filterContainer: {
//     // position: 'absolute',
//     // right: 15,
//     backgroundColor: 'rgba(155, 216, 235, 0.8)',
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     height: 35,
//     width: 70,
//     borderRadius: 10,
//     marginVertical: 4,
//     alignSelf: 'flex-end',
//   },
//   icon: {
//     marginRight: 5,
//   },
//   filter: {
//     fontFamily: fonts.OpenSansBold,
//     fontSize: size.sl,
//     color: themeColors.darkPink,
//   },
//   searchBox: {
//     // width:"50%",
//     backgroundColor: 'white',
//     // flex: 0.5,
//     padding: 4,
//     paddingRight: 25,
//     borderRadius: 8,
//     textAlign: 'center',
//     position: 'relative',
//     marginRight: 10,
//     fontSize: size.sl,
//     color: themeColors.darkGray,
//   },
//   filterButton: {
//     backgroundColor: '#ccc',
//     padding: 10,
//     borderRadius: 8,
//   },
//   categoryContainer: {
//     // position: 'absolute',
//     // top: 65,
//     // right: 15,
//     flexDirection: 'row',
//     alignItems: 'flex-end',
//     gap: 10,
//   },
//   categoryButton: {
//     // backgroundColor: 'rgba(0, 0, 0, 0.5)', // Light black with 10% opacity
//     padding: 7,
//     borderRadius: 25,
//     marginVertical: 4,
//     minWidth: 60,
//     height: 35,
//     alignItems: 'center',
//     justifyContent: 'center',
//     flexDirection: 'row',
//   },
//   suggestionList: {
//     marginTop: 10,
//     backgroundColor: themeColors.white,
//     zIndex: 1000,
//     marginRight: 10,
//   },
//   suggestionText: {
//     padding: 10,
//     borderBottomColor: 'gray',
//     borderBottomWidth: 1,
//   },
//   errorText: {
//     color: 'red',
//     fontSize: size.md,
//     textAlign: 'center',
//     padding: 15,
//   },
//   compassButton: {
//     position: 'absolute',
//     bottom: 20,
//     left: 20, // Position it at the bottom-left corner
//     backgroundColor: 'white',
//     borderRadius: 50,
//     padding: 10,
//     shadowColor: '#000',
//     shadowOffset: {width: 0, height: 2},
//     shadowOpacity: 0.8,
//     shadowRadius: 2,
//     elevation: 5,
//   },
//   modalContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//   },
//   modalContent: {
//     backgroundColor: 'white',
//     borderRadius: 10,
//     padding: 20,
//     // alignItems: 'center',
//   },
//   modalHeading: {
//     fontSize: size.md,
//     fontWeight: 'bold',
//     marginBottom: 10,
//     color: themeColors.darkGray,
//   },
//   subHeading: {
//     fontSize: size.sl,
//     marginBottom: 5,
//     color: themeColors.darkGray,
//   },
//   pickerContainer: {
//     borderWidth: 1,
//     borderColor: '#ccc',
//     borderRadius: 5,
//     width: '100%',
//     marginBottom: 20,
//   },
//   picker: {
//     height: 50,
//     width: '100%',
//   },
//   closeButton: {
//     // margin: 10,
//     padding: 10,
//     backgroundColor: themeColors.primary,
//     borderRadius: 5,
//     alignSelf: 'center',
//     width: '100%',
//   },
//   closeButtonText: {
//     fontSize: size.md,
//     color: themeColors.white,
//     textAlign: 'center',
//   },
//   switchContainer: {
//     position: 'absolute',
//     // borderRadius: 30,
//     padding: 5,
//     backgroundColor: 'white',
//     bottom: 20,
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
// });

import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  TextInput,
  Modal,
  Switch,
  ScrollView,
  Button,
  Platform,
  UIManager,
} from 'react-native';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import EntypoIcon from 'react-native-vector-icons/Entypo';
import Fontisto from 'react-native-vector-icons/Fontisto';
import {themeColors} from '../../theme/colors';
import {size} from '../../theme/fontStyle';
import {fonts} from '../../theme/fonts';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {THIS_IS_MAP_KEY} from '../../../config/variables';
import useLocation from '../../hooks/useLocation';
import LocationLayout from '../../components/common/LocationLayout';
import MapView, {Marker, PROVIDER_GOOGLE} from 'react-native-maps';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {Picker} from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/FontAwesome5';
import {useDispatch, useSelector} from 'react-redux';
import {RootState} from '../../store';
import {
  fetchNearbyPlaces,
  filterMarkers,
  setSelectedDistance,
  setSelectedFilter,
  shouldRefetchPlaces,
} from '../../store/slices/MarkersSlice';
import {logActivity} from '../../services/activityLogsService';
import {user} from '../../store/selectors';
import type {AppDispatch} from '../../store/index';
import {horizontalScale, verticalScale} from '../../utils/metrics';
import MarkModal from './MarkerModal';

import ModalCache from '../../utils/modalCache';
export const useAppDispatch: () => AppDispatch = useDispatch;

type TopRatedProps = {
  navigation?: NativeStackNavigationProp<any>;
};
const categories = [
  {category: 'Display All'},
  {category: 'Hospital', icon: 'local-hospital', library: MaterialIcons},
  {category: 'Pharmacy', icon: 'local-pharmacy', library: MaterialIcons},
  {category: 'Laboratory', icon: 'laboratory', library: Fontisto},
  {category: 'Herbal', icon: 'feather', library: EntypoIcon},
  {category: 'Ambulance', icon: 'ambulance', library: Icon},
  {category: 'Wholesale', icon: 'store', library: MaterialIcons},
];

const TopRated: React.FC<TopRatedProps> = ({navigation}) => {
  const userData = useSelector(user);
  const {location, locationError, retryLocation} = useLocation(); // Get error and retry function
  const [isLocationLoading, setIsLocationLoading] = useState(true); // Track location loading state
  const [searchText, setSearchText] = useState('');
  const [currentLocationName, setCurrentLocationName] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const dispatch = useAppDispatch();
  const {
    markers,
    loading,
    selectedDistance,
    selectedFilter,
    lastFetchedLocation,
    lastFetchedDistance,
  } = useSelector((state: RootState) => state.markers);
  const [isEnabled, setIsEnabled] = useState(false);
  const [markModal, setMarkModal] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [markerInfo, setMarkerInfo] = useState<{
    name: string;
    vicinity: string;
    distance: any;
    travelTime: any;
  } | null>(null);

  // Diagnostics: detect if Google Maps provider for iOS is available
  const isIOSGoogleProviderAvailable =
    Platform.OS === 'ios' && !!UIManager.getViewManagerConfig('AIRGoogleMap');

  useEffect(() => {
    console.log(
      `🧭 [MAP DIAG] Platform=${Platform.OS}, iOS Google Provider Available=${isIOSGoogleProviderAvailable}`,
    );
  }, [isIOSGoogleProviderAvailable]);

  // Diagnostics: ping a lightweight Google Geocoding endpoint on iOS to verify key allows web services
  useEffect(() => {
    if (Platform.OS !== 'ios') return;
    const test = async () => {
      try {
        if (!THIS_IS_MAP_KEY || THIS_IS_MAP_KEY.length < 20) {
          console.log('🚫 [MAP DIAG] iOS API key missing or invalid length');
          return;
        }
        const url = `https://maps.googleapis.com/maps/api/geocode/json?address=accra&key=${THIS_IS_MAP_KEY}`;
        const res = await fetch(url);
        const data = await res.json();
        console.log('🧪 [MAP DIAG] iOS Geocode probe status:', data.status);
      } catch (e) {
        console.log('❌ [MAP DIAG] iOS Geocode probe failed:', e);
      }
    };
    test();
  }, []);

  const filters: any = {
    'Hospital/ Clinic': {type: 'hospital', keyword: ''},
    'Herbal Centers': {type: 'hospital', keyword: 'herbal'},
    'Diagnostic (Laboratory)': {
      type: 'health',
      keyword: 'diagnostic, laboratory',
    },
    Dental: {type: 'dentist', keyword: ''},
    Ambulance: {type: 'hospital', keyword: 'ambulance'},
    Pharmacy: {type: 'pharmacy', keyword: ''},
    Homes: {type: 'health', keyword: 'nursing home, care home'},
    'Eye Care': {type: 'health', keyword: 'eye care, optical'},
    Osteopathy: {type: 'health', keyword: 'osteopathy'},
    Physiotherapy: {type: 'health', keyword: 'physiotherapy, physical therapy'},
    Prosthetics: {type: 'health', keyword: 'prosthetic, orthopedic'},
    Psychiatric: {type: 'health', keyword: 'psychiatric, mental health'},
    'Display All': {
      keyword:
        'hospital, clinic, pharmacy, herbal, diagnostic, laboratory, dental, ambulance, nursing home, eye care, osteopathy, physiotherapy, prosthetics, psychiatric, medical center, healthcare',
    },
  };

  // Track when location is finally resolved (success or error)
  useEffect(() => {
    if (location !== null || locationError) {
      setIsLocationLoading(false);
    }
  }, [location, locationError]);

  const toggleSwitch = () => setIsEnabled(previousState => !previousState);

  // Consolidated useEffect for fetching places data
  useEffect(() => {
    // Don't do anything if we are still waiting for location
    if (location === null) {
      return;
    }

    // Don't do anything if location is an error
    if (locationError) {
      console.log('Cannot fetch places: location error or permission denied');
      return;
    }

    // DEFENSIVE CHECK: Ensure location has valid numbers
    if (
      typeof location.latitude !== 'number' ||
      typeof location.longitude !== 'number'
    ) {
      console.error('Invalid location data:', location);
      return;
    }

    // Check if we need to refetch data
    const needsRefetch = shouldRefetchPlaces(
      location,
      selectedDistance,
      lastFetchedLocation,
      lastFetchedDistance,
    );

    // Now we can safely fetch!
    const fetchData = async () => {
      try {
        if (needsRefetch) {
          console.log('Location or distance changed, fetching new data...');
          await dispatch(
            fetchNearbyPlaces({
              latitude: location.latitude,
              longitude: location.longitude,
              selectedDistance,
              API_KEY: THIS_IS_MAP_KEY,
              filters,
            }),
          ).unwrap(); // .unwrap() handles Redux Toolkit promises
        } else {
          console.log('Using cached data, no API calls needed');
        }

        // Apply the filter after fetching (or use cached data)
        dispatch(filterMarkers(selectedFilter));

        // Log activity for distance filter
        logActivity(
          {
            user_id: userData?.id || '',
            user_name: `${userData?.first_name || ''} ${
              userData?.last_name || ''
            }`,
            type: 'facility',
            description: `User has used the location indicator and filtered facilities by distance (${
              selectedDistance == 10000
                ? '10 kms'
                : selectedDistance == 8000
                ? '8 kms'
                : selectedDistance == 6000
                ? '6 kms'
                : selectedDistance == 4000
                ? '4 kms'
                : '2 kms'
            })`,
            reference: '',
            reference_id: '',
          },
          () => {
            console.log('Logging Location Indicator Filter activity...');
          },
          data => {
            console.log(
              'Location Indicator Filter activity logged successfully:',
              data,
            );
          },
          error => {
            console.error(
              'Error logging Location Indicator Filter activity:',
              error,
            );
          },
        );

        // Log activity for type filter
        logActivity(
          {
            user_id: userData?.id || '',
            user_name: `${userData?.first_name || ''} ${
              userData?.last_name || ''
            }`,
            type: 'facility',
            description: `User has used the location indicator and filtered facilities by type (${selectedFilter})`,
            reference: '',
            reference_id: '',
          },
          () => {
            console.log('Logging Location Indicator Filter activity...');
          },
          data => {
            console.log(
              'Location Indicator Filter activity logged successfully:',
              data,
            );
          },
          error => {
            console.error(
              'Error logging Location Indicator Filter activity:',
              error,
            );
          },
        );
      } catch (error) {
        console.error('Failed to fetch nearby places:', error);
      }
    };

    fetchData();
  }, [
    location,
    locationError,
    selectedDistance,
    selectedFilter,
    dispatch,
    userData,
    filters,
  ]);

  useEffect(() => {
    if (
      location &&
      typeof location.latitude === 'number' &&
      typeof location.longitude === 'number'
    ) {
      fetchLocationName(location.latitude, location.longitude);
    }
  }, [location]);

  const fetchAutocompleteSuggestions = async (query: any) => {
    if (query.length === 0) {
      setSuggestions([]);
      return;
    }
    try {
      // Track function call
      // API call tracking removed - keeping Supabase API guard

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${query}&key=${THIS_IS_MAP_KEY}`,
      );

      // Track Google API call
      apiCallTracker.trackAPICall(
        'fetchAutocompleteSuggestions',
        'place/autocomplete',
        {
          query,
        },
      );

      const data = await response.json();
      if (response.ok) {
        setSuggestions(data.predictions);
      } else {
        console.error('Error fetching autocomplete suggestions:', data.status);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchLocationName = async (latitude: any, longitude: any) => {
    try {
      // Track function call
      apiCallTracker.trackFunctionCall('fetchLocationName');

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${THIS_IS_MAP_KEY}`,
      );

      // Track Google API call
      apiCallTracker.trackAPICall('fetchLocationName', 'geocode', {
        latitude,
        longitude,
      });

      const data = await response.json();

      if (response.ok) {
        const locationName =
          data?.plus_code?.compound_code || 'Unknown Location';
        setCurrentLocationName(locationName);
        setSearchText(locationName);
      } else {
        console.error('Error fetching location:', data.status);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const onFilterPress = useCallback(
    (filter: any) => {
      dispatch(setSelectedFilter(filter));
    },
    [dispatch],
  );

  const fetchPlaceDetails = async (placeId: any) => {
    try {
      // Track function call
      apiCallTracker.trackFunctionCall('fetchPlaceDetails');

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${THIS_IS_MAP_KEY}`,
      );

      // Track Google API call
      apiCallTracker.trackAPICall('fetchPlaceDetails', 'place/details', {
        placeId,
      });

      const data = await response.json();
      if (response.ok) {
        const {lat, lng} = data.result.geometry.location;
        setSelectedLocation({latitude: lat, longitude: lng});
      } else {
        console.error('Error fetching place details:', data.status);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const mapRef = useRef<any>(null);
  const handleCurrentLocationPress = () => {
    if (
      location &&
      typeof location.latitude === 'number' &&
      typeof location.longitude === 'number'
    ) {
      mapRef.current.animateToRegion({
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    }
  };

  const handleSelectSuggestion = (placeId: any, description: any) => {
    setSearchText(description);
    fetchPlaceDetails(placeId);
    setSuggestions([]);
  };

  const handleSearch = () => {
    setSuggestions([]);
  };

  const CustomMarker = useCallback(
    ({markerType}) => {
      return (
        <View style={{alignItems: 'center'}}>
          <Image
            source={
              markerType?.opening_hours?.open_now
                ? require('../../../assets/images/location2.png')
                : require('../../../assets/images/location.png')
            }
            style={{width: horizontalScale(30), height: verticalScale(40)}}
            resizeMode="center"
          />
          <Text
            style={{
              position: 'absolute', // Overlay the text
              color: themeColors.marker,
              fontWeight: 'bold',
              fontSize: size.default,
            }}>
            {markerType.category && markerType.category === 'Herbal'
              ? 'T'
              : markerType.category?.[0] || '?'}
          </Text>
        </View>
      );
    },
    [selectedFilter],
  );

  const fetchImage = async (placeId: string) => {
    try {
      // Track function call
      apiCallTracker.trackFunctionCall('fetchImage');

      const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${THIS_IS_MAP_KEY}`;

      // Track Google API call
      apiCallTracker.trackAPICall('fetchImage', 'place/details', {
        placeId,
      });

      const response = await fetch(url);
      const data = await response.json();
      if (data?.result?.photos && data?.result?.photos?.length > 0) {
        const reference = data?.result?.photos[0]?.photo_reference;
        return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${reference}&key=${THIS_IS_MAP_KEY}`;
      } else {
        console.log('error fetching image');
        return null;
      }
    } catch (error) {
      console.error('Error fetching image:', error);
      return null;
    }
  };

  const openMarkModal = async (marker: any) => {
    // Track function call
    apiCallTracker.trackFunctionCall('openMarkModal');

    if (!location) {
      console.error('User location not available');
      return;
    }

    // Check if we have cached modal data for this facility
    const cachedModalData = await ModalCache.getCachedModalData(
      marker.place_id,
      location.latitude,
      location.longitude,
    );

    if (cachedModalData) {
      // Use cached data - NO API calls needed!
      console.log('🎯 Using cached modal data for facility:', marker.place_id);
      setImage(cachedModalData.imageUrl);
      setMarkerInfo({
        name: marker?.name || 'unknown',
        vicinity: marker?.vicinity || 'unknown place',
        distance: cachedModalData.distance,
        travelTime: cachedModalData.duration,
      });
      setMarkModal(true);
      return;
    }

    // No cache found, fetch fresh data
    console.log('🔄 Fetching fresh modal data for facility:', marker.place_id);

    // Fetch image and distance in parallel
    const [imageUrl, distanceAndDuration] = await Promise.all([
      fetchImage(marker.place_id),
      fetchDistanceAndDuration(
        `${location.latitude},${location.longitude}`,
        `${marker?.geometry?.location?.lat},${marker?.geometry?.location?.lng}`,
      ),
    ]);

    // Cache the modal data for future use
    await ModalCache.setCachedModalData(
      marker.place_id,
      location.latitude,
      location.longitude,
      imageUrl,
      distanceAndDuration?.distance || 'unknown',
      distanceAndDuration?.duration || 'unknown',
    );

    setImage(imageUrl ?? null);
    setMarkerInfo({
      name: marker?.name || 'unknown',
      vicinity: marker?.vicinity || 'unknown place',
      distance: distanceAndDuration?.distance,
      travelTime: distanceAndDuration?.duration,
    });
    setMarkModal(true);
  };

  const fetchDistanceAndDuration = async (
    origin: string,
    destination: string,
  ) => {
    try {
      // Track function call
      apiCallTracker.trackFunctionCall('Locator.fetchDistanceAndDuration');

      let distance = '';
      let duration = '';
      const distanceMatrixUrl = `https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=${origin}&destinations=${destination}&key=${THIS_IS_MAP_KEY}`;

      // Track Google API call
      apiCallTracker.trackAPICall(
        'Locator.fetchDistanceAndDuration',
        'distancematrix',
        {
          origin,
          destination,
        },
      );

      const response = await fetch(distanceMatrixUrl);
      const data = await response.json();

      if (data?.status === 'OK') {
        const element = data?.rows[0]?.elements[0];
        if (element?.status === 'OK') {
          distance = element?.distance?.text;
          duration = element?.duration?.text;
        } else {
          console.log('Distance Matrix API response status: 1', element.status);
        }
      } else {
        console.log('Distance Matrix API response status: 2', data.status);
      }
      return {
        distance,
        duration,
      };
    } catch (error) {
      console.log('Error fetching distance and duration:', error);
      return {distance: 'unknown', duration: 'unknown'};
    }
  };

  // Show loading state while getting location
  if (isLocationLoading) {
    return (
      <LocationLayout>
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <ActivityIndicator size="large" color={themeColors.primary} />
          <Text style={{marginTop: 10, color: themeColors.black}}>
            Getting your location...
          </Text>
        </View>
      </LocationLayout>
    );
  }

  // Show error state if location permission denied or failed
  if (locationError) {
    return (
      <LocationLayout>
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
          }}>
          <MaterialIcons
            name="error-outline"
            size={50}
            color={themeColors.red}
          />
          <Text
            style={{
              textAlign: 'center',
              marginVertical: 15,
              color: themeColors.black,
            }}>
            Location access is required to find nearby facilities.
          </Text>
          <Button
            title="Grant Permission"
            onPress={retryLocation}
            color={themeColors.primary}
          />
        </View>
      </LocationLayout>
    );
  }

  // Final fallback if no location object
  if (!location) {
    return (
      <LocationLayout>
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <Text style={{color: themeColors.black}}>
            Unable to determine your location.
          </Text>
          <Button
            title="Try Again"
            onPress={retryLocation}
            color={themeColors.primary}
            style={{marginTop: 15}}
          />
        </View>
      </LocationLayout>
    );
  }

  // Main render when we have a valid location
  return (
    <LocationLayout>
      <Modal visible={loading} transparent={true} animationType="fade">
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={themeColors.primary} />
          <Text style={styles.loadingText}>Fetching Nearby Places...</Text>
        </View>
      </Modal>
      <View style={styles.mapContainer}>
        <MapView
          provider={
            Platform.OS === 'android'
              ? PROVIDER_GOOGLE // Android always Google
              : isIOSGoogleProviderAvailable
              ? PROVIDER_GOOGLE // iOS Google SDK present
              : undefined // fallback (prevents crash if SDK not linked)
          }
          customMapStyle={[
            {
              featureType: 'poi',
              stylers: [{visibility: 'off'}],
            },
            {
              featureType: 'poi.business',
              stylers: [{visibility: 'off'}],
            },
          ]}
          ref={mapRef}
          style={styles.map}
          initialRegion={{
            latitude:
              selectedLocation?.latitude || location?.latitude || 37.78825,
            longitude:
              selectedLocation?.longitude || location?.longitude || -122.4324,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
          zoomEnabled={true}
          scrollEnabled={true}
          showsUserLocation={true}
          zoomControlEnabled={true}
          showsCompass={false}
          onMapReady={() => {
            console.log(
              '🗺️ [MAP] MapView ready. Provider:',
              Platform.OS === 'android'
                ? 'google-android'
                : isIOSGoogleProviderAvailable
                ? 'google-ios'
                : 'apple',
            );
          }}
          onError={e => {
            console.log('❌ [MAP] MapView error:', e?.nativeEvent || e);
          }}>
          {selectedLocation && (
            <Marker
              coordinate={selectedLocation}
              title="Searched Location"
              pinColor={themeColors.primary}
            />
          )}
          {currentLocationName && (
            <Marker
              coordinate={location}
              title="Current Location"
              pinColor={'#5990FA'}
            />
          )}
          {markers?.map((marker: any, index: number) => (
            <Marker
              key={index}
              coordinate={{
                latitude: marker?.geometry?.location?.lat,
                longitude: marker?.geometry?.location?.lng,
              }}
              title={marker?.name}
              onPress={() => openMarkModal(marker)}
              pinColor={
                marker?.opening_hours?.open_now
                  ? themeColors.primaryLight
                  : themeColors.red
              }></Marker>
          ))}
        </MapView>
        <View style={styles.mapFilterContainer}>
          <View style={{}}>
            <View style={{flex: 1}}>
              <TextInput
                style={styles.searchBox}
                placeholder="Search Location..."
                value={searchText}
                onChangeText={text => {
                  if (!text) {
                    setSelectedLocation(null);
                  }
                  setSearchText(text);
                  fetchAutocompleteSuggestions(text);
                }}
                onSubmitEditing={handleSearch}
              />
              {searchText && (
                <EntypoIcon
                  name={'cross'}
                  size={20}
                  color={themeColors.primary}
                  style={{position: 'absolute', right: 15, top: 8}}
                  onPress={() => {
                    setSearchText('');
                    setSelectedLocation(null);
                  }}
                />
              )}
              {suggestions.length > 0 && (
                <FlatList
                  data={suggestions}
                  keyExtractor={(item: any) => item.place_id}
                  renderItem={({item}) => (
                    <TouchableOpacity
                      onPress={() =>
                        handleSelectSuggestion(item.place_id, item.description)
                      }>
                      <Text style={styles.suggestionText}>
                        {item.description}
                      </Text>
                    </TouchableOpacity>
                  )}
                  style={styles.suggestionList}
                />
              )}
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.categoryContainer}>
                {categories.map((filter, index) => {
                  const IconComp = filter.library;
                  return (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.categoryButton,
                        {
                          backgroundColor:
                            selectedFilter !== filter.category
                              ? 'rgba(246, 127, 48, 0.7)'
                              : 'rgba(71, 190, 125, 0.6)',
                          marginTop: index === 0 ? 0 : 4,
                        },
                      ]}
                      onPress={() => onFilterPress(filter.category)}>
                      {IconComp ? (
                        <IconComp
                          name={filter.icon}
                          size={20}
                          color={themeColors.white}
                        />
                      ) : null}
                      <Text
                        style={{
                          fontFamily: fonts.OpenSansBold,
                          color: themeColors.white,
                          fontSize: size.s,
                          marginLeft: 5,
                        }}>
                        {filter.category}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
            <View style={{width: 100, alignSelf: 'flex-end'}}>
              <TouchableOpacity
                style={styles.filterContainer}
                onPress={() => {
                  setModalVisible(true);
                }}>
                <Icon
                  name={'filter'}
                  size={12}
                  color={themeColors.darkPink}
                  style={styles.icon}
                />
                <Text style={styles.filter}>Filter</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.compassButton}
          onPress={handleCurrentLocationPress}>
          <MaterialIcons
            name="my-location"
            size={22}
            color={themeColors.black}
          />
        </TouchableOpacity>
        <View style={[styles.switchContainer]}>
          <Switch
            trackColor={{
              false: themeColors.darkGray,
              true: themeColors.primary,
            }}
            thumbColor={isEnabled ? '#FFFFFF' : '#FFFFFF'}
            ios_backgroundColor="#FF6347"
            onValueChange={toggleSwitch}
            value={isEnabled}
          />
          <Text
            style={{
              color: themeColors.black,
              fontFamily: fonts.OpenSansRegular,
            }}>
            Business Pins
          </Text>
        </View>
        <Modal
          visible={modalVisible}
          transparent
          animationType="none"
          onRequestClose={() => setModalVisible(false)}>
          <View style={styles.modalContainer}>
            <View style={[styles.modalContent, {width: '80%'}]}>
              <Text style={styles.modalHeading}>Sort By</Text>
              <Text style={styles.subHeading}>Distance (kms):</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={selectedDistance}
                  style={styles.picker}
                  onValueChange={itemValue => {
                    dispatch(setSelectedDistance(itemValue));
                    setModalVisible(false);
                  }}>
                  <Picker.Item label="2 kms" value={2000} />
                  <Picker.Item label="4 kms" value={4000} />
                  <Picker.Item label="6 kms" value={6000} />
                  <Picker.Item label="8 kms" value={8000} />
                  <Picker.Item label="10 kms" value={10000} />
                </Picker>
              </View>

              <TouchableOpacity
                style={[styles.closeButton]}
                onPress={() => setModalVisible(false)}>
                <Text style={[styles.closeButtonText]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        {markModal && (
          <MarkModal
            visible={markModal}
            hideModal={() => setMarkModal(false)}
            image={image}
            name={markerInfo?.name ?? 'unknown'}
            vicinity={markerInfo?.vicinity ?? 'unknown location'}
            distance={markerInfo?.distance || 'unknown'}
            duration={markerInfo?.travelTime || 'unknown'}
          />
        )}
      </View>
    </LocationLayout>
  );
};

export default TopRated;

const styles = StyleSheet.create({
  loadingOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: themeColors.primary,
    fontFamily: fonts.OpenSansBold,
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
    paddingHorizontal: 15,
  },
  filterContainer: {
    backgroundColor: 'rgba(155, 216, 235, 0.8)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 35,
    width: 70,
    borderRadius: 10,
    marginVertical: 4,
    alignSelf: 'flex-end',
  },
  icon: {
    marginRight: 5,
  },
  filter: {
    fontFamily: fonts.OpenSansBold,
    fontSize: size.sl,
    color: themeColors.darkPink,
  },
  searchBox: {
    backgroundColor: 'white',
    padding: 4,
    paddingRight: 25,
    borderRadius: 8,
    textAlign: 'center',
    position: 'relative',
    marginRight: 10,
    fontSize: size.sl,
    color: themeColors.darkGray,
  },
  filterButton: {
    backgroundColor: '#ccc',
    padding: 10,
    borderRadius: 8,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
  },
  categoryButton: {
    padding: 7,
    borderRadius: 25,
    marginVertical: 4,
    minWidth: 60,
    height: 35,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  suggestionList: {
    marginTop: 10,
    backgroundColor: themeColors.white,
    zIndex: 1000,
    marginRight: 10,
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
    left: 20,
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
  switchContainer: {
    position: 'absolute',
    padding: 5,
    backgroundColor: 'white',
    bottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
});
