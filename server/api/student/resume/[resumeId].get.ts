import { Types } from 'mongoose'
import { Resume } from '~~/server/models/Resume'

export default defineEventHandler(async (event) => {
  await connectDB()

  const user = event.context.user as { user_id?: string } | undefined
  if (!user?.user_id) {
    return { statusCode: 401, message: 'Unauthorized' }
  }

  const resumeId = event.context.params?.resumeId
  if (!resumeId || !Types.ObjectId.isValid(resumeId)) {
    return { statusCode: 400, message: 'Invalid resume id' }
  }

  const resume = await Resume.findOne({ _id: resumeId, user_id: user.user_id }).lean()
  if (!resume) {
    return { statusCode: 404, message: 'Resume not found' }
  }

  return { statusCode: 200, message: 'Resume fetched', data: resume }
})
