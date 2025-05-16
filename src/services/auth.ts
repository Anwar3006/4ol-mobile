import moment from 'moment';
import {supabase} from '../utils/supabaseClient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {decryptPassword, encryptPassword} from '../utils/helpers';
import {logActivity} from './activityLogsService';

export const signInWithPhoneNumber = async (
  phoneNumber: undefined | string,
  forgot: boolean | undefined,
  loadCallback: CallableFunction,
  successCallback: CallableFunction,
  errorCallback: CallableFunction,
): Promise<void> => {
  console.log('🚀 ~ phoneNumber:', phoneNumber);
  loadCallback();
  try {
    if (!forgot) {
      const {data: userProfile, error: fetchError} = await supabase
        .from('user_profiles')
        .select('*')
        .eq('phone_number', phoneNumber)
        .single();
      if (userProfile) {
        return errorCallback(
          new Error(
            'Somebody (may be you?) is already using this phone number',
          ),
        );
      }
    }
    const {data, error} = await supabase.auth.signInWithOtp({
      phone: phoneNumber,
    });
    if (error) {
      errorCallback(error);
    } else {
      successCallback(data);
    }
  } catch (err) {
    errorCallback(err as Error);
  }
};

export const verifyOtp = async (
  phoneNumber: string,
  otp: string,
  loadCallback: CallableFunction,
  successCallback: CallableFunction,
  errorCallback: CallableFunction,
): Promise<void> => {
  loadCallback();
  try {
    const {data, error} = await supabase.auth.verifyOtp({
      phone: phoneNumber,
      token: otp,
      type: 'sms',
    });
    if (error) {
      errorCallback(error);
    } else {
      successCallback(data);
    }
  } catch (err) {
    errorCallback(err as Error);
  }
};

export const signup = async (
  user: any,
  loadCallback: CallableFunction,
  successCallback: CallableFunction,
  errorCallback: CallableFunction,
): Promise<void> => {
  loadCallback();
  try {
    const {data: signupData, error: signupError} = await supabase.auth.signUp({
      email: user.email,
      password: user.password,
    });

    if (signupError) {
      errorCallback(signupError);
      return;
    }

    const userId = signupData.user?.id;
    if (userId) {
      const encryptedPassword = encryptPassword(user.password);
      const updatedUser = {
        ...user,
        dob: user?.dob
          ? moment(user?.dob).format('YYYY-MM-DD')
          : moment(new Date()).format('YYYY-MM-DD'),
      };
      //@ts-ignore
      delete updatedUser['confirm_password'];
      //@ts-ignore
      delete updatedUser['password'];
      const {error: updateError} = await supabase.from('user_profiles').insert([
        {
          id: userId,
          password: encryptedPassword,
          created_at: moment(new Date()).valueOf(),
          updated_at: moment(new Date()).valueOf(),
          created_by: userId,
          updated_by: userId,
          is_created_by_admin_panel: false,
          ...updatedUser,
        },
      ]);
      if (updateError) {
        errorCallback(updateError);
        return;
      }
      const {data: userProfile, error: fetchError} = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (fetchError) {
        errorCallback(fetchError);
        return;
      }
      await AsyncStorage.setItem('user_id', userId);
      await AsyncStorage.setItem('isLoggedIn', JSON.stringify(true));
      await logActivity(
        {
          user_id: userId,
          user_name: `${user.first_name} ${user.last_name}`,
          type: 'authentication',
          description: 'User successfully signed up for the app',
          reference: 'user_registration',
          reference_id: userId,
        },
        () => {
          console.log('Logging sign-up activity...');
        },
        data => {
          console.log('Sign-up activity logged successfully:', data);
        },
        error => {
          console.error('Error logging sign-up activity:', error);
        },
      );
      successCallback(userProfile);
    } else {
      errorCallback(new Error('User ID is not available.'));
    }
  } catch (err) {
    errorCallback(err as Error);
  }
};

export const login = async (
  user: {emailOrPhone: string; passcode: string},
  loadCallback: CallableFunction,
  successCallback: CallableFunction,
  errorCallback: CallableFunction,
): Promise<void> => {
  console.log('user in login_auth', user), loadCallback();

  try {
    let emailOrPhone = user.emailOrPhone;
    if (!emailOrPhone.includes('@')) {
      const {data: userProfileByPhone, error: phoneFetchError} = await supabase
        .from('user_profiles')
        .select('email')
        .eq('phone_number', `${emailOrPhone}`)
        .single();
      if (!userProfileByPhone?.email) {
        errorCallback(new Error('No user found with the given phone number.'));
        return;
      }
      emailOrPhone = userProfileByPhone.email;
    }

    const {data: signinData, error: signinError} =
      await supabase.auth.signInWithPassword({
        email: emailOrPhone,
        password: user.passcode,
      });
    if (signinError) {
      errorCallback(signinError);
      return;
    }

    const userId = signinData.user?.id;
    if (userId) {
      const {data: userProfile, error: fetchError} = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (fetchError) {
        errorCallback(fetchError);
        return;
      }
      await AsyncStorage.setItem('user_id', userId);
      await AsyncStorage.setItem('isLoggedIn', JSON.stringify(true));
      await logActivity(
        {
          user_id: userId,
          user_name: `${userProfile.first_name} ${userProfile.last_name}`,
          type: 'authentication',
          description: 'User logged into the app',
          reference: 'login',
          reference_id: userId,
        },
        () => {
          console.log('Logging login activity...');
        },
        data => {
          console.log('Login activity logged successfully:', data);
        },
        error => {
          console.error('Error logging login activity:', error);
        },
      );
      successCallback(userProfile);
    } else {
      errorCallback(new Error('User ID is not available.'));
    }
  } catch (err) {
    errorCallback(err as Error);
  }
};

export const getUserProfile = async (
  fcm_token: undefined | string,
  id: undefined | string,
  loadCallback: CallableFunction,
  successCallback: CallableFunction,
  errorCallback: CallableFunction,
): Promise<void> => {
  try {
    console.log('~ fcmtoken in api:', fcm_token);

    // Loading callback ko pehle trigger kar rahe hain
    loadCallback();

    // FCM token ko update kar rahe hain agar available hai
    const {data: updateUserFcm, error: fetchErrorFcm} = await supabase
      .from('user_profiles')
      .update({fcm_token: fcm_token}) // Agar token null hai to bhi update karega
      .eq('id', id);

    if (fetchErrorFcm) {
      console.error('Error while updating FCM token:', fetchErrorFcm);
      errorCallback(new Error('Failed to update FCM token'));
      return;
    }

    console.log('~ updateUserFcm:', updateUserFcm);

    // User profile ko fetch kar rahe hain
    const {data: userProfile, error: fetchError} = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', id)
      .single(); // Single user ko return karega

    if (fetchError) {
      console.error('Error while fetching user profile:', fetchError);
      errorCallback(new Error('Failed to fetch user profile'));
      return;
    }

    // Agar user profile mila hai
    if (userProfile?.id) {
      await AsyncStorage.setItem('user_id', userProfile.id);
      successCallback(userProfile);
    } else {
      errorCallback(new Error('User profile not found'));
    }
  } catch (err) {
    console.error('Error in getUserProfile:', err);
    errorCallback(err as Error);
  }
};

export const logout = async (
  loadCallback: CallableFunction,
  successCallback: CallableFunction,
  errorCallback: CallableFunction,
): Promise<void> => {
  try {
    loadCallback();
    const {error: signOutError} = await supabase.auth.signOut();
    if (signOutError) {
      errorCallback(signOutError);
      return;
    }
    // await AsyncStorage.removeItem('user_id');
    await AsyncStorage.setItem('isLoggedIn', JSON.stringify(false));
    successCallback();
  } catch (err) {
    errorCallback(err as Error);
  }
};

export const sendOtpToEmail = async (
  email: string | undefined,
  loadCallback: CallableFunction,
  successCallback: CallableFunction,
  errorCallback: CallableFunction,
): Promise<void> => {
  loadCallback();
  try {
    const {data: userProfile, error: fetchError} = await supabase
      .from('user_profiles')
      .select('*')
      .eq('email', email)
      .single();
    if (!userProfile) {
      return errorCallback(new Error('User not found'));
    }

    const {data, error} = await supabase.auth.signInWithOtp({
      email,
      options: {
        // set this to false if you do not want the user to be automatically signed up
        shouldCreateUser: false,
      },
    });
    if (error) {
      errorCallback(error);
    } else {
      successCallback(data);
    }
  } catch (err) {
    errorCallback(err as Error);
  }
};

export const verifyOtpSentToEmail = async (
  email: string,
  otp: string,
  loadCallback: CallableFunction,
  successCallback: CallableFunction,
  errorCallback: CallableFunction,
): Promise<void> => {
  loadCallback();
  try {
    const {data, error} = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'email',
    });
    if (error) {
      errorCallback(error);
    } else {
      successCallback(data);
    }
  } catch (err) {
    errorCallback(err as Error);
  }
};

export const resetPassword = async (
  newPassword: string,
  phoneOrEmail: string,
  loadCallback: CallableFunction,
  successCallback: CallableFunction,
  errorCallback: CallableFunction,
): Promise<void> => {
  loadCallback();
  try {
    let emailOrPhone = phoneOrEmail;
    let decryptedPassword = '';
    // Fetch user profile based on phone or email
    if (!emailOrPhone.includes('@')) {
      const {data: userProfileByPhone, error: phoneFetchError} = await supabase
        .from('user_profiles')
        .select('*')
        .eq('phone_number', `${emailOrPhone}`)
        .single();
      if (!userProfileByPhone?.email) {
        errorCallback(new Error('No user found with the given phone number.'));
        return;
      }
      emailOrPhone = userProfileByPhone.email;
      decryptedPassword = decryptPassword(userProfileByPhone?.password);
    }

    if (emailOrPhone.includes('@')) {
      const {data: userProfileByEmail, error: emailFetchError} = await supabase
        .from('user_profiles')
        .select('*')
        .eq('email', emailOrPhone)
        .single();
      if (!userProfileByEmail?.email) {
        errorCallback(new Error('User not found'));
        return;
      }
      emailOrPhone = userProfileByEmail.email;
      decryptedPassword = decryptPassword(userProfileByEmail?.password);
    }
    // Sign in the user with the decrypted password
    const {data: signinData, error: signinError} =
      await supabase.auth.signInWithPassword({
        email: emailOrPhone,
        password: decryptedPassword,
      });
    if (signinError) {
      errorCallback(signinError);
      return;
    }
    // Update the password in the auth system
    const {data, error} = await supabase.auth.updateUser({
      email: emailOrPhone,
      password: newPassword,
    });
    if (error) {
      errorCallback(error);
      return;
    }
    // Update the password field in the user_profiles table
    const {data: updateProfileData, error: updateProfileError} = await supabase
      .from('user_profiles')
      .update({password: encryptPassword(newPassword)})
      .eq('email', emailOrPhone)
      .select('*')
      .single();
    if (updateProfileError) {
      errorCallback(updateProfileError);
    } else {
      successCallback(data);
      logActivity(
        {
          user_id: updateProfileData?.id,
          user_name: `${updateProfileData?.first_name} ${updateProfileData?.last_name}`,
          type: 'authentication',
          description: 'User reset their password for the app',
          reference: 'password_reset',
          reference_id: updateProfileData?.id,
        },
        () => {
          console.log('Logging password reset activity...');
        },
        data => {
          console.log('Password reset activity logged successfully:', data);
        },
        error => {
          console.error('Error logging password reset activity:', error);
        },
      );
    }
  } catch (err) {
    errorCallback(err as Error);
  }
};

export const changePassword = async (
  values: any,
  loadCallback: CallableFunction,
  successCallback: CallableFunction,
  errorCallback: CallableFunction,
): Promise<void> => {
  console.log('~ values ', values), loadCallback();
  try {
    const {data: signinData, error: signinError} =
      await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.oldPassword,
      });

    if (signinError) {
      errorCallback(new Error('Old password is incorrect.'));
      return;
    }

    const {data: updateData, error: updateError} =
      await supabase.auth.updateUser({
        email: values.email,
        password: values.newPassword,
      });

    if (updateError) {
      errorCallback(new Error('Failed to update password.'));
      return;
    }

    const {data: updateProfileData, error: updateProfileError} = await supabase
      .from('user_profiles')
      .update({password: encryptPassword(values.newPassword)})
      .eq('email', values.email);

    if (updateProfileError) {
      errorCallback(new Error('Failed to update user profile.'));
    } else {
      const {data: userProfile, error: fetchError} = await supabase
        .from('user_profiles')
        .select('*')
        .eq('email', values.email)
        .single();
      if (fetchError) {
        errorCallback(fetchError);
        return;
      }
      successCallback(userProfile);
      // successCallback(updateData);
    }
  } catch (err) {
    errorCallback(err as Error);
  }
};
