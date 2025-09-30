import React, {useState, useRef} from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Text,
  Alert,
} from 'react-native';
import {Rating} from 'react-native-ratings';
import {themeColors} from '../theme/colors';
import {fonts} from '../theme/fonts';
import {useWindowDimensions} from 'react-native';
import {
  saveFacilityRating,
  FacilityRatingResponse,
} from '../services/facilityRatings';

interface RatingModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit?: (rating: number, comment: string) => void; // Made optional since we'll handle DB save internally
  initialRating?: number;
  existingRating: any;
  userReview: any;
  userId: string; // Required for database operations
  facilityId?: string; // Optional - will try to get from existingRating or userReview
}

const RatingModal = ({
  visible,
  onClose,
  onSubmit,
  initialRating = 0,
  existingRating,
  userReview,
  userId,
  facilityId,
}: RatingModalProps) => {
  const [rating, setRating] = useState(
    userReview?.rating || initialRating || 0,
  );
  const [comment, setComment] = useState(userReview?.comment || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const commentRef = useRef<TextInput>(null);
  const {width, height} = useWindowDimensions();

  // Extract facilityId from props - try multiple sources
  const extractedFacilityId =
    facilityId ||
    existingRating?.facility_id ||
    userReview?.facility_id ||
    existingRating?.id; // fallback to existingRating.id if it's the facility ID

  const handleSubmit = async () => {
    // Prevent double submission
    if (isSubmitting) {
      console.log('Already submitting, ignoring duplicate click');
      return;
    }

    // Validate required data
    if (!userId || !extractedFacilityId) {
      console.log(
        'Error',
        'Missing user or facility information. Please try again.',
      );
      console.error('Missing userId or facilityId:', {
        userId,
        facilityId: extractedFacilityId,
        originalFacilityId: facilityId,
        existingRating,
        userReview,
      });
      return;
    }

    console.log('Current rating value:', rating);
    if (rating === 0) {
      console.log('Error', 'Please select a rating before submitting.');
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('Submitting rating:', {
        rating,
        comment,
        userId,
        facilityId: extractedFacilityId,
        existingRating: existingRating?.id,
      });

      let result: FacilityRatingResponse;

      // Always use saveFacilityRating - it will handle both new and existing ratings
      console.log(
        'Saving/updating rating for user:',
        userId,
        'facility:',
        extractedFacilityId,
      );
      result = await saveFacilityRating(
        userId,
        extractedFacilityId,
        rating,
        comment,
      );

      if (result.success) {
        console.log('Rating submitted successfully:', result.data);

        // Call the optional onSubmit callback if provided
        if (onSubmit) {
          await onSubmit(rating, comment);
        }

        // Clear the form
        setComment('');
        if (commentRef.current) {
          commentRef.current.clear();
        }

        // Show success message
        console.log('Success', 'Your rating has been saved successfully!', [
          {
            text: 'OK',
            onPress: () => {
              // Close the modal after user acknowledges success
              onClose();
            },
          },
        ]);
      } else {
        // Show error message
        console.log(
          'Error',
          result.error || 'Failed to save rating. Please try again.',
        );
        console.error('Error submitting rating:', result.error);
      }
    } catch (error) {
      console.error('Unexpected error submitting rating:', error);
      console.log('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <View style={[styles.modalContainer, {width, height}]}>
        <View style={styles.modalContent}>
          <View style={styles.headerContainer}>
            <Text style={styles.title}>Your Rating</Text>
          </View>

          <Rating
            ratingCount={5}
            imageSize={30}
            showRating={false}
            onStartRating={(ratingValue: number) => {
              console.log('Rating started:', ratingValue);
              setRating(ratingValue);
            }}
            onFinishRating={(ratingValue: number) => {
              console.log('Rating finished:', ratingValue);
              setRating(ratingValue);
            }}
            jumpValue={0.5}
            fractions={2}
            startingValue={rating}
          />
          <View
            style={styles.inputContainer}
            onTouchStart={() => {
              commentRef.current?.focus();
            }}>
            <TextInput
              ref={commentRef}
              style={styles.input}
              placeholder="Leave a comment (optional)"
              multiline
              numberOfLines={4}
              value={comment}
              onChangeText={e => setComment(e)}
              placeholderTextColor="gray"
            />
            {comment.length > 0 && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => {
                  console.log('Clear button pressed');
                  setComment('');
                  // Force clear the TextInput
                  setTimeout(() => {
                    if (commentRef.current) {
                      commentRef.current.clear();
                    }
                  }, 0);
                }}>
                <Text
                  style={styles.clearButtonText}
                  onPress={() => {
                    console.log('Clear button pressed');
                    setComment('');
                    // Force clear the TextInput
                    setTimeout(() => {
                      if (commentRef.current) {
                        commentRef.current.clear();
                      }
                    }, 0);
                  }}>
                  clear
                </Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                console.log('test');
                onClose();
              }}>
              <Text
                style={styles.buttonText}
                onPress={() => {
                  console.log('test2');
                  onClose();
                }}>
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                styles.submitButton,
                isSubmitting && styles.disabledButton,
              ]}
              onPress={handleSubmit}
              disabled={isSubmitting}>
              <Text
                style={[
                  styles.buttonText,
                  styles.submitButtonText,
                  isSubmitting && styles.disabledButtonText,
                ]}
                onPress={handleSubmit}>
                {isSubmitting
                  ? 'Saving...'
                  : existingRating
                  ? 'Update'
                  : 'Submit'}
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
    // flex: 1,
    width: 300,
    height: 700,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center', // 👈 centers vertically
    alignItems: 'center', // 👈 centers horizontally
  },
  modalContent: {
    backgroundColor: themeColors.white,
    borderRadius: 10,
    padding: 20,
    gap: 20,
    width: '85%', // 👈 take most of screen width
    maxWidth: 400, // 👈 don't stretch too much on tablets
    alignSelf: 'center', // 👈 center horizontally
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  title: {
    fontFamily: fonts.OpenSansBold,
    fontSize: 18,
    color: 'gray',
    textAlign: 'center',
  },
  inputContainer: {
    position: 'relative',
  },
  input: {
    borderWidth: 1,
    borderColor: themeColors.gray,
    borderRadius: 8,
    padding: 10,
    paddingRight: 40, // 👈 make space for clear button
    textAlignVertical: 'top',
    minHeight: 80, // 👈 gives space for multiline input
  },
  clearButton: {
    position: 'absolute',
    right: 10,
    top: 10,
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  clearButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
    lineHeight: 16,
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
  disabledButton: {
    backgroundColor: '#ccc',
    opacity: 0.6,
  },
  disabledButtonText: {
    color: '#999',
  },
});

export default RatingModal;
