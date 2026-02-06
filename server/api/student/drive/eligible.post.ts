import { Eligibility } from '~~/server/models/EligibleDrive'
import { User } from '~~/server/models/User'

export default defineEventHandler(async (event) => {
  await connectDB()
  const { userId, status } = await readBody(event)

  if (!userId) {
    return { statusCode: 400, message: 'userId is required' }
  }

  const user = await User.findOne({ user_id: userId })
  if (!user) {
    return { statusCode: 404, message: 'User not found' }
  }
  const studentUserId = user.user_id

  const query: { studentUserId: string; status?: string } = { studentUserId }
  if (status) {
    query.status = status
  }

  const eligibleDrives = await Eligibility.find(query).populate('driveId').sort({ createdAt: -1 })

  return {
    statusCode: 200,
    message: 'Fetched eligible drives',
    data: eligibleDrives,
  }
})
