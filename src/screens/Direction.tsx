import React, {useState} from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import MapView, {Marker} from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import {API_KEY} from '../../config/variables';
import useLocation from '../hooks/useLocation';
import Icon from 'react-native-vector-icons/FontAwesome5'; // Or any other icon library you prefer
import {size} from '../theme/fontStyle';
import {themeColors} from '../theme/colors';
import {fonts} from '../theme/fonts';
import LocationLayout from '../components/common/LocationLayout';

type DirectionScreenProps = {
  navigation?: NativeStackNavigationProp<any>;
  route?: {
    params: {
      destination?: {
        latitude: number;
        longitude: number;
      };
    };
  };
};

const DirectionScreen: React.FC<DirectionScreenProps> = ({
  navigation,
  route,
}) => {
  const {location, locationError, retryLocation, setLocation} = useLocation();
  const {destination} = route?.params || {};
  const [distance, setDistance] = useState<number | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [mode, setMode] = useState<'DRIVING' | 'WALKING'>('DRIVING');
  const [refreshing, setRefreshing] = React.useState(false);
  // if (!location || !destination) {
  //   return null;
  // }
  const currentLocation = {
    latitude: location?.latitude,
    longitude: location?.longitude,
  };
  const onRefresh = () => {
    setRefreshing(true);
    retryLocation();
    setRefreshing(false);
  };

  return (
    <LocationLayout>
      <View style={styles.container}>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: location?.latitude || 37.7749,
            longitude: location?.longitude || -122.4194,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
          zoomEnabled={true}
          scrollEnabled={true}
          showsUserLocation={true}
          zoomControlEnabled={true}
          showsCompass={true}
          onUserLocationChange={event => {
            const {latitude, longitude}: any = event.nativeEvent.coordinate;
            setLocation({latitude, longitude});
          }}>
          <Marker coordinate={destination} title="Destination" />
          <MapViewDirections
            origin={currentLocation}
            destination={destination}
            apikey={API_KEY}
            strokeWidth={5}
            strokeColor="blue"
            mode={mode}
            resetOnChange={false}
            onReady={result => {
              setDistance(result.distance);
              setDuration(result.duration);
            }}
          />
        </MapView>
        <View style={styles.infoContainer}>
          {distance == null || duration == null ? (
            <Text style={styles.infoText}>Calculating Distance...</Text>
          ) : (
            <Text style={styles.infoText}>
              Distance: {distance.toFixed(2)} km {'\n'}
              Duration: {formatDuration(duration || 0)}
            </Text>
          )}
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, mode === 'DRIVING' && styles.activeButton]}
            onPress={() => {
              if (mode == 'DRIVING') {
                return;
              }
              setDistance(null);
              setDuration(null);
              setMode('DRIVING');
            }}>
            <Icon name="car" size={20} color="#fff" />
            <Text style={styles.buttonText}>Driving</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, mode === 'WALKING' && styles.activeButton]}
            onPress={() => {
              if (mode == 'WALKING') {
                return;
              }
              setDistance(null);
              setDuration(null);
              setMode('WALKING');
            }}>
            <Icon name="walking" size={20} color="#fff" />
            <Text style={styles.buttonText}>Walking</Text>
          </TouchableOpacity>
        </View>
      </View>
    </LocationLayout>
  );
};

const formatDuration = (duration: number) => {
  const days = Math.floor(duration / (60 * 24));
  const hours = Math.floor((duration % (60 * 24)) / 60);
  const minutes = Math.round(duration % 60);

  return days > 0
    ? `${days} day${days > 1 ? 's' : ''} ${hours} hr${
        hours > 1 ? 's' : ''
      } ${minutes} min`
    : hours > 0
    ? `${hours} hr${hours > 1 ? 's' : ''} ${minutes} min`
    : `${minutes} min`;
};

export default DirectionScreen;

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: 15,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  infoContainer: {
    position: 'absolute',
    bottom: 60,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  infoText: {
    fontSize: size.md,
    color: themeColors.black,
    fontFamily: fonts.OpenSansRegular,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    paddingHorizontal: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  activeButton: {
    backgroundColor: '#0056b3',
  },
  buttonText: {
    fontSize: size.md,
    color: themeColors.white,
    fontFamily: fonts.OpenSansBold,
    marginLeft: 10,
  },
  errorText: {
    color: 'red',
    fontSize: size.md,
    textAlign: 'center',
  },
});
