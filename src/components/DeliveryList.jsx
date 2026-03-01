import { useState } from 'react'
import { DELIVERY_STATUS, STATUS_LABELS } from '../types/delivery'
import StatusBadge from './StatusBadge'
import './DeliveryList.css'

/**
 * Sidebar list of deliveries
 * @param {Object} props
 * @param {Delivery[]} props.deliveries - List of deliveries
 * @param {Delivery|null} [props.selectedDelivery] - Currently selected delivery
 * @param {Function} props.onSelectDelivery - Callback when a delivery is clicked
 * @param {Function} props.onAddNew - Callback when add button is clicked
 * @param {Function} [props.onEdit] - Callback when edit button is clicked
 * @param {Function} [props.onDelete] - Callback when delete button is clicked
 * @param {boolean} [props.isLoading] - Loading state
 * @returns {React.ReactElement}
 */
function DeliveryList({
  deliveries,
  selectedDelivery,
  onSelectDelivery,
  onAddNew,
  onEdit,
  onDelete,
  isLoading
}) {
  const [filterStatus, setFilterStatus] = useState('all')

  const filteredDeliveries =
    filterStatus === 'all'
      ? deliveries
      : deliveries.filter((d) => d.status === filterStatus)

  const handleDelete = (e, id) => {
    e.stopPropagation()
    if (window.confirm('この配達情報を削除しますか？')) {
      onDelete?.(id)
    }
  }

  const handleEdit = (e, delivery) => {
    e.stopPropagation()
    onEdit?.(delivery)
  }

  return (
    <div className="delivery-list-container">
      <div className="list-header">
        <button className="btn-add-new" onClick={onAddNew}>
          + 新規追加
        </button>
      </div>

      <div className="list-filters">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="filter-select"
        >
          <option value="all">すべて ({deliveries.length})</option>
          <option value={DELIVERY_STATUS.PENDING}>
            {STATUS_LABELS.pending} (
            {deliveries.filter((d) => d.status === DELIVERY_STATUS.PENDING).length})
          </option>
          <option value={DELIVERY_STATUS.IN_PROGRESS}>
            {STATUS_LABELS.in_progress} (
            {deliveries.filter((d) => d.status === DELIVERY_STATUS.IN_PROGRESS).length})
          </option>
          <option value={DELIVERY_STATUS.COMPLETED}>
            {STATUS_LABELS.completed} (
            {deliveries.filter((d) => d.status === DELIVERY_STATUS.COMPLETED).length})
          </option>
        </select>
      </div>

      {isLoading ? (
        <div className="list-empty">
          <p>読み込み中...</p>
        </div>
      ) : filteredDeliveries.length === 0 ? (
        <div className="list-empty">
          <p>配達情報がありません</p>
          <button onClick={onAddNew} className="btn-empty-add">
            新規追加
          </button>
        </div>
      ) : (
        <div className="deliveries-scroll">
          <div className="deliveries-list">
            {filteredDeliveries.map((delivery) => (
              <div
                key={delivery.id}
                className={`delivery-card ${
                  selectedDelivery?.id === delivery.id ? 'active' : ''
                }`}
                onClick={() => onSelectDelivery(delivery)}
              >
                <div className="card-header">
                  <h3 className="card-name">{delivery.name}</h3>
                  <StatusBadge status={delivery.status} />
                </div>

                <div className="card-address">
                  {delivery.address}
                </div>

                {delivery.note && (
                  <div className="card-note">
                    {delivery.note.length > 50
                      ? delivery.note.substring(0, 50) + '...'
                      : delivery.note}
                  </div>
                )}

                <div className="card-actions">
                  {onEdit && (
                    <button
                      className="card-btn-edit"
                      onClick={(e) => handleEdit(e, delivery)}
                      title="編集"
                    >
                      ✏️
                    </button>
                  )}
                  {onDelete && (
                    <button
                      className="card-btn-delete"
                      onClick={(e) => handleDelete(e, delivery.id)}
                      title="削除"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default DeliveryList
