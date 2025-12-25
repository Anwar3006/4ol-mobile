import React, {useEffect, useState, useLayoutEffect} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Modal,
  Linking,
  RefreshControl,
  Platform,
  Alert,
  Dimensions,
} from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import Icon from 'react-native-vector-icons/FontAwesome5';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {themeColors} from '../theme/colors';
import {fonts} from '../theme/fonts';
import {size} from '../theme/fontStyle';
import {getFacilityDetailsById} from '../services/facility';
import {Share} from 'react-native';
import {useSelector} from 'react-redux';
import {user} from '../store/selectors';
import {toggleFacilityFavorite, checkFavoriteStatus} from '../services/profile';
import {
  addFavoriteFacility,
  getFacilityRatingReview,
} from '../services/favoriteFacilites';
import {parsePhoneNumbers} from '../utils/helpers';
import {logActivity} from '../services/activityLogsService';
import FacilityRating from '../components/FacilityRating';
import {moderateScale, verticalScale} from '../utils/metrics';
import AsyncStorage from '@react-native-async-storage/async-storage';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

const FacilityDetails = ({navigation, route}: any) => {
  const insets = useSafeAreaInsets(); // ✅ Fix for Android navigation bar
  const userData: any = useSelector(user);
  const {id, setFavorites, favorites} = route?.params || {};

  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [facilityDetails, setFacilityDetails] = useState<any>();
  const [isFavorited, setIsFavorited] = useState(false);
  const [reviewData, setReviewData] = useState([]);
  const [userReview, setUserReview] = useState();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [actionType, setActionType] = useState<'call' | 'whatsapp' | null>(
    null,
  );
  const [distance, setDistance] = useState('2.3 km'); // Mock data
  const [duration, setDuration] = useState('8 mins'); // Mock data

  const currentDay = new Date().toLocaleDateString('en-US', {weekday: 'long'});

  useEffect(() => {
    if (id) {
      getFacilityDetailsById(
        id,
        () => setLoading(true),
        (successData: any) => {
          setFacilityDetails(successData);
          setLoading(false);
        },
        () => setLoading(false),
      );
    }
  }, [id]);

  useEffect(() => {
    favorites?.find((f: any) => f?.facility.id == id)
      ? setIsFavorited(true)
      : setIsFavorited(false);
  }, [favorites, id]);

  const handleToggleFavorite = async () => {
    setIsFavorited(!isFavorited);
    await addFavoriteFacility(id);
    toggleFacilityFavorite(
      userData?.id,
      id,
      () => {},
      () => {},
      () => {},
    );
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out ${facilityDetails?.facility_name}\n\nAddress: ${
          facilityDetails?.gps_address || facilityDetails?.location
        }`,
      });
    } catch (error) {
      console.log('Error sharing:', error);
    }
  };

  const openInMaps = () => {
    const destination = `${facilityDetails?.latitude},${facilityDetails?.longitude}`;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
    Linking.openURL(url);
  };

  const handleContact = () => {
    setIsModalVisible(true);
  };

  const dialNumber = (number: string) => {
    Linking.openURL(`tel:${number}`);
  };
  const WEEK_DAYS = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday',
  ] as const;

  const StarRating = ({rating}: {rating: number}) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <View style={styles.starContainer}>
        {Array(fullStars)
          .fill(0)
          .map((_, i) => (
            <FontAwesome
              key={`full-${i}`}
              name="star"
              size={14}
              color="#FFA500"
            />
          ))}
        {hasHalfStar && (
          <FontAwesome name="star-half-full" size={14} color="#FFA500" />
        )}
        {Array(emptyStars)
          .fill(0)
          .map((_, i) => (
            <FontAwesome
              key={`empty-${i}`}
              name="star-o"
              size={14}
              color="#FFA500"
            />
          ))}
      </View>
    );
  };

  const InfoCard = ({icon, label, value, color = themeColors.primary}: any) => (
    <View style={styles.infoCard}>
      <View style={[styles.infoIconBox, {backgroundColor: `${color}15`}]}>
        <MaterialIcon name={icon} size={20} color={color} />
      </View>
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );

  const SectionCard = ({
    title,
    icon,
    children,
    color = themeColors.primary,
  }: any) => (
    <View style={styles.sectionCard}>
      <View style={styles.sectionHeader}>
        <View style={[styles.sectionIconBox, {backgroundColor: `${color}15`}]}>
          <MaterialIcon name={icon} size={22} color={color} />
        </View>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <View style={styles.sectionContent}>{children}</View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator color={themeColors.primary} size="large" />
      </View>
    );
  }

  console.log('Disease: ', facilityDetails);
  const images = facilityDetails?.mediaUrls?.length
    ? facilityDetails.mediaUrls
    : [require('../../assets/healthCareCenter.jpeg')];

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {paddingBottom: 80 + insets.bottom}, // ✅ Fix for Android nav bar
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refresh}
            onRefresh={() => setRefresh(!refresh)}
          />
        }>
        {/* Hero Image Carousel */}
        <View style={styles.carouselContainer}>
          <Carousel
            width={SCREEN_WIDTH}
            height={280}
            data={images}
            renderItem={({item}) => (
              <Image
                source={typeof item === 'string' ? {uri: item} : item}
                style={styles.carouselImage}
              />
            )}
            onSnapToItem={setCurrentIndex}
          />

          {/* Favorite Button */}
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={handleToggleFavorite}>
            <MaterialIcon
              name={isFavorited ? 'heart' : 'heart-outline'}
              size={28}
              color={isFavorited ? '#ff4444' : '#fff'}
            />
          </TouchableOpacity>

          {/* Rating Badge */}
          <View style={styles.ratingBadge}>
            <FontAwesome name="star" size={16} color="#FFA500" />
            <Text style={styles.ratingText}>
              {facilityDetails?.avg_rating || '5.0'}
            </Text>
          </View>

          {/* Pagination Dots */}
          <View style={styles.paginationDots}>
            {images.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  {
                    backgroundColor:
                      index === currentIndex ? '#fff' : 'rgba(255,255,255,0.4)',
                  },
                ]}
              />
            ))}
          </View>
        </View>

        {/* Main Content */}
        <View style={styles.contentContainer}>
          {/* Facility Name & Basic Info */}
          <View style={styles.headerCard}>
            <Text style={styles.facilityName}>
              {facilityDetails?.facility_name}
            </Text>
            <Text style={styles.infoLabel}>
              {facilityDetails?.facility_type}
            </Text>
          </View>

          {/* Quick Info Cards */}
          <View style={styles.quickInfoContainer}>
            <View style={styles.quickInfoItem}>
              <InfoCard
                icon="hospital-building"
                label="NHIS Status"
                value={
                  facilityDetails?.hospital_services?.find((s: string) =>
                    s.includes('NHIS'),
                  )
                    ? 'Accredited'
                    : 'Not Accredited'
                }
                color="#10b981"
              />
            </View>

            <View style={styles.quickInfoItem}>
              <InfoCard
                icon="map-marker"
                label="Address"
                value={facilityDetails?.gps_address || 'N/A'}
                color={themeColors.darkBlue}
              />
            </View>
          </View>

          {/* Distance & Duration */}
          <View style={styles.distanceCard}>
            <View style={styles.distanceItem}>
              <MaterialIcon name="road" size={24} color={themeColors.primary} />
              <Text style={styles.distanceText}>{distance}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.distanceItem}>
              <MaterialIcon name="car" size={24} color={themeColors.primary} />
              <Text style={styles.distanceText}>{duration}</Text>
            </View>
          </View>

          {/* Amenities Section */}
          {facilityDetails?.hospital_amenities?.length > 0 && (
            <SectionCard
              title="Amenities"
              icon="medical-bag"
              color={themeColors.darkBlue}>
              <View style={styles.tagsContainer}>
                {facilityDetails.hospital_amenities.map(
                  (service: string, index: number) => (
                    <View key={index} style={styles.tag}>
                      <Text style={styles.tagText}>{service}</Text>
                    </View>
                  ),
                )}
              </View>
            </SectionCard>
          )}

          {/* Services Section */}
          {facilityDetails?.hospital_services?.length > 0 && (
            <SectionCard
              title="Services"
              icon="account-wrench"
              color={themeColors.primary}>
              <View style={styles.tagsContainer}>
                {facilityDetails.hospital_services.map(
                  (service: string, index: number) => (
                    <View key={index} style={styles.tag}>
                      <Text style={styles.tagText}>{service}</Text>
                    </View>
                  ),
                )}
              </View>
            </SectionCard>
          )}

          {/* Working Hours */}
          {facilityDetails?.business_hours && (
            <SectionCard
              title="Working Hours"
              icon="clock-outline"
              color={themeColors.primary}>
              {WEEK_DAYS.map(day => {
                const hours = facilityDetails.business_hours[day];

                return (
                  <View
                    key={day}
                    style={[
                      styles.hourRow,
                      day === currentDay && styles.currentDayRow,
                    ]}>
                    <Text
                      style={[
                        styles.dayText,
                        day === currentDay && styles.currentDayText,
                      ]}>
                      {day.charAt(0).toUpperCase() + day.slice(1)}
                    </Text>

                    <Text
                      style={[
                        styles.hourText,
                        day === currentDay && styles.currentHourText,
                      ]}>
                      {hours ? `${hours.opening} – ${hours.closing}` : 'Closed'}
                    </Text>
                  </View>
                );
              })}
            </SectionCard>
          )}

          {/* Reviews Section */}
          <SectionCard
            title="Reviews"
            icon="comment-text-multiple"
            color={themeColors.black}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.reviewsScroll}>
              {reviewData.length > 0 ? (
                reviewData.map((review: any, index) => (
                  <View key={index} style={styles.reviewCard}>
                    <View style={styles.reviewHeader}>
                      <Image
                        source={{uri: review?.user_profiles?.avatar_url}}
                        style={styles.reviewAvatar}
                      />
                      <View style={styles.reviewUserInfo}>
                        <Text style={styles.reviewUserName}>
                          {review?.user_profiles?.first_name}{' '}
                          {review?.user_profiles?.last_name}
                        </Text>
                        <StarRating rating={review?.rating || 0} />
                      </View>
                    </View>
                    <Text style={styles.reviewComment}>
                      "{review?.comment}"
                    </Text>
                  </View>
                ))
              ) : (
                <Text style={styles.noReviewsText}>No reviews yet</Text>
              )}
            </ScrollView>
          </SectionCard>
        </View>
      </ScrollView>

      {/* Fixed Bottom Actions - ✅ Fixed for Android */}
      <View
        style={[
          styles.bottomActions,
          {paddingBottom: Math.max(insets.bottom, 10)}, // ✅ Respects Android nav bar
        ]}>
        <TouchableOpacity style={styles.actionButton} onPress={handleContact}>
          <MaterialIcon name="phone" size={22} color="#fff" />
          <Text style={styles.actionText}>Contact</Text>
        </TouchableOpacity>

        <View style={styles.actionDivider} />

        <TouchableOpacity style={styles.actionButton} onPress={openInMaps}>
          <MaterialIcon name="directions" size={22} color="#fff" />
          <Text style={styles.actionText}>Direction</Text>
        </TouchableOpacity>

        <View style={styles.actionDivider} />

        <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
          <MaterialIcon name="share-variant" size={22} color="#fff" />
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>
      </View>

      {/* Contact Modal */}
      <Modal
        transparent
        visible={isModalVisible}
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Contact Facility</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                setIsModalVisible(false);
                dialNumber(facilityDetails?.contact_num || '');
              }}>
              <MaterialIcon
                name="phone"
                size={24}
                color={themeColors.primary}
              />
              <Text style={styles.modalButtonText}>Call</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, {marginTop: 10}]}
              onPress={() => setIsModalVisible(false)}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themeColors.lightGray,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    flexGrow: 1,
  },
  carouselContainer: {
    position: 'relative',
    width: SCREEN_WIDTH,
    height: 280,
  },
  carouselImage: {
    width: SCREEN_WIDTH,
    height: 280,
    resizeMode: 'cover',
  },
  favoriteButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    backdropFilter: 'blur(10px)',
  },
  ratingBadge: {
    position: 'absolute',
    top: 15,
    left: 15,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  ratingText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: fonts.OpenSansBold,
  },
  paginationDots: {
    position: 'absolute',
    bottom: 15,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  contentContainer: {
    padding: 20,
  },
  headerCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {elevation: 4},
    }),
  },
  facilityName: {
    fontSize: 24,
    fontFamily: fonts.OpenSansBold,
    color: '#1E293B',
    marginBottom: 8,
  },
  ownershipBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  ownershipText: {
    fontSize: 12,
    fontFamily: fonts.OpenSansMedium,
    color: '#0369A1',
  },
  quickInfoContainer: {
    flexWrap: 'wrap',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  quickInfoItem: {
    width: '48%', // two columns
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 1},
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {elevation: 2},
    }),
  },
  infoIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    fontFamily: fonts.OpenSansRegular,
    color: '#64748B',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    fontFamily: fonts.OpenSansMedium,
    color: '#1E293B',
  },
  distanceCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'space-around',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 1},
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {elevation: 2},
    }),
  },
  distanceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  distanceText: {
    fontSize: 16,
    fontFamily: fonts.OpenSansMedium,
    color: '#1E293B',
  },
  divider: {
    width: 1,
    height: 30,
    backgroundColor: '#E2E8F0',
  },
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.08,
        shadowRadius: 6,
      },
      android: {elevation: 3},
    }),
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: fonts.OpenSansBold,
    color: '#1E293B',
  },
  sectionContent: {},
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 13,
    fontFamily: fonts.OpenSansRegular,
    color: '#475569',
  },
  hourRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  currentDayRow: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    borderRadius: 8,
    borderBottomWidth: 0,
  },
  dayText: {
    fontSize: 14,
    fontFamily: fonts.OpenSansRegular,
    color: '#64748B',
  },
  currentDayText: {
    fontFamily: fonts.OpenSansBold,
    color: '#92400E',
  },
  hourText: {
    fontSize: 14,
    fontFamily: fonts.OpenSansRegular,
    color: '#475569',
  },
  currentHourText: {
    fontFamily: fonts.OpenSansBold,
    color: '#92400E',
  },
  reviewsScroll: {
    gap: 12,
  },
  reviewCard: {
    width: SCREEN_WIDTH - 100,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  reviewAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  reviewUserInfo: {
    flex: 1,
  },
  reviewUserName: {
    fontSize: 15,
    fontFamily: fonts.OpenSansMedium,
    color: '#1E293B',
    marginBottom: 4,
  },
  starContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewComment: {
    fontSize: 14,
    fontFamily: fonts.OpenSansRegular,
    color: '#475569',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  noReviewsText: {
    fontSize: 14,
    fontFamily: fonts.OpenSansRegular,
    color: '#94A3B8',
    textAlign: 'center',
  },
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: themeColors.primary,
    paddingTop: 12,
    paddingHorizontal: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: -4},
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {elevation: 8},
    }),
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontSize: 13,
    fontFamily: fonts.OpenSansMedium,
    color: '#fff',
  },
  actionDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: fonts.OpenSansBold,
    color: '#1E293B',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 10,
  },
  modalButtonText: {
    fontSize: 16,
    fontFamily: fonts.OpenSansMedium,
    color: themeColors.primary,
  },
  modalCancelText: {
    fontSize: 16,
    fontFamily: fonts.OpenSansMedium,
    color: '#64748B',
    textAlign: 'center',
  },
});

export default FacilityDetails;
