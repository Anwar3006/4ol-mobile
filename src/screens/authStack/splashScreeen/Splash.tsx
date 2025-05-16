import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Image,
} from 'react-native';
import AppIntroSlider from 'react-native-app-intro-slider';
import LinearGradient from 'react-native-linear-gradient';
import {themeColors} from '../../../theme/colors';
import {size} from '../../../theme/fontStyle';
import {SCREENS} from '../../../constants/screens';
import {fonts} from '../../../theme/fonts';
import CustomButton from '../../../components/common/CustomButton';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import {NavigationStackParams} from '../../../interfaces';

type Slide = {
  key: string;
  title: string;
  description: string;
  image: any; // Replace `any` with a more specific type if needed
  bg: string;
};

type SplashScreenProps = {
  navigation: any; // Replace `any` with your specific navigation type if available
};

const slides: Slide[] = [
  {
    key: '1',
    title: 'Let’s find Hospitals near you',
    description:
      'Easily locate hospitals around your area with just a few taps. Get detailed information about hospital services, ratings, and contact details to help you make an informed decision.',
    image: require('../../../../assets/images/HospitalBuilding.jpg'),
    bg: '#95D6FE',
  },
  {
    key: '2',
    title: 'Let’s find Pharmacies near you',
    description:
      'Quickly find pharmacies close to your location. Check for availability of specific medicines, store hours, and get directions for easy access to the medications you need.',
    image: require('../../../../assets/images/Pharmacy1.png'),
    bg: '#70ACD1',
  },
  {
    key: '3',
    title: 'Learn about conditions/ diseases and their symptoms',
    description:
      'Get information about various conditions and their symptoms. Stay informed with comprehensive details on diagnosis, treatment options, and preventive measures to manage your health better.',
    image: require('../../../../assets/images/Symptoms.png'),
    bg: '#5D86C4',
  },
  {
    key: '4',
    title: 'Know your cycle',
    description:
      'Stay Ahead of Your Period and understand the stages of your pregnancy.',
    image: require('../../../../assets/images/PeriodTracker.jpg'),
    bg: '#F6DCCF',
  },
];

const SplashScreen = () => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const sliderRef = useRef<AppIntroSlider>(null);
  const autoSlideInterval = 2000; // Time in milliseconds
  const navigation = useNavigation<NavigationProp<NavigationStackParams>>();

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

  const renderSlide = ({item, index}: {item: Slide; index: number}) => (
    <View style={styles.slide}>
      {currentIndex !== slides.length - 1 && (
        <View style={styles.skipContainer}>
          <TouchableOpacity onPress={onDone}>
            <Text style={styles.skipButton}>Skip</Text>
          </TouchableOpacity>
        </View>
      )}
      <View style={styles.imageContainer}>
        <Image
          source={item.image}
          style={[
            styles.image,
            {backgroundColor: item.bg},
            (index === 2 || index === 0) && {resizeMode: 'cover'},
            index === 3 && {resizeMode: 'stretch'},
          ]}
        />
      </View>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.description}>{item.description}</Text>
    </View>
  );

  const onDone = () => {
    navigation.navigate('GetStarted');
  };

  const handleSlideChange = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <LinearGradient
      colors={[themeColors.primaryLight, themeColors.primary]}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 0}}
      style={{flex: 1}}>
      <StatusBar hidden={true} />
      <View style={{flex: 1, paddingHorizontal: 20}}>
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

      <View style={styles.getStartedContainer}>
        <CustomButton text={'Get Started'} onPress={onDone} isTransparent />
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipContainer: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1,
  },
  skipButton: {
    fontSize: size.md,
    color: themeColors.white,
    fontFamily: fonts.QuincyCFBold,
  },
  title: {
    fontSize: size.xlg,
    textAlign: 'center',
    marginBottom: 10,
    marginTop: 20,
    color: themeColors.white,
    fontFamily: fonts.QuincyCFBold,
  },
  imageContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  image: {
    width: 220,
    height: 220,
    borderRadius: 110,
    resizeMode: 'contain',
    backgroundColor: '#5D86C4',
  },
  description: {
    fontSize: size.sl,
    textAlign: 'center',
    color: themeColors.white,
    marginTop: 20,
    fontFamily: fonts.OpenSansRegular,
  },
  dot: {
    backgroundColor: 'gray',
  },
  activeDot: {
    backgroundColor: themeColors.white,
  },
  getStartedContainer: {
    alignSelf: 'center',
    width: '90%',
    flex: 0.2,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  getStartedButton: {
    width: '100%',
    backgroundColor: themeColors.white,
    paddingVertical: 10,
    paddingHorizontal: 40,
    borderRadius: 10,
    alignSelf: 'center',
  },
  getStartedButtonText: {
    color: themeColors.primary,
    fontSize: size.md,
    textAlign: 'center',
    fontFamily: fonts.QuincyCFBold,
  },
});

export default SplashScreen;
