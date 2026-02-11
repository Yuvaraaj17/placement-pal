import { Schema, model } from 'mongoose'

const UserSchema = new Schema(
  {
    // Common Fields for everyone
    user_id: { type: String, unique: true },
    email: { type: String, sparse: true, unique: true, lowercase: true },
    email_verified: { type: Boolean, default: false },
    password: { type: String, required: true, select: false },
    role: {
      type: String,
      required: true,
      enum: ['admin', 'student'],
      default: 'student',
    },
    name: { type: String, trim: true },

    dept: {
      type: String,
      enum: ['CSE', 'ECE', 'EEE', 'MECH', null],
      uppercase: true,
    },
    cgpa: { type: Number, min: 7.5, max: 9.5 },
    current_offers: { type: Number, min: 0, max: 2 },
  },
  { timestamps: true, collection: 'users' },
)

export const User = model('User', UserSchema)
