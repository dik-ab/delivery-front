import { useState, useCallback, useEffect } from 'react'
import { deliveryApi } from '../api/client'

/**
 * Custom hook for managing deliveries
 * @returns {Object} Deliveries state and actions
 */
export const useDeliveries = () => {
  const [deliveries, setDeliveries] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchDeliveries = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await deliveryApi.getDeliveries()
      setDeliveries(response.data || response)
    } catch (err) {
      setError(err.message || 'Failed to fetch deliveries')
      console.error('Error fetching deliveries:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const createDelivery = useCallback(async (delivery) => {
    try {
      const { id, created_at, updated_at, ...payload } = delivery
      const response = await deliveryApi.createDelivery(payload)
      const newDelivery = response.data || response
      setDeliveries((prev) => [...prev, newDelivery])
      return newDelivery
    } catch (err) {
      setError(err.message || 'Failed to create delivery')
      throw err
    }
  }, [])

  const updateDelivery = useCallback(async (id, delivery) => {
    try {
      const response = await deliveryApi.updateDelivery(id, delivery)
      const updatedDelivery = response.data || response
      setDeliveries((prev) =>
        prev.map((d) => (d.id === id ? updatedDelivery : d))
      )
      return updatedDelivery
    } catch (err) {
      setError(err.message || 'Failed to update delivery')
      throw err
    }
  }, [])

  const deleteDelivery = useCallback(async (id) => {
    try {
      await deliveryApi.deleteDelivery(id)
      setDeliveries((prev) => prev.filter((d) => d.id !== id))
    } catch (err) {
      setError(err.message || 'Failed to delete delivery')
      throw err
    }
  }, [])

  const refetch = useCallback(() => {
    fetchDeliveries()
  }, [fetchDeliveries])

  // Fetch deliveries on mount
  useEffect(() => {
    fetchDeliveries()
  }, [fetchDeliveries])

  return {
    deliveries,
    loading,
    error,
    createDelivery,
    updateDelivery,
    deleteDelivery,
    refetch
  }
}
