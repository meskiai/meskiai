import { StripePaymentElementOptions } from '@stripe/stripe-js';
const options: StripePaymentElementOptions = {
  fields: {
    billingDetails: {
      email: 'auto',
      phone: 'auto'
    }
  }
};
