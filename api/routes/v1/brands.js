import { Router } from 'express'
import brandsController from '../../controllers/brandsController.js'
import multer from 'multer'
const upload = multer({ dest: 'uploads/' })

const router = Router()

router.post('/', upload.single('excel-brands'), brandsController.create)

export default router
