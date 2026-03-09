import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Image,
  Dimensions,
} from 'react-native';
import AppIntroSlider from 'react-native-app-intro-slider';
import {themeColors} from '../../../src/theme/colors';
import {size} from '../../../src/theme/fontStyle';
import {fonts} from '../../../src/theme/fonts';
import CustomButton from '../../../src/components/common/CustomButton';
import {useRouter} from 'expo-router';
import {verticalScale} from '../../../src/utils/metrics';

type Slide = {
  key: string;
  title: string;
  description: string;
  image: any;
  bg: string;
};

const slides: Slide[] = [
  {
    key: '1',
    title: 'Let’s find Hospitals near you',
    description:
      'Easily locate hospitals around your area with just a few taps. Get detailed information about hospital services, ratings, and contact details to help you make an informed decision.',
    image: require('../../../assets/images/plsscrn.png'),
    bg: '#95D6FE',
  },
  {
    key: '2',
    title: 'Let’s find Pharmacies near you',
    description:
      'Quickly find pharmacies close to your location. Check for availability of specific medicines, store hours, and get directions for easy access to the medications you need.',
    image: require('../../../assets/images/plsscrn2.png'),
    bg: '#70ACD1',
  },
  {
    key: '3',
    title: 'Learn about conditions/ diseases and their symptoms',
    description:
      'Get information about various conditions and their symptoms. Stay informed with comprehensive details on diagnosis, treatment options, and preventive measures to manage your health better.',
    image: require('../../../assets/images/plsscrn3.png'),
    bg: '#5D86C4',
  },
  {
    key: '4',
    title: 'Know your cycle',
    description:
      'Stay Ahead of Your Period and understand the stages of your pregnancy.',
    image: require('../../../assets/images/plsscrn4.png'),
    bg: '#F6DCCF',
  },
];

const SplashScreen = () => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const sliderRef = useRef<AppIntroSlider>(null);
  const autoSlideInterval = 5000;
  const router = useRouter();

  useEffect(() => {
    const autoSlide = setInterval(() => {
      setCurrentIndex(prevIndex => {
        if (prevIndex === slides.length - 1) {
          return 0;
        }
        return prevIndex + 1;
      });
    }, autoSlideInterval);

    return () => clearInterval(autoSlide);
  }, []);

  useEffect(() => {
    if (sliderRef.current) {
      sliderRef.current.goToSlide(currentIndex, true);
    }
  }, [currentIndex]);

  const renderSlide = ({item}: {item: Slide}) => (
    <View style={styles.slide}>
      <View style={styles.imageContainer}>
        <Image
          source={item.image}
          style={[
            styles.image,
            {backgroundColor: item.bg},
          ]}
          resizeMode="cover"
        />
      </View>
    </View>
  );

  const onDone = () => {
    router.replace('/(app)/(public)/GetStarted');
  };

  const handleSlideChange = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <View style={{flex: 1, backgroundColor: '#fff'}}>
      <StatusBar hidden={true} />
      <View style={{flex: 1}}>
        <AppIntroSlider
          ref={sliderRef}
          renderItem={renderSlide}
          data={slides}
          onDone={onDone}
          showSkipButton={false}
          dotStyle={styles.dot}
          activeDotStyle={styles.activeDot}
          showNextButton={false}
          onSlideChange={handleSlideChange}
          showDoneButton={false}
        />
      </View>

      <View
        style={[
          styles.getStartedContainer,
          {paddingBottom: verticalScale(25)},
        ]}>
        <CustomButton text={'Get Started'} onPress={onDone} isTransparent />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  slide: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  dot: {
    backgroundColor: 'gray',
  },
  activeDot: {
    backgroundColor: themeColors.primary,
  },
  getStartedContainer: {
    alignSelf: 'center',
    width: '90%',
    flex: 0.2,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SplashScreen;
