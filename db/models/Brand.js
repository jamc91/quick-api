import { Schema, model } from 'mongoose'

const brandSchema = new Schema({
  id: { type: String, default: 'Sin definir' },
  subBrand: { type: String, default: 'Sin definir' },
  name: { type: String, unique: true, required: true }
}, { versionKey: false })

export default model('Brand', brandSchema)
