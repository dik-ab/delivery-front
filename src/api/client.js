const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1'

/**
 * fetch をラップした API クライアント
 * - ベースURLの自動付与
 * - JWT トークンの自動付与
 * - JSON の自動パース
 * - 401 時のリダイレクト
 */
async function request(path, options = {}) {
  const token = localStorage.getItem('auth_token')

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  })

  // 401 → ログイン画面にリダイレクト
  if (response.status === 401) {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
    window.location.href = '/login'
    throw new Error('認証エラー')
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    console.error('API Error:', errorData)
    throw new Error(errorData.message || `HTTP Error: ${response.status}`)
  }

  // 204 No Content の場合は json パースしない
  if (response.status === 204) {
    return null
  }

  return response.json()
}

const client = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
  put: (path, body) => request(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (path) => request(path, { method: 'DELETE' }),
}

export const deliveryApi = {
  /** 全配送先を取得 */
  getDeliveries: () => client.get('/deliveries'),

  /** 配送先を1件取得 */
  getDelivery: (id) => client.get(`/deliveries/${id}`),

  /** 配送先を作成 */
  createDelivery: (delivery) => client.post('/deliveries', delivery),

  /** 配送先を更新 */
  updateDelivery: (id, delivery) => client.put(`/deliveries/${id}`, delivery),

  /** 配送先を削除 */
  deleteDelivery: (id) => client.delete(`/deliveries/${id}`)
}

export default client
