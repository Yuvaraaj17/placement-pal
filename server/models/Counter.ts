import { Schema, model } from "mongoose";

const CounterSchema = new Schema({
    _id: {
      type: String,
      required: true
    },
    seq: {
      type: Number,
      required: true,
      default: 0
    }
  },
  {
    timestamps: { updatedAt: true, createdAt: false },
    versionKey: false
  }
)

export const Counter = model('Counter', CounterSchema)