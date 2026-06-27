import React, { useState, useCallback } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/common/Sidebar'
import Topbar from '../components/common/Topbar'

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const sidebarWidth = collapsed ? 72 : 240

  const handleToggle = useCallback(() => setCollapsed(c => !c), [])
  const handleSearch = useCallback((term) => setSearchTerm(term), [])

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar collapsed={collapsed} onToggle={handleToggle} />
      <div
        className="main-content"
        style={{
          marginLeft: sidebarWidth,
          paddingTop: 'var(--topbar-height)',
          flex: 1,
          minHeight: '100vh',
          transition: 'margin-left 0.25s cubic-bezier(0.4,0,0.2,1)'
        }}
      >
        <Topbar sidebarWidth={sidebarWidth} onSearch={handleSearch} />
        <Outlet context={{ searchTerm }} />
      </div>
    </div>
  )
}
