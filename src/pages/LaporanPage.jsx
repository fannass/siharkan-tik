import { useEffect, useState } from 'react'
import { getLaporanData } from '../services/laporan'
import { exportLaporanExcel } from '../utils/exportToExcel'
import { LoadingSpinner, Table } from '../components/ui'

export default function LaporanPage() {
  const [period, setPeriod] = useState(new Date().toISOString().slice(0, 7))
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    let active = true
    setLoading(true)
    getLaporanData({ period }).then(data => { if (active) setReport(data) }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [period])
  const columns = [
    { label: 'Tanggal', render: item => item.tanggal || item.tgl || item.tgl_pinjam || '' },
    { label: 'Item', render: item => item.nama || item.jenis_ht || item.nomor || item.jenis || '' },
    { label: 'Kategori / Status', render: item => item.kategori || item.status || item.kondisi || '' },
    { label: 'Jumlah', render: item => item.jumlah_awal || item.jumlah || item.stok || 1 },
    { label: 'Lokasi', render: item => item.lokasi || item.satwil || '' }
  ]
  return <div>
    <div className="page-head"><div><h1>Laporan Bulanan</h1><p>Rekap data operasional berdasarkan periode yang dipilih.</p></div><div className="head-actions"><input type="month" value={period} onChange={event => setPeriod(event.target.value)} /><button className="btn btn-primary" disabled={!report} onClick={() => exportLaporanExcel(report)}>Export Excel</button></div></div>
    {loading || !report ? <LoadingSpinner text="Memuat laporan..." /> : <div className="card"><div className="stat-grid"><div><b>Total Alat</b><p>{report.dashboard.totalAlat}</p></div><div><b>Tersedia</b><p>{report.dashboard.tersedia}</p></div><div><b>Dipinjam</b><p>{report.dashboard.dipinjam}</p></div><div><b>Mutasi</b><p>{report.mutasi.length}</p></div></div><Table columns={columns} data={report.inventory} emptyMessage="Tidak ada data inventaris pada periode ini" id="tabel-laporan" /></div>}
  </div>
}
