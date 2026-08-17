import ExcelJS from 'exceljs'

function normalizeRows(rows) {
  const source = rows.length ? rows : [{ Informasi: 'Tidak ada data pada periode ini' }]
  const keys = [...new Set(source.flatMap(row => Object.keys(row).filter(key => typeof row[key] !== 'object')))]
  return { source, keys }
}

export async function exportLaporanExcel(report) {
  const workbook = new ExcelJS.Workbook()
  const sheets = [
    ['Ringkasan', [{ Metrik: 'Periode', Nilai: report.period }, { Metrik: 'Total alat saat ini', Nilai: report.dashboard.totalAlat }, { Metrik: 'Tersedia saat ini', Nilai: report.dashboard.tersedia }, { Metrik: 'Dipinjam saat ini', Nilai: report.dashboard.dipinjam }, { Metrik: 'Rusak saat ini', Nilai: report.dashboard.rusak }, { Metrik: 'Hilang saat ini', Nilai: report.dashboard.hilang }]],
    ['Data Alat TIK', report.inventory], ['Mutasi Inventaris', report.mutasi], ['Peminjaman HT', report.pinjaman], ['Suku Cadang', report.sukuCadang], ['SPPM', report.sppm], ['Tracking Perbaikan', report.tracking]
  ]
  sheets.forEach(([name, rows]) => {
    const sheet = workbook.addWorksheet(name)
    const { source, keys } = normalizeRows(rows)
    sheet.columns = keys.map(key => ({ header: key.replaceAll('_', ' ').toUpperCase(), key }))
    sheet.addRows(source)
    sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }
    sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF17365D' } }
    sheet.views = [{ state: 'frozen', ySplit: 1 }]
    if (sheet.columnCount) sheet.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: sheet.columnCount } }
    sheet.columns.forEach(column => { column.width = Math.min(35, Math.max(12, ...column.values.map(value => String(value || '').length + 2))) })
  })
  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `laporan_siharkan_tik_${report.period}.xlsx`
  link.click()
  URL.revokeObjectURL(url)
}
