import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { Pet } from "@/lib/queries";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const petId = searchParams.get("petId");
  const userId = searchParams.get("userId");

  if (!petId && !userId) {
    return NextResponse.json(
      { error: "petId or userId required" },
      { status: 400 },
    );
  }

  const db = await getDb();

  // By petId → single pet
  if (petId) {
    const pet = await db
      .collection("pets")
      .findOne({ _id: new ObjectId(petId) }, { projection: { password: 0 } });
    if (!pet) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(pet);
  }

  // By userId → all pets belonging to that user
  const pets = await db
    .collection("pets")
    .find({ ownerId: new ObjectId(userId!) }, { projection: { password: 0 } })
    .toArray();
  return NextResponse.json(pets);
}

export async function POST(req: Request) {
  const body: Omit<Pet, "_id"> & { ownerId: string } = await req.json();

  if (!body.ownerId)
    return NextResponse.json({ error: "ownerId is required" }, { status: 400 });

  const db = await getDb();

  const petId = new ObjectId();
  const { ownerId, ...petBody } = body;
  await db.collection("pets").insertOne({
    _id: petId,
    ownerId: new ObjectId(ownerId),
    ...petBody,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return NextResponse.json({ success: true, petId });
}

export async function PATCH(req: Request) {
  const { searchParams } = new URL(req.url);
  const petId = searchParams.get("petId");

  const body: Omit<Pet, "_id"> = await req.json();

  const db = await getDb();

  await db.collection("pets").updateOne(
    { _id: new ObjectId(petId!) },
    {
      $set: {
        ...body,
        updatedAt: new Date(),
      },
    },
  );

  return NextResponse.json({ success: true });
}
