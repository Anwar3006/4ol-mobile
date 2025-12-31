import React, {useEffect, useState, useRef} from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
  Platform,
} from 'react-native';
import {themeColors} from '../../../theme/colors';
import {fonts} from '../../../theme/fonts';
import Carousel from 'react-native-reanimated-carousel';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  getAllBannerAds,
  getBannerAds,
} from '../../../services/adverissementBanner';
import {
  horizontalScale,
  verticalScale,
  moderateScale,
} from '../../../utils/metrics';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

// Responsive sizing
const CONTAINER_PADDING = horizontalScale(8);
const AD_WIDTH = SCREEN_WIDTH - CONTAINER_PADDING * 2;
const AD_HEIGHT = SCREEN_HEIGHT > 700 ? verticalScale(180) : verticalScale(160);

const Advertisement: React.FC = () => {
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef<any>(null);

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const fetchedAds = await getBannerAds();
        setAds(fetchedAds || []);
      } catch (error) {
        console.error('Error fetching ads:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAds();
  }, []);

  const handleCTA = (url: string) => {
    if (url) {
      Linking.openURL(url).catch(err =>
        console.error('Failed to open URL:', err),
      );
    }
  };

  // Loading State
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingCard}>
          <ActivityIndicator size="large" color={themeColors.primary} />
          <Text style={styles.loadingText}>Loading offers...</Text>
        </View>
      </View>
    );
  }

  // Empty State
  if (ads.length === 0) return null;

  return (
    <View style={styles.wrapper}>
      <Carousel
        ref={carouselRef}
        data={ads}
        width={AD_WIDTH}
        height={AD_HEIGHT}
        // autoPlay
        autoPlayInterval={6000}
        scrollAnimationDuration={800}
        onSnapToItem={index => setCurrentIndex(index)}
        loop
        mode="parallax"
        modeConfig={{
          parallaxScrollingScale: 0.94,
          parallaxScrollingOffset: 50,
        }}
        renderItem={({item}) => <AdCard ad={item} onPress={handleCTA} />}
      />
    </View>
  );
};

// Separate AdCard component
const AdCard: React.FC<{ad: any; onPress: (url: string) => void}> = ({
  ad,
  onPress,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
      friction: 8,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 8,
    }).start();
  };

  return (
    <Animated.View style={{transform: [{scale: scaleAnim}]}}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => onPress(ad.mediaUrls)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.cardContainer}>
        {/* Rich Gradient Background */}
        <LinearGradient
          colors={['#158b6dff', '#45ae5aff', '#B82555']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.gradient}>
          {/* Main Content Row */}
          <View style={styles.contentRow}>
            {/* Left Column: Text + CTA */}
            <View style={styles.leftColumn}>
              {/* Sponsor Badge */}
              <View style={styles.sponsorBadge}>
                <Text style={styles.sponsorText}>Sponsored</Text>
              </View>

              {/* Headline - Large and Bold */}
              <Text style={styles.headline} numberOfLines={3}>
                {ad.headline}
              </Text>

              {/* Description */}
              {ad.description && (
                <Text style={styles.description} numberOfLines={3}>
                  {ad.description}
                </Text>
              )}

              {/* CTA Button - Prominent and Clear */}
              <TouchableOpacity
                style={styles.ctaButton}
                activeOpacity={0.9}
                onPress={() => onPress(ad.mediaUrls)}>
                <Text style={styles.ctaText}>
                  {ad.callToAction || 'Order Now'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Right Column: Product Image */}
            <View style={styles.rightColumn}>
              <View style={styles.imageWrapper}>
                <Image
                  source={
                    ad.imageUrls
                      ? {uri: ad.imageUrls}
                      : require('../../../../assets/medicines.jpeg')
                  }
                  style={styles.productImage}
                  resizeMode="cover"
                />
              </View>
            </View>
          </View>

          {/* Subtle decorative elements */}
          <View style={styles.decorativeCircle1} />
          <View style={styles.decorativeCircle2} />
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  // Main Wrapper
  wrapper: {
    width: '100%',
    alignItems: 'center',
    marginVertical: verticalScale(16),
  },

  // Loading State
  loadingContainer: {
    width: '100%',
    paddingHorizontal: CONTAINER_PADDING,
    marginVertical: verticalScale(16),
  },
  loadingCard: {
    height: AD_HEIGHT,
    backgroundColor: '#ffffff',
    borderRadius: moderateScale(20),
    justifyContent: 'center',
    alignItems: 'center',
    gap: verticalScale(12),
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  loadingText: {
    color: '#6b7280',
    fontSize: moderateScale(14),
    fontFamily: fonts.OpenSansMedium,
  },

  // Card Container
  cardContainer: {
    width: AD_WIDTH,
    height: AD_HEIGHT,
    borderRadius: moderateScale(20),
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 10},
        shadowOpacity: 0.25,
        shadowRadius: 20,
      },
      android: {
        elevation: 15,
      },
    }),
  },

  // Gradient Background
  gradient: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },

  // Main Content Row
  contentRow: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: moderateScale(24),
    paddingVertical: moderateScale(20),
    zIndex: 2,
  },

  // Left Column (Text Content)
  leftColumn: {
    flex: 1.0,
    justifyContent: 'space-between',
    paddingRight: moderateScale(12),
  },

  // Sponsor Badge
  sponsorBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: horizontalScale(12),
    paddingVertical: verticalScale(5),
    borderRadius: moderateScale(6),
    marginBottom: verticalScale(5),
  },
  sponsorText: {
    color: '#ffffff',
    fontSize: moderateScale(10),
    fontFamily: fonts.OpenSansBold,
    textTransform: 'capitalize',
    letterSpacing: 0.5,
  },

  // Headline - Make it POP
  headline: {
    color: '#ffffff',
    fontSize: moderateScale(18),
    fontFamily: fonts.QuincyCFBold,
    lineHeight: moderateScale(20),
    marginBottom: verticalScale(2),
  },

  // Description
  description: {
    color: 'rgba(255, 255, 255, 0.95)',
    fontSize: moderateScale(13),
    fontFamily: fonts.OpenSansRegular,
    lineHeight: moderateScale(19),
    marginBottom: verticalScale(5),
  },

  // CTA Button - Prominent Like Tim Hortons
  ctaButton: {
    backgroundColor: '#ffffff',
    paddingVertical: verticalScale(8),
    paddingHorizontal: horizontalScale(24),
    borderRadius: moderateScale(20),
    alignSelf: 'flex-start',
    minWidth: horizontalScale(70),
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  ctaText: {
    color: '#8B1538',
    fontSize: moderateScale(15),
    fontFamily: fonts.OpenSansBold,
    letterSpacing: 0.1,
  },

  // Right Column (Product Image)
  rightColumn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageWrapper: {
    width: '100%',
    height: '90%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productImage: {
    width: '100%',
    height: '100%',
    borderRadius: moderateScale(12),
  },

  // Decorative Elements
  decorativeCircle1: {
    position: 'absolute',
    top: -50,
    right: -30,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    zIndex: 1,
  },
  decorativeCircle2: {
    position: 'absolute',
    bottom: -60,
    left: -40,
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    zIndex: 1,
  },
});

export default Advertisement;
