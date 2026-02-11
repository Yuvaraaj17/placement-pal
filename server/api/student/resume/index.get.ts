import { Resume } from '~~/server/models/Resume'

export default defineEventHandler(async (event) => {
  await connectDB()

  const user = event.context.user as { user_id?: string } | undefined
  if (!user?.user_id) {
    return { statusCode: 401, message: 'Unauthorized' }
  }

  const resumes = await Resume.find({ user_id: user.user_id })
    .select('_id title createdAt updatedAt')
    .sort({ updatedAt: -1 })
    .lean()

  return { statusCode: 200, message: 'Resumes fetched', data: resumes || [] }
})
