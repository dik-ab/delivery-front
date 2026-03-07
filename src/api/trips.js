import client from './client'

export const tripsApi = {
  // Get all trips
  getTrips: () => client.get('/trips'),

  // Get single trip
  getTrip: (id) => client.get(`/trips/${id}`),

  // Create trip
  createTrip: (data) => client.post('/trips', data),

  // Update trip
  updateTrip: (id, data) => client.put(`/trips/${id}`, data),

  // Delete trip
  deleteTrip: (id) => client.delete(`/trips/${id}`),

  // Search trips
  searchTrips: (params) => client.post('/trips/search', params),

  // Get predicted location for a trip
  getPredictedLocation: (tripId, targetTime) => {
    const query = targetTime ? `?at=${encodeURIComponent(targetTime)}` : ''
    return client.get(`/trips/${tripId}/predict${query}`)
  },
}

export default tripsApi
