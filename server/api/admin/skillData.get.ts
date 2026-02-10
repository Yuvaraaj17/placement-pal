export default defineEventHandler(async () => {
  await connectDB()

  try {
    const skillData = await Skill.aggregate([
      // -------------------------
      // A) ALL skills (even if they have zero subskills)
      // -------------------------
      {
        $lookup: {
          from: 'subskills',
          localField: '_id',
          foreignField: 'skill_id',
          as: 'subskills',
        },
      },
      { $unwind: { path: '$subskills', preserveNullAndEmptyArrays: true } },

      // Count questions per subskill (when subskill exists)
      {
        $lookup: {
          from: 'questions',
          localField: 'subskills._id',
          foreignField: 'sub_skill_id',
          as: 'qs',
        },
      },

      // Shape one "row" per subskill (or null row when no subskills)
      {
        $project: {
          skill_id: '$_id',
          skill_name: '$skill_name', // change to "$name" if that's your field
          skill_code: '$skill_code',

          sub_skill_id: '$subskills._id',
          sub_skill_name: '$subskills.sub_skill_name', // or "$subskills.name"
          sub_skill_status: {
            $cond: [{ $eq: ['$subskills.sub_skill_status', true] }, 'active', 'inactive'],
          },
          question_count: {
            $cond: [{ $ifNull: ['$subskills._id', false] }, { $size: '$qs' }, 0],
          },
        },
      },
      // Stable ordering for subskills within each skill
      { $sort: { skill_name: 1, skill_code: 1, sub_skill_name: 1 } },

      // Group back by skill
      {
        $group: {
          _id: '$skill_id',
          skill_name: { $first: '$skill_name' },
          skill_code: { $first: '$skill_code' },
          rows: {
            $push: {
              sub_skill_id: '$sub_skill_id',
              sub_skill_name: '$sub_skill_name',
              sub_skill_status: '$sub_skill_status',
              question_count: '$question_count',
            },
          },
        },
      },

      // Remove the dummy null row for skills with no subskills => rows: []
      {
        $set: {
          rows: {
            $filter: {
              input: '$rows',
              as: 'r',
              cond: { $ne: ['$$r.sub_skill_id', null] },
            },
          },
        },
      },

      {
        $project: {
          _id: 0,
          skill_id: '$_id',
          skill_name: 1,
          skill_code: 1,
          rows: 1,
        },
      },

      // -------------------------
      // B) ORPHAN subskills (no skill OR skill missing)
      // -------------------------
      {
        $unionWith: {
          coll: 'subskills',
          pipeline: [
            // attach skill doc (if any)
            {
              $lookup: {
                from: 'skills',
                localField: 'skill_id',
                foreignField: '_id',
                as: 'skill',
              },
            },

            // keep only orphans:
            // - skill_id is null/absent OR
            // - lookup found nothing (skill missing)
            {
              $match: {
                $or: [
                  { skill_id: { $exists: false } },
                  { skill_id: null },
                  { skill: { $eq: [] } },
                ],
              },
            },

            // count questions per orphan subskill
            {
                $lookup: {
                  from: 'questions',
                  localField: '_id',
                  foreignField: 'sub_skill_id',
                  as: 'qs',
                },
              },

            // group all orphans under one bucket
              {
                $group: {
                  _id: null,
                  skill_id: { $first: null },
                  skill_name: { $first: 'Unassigned' },
                  skill_code: { $first: null },
                  rows: {
                    $push: {
                      sub_skill_id: '$_id',
                      sub_skill_name: '$sub_skill_name', // or "$name"
                    sub_skill_status: {
                      $cond: [{ $eq: ['$sub_skill_status', true] }, 'active', 'inactive'],
                    },
                    question_count: { $size: '$qs' },
                  },
                },
              },
            },

            { $project: { _id: 0, skill_id: 1, skill_name: 1, skill_code: 1, rows: 1 } },
            { $sort: { skill_name: 1, skill_code: 1, 'rows.sub_skill_name': 1 } },
          ],
        },
      },

      // Optional: sort so Unassigned goes last (or first)
      // This puts named skills first, then Unassigned
      { $sort: { skill_name: 1, skill_code: 1 } },
    ])

    return { statusCode: 200, message: 'Fetched Data Successfully', data: skillData }
  } catch (err: unknown) {
    if (err instanceof Error) {
      return { statusCode: 500, message: err.message }
    }
  }
})
