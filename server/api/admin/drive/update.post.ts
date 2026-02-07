import { Drive } from '~~/server/models/Drive'
import { Eligibility } from '~~/server/models/EligibleDrive'
import { getEligibleStudents } from '~~/server/utils/students'

const toSelectedDepartments = (departments?: Record<string, boolean>) => {
  if (!departments) return []
  return Object.keys(departments)
    .filter((key) => departments[key] === true)
    .map((dept) => dept.toUpperCase())
}

const isSameDate = (a?: Date | string, b?: Date | string) => {
  if (!a && !b) return true
  if (!a || !b) return false
  return new Date(a).getTime() === new Date(b).getTime()
}

export default defineEventHandler(async (event) => {
  await connectDB()
  const body = await readBody(event)

  const { driveId, ...updates } = body
  if (!driveId) return { statusCode: 400, message: 'driveId is required' }

  const drive = await Drive.findById(driveId)
  if (!drive) return { statusCode: 404, message: 'Drive not found' }

  const allowedFields = [
    'company_website',
    'job_title',
    'job_description',
    'expected_compensation',
    'venue',
    'date_of_drive',
    'departments',
    'required_cgpa',
  ]

  const next: Record<string, unknown> = {}
  for (const field of allowedFields) {
    if (updates[field] !== undefined) next[field] = updates[field]
  }

  const departmentsChanged =
    next.departments !== undefined &&
    JSON.stringify(next.departments) !== JSON.stringify(drive.departments)
  const cgpaChanged =
    next.required_cgpa !== undefined && Number(next.required_cgpa) !== Number(drive.required_cgpa)

  const shouldRecheck = departmentsChanged || cgpaChanged

  const hasChanges = Object.keys(next).some((field) => {
    if (field === 'date_of_drive') return !isSameDate(next[field] as Date, drive.date_of_drive)
    if (field === 'departments')
      return JSON.stringify(next.departments) !== JSON.stringify(drive.departments)
    return (next[field] as unknown) !== (drive as any)[field]
  })

  if (!hasChanges) {
    return { statusCode: 200, message: 'No changes to update' }
  }

  const updatedDrive = await Drive.findByIdAndUpdate(driveId, { $set: next }, { new: true })

  if (!updatedDrive) return { statusCode: 404, message: 'Drive not found after update' }

  const existingEligibilities = await Eligibility.find({ driveId }).select('studentUserId')
  const existingUserIds = new Set(existingEligibilities.map((e) => e.studentUserId))

  if (shouldRecheck) {
    const updatedDepartments =
      (next.departments as Record<string, boolean>) ?? updatedDrive.departments
    const updatedCgpa = Number(next.required_cgpa ?? updatedDrive.required_cgpa)
    const eligibleStudents = await getEligibleStudents({
      cgpa: updatedCgpa,
      departments: toSelectedDepartments(updatedDepartments),
    })

    const newUserIds = new Set(
      eligibleStudents.map((student) => student.user_id).filter(Boolean) as string[],
    )

    const removed = [...existingUserIds].filter((id) => !newUserIds.has(id))
    const added = [...newUserIds].filter((id) => !existingUserIds.has(id))
    const stayed = [...newUserIds].filter((id) => existingUserIds.has(id))

    if (removed.length > 0) {
      await Eligibility.deleteMany({ driveId, studentUserId: { $in: removed } })
      console.log(`[Drive Update] Removed eligibility for drive ${driveId}`, removed)
    }

    if (stayed.length > 0) {
      await Eligibility.updateMany(
        { driveId, studentUserId: { $in: stayed } },
        { status: 'unseen', driveUpdated: true },
      )
    }

    if (added.length > 0) {
      await Eligibility.insertMany(
        added.map((studentUserId) => ({
          studentUserId,
          driveId,
          status: 'unseen',
          driveUpdated: false,
        })),
        { ordered: false },
      )
    }
  } else {
    await Eligibility.updateMany({ driveId }, { status: 'unseen', driveUpdated: true })
  }

  return { statusCode: 200, message: 'Drive updated', data: updatedDrive }
})
