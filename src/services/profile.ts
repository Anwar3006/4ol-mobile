import moment from 'moment';
import {supabase} from '../../lib/supabase';
import {limit, SUPABASE_URL} from '../../config/variables';
import RNFS from 'react-native-fs';
import {decode} from 'base64-arraybuffer';

export const updateProfile = async (
  userProfile: {
    first_name: string | undefined;
    last_name: string | undefined;
    sex: string | undefined;
    region: string | undefined;
    dob: string | Date;
  },
  userid: any,
  loadCallback: CallableFunction,
  successCallback: CallableFunction,
  errorCallback: CallableFunction,
) => {
  loadCallback();
  try {
    const usersProfileData = {
      first_name: userProfile?.first_name,
      last_name: userProfile?.last_name,
      sex: userProfile?.sex,
      dob: userProfile?.dob
        ? moment(userProfile?.dob, 'DD/MM/YYYY').format('YYYY-MM-DD')
        : moment(new Date()).format('YYYY-MM-DD'),
      region: userProfile?.region,
    };

    const {data, error} = await supabase
      .from('user_profiles')
      .update(usersProfileData)
      .eq('id', userid.userid);
    if (error) {
      errorCallback(error);
    } else {
      const {data: userProfile, error: fetchError} = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userid.userid)
        .single();
      if (fetchError) {
        errorCallback(fetchError);
        return;
      }

      successCallback(userProfile);
    }
  } catch (error) {
    throw error;
  }
};

export const uploadAvatar = async (
  imagePath: string, // Local path of the image
  userId: string, // User ID
  loadCallback: CallableFunction, // Loading state handler
  successCallback: CallableFunction, // Success handler
  errorCallback: CallableFunction, // Error handler
) => {
  loadCallback(); // Notify that the upload is starting

  try {
    // Read the file data as Base64
    const fileData = await RNFS.readFile(imagePath, 'base64');

    // Extract the file name from the image path
    const fileName = imagePath.split('/').pop();

    // Upload the file to Supabase storage
    const {data, error} = await supabase.storage
      .from('avatar')
      .upload(`${fileName}`, decode(fileData), {
        contentType: 'image/png',
      });

    if (error) {
      console.error('Upload Error:', error);
      return errorCallback(error); // Pass the error to the error handler
    }

    const avatar_url = `${SUPABASE_URL}/storage/v1/object/public/avatar/${fileName}`;

    const {error: updateError} = await supabase
      .from('user_profiles')
      .update({avatar_url})
      .eq('id', userId);

    if (updateError) {
      console.error('Update Error:', error);
      return errorCallback(error);
    } else {
      successCallback(avatar_url);
    }
  } catch (error) {
    console.error('Unexpected Error:', error);
    errorCallback(error); // Handle unexpected errors
  }
};

export const toggleFacilityFavorite = async (
  userId: string,
  facilityId: string,
  loadCallback: CallableFunction,
  successCallback: CallableFunction,
  errorCallback: CallableFunction,
) => {
  loadCallback();
  try {
    // Check if the facility is already in favorites
    const {data: favoritesData, error: fetchError} = await supabase
      .from('favorites')
      .select('id') // Assuming 'id' is the primary key in your favorites table
      .eq('user_id', userId)
      .eq('facility_id', facilityId)
      .maybeSingle();

    if (fetchError) {
      errorCallback(fetchError);
      return;
    }

    if (favoritesData) {
      // Facility is already favorited, remove it
      const {error: deleteError} = await supabase
        .from('favorites')
        .delete()
        .eq('id', favoritesData.id); // Use the retrieved id to delete

      if (deleteError) {
        errorCallback(deleteError);
      } else {
        successCallback('Facility removed from favorites');
      }
    } else {
      // Facility is not favorited, add it
      const {data, error: insertError} = await supabase
        .from('favorites')
        .insert([
          {
            user_id: userId,
            facility_id: facilityId,
            created_at: moment(new Date()).valueOf(),
            updated_at: moment(new Date()).valueOf(),
            created_by: userId,
            updated_by: userId,
            is_created_by_admin_panel: false,
          },
        ]);

      if (insertError) {
        errorCallback(insertError);
      } else {
        successCallback('Facility added to favorites');
      }
    }
  } catch (error) {
    errorCallback(error);
  }
};

export const checkFavoriteStatus = async (
  userId: string,
  facilityId: string,
  loadCallback: CallableFunction,
  successCallback: CallableFunction,
  errorCallback: CallableFunction,
) => {
  loadCallback();
  try {
    const {data, error} = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('facility_id', facilityId);

    if (error) {
      errorCallback(error);
    } else {
      successCallback(data);
    }
  } catch (error) {
    errorCallback(error);
  }
};

export const fetchFavorites = async (
  userId: string,
  offset: number,
  loadCallback: CallableFunction,
  successCallback: CallableFunction,
  errorCallback: CallableFunction,
) => {
  loadCallback();
  try {
    const {data, error} = await supabase
      .from('favorites')
      .select(`*,facilities(*)`)
      .eq('user_id', userId)
      .order('created_at', {ascending: false})
      .range(offset, offset + limit - 1);

    if (error) {
      errorCallback(error);
    } else {
      successCallback(data);
    }
  } catch (error) {
    errorCallback(error);
  }
};
