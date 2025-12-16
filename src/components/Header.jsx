import React from 'react'
import './Header.css'

function Header() {
  return (
    <header className="app-header">
      <div className="header-content">
        <div className="header-title">
          <h1>Bản đồ số Vĩnh Long</h1>
          <p>Phân bố dân tộc và địa điểm sinh hoạt văn hóa</p>
        </div>
        <div className="header-badge">
          <span>Tỉnh Vĩnh Long</span>
        </div>
      </div>
    </header>
  )
}

export default Header

