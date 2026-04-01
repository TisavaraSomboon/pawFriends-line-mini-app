import { attendeesCol } from "@/lib/db";
import { getDb } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const activityId = searchParams.get("activityId");

  if (!activityId)
    return NextResponse.json({ error: "No activity id" }, { status: 401 });

  const col = await attendeesCol();

  const attendees = await col
    .aggregate([
      {
        $match: {
          activityId: new ObjectId(activityId),
        },
      },
      // Join pet profile
      {
        $lookup: {
          from: "pets",
          localField: "attendeeId",
          foreignField: "_id",
          as: "petProfile",
          pipeline: [
            {
              $project: {
                name: 1,
                image: 1,
                breed: 1,
                size: 1,
                ownerId: 1,
                locationName: 1,
                vaccine: 1,
                fleaTick: 1,
                microchipVerified: 1,
              },
            },
          ],
        },
      },
      // Join user profile (for role "user")
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
        $unwind: { path: "$petProfile", preserveNullAndEmptyArrays: true },
      },
      {
        $unwind: { path: "$userProfile", preserveNullAndEmptyArrays: true },
      },
      // Join owner user via pet's ownerId
      {
        $lookup: {
          from: "users",
          localField: "petProfile.ownerId",
          foreignField: "_id",
          as: "ownerProfile",
          pipeline: [{ $project: { name: 1 } }],
        },
      },
      {
        $unwind: { path: "$ownerProfile", preserveNullAndEmptyArrays: true },
      },
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
          _id: 1,
          attendeeId: 1,
          role: 1,
          status: 1,
          startDate: 1,
          endDate: 1,
          requestMessage: 1,
          name: "$profile.name",
          image: "$profile.image",
          breed: "$petProfile.breed",
          size: "$petProfile.size",
          locationName: "$petProfile.locationName",
          vaccine: "$petProfile.vaccine",
          fleaTick: "$petProfile.fleaTick",
          microchipVerified: "$petProfile.microchipVerified",
          ownerName: "$ownerProfile.name",
          ownerId: "$ownerProfile._id",
        },
      },
      { $sort: { startDate: 1 } },
    ])
    .toArray();

  return NextResponse.json(attendees);
}

export async function POST(req: Request) {
  const body = await req.json();
  const db = await getDb();

  const result = await db.collection("attendees").insertOne({
    attendeeId: new ObjectId(body.attendeeId),
    activityId: new ObjectId(body.activityId),
    status: body.status,
    requestMessage: body.requestMessage,
    role: body.role,
    startDate: body.startDate ? new Date(body.startDate) : null,
    endDate: body.endDate ? new Date(body.endDate) : null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const response = NextResponse.json(
    { id: result.insertedId },
    { status: 201 },
  );

  return response;
}

export async function PATCH(req: Request) {
  const body = await req.json();
  const col = await attendeesCol();

  await col.updateOne(
    { _id: new ObjectId(body._id) },
    { $set: { status: body.status, updatedAt: new Date() } },
  );

  return NextResponse.json({ success: true });
}
