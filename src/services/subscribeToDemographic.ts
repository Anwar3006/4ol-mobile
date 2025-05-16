import messaging from '@react-native-firebase/messaging';

export const subscribeToDemographic = async (
  age: number,
  region: string,
  sex: string,
) => {
  try {
    const getAgeRange = (age: number): string => {
      if (age >= 18 && age <= 24) return '18-24';
      if (age >= 25 && age <= 34) return '25-34';
      if (age >= 35 && age <= 44) return '35-44';
      if (age >= 45 && age <= 54) return '45-54';
      if (age >= 55) return '55-Above';
      return 'All';
    };

    const ageRange = getAgeRange(age);
    const formattedRegion = region.replace(/\s+/g, '-');

    await messaging()
      .subscribeToTopic(ageRange)
      .then(() => {
        console.log(`Subscribed to age range: ${ageRange}`);
      });
    await messaging()
      .subscribeToTopic('is_tracker_notifications_enabled')
      .then(() => {
        console.log(`Subscribed to tracker notifications`);
      });
    await messaging()
      .subscribeToTopic(formattedRegion)
      .then(() => {
        console.log(`Subscribed to region: ${formattedRegion}`);
      });
    await messaging()
      .subscribeToTopic(sex)
      .then(() => {
        console.log(`Subscribed to sex: ${sex}`);
      });
  } catch (error) {
    console.log('Error subscribing to demographic: ', error);
  }
};
