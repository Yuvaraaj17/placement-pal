import { Schema, model } from 'mongoose'

const QuestionSchema = new Schema(
  {
    question_id: { type: String, required: true, unique: true, sparse: true, trim: true },
    question_text: { type: String, required: true, trim: true },
    answer: { type: String, required: true, trim: true },
    option_a: { type: String, required: true, trim: true },
    option_b: { type: String, required: true, trim: true },
    option_c: { type: String, required: true, trim: true },
    option_d: { type: String, required: true, trim: true },
    difficulty: { type: String, required: true, enum: ['easy', 'medium', 'hard'] },
    skill_id: { type: Schema.Types.ObjectId, ref: 'Skill', required: false, index: true, default: null },
    sub_skill_id: { type: Schema.Types.ObjectId, ref: 'SubSkill', required: true, index: true },
  },
  { timestamps: true, collection: 'questions' },
)

export const Question = model('Question', QuestionSchema)
