import React, { useState, useRef, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { userService, getApiPayload } from '../services/api'
import {
  User, Mail, Phone, Edit2, Save, Shield,
  Bell, Palette, LogOut, CheckCircle, Camera, Trash2, X
} from 'lucide-react'

export default function Profile() {
  const { user, setUser, logout } = useAuth()
  const [editing, setEditing]     = useState(false)
  const [saving, setSaving]       = useState(false)
  const [saveOk, setSaveOk]       = useState(false)
  const [error, setError]         = useState('')
  const [activeSection, setActiveSection] = useState('personal')

  const [form, setForm] = useState({
    name:          user?.name          ?? '',
    email:         user?.email         ?? '',
    currency:      user?.currency      ?? '₹',
    monthlyBudget: user?.monthlyBudget ?? '',
  })

  const [pwForm, setPwForm]       = useState({ oldPassword: '', newPassword: '', confirm: '' })
  const [pwSaving, setPwSaving]   = useState(false)
  const [pwError, setPwError]     = useState('')
  const [pwSuccess, setPwSuccess] = useState(false)

  // Profile picture state
  const [picUploading, setPicUploading] = useState(false)
  const [picError, setPicError]         = useState('')
  const [picPreview, setPicPreview]     = useState(user?.profilePictureUrl ?? null)
  const fileInputRef = useRef(null)

  const [notifs, setNotifs] = useState([
    { key: 'budgetAlerts',   label: 'Budget Alerts',          desc: "Get notified when you're close to your budget limit", enabled: user?.budgetAlerts !== false  },
    { key: 'txnReminders',   label: 'Transaction Reminders',  desc: 'Reminders to log daily transactions',                 enabled: user?.txnReminders !== false },
    { key: 'monthlySummary', label: 'Monthly Summary Email',  desc: 'Receive monthly financial summary via email',         enabled: user?.monthlySummary !== false  },
    { key: 'largeTxnAlert',  label: 'Large Transaction Alert',desc: 'Alert for transactions above ₹10,000',               enabled: user?.largeTxnAlert !== false  },
    { key: 'weeklyReport',   label: 'Weekly Report',          desc: 'Weekly spending insights every Monday',               enabled: !!user?.weeklyReport },
  ])

  // Preferences editing state
  const [prefEditing, setPrefEditing] = useState(false)
  const [prefSaving, setPrefSaving]   = useState(false)
  const [prefForm, setPrefForm] = useState({
    theme:              user?.theme              ?? 'Dark',
    language:           user?.language           ?? 'English',
    dateFormat:         user?.dateFormat         ?? 'DD/MM/YYYY',
    financialYearStart: user?.financialYearStart ?? 'April',
  })

  // Synchronise form and settings when user context changes
  useEffect(() => {
    if (user) {
      setForm({
        name:          user.name          ?? '',
        email:         user.email         ?? '',
        currency:      user.currency      ?? '₹',
        monthlyBudget: user.monthlyBudget ?? '',
      })
      setPrefForm({
        theme:              user.theme              ?? 'Dark',
        language:           user.language           ?? 'English',
        dateFormat:         user.dateFormat         ?? 'DD/MM/YYYY',
        financialYearStart: user.financialYearStart ?? 'April',
      })
      setNotifs([
        { key: 'budgetAlerts',   label: 'Budget Alerts',          desc: "Get notified when you're close to your budget limit", enabled: user.budgetAlerts !== false  },
        { key: 'txnReminders',   label: 'Transaction Reminders',  desc: 'Reminders to log daily transactions',                 enabled: user.txnReminders !== false },
        { key: 'monthlySummary', label: 'Monthly Summary Email',  desc: 'Receive monthly financial summary via email',         enabled: user.monthlySummary !== false  },
        { key: 'largeTxnAlert',  label: 'Large Transaction Alert',desc: 'Alert for transactions above ₹10,000',               enabled: user.largeTxnAlert !== false  },
        { key: 'weeklyReport',   label: 'Weekly Report',          desc: 'Weekly spending insights every Monday',               enabled: !!user.weeklyReport },
      ])
      setPicPreview(user.profilePictureUrl ?? null)
    }
  }, [user])

  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U'

  // ── Save profile ──────────────────────────────────────────────────
  const handleSave = async () => {
    try {
      setSaving(true)
      setError('')
      const res = await userService.updateProfile({
        name:          form.name,
        currency:      form.currency,
        monthlyBudget: form.monthlyBudget ? Number(form.monthlyBudget) : undefined,
        theme:              prefForm.theme,
        language:           prefForm.language,
        dateFormat:         prefForm.dateFormat,
        financialYearStart: prefForm.financialYearStart,
      })
      const updated = getApiPayload(res)
      if (updated) {
        setUser(updated)
      } else {
        setUser(prev => ({ ...prev, ...form }))
      }
      setEditing(false)
      setSaveOk(true)
      setTimeout(() => setSaveOk(false), 3000)
    } catch {
      setError('Failed to save changes.')
    } finally {
      setSaving(false)
    }
  }

  // ── Save Preferences ──────────────────────────────────────────────
  const handlePrefSave = async () => {
    try {
      setPrefSaving(true)
      setError('')
      const res = await userService.updateProfile({
        name:          form.name,
        currency:      form.currency,
        monthlyBudget: form.monthlyBudget ? Number(form.monthlyBudget) : undefined,
        theme:              prefForm.theme,
        language:           prefForm.language,
        dateFormat:         prefForm.dateFormat,
        financialYearStart: prefForm.financialYearStart,
      })
      const updated = getApiPayload(res)
      if (updated) {
        setUser(updated)
      }
      setPrefEditing(false)
      setSaveOk(true)
      setTimeout(() => setSaveOk(false), 3000)
    } catch {
      setError('Failed to save preferences.')
    } finally {
      setPrefSaving(false)
    }
  }

  // ── Change password ───────────────────────────────────────────────
  const handlePasswordChange = async () => {
    setPwError('')
    if (pwForm.newPassword !== pwForm.confirm) {
      setPwError('New passwords do not match')
      return
    }
    try {
      setPwSaving(true)
      await userService.changePassword({
        oldPassword: pwForm.oldPassword,
        newPassword: pwForm.newPassword
      })
      setPwSuccess(true)
      setPwForm({ oldPassword: '', newPassword: '', confirm: '' })
      setTimeout(() => setPwSuccess(false), 3000)
    } catch (err) {
      setPwError(err.response?.data?.message ?? 'Failed to change password')
    } finally {
      setPwSaving(false)
    }
  }

  // ── Profile picture — pick file ───────────────────────────────────
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // client-side validation
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setPicError('Only JPEG, PNG and WebP images are allowed')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setPicError('Image must be under 5MB')
      return
    }

    // show preview immediately
    const previewUrl = URL.createObjectURL(file)
    setPicPreview(previewUrl)
    setPicError('')

    // upload to backend
    try {
      setPicUploading(true)
      const res = await userService.uploadProfilePicture(file)
      const updated = getApiPayload(res)
      if (updated?.profilePictureUrl) {
        setPicPreview(updated.profilePictureUrl)
        setUser(updated)
      }
    } catch (err) {
      setPicError(err.response?.data?.message ?? 'Failed to upload image')
      setPicPreview(user?.profilePictureUrl ?? null) // revert preview
    } finally {
      setPicUploading(false)
      // reset file input so same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  // ── Profile picture — delete ──────────────────────────────────────
  const handleDeletePicture = async () => {
    if (!window.confirm('Remove your profile picture?')) return
    try {
      setPicUploading(true)
      const res = await userService.deleteProfilePicture()
      const updated = getApiPayload(res)
      if (updated) {
        setUser(updated)
      }
      setPicPreview(null)
    } catch {
      setPicError('Failed to remove profile picture')
    } finally {
      setPicUploading(false)
    }
  }

  const toggleNotif = async (key) => {
    try {
      setError('')
      const targetNotif = notifs.find(n => n.key === key)
      if (!targetNotif) return
      const nextVal = !targetNotif.enabled

      // Optimistic update
      setNotifs(prev => prev.map(n => n.key === key ? { ...n, enabled: nextVal } : n))

      const res = await userService.updateProfile({
        name:          form.name,
        currency:      form.currency,
        monthlyBudget: form.monthlyBudget ? Number(form.monthlyBudget) : undefined,
        theme:              prefForm.theme,
        language:           prefForm.language,
        dateFormat:         prefForm.dateFormat,
        financialYearStart: prefForm.financialYearStart,
        budgetAlerts:       key === 'budgetAlerts' ? nextVal : user?.budgetAlerts,
        txnReminders:       key === 'txnReminders' ? nextVal : user?.txnReminders,
        monthlySummary:     key === 'monthlySummary' ? nextVal : user?.monthlySummary,
        largeTxnAlert:      key === 'largeTxnAlert' ? nextVal : user?.largeTxnAlert,
        weeklyReport:       key === 'weeklyReport' ? nextVal : user?.weeklyReport,
      })
      const updated = getApiPayload(res)
      if (updated) {
        setUser(updated)
      }
    } catch {
      setError('Failed to update notification settings.')
      // Revert state from current user context
      if (user) {
        setNotifs([
          { key: 'budgetAlerts',   label: 'Budget Alerts',          desc: "Get notified when you're close to your budget limit", enabled: user.budgetAlerts !== false  },
          { key: 'txnReminders',   label: 'Transaction Reminders',  desc: 'Reminders to log daily transactions',                 enabled: user.txnReminders !== false },
          { key: 'monthlySummary', label: 'Monthly Summary Email',  desc: 'Receive monthly financial summary via email',         enabled: user.monthlySummary !== false  },
          { key: 'largeTxnAlert',  label: 'Large Transaction Alert',desc: 'Alert for transactions above ₹10,000',               enabled: user.largeTxnAlert !== false  },
          { key: 'weeklyReport',   label: 'Weekly Report',          desc: 'Weekly spending insights every Monday',               enabled: !!user.weeklyReport },
        ])
      }
    }
  }

  // ── Render ────────────────────────────────────────────────────────
  return (
      <div className="page">
        <div className="page-header">
          <div>
            <div className="page-title">Profile</div>
            <div className="page-subtitle">Manage your account and preferences</div>
          </div>
        </div>

        {/* Success / error banners */}
        {saveOk && (
            <div style={{ background: 'var(--accent-green-dim)', color: 'var(--accent-green)', padding: '10px 16px', borderRadius: 8, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <CheckCircle size={15} /> Profile saved successfully
            </div>
        )}
        {error && (
            <div style={{ background: 'var(--accent-red-dim)', color: 'var(--accent-red)', padding: '10px 16px', borderRadius: 8, marginBottom: 16 }}>
              {error}
            </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 24 }}>

          {/* ── Left panel ─────────────────────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Avatar card */}
            <div className="card" style={{ textAlign: 'center', padding: '32px 24px' }}>

              {/* Profile picture with upload overlay */}
              <div style={{ position: 'relative', width: 88, height: 88, margin: '0 auto 16px' }}>

                {/* Avatar / initials */}
                {picPreview ? (
                    <img
                        src={picPreview}
                        alt="Profile"
                        style={{
                          width: 88, height: 88, borderRadius: '50%',
                          objectFit: 'cover',
                          border: '3px solid rgba(0,200,150,0.3)'
                        }}
                    />
                ) : (
                    <div style={{
                      width: 88, height: 88,
                      background: 'var(--accent-green-dim)',
                      border: '3px solid rgba(0,200,150,0.3)',
                      borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: 'var(--font-display)',
                      fontSize: '2rem', fontWeight: 700,
                      color: 'var(--accent-green)',
                    }}>
                      {initials}
                    </div>
                )}

                {/* Upload overlay button */}
                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={picUploading}
                    title="Change profile picture"
                    style={{
                      position: 'absolute', bottom: 0, right: 0,
                      width: 28, height: 28,
                      background: 'var(--accent-green)',
                      border: '2px solid var(--bg-card)',
                      borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: picUploading ? 'not-allowed' : 'pointer',
                      opacity: picUploading ? 0.6 : 1,
                    }}
                >
                  <Camera size={13} color="#000" strokeWidth={2.5} />
                </button>

                {/* Hidden file input */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                />
              </div>

              {/* Upload status */}
              {picUploading && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--accent-green)', marginBottom: 8 }}>
                    Uploading...
                  </div>
              )}
              {picError && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--accent-red)', marginBottom: 8 }}>
                    {picError}
                  </div>
              )}

              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem', marginBottom: 4 }}>
                {user?.name}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 16 }}>
                {user?.email}
              </div>

              <span className="badge badge-green" style={{ fontSize: '0.72rem' }}>
              ✓ Verified Account
            </span>

              {/* Remove picture button — only show if picture exists */}
              {picPreview && (
                  <div style={{ marginTop: 14 }}>
                    <button
                        onClick={handleDeletePicture}
                        disabled={picUploading}
                        className="btn btn-danger"
                        style={{ padding: '5px 12px', fontSize: '0.75rem', gap: 5 }}
                    >
                      <Trash2 size={12} /> Remove photo
                    </button>
                  </div>
              )}

              <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--border)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Click the camera icon to change photo
              </div>
            </div>

            {/* Section nav */}
            <div className="card" style={{ padding: '8px' }}>
              {[
                { id: 'personal',      icon: User,    label: 'Personal Info'  },
                { id: 'preferences',   icon: Palette, label: 'Preferences'    },
                { id: 'security',      icon: Shield,  label: 'Security'       },
                { id: 'notifications', icon: Bell,    label: 'Notifications'  },
              ].map(s => (
                  <button
                      key={s.id}
                      onClick={() => setActiveSection(s.id)}
                      className="btn"
                      style={{
                        width: '100%', justifyContent: 'flex-start',
                        padding: '10px 14px', gap: 10, marginBottom: 2,
                        background: activeSection === s.id ? 'var(--accent-green-dim)' : 'transparent',
                        color:      activeSection === s.id ? 'var(--accent-green)'     : 'var(--text-secondary)',
                        fontWeight: activeSection === s.id ? 600 : 400,
                      }}
                  >
                    <s.icon size={15} strokeWidth={1.8} />
                    {s.label}
                  </button>
              ))}

              <div style={{ borderTop: '1px solid var(--border)', marginTop: 8, paddingTop: 8 }}>
                <button
                    className="btn btn-danger"
                    style={{ width: '100%', justifyContent: 'flex-start', padding: '10px 14px', gap: 10 }}
                    onClick={logout}
                >
                  <LogOut size={15} /> Sign Out
                </button>
              </div>
            </div>
          </div>

          {/* ── Right panel ────────────────────────────────────────── */}
          <div>

            {/* Personal Info */}
            {activeSection === 'personal' && (
                <div className="card fade-in">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem' }}>
                      Personal Information
                    </div>
                    {editing
                        ? (
                            <button className="btn btn-primary" style={{ padding: '8px 18px', fontSize: '0.85rem' }} onClick={handleSave} disabled={saving}>
                              <Save size={14} /> {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        ) : (
                            <button className="btn btn-secondary" style={{ padding: '8px 18px', fontSize: '0.85rem' }} onClick={() => setEditing(true)}>
                              <Edit2 size={14} /> Edit
                            </button>
                        )
                    }
                  </div>

                  <div className="grid-2" style={{ gap: 18 }}>
                    {[
                      { label: 'Full Name',          key: 'name',          type: 'text',   placeholder: 'Your full name'     },
                      { label: 'Email',              key: 'email',         type: 'email',  placeholder: 'your@email.com', disabled: true },
                      { label: 'Monthly Budget (₹)', key: 'monthlyBudget', type: 'number', placeholder: '50000'             },
                    ].map(field => (
                        <div key={field.key} className="form-group">
                          <label className="form-label">{field.label}</label>
                          <input
                              type={field.type}
                              className="form-input"
                              value={form[field.key] || ''}
                              onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                              disabled={!editing || field.disabled}
                              placeholder={field.placeholder}
                              style={{ opacity: (editing && !field.disabled) ? 1 : 0.6 }}
                          />
                        </div>
                    ))}

                    <div className="form-group">
                      <label className="form-label">Currency</label>
                      <select
                          className="form-input"
                          value={form.currency}
                          onChange={e => setForm({ ...form, currency: e.target.value })}
                          disabled={!editing}
                          style={{ opacity: editing ? 1 : 0.6 }}
                      >
                        <option value="₹">₹ Indian Rupee (INR)</option>
                        <option value="$">$ US Dollar (USD)</option>
                        <option value="€">€ Euro (EUR)</option>
                        <option value="£">£ British Pound (GBP)</option>
                      </select>
                    </div>
                  </div>
                </div>
            )}

            {/* Preferences */}
            {activeSection === 'preferences' && (
                <div className="card fade-in">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem' }}>
                      Preferences
                    </div>
                    {prefEditing ? (
                        <button className="btn btn-primary" style={{ padding: '8px 18px', fontSize: '0.85rem' }} onClick={handlePrefSave} disabled={prefSaving}>
                          <Save size={14} /> {prefSaving ? 'Saving...' : 'Save Preferences'}
                        </button>
                    ) : (
                        <button className="btn btn-secondary" style={{ padding: '8px 18px', fontSize: '0.85rem' }} onClick={() => setPrefEditing(true)}>
                          <Edit2 size={14} /> Edit
                        </button>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Default Currency</span>
                      <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>
                        {user?.currency === '₹' ? '₹ (INR)' : user?.currency === '$' ? '$ (USD)' : user?.currency === '€' ? '€ (EUR)' : '£ (GBP)'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Date Format</span>
                      {prefEditing ? (
                        <select
                          className="form-input"
                          style={{ width: '180px', padding: '6px 10px', fontSize: '0.875rem' }}
                          value={prefForm.dateFormat}
                          onChange={e => setPrefForm({ ...prefForm, dateFormat: e.target.value })}
                        >
                          <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                          <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                          <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                        </select>
                      ) : (
                        <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>{user?.dateFormat || 'DD/MM/YYYY'}</span>
                      )}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Theme</span>
                      {prefEditing ? (
                        <select
                          className="form-input"
                          style={{ width: '180px', padding: '6px 10px', fontSize: '0.875rem' }}
                          value={prefForm.theme}
                          onChange={e => setPrefForm({ ...prefForm, theme: e.target.value })}
                        >
                          <option value="Dark">Dark</option>
                          <option value="Light">Light</option>
                        </select>
                      ) : (
                        <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>{user?.theme || 'Dark'}</span>
                      )}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Language</span>
                      {prefEditing ? (
                        <select
                          className="form-input"
                          style={{ width: '180px', padding: '6px 10px', fontSize: '0.875rem' }}
                          value={prefForm.language}
                          onChange={e => setPrefForm({ ...prefForm, language: e.target.value })}
                        >
                          <option value="English">English</option>
                          <option value="Spanish">Spanish</option>
                          <option value="French">French</option>
                          <option value="Hindi">Hindi</option>
                        </select>
                      ) : (
                        <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>{user?.language || 'English'}</span>
                      )}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Financial Year Start</span>
                      {prefEditing ? (
                        <select
                          className="form-input"
                          style={{ width: '180px', padding: '6px 10px', fontSize: '0.875rem' }}
                          value={prefForm.financialYearStart}
                          onChange={e => setPrefForm({ ...prefForm, financialYearStart: e.target.value })}
                        >
                          <option value="January">January</option>
                          <option value="April">April</option>
                        </select>
                      ) : (
                        <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>{user?.financialYearStart || 'April'}</span>
                      )}
                    </div>
                  </div>
                </div>
            )}

            {/* Security */}
            {activeSection === 'security' && (
                <div className="card fade-in">
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem', marginBottom: 24 }}>
                    Security Settings
                  </div>

                  {pwError && (
                      <div style={{ background: 'var(--accent-red-dim)', color: 'var(--accent-red)', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: '0.85rem' }}>
                        {pwError}
                      </div>
                  )}
                  {pwSuccess && (
                      <div style={{ background: 'var(--accent-green-dim)', color: 'var(--accent-green)', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: '0.85rem' }}>
                        Password changed successfully!
                      </div>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div className="form-group">
                      <label className="form-label">Current Password</label>
                      <input type="password" className="form-input" placeholder="Enter current password"
                             value={pwForm.oldPassword} onChange={e => setPwForm({ ...pwForm, oldPassword: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">New Password</label>
                      <input type="password" className="form-input" placeholder="Min 8 characters"
                             value={pwForm.newPassword} onChange={e => setPwForm({ ...pwForm, newPassword: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Confirm New Password</label>
                      <input type="password" className="form-input" placeholder="Repeat new password"
                             value={pwForm.confirm} onChange={e => setPwForm({ ...pwForm, confirm: e.target.value })} />
                    </div>
                    <button
                        className="btn btn-primary"
                        style={{ width: 'fit-content' }}
                        onClick={handlePasswordChange}
                        disabled={pwSaving}
                    >
                      <Shield size={14} /> {pwSaving ? 'Updating...' : 'Update Password'}
                    </button>
                  </div>
                </div>
            )}


            {/* Notifications */}
            {activeSection === 'notifications' && (
                <div className="card fade-in">
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem', marginBottom: 24 }}>
                    Notification Settings
                  </div>
                  {notifs.map(notif => (
                      <div key={notif.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid var(--border)' }}>
                        <div>
                          <div style={{ fontWeight: 500, fontSize: '0.875rem', marginBottom: 2 }}>{notif.label}</div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{notif.desc}</div>
                        </div>
                        <div
                            onClick={() => toggleNotif(notif.key)}
                            style={{
                              width: 40, height: 22, borderRadius: 100, cursor: 'pointer',
                              background: notif.enabled ? 'var(--accent-green)' : 'var(--bg-secondary)',
                              border: `1px solid ${notif.enabled ? 'var(--accent-green)' : 'var(--border)'}`,
                              position: 'relative', flexShrink: 0, transition: 'var(--transition)'
                            }}
                        >
                          <div style={{
                            position: 'absolute', top: 2,
                            left: notif.enabled ? 20 : 2,
                            width: 16, height: 16, borderRadius: '50%',
                            background: notif.enabled ? '#000' : 'var(--text-muted)',
                            transition: 'left 0.2s ease'
                          }} />
                        </div>
                      </div>
                  ))}
                </div>
            )}

          </div>
        </div>
      </div>
  )
}