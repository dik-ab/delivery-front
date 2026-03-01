import { useState, useEffect } from 'react'
import adminApi from '../api/admin'
import './AdminUsersPage.css'

function AdminUsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await adminApi.getUsers()
        setUsers(response.data || response || [])
      } catch (err) {
        setError(err.message || 'ユーザーの取得に失敗しました')
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  const getRoleLabel = (role) => {
    const labels = {
      driver: 'ドライバー',
      shipper: '荷主',
      admin: '管理者'
    }
    return labels[role] || role
  }

  if (loading) {
    return (
      <div className="admin-users-page">
        <div className="loading">読み込み中...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="admin-users-page">
        <div className="error-message">{error}</div>
      </div>
    )
  }

  return (
    <div className="admin-users-page">
      <div className="admin-container">
        <h1>ユーザー管理</h1>

        <div className="users-table-wrapper">
          <table className="users-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>名前</th>
                <th>メール</th>
                <th>役割</th>
                <th>会社</th>
                <th>電話番号</th>
                <th>登録日</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>#{user.id}</td>
                  <td className="user-name">{user.name}</td>
                  <td className="user-email">{user.email}</td>
                  <td>
                    <span className={`role-badge role-${user.role}`}>
                      {getRoleLabel(user.role)}
                    </span>
                  </td>
                  <td>{user.company || '-'}</td>
                  <td>{user.phone || '-'}</td>
                  <td>
                    {user.created_at
                      ? new Date(user.created_at).toLocaleDateString('ja-JP')
                      : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {users.length === 0 && (
          <div className="empty-state">
            <p>ユーザーがいません</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminUsersPage
