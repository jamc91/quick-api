import app from '../app.js'
import mongoClient from '../db/mongoClient.js'
import routerApi from '../api/routes/index.js'
import { PORT } from '../config.js'
import multer from 'multer'
import { parseXlsxToJSON } from '../utils/xlsxToJson.js'
import path, { dirname } from 'path'
import { fileURLToPath } from 'url'
import Promotion from '../db/models/Promotion.js'
const upload = multer({ dest: 'uploads/' })

const __dirname = dirname(fileURLToPath(import.meta.url))

routerApi(app)
await mongoClient.connect()

app.get('/uploadPromotions', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'))
})

app.get('/uploadAditionalPromotions', (req, res) => {
  res.sendFile(path.join(__dirname, '../adPromotion.html'))
})

app.get('/uploadPrices', (req, res) => {
  res.sendFile(path.join(__dirname, '../variants.html'))
})

app.post('/upload', upload.single('excel'), async (req, res, next) => {
  try {
    const file = req.file.path
    const json = parseXlsxToJSON(file)
    Promotion.collection.drop()
    await Promotion.insertMany(json)

    res.status(200).json({ message: 'Promociones actualizadas' })
  } catch (error) {
    console.log(error.message)
    res.status(500).json({ message: 'ha ocurrido un error.' })
  }
})

app.post('/uploadAditionalsPromotions', upload.single('excel-adPromotions'), async (req, res, next) => {
  try {
    const file = req.file.path
    const json = parseXlsxToJSON(file)
    // const promotions = await Promotion.find({})

    const operations = json.map(promotion => {
      return {
        updateOne: {
          filter: { key: promotion.key },
          update: { $push: { plans: { $each: promotion.plans, $position: 0 } } }
        }
      }
    })
    await Promotion.bulkWrite(operations)

    res.status(200).json({ message: 'Promociones actualizadas' })
  } catch (error) {
    console.log(error.message)
    res.status(500).json({ message: 'ha ocurrido un error.' })
  }
})

app.listen(PORT, console.log(`Ready on: http://localhost:${PORT}`))
