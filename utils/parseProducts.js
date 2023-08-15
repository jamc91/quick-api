import xlsx from 'xlsx'

function parseProduct (path) {
  const workbook = xlsx.readFile(path)
  const sheetName = workbook.SheetNames[0]
  const worksheet = workbook.Sheets[sheetName]

  const json = xlsx.utils.sheet_to_json(worksheet, { defval: '' })

  return json
}

export { parseProduct }
