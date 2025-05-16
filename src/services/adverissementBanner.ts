import moment from "moment";
import { supabase } from "../utils/supabaseClient";

export const getBannerAds = async () => {
    const today = moment().utc().format('YYYY-MM-DD HH:mm:ssZ');
    try {
        const {data, error} = await supabase
        .from('banners_ads')
        .select('headline, description, callToAction, mediaUrls, imageUrls, videoUrls, starting_date_and_time, end_date_and_time, duration')
        .eq('isPublished', true)
        .lte('starting_date_and_time', today)
        .gte('end_date_and_time', today);

        if(error){
            console.error('Failed to fetch ads from banners_Ads', error);
        }

        return data.map((ads) => {
            const mediaUrl = Array.isArray(ads.mediaUrls) && ads.mediaUrls ? ads.mediaUrls[0] : null;
            const imageUrl = Array.isArray(ads.imageUrls) && ads.imageUrls ? ads.imageUrls[0] : null;
            const videoUrl = Array.isArray(ads.videoUrls) && ads.videoUrls ? ads.videoUrls[0] : null;

            return {
                headline: ads.headline,
                description: ads.description,
                callToAction: ads.callToAction,
                mediaUrl,
                imageUrl,
                videoUrl,
                duration: ads.duration
            }
        });
    } catch (error) {
        console.error('Error fetching ads', error);
        return [];
    }
}