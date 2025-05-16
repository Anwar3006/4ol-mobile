import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
  NativeModules,
} from 'react-native';
import React from 'react';
import useLocation from '../../hooks/useLocation';
import {size} from '../../theme/fontStyle';
import RNRestart from 'react-native-restart';

const LocationLayout = ({children}: any) => {
  const {location, locationError, retryLocation} = useLocation();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    // NativeModules.DevSettings.reload(); // Reloads the entire app
    RNRestart.restart();
    setRefreshing(false);
  };

  return locationError ? (
    <ScrollView
      contentContainerStyle={styles.container}
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }>
      <Text style={styles.errorText}>
        Location is disabled, please enable the location and pull down to reload
        the app.
      </Text>
    </ScrollView>
  ) : location ? (
    children
  ) : (
    <View style={styles.container}>
      <Text style={styles.loadingText}>Fetching location...</Text>
    </View>
  );
};

export default LocationLayout;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: size.md,
    textAlign: 'center',
    padding: 15,
  },
  loadingText: {
    fontSize: size.md,
    color: 'gray',
    textAlign: 'center',
    padding: 15,
  },
});
