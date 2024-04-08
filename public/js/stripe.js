import axios from 'axios';
import { showAlert } from './alerts';

export const bookTour = async (tourID) => {
  const stripe = Stripe(
    'pk_test_51P2ZKcSAoU62bNurJQk7YyZR7RPkVCHvKYhwqfPEL7htdyITRroLknrYIcNujqOc90yrqt371A115R7OYaICWbQG00vNHG5lMD',
  );
  console.log('in book tour');
  try {
    // 1. Get checkout session from API
    const result = await axios.get(
      `http://localhost:3000/api/v1/bookings/checkout-session/${tourID}`,
    );

    // console.log(result.data); 
    // 2. Create checkout form and charge credit card
    await stripe.redirectToCheckout({
      sessionId : result.data.session.id
    })
  } catch (error) {
    // console.error('Error fetching checkout session:', error);
    showAlert('error',error);
  }
};
