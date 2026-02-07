import { Eligibility } from '~~/server/models/EligibleDrive'
import { User } from '~~/server/models/User'

export default defineEventHandler(async (event) => {
  await connectDB()
  const { userId, driveId } = await readBody(event)

  if (!userId || !driveId) {
    return { statusCode: 400, message: 'userId and driveId are required' }
  }

  const user = await User.findOne({ user_id: userId })
  if (!user) {
    return { statusCode: 404, message: 'User not found' }
  }

  const updated = await Eligibility.findOneAndUpdate(
    { studentUserId: user.user_id, driveId },
    { status: 'seen', driveUpdated: false },
    { new: true },
  )

  if (!updated) {
    return { statusCode: 200, message: 'No status change', data: null }
  }

  return { statusCode: 200, message: 'Marked as seen', data: updated }
})
