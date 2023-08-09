import Product from '../../db/models/Product.js'
import Promotion from '../../db/models/Promotion.js'
import Variant from '../../db/models/Variant.js'

async function findProducts (req, res) {
  try {
    const { brand, group } = req.query
    const query = {}

    if (brand) {
      query.brand = brand
    }

    if (group) {
      query.materialGroup = group
    }

    const products = await Product.find(query)
    res.json(products)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

async function createProduct (req, res) {
  try {
    const product = req.body
    const newProduct = new Product(product)

    await newProduct.save()

    res.json({ message: 'El producto se ha guardado exitosamente.' })
  } catch (error) {
    console.log(error.message)
    res.status(500).json({ message: error.message })
  }
}

async function updateProduct (req, res) {
  try {
    const { productId } = req.params
    const changes = req.body

    const newProduct = await Product.findOneAndUpdate({ productId }, changes, { runValidators: true, new: true })

    res.json(newProduct)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

async function deleteProduct (req, res) {
  try {
    const { productId } = req.params
    await Product.deleteOne({ productId })
    await Variant.deleteMany({ productId })
    res.json({ message: 'Producto eliminado exitosamente.' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

async function fetchProductsSaved (req, res) {
  try {
    const products = await Product.find({}, { _id: 0, productId: 1 }).lean()

    const productIds = products.map(product => product.productId)

    res.json(productIds)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

async function fetchProductFullInfo (req, res) {
  try {
    const { productId } = req.params

    await Product.updateOne({ productId }, { $inc: { searches: 1 } })

    const products = await Product.aggregate(
      [
        { $match: { productId } },
        {
          $lookup: {
            from: 'brands',
            localField: 'brand',
            foreignField: 'name',
            as: 'brand'
          }
        },
        { $unwind: { path: '$brand' } },
        {
          $lookup: {
            from: 'variants',
            let: { localField: '$productId' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: [
                      '$productId',
                      '$$localField'
                    ]
                  }
                }
              },
              { $sort: { price: 1 } }
            ],
            as: 'variants'
          }
        },
        {
          $addFields: {
            gallery: { $first: '$variants.gallery' }
          }
        },
        { $project: { _id: 0 } }
      ],
      { maxTimeMS: 60000, allowDiskUse: true }
    )
    const product = products[0]
    product.variants = await fetchVariantsWithPromotions(product)
    product.brand = product.brand.name
    product.selectedVariant = product.variants[0]

    res.json(product)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

async function fetchVariantsWithPromotions (product) {
  const promotions = await Promotion.find({})

  const variantsWithPromotions = product.variants.map(variant => {
    const promotionsByVariant = getPromotion(promotions, variant, product)

    if (!promotionsByVariant.plans) {
      return variant
    }

    const plans = promotionsByVariant.plans.map(plan => {
      const { _id, description, months, discount, discountAd } = plan

      const discountPercentage = (100 - discount) / 100
      const discountPercentageAd = (100 - discountAd) / 100

      const priceWithDiscounts = variant.price * discountPercentage * discountPercentageAd

      const monthly = months.map(month => {
        const monthlyPayment = priceWithDiscounts / month
        return {
          amount: month,
          monthlyPayment
        }
      })

      return {
        id: _id,
        description,
        months: monthly,
        discount,
        discountAd,
        priceWithDiscount: priceWithDiscounts
      }
    })

    return {
      ...variant,
      selectedPromo: plans[0],
      promotions: plans
    }
  })

  return variantsWithPromotions
}

function getPromotion (promotions, variant, product) {
  const promotionsBySku = promotions.find(promotion => promotion.key === variant.skuId)

  if (promotionsBySku) {
    return promotionsBySku
  }

  const promotionsByLetter = promotions.find(promotion => promotion.key === variant.letter)

  if (promotionsByLetter) {
    return promotionsByLetter
  }

  const promotionsBySubBrand = promotions.find(promotion => promotion.key === product.brand.subBrand)

  if (promotionsBySubBrand) {
    return promotionsBySubBrand
  }

  const promotionsByGroup = promotions.find(promotion => promotion.key === product.materialGroup)

  if (promotionsByGroup) {
    return promotionsByGroup
  }

  return {}
}

async function productsSuggestions (req, res) {
  try {
    const { searchTerm } = req.query
    const suggestions = await Product.aggregate(
      [
        {
          $search: {
            index: 'quickAutocomplete',
            autocomplete: {
              path: 'name',
              query: searchTerm,
              fuzzy: { maxEdits: 2 }
            }
          }
        },
        { $sort: { materialGroup: 1 } },
        { $limit: 8 },
        {
          $project: {
            _id: 0,
            productId: 1,
            name: 1,
            imageUrl: 1
          }
        }
      ],
      { maxTimeMS: 60000, allowDiskUse: true }
    )
    console.log(suggestions)
    res.json(suggestions)
  } catch (e) {
    console.log(e.message)
    res.status(500).json({ message: e.message })
  }
}

export default { findProducts, fetchProductsSaved, createProduct, updateProduct, deleteProduct, fetchProductFullInfo, productsSuggestions }
