import { Schema, model } from 'mongoose'

const PasswordResetTokenSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    tokenHash: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true, collection: 'password_reset_tokens' },
)

PasswordResetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

export const PasswordResetToken = model('PasswordResetToken', PasswordResetTokenSchema)
