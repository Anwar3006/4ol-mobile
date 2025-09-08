import moment from 'moment';
import {supabase} from '../utils/supabaseClient';

export const getBannerAds = async () => {
  const today = moment().utc().format('YYYY-MM-DD HH:mm:ssZ');
  const todayStart = moment()
    .utc()
    .startOf('day')
    .format('YYYY-MM-DD HH:mm:ssZ');
  const todayEnd = moment().utc().endOf('day').format('YYYY-MM-DD HH:mm:ssZ');

  console.log('Fetching ads for date:', today);
  console.log('Today start:', todayStart);
  console.log('Today end:', todayEnd);

  try {
    const {data, error} = await supabase
      .from('banners_ads')
      .select(
        'headline, description, callToAction, mediaUrls, imageUrls, videoUrls, starting_date_and_time, end_date_and_time, duration',
      )
      .eq('isPublished', true)
      .lte('starting_date_and_time', todayEnd) // Ad should have started by end of today
      .gte('end_date_and_time', todayStart); // Ad should end after start of today

    if (error) {
      console.error('Failed to fetch ads from banners_Ads', error);
      return [];
    }

    console.log('Raw data from database:', data);

    if (!data || data.length === 0) {
      console.log('No ads found in database');
      return [];
    }

    const processedAds = data.map(ads => {
      const mediaUrl =
        Array.isArray(ads.mediaUrls) && ads.mediaUrls ? ads.mediaUrls[0] : null;
      const imageUrl =
        Array.isArray(ads.imageUrls) && ads.imageUrls ? ads.imageUrls[0] : null;
      const videoUrl =
        Array.isArray(ads.videoUrls) && ads.videoUrls ? ads.videoUrls[0] : null;

      return {
        headline: ads.headline,
        description: ads.description,
        callToAction: ads.callToAction,
        mediaUrl,
        imageUrl,
        videoUrl,
        duration: ads.duration,
      };
    });

    console.log('Processed ads:', processedAds);
    return processedAds;
  } catch (error) {
    console.error('Error fetching ads', error);
    return [];
  }
};

// Alternative function to fetch all published ads (for debugging)
export const getAllBannerAds = async () => {
  try {
    const {data, error} = await supabase
      .from('banners_ads')
      .select(
        'headline, description, callToAction, mediaUrls, imageUrls, videoUrls, starting_date_and_time, end_date_and_time, duration, isPublished',
      )
      .eq('isPublished', true);

    if (error) {
      console.error('Failed to fetch all ads from banners_Ads', error);
      return [];
    }

    console.log('All published ads from database:', data);
    return data || [];
  } catch (error) {
    console.error('Error fetching all ads', error);
    return [];
  }
};

// Debug function to check date filtering logic
export const debugDateFiltering = () => {
  const today = moment().utc();
  const yesterday = moment().utc().subtract(1, 'day');
  const tenDaysFromNow = moment().utc().add(10, 'days');

  console.log('=== DATE FILTERING DEBUG ===');
  console.log('Today:', today.format('YYYY-MM-DD HH:mm:ssZ'));
  console.log('Yesterday:', yesterday.format('YYYY-MM-DD HH:mm:ssZ'));
  console.log(
    '10 days from now:',
    tenDaysFromNow.format('YYYY-MM-DD HH:mm:ssZ'),
  );

  // Simulate an ad that started yesterday and runs for 10 days
  const adStartDate = yesterday.format('YYYY-MM-DD HH:mm:ssZ');
  const adEndDate = tenDaysFromNow.format('YYYY-MM-DD HH:mm:ssZ');

  console.log('Ad start date:', adStartDate);
  console.log('Ad end date:', adEndDate);

  const todayStart = moment()
    .utc()
    .startOf('day')
    .format('YYYY-MM-DD HH:mm:ssZ');
  const todayEnd = moment().utc().endOf('day').format('YYYY-MM-DD HH:mm:ssZ');

  console.log('Today start:', todayStart);
  console.log('Today end:', todayEnd);

  // Check if this ad should show today
  const shouldShow = adStartDate <= todayEnd && adEndDate >= todayStart;
  console.log('Should this ad show today?', shouldShow);
  console.log('========================');

  return shouldShow;
};
