import React, { useEffect, useRef, useMemo, useState } from 'react'
import { MapContainer, TileLayer, GeoJSON, useMap, Marker, Popup, ZoomControl, Polyline, CircleMarker } from 'react-leaflet'
import L from 'leaflet'
import axios from 'axios'
import API_BASE_URL from '../config'
import 'leaflet/dist/leaflet.css'
import { Sun, Moon, Globe2, Satellite, Trees, Filter, MapPin, Building2, School, Search, Menu, Layers, Users } from 'lucide-react'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

function FitBounds({ geojson }) {
  const map = useMap()
  
  useEffect(() => {
    if (geojson && geojson.features && geojson.features.length > 0) {
      const bounds = L.geoJSON(geojson).getBounds()
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50] })
      }
    }
  }, [geojson, map])
  
  return null
}

function ZoomToFeature({ selectedXa, geojsonData }) {
  const map = useMap()
  
  useEffect(() => {
    if (selectedXa && geojsonData && geojsonData.features) {
      const feature = geojsonData.features.find(
        f => f.properties.ma_xa === selectedXa.ma_xa
      )
      if (feature && feature.geometry) {
        const bounds = L.geoJSON(feature).getBounds()
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [100, 100], maxZoom: 14 })
        }
      }
    }
  }, [selectedXa, geojsonData, map])
  
  return null
}

const BASE_LAYERS = {
  default: {
    key: 'default',
    label: 'Mặc định',
    icon: <Globe2 size={16} />,
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors'
  },
  satellite: {
    key: 'satellite',
    label: 'Vệ tinh',
    icon: <Satellite size={16} />,
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri'
  },
  light: {
    key: 'light',
    label: 'Sáng',
    icon: <Sun size={16} />,
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; OpenStreetMap, &copy; CARTO'
  },
  dark: {
    key: 'dark',
    label: 'Tối',
    icon: <Moon size={16} />,
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; OpenStreetMap, &copy; CARTO'
  },
  outdoor: {
    key: 'outdoor',
    label: 'Ngoài trời',
    icon: <Trees size={16} />,
    url: 'https://tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenTopoMap'
  }
}

function BasemapToggle({ active, onChange }) {
  return (
    <div className="basemap-toggle">
      {Object.values(BASE_LAYERS).map(layer => (
        <button
          key={layer.key}
          className={`basemap-btn ${active === layer.key ? 'active' : ''}`}
          onClick={() => onChange(layer.key)}
        >
          {layer.icon}
          <span>{layer.label}</span>
        </button>
      ))}
    </div>
  )
}

function MapReadyRef({ mapRef }) {
  const map = useMap()
  useEffect(() => {
    if (map && mapRef) {
      mapRef.current = map
    }
  }, [map, mapRef])
  return null
}

function SearchBar({
  searchQuery,
  setSearchQuery,
  results,
  onSelect,
}) {
  return (
    <div className="search-box-floating">
      <Search size={18} />
      <input
        type="text"
        placeholder="Tìm kiếm trường, PGD, xã/phường, địa điểm..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      {results.length > 0 && (
        <div className="search-dropdown">
          {results.map(item => (
            <div
              key={item.id}
              className="search-item"
              onClick={() => onSelect(item)}
            >
              <div className="search-item-title">{item.label}</div>
              <div className="search-item-sub">{item.type}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function FilterPanel({ filters, onToggle, isOpen, onToggleOpen, phuongXaList, phuongXaDropdownOpen, setPhuongXaDropdownOpen, phuongXaSearch, setPhuongXaSearch, diaDiemList, diaDiemDropdownOpen, setDiaDiemDropdownOpen, diaDiemSearch, setDiaDiemSearch, onXaSelect }) {
  const [danTocSearchQuery, setDanTocSearchQuery] = useState('')
  const [danTocSearchResults, setDanTocSearchResults] = useState([])
  const [danTocSearchLoading, setDanTocSearchLoading] = useState(false)
  
  useEffect(() => {
    if (danTocSearchQuery.length > 0) {
      const timeoutId = setTimeout(() => {
        handleDanTocSearch(danTocSearchQuery)
      }, 300)
      return () => clearTimeout(timeoutId)
    } else {
      setDanTocSearchResults([])
    }
  }, [danTocSearchQuery])
  
  const handleDanTocSearch = async (query) => {
    if (!query.trim()) {
      setDanTocSearchResults([])
      return
    }
    
    try {
      setDanTocSearchLoading(true)
      const response = await axios.get(`${API_BASE_URL}/api/dan-toc/search?q=${encodeURIComponent(query)}`)
      setDanTocSearchResults(response.data.results || [])
    } catch (error) {
      setDanTocSearchResults([])
    } finally {
      setDanTocSearchLoading(false)
    }
  }
  
  const handleSelectDanTocResult = (result) => {
    if (onXaSelect && result.ma_xa) {
      onXaSelect({
        ma_xa: result.ma_xa,
        ten_xa: result.ten_xa,
        loai: result.loai
      })
      setDanTocSearchQuery('')
      setDanTocSearchResults([])
    }
  }
  
  if (!isOpen) return null

  return (
    <div className="filter-panel open">
      <div className="filter-header" onClick={onToggleOpen}>
        <div className="filter-title">Bộ lọc</div>
        <div className="filter-toggle">Ẩn</div>
      </div>
      <div className="filter-section">
        <div className="filter-label">
          <MapPin size={14} /> Phường/Xã
        </div>
        <div className="pgd-select">
          <div
            className="pgd-select-box"
            onClick={() => setPhuongXaDropdownOpen(!phuongXaDropdownOpen)}
          >
            <span className="pgd-placeholder">
              {filters.phuongXa.length > 0 ? `Đã chọn ${filters.phuongXa.length}` : 'Tất cả'}
            </span>
            <span className="pgd-caret">▾</span>
          </div>
          {phuongXaDropdownOpen && (
            <div className="pgd-dropdown">
              <div className="pgd-search">
                <input
                  type="text"
                  placeholder="Tìm phường/xã..."
                  value={phuongXaSearch}
                  onChange={(e) => setPhuongXaSearch(e.target.value)}
                />
              </div>
              <div className="pgd-options">
                {phuongXaList
                  .filter(p => p.ten.toLowerCase().includes(phuongXaSearch.toLowerCase()))
                  .map(p => (
                    <label className="pgd-option" key={p.ma_xa}>
                      <input
                        type="checkbox"
                        checked={filters.phuongXa.includes(p.ma_xa)}
                        onChange={() => onToggle('phuongXaMulti', p.ma_xa)}
                      />
                      <span>{p.ten}</span>
                    </label>
                  ))}
                {phuongXaList.length === 0 && <div className="empty-state">Chưa có phường/xã</div>}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="filter-section">
        <div className="filter-label">
          <Building2 size={14} /> Địa điểm văn hóa
        </div>
        <div className="pgd-select">
          <div
            className="pgd-select-box"
            onClick={() => setDiaDiemDropdownOpen(!diaDiemDropdownOpen)}
          >
            <span className="pgd-placeholder">
              {filters.diaDiem.length > 0 ? `Đã chọn ${filters.diaDiem.length}` : 'Tất cả'}
            </span>
            <span className="pgd-caret">▾</span>
          </div>
          {diaDiemDropdownOpen && (
            <div className="pgd-dropdown">
              <div className="pgd-search">
                <input
                  type="text"
                  placeholder="Tìm địa điểm văn hóa..."
                  value={diaDiemSearch}
                  onChange={(e) => setDiaDiemSearch(e.target.value)}
                />
              </div>
              <div className="pgd-options">
                {diaDiemList
                  .filter(d => (d.ten || '').toLowerCase().includes(diaDiemSearch.toLowerCase()))
                  .map(d => (
                    <label className="pgd-option" key={d.id}>
                      <input
                        type="checkbox"
                        checked={filters.diaDiem.includes(String(d.id))}
                        onChange={() => onToggle('diaDiemMulti', String(d.id))}
                      />
                      <span>{d.ten}</span>
                    </label>
                  ))}
                {diaDiemList.length === 0 && <div className="empty-state">Chưa có địa điểm</div>}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="filter-section">
        <div className="filter-label">
          <Users size={14} /> Dân tộc
        </div>
        {[
          'Kinh',
          'Chăm',
          'Nùng',
          'Thái',
          'Mường'
        ].map(name => (
          <label className="filter-checkbox" key={name}>
            <input
              type="checkbox"
              checked={filters.danTocFilter === name}
              onChange={() => onToggle('danTocFilterSingle', name)}
            />
            <span>{name}</span>
          </label>
        ))}
      </div>

      <div className="filter-section">
        <div className="filter-label">
          <Layers size={14} /> Hiển thị trên bản đồ
        </div>
        {[
          {key: 'danToc', label: 'Phân bố dân tộc'},
          {key: 'diaDiemVanHoa', label: 'Địa điểm văn hóa'},
          {key: 'truongHoc', label: 'Trường học'},
        ].map(item => (
          <label className="filter-checkbox" key={item.key}>
            <input
              type="checkbox"
              checked={filters.layers[item.key]}
              onChange={() => onToggle('layers', item.key)}
            />
            <span>{item.label}</span>
          </label>
        ))}
      </div>
      
      {filters.layers.danToc && (
        <div className="filter-section">
          <div className="filter-label">
            <Search size={14} /> Tìm kiếm theo dân tộc
          </div>
          <div className="dan-toc-search-box">
            <Search size={16} />
            <input
              type="text"
              placeholder="Nhập tên dân tộc (ví dụ: Kinh, Khmer)..."
              value={danTocSearchQuery}
              onChange={(e) => setDanTocSearchQuery(e.target.value)}
            />
          </div>
          {danTocSearchLoading && (
            <div className="dan-toc-search-loading">Đang tìm kiếm...</div>
          )}
          {danTocSearchResults.length > 0 && (
            <div className="dan-toc-search-results">
              {danTocSearchResults.map((result, index) => (
                <div
                  key={index}
                  className="dan-toc-search-item"
                  onClick={() => handleSelectDanTocResult(result)}
                >
                  <div className="dan-toc-search-item-name">
                    {result.ten_xa} - {result.dan_toc}
                  </div>
                  <div className="dan-toc-search-item-info">
                    {result.so_luong?.toLocaleString('vi-VN')} người ({result.ty_le}%)
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function DanTocLegend({ filters }) {
  if (!filters.layers.danToc) return null

  const danTocColors = {
    'Kinh': '#339af0',
    'Khmer': '#51cf66',
    'Hoa': '#ffd43b',
    'Thái': '#f06595',
    'Mường': '#845ef7',
    'Nùng': '#20c997',
    'Chăm': '#fa5252',
    'Tày': '#ff922b',
  }

  return (
    <div className="dan-toc-legend">
      <div className="legend-header">
        <strong>Dân tộc chủ đạo</strong>
      </div>
      <div className="legend-items">
        {Object.entries(danTocColors).map(([danToc, color]) => (
          <div key={danToc} className="legend-item">
            <div className="legend-color" style={{ backgroundColor: color }}></div>
            <span className="legend-label">{danToc}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function Map({ selectedXa, onXaSelect, searchQuery, setSearchQuery, filters, setFilters, phuongXaList, setPhuongXaList }) {
  const [phuongXaData, setPhuongXaData] = React.useState(null)
  const [tinhThanhData, setTinhThanhData] = React.useState(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState(null)
  const [baseLayer, setBaseLayer] = React.useState('default')
  const [diaDiem, setDiaDiem] = React.useState([])
  const [truongHoc, setTruongHoc] = React.useState([])
  const [pgdData, setPgdData] = React.useState([])
  const [filterOpen, setFilterOpen] = React.useState(true)
  const [baseToggleOpen, setBaseToggleOpen] = React.useState(false)
  const [phuongXaDropdownOpen, setPhuongXaDropdownOpen] = React.useState(false)
  const [phuongXaSearch, setPhuongXaSearch] = React.useState('')
  const [diaDiemDropdownOpen, setDiaDiemDropdownOpen] = React.useState(false)
  const [diaDiemSearch, setDiaDiemSearch] = React.useState('')
  const [diaDiemList, setDiaDiemList] = React.useState([])
  const mapRef = React.useRef(null)
  const [userLocation, setUserLocation] = React.useState(null)
  const [routeCoords, setRouteCoords] = React.useState([])
  const [routeInfo, setRouteInfo] = React.useState(null)
  const [routeTarget, setRouteTarget] = React.useState(null)
  const [routeStartInput, setRouteStartInput] = React.useState('')
  const geoJsonRef = useRef(null)

  useEffect(() => {
    const loadGeoJSON = async () => {
      try {
        setLoading(true)
        const [phuongXaRes, tinhThanhRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/geojson/phuong-xa`),
          axios.get(`${API_BASE_URL}/api/geojson/tinh-thanh`)
        ])
        setPhuongXaData(phuongXaRes.data)
        setTinhThanhData(tinhThanhRes.data)
        if (phuongXaRes.data?.features) {
          const list = phuongXaRes.data.features.map(f => ({
            ma_xa: String(f.properties.ma_xa || ''),
            ten: f.properties.ten_xa || f.properties.ten || ''
          })).filter(p => p.ma_xa && p.ten).sort((a, b) => a.ten.localeCompare(b.ten, 'vi'))
          setPhuongXaList(list)
        }
        setError(null)
      } catch (err) {
        setError('Không thể tải dữ liệu bản đồ')
      } finally {
        setLoading(false)
      }
    }
    
    loadGeoJSON()
  }, [])

  useEffect(() => {
    const loadPoints = async () => {
      try {
        const [ddvhRes, pgdRes, truongRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/dia-diem-van-hoa`),
          axios.get(`${API_BASE_URL}/api/phong-giao-dich`),
          axios.get(`${API_BASE_URL}/api/truong-hoc`)
        ])
        const ddvh = ddvhRes.data.data || []
        setDiaDiem(ddvh)
        const ddvhList = ddvh
          .map(d => ({
            id: d.id,
            ten: d.ten_dia_diem || ''
          }))
          .filter(d => d.id && d.ten)
          .sort((a, b) => a.ten.localeCompare(b.ten, 'vi'))
        setDiaDiemList(ddvhList)
        const pgd = pgdRes.data.data || []
        setPgdData(pgd)
        setTruongHoc(truongRes.data.data || [])
      } catch (e) {
      }
    }
    loadPoints()
  }, [])

  const getStyle = (feature) => {
    const maXa = String(feature.properties.ma_xa || '')
    const isSelected = selectedXa && String(selectedXa.ma_xa || '') === maXa
    const props = feature.properties
    const isFilterSelected = filters.phuongXa.includes(maXa)
    const danTocPhanBo = props.dan_toc_phan_bo || []
    const selectedDanToc = filters.danTocFilter || ''
    
    let danTocChuDao = props.dan_toc_chu_dao || 'Kinh'

    const danTocColors = {
      'Kinh': '#339af0',
      'Khmer': '#51cf66',
      'Hoa': '#ffd43b',
      'Tày': '#ff922b',
      'Thái': '#f06595',
      'Mường': '#845ef7',
      'Nùng': '#20c997',
      'Chăm': '#fa5252',
      'H\'Mông': '#fd7e14',
      'Dao': '#e83e8c',
      'Gia-rai': '#0dcaf0',
      'Ê-đê': '#198754',
      'Ba-na': '#6f42c1',
      'Xơ-đăng': '#d63384',
      'Cơ-ho': '#20c997',
      'Sán Dìu': '#ffc107',
      'Hrê': '#0d6efd',
      'Mnông': '#6610f2',
      'Ra-glai': '#fd7e14',
      'Xtiêng': '#dc3545',
      'Bru-Vân Kiều': '#198754',
      'Thổ': '#6c757d',
      'Giấy': '#ffc107',
      'Cơ-tu': '#20c997',
      'Giáy': '#fd7e14',
      'La Chí': '#6f42c1',
      'La Ha': '#d63384',
      'Lự': '#0dcaf0',
      'Lào': '#198754',
      'Lô Lô': '#6610f2',
      'Chứt': '#dc3545',
      'Mảng': '#6c757d',
      'Pà Thẻn': '#ffc107',
      'Co': '#20c997',
      'Ngái': '#fd7e14',
      'Xinh Mun': '#6f42c1',
      'Hà Nhì': '#d63384',
      'Chu-ru': '#0dcaf0',
      'Kháng': '#198754',
      'Phù Lá': '#6610f2',
      'La Hủ': '#dc3545',
      'Ơ Đu': '#6c757d',
      'Rơ Măm': '#ffc107',
      'Brâu': '#20c997',
      'default': '#868e96'
    }

    if (selectedDanToc && (!danTocPhanBo || !danTocPhanBo.some(dt => dt.dan_toc === selectedDanToc))) {
      return {
        fillColor: '#ffffff',
        fillOpacity: 0,
        color: '#ced4da',
        weight: 1,
        opacity: 0.7
      }
    }
    
    if (selectedDanToc) {
      danTocChuDao = selectedDanToc
    }
    
    const baseColor = danTocColors[danTocChuDao] || danTocColors['default']
    const showDanToc = filters.layers.danToc || !!selectedDanToc
    
    if (isFilterSelected) {
      return {
        fillColor: '#2ecc71',
        fillOpacity: 0.6,
        color: '#27ae60',
        weight: 3,
        opacity: 1
      }
    }
    
    if (isSelected) {
      return {
        fillColor: '#ff6b6b',
        fillOpacity: 0.5,
        color: '#c92a2a',
        weight: 3,
        opacity: 0.9
      }
    }
    
    return {
      fillColor: baseColor,
      fillOpacity: showDanToc ? 0.5 : 0,
      color: showDanToc ? baseColor : '#2d3436',
      weight: showDanToc ? 2 : 1,
      opacity: 0.9
    }
  }

  const onEachFeature = (feature, layer) => {
    const props = feature.properties
    const danTocPhanBo = props.dan_toc_phan_bo || []
    
    let danTocHtml = ''
    if (danTocPhanBo.length > 0) {
      danTocHtml = '<div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #dee2e6;"><strong>Phân bố dân tộc:</strong><ul style="margin: 5px 0; padding-left: 20px;">'
      danTocPhanBo.forEach(dt => {
        danTocHtml += `<li style="margin: 3px 0;">${dt.dan_toc}: ${dt.so_luong?.toLocaleString('vi-VN') || 0} người (${dt.ty_le || 0}%)</li>`
      })
      danTocHtml += '</ul></div>'
    }
    
    const popupContent = `
      <div style="min-width: 200px;">
        <h3 style="margin: 0 0 10px 0; color: #2d3436;">${props.ten_xa || 'N/A'}</h3>
        <p style="margin: 5px 0;"><strong>Loại:</strong> ${props.loai || 'N/A'}</p>
        <p style="margin: 5px 0;"><strong>Diện tích:</strong> ${props.dtich_km2 || 0} km²</p>
        <p style="margin: 5px 0;"><strong>Dân số:</strong> ${props.dan_so ? props.dan_so.toLocaleString('vi-VN') : 'N/A'}</p>
        <p style="margin: 5px 0;"><strong>Mật độ:</strong> ${props.matdo_km2 ? props.matdo_km2.toFixed(2) : 'N/A'} người/km²</p>
        ${props.dan_toc_chu_dao ? `<p style="margin: 5px 0;"><strong>Dân tộc chủ đạo:</strong> ${props.dan_toc_chu_dao}</p>` : ''}
        ${danTocHtml}
        ${props.sap_nhap ? `<p style="margin: 5px 0;"><strong>Sáp nhập:</strong> ${props.sap_nhap}</p>` : ''}
      </div>
    `
    layer.bindPopup(popupContent)
    
    layer.on({
      click: () => {
        onXaSelect({
          ma_xa: props.ma_xa,
          ten_xa: props.ten_xa,
          ...props
        })
      }
    })
  }

  const filterFeatures = (data) => {
    if (!data || !data.features) return data
    if (!searchQuery) return data
    
    const filtered = {
      ...data,
      features: data.features.filter(feature => {
        const tenXa = feature.properties.ten_xa?.toLowerCase() || ''
        return tenXa.includes(searchQuery.toLowerCase())
      })
    }
    return filtered
  }

  const toggleFilter = (group, key) => {
    if (group === 'phuongXaMulti') {
      setFilters(prev => {
        const value = String(key)
        const exists = prev.phuongXa.includes(value)
        const nextPhuongXa = exists ? prev.phuongXa.filter(id => id !== value) : [...prev.phuongXa, value]
        return { ...prev, phuongXa: nextPhuongXa }
      })
      return
    }

    if (group === 'diaDiemMulti') {
      setFilters(prev => {
        const value = String(key)
        const exists = prev.diaDiem.includes(value)
        const nextDiaDiem = exists ? prev.diaDiem.filter(id => id !== value) : [...prev.diaDiem, value]
        return { ...prev, diaDiem: nextDiaDiem }
      })
      return
    }

    if (group === 'danTocFilterSingle') {
      setFilters(prev => {
        const value = String(key)
        return { ...prev, danTocFilter: prev.danTocFilter === value ? '' : value }
      })
      return
    }

    if (group === 'layers') {
      setFilters(prev => ({
        ...prev,
        layers: { ...prev.layers, [key]: !prev.layers[key] }
      }))
      return
    }

    setFilters(prev => ({
      ...prev,
      [group]: { ...prev[group], [key]: !prev[group][key] }
    }))
  }

  const diaDiemIcon = (loai) => {
    const colorMap = {
      'Đình': '#f08c00',
      'Chùa': '#845ef7',
      'Nhà văn hóa': '#20c997',
      'Đền': '#d9480f',
      'Miếu': '#2f9e44',
      'Khác': '#228be6'
    }
    return L.divIcon({
      className: 'pgd-marker',
      html: `<div class="pgd-pin" style="background:${colorMap[loai] || '#228be6'}"><span class="icon-emoji">🏘️</span></div>`
    })
  }

  const schoolIcon = (cap) => {
    const colorMap = {
      mam_non: '#ff922b',
      tieu_hoc: '#1c7ed6',
      thcs: '#845ef7',
      thpt: '#2f9e44'
    }
    const color = colorMap[cap] || '#0d6efd'
    return L.divIcon({
      className: 'school-marker',
      html: `<div class="school-pin" style="background:${color}"><span class="icon-emoji">🏫</span></div>`
    })
  }

  const pgdIcon = L.divIcon({
    className: 'pgd-marker',
    html: `<div class="pgd-pin" style="background:#0d6efd"><span class="icon-emoji">🏢</span></div>`
  })

const CAP_HOC_LABEL = {
  mam_non: 'Mầm non',
  tieu_hoc: 'Tiểu học',
  thcs: 'THCS',
  thpt: 'THPT',
  khac: 'Khác'
}

  const matchQuery = (text) => {
    if (!searchQuery) return true
    return (text || '').toLowerCase().includes(searchQuery.toLowerCase())
  }

  const requestRoute = async (from, to) => {
    if (!from || !to) return
    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${from[1]},${from[0]};${to[1]},${to[0]}?overview=full&geometries=geojson`
      const res = await fetch(url)
      const data = await res.json()
      if (data.code === 'Ok' && data.routes?.[0]) {
        const route = data.routes[0]
        const coords = route.geometry.coordinates.map(([lng, lat]) => [lat, lng])
        setRouteCoords(coords)
        setRouteInfo({
          distance: route.distance,
          duration: route.duration
        })
      }
    } catch (err) {
    }
  }

  const parseLatLng = (text) => {
    if (!text) return null
    const parts = text.split(',').map(s => s.trim())
    if (parts.length !== 2) return null
    const lat = parseFloat(parts[0])
    const lng = parseFloat(parts[1])
    if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng }
    return null
  }

  const searchResults = useMemo(() => {
    if (!searchQuery || searchQuery.length < 2) return []
    const q = searchQuery.toLowerCase()
    const results = []

    if (phuongXaData?.features) {
      phuongXaData.features.forEach((f) => {
        const name = f.properties.ten_xa || ''
        if (name.toLowerCase().includes(q)) {
          const bounds = L.geoJSON(f).getBounds()
          const center = bounds.getCenter()
          results.push({
            id: `xa-${f.properties.ma_xa || name}`,
            label: name,
            type: 'Khu vực',
            coords: [center.lat, center.lng],
            bounds,
            feature: f
          })
        }
      })
    }

    const allPgd = pgdData || []
    allPgd.forEach((p) => {
      if ((p.ten || '').toLowerCase().includes(q)) {
        results.push({
          id: `pgd-${p.id}`,
          label: p.ten,
          type: 'PGD',
          coords: [p.vi_do, p.kinh_do],
          zoom: 15
        })
      }
    })

    truongHoc.forEach((t) => {
      if ((t.ten || '').toLowerCase().includes(q)) {
        results.push({
          id: `school-${t.id}`,
          label: t.ten,
          type: 'Trường học',
          coords: [t.vi_do, t.kinh_do],
          zoom: 16
        })
      }
    })

    diaDiem.forEach((d) => {
      if ((d.ten_dia_diem || '').toLowerCase().includes(q)) {
        results.push({
          id: `ddvh-${d.id}`,
          label: d.ten_dia_diem,
          type: 'Địa điểm',
          coords: [d.vi_do, d.kinh_do],
          zoom: 16
        })
      }
    })

    return results.slice(0, 12)
  }, [searchQuery, phuongXaData, pgdData, truongHoc, diaDiem])

  const handleSelectSearch = (item) => {
    setSearchQuery('')
    setPgdDropdownOpen(false)

    const map = mapRef.current
    if (!map) {
      return
    }

    if (item.coords) {
      setRouteTarget({ label: item.label, coords: item.coords })
    } else if (item.bounds) {
      const center = item.bounds.getCenter()
      setRouteTarget({ label: item.label, coords: [center.lat, center.lng] })
    } else {
      setRouteTarget(null)
    }
    setRouteCoords([])
    setRouteInfo(null)

    const moveAndPopup = () => {
      let content = `<strong>${item.label}</strong>`

      if (item.type === 'PGD') {
        content += '<div>Phòng giao dịch</div>'
        const found = pgdData.find(p => String(p.id) === String(item.id.replace('pgd-', '')))
        if (found?.vi_do && found?.kinh_do) {
          content += `<div>Tọa độ: ${found.vi_do.toFixed(4)}, ${found.kinh_do.toFixed(4)}</div>`
        }
      }

      if (item.type === 'Trường học') {
        const found = truongHoc.find(t => String(t.id) === String(item.id.replace('school-', '')))
        if (found) {
          content += `<div>Cấp: ${formatCap(found.cap_hoc)}</div>`
          content += `<div>Loại hình: ${formatLoai(found.loai_hinh)}</div>`
          if (found.ten_xa) content += `<div>Xã/Phường: ${found.ten_xa}</div>`
          if (found.dia_chi) content += `<div>Địa chỉ: ${found.dia_chi}</div>`
          if (found.vi_do && found.kinh_do) {
            content += `<div>Tọa độ: ${found.vi_do.toFixed(4)}, ${found.kinh_do.toFixed(4)}</div>`
          }
        }
      }

      if (item.type === 'Địa điểm') {
        const found = diaDiem.find(d => String(d.id) === String(item.id.replace('ddvh-', '')))
        if (found) {
          if (found.loai_dia_diem) content += `<div>Loại: ${found.loai_dia_diem}</div>`
          if (found.ten_xa) content += `<div>Xã/Phường: ${found.ten_xa}</div>`
          if (found.dia_chi) content += `<div>Địa chỉ: ${found.dia_chi}</div>`
          if (found.vi_do && found.kinh_do) {
            content += `<div>Tọa độ: ${found.vi_do.toFixed(4)}, ${found.kinh_do.toFixed(4)}</div>`
          }
        }
      }

      if (item.type === 'Khu vực' && item.feature?.properties) {
        const props = item.feature.properties
        if (props.ten_xa) content += `<div>Xã/Phường: ${props.ten_xa}</div>`
        if (props.ma_xa) content += `<div>Mã xã: ${props.ma_xa}</div>`
        onXaSelect?.(props)
      }

      const targetCoords = item.coords
        ? item.coords
        : item.bounds
          ? (() => {
              const c = item.bounds.getCenter()
              return [c.lat, c.lng]
            })()
          : null

      if (targetCoords) {
        L.popup({ closeOnClick: true })
          .setLatLng(targetCoords)
          .setContent(content)
          .openOn(map)
      } else if (item.bounds) {
        const center = item.bounds.getCenter()
        L.popup({ closeOnClick: true })
          .setLatLng(center)
          .setContent(content)
          .openOn(map)
      }

      if (userLocation && targetCoords) {
        requestRoute([userLocation.lat, userLocation.lng], targetCoords)
      } else if (routeStartInput) {
        const parsed = parseLatLng(routeStartInput)
        if (parsed && targetCoords) {
          setUserLocation({ lat: parsed.lat, lng: parsed.lng })
          requestRoute([parsed.lat, parsed.lng], targetCoords)
        }
      }
    }

    const openAfterMove = () => {
      map.off('moveend', openAfterMove)
      moveAndPopup()
    }

    const current = map.getCenter()
    const targetPoint = item.coords
    const hasCoords = Array.isArray(targetPoint) && targetPoint.length === 2

    if (!item.bounds && !hasCoords) {
      moveAndPopup()
      return
    }

    if (item.bounds) {
      const center = item.bounds.getCenter()
      const closeEnough =
        Math.abs(center.lat - current.lat) < 0.0005 &&
        Math.abs(center.lng - current.lng) < 0.0005

      if (closeEnough) {
        moveAndPopup()
      } else {
        map.once('moveend', openAfterMove)
        map.fitBounds(item.bounds, { padding: [80, 80], maxZoom: 14 })
        setTimeout(openAfterMove, 1200)
      }
      return
    }

    if (hasCoords) {
      const closeEnough =
        Math.abs(targetPoint[0] - current.lat) < 0.0005 &&
        Math.abs(targetPoint[1] - current.lng) < 0.0005

      if (closeEnough) {
        moveAndPopup()
      } else {
        map.once('moveend', openAfterMove)
        map.flyTo(targetPoint, item.zoom || 14)
        setTimeout(openAfterMove, 1200)
      }
      return
    }
  }

  const handleLocate = () => {
    const map = mapRef.current
    if (!map || !navigator.geolocation) {
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        setUserLocation({ lat: latitude, lng: longitude })
        setRouteCoords([])
        setRouteInfo(null)
        map.flyTo([latitude, longitude], 15)
        L.popup({ closeOnClick: true })
          .setLatLng([latitude, longitude])
          .setContent('<strong>Vị trí của bạn</strong>')
          .openOn(map)

        if (routeTarget?.coords) {
          requestRoute([latitude, longitude], routeTarget.coords)
        }
      },
      () => {
        alert('Không lấy được vị trí hiện tại.')
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 10000 }
    )
  }

  const handleRouteFromInput = () => {
    if (!routeTarget?.coords) return
    const parsed = parseLatLng(routeStartInput)
    if (!parsed) {
      alert('Nhập tọa độ dạng "lat,lng" (vd: 10.123,105.456)')
      return
    }
    setUserLocation({ lat: parsed.lat, lng: parsed.lng })
    requestRoute([parsed.lat, parsed.lng], routeTarget.coords)
    const map = mapRef.current
    if (map) {
      map.flyTo([parsed.lat, parsed.lng], 14)
      L.popup({ closeOnClick: true })
        .setLatLng([parsed.lat, parsed.lng])
        .setContent('<strong>Điểm bắt đầu</strong>')
        .openOn(map)
    }
  }

const LOAI_HINH_LABEL = {
  cong_lap: 'Công lập',
  dan_toc_noi_tru: 'Dân tộc nội trú',
  tu_thuc: 'Tư thục',
  khac: 'Khác'
}

function formatCap(cap) {
  return CAP_HOC_LABEL[cap] || cap || ''
}

function formatLoai(loai) {
  return LOAI_HINH_LABEL[loai] || loai || ''
}

  if (loading) {
    return (
      <div className="map-container loading">
        <div className="loading-spinner">Đang tải bản đồ...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="map-container error">
        <div className="error-message">{error}</div>
      </div>
    )
  }

  return (
    <div className="map-container">
      <MapContainer
        center={[10.25, 105.97]}
        zoom={10}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
        whenCreated={(map) => { mapRef.current = map }}
      >
        <MapReadyRef mapRef={mapRef} />
        <TileLayer
          key={baseLayer}
          attribution={BASE_LAYERS[baseLayer].attribution}
          url={BASE_LAYERS[baseLayer].url}
        />
        <ZoomControl position="bottomright" />
        
        {tinhThanhData && (
          <GeoJSON
            data={tinhThanhData}
            style={{
              fillOpacity: 0,
              color: '#1c7ed6',
              weight: 2.5
            }}
          />
        )}
        
        {phuongXaData && (
          <>
            <GeoJSON
              ref={geoJsonRef}
              data={filterFeatures(phuongXaData)}
              style={getStyle}
              onEachFeature={onEachFeature}
            />
            {!selectedXa && <FitBounds geojson={filterFeatures(phuongXaData)} />}
            <ZoomToFeature selectedXa={selectedXa} geojsonData={phuongXaData} />
          </>
        )}
        {userLocation && (
          <CircleMarker
            center={[userLocation.lat, userLocation.lng]}
            radius={7}
            pathOptions={{ color: '#0d6efd', fillColor: '#0d6efd', fillOpacity: 0.6 }}
          />
        )}

        {routeCoords.length > 0 && (
          <Polyline positions={routeCoords} pathOptions={{ color: '#f59f00', weight: 5, opacity: 0.85 }} />
        )}

        {filters.layers.diaDiemVanHoa && diaDiem
          .filter(d => {
            const matchLoai = filters.loaiDiaDiem[d.loai_dia_diem || 'Khác']
            const matchText = matchQuery(d.ten_dia_diem) || matchQuery(d.ten_xa)
            const matchSelected = filters.diaDiem.length === 0 || filters.diaDiem.includes(String(d.id))
            return matchLoai && matchText && matchSelected
          })
          .map(d => (
            <Marker
              key={`ddvh-${d.id}`}
              position={[d.vi_do, d.kinh_do]}
              icon={diaDiemIcon(d.loai_dia_diem)}
            >
              <Popup>
                <div style={{ minWidth: 200 }}>
                  <strong>{d.ten_dia_diem}</strong>
                  {d.loai_dia_diem && <div>Loại: {d.loai_dia_diem}</div>}
                  {d.ten_xa && <div>Xã/Phường: {d.ten_xa}</div>}
                  {d.ma_xa && <div>Mã xã: {d.ma_xa}</div>}
                  {d.dia_chi && <div>Địa chỉ: {d.dia_chi}</div>}
                  {d.mo_ta && <div>Mô tả: {d.mo_ta}</div>}
                </div>
              </Popup>
            </Marker>
          ))}


        {filters.layers.truongHoc && truongHoc
          .filter(t => {
            const capSelected = Object.values(filters.capHoc).some(Boolean)
            const loaiSelected = Object.values(filters.loaiHinh).some(Boolean)

            if (!capSelected && !loaiSelected) {
              return false
            }

            const matchCap = !capSelected || (t.cap_hoc ? (filters.capHoc[t.cap_hoc] ?? false) : false)
            const matchLoai = !loaiSelected || (t.loai_hinh ? (filters.loaiHinh[t.loai_hinh] ?? false) : false)
            const matchText = matchQuery(t.ten) || matchQuery(t.ten_xa) || matchQuery(t.ma_xa)
            return matchCap && matchLoai && matchText
          })
          .map(t => (
            <Marker
              key={`school-${t.id}`}
              position={[t.vi_do, t.kinh_do]}
              icon={schoolIcon(t.cap_hoc)}
            >
              <Popup>
                <div style={{ minWidth: 220 }}>
                  <strong>{t.ten}</strong>
                  {t.cap_hoc && <div>Cấp: {CAP_HOC_LABEL[t.cap_hoc] || t.cap_hoc}</div>}
                  {t.loai_hinh && <div>Loại hình: {LOAI_HINH_LABEL[t.loai_hinh] || t.loai_hinh}</div>}
                  {t.ma_xa && <div>Mã xã: {t.ma_xa}</div>}
                  {t.ten_xa && <div>Xã/Phường: {t.ten_xa}</div>}
                  {t.dia_chi && <div>Địa chỉ: {t.dia_chi}</div>}
                  {t.address && Object.keys(t.address).length > 0 && (
                    <div>
                      <div>Địa chỉ chi tiết:</div>
                      {t.address.so_nha && <div>- Số nhà: {t.address.so_nha}</div>}
                      {t.address.duong && <div>- Đường: {t.address.duong}</div>}
                      {t.address.phuong_xa && <div>- Phường/Xã: {t.address.phuong_xa}</div>}
                      {t.address.quan_huyen && <div>- Quận/Huyện: {t.address.quan_huyen}</div>}
                      {t.address.tinh && <div>- Tỉnh: {t.address.tinh}</div>}
                      {t.address.thanh_pho && <div>- Thành phố: {t.address.thanh_pho}</div>}
                    </div>
                  )}
                  {t.operator && <div>Đơn vị chủ quản: {t.operator}</div>}
                  {t.grades && <div>Khối lớp: {t.grades}</div>}
                  {t.lien_he && Object.keys(t.lien_he).length > 0 && (
                    <div>
                      <div>Liên hệ:</div>
                      {t.lien_he.phone && <div>- Điện thoại: {t.lien_he.phone}</div>}
                      {t.lien_he.email && <div>- Email: {t.lien_he.email}</div>}
                      {t.lien_he.website && <div>- Website: {t.lien_he.website}</div>}
                    </div>
                  )}
                  <div>Tọa độ: {t.vi_do?.toFixed(4)}, {t.kinh_do?.toFixed(4)}</div>
                </div>
              </Popup>
            </Marker>
          ))}

      </MapContainer>
      <SearchBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        results={searchResults}
        onSelect={handleSelectSearch}
      />
      <div className="locate-control">
        <button className="locate-btn" onClick={handleLocate} title="Định vị của bạn">
          📍
        </button>
      </div>
      <FilterPanel
        filters={filters}
        onToggle={toggleFilter}
        isOpen={filterOpen}
        onToggleOpen={() => setFilterOpen(!filterOpen)}
        phuongXaList={phuongXaList}
        phuongXaDropdownOpen={phuongXaDropdownOpen}
        setPhuongXaDropdownOpen={setPhuongXaDropdownOpen}
        phuongXaSearch={phuongXaSearch}
        setPhuongXaSearch={setPhuongXaSearch}
        diaDiemList={diaDiemList}
        diaDiemDropdownOpen={diaDiemDropdownOpen}
        setDiaDiemDropdownOpen={setDiaDiemDropdownOpen}
        diaDiemSearch={diaDiemSearch}
        setDiaDiemSearch={setDiaDiemSearch}
        onXaSelect={onXaSelect}
      />
      <div className="fab-left">
        <button className="fab-btn" onClick={() => setFilterOpen(!filterOpen)} title="Bộ lọc">
          <Menu size={20} />
        </button>
        <button className="fab-btn" onClick={() => setBaseToggleOpen(!baseToggleOpen)} title="Chuyển bản đồ">
          <Layers size={20} />
        </button>
      </div>
      {baseToggleOpen && (
        <div className="basemap-floating">
          <BasemapToggle active={baseLayer} onChange={setBaseLayer} />
        </div>
      )}
      <DanTocLegend filters={filters} />
    </div>
  )
}

export default Map

