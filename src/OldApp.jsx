import { useState, useCallback } from 'react'
import { useDeliveries } from './hooks/useDeliveries'
import Header from './components/Header'
import DeliveryList from './components/DeliveryList'
import OriginSetting from './components/OriginSetting'
import Map from './components/Map'
import DeliveryForm from './components/DeliveryForm'
import DeliveryDetail from './components/DeliveryDetail'
import './App.css'

function OldApp() {
  const { deliveries, loading, error, createDelivery, updateDelivery, deleteDelivery, refetch } = useDeliveries()
  const [selectedDelivery, setSelectedDelivery] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editingDelivery, setEditingDelivery] = useState(null)
  const [showDetail, setShowDetail] = useState(false)
  const [appError, setAppError] = useState(null)
  const [origin, setOrigin] = useState(null)

  const handleAddNew = useCallback(() => {
    setEditingDelivery(null)
    setShowForm(true)
    setShowDetail(false)
  }, [])

  const handleFormSubmit = useCallback(
    async (formData) => {
      try {
        setAppError(null)
        if (editingDelivery) {
          await updateDelivery(editingDelivery.id, formData)
        } else {
          await createDelivery(formData)
        }
        setShowForm(false)
        setEditingDelivery(null)
      } catch (err) {
        setAppError(err.message || '操作に失敗しました')
      }
    },
    [editingDelivery, createDelivery, updateDelivery]
  )

  const handleFormCancel = useCallback(() => {
    setShowForm(false)
    setEditingDelivery(null)
  }, [])

  const handleSelectDelivery = useCallback((delivery) => {
    setSelectedDelivery(delivery)
    setShowDetail(true)
    setShowForm(false)
  }, [])

  const handleEditDelivery = useCallback((delivery) => {
    setEditingDelivery(delivery)
    setShowDetail(false)
    setShowForm(true)
  }, [])

  const handleDeleteDelivery = useCallback(
    async (id) => {
      try {
        setAppError(null)
        await deleteDelivery(id)
        if (selectedDelivery?.id === id) {
          setSelectedDelivery(null)
          setShowDetail(false)
        }
      } catch (err) {
        setAppError(err.message || '削除に失敗しました')
      }
    },
    [deleteDelivery, selectedDelivery]
  )

  const handleCloseDetail = useCallback(() => {
    setShowDetail(false)
  }, [])

  const handleMapClick = useCallback((coordinates) => {
    if (editingDelivery || showForm) {
      console.log('Map clicked at:', coordinates)
    }
  }, [editingDelivery, showForm])

  return (
    <div className="app-container">
      <Header deliveryCount={deliveries.length} />

      <div className="app-main">
        <div className="app-sidebar">
          <OriginSetting origin={origin} onOriginChange={setOrigin} />
          <DeliveryList
            deliveries={deliveries}
            selectedDelivery={selectedDelivery}
            onSelectDelivery={handleSelectDelivery}
            onAddNew={handleAddNew}
            onEdit={handleEditDelivery}
            onDelete={handleDeleteDelivery}
            isLoading={loading}
          />
        </div>

        <div className="app-map">
          <Map
            deliveries={deliveries}
            selectedDelivery={selectedDelivery}
            origin={origin}
            onMarkerClick={handleSelectDelivery}
            onMapClick={handleMapClick}
          />
        </div>
      </div>

      {/* Error message */}
      {appError && (
        <div className="app-error">
          {appError}
          <button onClick={() => setAppError(null)}>✕</button>
        </div>
      )}

      {/* Forms and modals */}
      {showForm && (
        <DeliveryForm
          delivery={editingDelivery}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
          onLocationSelect={handleMapClick}
        />
      )}

      {showDetail && selectedDelivery && (
        <DeliveryDetail
          delivery={selectedDelivery}
          onClose={handleCloseDetail}
          onEdit={handleEditDelivery}
          onDelete={handleDeleteDelivery}
        />
      )}

      {error && (
        <div className="app-error">
          読み込みエラー: {error}
          <button onClick={() => refetch()}>再試行</button>
        </div>
      )}
    </div>
  )
}

export default OldApp
