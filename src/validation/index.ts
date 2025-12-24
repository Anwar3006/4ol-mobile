import * as Yup from 'yup';

export const validationPhoneNumber = Yup.object().shape({
  phoneNumber: Yup.string().required('Phone number is required'),
});

export const validationLoginSchema = Yup.object().shape({
  emailOrPhone: Yup.string()
    .email('Invalid email')
    .required('Email is required')
    .matches(
      /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
      'Must be a valid email',
    )
    .matches(/^[^\s]+$/, 'Email cannot contain spaces'),
  passcode: Yup.string().required('Password is required'),
});

export const validationLoginSchemaPhoneNumber = Yup.object().shape({
  emailOrPhone: Yup.string().required('Phone number is required'),
  passcode: Yup.string().required('Password is required'),
});

export const validationForgetEmailSchema = Yup.object().shape({
  emailOrPhone: Yup.string()
    .email('Invalid email')
    .required('Email is required')
    .matches(
      /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
      'Must be a valid email',
    )
    .matches(/^[^\s]+$/, 'Email cannot contain spaces'),
});

export const validationForgetPhoneNumber = Yup.object().shape({
  emailOrPhone: Yup.string().required('Phone number is required'),
});

export const validationSignUpSchema = Yup.object().shape({
  first_name: Yup.string()
    .min(2, 'Too Short')
    .max(50, 'Too Long!')
    .required('First name is required')
    .matches(/^[^\s]+$/, 'First name cannot contain spaces'),
  last_name: Yup.string()
    .required('Last name is required')
    .matches(/^[^\s]+$/, 'Last name cannot contain spaces'),
  email: Yup.string()
    .email('Invalid email')
    .required('Email is required')
    .matches(
      /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
      'Must be a valid email',
    )
    .matches(/^[^\s]+$/, 'Email cannot contain spaces'),
  dob: Yup.string().required('dob is required'),
  sex: Yup.string().required('gender is required'),
  password: Yup.string()
    .required('Password is required')
    .min(8, 'Password length should be 8 characters'),
  confirm_password: Yup.string()
    .required('Confirm Password is required')
    .oneOf([Yup.ref('password'), ''], 'Passwords must match')
    .min(8, 'Confirm Password length should be 8 characters'),
});

export const validationBusinessSignUpSchema = Yup.object().shape({
  full_name: Yup.string()
    .min(2, 'Too Short')
    .max(50, 'Too Long!')
    .required('Full name is required'),
  business_name: Yup.string()
    .required('Business name is required')
    .matches(/^[^\s]+$/, 'Business name cannot contain spaces'),
  email: Yup.string()
    .email('Invalid email')
    .required('Email is required')
    .matches(
      /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
      'Must be a valid email',
    )
    .matches(/^[^\s]+$/, 'Email cannot contain spaces'),
  password: Yup.string()
    .required('Password is required')
    .min(8, 'Password length should be 8 characters'),
  confirm_password: Yup.string()
    .required('Confirm Password is required')
    .oneOf([Yup.ref('password'), ''], 'Passwords must match')
    .min(8, 'Confirm Password length should be 8 characters'),
  phone_number: Yup.string().required('Phone number is required'),
  business_category: Yup.string().required('Business type is required'),
  specific_category: Yup.string().required('Please select a Product/Service'),
  gps_address: Yup.string().required('GPS Address is required'),
  street: Yup.string().required(
    'Please use the GPS lookup to find your street',
  ),
  region: Yup.string().required('Region is required'),
  has_agreed_to_tc: Yup.boolean().oneOf(
    [true],
    'You must accept the terms of service',
  ),
  has_agreed_to_pa: Yup.boolean().oneOf(
    [true],
    'Please accept the professional accountability agreement',
  ),
});

export const validationUpdateProfile = Yup.object().shape({
  first_name: Yup.string()
    .min(2, 'Too Short')
    .max(50, 'Too Long!')
    .required('First name is required')
    .matches(/^[^\s]+$/, 'First name cannot contain spaces'),
  last_name: Yup.string()
    .required('Last name is required')
    .matches(/^[^\s]+$/, 'Last name cannot contain spaces'),
  email: Yup.string()
    .email('Invalid email')
    .required('Email is required')
    .matches(
      /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
      'Must be a valid email',
    )
    .matches(/^[^\s]+$/, 'Email cannot contain spaces'),
  dob: Yup.string().required('dob is required'),
  sex: Yup.string().required('sex is required'),
  emailOrPhone: Yup.string().required('Phone number is required'),
});

export const validationResetPasswordSchema = Yup.object().shape({
  newPin: Yup.string().required('new pin is required'),
  confirmPin: Yup.string().required('confirmPin pin is required'),
});

// newPin: '',
//   confirmPin: '',

export const validationChangePassword = Yup.object().shape({
  oldPassword: Yup.string().required('old Password is required'),
  newPassword: Yup.string()
    .required('New password is required')
    .min(8, 'Password length should be 8 characters'),
  confirmPassword: Yup.string()
    .required('Confirm Password is required')
    .oneOf([Yup.ref('newPassword'), ''], 'Passwords must match')
    .min(8, 'Confirm Password length should be 8 characters'),
});

export const AddMedicationSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  condition: Yup.string().required('Condition is required'),
});

export const EditUserMedication = Yup.object().shape({
  editname: Yup.string().required('Name is required'),
  editcondition: Yup.string().required('Condition is required'),
});

export const ValidateChatSupport = Yup.object().shape({
  name: Yup.string().trim().required('*Name is required'),
  message: Yup.string().trim().required('*Message is required'),
  selectedOption: Yup.string().required('Please select an option'),
});
