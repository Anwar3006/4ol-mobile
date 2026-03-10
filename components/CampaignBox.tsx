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

const CARD_HEIGHT = 180;

const CampaignBox = ({ campaign }: CampaignBoxProps) => {
  const { width } = useWindowDimensions();
  const isLargeScreen = width > 600;
  const isNarrow = width < 340;

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

  const headlineSize = isNarrow ? "text-lg" : "text-xl";
  const descSize = isNarrow ? "text-[10px]" : "text-xs";
  const paddingY = isNarrow ? "py-4" : "py-6";
  const paddingLeft = isNarrow ? "pl-4" : "pl-6";

  const imageUri = campaign.imageUrl
    ? getImageUrl(campaign.imageUrl)
    : "https://cdn-icons-png.flaticon.com/512/3063/3063176.png";

    console.log("Imageurl: ", imageUri)

  return (
    <View className="mb-4 w-full items-center">
      <LinearGradient
        colors={["#10b981", "#059669"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          borderRadius: 32,
          width: isLargeScreen ? 550 : "100%",
          height: CARD_HEIGHT,
          overflow: "hidden",
        }}
      >
        <View style={styles.row}>
          {/* Left Content */}
          <View
            className={cn("pr-4 gap-y-2 justify-center", paddingY, paddingLeft)}
            style={{ flex: isNarrow ? 7 : 5 }}
          >
            <View className="bg-black/20 self-start px-3 py-1 rounded-full mb-1">
              <Text className="text-white text-[9px] font-black uppercase tracking-[1.5px]">
                {campaign.organization || "Campaign"}
              </Text>
            </View>

            <Text
              className={cn(
                "font-black text-white leading-7 tracking-tight",
                headlineSize,
              )}
            >
              {campaign.headline.length > (isNarrow ? 12 : 15)
                ? campaign.headline.slice(0, isNarrow ? 12 : 15) + "..."
                : campaign.headline}
            </Text>

            <Text
              className={cn(
                "text-emerald-50/80 max-w-[14rem] font-medium leading-5 mb-2",
                descSize,
              )}
            >
              {campaign.description.length > (isNarrow ? 40 : 50)
                ? campaign.description.slice(0, isNarrow ? 40 : 50) + "..."
                : campaign.description}
            </Text>

            <TouchableOpacity
              onPress={handlePress}
              activeOpacity={0.8}
              className={cn(
                "bg-white px-6 rounded-2xl flex-row items-center justify-center self-start shadow-sm",
                isNarrow ? "h-10" : "h-12",
              )}
            >
              <Text className="text-emerald-700 font-bold mr-2 text-[10px]">
                {formatCTA(campaign.cta || "Learn_More")}
              </Text>
              <Ionicons
                name="arrow-forward"
                size={isNarrow ? 14 : 18}
                color="#047857"
              />
            </TouchableOpacity>
          </View>

          {/* Right Image — explicit height so the image resolves dimensions */}
          <View style={[styles.imageWrapper, { flex: isNarrow ? 4 : 5 }]}>
            {/* Decorative circle behind image */}
            <View style={styles.decorCircle} />
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
    height: CARD_HEIGHT,
  },
  imageWrapper: {
    height: CARD_HEIGHT,
    overflow: "hidden",
    position: "relative",
  },
  decorCircle: {
    position: "absolute",
    right: -10,
    bottom: -20,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
});

export default CampaignBox;
