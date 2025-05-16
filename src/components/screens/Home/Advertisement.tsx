import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {themeColors} from '../../../theme/colors';
import {size} from '../../../theme/fontStyle';
import {fonts} from '../../../theme/fonts';
import Carousel from 'react-native-reanimated-carousel';
import {getBannerAds} from '../../../services/adverissementBanner';
import {horizontalScale, verticalScale} from '../../../utils/metrics';
import moment from 'moment';

const Advertisement: React.FC = () => {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const width = Dimensions.get('window').width;

  useEffect(() => {
    const fetchAds = async () => {
      const fetchedAds = await getBannerAds();
      setAds(fetchedAds);
      console.log('ADS ===>', ads);
      setLoading(false);
    };
    fetchAds();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" color={themeColors.primary} />;
  }

  if (ads.length === 0) {
    return <Text style={styles.noAds}>No Ads available</Text>;
  }

  const handleCTA = (mediaUrl: any) => {
    Linking.openURL(mediaUrl).catch(error =>
      console.error('Failed to open Url', error),
    );
  };

  return (
    <Carousel
      data={ads}
      width={width * 0.9}
      loop
      autoPlay
      autoPlayInterval={ads[0]?.duration || 3000}
      height={verticalScale(185)}
      scrollAnimationDuration={800}
      renderItem={({item}) => (
        <View style={styles.container}>
          <View style={styles.info}>
            <Text style={styles.title} numberOfLines={2} ellipsizeMode="tail">
              {item.headline}
            </Text>
            <Text style={styles.desc} numberOfLines={3} ellipsizeMode="tail">
              {item.description}
            </Text>
            <TouchableOpacity onPress={() => handleCTA(item.mediaUrl)}>
              <Text style={styles.orderBtn}>{item.callToAction}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.imageContainer}>
            <Image
              source={
                item.imageUrl
                  ? {uri: item.imageUrl}
                  : require('../../../../assets/medicines.jpeg')
              }
              style={styles.image}
            />
          </View>
        </View>
      )}
    />
  );
};

export default Advertisement;

const styles = StyleSheet.create({
  container: {
    backgroundColor: themeColors.primary,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between', // Distribute space between text and image
    alignItems: 'center', // Vertically center all content
    padding: 15,
    marginBottom: 10,
    minHeight: verticalScale(160), // Use minHeight instead of fixed height
    width: '95%',
    alignSelf: 'center', // Center the card horizontally
    overflow: 'hidden', // Ensure content stays within the card
  },
  info: {
    flex: 1, // Take available space
    marginRight: 10,
    justifyContent: 'center', // Vertically center content
  },
  title: {
    color: themeColors.white,
    fontSize: size.lg,
    fontFamily: fonts.QuincyCFMedium,
    marginBottom: 5,
    flexShrink: 1, // Allow text to shrink if needed // Add ellipsis if text overflows
  },
  desc: {
    color: themeColors.white,
    fontSize: size.s,
    fontFamily: fonts.OpenSansRegular,
    flexShrink: 1, // Allow text to shrink
  },
  orderBtn: {
    backgroundColor: themeColors.white,
    alignSelf: 'flex-start', // Align button to left
    marginTop: 5,
    fontSize: size.s,
    color: themeColors.black,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    fontFamily: fonts.OpenSansMedium,
    overflow: 'hidden', // Prevent overflow
  },
  imageContainer: {
    width: horizontalScale(120), // Fixed width for image container
    height: verticalScale(120), // Fixed height for image container
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  // video: {
  //   width: '100%',
  //   height: '100%',
  //   borderRadius: 8,
  // },
  noAds: {
    textAlign: 'center',
    fontSize: size.lg,
    color: themeColors.primary,
    marginVertical: 20,
  },
});
