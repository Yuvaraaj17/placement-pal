import { User } from '~~/server/models/User'

export const getEligibleStudents = async ({
  cgpa,
  departments,
}: {
  cgpa: number
  departments: string[]
}) => {
  await connectDB()

  const eligibleStudents = await User.find({
    role: 'student',
    dept: { $in: departments },
    cgpa: { $gte: cgpa },
    current_offers: 0,
  })

  return eligibleStudents
}
