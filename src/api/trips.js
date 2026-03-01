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
  searchTrips: (params) => {
    const queryString = new URLSearchParams(params).toString()
    return client.get(`/trips/search?${queryString}`)
  }
}

export default tripsApi
