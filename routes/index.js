import express from 'express'
import productsRouter from './v1/products.js'
import variantsRouter from './v1/variants.js'
import brandsRouter from './v1/brands.js'

function routerApi (app) {
  const router = express.Router()

  app.use('/api/v1', router)

  router.use('/products', productsRouter)
  router.use('/variants', variantsRouter)
  router.use('/brands', brandsRouter)
}

export default routerApi
