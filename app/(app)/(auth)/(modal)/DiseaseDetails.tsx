import React from 'react';
import {
  View,
  Text,
  ScrollView,
  useWindowDimensions,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCondition } from '@/hooks/use-condition';
import { LexicalRenderer } from '@/components/LexicalRenderer';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Constants from "expo-constants";

const HEADER_HEIGHT = 350;

const DiseaseDetails = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { data: condition, isLoading } = useCondition({ id: id!, enabled: !!id });

  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  const headerImageAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(
            scrollY.value,
            [-HEADER_HEIGHT, 0, HEADER_HEIGHT],
            [-HEADER_HEIGHT / 2, 0, HEADER_HEIGHT * 0.75],
            Extrapolation.CLAMP
          ),
        },
        {
          scale: interpolate(
            scrollY.value,
            [-HEADER_HEIGHT, 0, HEADER_HEIGHT],
            [2, 1, 1],
            Extrapolation.CLAMP
          ),
        },
      ],
    };
  });

  const contentCardAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(
            scrollY.value,
            [0, HEADER_HEIGHT],
            [0, -50], // Adjust this for overlap preference
            Extrapolation.CLAMP
          ),
        },
      ],
    };
  });

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  if (!condition) return null;

     const getImageUrl = (img: string) => {
      const supabaseUrl = Constants.default?.expoConfig?.extra?.SUPABASE_URL;
      const supabaseBucketName = Constants.default?.expoConfig?.extra?.SUPABASE_BUCKET_NAME;
      return `${supabaseUrl}/storage/v1/object/public/${supabaseBucketName}/${img}`;
     }

    

  return (
    <View style={styles.container}>
      {/* Background Image - Parallax */}
      <Animated.View style={[styles.headerImageContainer, headerImageAnimatedStyle]}>
        <Image
          source={{ uri: getImageUrl(condition.image_url as string) }}
          style={styles.headerImage}
          contentFit="cover"
        />
        <View style={styles.imageOverlay} />
      </Animated.View>

      {/* Floating Header UI */}
      <View style={[styles.topActions, { top: insets.top + 10 }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-white/80 p-2 rounded-full backdrop-blur-md"
        >
          <Ionicons name="chevron-back" size={24} color="#0f172a" />
        </TouchableOpacity>
      </View>

      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: HEADER_HEIGHT - 40 }}
      >
        <Animated.View style={[styles.contentCard, contentCardAnimatedStyle]}>
          {/* Header Info */}
          <View className="mb-6">
            <Text className="text-3xl font-black text-slate-900 leading-tight">
              {condition.name}
            </Text>
            {condition.is_systemic && (
              <View className="bg-emerald-100 self-start px-3 py-1 rounded-full mt-2">
                <Text className="text-emerald-700 font-bold text-xs uppercase tracking-wider">
                  Systemic Condition
                </Text>
              </View>
            )}
          </View>

          {/* Sections */}
          <DetailSection title="About" state={condition.about} />
          <DetailSection title="Symptoms" state={condition.symptoms} />
          <DetailSection title="Diagnosis" state={condition.diagnosis} />
          <DetailSection title="Treatment" state={condition.treatment} />
          <DetailSection title="Prevention" state={condition.prevention} />

          {/* Causes */}
          {condition.causes && condition.causes.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Possible Causes</Text>
              {condition.causes.map((cause: any, idx: any) => (
                <View key={idx} className="mb-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <Text className="font-black text-slate-900 mb-2">{cause.cause_name}</Text>
                  <LexicalRenderer nodes={cause.other_possible_causes?.root?.children} />
                </View>
              ))}
            </View>
          )}

          {/* Types */}
          {condition.types && condition.types.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Variations & Types</Text>
              {condition.types.map((type: any, idx: any) => (
                <View key={idx} className="mb-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <Text className="font-black text-slate-900 mb-2">{type.type_name}</Text>
                  <LexicalRenderer nodes={type.about_type?.root?.children} />
                </View>
              ))}
            </View>
          )}

          <DetailSection title="When to see a doctor" state={condition.contact_your_doctor} />
          <DetailSection title="More Information" state={condition.more_information} />

          <View style={{ height: 100 }} />
        </Animated.View>
      </Animated.ScrollView>
    </View>
  );
};

const DetailSection = ({ title, state }: { title: string; state: any }) => {
  if (!state || !state.root || !state.root.children || state.root.children.length === 0) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <LexicalRenderer nodes={state.root.children} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerImageContainer: {
    position: 'absolute',
    width: '100%',
    height: HEADER_HEIGHT,
    top: 0,
    left: 0,
    zIndex: -1,
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  topActions: {
    position: 'absolute',
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  contentCard: {
    backgroundColor: 'white',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingHorizontal: 24,
    paddingTop: 32,
    minHeight: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0f172a',
    marginBottom: 12,
  },
});

export default DiseaseDetails;