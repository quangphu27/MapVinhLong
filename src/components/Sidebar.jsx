import React, { useState, useEffect } from 'react'
import axios from 'axios'
import API_BASE_URL from '../config'
import { Search, Users, MapPin, X, Info, Building2 } from 'lucide-react'
import './Sidebar.css'

function Sidebar({ selectedXa, onXaSelect, searchQuery, onSearchChange, filters, setFilters, pgdList }) {
  const [searchResults, setSearchResults] = useState([])
  const [danTocData, setDanTocData] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (searchQuery.length > 0) {
      const timeoutId = setTimeout(() => {
        handleSearch(searchQuery)
      }, 300)
      return () => clearTimeout(timeoutId)
    } else {
      setSearchResults([])
    }
  }, [searchQuery])

  useEffect(() => {
    if (selectedXa) {
      loadDanTocData(selectedXa.ma_xa)
    }
  }, [selectedXa])

  const handleSearch = async (query) => {
    if (!query) {
      setSearchResults([])
      return
    }

    try {
      setLoading(true)
      const response = await axios.get(`${API_BASE_URL}/api/search?q=${encodeURIComponent(query)}`)
      setSearchResults(response.data.results || [])
    } catch (error) {
    } finally {
      setLoading(false)
    }
  }

  const loadDanTocData = async (maXa) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/dan-toc?ma_xa=${maXa}`)
      setDanTocData(response.data.data || [])
    } catch (error) {
    }
  }

  return (
    <div className="sidebar">
      <div className="search-section">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Tìm kiếm xã/phường..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        
        {loading && <div className="loading-text">Đang tìm kiếm...</div>}
        
        {searchResults.length > 0 && (
          <div className="search-results">
            {searchResults.map((result, index) => (
              <div 
                key={index} 
                className="search-result-item"
                onClick={() => {
                  onXaSelect(result)
                  onSearchChange('')
                }}
              >
                <div className="result-name">{result.ten_xa}</div>
                <div className="result-info">
                  {result.loai} • Dân số: {result.dan_so?.toLocaleString('vi-VN') || 'N/A'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedXa && (
        <div className="info-section">
          <div className="info-header">
            <h3>Thông tin xã/phường</h3>
            <button className="close-btn" onClick={() => onXaSelect(null)}>
              <X size={18} />
            </button>
          </div>
          
          <div className="info-content">
            <div className="info-item">
              <Info size={16} />
              <div>
                <strong>{selectedXa.ten_xa}</strong>
                <div className="info-detail">{selectedXa.loai}</div>
              </div>
            </div>
            
            <div className="info-grid">
              <div className="info-card">
                <div className="info-label">Diện tích</div>
                <div className="info-value">{selectedXa.dtich_km2 || 0} km²</div>
              </div>
              <div className="info-card">
                <div className="info-label">Dân số</div>
                <div className="info-value">{selectedXa.dan_so?.toLocaleString('vi-VN') || 'N/A'}</div>
              </div>
              <div className="info-card">
                <div className="info-label">Mật độ</div>
                <div className="info-value">{selectedXa.matdo_km2?.toFixed(2) || 'N/A'} người/km²</div>
              </div>
            </div>

            {selectedXa.sap_nhap && (
              <div className="info-note">
                <strong>Sáp nhập:</strong> {selectedXa.sap_nhap}
              </div>
            )}
          </div>

          <div className="data-section">
        <h4>
          <Users size={18} />
          Phân bố dân tộc
        </h4>
        {danTocData.length > 0 ? (
          <div className="data-list">
            {danTocData.map((item, index) => (
              <div key={index} className="data-item">
                <span className="data-name">{item.dan_toc}</span>
                <span className="data-value">{item.so_luong?.toLocaleString('vi-VN')} người</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">Chưa có dữ liệu</div>
        )}
      </div>
        </div>
      )}
    </div>
  )
}

export default Sidebar

