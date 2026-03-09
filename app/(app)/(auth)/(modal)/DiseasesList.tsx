import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { themeColors } from '@/src/theme/colors';
import { getDiseaseListByType } from '@/src/services/diseases';
import { limit } from '@/config/variables';
import { Ionicons } from '@expo/vector-icons';

const DiseasesList = () => {
  const { listType } = useLocalSearchParams();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [diseases, setDiseases] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const loadDiseases = async (type: string) => {
    if (!hasMore && page !== 0) return;

    getDiseaseListByType(
      type,
      page * limit,
      () => setLoading(true),
      (successData: any) => {
        if (successData) {
          setDiseases((prev) => (page === 0 ? successData : [...prev, ...successData]));
          setHasMore(successData.length === limit);
          setPage((prev) => prev + 1);
        }
        setLoading(false);
      },
      (error: any) => {
        console.log('Error while fetching diseases list', error);
        setLoading(false);
      }
    );
  };

  useEffect(() => {
    if (listType) {
      loadDiseases(listType as string);
    }
  }, [listType]);

  const handleLoadMore = () => {
    if (!loading && hasMore && listType) {
      loadDiseases(listType as string);
    }
  };

  const renderFooter = () => {
    return hasMore && loading ? (
      <View className="py-4">
        <ActivityIndicator size="small" color={themeColors.primary} />
      </View>
    ) : null;
  };

  return (
    <View className={`flex-1 ${themeColors.lightGray} px-4 pt-4`}>
        {/* Header */}
      <View className="flex-row items-center mb-6">
        <TouchableOpacity 
           onPress={() => router.back()}
           className="mr-3"
        >
          <Ionicons name="arrow-back" size={24} color={themeColors.darkGray} />
        </TouchableOpacity>
        <View className="bg-pink-500 px-4 py-1.5 rounded-lg">
          <Text className="text-2xl font-bold text-white uppercase">{listType}</Text>
        </View>
        <View className="flex-1 h-[2px] bg-pink-500 ml-4" />
      </View>

      {loading && page === 0 ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator color={themeColors.primary} size={'large'} />
        </View>
      ) : diseases?.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <Text className="text-lg text-slate-400">No records found</Text>
        </View>
      ) : (
        <FlatList
          data={diseases}
          keyExtractor={(item) => item?.id?.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              className="py-4 border-b border-slate-200"
              onPress={() =>
                router.push({
                  pathname: "/(app)/(auth)/(modal)/DiseaseDetails",
                  params: { id: item?.id }
                })
              }
            >
              <Text className="text-lg font-bold text-slate-700">{item?.condition_name}</Text>
            </TouchableOpacity>
          )}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={renderFooter}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
};

export default DiseasesList;
