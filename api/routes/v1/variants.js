import { Router } from 'express'
import variantsController from '../../controllers/variantsController.js'
import variantValidator from '../../middlewares/variantValidator.js'
import multer from 'multer'
const upload = multer({ dest: 'uploads/' })

const router = Router()

router.get('/:productId?', variantsController.findVariants)
router.post('/', variantValidator, variantsController.createVariant)
router.post('/updatePromotions', upload.single('excel-price'), variantsController.updatePromotions)
router.patch('/:variantId?', variantsController.updateVariant)
router.delete('/:variantId?', variantsController.deleteVariant)

export default router
