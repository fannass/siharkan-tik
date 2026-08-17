import supabase from '../lib/supabase'

export async function getAllInventarisBatch() {
  const { data, error } = await supabase.from('inventaris_batch').select('*, kategori:kategori_id(nama), satwil:lokasi_id(nama)').order('created_at', { ascending: false })
  if (error) throw error
  return (data || []).map(item => ({ ...item, kategori: item.kategori?.nama || '', lokasi: item.satwil?.nama || '' }))
}

export async function createInventarisBatch(item) {
  const { data, error } = await supabase.rpc('create_inventaris_batch', {
    p_nama: item.nama, p_merk: item.merk || '', p_model: item.model || '', p_kategori_id: item.kategori_id,
    p_lokasi_id: item.lokasi_id, p_kondisi: item.kondisi || 'Baik', p_jumlah: Number(item.jumlah),
    p_satuan: item.satuan || 'unit', p_nomor_batch: item.nomor_batch || '', p_tanggal_masuk: item.tanggal_masuk,
    p_sumber_pengadaan: item.sumber_pengadaan || 'Input baru', p_keterangan: item.keterangan || ''
  })
  if (error) throw error
  return data
}

export async function mutateInventarisBatch(batchId, jenis, jumlah, options = {}) {
  const { data, error } = await supabase.rpc('mutate_inventaris_batch', {
    p_batch_id: batchId, p_jenis: jenis, p_jumlah: Number(jumlah), p_tanggal: options.tanggal || null, p_keterangan: options.keterangan || ''
  })
  if (error) throw error
  return data
}
