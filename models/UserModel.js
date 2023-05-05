const mongoose = require('mongoose')
const UserSchema = new mongoose.Schema(
  {
    social_id: { type: String, required: true },
    email: { type: String, required: true },
    nickname: { type: String, required: true },
    gender: { type: String, required: false },
    age: { type: String, required: false },
    address: { type: String, required: false },
    building_name: { type: String, required: false },
    detail_address: { type: String, required: false },
    building_password: { type: String, required: false },
    payment_state: { type: String, required: false },
    refresh_token: { type: String, required: true },
  },
  { timestamps: true }
)

module.exports = mongoose.model('User', UserSchema)
