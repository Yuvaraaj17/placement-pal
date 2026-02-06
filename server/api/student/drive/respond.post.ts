import { Eligibility } from '~~/server/models/EligibleDrive'
import { User } from '~~/server/models/User'

const allowedStatuses = new Set(['willing', 'not willing'])

export default defineEventHandler(async (event) => {
  await connectDB()
  const { userId, driveId, status } = await readBody(event)

  if (!userId || !driveId || !status) {
    return { statusCode: 400, message: 'userId, driveId, and status are required' }
  }

  if (!allowedStatuses.has(status)) {
    return { statusCode: 400, message: 'Invalid status' }
  }

  const user = await User.findOne({ user_id: userId })
  if (!user) {
    return { statusCode: 404, message: 'User not found' }
  }
  const studentUserId = user.user_id

  const updated = await Eligibility.findOneAndUpdate(
    { studentUserId, driveId },
    { status },
    { new: true },
  )

  if (!updated) {
    return { statusCode: 404, message: 'Eligibility not found' }
  }

  return { statusCode: 200, message: 'Updated response', data: updated }
})
