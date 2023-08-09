function productValidator (req, res, next) {
  const { records } = req.body

  if (!records) {
    next()
  }

  const { id, title, brand, department, materialGroup, productImages } = records[0].allMeta
  const { imageUrl } = productImages.filter(image => image.imageType === 'thumbnailImage')[0]

  const regularExpresionComfort = /.*(suave|medio|firme).*/i
  const regularExpresionCategory = /.*(colchón|colchon|box).*/iu
  let comfort = title.replace(regularExpresionComfort, '$1').trim()
  const category = title.replace(regularExpresionCategory, '$1').trim().toLowerCase().replace('ó', 'o')
  if (!regularExpresionComfort.test(title)) {
    comfort = 'no aplica'
  }

  req.body = { productId: id, name: title, brand, department, materialGroup, category, comfort, imageUrl }
  next()
}

export default productValidator
