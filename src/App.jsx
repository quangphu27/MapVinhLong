import React, { useState, useEffect } from 'react'
import axios from 'axios'
import API_BASE_URL from './config'
import Map from './components/Map'
import UserMenu from './components/UserMenu'
import './App.css'

function App() {
  const [selectedXa, setSelectedXa] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [pgdList, setPgdList] = useState([])
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  const [filters, setFilters] = useState({
    layers: { danToc: true, diaDiemVanHoa: true, truongHoc: true },
    capHoc: { mam_non: true, tieu_hoc: true, thcs: true, thpt: true },
    loaiHinh: { cong_lap: true, dan_toc_noi_tru: true, tu_thuc: true },
    loaiDiaDiem: {
      'Đình': true,
      'Chùa': true,
      'Nhà văn hóa': true,
      'Đền': true,
      'Miếu': true,
      'Khác': true
    },
    phong: []
  })

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token')
      if (!token) {
        setIsAuthenticated(false)
        setIsChecking(false)
        return
      }

      try {
        const response = await axios.get(`${API_BASE_URL}/api/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (response.data.user) {
          setUser(response.data.user)
          setIsAuthenticated(true)
          localStorage.setItem('user', JSON.stringify(response.data.user))
        } else {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          setIsAuthenticated(false)
        }
      } catch (error) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setIsAuthenticated(false)
      } finally {
        setIsChecking(false)
      }
    }

    checkAuth()
  }, [])

  const handleLoginSuccess = (userData) => {
    setUser(userData)
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  if (isChecking) {
    return (
      <div className="app">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          fontSize: '18px',
          color: '#666'
        }}>
          Đang kiểm tra đăng nhập...
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="app">
        <div className="app-container">
          <UserMenu 
            user={null}
            onLoginSuccess={handleLoginSuccess}
            onLogout={handleLogout}
            autoShowLogin={true}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <div className="app-container">
        <UserMenu 
          user={user}
          onLoginSuccess={handleLoginSuccess}
          onLogout={handleLogout}
        />
        <Map 
          selectedXa={selectedXa}
          onXaSelect={setSelectedXa}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filters={filters}
          setFilters={setFilters}
          pgdList={pgdList}
          setPgdList={setPgdList}
        />
      </div>
    </div>
  )
}

export default App

