import React, {useEffect} from 'react';
import {
  View,
  Modal,
  StyleSheet,
  Image,
  Text,
  BackHandler,
  TouchableWithoutFeedback,
} from 'react-native';
import {
  horizontalScale,
  moderateScale,
  verticalScale,
} from '../../utils/metrics';
import {themeColors} from '../../theme/colors';
import {size} from '../../theme/fontStyle';

type ModalProps = {
  visible: boolean;
  hideModal: () => void;
  image: any;
  name: string;
  vicinity: string;
  distance: any;
  duration: any;
};
const MarkModal: React.FC<ModalProps> = ({
  visible,
  hideModal,
  image,
  name,
  vicinity,
  distance,
  duration,
}) => {
  useEffect(() => {
    const backAction = () => {
      if (visible) {
        hideModal();
        return true;
      }
      return false;
    };
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );
    return () => backHandler.remove();
  }, [visible]);
  return (
    <Modal animationType="slide" visible={visible} transparent>
      <TouchableWithoutFeedback onPress={hideModal}>
        <View style={styles.modalBackground}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              <View style={styles.imageContainer}>
                {image ? (
                  <Image source={{uri: image}} style={styles.image} />
                ) : (
                  <Image source={require('../../../assets/pharmacy2.jpg')} />
                )}
              </View>
              <View style={styles.textContainer}>
                <Text
                  numberOfLines={2}
                  ellipsizeMode="tail"
                  style={styles.name}>
                  {name}
                </Text>
                <Text
                  numberOfLines={3}
                  ellipsizeMode="tail"
                  style={styles.vicinity}>
                  {vicinity}
                </Text>
                <View style={{flexDirection: 'row', gap: moderateScale(20)}}>
                  <Text style={styles.minutesAway}>{distance}</Text>
                  <Text style={styles.minutesAway}>{duration}</Text>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    bottom: verticalScale(100),
  },
  modalContent: {
    flexDirection: 'row',
    backgroundColor: themeColors.white,
    borderRadius: 10,
    padding: 10,
    width: horizontalScale(330),
    minHeight: verticalScale(130),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 10,
  },
  imageContainer: {
    width: horizontalScale(100),
    height: verticalScale(110),
    borderRadius: 10,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E0E0E0', // Placeholder color
    alignSelf: 'stretch',
    flex: 1,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    resizeMode: 'cover',
  },
  textContainer: {
    flex: 2,
    marginLeft: 10, // Space between image & text
    justifyContent: 'center',
  },
  name: {
    fontSize: size.md,
    color: themeColors.black,
    fontWeight: 'bold',
  },
  vicinity: {
    color: themeColors.darkGray,
    fontSize: size.default,
    marginTop: 3,
  },
  minutesAway: {
    fontSize: size.default,
    color: themeColors.primary,
    marginTop: 5,
  },
});

export default MarkModal;
