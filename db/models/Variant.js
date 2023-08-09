import { Schema, model } from 'mongoose'

const variantSchema = new Schema({
  skuId: {
    type: String,
    minLength: 8,
    maxLength: 10,
    unique: true,
    required: true
  },
  productId: {
    type: String,
    minLength: 8,
    maxLength: 10,
    required: true
  },
  name: { type: String, required: true },
  size: { type: String, enum: ['individual', 'matrimonial', 'queen-size', 'king-size', 'california-king'], required: true },
  gallery: { type: [String] },
  price: { type: Number, required: true },
  letter: { type: String, default: 'Sin letra' }
}, { timestamps: true, versionKey: false })

export default model('Variant', variantSchema)
