import { Schema, model } from 'mongoose'

const productSchema = new Schema({
  productId: {
    type: String,
    minLength: 8,
    maxLength: 10,
    unique: true,
    required: true
  },
  name: { type: String, required: true },
  brand: { type: String, required: true },
  materialGroup: { type: String, required: true },
  comfort: { type: String, enum: ['suave', 'medio', 'firme', 'no aplica'], default: 'no aplica' },
  department: { type: String, required: true },
  imageUrl: { type: String, required: true },
  searches: { type: Number, default: 0 }
}, { timestamps: true, versionKey: false })

export default model('Product', productSchema)
