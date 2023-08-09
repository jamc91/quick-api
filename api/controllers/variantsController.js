import Variant from '../../db/models/Variant.js'
import { parseProduct } from '../../utils/parseProducts.js'

async function findVariants (req, res) {
  const { productId } = req.params
  let query = {}
  if (productId) {
    query = { productId }
  }
  console.log(query)
  try {
    const variants = await Variant.find(query)

    res.json(variants)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

async function createVariant (req, res) {
  try {
    const variants = req.body

    await Variant.insertMany(variants)

    res.json({ message: 'se han ingresado correctamente' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

async function updateVariant (req, res) {
  try {
    const { variantId } = req.params
    const changes = req.body

    const newVariant = await Variant.findOneAndUpdate({ skuId: variantId }, changes, { runValidators: true, new: true })

    res.json(newVariant)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

async function deleteVariant (req, res) {
  try {
    const { variantId } = req.params

    await Variant.deleteOne({ skuId: variantId })

    res.json({ message: 'Variante eliminada exitosamente.' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

async function updatePromotions (req, res) {
  try {
    const path = req.file.path
    const json = parseProduct(path)

    const updateOperations = json.map(variant => {
      const { skuId, letter } = variant
      return {
        updateOne: {
          filter: { skuId },
          update: { $set: { letter } }
        }
      }
    })

    await Variant.bulkWrite(updateOperations)

    res.status(200).json({
      message: 'Variantes Actualizadas!!',
      json
    })
  } catch (error) {
    console.log(error.message)
    res.status(500).json({ message: error.message })
  }
}

export default { findVariants, createVariant, updateVariant, deleteVariant, updatePromotions }
