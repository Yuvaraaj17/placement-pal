import { Schema, model } from 'mongoose'

const EligibilitySchema = new Schema(
  {
    studentUserId: { type: String, required: true },
    driveId: { type: Schema.Types.ObjectId, ref: 'Drive', required: true },
    status: { type: String, enum: ['unseen', 'seen', 'not willing', 'willing'], default: 'unseen' },
    driveUpdated: { type: Boolean, default: false },
  },
  { timestamps: true },
)

EligibilitySchema.index({ studentUserId: 1, driveId: 1 }, { unique: true })

export const Eligibility = model('Eligibility', EligibilitySchema)
