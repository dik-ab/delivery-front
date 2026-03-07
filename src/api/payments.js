import client from './client'

export const paymentsApi = {
  // Create a Stripe Payment Intent
  createPaymentIntent: (matchId, amount) =>
    client.post('/payments/create-intent', { match_id: matchId, amount }),

  // Get payments for a match
  getPaymentsByMatch: (matchId) => client.get(`/payments/match/${matchId}`),

  // Confirm payment (learning/demo endpoint)
  confirmPayment: (paymentId) => client.put(`/payments/${paymentId}/confirm`),
}

export default paymentsApi
