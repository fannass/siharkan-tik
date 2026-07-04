import supabase from '../lib/supabase'

const TABLE = 'inventaris'

export async function getAllInventaris() {
  const { data, error } = await supabase
    .from(TABLE)
    .select(`
      *,
      kategori:kategori_id(nama),
      satwil:lokasi_id(nama)
    `)
    .order('id', { ascending: true })
  if (error) throw error
  return data.map(mapInventaris)
}

export async function getInventarisById(id) {
  const { data, error } = await supabase
    .from(TABLE)
    .select(`
      *,
      kategori:kategori_id(nama),
      satwil:lokasi_id(nama)
    `)
    .eq('id', id)
    .single()
  if (error) throw error
  return mapInventaris(data)
}

export async function createInventaris(item) {
  const { kategori_id, lokasi_id } = await ensureRefs(item)
  const insertData = { ...item }
  delete insertData.kategori
  delete insertData.lokasi
  insertData.kategori_id = kategori_id || item.kategori_id
  insertData.lokasi_id = lokasi_id || item.lokasi_id
  const { data, error } = await supabase
    .from(TABLE)
    .insert(insertData)
    .select()
  if (error) throw error
  return data?.[0]
}

export async function updateInventaris(id, updates) {
  const { kategori_id, lokasi_id } = await ensureRefs(updates)
  const updateData = { ...updates }
  delete updateData.kategori
  delete updateData.lokasi
  if (kategori_id || updates.kategori_id) updateData.kategori_id = kategori_id || updates.kategori_id
  if (lokasi_id || updates.lokasi_id) updateData.lokasi_id = lokasi_id || updates.lokasi_id
  const { data, error } = await supabase
    .from(TABLE)
    .update(updateData)
    .eq('id', id)
    .select()
  if (error) throw error
  return data?.[0]
}

export async function deleteInventaris(id) {
  const { error } = await supabase
    .from(TABLE)
    .delete()
    .eq('id', id)
  if (error) throw error
}

async function ensureRefs(item) {
  let kategori_id = item.kategori_id
  let lokasi_id = item.lokasi_id

  if (item.kategori && !kategori_id) {
    const { data } = await supabase
      .from('kategori')
      .select('id')
      .eq('nama', item.kategori)
      .maybeSingle()
    if (data) kategori_id = data.id
  }

  if (item.lokasi && !lokasi_id) {
    const { data } = await supabase
      .from('satwil')
      .select('id')
      .eq('nama', item.lokasi)
      .maybeSingle()
    if (data) lokasi_id = data.id
  }

  return { kategori_id, lokasi_id }
}

function mapInventaris(item) {
  const { kategori, satwil, kategori_id, lokasi_id, created_at, updated_at, ...clean } = item
  return {
    ...clean,
    kategori: kategori?.nama || kategori,
    lokasi: satwil?.nama || item.lokasi
  }
}
