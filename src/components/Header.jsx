import './Header.css'

/**
 * Application header component
 * @param {Object} props
 * @param {number} [props.deliveryCount] - Total deliveries count
 * @returns {React.ReactElement}
 */
function Header({ deliveryCount = 0 }) {
  return (
    <header className="app-header">
      <div className="header-content">
        <div className="header-title-section">
          <h1 className="header-title">配達ルート管理システム</h1>
          <p className="header-subtitle">Delivery Route Management System</p>
        </div>
        <div className="header-stats">
          <div className="stat-item">
            <span className="stat-label">配達件数</span>
            <span className="stat-value">{deliveryCount}</span>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
