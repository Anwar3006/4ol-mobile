import { View, Text } from "react-native";
import React, { useEffect } from "react";
import GoogleMapContainer from "@/components/map/GoogleMapContainer";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Location from "expo-location";

const MapScreen = () => {
  // useEffect(() => {
  //   (async () => {
  //     let { status } = await Location.requestForegroundPermissionsAsync();
  //     if (status !== "granted") {
  //       console.log("Permission to access location was denied");
  //       return;
  //     }
  //   })();
  // }, []); //UNDO

  const insets = useSafeAreaInsets();
  return (
    <View className="flex-1 bg-white">
      <View style={{ paddingTop: insets.top }}>
        <GoogleMapContainer />
      </View>
    </View>
  );
};

export default MapScreen;

