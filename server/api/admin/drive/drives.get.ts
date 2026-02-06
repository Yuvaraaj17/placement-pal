import { Drive } from '~~/server/models/Drive'

export default defineEventHandler(async () => {
  await connectDB()
  const drives = await Drive.aggregate([
    {
      $lookup: {
        from: 'eligibilities',
        let: { driveId: '$_id' },
        pipeline: [
          { $match: { $expr: { $eq: ['$driveId', '$$driveId'] } } },
          {
            $group: {
              _id: null,
              eligibleCount: { $sum: 1 },
              respondedCount: {
                $sum: {
                  $cond: [{ $ne: ['$status', 'unseen'] }, 1, 0],
                },
              },
            },
          },
        ],
        as: 'eligibilityStats',
      },
    },
    {
      $addFields: {
        eligibleCount: {
          $ifNull: [{ $arrayElemAt: ['$eligibilityStats.eligibleCount', 0] }, 0],
        },
        respondedCount: {
          $ifNull: [{ $arrayElemAt: ['$eligibilityStats.respondedCount', 0] }, 0],
        },
      },
    },
    { $project: { eligibilityStats: 0 } },
  ])

  return { statusCode: 200, message: 'Fectched Drives', data: drives }
})
