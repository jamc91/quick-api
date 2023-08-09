import { Schema, model } from 'mongoose'

const planSchema = new Schema({
  description: { type: String },
  months: { type: [Number] },
  discount: { type: Number },
  discountAd: { type: Number }
})

const promotionSchema = new Schema({
  key: { type: String },
  exception: { type: String, default: 'Sin Definir' },
  section: { type: String },
  participate: { type: String },
  description: { type: String },
  plans: { type: [planSchema] }
}, { versionKey: false })

export default model('Promotion', promotionSchema)
