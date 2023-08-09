import { Router } from 'express'
import productsController from '../../api/controllers/productsController.js'
import productValidator from '../../api/middlewares/productValidator.js'

const router = Router()

router.get('/', productsController.findProducts)
router.get('/suggestions', productsController.productsSuggestions)
router.get('/savedProducts', productsController.fetchProductsSaved)
router.get('/:productId', productsController.fetchProductFullInfo)
router.post('/', productsController.createProduct)
router.post('/fromPocket', productValidator, productsController.createProduct)
router.patch('/:productId?', productsController.updateProduct)
router.delete('/:productId?', productsController.deleteProduct)

export default router
