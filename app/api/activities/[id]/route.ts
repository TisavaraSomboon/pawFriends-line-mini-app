import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { activitiesCol } from "@/lib/db";

// GET /api/activities/:id
export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: activityId } = await params;
  const col = await activitiesCol();

  const activity = await col
    .aggregate([
      {
        $match: {
          _id: new ObjectId(activityId),
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
              $project: {
                _id: 0,
                name: "$profile.name",
                image: "$profile.image",
                role: "$role",
                status: "$status",
                requestMessage: "$requestMessage",
                ownerId: "$profile.ownerId",
                attendeeId: "$attendeeId",
                startDate: "$startDate",
                endDate: "$endDate",
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
      { $sort: { date: 1 } },
    ])
    .toArray();

  if (!activity[0])
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(activity[0]);
}

// PATCH /api/activities/:id
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: userId } = await params;
  const body = await req.json();
  const col = await activitiesCol();

  await col.updateOne(
    { _id: new ObjectId(userId) },
    { $set: { ...body, updatedAt: new Date() } },
  );

  return NextResponse.json({ success: true });
}
