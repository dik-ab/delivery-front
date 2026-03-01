import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1'

const client = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor - add auth token
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor
client.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // Handle 401 - redirect to login
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
      window.location.href = '/login'
    }
    console.error('API Error:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

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
