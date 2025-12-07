/* eslint-disable no-unused-vars */
'use client';

// Core
import { useContext } from 'react';

// Context
import { IConfiguration } from '@/lib/utils/interfaces';

// Interface
import { ConfigurationContext } from '@/lib/context/global/configuration.context';

import { Libraries } from '@react-google-maps/api';

const ensureTrailingSlash = (value: string) =>
  value.endsWith('/') ? value : `${value}/`;

const deriveHttpOrigin = (restUrl: string) =>
  ensureTrailingSlash(restUrl.replace(/\/api\/?$/, '/'));

export const useConfiguration = () => {
  const configuration: IConfiguration | undefined =
    useContext(ConfigurationContext);

  const GOOGLE_CLIENT_ID = configuration?.webClientID;
  const GOOGLE_CLIENT_ID_ANDRIOD = configuration?.androidClientID;
  const GOOGLE_CLIENT_ID_IOS = configuration?.iOSClientID;
  const GOOGLE_CLIENT_ID_EXPO = configuration?.expoClientID;
  const STRIPE_PUBLIC_KEY = configuration?.publishableKey;
  const STRIPE_SECRET_KEY = configuration?.secretKey;
  const PAYPAL_KEY = configuration?.clientId;
  const PAYPAL_SECRET = configuration?.clientSecret;
  const PAYPAL_SANDBOX = configuration?.sandbox;
  const GOOGLE_MAPS_KEY = configuration?.googleApiKey;
  const LIBRARIES = 'places,drawing,geometry,visualization'.split(
    ','
  ) as Libraries;
  const COLORS = {
    GOOGLE: configuration?.googleColor,
  };

  const SKIP_EMAIL_VERIFICATION = configuration?.skipEmailVerification;
  const SKIP_MOBILE_VERIFICATION = configuration?.skipMobileVerification;
  const SKIP_WHATSAPP_OTP = configuration?.skipWhatsAppOTP;
  const CURRENT_SYMBOL = configuration?.currencySymbol;
  const EMAIL_NAME = configuration?.emailName;
  const EMAIL = configuration?.email;
  const PASSWORD = configuration?.password;
  const ENABLE_EMAIL = configuration?.enableEmail;
  const DELIVERY_RATE = configuration?.deliveryRate;
  const COST_TYPE = configuration?.costType || 'perKM';
  const CLOUDINARY_UPLOAD_URL = configuration?.cloudinaryUploadUrl;
  const CLOUDINARY_API_KEY = configuration?.cloudinaryApiKey;
  const FIREBASE_AUTH_DOMAIN = configuration?.authDomain;
  const FIREBASE_KEY = configuration?.firebaseKey;
  const FIREBASE_PROJECT_ID = configuration?.projectId;
  const FIREBASE_STORAGE_BUCKET = configuration?.storageBucket;
  const FIREBASE_MSG_SENDER_ID = configuration?.msgSenderId;
  const FIREBASE_APP_ID = configuration?.appId;
  const FIREBASE_MEASUREMENT_ID = configuration?.measurementId;
  const FIREBASE_VAPID_KEY = configuration?.vapidKey;
  const APP_TERMS = configuration?.termsAndConditions;
  const APP_PRIVACY = configuration?.privacyPolicy;
  const APP_TEST_OTP = configuration?.testOtp;
  const CURRENCY_CODE = configuration?.currency;
  const CURRENCY_SYMBOL = configuration?.currency;
  const ISPAID_VERSION = configuration?.isPaidVersion;

  const envServerRest =
    process.env.NEXT_PUBLIC_SERVER_REST_URL ??
    process.env.SERVER_REST_URL ??
    'https://ftifto-backend.onrender.com';

  const envSocket =
    process.env.NEXT_PUBLIC_WS_SERVER_URL ??
    process.env.NEXT_PUBLIC_SOCKET_URL ??
    process.env.SOCKET_URL ??
    'wss://ftifto-backend.onrender.com';

  const SERVER_URL =
    process.env.NEXT_PUBLIC_SERVER_URL ?? deriveHttpOrigin(envServerRest);
  const WS_SERVER_URL = ensureTrailingSlash(envSocket);

  return {
    SERVER_URL,
    WS_SERVER_URL,
    COLORS,

    // EMAIL CONFIG
    EMAIL_NAME,
    EMAIL,
    PASSWORD,
    ENABLE_EMAIL,

    // STRIPE
    STRIPE_PUBLIC_KEY,
    STRIPE_SECRET_KEY,

    // PAYPAL
    PAYPAL_KEY,
    PAYPAL_SECRET,
    PAYPAL_SANDBOX,

    // DELIVERY RATE
    DELIVERY_RATE,
    COST_TYPE,
    SKIP_WHATSAPP_OTP,

    // GOOGLE MAPS
    GOOGLE_MAPS_KEY,
    LIBRARIES,

    // CLOUDINARY
    CLOUDINARY_UPLOAD_URL,
    CLOUDINARY_API_KEY,

    // GOOGLE CLIENT
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_ID_ANDRIOD,
    GOOGLE_CLIENT_ID_IOS,
    GOOGLE_CLIENT_ID_EXPO,

    // FIREBASE
    FIREBASE_KEY,
    FIREBASE_AUTH_DOMAIN,
    FIREBASE_PROJECT_ID,
    FIREBASE_STORAGE_BUCKET,
    FIREBASE_MSG_SENDER_ID,
    FIREBASE_APP_ID,
    FIREBASE_MEASUREMENT_ID,
    FIREBASE_VAPID_KEY,

    // APP CONFIG
    APP_TERMS,
    APP_PRIVACY,
    APP_TEST_OTP,

    // APP
    SKIP_EMAIL_VERIFICATION,
    SKIP_MOBILE_VERIFICATION,

    //CURRENCY
    CURRENCY_CODE,
    CURRENCY_SYMBOL,
    CURRENT_SYMBOL,

    // IS PAID VERSION
    ISPAID_VERSION,
  };
};
