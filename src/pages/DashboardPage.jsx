import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getAllInventaris } from '../services/inventaris'
import { getAllPinjaman } from '../services/pinjaman'
import { getAllSukuCadang } from '../services/sukuCadang'
import { getAllTracking } from '../services/tracking'
import { getAllRekap } from '../services/rekap'
import { computeStats } from '../services/stats'
import { StatCard, Badge } from '../components/ui'
import { useAuth } from '../contexts/AuthContext'
import poldaLogo from '../assets/polda-diy-logo.png'

const statusVariant = (s) =>
  s === 'Belum Ditindaklanjuti' ? 'red' : s === 'Proses' ? 'amber' : 'green'

function greeting() {
  const h = new Date().getHours()
  if (h < 11) return 'Selamat Pagi'
  if (h < 15) return 'Selamat Siang'
  if (h < 19) return 'Selamat Sore'
  return 'Selamat Malam'
}

export default function DashboardPage() {
  const [currentDate, setCurrentDate] = useState('')
  const [stats, setStats] = useState({})
  const [recentAduanDashboard, setRecentAduanDashboard] = useState([])
  const [sukuCadangMenipisList, setSukuCadangMenipisList] = useState([])
  const { userRole, session } = useAuth()
  const isUserRole = userRole === 'User'
  const userName = session?.user?.user_metadata?.name || session?.user?.user_metadata?.full_name || session?.user?.email || 'User'

  useEffect(() => {
    if (isUserRole) return; // User sees welcome page only — skip admin data fetch

    const now = new Date()
    setCurrentDate(now.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }))

    async function loadData() {
      try {
        const [inventaris, pinjaman, sukuCadang, tracking, rekap] = await Promise.all([
          getAllInventaris(),
          getAllPinjaman(),
          getAllSukuCadang(),
          getAllTracking(),
          getAllRekap()
        ])
        setStats(computeStats(inventaris, pinjaman, sukuCadang, tracking, rekap))
        setRecentAduanDashboard([...tracking].sort((a, b) => (b.tgl > a.tgl ? 1 : -1)).slice(0, 5))
        setSukuCadangMenipisList(sukuCadang.filter(s => s.stok < s.min_stok).map(s => s.nama))
      } catch (err) {
        // Errors are surfaced to the user via the dashboard empty states / toasts
      }
    }
    loadData()
  }, [isUserRole])

  return (
    <div>
      {isUserRole ? (
        // User Dashboard — Welcome page only (no stats / charts)
        <div className="user-welcome">
          <div className="welcome-hero user-hero">
            <div className="wh-top">
              <div className="wh-text">
                <h1>Selamat Datang, {userName}</h1>
                <p>Sistem SIHARKAN TIK digunakan untuk mengirim dan memantau proses aduan perbaikan perangkat HT.</p>
              </div>
              <img src={poldaLogo} alt="Logo Polda DIY" className="wh-logo" />
            </div>
          </div>
        </div>
      ) : (
        // Admin Dashboard
        <div>
          <div className="page-head">
            <div>
              <h1>Dashboard</h1>
              <p>Selamat datang di SIHARKAN-TIK Polda DIY</p>
            </div>
            <div className="head-actions">
            </div>
          </div>

          <div className="welcome-hero">
            <div className="wh-eyebrow">
              Bidang Teknologi Informasi &amp; Komunikasi &mdash; Polda DIY
            </div>
            <div className="wh-top">
              <div className="wh-text">
                <h1>Selamat Datang di SIHARKAN-TIK Polda DIY</h1>
                <p>Sistem Informasi Harmonisasi Peralatan Komunikasi dan Teknologi Informasi<br/>Polda D. I. Yogyakarta</p>
              </div>
              <img src={poldaLogo} alt="Logo Polda DIY" className="wh-logo" />
            </div>
            <div className="wh-meta">
              <div className="wh-meta-item">
                <span className="wm-label">Tanggal</span>
                <span className="wm-value" id="heroDate">{currentDate}</span>
              </div>
              <div className="wh-meta-item">
                <span className="wm-label">Pengguna Aktif</span>
                <span className="wm-value">Admin Sistem</span>
              </div>
              <div className="wh-meta-item">
                <span className="wm-label">Satwil Terdaftar</span>
                <span className="wm-value" id="statSatwil">{stats.satwilCount || '--'}</span>
              </div>
              <div className="wh-meta-item">
                <span className="wm-label">Status Sistem</span>
                <span className="wm-value">&#x2713; Normal</span>
              </div>
            </div>
          </div>

          <div className="stat-grid">
            <StatCard
              label="Total HT"
              value={stats.totalHT || '--'}
              delta={{ text: 'Unit terdaftar' }}
              variant="gold"
            />
            <StatCard
              label="HT Baik"
              value={stats.htBaik || '--'}
              delta={{ text: `${stats.pctBaik || '--'} dari total`, variant: 'up' }}
              variant="green"
            />
            <StatCard
              label="HT Rusak Ringan"
              value={stats.htRusakRingan || '--'}
              delta={{ text: `${stats.pctRR || '--'} dari total` }}
              variant="amber"
            />
            <StatCard
              label="HT Rusak Berat"
              value={stats.htRusakBerat || '--'}
              delta={{ text: 'Perlu tindak lanjut', variant: 'warn' }}
              variant="red"
            />
            <StatCard
              label="HT Dipinjam"
              value={stats.htDipinjam || '--'}
              delta={{ text: 'Aktif dipinjam Satwil' }}
              variant="blue"
            />
            <StatCard
              label="Perbaikan Berjalan"
              value={stats.trkBerjalan || '--'}
              delta={{ text: `${stats.trkProses || 0} proses · ${stats.trkBelum || 0} belum ditindak` }}
              variant="amber"
            />
            <StatCard
              label="Total Alat TIK"
              value={stats.totalAlat || '--'}
              delta={{ text: 'HT + perangkat TIK' }}
              variant="blue"
            />
            <StatCard
              label="Total Suku Cadang"
              value={<>{stats.scTotal || '--'} <span style={{ fontSize: '13px', color: 'var(--muted)', fontWeight: 600 }}>jenis</span></>}
              delta={{ text: stats.scMenipis || '--', variant: 'warn' }}
              variant="red"
            />
          </div>

          <div className="grid-2">
            <div className="card">
              <div className="card-head">
                <h2>Kondisi HT</h2>
                <a href="/alat-tik" className="link">Lihat detail &rsaquo;</a>
              </div>
              <div className="chart-row">
                <div className="donut" style={{ background: stats.donutHT?.() || 'conic-gradient(var(--green) 0% 0%, var(--amber) 0% 0%, var(--red) 0% 0%)' }}>
                  <div className="donut-center">
                    <b id="donutHTTotal">{stats.totalHT || '--'}</b>
                    <span>Unit HT</span>
                  </div>
                </div>
                <div className="legend">
                  <div className="row">
                    <span className="l"><span className="dot" style={{ background: 'var(--green)' }}></span>Baik</span>
                    <span className="v" id="lgHTBaik">{stats.htBaik || '--'}&nbsp;
                      <small style={{ fontWeight: 400, color: 'var(--muted)' }}>
                        ({stats.pctBaik || '--'}%)
                      </small>
                    </span>
                  </div>
                  <div className="row">
                    <span className="l"><span className="dot" style={{ background: 'var(--amber)' }}></span>Rusak Ringan</span>
                    <span className="v" id="lgHTRR">{stats.htRusakRingan || '--'}&nbsp;
                      <small style={{ fontWeight: 400, color: 'var(--muted)' }}>
                        ({stats.pctRR || '--'}%)
                      </small>
                    </span>
                  </div>
                  <div className="row">
                    <span className="l"><span className="dot" style={{ background: 'var(--red)' }}></span>Rusak Berat</span>
                    <span className="v" id="lgHTRB">{stats.htRusakBerat || '--'}&nbsp;
                      <small style={{ fontWeight: 400, color: 'var(--muted)' }}>
                        ({stats.pctRB || '--'}%)
                      </small>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-head">
                <h2>Status Perbaikan</h2>
                <a href="/tracking" className="link">Lihat detail &rsaquo;</a>
              </div>
              <div className="chart-row">
                <div className="donut" style={{ background: stats.donutTracking?.() || 'conic-gradient(var(--green) 0% 0%, var(--polri-gold) 0% 0%, var(--red) 0% 0%)' }}>
                  <div className="donut-center">
                    <b id="donutTrackingTotal">{stats.trkTotal || '--'}</b>
                    <span>Aduan</span>
                  </div>
                </div>
                <div className="legend">
                  <div className="row">
                    <span className="l"><span className="dot" style={{ background: 'var(--green)' }}></span>Selesai</span>
                    <span className="v" id="lgTrkSelesai">{stats.trkSelesai || '--'}&nbsp;
                      <small style={{ fontWeight: 400, color: 'var(--muted)' }}>
                        ({stats.pctSelesai || '--'}%)
                      </small>
                    </span>
                  </div>
                  <div className="row">
                    <span className="l"><span className="dot" style={{ background: 'var(--polri-gold)' }}></span>Proses</span>
                    <span className="v" id="lgTrkProses">{stats.trkProses || '--'}&nbsp;
                      <small style={{ fontWeight: 400, color: 'var(--muted)' }}>
                        ({stats.pctProses || '--'}%)
                      </small>
                    </span>
                  </div>
                  <div className="row">
                    <span className="l"><span className="dot" style={{ background: 'var(--red)' }}></span>Belum</span>
                    <span className="v" id="lgTrkBelum">{stats.trkBelum || '--'}&nbsp;
                      <small style={{ fontWeight: 400, color: 'var(--muted)' }}>
                        ({stats.pctBelum || '--'}%)
                      </small>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="card" style={{ marginTop: '18px' }}>
            <div className="card-head"><h2>Akses Cepat</h2></div>
            <div className="qa-grid">
              <a href="/alat-tik" className="qa-item">
                <div className="ic"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="13" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg></div>
                <div className="t">Tambah Data Alat TIK</div>
              </a>
              <a href="/pinjaman-ht" className="qa-item">
                <div className="ic"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 3l4 4-4 4"/><path d="M20 7H8a4 4 0 0 0-4 4v1"/><path d="M8 21l-4-4 4-4"/><path d="M4 17h12a4 4 0 0 0 4-4v-1"/></svg></div>
                <div className="t">Tambah Data Pinjaman</div>
              </a>
              <a href="/tracking" className="qa-item">
                <div className="ic"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div>
                <div className="t">Tambah Aduan Perbaikan</div>
              </a>
              <a href="/suku-cadang" className="qa-item">
                <div className="ic"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z"/></svg></div>
                <div className="t">Tambah Suku Cadang</div>
              </a>
              <a href="/sppm" className="qa-item">
                <div className="ic"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><line x1="8" y1="13" x2="16" y2="13"/></svg></div>
                <div className="t">Upload SPPM</div>
              </a>
            </div>
          </div>

          <div className="grid-2" style={{ marginTop: '18px' }}>
            <div className="card">
              <div className="card-head"><h2>Aktivitas Terbaru</h2><a href="/tracking" className="link">Lihat semua &rsaquo;</a></div>
              {recentAduanDashboard.length === 0 ? (
                <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
                  Belum ada aduan perbaikan tercatat.
                </div>
              ) : (
                recentAduanDashboard.map(a => (
                  <div className="act-item" key={a.id}>
                    <div className={`act-icon ${a.status === 'Selesai' ? 'green' : a.status === 'Proses' ? 'amber' : 'red'}`}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 14"/></svg>
                    </div>
                    <div>
                      <div className="act-text"><b>{a.id}</b> &middot; {a.jenis} ({a.satwil})</div>
                      <div className="act-time">{a.tgl} &middot; {a.status}</div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="card">
              <div className="card-head"><h2>Notifikasi</h2>{stats.scMenipis > 0 && <span className="badge red" style={{ fontSize: '11px' }}>{stats.scMenipis} baru</span>}</div>
              {stats.scMenipis > 0 ? (
                <div className="notif-item red">
                  <div>
                    <div className="t">&#x26a0; Stok suku cadang menipis</div>
                    <div className="d">{stats.scMenipis} jenis suku cadang berada di bawah batas minimum stok: {sukuCadangMenipisList.join(', ')}. Segera lakukan pengadaan ulang.</div>
                  </div>
                </div>
              ) : (
                <div className="notif-item green">
                  <div>
                    <div className="t">&#x2713; Stok aman</div>
                    <div className="d">Seluruh suku cadang berada di atas batas minimum stok.</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
