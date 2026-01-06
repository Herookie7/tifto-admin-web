import { IDropdownSelectItem, IGlobalComponentProps } from './global.interface';

export interface IConfigCardComponentProps extends IGlobalComponentProps {
  toggleLabel?: string;
  toggleValue?: boolean;
  toggleOnChange?: () => void;
  buttonLoading: boolean;
  cardTitle: string;
}

export interface INodeMailerForm {
  email: string | undefined;
  password: string | undefined;
  emailName: string | undefined;
  enableEmail: boolean | undefined;
}

export interface IStripeForm {
  publishableKey: string | undefined;
  secretKey: string | undefined;
}

export interface IPaypalForm {
  clientId: string | undefined;
  clientSecret: string | undefined;
  sandbox: boolean | undefined;
}

export interface IRazorpayForm {
  keyId: string | undefined;
  keySecret: string | undefined;
  sandbox: boolean | undefined;
}

export interface IFast2SMSForm {
  apiKey: string | undefined;
  enabled: boolean | undefined;
  route: string | undefined;
}

export interface IDeliveryRateForm {
  deliveryRate: number | null;
  freeDeliveryAmount: number | null;
  costType: string;
}

export interface IGoogleApiForm {
  googleApiKey: string;
}

export interface ICloudinaryForm {
  cloudinaryUploadUrl: string | undefined;
  cloudinaryApiKey: string | undefined;
}

export interface IGoogleClientForm {
  webClientID: string;
  androidClientID: string;
  iOSClientID: string;
  expoClientID: string;
}

export interface IFirebaseForm {
  firebaseKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  msgSenderId: string;
  appId: string;
  measurementId: string;
  vapidKey: string;
}

export interface IAppConfigForm {
  termsAndConditions: string;
  privacyPolicy: string;
  testOtp: number | null;
}

export interface IVerificationConfigForm {
  skipEmailVerification: boolean;
  skipMobileVerification: boolean;
  skipWhatsAppOTP: boolean;
}

export interface ICurrencyForm {
  currency: IDropdownSelectItem | null;
  currencySymbol: IDropdownSelectItem | null;
}
