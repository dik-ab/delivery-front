import { STATUS_LABELS } from '../types/delivery'
import StatusBadge from './StatusBadge'
import './DeliveryDetail.css'

/**
 * Detail view for a single delivery
 * @param {Object} props
 * @param {Delivery} props.delivery - Delivery to display
 * @param {Function} props.onClose - Callback when closing detail view
 * @param {Function} [props.onEdit] - Callback when edit button is clicked
 * @param {Function} [props.onDelete] - Callback when delete button is clicked
 * @returns {React.ReactElement}
 */
function DeliveryDetail({ delivery, onClose, onEdit, onDelete }) {
  const handleDelete = () => {
    if (window.confirm('この配達情報を削除しますか？')) {
      onDelete?.(delivery.id)
    }
  }

  return (
    <div className="delivery-detail-overlay" onClick={onClose}>
      <div className="delivery-detail-container" onClick={(e) => e.stopPropagation()}>
        <div className="detail-header">
          <h2 className="detail-title">{delivery.name}</h2>
          <button className="close-button" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="detail-content">
          <div className="detail-section">
            <h3 className="section-title">基本情報</h3>
            <div className="detail-item">
              <span className="detail-label">受取人名</span>
              <span className="detail-value">{delivery.name}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">住所</span>
              <span className="detail-value address">{delivery.address}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">ステータス</span>
              <div className="detail-value">
                <StatusBadge status={delivery.status} />
              </div>
            </div>
          </div>

          <div className="detail-section">
            <h3 className="section-title">位置情報</h3>
            <div className="detail-item">
              <span className="detail-label">緯度</span>
              <span className="detail-value coordinate">{delivery.lat?.toFixed(6)}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">経度</span>
              <span className="detail-value coordinate">{delivery.lng?.toFixed(6)}</span>
            </div>
            <div className="detail-item">
              <a
                href={`https://www.google.com/maps/@${delivery.lat},${delivery.lng},15z`}
                target="_blank"
                rel="noopener noreferrer"
                className="map-link"
              >
                📍 Google Maps で表示
              </a>
            </div>
          </div>

          {delivery.note && (
            <div className="detail-section">
              <h3 className="section-title">備考</h3>
              <p className="detail-note">{delivery.note}</p>
            </div>
          )}

          {(delivery.created_at || delivery.updated_at) && (
            <div className="detail-section">
              <h3 className="section-title">タイムスタンプ</h3>
              {delivery.created_at && (
                <div className="detail-item">
                  <span className="detail-label">作成日時</span>
                  <span className="detail-value timestamp">
                    {new Date(delivery.created_at).toLocaleString('ja-JP')}
                  </span>
                </div>
              )}
              {delivery.updated_at && (
                <div className="detail-item">
                  <span className="detail-label">更新日時</span>
                  <span className="detail-value timestamp">
                    {new Date(delivery.updated_at).toLocaleString('ja-JP')}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="detail-actions">
          {onEdit && (
            <button onClick={() => onEdit(delivery)} className="btn-edit">
              編集
            </button>
          )}
          {onDelete && (
            <button onClick={handleDelete} className="btn-delete">
              削除
            </button>
          )}
          <button onClick={onClose} className="btn-close">
            閉じる
          </button>
        </div>
      </div>
    </div>
  )
}

export default DeliveryDetail
