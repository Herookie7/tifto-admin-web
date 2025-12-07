import * as Yup from 'yup';

export const NodeMailerValidationSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Email is required'),
  emailName: Yup.string()
    .max(35, 'Email name must be at most 35 characters')
    .required('Email name is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('required'),
  enableEmail: Yup.boolean(),
});

export const StripeValidationSchema = Yup.object().shape({
  publishableKey: Yup.string().required('required'),
  secretKey: Yup.string().required('required'),
});

export const PayPalValidationSchema = Yup.object().shape({
  clientId: Yup.string().required('required'),
  clientSecret: Yup.string().required('required'),
  secret: Yup.boolean(),
});

export const DeliverytRateValidationSchema = Yup.object().shape({
  deliveryRate: Yup.number().required('required'),
});

export const GoogleApiValidationSchema = Yup.object().shape({
  googleApiKey: Yup.string().required('Google API Key is required'),
});

export const CloudinaryValidationSchema = Yup.object().shape({
  cloudinaryUploadUrl: Yup.string().required(
    'Cloudinary Upload URL is required'
  ),
  cloudinaryApiKey: Yup.string().required('Cloudinary API Key is required'),
});

export const GoogleClientValidationSchema = Yup.object().shape({
  webClientID: Yup.string().required('Web Client ID is required'),
  androidClientID: Yup.string().required('Android Client ID is required'),
  iOSClientID: Yup.string().required('iOS Client ID is required'),
  expoClientID: Yup.string().required('Expo Client ID is required'),
});

export const FirebaseValidationSchema = Yup.object().shape({
  firebaseKey: Yup.string().required('Firebase Key is required'),
  authDomain: Yup.string().required('Auth Domain is required'),
  projectId: Yup.string().required('Project ID is required'),
  storageBucket: Yup.string().required('Storage Bucket is required'),
  msgSenderId: Yup.string(),
  appId: Yup.string().required('App ID is required'),
  measurementId: Yup.string().required('Measurement ID is required'),
  vapidKey: Yup.string(),
});

export const AppConfigValidationSchema = Yup.object().shape({
  termsAndConditions: Yup.string().required(
    'Terms and Conditions are required'
  ),
  privacyPolicy: Yup.string().required('Privacy Policy is required'),
  testOtp: Yup.number().required('Test OTP is required'),
});

export const CurrencyValidationSchema = Yup.object().shape({
  currency: Yup.object().shape({
    label: Yup.string().required('Required'),
    code: Yup.string().required('Required'),
  }),
  currencySymbol: Yup.object().shape({
    label: Yup.string().required('Required'),
    code: Yup.string().required('Required'),
  }),
});
