import { Schema, model } from 'mongoose'

const UserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, select: false }, // 'select: false' hides it from queries by default
    role: { type: String, default: 'user' },
  },
  { timestamps: true, collection: 'users' },
)

export const User = model('User', UserSchema, 'users')
