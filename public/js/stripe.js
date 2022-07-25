/* eslint-disable */

import axios from 'axios';
import { showAlert } from './alert';

const stripe = Stripe(
  'pk_test_51LOn5hDbsFIoDeQWAPdcLJsH1ilhEir3AmJu0Qp1AJP8gWvjSvnKK5EeHcQCipT6RJwpBFSxQwmMLYsHtO1S2RBF00TRVCCeSM'
);
export const bookTour = async (tourId) => {
  try {
    const session = await axios(`http://127.0.0.1:3000/api/v1/bookings/checkout/${tourId}`);

    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};
