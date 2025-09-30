import React, {useEffect, useState} from 'react';
import {StyleSheet, Text, TouchableOpacity} from 'react-native';
import {
  getFacilityRating,
  editFacilityRating,
} from '../services/favoriteFacilites';
import {fonts} from '../theme/fonts';
import {size} from '../theme/fontStyle';
import {AirbnbRating} from 'react-native-ratings';
import {themeColors} from '../theme/colors';
import RatingModal from './RatingModal';
import {ActivityIndicator} from 'react-native-paper';
import {useSelector} from 'react-redux';
import {user} from '../store/selectors';

const FacilityRating = ({
  facilityId,
  userReview,
  facilityName,
}: {
  facilityId: string;
  userReview?: any;
  facilityName?: string;
}) => {
  const userData: any = useSelector(user);
  const [rating, setRating] = useState<number | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const fetchRating = async () => {
      try {
        // Get the average rating for display
        const rating = await getFacilityRating(facilityId);
        setRating(rating as number);
      } catch (error) {
        console.error('Error fetching facility rating:', error);
      }
    };

    fetchRating();
  }, [facilityId]);

  useEffect(() => {
    console.log('====================================');
    console.log('USERREVIEW: ', JSON.stringify(userReview, null, 2));
    console.log('====================================');
  }, [userReview]);

  const handleRatingSubmit = async (newRating: number, comment: string) => {
    try {
      await editFacilityRating(facilityId, newRating, comment);
      const updatedRating = await getFacilityRating(facilityId);
      const numericRating = updatedRating ? Number(updatedRating) : null;
      if (numericRating !== null) {
        setRating(numericRating);
      } else {
        setRating(updatedRating as number);
      }
      setModalVisible(false); // Ensure modal closes after successful submission
    } catch (error) {
      console.error('Error submitting rating:', error);
      setModalVisible(false); // Close modal even on error to prevent getting stuck
      throw error; // Re-throw to let the modal handle the error display
    }
  };

  return (
    <>
      <TouchableOpacity
        style={styles.ratingIcon}
        onPress={() => setModalVisible(true)}>
        <Text
          style={{
            color: 'gray',
            marginRight: 5,
            fontFamily: fonts.OpenSansBold,
            fontSize: size.sl,
          }}>
          {rating === 0 ? (
            'N/A'
          ) : rating !== null ? (
            rating
          ) : (
            <ActivityIndicator size="small" color={themeColors.primary} />
          )}
        </Text>
        <AirbnbRating
          isDisabled
          count={5}
          defaultRating={rating || 0}
          size={12}
          showRating={false}
        />
      </TouchableOpacity>

      <RatingModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleRatingSubmit}
        initialRating={rating || 0}
        existingRating={null}
        userReview={userReview}
        userId={userData?.id}
        facilityId={facilityId}
      />
    </>
  );
};

const styles = StyleSheet.create({
  ratingIcon: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: themeColors.white,
    padding: 8,
    borderRadius: 20,
    elevation: 3,
  },
});

export default FacilityRating;
