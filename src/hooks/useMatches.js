import { useState, useCallback, useEffect } from 'react'
import matchesApi from '../api/matches'

export const useMatches = () => {
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchMatches = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await matchesApi.getMatches()
      setMatches(response.data || response || [])
    } catch (err) {
      setError(err.message || 'マッチングの取得に失敗しました')
      console.error('Error fetching matches:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const createMatch = useCallback(async (data) => {
    try {
      const response = await matchesApi.createMatch(data)
      const newMatch = response.data || response
      setMatches((prev) => [...prev, newMatch])
      return newMatch
    } catch (err) {
      setError(err.message || 'マッチングリクエストの作成に失敗しました')
      throw err
    }
  }, [])

  const approveMatch = useCallback(async (id) => {
    try {
      const response = await matchesApi.approveMatch(id)
      const updatedMatch = response.data || response
      setMatches((prev) => prev.map((m) => (m.id === id ? updatedMatch : m)))
      return updatedMatch
    } catch (err) {
      setError(err.message || 'マッチングの承認に失敗しました')
      throw err
    }
  }, [])

  const rejectMatch = useCallback(async (id) => {
    try {
      const response = await matchesApi.rejectMatch(id)
      const updatedMatch = response.data || response
      setMatches((prev) => prev.map((m) => (m.id === id ? updatedMatch : m)))
      return updatedMatch
    } catch (err) {
      setError(err.message || 'マッチングの拒否に失敗しました')
      throw err
    }
  }, [])

  const completeMatch = useCallback(async (id) => {
    try {
      const response = await matchesApi.completeMatch(id)
      const updatedMatch = response.data || response
      setMatches((prev) => prev.map((m) => (m.id === id ? updatedMatch : m)))
      return updatedMatch
    } catch (err) {
      setError(err.message || 'マッチングの完了に失敗しました')
      throw err
    }
  }, [])

  useEffect(() => {
    fetchMatches()
  }, [fetchMatches])

  return {
    matches,
    loading,
    error,
    fetchMatches,
    createMatch,
    approveMatch,
    rejectMatch,
    completeMatch
  }
}

export default useMatches
