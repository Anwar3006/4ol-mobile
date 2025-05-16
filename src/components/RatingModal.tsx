import React, {useEffect, useState} from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Text,
} from 'react-native';
import {AirbnbRating, Rating} from 'react-native-ratings';
import {themeColors} from '../theme/colors';
import {fonts} from '../theme/fonts';

interface RatingModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => void;
  initialRating?: number;
  existingRating: any;
  userReview: any;
}

const RatingModal = ({
  visible,
  onClose,
  onSubmit,
  initialRating = 0,
  existingRating,
  userReview,
}: RatingModalProps) => {
  const [rating, setRating] = useState(
    userReview?.rating && userReview?.rating,
  );
  const [comment, setComment] = useState(userReview?.comment);

  const handleSubmit = () => {
    onSubmit(rating, comment);
    setComment('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Your Rating</Text>

          <Rating
            ratingCount={5}
            imageSize={30}
            showRating={false}
            onFinishRating={setRating}
            jumpValue={0.5}
            fractions={2}
            startingValue={rating}
          />

          <TextInput
            style={styles.input}
            placeholder="Leave a comment (optional)"
            multiline
            numberOfLines={4}
            value={comment}
            onChangeText={setComment}
            placeholderTextColor="gray"
          />

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={onClose}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.submitButton]}
              onPress={handleSubmit}>
              <Text style={[styles.buttonText, styles.submitButtonText]}>
                {existingRating ? 'Update' : 'Submit'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: themeColors.white,
    borderRadius: 10,
    padding: 20,
    gap: 20,
  },
  title: {
    fontFamily: fonts.OpenSansBold,
    fontSize: 18,
    textAlign: 'center',
    color: 'gray',
  },
  input: {
    borderWidth: 1,
    borderColor: themeColors.gray,
    borderRadius: 8,
    padding: 10,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: themeColors.primary,
  },
  submitButton: {
    backgroundColor: themeColors.primary,
  },
  buttonText: {
    textAlign: 'center',
    color: themeColors.primary,
    fontFamily: fonts.OpenSansBold,
  },
  submitButtonText: {
    color: themeColors.white,
  },
});

export default RatingModal;
