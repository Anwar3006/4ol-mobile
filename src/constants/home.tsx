import {Image, useWindowDimensions} from 'react-native';
import {CategoryItem, TopRatedItem} from '../interfaces';
import Icon from 'react-native-vector-icons/FontAwesome5';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import IoniIcon from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import FontistoIcon from 'react-native-vector-icons/Fontisto';
import {themeColors} from '../theme/colors';
import {SCREENS} from './screens';
import {horizontalScale, verticalScale} from '../utils/metrics';

// import {width} from '../theme/fontStyle'

// Inside your component where you use categories
// const {getScaledValue} = useResponsive();

export const topRatedItems: TopRatedItem[] = [
  {id: '1', name: 'Apollo Hospital', ratings: 4.6, distance: '5.0 km'},
  {id: '2', name: 'Narayana Hospital', ratings: 4.0, distance: '2.2 km'},
  {id: '3', name: 'Zydus Hospital', ratings: 3.2, distance: '5.6 km'},
  {id: '4', name: 'Aarna Hospital', ratings: 2.5, distance: '8 km'},
  {id: '5', name: 'Narayana Hospital', ratings: 4.0, distance: '2.2 km'},
  {id: '6', name: 'Apollo Hospital', ratings: 4.6, distance: '5.0 km'},
];

export const categories: CategoryItem[] = [
  {
    id: '1',
    icon: <Icon name="hospital" size={30} color={themeColors.lightPink} />,
    title: 'Hospital',
    screen: 'TopRated',
  },
  {
    id: '2',
    icon: (
      <Image
        source={require('../../assets/images/pharmacyIcon.png')}
        resizeMode="contain"
        style={{width: 30, height: 42}}
      />
    ),
    title: 'Pharmacy',
    screen: 'TopRated',
  },
  {
    id: '3',
    icon: (
      <Image
        source={require('../../assets/images/diseaseIcon.png')}
        resizeMode="contain"
        style={{width: 35, height: 42}}
      />
    ),
    title: 'Diseases',
    screen: 'Diseases',
  },
  {
    id: '4',
    icon: (
      <Image
        source={require('../../assets/images/bloodIcon.png')}
        resizeMode="contain"
        style={{width: 40, height: 38, marginLeft: -10}}
      />
    ),
    title: 'Plasence',
    screen: 'PeriodsTracker',
  },
  {
    id: '5',
    icon: <Icon name="flask" size={30} color={themeColors.lightPink} />,
    title: 'Diagnostic Lab',
    screen: 'TopRated',
  },
  {
    id: '6',
    icon: (
      <MaterialIcon
        name="warning-amber"
        size={35}
        color={themeColors.lightPink}
      />
    ),
    title: 'Symptoms',
    screen: 'Symptoms',
  },
  {
    id: '7',
    icon: (
      <IoniIcon
        name="fitness-outline"
        size={35}
        color={themeColors.lightPink}
      />
    ),
    title: 'Healthy Living',
    screen: 'TopRated',
  },
  {
    id: '8',
    icon: (
      <Image
        source={require('../../assets/images/herbalIcon.png')}
        resizeMode="contain"
        style={{width: 50, height: 42, marginLeft: -10}}
      />
    ),
    title: 'Herbal Hospital',
    screen: 'TopRated',
  },
  {
    id: '9',
    icon: (
      <MaterialCommunityIcon
        name="ambulance"
        size={35}
        color={themeColors.lightPink}
      />
    ),
    title: 'Ambulance',
    screen: 'TopRated',
  },
  {
    id: '10',
    icon: (
      <MaterialCommunityIcon
        name="shield-home-outline"
        size={35}
        color={themeColors.lightPink}
      />
    ),
    title: 'Homes (Maternity/Elderly/Orphanage)',
    screen: 'TopRated',
  },
  {
    id: '11',
    icon: (
      <Image
        source={require('../../assets/images/PhysiotherapyIcon.png')}
        style={{width: 30, height: 30}}
      />
    ),
    title: 'Physiotherapy',
    screen: 'TopRated',
  },
  {
    id: '12',
    icon: (
      <Image
        source={require('../../assets/images/eyeCareIcon.png')}
        style={{width: 32, height: 25}}
      />
    ),
    title: 'Eye Care',
    screen: 'TopRated',
  },
  {
    id: '13',
    icon: <Icon name="teeth" size={25} color={themeColors.lightPink} />,
    title: 'Dental',
    screen: 'TopRated',
  },
  {
    id: '14',
    icon: (
      <Icon name="joint" size={30} color={themeColors.lightPink} style={{}} />
    ),
    title: 'Osteopathy (Joints/ Muscles)',
    screen: 'TopRated',
  },
  {
    id: '15',
    icon: (
      <Image
        source={require('../../assets/images/artificialIcon.png')}
        style={{width: 50, height: 35, marginLeft: -11}}
      />
    ),
    title: 'Prosthetics',
    screen: 'TopRated',
  },
  {
    id: '16',
    icon: (
      <FontistoIcon
        name="paralysis-disability"
        size={30}
        color={themeColors.lightPink}
      />
    ),
    title: 'Disability',
    screen: 'TopRated',
  },
  {
    id: '17',
    icon: (
      <Image
        source={require('../../assets/images/mentalHealthIcon.png')}
        style={{width: 30, height: 30}}
      />
    ),
    title: 'Psychiatric',
    screen: 'TopRated',
  },
];
