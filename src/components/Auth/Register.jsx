import React, { useState } from 'react'
import axios from 'axios'
import { X, User, Mail, Lock, MapPin, Phone, Calendar } from 'lucide-react'
import './Auth.css'

function Register({ onClose, onSwitchToLogin, onRegisterSuccess }) {
  const [formData, setFormData] = useState({
    ten: '',
    email: '',
    password: '',
    confirmPassword: '',
    dia_chi: '',
    sdt: '',
    ngay_sinh: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    if (!formData.ten || !formData.email || !formData.password) {
      setError('Vui lòng điền đầy đủ thông tin bắt buộc')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp')
      return
    }

    if (formData.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự')
      return
    }

    setLoading(true)
    try {
      const { confirmPassword, ...data } = formData
      const response = await axios.post('/api/auth/register', data)
      if (response.data.message) {
        onRegisterSuccess()
        onSwitchToLogin()
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Đăng ký thất bại')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-modal-overlay" onClick={onClose || undefined}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <div className="auth-header">
          <h2>Đăng ký</h2>
          {onClose && (
            <button className="auth-close" onClick={onClose}>
              <X size={20} />
            </button>
          )}
        </div>
        
        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="auth-error">{error}</div>}
          
          <div className="auth-input-group">
            <User size={18} />
            <input
              type="text"
              name="ten"
              placeholder="Tên *"
              value={formData.ten}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="auth-input-group">
            <Mail size={18} />
            <input
              type="email"
              name="email"
              placeholder="Email *"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="auth-input-group">
            <Lock size={18} />
            <input
              type="password"
              name="password"
              placeholder="Mật khẩu *"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="auth-input-group">
            <Lock size={18} />
            <input
              type="password"
              name="confirmPassword"
              placeholder="Xác nhận mật khẩu *"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="auth-input-group">
            <MapPin size={18} />
            <input
              type="text"
              name="dia_chi"
              placeholder="Địa chỉ"
              value={formData.dia_chi}
              onChange={handleChange}
            />
          </div>
          
          <div className="auth-input-group">
            <Phone size={18} />
            <input
              type="tel"
              name="sdt"
              placeholder="Số điện thoại"
              value={formData.sdt}
              onChange={handleChange}
            />
          </div>
          
          <div className="auth-input-group">
            <Calendar size={18} />
            <input
              type="date"
              name="ngay_sinh"
              placeholder="Ngày sinh"
              value={formData.ngay_sinh}
              onChange={handleChange}
            />
          </div>
          
          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? 'Đang đăng ký...' : 'Đăng ký'}
          </button>
        </form>
        
        <div className="auth-footer">
          <span>Đã có tài khoản? <button className="auth-link" onClick={onSwitchToLogin}>Đăng nhập</button></span>
        </div>
      </div>
    </div>
  )
}

export default Register

