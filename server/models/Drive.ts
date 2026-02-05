import { Schema, model } from 'mongoose'

const DriveSchema = new Schema(
  {
    company_name: {
      type: String,
      required: true,
      trim: true,
    },
    company_website: {
      type: String,
      trim: true,
    },
    job_title: {
      type: String,
      required: true,
      trim: true,
    },
    job_description: {
      type: String,
      trim: true,
    },
    expected_compensation: {
      type: Number,
      default: 0,
    },
    departments: {
      cse: { type: Boolean, default: false },
      ece: { type: Boolean, default: false },
      eee: { type: Boolean, default: false },
      mech: { type: Boolean, default: false },
    },
    required_cgpa: {
      type: Number,
      default: 7.5,
    },
    venue: {
      type: String,
      trim: true,
    },
    date_of_drive: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  },
)

export const Drive = model('Drive', DriveSchema, 'drives')
