import client from './client'

export const adminApi = {
  // Get statistics
  getStats: () => client.get('/admin/stats'),

  // Get all users
  getUsers: () => client.get('/admin/users'),

  // Get all trips
  getTrips: () => client.get('/admin/trips'),

  // Get all matches
  getMatches: () => client.get('/admin/matches')
}

export default adminApi
