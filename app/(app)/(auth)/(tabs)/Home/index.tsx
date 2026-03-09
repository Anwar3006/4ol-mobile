import React, { useEffect, useState, useRef, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Modal,
  FlatList,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  useWindowDimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { themeColors } from "@/src/theme/colors";
import { size } from "@/src/theme/fontStyle";
import SearchBar from "@/src/components/screens/Home/SearchBar";
import useUserStore from "@/store/use-userstore";
import useSearchStore from "@/store/use-searchStore";
import TopRated from "@/src/components/screens/Home/TopRated";
import { fonts } from "@/src/theme/fonts";
import { searchAllTables } from "@/src/services/searchAllTables";
import { useRouter } from "expo-router";

import CampaignBox from "@/components/CampaignBox";
import { useInfiniteLiveCampaigns, MarketingCampaign } from "@/hooks/use-marketing";
import { FlashList } from "@shopify/flash-list";
import CategoryList from "@/components/home/CategoryList";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { HomeHeader } from "@/components/home/HomeHeader";

const tableNameMapping: Record<string, string> = {
  illness_and_conditions: "Illness and Conditions",
  symptoms: "Symptoms",
  healthy_living: "Healthy Living",
  facilities: "Facilities",
};

const HomeScreen = () => {
  const { user: userData } = useUserStore();
  const { setSearchData, setError: setStoreError } = useSearchStore();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);

  const {
    data,
    isLoading: loadingCampaigns,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteLiveCampaigns();
  
  const flashListRef = useRef<any>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const campaigns = useMemo(() =>
    data?.pages.flatMap((page: MarketingCampaign[]) => page) || [],
  [data]);

  const availableWidth = width - 40; // 20 paddingHorizontal on each side in container

  useEffect(() => {
    if (campaigns.length <= 1) return;

    const timer = setInterval(() => {
      let nextIndex = currentIndex + 1;
      
      if (nextIndex >= campaigns.length) {
        if (hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        } else {
          nextIndex = 0; // Loop back
        }
      }

      if (nextIndex < campaigns.length) {
        setCurrentIndex(nextIndex);
        flashListRef.current?.scrollToIndex({
          index: nextIndex,
          animated: true,
        });
      }
    }, 5000);

    return () => clearInterval(timer);
  }, [currentIndex, campaigns.length, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const getSearchQueryResults = (query: string) => {
    if (!query) return;
    setSearching(true);
    searchAllTables(query)
      .then((data) => {
        setSearchData(query, data);
        router.push("/(app)/(auth)/(modal)/SearchResultModal");
      })
      .catch((error) => {
        setStoreError(error);
        console.error(error);
      })
      .finally(() => setSearching(false));
  };

  const LoadingModal: React.FC = () => {
    return (
      <Modal transparent visible={searching} statusBarTranslucent={true}>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.5)",
            gap: 15,
          }}
        >
          <ActivityIndicator size={"large"} color={themeColors.primary} />
          <Text style={{ fontFamily: fonts.OpenSansBold, fontSize: 20 }}>
            searching...
          </Text>
        </View>
      </Modal>
    );
  };

  const [keywordLoading, setKeywordLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (!searchQuery) {
      setResults([]);
      return;
    }

    setKeywordLoading(true);

    const unsubscribe = setTimeout(() => {
      searchAllTables(searchQuery)
        .then((data) => {
          setResults(data);
        })
        .catch((error) => {
          console.error(error);
        })
        .finally(() => setKeywordLoading(false));
    }, 500);

    return () => clearTimeout(unsubscribe);
  }, [searchQuery]);

  return (
    <>
      <HomeHeader />
      <View style={[styles.container, { paddingTop: 0 }]}>
        <ScrollView
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
          className="flex-1"
        >
          <Text style={styles.greeting}>
            Hi, {userData?.first_name} {userData?.last_name}
          </Text>

          <View style={{ position: "relative" }}>
            <SearchBar
              placeholder={"Search hospital, pharmacy, labs..."}
              showBtn
              onFocus={() => setShowDropdown(true)}
              value={searchQuery}
              onChangeText={(text: string) => setSearchQuery(text)}
              handleSearch={() => getSearchQueryResults(searchQuery)}
            />
            {results && searchQuery && showDropdown && (
              <View
                style={{
                  flexDirection: "row",
                  position: "absolute",
                  width: Dimensions.get("window").width - 40,
                  height: Dimensions.get("window").height / 2.5,
                  top: 40,
                  marginTop: 10,
                  zIndex: 1000,
                }}
              >
                <View
                  style={{
                    borderRadius: 10,
                    padding: 10,
                    borderTopLeftRadius: 0,
                    borderTopRightRadius: 0,
                    flex: 1,
                    backgroundColor: themeColors.white,
                    elevation: 2,
                  }}
                >
                  {keywordLoading ? (
                    <ActivityIndicator
                      size={"large"}
                      color={themeColors.primary}
                    />
                  ) : (
                    <>
                      <Text style={{ color: "gray", marginBottom: 8 }}>Results</Text>
                      <ScrollView showsVerticalScrollIndicator={false}>
                        {results.map((item, index) => (
                          <TouchableOpacity
                            key={index.toString()}
                            onPress={() => {
                              setShowDropdown(false);
                              setSearchData(searchQuery, results);
                              router.push({
                                pathname: "/(app)/(auth)/(modal)/SearchResultModal",
                                params: { category: item.table }
                              });
                            }}
                            style={{ paddingVertical: 10 }}
                          >
                            <Text style={{ color: "black", padding: 10, fontSize: 16 }}>
                              {searchQuery} in{" "}
                              <Text
                                style={{
                                  color: "gray",
                                  textDecorationStyle: "dashed",
                                  textDecorationLine: "underline",
                                  fontWeight: "600",
                                }}
                              >
                                {tableNameMapping[item.table]}
                              </Text>
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </>
                  )}
                </View>
              </View>
            )}
          </View>

          <CategoryList />
          
          {/* Campaign Box Carousel */}
          <View style={{ marginVertical: 16, minHeight: 200 }}>
            {!loadingCampaigns && campaigns.length > 0 ? (
              <FlashList
                ref={flashListRef}
                data={campaigns}
                horizontal
                pagingEnabled
                // @ts-ignore
                estimatedItemSize={availableWidth || 400}
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={(e: NativeSyntheticEvent<NativeScrollEvent>) => {
                  const index = Math.round(e.nativeEvent.contentOffset.x / availableWidth);
                  setCurrentIndex(index);
                }}
                keyExtractor={(item: MarketingCampaign) => item.id}
                renderItem={({ item }: { item: MarketingCampaign }) => (
                  <View style={{ width: availableWidth }}>
                    <CampaignBox campaign={item} />
                  </View>
                )}
              />
            ) : null}
          </View>
          <TopRated />
        </ScrollView>
      </View>
      {searching && <LoadingModal />}
      </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themeColors.lightGray,
    paddingHorizontal: 20,
  },
  greeting: {
    color: themeColors.darkGray,
    fontSize: size.lg,
    fontFamily: fonts.OpenSansBold,
    textTransform: "capitalize",
    textAlign: "center",
    paddingTop: 7,
  },
});

export default HomeScreen;
