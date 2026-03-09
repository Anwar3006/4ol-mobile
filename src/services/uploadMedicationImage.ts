import {supabase} from '../../lib/supabase';
import RNFS from 'react-native-fs';
import {decode} from 'base64-arraybuffer';

export const uploadMedicationImage = async file => {
  if (!file) return null;

  try {
    // Read the file data as Base64
    const fileData = await RNFS.readFile(file.uri, 'base64');

    // Extract file name and extension or use a timestamp-based name
    const fileName = `medication_${Date.now()}.${
      file.name?.split('.').pop() || 'jpg'
    }`;
    const filePath = `medication_reminders/${fileName}`;

    // Upload the file to Supabase storage using base64 decoded to ArrayBuffer
    const {data, error} = await supabase.storage
      .from('media')
      .upload(filePath, decode(fileData), {
        contentType: file.type || 'image/jpeg',
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Upload error:', error.message);
      return null;
    }

    // Get the public URL for the uploaded file
    const {data: publicUrlData} = supabase.storage
      .from('media')
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  } catch (err) {
    console.error('Image upload failed:', err);
    return null;
  }
};
