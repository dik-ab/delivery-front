import client from './client'

export const matchesApi = {
  // Get all matches
  getMatches: () => client.get('/matches'),

  // Get single match
  getMatch: (id) => client.get(`/matches/${id}`),

  // Create match request
  createMatch: (data) => client.post('/matches', data),

  // Update match
  updateMatch: (id, data) => client.put(`/matches/${id}`, data),

  // Delete match
  deleteMatch: (id) => client.delete(`/matches/${id}`),

  // Approve match
  approveMatch: (id) => client.put(`/matches/${id}/approve`),

  // Reject match
  rejectMatch: (id) => client.put(`/matches/${id}/reject`),

  // Complete match
  completeMatch: (id) => client.put(`/matches/${id}/complete`)
}

export default matchesApi
