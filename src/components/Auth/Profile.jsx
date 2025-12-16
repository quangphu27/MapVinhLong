import React, { useState, useEffect } from 'react'
import axios from 'axios'
import API_BASE_URL from '../../config'
import { X, User, Mail, MapPin, Phone, Calendar, Lock } from 'lucide-react'
import './Auth.css'

function Profile({ onClose, user, onUpdateSuccess }) {
  const [formData, setFormData] = useState({
    ten: '',
    email: '',
    dia_chi: '',
    sdt: '',
    ngay_sinh: ''
  })
  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  })
  const [activeTab, setActiveTab] = useState('profile')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      const ngaySinh = user.ngay_sinh ? (user.ngay_sinh.includes('T') ? user.ngay_sinh.split('T')[0] : user.ngay_sinh) : ''
      setFormData({
        ten: user.ten || '',
        email: user.email || '',
        dia_chi: user.dia_chi || '',
        sdt: user.sdt || '',
        ngay_sinh: ngaySinh
      })
    }
  }, [user])

  const loadProfile = async () => {
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const response = await axios.get(`${API_BASE_URL}/api/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (response.data && response.data.user) {
        const userData = response.data.user
        let ngaySinh = ''
        if (userData.ngay_sinh) {
          if (userData.ngay_sinh.includes('T')) {
            ngaySinh = userData.ngay_sinh.split('T')[0]
          } else if (userData.ngay_sinh.includes(' ')) {
            ngaySinh = userData.ngay_sinh.split(' ')[0]
          } else {
            ngaySinh = userData.ngay_sinh
          }
        }
        setFormData({
          ten: userData.ten || '',
          email: userData.email || '',
          dia_chi: userData.dia_chi || '',
          sdt: userData.sdt || '',
          ngay_sinh: ngaySinh
        })
      }
    } catch (err) {
    }
  }

  useEffect(() => {
    loadProfile()
  }, [])

  const handleProfileChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value })
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')

    const token = localStorage.getItem('token')
    if (!token) {
      setError('Chưa đăng nhập')
      return
    }

    setLoading(true)
    try {
      const response = await axios.put(`${API_BASE_URL}/api/auth/profile`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setMessage(response.data.message)
      loadProfile()
      if (onUpdateSuccess) onUpdateSuccess()
    } catch (err) {
      setError(err.response?.data?.error || 'Cập nhật thất bại')
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')

    if (passwordData.new_password !== passwordData.confirm_password) {
      setError('Mật khẩu xác nhận không khớp')
      return
    }

    if (passwordData.new_password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự')
      return
    }

    const token = localStorage.getItem('token')
    if (!token) {
      setError('Chưa đăng nhập')
      return
    }

    setLoading(true)
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/change-password`, {
        old_password: passwordData.old_password,
        new_password: passwordData.new_password
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setMessage(response.data.message)
      setPasswordData({ old_password: '', new_password: '', confirm_password: '' })
    } catch (err) {
      setError(err.response?.data?.error || 'Đổi mật khẩu thất bại')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal profile-modal" onClick={(e) => e.stopPropagation()}>
        <div className="auth-header">
          <h2>Thông tin cá nhân</h2>
          <button className="auth-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        
        <div className="profile-tabs">
          <button 
            className={activeTab === 'profile' ? 'active' : ''}
            onClick={() => setActiveTab('profile')}
          >
            Thông tin
          </button>
          <button 
            className={activeTab === 'password' ? 'active' : ''}
            onClick={() => setActiveTab('password')}
          >
            Đổi mật khẩu
          </button>
        </div>

        {activeTab === 'profile' ? (
          <form onSubmit={handleUpdateProfile} className="auth-form">
            {error && <div className="auth-error">{error}</div>}
            {message && <div className="auth-success">{message}</div>}
            
            <div className="auth-input-group">
              <User size={18} />
              <input
                type="text"
                name="ten"
                placeholder="Tên"
                value={formData.ten}
                onChange={handleProfileChange}
                required
              />
            </div>
            
            <div className="auth-input-group">
              <Mail size={18} />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                disabled
                style={{ opacity: 0.6 }}
              />
            </div>
            
            <div className="auth-input-group">
              <MapPin size={18} />
              <input
                type="text"
                name="dia_chi"
                placeholder="Địa chỉ"
                value={formData.dia_chi}
                onChange={handleProfileChange}
              />
            </div>
            
            <div className="auth-input-group">
              <Phone size={18} />
              <input
                type="tel"
                name="sdt"
                placeholder="Số điện thoại"
                value={formData.sdt}
                onChange={handleProfileChange}
              />
            </div>
            
            <div className="auth-input-group">
              <Calendar size={18} />
              <input
                type="date"
                name="ngay_sinh"
                placeholder="Ngày sinh"
                value={formData.ngay_sinh}
                onChange={handleProfileChange}
              />
            </div>
            
            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? 'Đang cập nhật...' : 'Cập nhật'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleChangePassword} className="auth-form">
            {error && <div className="auth-error">{error}</div>}
            {message && <div className="auth-success">{message}</div>}
            
            <div className="auth-input-group">
              <Lock size={18} />
              <input
                type="password"
                name="old_password"
                placeholder="Mật khẩu cũ"
                value={passwordData.old_password}
                onChange={handlePasswordChange}
                required
              />
            </div>
            
            <div className="auth-input-group">
              <Lock size={18} />
              <input
                type="password"
                name="new_password"
                placeholder="Mật khẩu mới"
                value={passwordData.new_password}
                onChange={handlePasswordChange}
                required
              />
            </div>
            
            <div className="auth-input-group">
              <Lock size={18} />
              <input
                type="password"
                name="confirm_password"
                placeholder="Xác nhận mật khẩu mới"
                value={passwordData.confirm_password}
                onChange={handlePasswordChange}
                required
              />
            </div>
            
            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? 'Đang đổi...' : 'Đổi mật khẩu'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default Profile

