import supabase from '../lib/supabase'

const TABLE = 'pinjaman'

export async function getAllPinjaman() {
  const { data, error } = await supabase
    .from(TABLE)
    .select(`
      *,
      satwil:satwil_id(nama)
    `)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data.map(mapPinjaman)
}

export async function createPinjaman(item) {
  const satwil_id = await resolveSatwilId(item.satwil)
  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      id_ht: item.id_ht,
      satwil_id,
      tgl_pinjam: item.tgl_pinjam,
      tgl_kembali: item.tgl_kembali,
      keterangan: item.keterangan || '',
      status: item.status || 'Dipinjam',
      file_url: item.file_url || ''
    })
    .select()
  if (error) throw error
  return data?.[0]
}

export async function updatePinjaman(id, updates) {
  const updateData = { ...updates }
  if (updates.satwil) {
    updateData.satwil_id = await resolveSatwilId(updates.satwil)
    delete updateData.satwil
  }
  
  const { data, error } = await supabase
    .from(TABLE)
    .update(updateData)
    .eq('id', id)
    .select()
  if (error) throw error
  return data?.[0]
}

export async function deletePinjaman(id) {
  const { error } = await supabase.from(TABLE).delete().eq('id', id)
  if (error) throw error
}

async function resolveSatwilId(satwil) {
  if (!satwil) return null
  const { data } = await supabase
    .from('satwil')
    .select('id')
    .eq('nama', satwil)
    .maybeSingle()
  return data?.id || null
}

function mapPinjaman(item) {
  const { satwil_id, created_at, updated_at, ...clean } = item
  return {
    ...clean,
    satwil: item.satwil?.nama || item.satwil
  }
}
