import { Drive } from '~~/server/models/Drive'
import { Eligibility } from '~~/server/models/EligibleDrive'
import { getEligibleStudents } from '~~/server/utils/students'

export default defineEventHandler(async (event) => {
  await connectDB()
  const body = await readBody(event)

  try {
    const selectedDepts = Object.keys(body.departments)
      .filter((key) => body.departments[key] === true)
      .map((dept) => dept.toUpperCase())

    const eligibleStudents = await getEligibleStudents({
      cgpa: Number(body.required_cgpa),
      departments: selectedDepts,
    })

    if (eligibleStudents.length > 0) {
      const createdDrive = await Drive.create(body)
      const eligibilityDocs = eligibleStudents.map((student) => ({
        studentUserId: student.user_id,
        driveId: createdDrive._id,
        status: 'unseen',
      }))
      await Eligibility.insertMany(eligibilityDocs, { ordered: false })
    } else {
      return { statusCode: 500, message: 'No Eligible Students' }
    }
  } catch (err) {
    if (err instanceof Error) return { statusCode: 500, message: 'Internal error' + err.message }
  }

  return { statusCode: 200, message: 'Registered Drive Successfully' }
})
