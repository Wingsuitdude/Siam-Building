import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { supabase } from './supabase';
import { toast } from 'react-toastify';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const CheckoutForm = ({ amount, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    if (!stripe || !elements) {
      setLoading(false);
      return;
    }

    try {
      // Create a PaymentIntent on your server
      const { data: paymentIntent, error: backendError } = await supabase.functions.invoke('create-payment-intent', {
        body: { amount: amount * 100 } // amount in cents
      });

      if (backendError) throw new Error(backendError.message);

      // Confirm the PaymentIntent with Stripe.js
      const { error: stripeError } = await stripe.confirmCardPayment(paymentIntent.client_secret, {
        payment_method: {
          card: elements.getElement(CardElement),
        }
      });

      if (stripeError) throw new Error(stripeError.message);

      // Payment successful
      toast.success('Payment successful!');
      onSuccess();
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(`Payment failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <CardElement className="border p-3 rounded mb-4" />
      <button 
        type="submit" 
        disabled={!stripe || loading} 
        className="w-full bg-blue-500 text-white py-2 px-4 rounded disabled:bg-gray-400"
      >
        {loading ? 'Processing...' : `Pay $${amount}`}
      </button>
    </form>
  );
};

const StripePayment = ({ amount, onSuccess }) => (
  <Elements stripe={stripePromise}>
    <CheckoutForm amount={amount} onSuccess={onSuccess} />
  </Elements>
);

export default StripePayment;