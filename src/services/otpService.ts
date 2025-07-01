import axios from 'axios';

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_SERVICE_SID = process.env.TWILIO_VERIFY_SERVICE_SID;
const TWILIO_BASE_URL = 'https://verify.twilio.com/v2';

/**
 * Send OTP verification code to a phone number
 * @param phoneNumber Phone number in E.164 format (e.g., +1234567890)
 * @param onStart Callback function when request starts
 * @param onSuccess Callback function on success
 * @param onError Callback function on error
 */
export const sendOtp = async (
  phoneNumber: string,
  onStart: () => void = () => {},
  onSuccess: (data: any) => void = () => {},
  onError: (error: any) => void = () => {},
) => {
  try {
    onStart();
    console.log('TWILIO_ACCOUNT_SID:', TWILIO_ACCOUNT_SID);
    console.log('TWILIO_AUTH_TOKEN:', TWILIO_AUTH_TOKEN);
    console.log('TWILIO_SERVICE_SID:', TWILIO_SERVICE_SID);

    if (!phoneNumber.startsWith('+')) {
      return onError({message: 'Phone number must start with +'});
    }

    // Create URL encoded form data
    const formData = new URLSearchParams();
    formData.append('To', phoneNumber);
    formData.append('Channel', 'sms');

    // Send request to Twilio
    const response = await axios.post(
      `${TWILIO_BASE_URL}/Services/${TWILIO_SERVICE_SID}/Verifications`,
      formData,
      {
        auth: {
          username: TWILIO_ACCOUNT_SID || '',
          password: TWILIO_AUTH_TOKEN || '',
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );

    onSuccess(response.data);
  } catch (error: any) {
    console.error('Error sending OTP:', error);
    onError({
      message:
        error.response?.data?.message || 'Failed to send verification code',
    });
  }
};

/**
 * Verify OTP code entered by user
 * @param phoneNumber Phone number in E.164 format (e.g., +1234567890)
 * @param code OTP code entered by user
 * @param onStart Callback function when request starts
 * @param onSuccess Callback function on success
 * @param onError Callback function on error
 */
export const verifyOtp = async (
  phoneNumber: string,
  code: string,
  onStart: () => void = () => {},
  onSuccess: (data: any) => void = () => {},
  onError: (error: any) => void = () => {},
) => {
  try {
    onStart();

    // Validate inputs
    if (!phoneNumber.startsWith('+')) {
      return onError({message: 'Phone number must start with +'});
    }

    if (!code || code.length < 4) {
      return onError({message: 'Invalid verification code'});
    }

    // Create URL encoded form data
    const formData = new URLSearchParams();
    formData.append('To', phoneNumber);
    formData.append('Code', code);

    // Send verification check request
    const response = await axios.post(
      `${TWILIO_BASE_URL}/Services/${TWILIO_SERVICE_SID}/VerificationCheck`,
      formData,
      {
        auth: {
          username: TWILIO_ACCOUNT_SID || '',
          password: TWILIO_AUTH_TOKEN || '',
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );

    // Check if verification was successful
    if (response.data.status === 'approved') {
      onSuccess(response.data);
    } else {
      onError({message: 'Invalid verification code. Please try again.'});
    }
  } catch (error: any) {
    console.error('Error verifying OTP:', error);
    onError({
      message: error.response?.data?.message || 'Failed to verify code',
    });
  }
};

export default {
  sendOtp,
  verifyOtp,
};
