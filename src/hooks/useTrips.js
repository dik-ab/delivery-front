import { useState, useCallback, useEffect } from 'react'
import tripsApi from '../api/trips'

export const useTrips = () => {
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchTrips = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await tripsApi.getTrips()
      setTrips(response.data || response || [])
    } catch (err) {
      setError(err.message || 'トリップの取得に失敗しました')
      console.error('Error fetching trips:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const searchTrips = useCallback(async (params) => {
    setLoading(true)
    setError(null)
    try {
      const response = await tripsApi.searchTrips(params)
      return response.data || response || []
    } catch (err) {
      setError(err.message || 'トリップの検索に失敗しました')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const createTrip = useCallback(async (data) => {
    try {
      const response = await tripsApi.createTrip(data)
      const newTrip = response.data || response
      setTrips((prev) => [...prev, newTrip])
      return newTrip
    } catch (err) {
      setError(err.message || 'トリップの作成に失敗しました')
      throw err
    }
  }, [])

  const updateTrip = useCallback(async (id, data) => {
    try {
      const response = await tripsApi.updateTrip(id, data)
      const updatedTrip = response.data || response
      setTrips((prev) => prev.map((t) => (t.id === id ? updatedTrip : t)))
      return updatedTrip
    } catch (err) {
      setError(err.message || 'トリップの更新に失敗しました')
      throw err
    }
  }, [])

  const deleteTrip = useCallback(async (id) => {
    try {
      await tripsApi.deleteTrip(id)
      setTrips((prev) => prev.filter((t) => t.id !== id))
    } catch (err) {
      setError(err.message || 'トリップの削除に失敗しました')
      throw err
    }
  }, [])

  useEffect(() => {
    fetchTrips()
  }, [fetchTrips])

  return {
    trips,
    loading,
    error,
    fetchTrips,
    searchTrips,
    createTrip,
    updateTrip,
    deleteTrip
  }
}

export default useTrips
