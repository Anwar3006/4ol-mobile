import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  useWindowDimensions,
  StyleSheet,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import { MarketingCampaign } from "@/hooks/use-marketing";
import Constants from "expo-constants";
import { cn } from "@/lib/utils";

interface CampaignBoxProps {
  campaign: MarketingCampaign;
}

const CampaignBox = ({ campaign }: CampaignBoxProps) => {
  const { width } = useWindowDimensions();
  
  // Responsive Scaling Logic
  const isLargeScreen = width > 768; // Tablet breakpoint
  const isNarrow = width < 340;
  
  // Base scale is 1 for mobile, increases slightly for tablets (up to ~1.3)
  const scale = isLargeScreen ? Math.min(width / 600, 1.35) : 1;
  
  // Scale dimensions based on the screen width
  const CARD_HEIGHT = 180 * scale;
  const MAX_WIDTH = isLargeScreen ? 650 : "100%";

  const handlePress = async () => {
    if (campaign.links && campaign.links.length > 0) {
      try {
        await WebBrowser.openBrowserAsync(campaign.links[0], {
          toolbarColor: "#EBF9E6",
          enableBarCollapsing: true,
          showTitle: true,
        });
      } catch (err) {
        console.error("Failed to open in-app browser:", err);
      }
    }
  };

  const formatCTA = (cta: string) =>
    cta
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  const getImageUrl = (img: string) => {
    if (img.startsWith("http")) return img;
    const supabaseUrl =
      process.env.EXPO_PUBLIC_SUPABASE_URL ||
      Constants.expoConfig?.extra?.SUPABASE_URL ||
      "https://rhbbxttxnvcziyqzptqs.supabase.co";
    const supabaseBucketName =
      process.env.EXPO_PUBLIC_SUPABASE_BUCKET_NAME ||
      Constants.expoConfig?.extra?.SUPABASE_BUCKET_NAME ||
      "marketing";
    return `${supabaseUrl}/storage/v1/object/public/${supabaseBucketName}/${img}`;
  };

  const imageUri = campaign.imageUrl
    ? getImageUrl(campaign.imageUrl)
    : "https://cdn-icons-png.flaticon.com/512/3063/3063176.png";

  return (
    <View className="mb-4 w-full items-center px-4 md:px-0">
      <LinearGradient
        colors={["#10b981", "#059669"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          borderRadius: 32 * scale,
          width: MAX_WIDTH,
          height: CARD_HEIGHT,
          overflow: "hidden",
        }}
      >
        <View style={[styles.row, { height: CARD_HEIGHT }]}>
          {/* Left Content */}
          <View
            style={{ 
              flex: isNarrow ? 7 : 6, 
              paddingLeft: (isNarrow ? 16 : 24) * scale,
              paddingVertical: (isNarrow ? 16 : 24) * scale,
              paddingRight: 16
            }}
            className="justify-center"
          >
            {/* Organization Tag */}
            <View 
              style={{ paddingVertical: 4 * scale, paddingHorizontal: 12 * scale }}
              className="bg-black/20 self-start rounded-full mb-2"
            >
              <Text 
                style={{ fontSize: 7 * scale }}
                className="text-white font-black uppercase tracking-[1.5px]"
              >
                {campaign.organization || "Campaign"}
              </Text>
            </View>

            {/* Headline */}
            <Text
              style={{ 
                fontSize: (isNarrow ? 18 : 22) * scale,
                lineHeight: (isNarrow ? 22 : 28) * scale,
              }}
              className="font-black text-white tracking-tight"
            >
              {campaign.headline.length > (isLargeScreen ? 20 : 10)
                ? campaign.headline.slice(0, isLargeScreen ? 20 : 10) + "..."
                : campaign.headline}
            </Text>

            {/* Description */}
            <Text
              style={{ 
                fontSize: (isNarrow ? 10 : 11) * scale,
                lineHeight: (isNarrow ? 14 : 16) * scale,
                marginTop: 4 * scale,
                marginBottom: 8 * scale,
                maxWidth: 240 * scale
              }}
              className="text-emerald-50/80 font-medium"
            >
              {campaign.description.length > (isLargeScreen ? 80 : 45)
                ? campaign.description.slice(0, isLargeScreen ? 80 : 45) + "..."
                : campaign.description}
            </Text>

            {/* CTA Button */}
            <TouchableOpacity
              onPress={handlePress}
              activeOpacity={0.8}
              style={{ 
                height: (isNarrow ? 36 : 40) * scale,
                paddingHorizontal: 24 * scale,
                borderRadius: 16 * scale 
              }}
              className="bg-white flex-row items-center justify-center self-start shadow-sm"
            >
              <Text style={{ fontSize: 11 * scale }} className="text-emerald-700 font-bold mr-2">
                {formatCTA(campaign.cta || "Learn_More")}
              </Text>
              <Ionicons
                name="arrow-forward"
                size={(isNarrow ? 14 : 18) * scale}
                color="#047857"
              />
            </TouchableOpacity>
          </View>

          {/* Right Image */}
          <View style={[styles.imageWrapper, { flex: isNarrow ? 4 : 6, height: CARD_HEIGHT }]}>
            <View style={[styles.decorCircle, { width: 180 * scale, height: 180 * scale }]} />
            <Image
              source={{ uri: imageUri }}
              style={StyleSheet.absoluteFillObject}
              resizeMode="cover"
            />
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
  },
  imageWrapper: {
    overflow: "hidden",
    position: "relative",
  },
  decorCircle: {
    position: "absolute",
    right: -10,
    bottom: -20,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
});

export default CampaignBox;