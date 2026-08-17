import { getDashboardData } from './dashboard'
import { getAllSukuCadang } from './sukuCadang'
import { getAllSPPM } from './sppm'
import { getAllTracking } from './tracking'

function inPeriod(value, period) {
  return Boolean(value) && String(value).slice(0, 7) === period
}

export async function getLaporanData(filters = {}) {
  const period = filters.period || new Date().toISOString().slice(0, 7)
  const [dashboard, sukuCadang, sppm, tracking] = await Promise.all([getDashboardData(), getAllSukuCadang(), getAllSPPM(), getAllTracking()])
  const filter = row => (!filters.kategori || row.kategori === filters.kategori) && (!filters.lokasi || row.lokasi === filters.lokasi) && (!filters.kondisi || row.kondisi === filters.kondisi)
  const inventory = [
    ...dashboard.units.map(row => ({ ...row, tipe_data: 'Unit', nomor: row.serial_number || row.id, jumlah_awal: 1, jumlah_tersedia: row.kondisi === 'Baik' ? 1 : 0, jumlah_dipinjam: 0, jumlah_rusak: row.kondisi === 'Baik' ? 0 : 1, jumlah_hilang: 0, tanggal: row.tgl })),
    ...dashboard.batches.map(row => ({ ...row, tipe_data: 'Batch', nomor: row.nomor_batch, tanggal: row.tanggal_masuk }))
  ].filter(row => inPeriod(row.tanggal, period) && filter(row))
  const pinjaman = dashboard.loans.filter(row => inPeriod(row.tgl_pinjam, period))
  const mutasi = dashboard.mutations.filter(row => inPeriod(row.tanggal_transaksi, period))
  return { period, dashboard, inventory, mutasi, pinjaman, sukuCadang, sppm: sppm.filter(row => inPeriod(row.tgl, period)), tracking: tracking.filter(row => inPeriod(row.tgl, period)) }
}
