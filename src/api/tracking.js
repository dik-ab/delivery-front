import client from './client'

export const trackingApi = {
  // Record location
  recordLocation: (data) => client.post('/tracking', data),

  // Get tracking history
  getTrackingHistory: (tripId) => client.get(`/tracking/${tripId}`),

  // Get latest location
  getLatestLocation: (tripId) => client.get(`/tracking/${tripId}/latest`)
}

export default trackingApi
