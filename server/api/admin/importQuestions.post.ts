import { Types } from 'mongoose'
import { Counter } from '~~/server/models/Counter'

const REQUIRED_FIELDS = [
  'question_text',
  'answer',
  'option_a',
  'option_b',
  'option_c',
  'option_d',
  'difficulty',
]

const DIFFICULTY_VALUES = new Set(['easy', 'medium', 'hard'])

const parseQuestions = (raw: string) => {
  const trimmed = raw.trim()
  if (!trimmed) {
    return { error: 'File is empty' }
  }

  if (trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmed)
      if (!Array.isArray(parsed)) {
        return { error: 'JSON must be an array of objects' }
      }
      return {
        items: parsed,
        lineNumbers: parsed.map((_, index) => index + 1),
        mode: 'array',
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        return { error: err.message }
      }
      return { error: 'Invalid JSON file' }
    }
  }

  const lines = raw.split(/\r?\n/)
  const items: unknown[] = []
  const lineNumbers: number[] = []

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].trim()
    if (!line) continue
    try {
      const parsed = JSON.parse(line)
      items.push(parsed)
      lineNumbers.push(index + 1)
    } catch (err: unknown) {
      if (err instanceof Error) {
        return { error: `Invalid JSON at line ${index + 1}: ${err.message}` }
      }
      return { error: `Invalid JSON at line ${index + 1}` }
    }
  }

  if (!items.length) {
    return { error: 'File contains no JSON objects' }
  }

  return { items, lineNumbers, mode: 'lines' }
}

const normalizeDifficulty = (value: unknown) => {
  if (typeof value !== 'string') return null
  const normalized = value.trim().toLowerCase()
  return DIFFICULTY_VALUES.has(normalized) ? normalized : null
}

export default defineEventHandler(async (event) => {
  await connectDB()

  try {
    const { skill_id, sub_skill_id, file_contents } = await readBody(event)

    if (!skill_id || !Types.ObjectId.isValid(skill_id)) {
      return { statusCode: 400, message: 'Skill id is required' }
    }
    if (!sub_skill_id || !Types.ObjectId.isValid(sub_skill_id)) {
      return { statusCode: 400, message: 'Sub skill id is required' }
    }
    if (!file_contents || typeof file_contents !== 'string') {
      return { statusCode: 400, message: 'File contents are required' }
    }

    const normalizedSkillId = new Types.ObjectId(skill_id)
    const normalizedSubSkillId = new Types.ObjectId(sub_skill_id)

    const subSkill = await SubSkill.findOne({ _id: normalizedSubSkillId })
      .select('skill_id')
      .lean()
    if (!subSkill) {
      return { statusCode: 400, message: 'Sub skill not found' }
    }
    if (String(subSkill.skill_id || '') !== String(normalizedSkillId)) {
      return { statusCode: 400, message: 'Sub skill does not belong to selected skill' }
    }

    const parsed = parseQuestions(file_contents)
    if (parsed.error) {
      return { statusCode: 400, message: parsed.error }
    }

    const items = parsed.items ?? []
    const lineNumbers = parsed.lineNumbers ?? []

    const prepared = items.map((item, index) => {
      if (!item || typeof item !== 'object' || Array.isArray(item)) {
        const line = lineNumbers[index] ?? index + 1
        throw new Error(`Schema error at line ${line}: expected object`)
      }

      const payload = item as Record<string, unknown>

      for (const field of REQUIRED_FIELDS) {
        const value = payload[field]
        if (typeof value !== 'string' || !value.trim()) {
          const line = lineNumbers[index] ?? index + 1
          throw new Error(`Schema error at line ${line}: missing or invalid ${field}`)
        }
      }

      const difficulty = normalizeDifficulty(payload.difficulty)
      if (!difficulty) {
        const line = lineNumbers[index] ?? index + 1
        throw new Error(`Schema error at line ${line}: difficulty must be easy, medium, or hard`)
      }

      return {
        question_text: String(payload.question_text).trim(),
        answer: String(payload.answer).trim(),
        option_a: String(payload.option_a).trim(),
        option_b: String(payload.option_b).trim(),
        option_c: String(payload.option_c).trim(),
        option_d: String(payload.option_d).trim(),
        difficulty,
        skill_id: normalizedSkillId,
        sub_skill_id: normalizedSubSkillId,
      }
    })

    const counter = await Counter.findOneAndUpdate(
      { _id: 'question_id' },
      { $inc: { seq: prepared.length } },
      { upsert: true, returnDocument: 'after' },
    )

    const start = counter.seq - prepared.length + 1
    const documents = prepared.map((item, index) => ({
      question_id: `Q_${String(start + index).padStart(6, '0')}`,
      ...item,
    }))

    const inserted = await Question.insertMany(documents, { ordered: true })

    if (!inserted || inserted.length !== documents.length) {
      return { statusCode: 500, message: 'Failed to import all questions' }
    }

    return {
      statusCode: 200,
      message: `Imported ${inserted.length} questions`,
      count: inserted.length,
    }
  } catch (err: unknown) {
    if (err instanceof Error) {
      return { statusCode: 400, message: err.message }
    }
    return { statusCode: 500, message: 'Failed to import questions' }
  }
})
