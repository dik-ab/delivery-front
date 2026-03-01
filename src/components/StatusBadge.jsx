import { STATUS_LABELS, STATUS_COLORS } from '../types/delivery'
import './StatusBadge.css'

/**
 * Status badge component
 * @param {Object} props
 * @param {string} props.status - Delivery status
 * @param {string} [props.className] - Additional CSS classes
 * @returns {React.ReactElement}
 */
function StatusBadge({ status, className = '' }) {
  const label = STATUS_LABELS[status] || status
  const color = STATUS_COLORS[status] || '#999'

  return (
    <span
      className={`status-badge ${className}`}
      style={{ backgroundColor: color }}
    >
      {label}
    </span>
  )
}

export default StatusBadge
