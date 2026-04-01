import { NextResponse } from "next/server";
import { activitiesCol } from "@/lib/db";
import { ObjectId } from "mongodb";

// GET /api/activities
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  const col = await activitiesCol();

  // Mark activities as "ended" if their endDate has passed (skip when autoEnd is false)
  // Uses $toDate to handle endDate stored as either string or Date
  await col.updateMany(
    { status: "active", endDate: { $exists: true, $ne: null }, autoEnd: { $ne: false } },
    [
      {
        $set: {
          status: {
            $cond: {
              if: { $lt: [{ $toDate: "$endDate" }, new Date()] },
              then: "ended",
              else: "$status",
            },
          },
          updatedAt: new Date(),
        },
      },
    ],
  );

  const activities = await col
    .aggregate([
      {
        $match: {
          status: "active",
          ...(userId && {
            ownerId: new ObjectId(userId),
          }),
        },
      },
      {
        $lookup: {
          from: "attendees",
          let: { actId: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$activityId", "$$actId"] } } },
            // Join pets for role "pet"
            {
              $lookup: {
                from: "pets",
                localField: "attendeeId",
                foreignField: "_id",
                as: "petProfile",
                pipeline: [{ $project: { name: 1, image: 1, ownerId: 1 } }],
              },
            },
            // Join users for role "user"
            {
              $lookup: {
                from: "users",
                localField: "attendeeId",
                foreignField: "_id",
                as: "userProfile",
                pipeline: [{ $project: { name: 1, image: 1 } }],
              },
            },
            {
              $unwind: {
                path: "$petProfile",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $unwind: {
                path: "$userProfile",
                preserveNullAndEmptyArrays: true,
              },
            },
            // Pick profile based on role
            {
              $addFields: {
                profile: {
                  $cond: {
                    if: { $eq: ["$role", "pet"] },
                    then: "$petProfile",
                    else: "$userProfile",
                  },
                },
              },
            },
            {
              $group: {
                _id: "$attendeeId",
                name: { $first: "$profile.name" },
                image: { $first: "$profile.image" },
                role: { $first: "$role" },
                status: { $first: "$status" },
                requestMessage: { $first: "$requestMessage" },
                ownerId: { $first: "$profile.ownerId" },
                dateRanges: {
                  $push: { startDate: "$startDate", endDate: "$endDate" },
                },
              },
            },
            {
              $project: {
                _id: 0,
                attendeeId: "$_id",
                name: 1,
                image: 1,
                role: 1,
                status: 1,
                requestMessage: 1,
                ownerId: 1,
                dateRanges: 1,
              },
            },
          ],
          as: "attendees",
        },
      },
      {
        $lookup: {
          from: "users",
          let: { ownerId: "$ownerId" },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$ownerId"] } } },
            { $project: { _id: 1, name: 1, image: 1 } },
          ],
          as: "owner",
        },
      },
      {
        $unwind: {
          path: "$owner",
          preserveNullAndEmptyArrays: true,
        },
      },
      { $unset: "ownerId" },
      {
        $addFields: {
          _sortDate: {
            $ifNull: ["$startDate", new Date(8640000000000000)],
          },
        },
      },
      { $sort: { _sortDate: 1 } },
      { $unset: "_sortDate" },
    ])
    .toArray();

  return NextResponse.json(activities);
}

// POST /api/activities
export async function POST(req: Request) {
  const body = await req.json();
  const col = await activitiesCol();

  const { ownerId, ...activityBody } = body;
  if (!ownerId)
    return NextResponse.json({ error: "ownerId is required" }, { status: 400 });

  const result = await col.insertOne({
    ...activityBody,
    ownerId: new ObjectId(ownerId),
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return NextResponse.json({ id: result.insertedId }, { status: 201 });
}
