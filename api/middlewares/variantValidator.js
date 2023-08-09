function variantValidator (req, res, next) {
  const { records } = req.body

  if (!records) {
    next()
  }

  const { id, title, variants } = records[0].allMeta

  const formattedVariants = variants.map(variant => {
    const { skuId, size, prices: { listPrice }, galleriaImages, thumbnailImage } = variant
    const formattedSize = size.toLowerCase().replace(/ /g, '-')
    const formattedName = title.replace(/\b(confort|medio|suave|firme)\b/g, '').trim()
    const description = size.split(' ')
    const gallery = [thumbnailImage, ...galleriaImages]
    return {
      skuId,
      productId: id,
      name: `${formattedName} ${description[0]}`,
      size: formattedSize,
      gallery,
      price: Number(listPrice)
    }
  }).sort((a, b) => a.price - b.price)

  req.body = formattedVariants

  next()
}

export default variantValidator
