import Brand from '../../db/models/Brand.js'
import xlsx from 'xlsx'

async function create (req, res) {
  try {
    const path = req.file.path
    const workbook = xlsx.readFile(path)
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]

    const json = xlsx.utils.sheet_to_json(worksheet)

    await Brand.insertMany(json)
    res.json({ message: 'Se han agregado satisfactoriamente.' })
  } catch (error) {
    console.log(error.message)
    res.status(500).json({ message: 'Ha ocurrido un error.' })
  }
}

export default { create }
