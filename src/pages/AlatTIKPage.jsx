import { useState, useEffect, useMemo } from 'react'
import { getAllInventaris, createInventaris, updateInventaris, deleteInventaris } from '../services/inventaris'
import { getSatwilList, getKategoriList } from '../services/reference'
import { useSearch, usePagination } from '../hooks'
import { useToast } from '../hooks/useToast'
import { useExport } from '../hooks/useExport'
import { SearchBox, Select, Table, Pagination, KategoriCard, Badge, TypeTag, IconButton, ToastContainer, ConfirmModal, LoadingSpinner, Modal } from '../components/ui'
import { formatTanggal } from '../utils/format'

const kondisiOptions = ['Baik', 'Rusak Ringan', 'Rusak Berat']
const kondisiVariant = (k) => k === 'Baik' ? 'green' : k === 'Rusak Ringan' ? 'amber' : 'red'
const emptyForm = { id: '', nama: '', merk: '', kategori: 'HT', kondisi: 'Baik', lokasi: '', tgl: '' }

const KATEGORI_PREFIX = {
  HT: 'HT-',
  Tower: 'TWR-',
  Repeater: 'RPT-',
  Ransus: 'RNS-',
  Bodyworn: 'BWC-',
  'Command Center': 'CMD-',
  'Call Center': 'CCT-',
  Drone: 'DRN-'
}

export default function AlatTIKPage() {
  const [inventaris, setInventaris] = useState([])
  const [satwilList, setSatwilList] = useState([])
  const [kategoriList, setKategoriList] = useState([])
  const [kategoriStats, setKategoriStats] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const { toasts, success, error } = useToast()
  const { handleExport } = useExport()

  const [filterKategori, setFilterKategori] = useState('')
  const [filterKondisi, setFilterKondisi] = useState('')
  const [filterLokasi, setFilterLokasi] = useState('')

  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [formErrors, setFormErrors] = useState({})
  const [idNumber, setIdNumber] = useState('')

  useEffect(() => {
    if (!editingId && form.kategori && KATEGORI_PREFIX[form.kategori]) {
      setForm(prev => ({ ...prev, id: KATEGORI_PREFIX[form.kategori] + idNumber }))
    }
  }, [form.kategori, idNumber, editingId])

  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        setLoading(true)
        const [data, satwil, kategori] = await Promise.all([
          getAllInventaris(),
          getSatwilList(),
          getKategoriList()
        ])
        if (cancelled) return
        setInventaris(data)
        setSatwilList(satwil)
        setKategoriList(kategori)
      } catch (err) {
        if (!cancelled) error('Gagal memuat data inventaris')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const filteredByCategory = useMemo(() => {
    let result = [...inventaris]
    if (filterKategori) result = result.filter(i => i.kategori === filterKategori)
    if (filterKondisi) result = result.filter(i => i.kondisi === filterKondisi)
    if (filterLokasi) result = result.filter(i => i.lokasi === filterLokasi)
    return result
  }, [inventaris, filterKategori, filterKondisi, filterLokasi])

  useEffect(() => {
    const katStats = kategoriList.map(kat => {
      const items = inventaris.filter(i => i.kategori === kat)
      return { kategori: kat, label: kat, value: items.length, warna: kat === 'HT' ? 'var(--polri-gold-bg)' : 'var(--blue-bg)', warnaBorder: kat === 'HT' ? 'var(--polri-gold-2)' : 'var(--blue)' }
    })
    setKategoriStats(katStats)
  }, [inventaris, kategoriList])

  const { searchTerm, setSearchTerm, filtered: filteredData } = useSearch(filteredByCategory, ['nama', 'merk', 'lokasi'])
  const { currentPage, setCurrentPage, paginatedData, totalPages } = usePagination(filteredData, 10)

  function openCreateForm() {
    setForm(emptyForm)
    setEditingId(null)
    setFormErrors({})
    setIdNumber('')
    setShowForm(true)
  }

  function openEditForm(item) {
    const prefix = KATEGORI_PREFIX[item.kategori] || ''
    const number = item.id?.startsWith(prefix) ? item.id.slice(prefix.length) : ''
    setForm({ id: item.id, nama: item.nama || '', merk: item.merk || '', kategori: item.kategori, kondisi: item.kondisi, lokasi: item.lokasi, tgl: item.tgl || '' })
    setEditingId(item.id)
    setFormErrors({})
    setIdNumber(number)
    setShowForm(true)
  }

  function validate() {
    const errs = {}
    if (!editingId && !idNumber.trim()) errs.id = 'ID alat harus diisi'
    if (form.kategori === 'HT' && !form.merk.trim()) errs.merk = 'Merk harus diisi untuk HT'
    if (form.kategori !== 'HT' && !form.nama.trim()) errs.nama = 'Nama barang harus diisi'
    if (!form.lokasi) errs.lokasi = 'Lokasi harus dipilih'
    if (!form.tgl) errs.tgl = 'Tanggal harus diisi'
    setFormErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    try {
      if (editingId) {
        await updateInventaris(editingId, form)
        success('Data inventaris berhasil diperbarui')
      } else {
        await createInventaris(form)
        success('Data inventaris berhasil ditambahkan')
      }
      setShowForm(false)
      setForm(emptyForm)
      setEditingId(null)
      const [data, satwil, kategori] = await Promise.all([
        getAllInventaris(), getSatwilList(), getKategoriList()
      ])
      setInventaris(data)
      setSatwilList(satwil)
      setKategoriList(kategori)
    } catch (err) {
      error('Gagal menyimpan data')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteInventaris(deleteTarget.id)
      success('Data inventaris berhasil dihapus')
      setDeleteTarget(null)
      const [data, satwil, kategori] = await Promise.all([
        getAllInventaris(), getSatwilList(), getKategoriList()
      ])
      setInventaris(data)
      setSatwilList(satwil)
      setKategoriList(kategori)
    } catch (err) {
      error('Gagal menghapus data')
    } finally {
      setDeleting(false)
    }
  }

  const columns = [
    { label: 'No / ID', key: 'id', cellClass: 'cell-strong' },
    { label: 'Nama Barang', key: 'nama', cellClass: 'cell-strong' },
    { label: 'Merk', key: 'merk' },
    { label: 'Jenis', render: (i) => <TypeTag type={i.kategori.toLowerCase()}>{i.kategori}</TypeTag> },
    { label: 'Kondisi', render: (i) => <Badge variant={kondisiVariant(i.kondisi)}>{i.kondisi}</Badge> },
    { label: 'Lokasi', key: 'lokasi' },
    { label: 'Tgl Masuk', render: (i) => formatTanggal(i.tgl) },
  ]

  const renderActions = (item) => (
    <div className="row-actions">
      <IconButton icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4z"/></svg>} className="btn-icon" onClick={() => openEditForm(item)} />
      <IconButton icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>} className="btn-icon" onClick={() => setDeleteTarget(item)} />
    </div>
  )

  return (
    <div>
      <ToastContainer toasts={toasts} />
      <ConfirmModal
        open={!!deleteTarget}
        title="Hapus Data Inventaris"
        message={`Yakin ingin menghapus "${deleteTarget?.nama || deleteTarget?.id}"?`}
        confirmLabel="Hapus"
        confirmVariant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />

      <div className="page-head">
        <div><h1>Data Alat TIK</h1><p>Inventaris seluruh perangkat Teknologi Informasi dan Komunikasi Polda DIY.</p></div>
        <div className="head-actions">
          <button className="btn" onClick={() => {
            const result = handleExport(filteredData, 'inventaris.csv')
            if (result.success) success(result.message)
            else error(result.message)
          }}>&#8595; Export</button>
          <button className="btn btn-primary" onClick={openCreateForm}>+ Tambah Data</button>
        </div>
      </div>

      <div className="kat-grid">
        {kategoriStats.map((s, i) => <KategoriCard key={i} label={s.label} value={s.value} variant={s.warnaBorder} />)}
      </div>

      <div className="card">
        <div className="toolbar">
          <SearchBox placeholder="Cari nama barang, merk, atau lokasi..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ flex: 1, minWidth: 220 }} />
          <Select className="filter-btn" value={filterKategori} onChange={e => setFilterKategori(e.target.value)} placeholder="Semua Jenis Alat" options={kategoriList} style={{ minWidth: 150 }} />
          <Select className="filter-btn" value={filterKondisi} onChange={e => setFilterKondisi(e.target.value)} placeholder="Semua Kondisi" options={kondisiOptions} style={{ minWidth: 140 }} />
          <Select className="filter-btn" value={filterLokasi} onChange={e => setFilterLokasi(e.target.value)} placeholder="Semua Lokasi" options={satwilList} style={{ minWidth: 170 }} />
        </div>

        {loading ? <LoadingSpinner text="Memuat data..." /> : (
          <>
            <Table columns={columns} data={paginatedData} emptyMessage="Tidak ada data yang sesuai dengan filter"
              actions={renderActions} id="tabel-alat" />
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} itemsPerPage={10} totalItems={filteredData.length} />
          </>
        )}
      </div>
      <Modal open={showForm} title={`${editingId ? 'Edit' : 'Tambah'} Data Alat TIK`} onClose={() => { setShowForm(false); setEditingId(null); setForm(emptyForm); setIdNumber('') }} size="large">
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="field">
              <label>Jenis Alat <span className="req">*</span></label>
              <select value={form.kategori} onChange={e => { setForm({ ...form, kategori: e.target.value }); setIdNumber('') }}>
                {kategoriList.map(k => <option key={k} value={k}>{k}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Kondisi <span className="req">*</span></label>
              <select value={form.kondisi} onChange={e => setForm({ ...form, kondisi: e.target.value })}>
                {kondisiOptions.map(k => <option key={k}>{k}</option>)}
              </select>
            </div>
            {!editingId && (
              <div className="field full" style={{ display: 'flex', gap: 0, alignItems: 'stretch' }}>
                <label style={{ width: '100%' }}>ID Alat <span className="req">*</span></label>
                <div style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden', width: '100%' }}>
                  <span style={{ padding: '8px 12px', background: 'var(--bg)', color: 'var(--muted)', fontWeight: 600, fontSize: 14, borderRight: '1px solid var(--border)', whiteSpace: 'nowrap' }}>
                    {KATEGORI_PREFIX[form.kategori] || '??-'}
                  </span>
                  <input
                    type="text"
                    placeholder="Contoh: 016"
                    value={idNumber}
                    onChange={e => setIdNumber(e.target.value.replace(/[^0-9]/g, ''))}
                    style={{ flex: 1, border: 'none', borderRadius: 0, outline: 'none', padding: '8px 12px', fontSize: 14 }}
                    autoComplete="off"
                  />
                </div>
                {formErrors.id && <div className="form-error">{formErrors.id}</div>}
              </div>
            )}
            {form.kategori !== 'HT' ? (
              <div className="field full">
                <label>Nama Barang <span className="req">*</span></label>
                <input type="text" placeholder="Contoh: Tower BTS 42 Meter" value={form.nama} onChange={e => setForm({ ...form, nama: e.target.value })} />
                {formErrors.nama && <div className="form-error">{formErrors.nama}</div>}
              </div>
            ) : (
              <div className="field full" style={{ display: 'none' }} />
            )}
            {form.kategori === 'HT' ? (
              <div className="field">
                <label>Merk <span className="req">*</span></label>
                <input type="text" placeholder="Contoh: Motorola, Hytera" value={form.merk} onChange={e => setForm({ ...form, merk: e.target.value })} />
                {formErrors.merk && <div className="form-error">{formErrors.merk}</div>}
              </div>
            ) : null}
            <div className="field full">
              <label>Lokasi <span className="req">*</span></label>
              <select value={form.lokasi} onChange={e => setForm({ ...form, lokasi: e.target.value })}>
                <option value="">Pilih lokasi</option>
                {satwilList.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
              {formErrors.lokasi && <div className="form-error">{formErrors.lokasi}</div>}
            </div>
            <div className="field">
              <label>Tanggal Masuk <span className="req">*</span></label>
              <input type="date" value={form.tgl} onChange={e => setForm({ ...form, tgl: e.target.value })} />
              {formErrors.tgl && <div className="form-error">{formErrors.tgl}</div>}
            </div>
          </div>
          <div className="form-actions" style={{ borderTop: '1px solid var(--border)', marginTop: 20, paddingTop: 16 }}>
            <button type="button" className="btn" onClick={() => { setShowForm(false); setEditingId(null); setForm(emptyForm); setIdNumber('') }}>Batal</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Menyimpan...' : 'Simpan Data'}</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
