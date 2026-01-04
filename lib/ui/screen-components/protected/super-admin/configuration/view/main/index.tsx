// Components
import NodeMailerAddForm from '../../add-form/nodemailer';
import StripeAddForm from '../../add-form/stripe';
import PayPalAddForm from '../../add-form/paypal';
import RazorpayAddForm from '../../add-form/razorpay';
import Fast2SMSAddForm from '../../add-form/fast2sms';
import DeliveryRateAddForm from '../../add-form/delivery-rate';
import GoogleApiAddForm from '../../add-form/google-api';
import CloudinaryAddForm from '../../add-form/cloudinary';
import GoogleClientAddForm from '../../add-form/google-client';
import FirebaseAdminAddForm from '../../add-form/firebase-admin';
import AppConfigAddForm from '../../add-form/app-config';
import VerificationAddForm from '../../add-form/verification';
import CurrencyAddForm from '../../add-form/currency';
import AppVersionAddForm from '../../add-form/app-versions';

const ConfigMain = () => {
  return (
    <div className="space-y-6 flex  flex-col  p-3">
      <RazorpayAddForm />
      <Fast2SMSAddForm />
      <DeliveryRateAddForm />
      <CurrencyAddForm />
      <AppConfigAddForm />
      <GoogleApiAddForm />
      <GoogleClientAddForm />
      <FirebaseAdminAddForm />
      <CloudinaryAddForm />
      <NodeMailerAddForm />
      <VerificationAddForm />
      <AppVersionAddForm />
    </div>
  );
};

export default ConfigMain;
