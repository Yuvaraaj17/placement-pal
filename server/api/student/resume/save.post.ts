import { Types } from 'mongoose'
import { Resume } from '~~/server/models/Resume'

export default defineEventHandler(async (event) => {
  await connectDB()

  const user = event.context.user as { user_id?: string } | undefined
  if (!user?.user_id) {
    return { statusCode: 401, message: 'Unauthorized' }
  }

  const { resumeId, title, content } = await readBody(event)

  if (!content || typeof content !== 'object') {
    return { statusCode: 400, message: 'Resume content is required' }
  }

  if (resumeId) {
    if (!Types.ObjectId.isValid(resumeId)) {
      return { statusCode: 400, message: 'Invalid resume id' }
    }

    const updated = await Resume.findOneAndUpdate(
      { _id: resumeId, user_id: user.user_id },
      { title: typeof title === 'string' ? title : '', content },
      { new: true },
    ).lean()

    if (!updated) {
      return { statusCode: 404, message: 'Resume not found' }
    }

    return { statusCode: 200, message: 'Resume updated', data: updated }
  }

  const created = await Resume.create({
    user_id: user.user_id,
    title: typeof title === 'string' ? title : '',
    content,
  })

  return { statusCode: 201, message: 'Resume created', data: created }
})
