/**
 * @typedef {Object} Delivery
 * @property {number} id - Unique identifier
 * @property {string} name - Delivery recipient name
 * @property {string} address - Full address
 * @property {number} lat - GPS latitude
 * @property {number} lng - GPS longitude
 * @property {string} status - Status: 'pending' | 'in_progress' | 'completed'
 * @property {string} [note] - Optional notes
 * @property {string} [created_at] - ISO timestamp
 * @property {string} [updated_at] - ISO timestamp
 */

export const DELIVERY_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed'
}

export const STATUS_LABELS = {
  pending: '未配送',
  in_progress: '配送中',
  completed: '配送完了'
}

export const STATUS_COLORS = {
  pending: '#94a3b8',
  in_progress: '#3b82f6',
  completed: '#22c55e'
}

export const MARKER_COLORS = {
  pending: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
  in_progress: 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png',
  completed: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'
}

/**
 * @type {Delivery}
 */
export const EMPTY_DELIVERY = {
  id: '',
  name: '',
  address: '',
  lat: 0,
  lng: 0,
  status: DELIVERY_STATUS.PENDING,
  note: ''
}
