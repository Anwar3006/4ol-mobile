import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  SafeAreaView,
} from "react-native";
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import useUserStore from "@/store/use-userstore";
import { getFacilityDetailsById } from "@/src/services/facility";
import { themeColors } from "@/src/theme/colors";
import { fonts } from "@/src/theme/fonts";
import { size } from "@/src/theme/fontStyle";

const FacilityDetails = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user: userData } = useUserStore();
  const [facility, setFacility] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      getFacilityDetailsById(id as string)
        .then((data) => setFacility(data))
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={themeColors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={themeColors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Facility Details</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {facility ? (
          <>
            {facility.media_urls && facility.media_urls.length > 0 && (
              <Image source={{ uri: facility.media_urls[0] }} style={styles.image} />
            )}
            <Text style={styles.title}>{facility.facility_name}</Text>
            <Text style={styles.type}>{facility.facility_type?.replace(/_/g, ' ')}</Text>
            
            <View style={styles.infoRow}>
              <Ionicons name="location" size={20} color={themeColors.primary} />
              <Text style={styles.infoText}>{facility.area}, {facility.region}</Text>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="call" size={20} color={themeColors.primary} />
              <Text style={styles.infoText}>{facility.contact_number}</Text>
            </View>

            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.description}>{facility.keywords?.join(', ') || 'No description available'}</Text>
          </>
        ) : (
          <Text>Facility not found</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themeColors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: themeColors.gray,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: fonts.QuincyCFBold,
    color: themeColors.black,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  image: {
    width: '100%',
    height: 250,
  },
  title: {
    fontSize: 24,
    fontFamily: fonts.QuincyCFBold,
    color: themeColors.primary,
    paddingHorizontal: 20,
    marginTop: 20,
  },
  type: {
    fontSize: 16,
    fontFamily: fonts.OpenSansBold,
    color: themeColors.darkGray,
    paddingHorizontal: 20,
    textTransform: 'capitalize',
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  infoText: {
    fontSize: 16,
    fontFamily: fonts.OpenSansRegular,
    color: themeColors.black,
    marginLeft: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: fonts.OpenSansBold,
    color: themeColors.black,
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    fontFamily: fonts.OpenSansRegular,
    color: themeColors.black,
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default FacilityDetails;
