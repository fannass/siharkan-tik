import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { getSatwilList } from '../services/reference'
import { getDashboardData } from '../services/dashboard'
import { StatCard, LoadingSpinner } from '../components/ui'

export default function DashboardPage() {
  const [currentDate, setCurrentDate] = useState('')
  const [satwilCount, setSatwilCount] = useState(null)
  const [dashboard, setDashboard] = useState(null)
  const { userRole, session } = useAuth()

  const isUserRole = userRole === 'User'

  const userName =
    session?.user?.user_metadata?.name ||
    session?.user?.user_metadata?.full_name ||
    session?.user?.email ||
    'User'

  useEffect(() => {
    const now = new Date()

    setCurrentDate(
      now.toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    )

    Promise.all([getSatwilList(), getDashboardData()])
      .then(([list, data]) => { setSatwilCount(list.length); setDashboard(data) })
      .catch(() => setSatwilCount(null))
  }, [])

  return (
    <div>
      {isUserRole ? (
        // User Dashboard — tetap hanya menampilkan welcome page
        <div className="user-welcome">
          <div className="welcome-hero user-hero">
            <div className="wh-top">
              <div className="wh-text">
                <h1>Selamat Datang, {userName}</h1>
                <p>
                  Sistem SIHARKAN TIK digunakan untuk mengirim dan memantau
                  proses aduan perbaikan perangkat HT.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Admin Dashboard — hanya Page Header + Hero
        <div>
          <div className="page-head">
            <div>
              <h1>Dashboard</h1>
              <p>Selamat datang di SIHARKAN-TIK Polda DIY</p>
            </div>

            <div className="head-actions"></div>
          </div>

          {dashboard ? (
            <>
              <div className="stat-grid" style={{ marginBottom: 20 }}>
                <StatCard label="Total Alat" value={dashboard.totalAlat} />
                <StatCard label="Tersedia" value={dashboard.tersedia} />
                <StatCard label="Dipinjam" value={dashboard.dipinjam} />
                <StatCard label="Rusak" value={dashboard.rusak} />
                <StatCard label="Hilang" value={dashboard.hilang} />
              </div>
              <div className="kat-grid" style={{ marginBottom: 20 }}>
                {Object.entries(dashboard.byKategori).map(([label, value]) => <StatCard key={label} label={label} value={value} />)}
              </div>
            </>
          ) : <LoadingSpinner text="Memuat statistik inventaris..." />}

          <div className="welcome-hero">
            <div className="wh-eyebrow">
              Bidang Teknologi Informasi &amp; Komunikasi &mdash; Polda DIY
            </div>

            <div className="wh-top">
              <div className="wh-text">
                <h1>Selamat Datang</h1>

                <p>
                   Sistem Informasi Pemeliharaan Perbaikan dan Aset TIK Polda DIY
                  
                </p>
              </div>
            </div>

            <div className="wh-meta">
              <div className="wh-meta-item">
                <span className="wm-label">Tanggal</span>
                <span className="wm-value" id="heroDate">
                  {currentDate}
                </span>
              </div>

              <div className="wh-meta-item">
                <span className="wm-label">Pengguna Aktif</span>
                <span className="wm-value">Admin Sistem</span>
              </div>

              <div className="wh-meta-item">
                <span className="wm-label">Satwil Terdaftar</span>
                <span className="wm-value">{satwilCount ?? '--'}</span>
              </div>

              <div className="wh-meta-item">
                <span className="wm-label">Status Sistem</span>
                <span className="wm-value">&#x2713; Normal</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}