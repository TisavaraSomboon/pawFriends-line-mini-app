import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";
import { getAuthUser } from "@/lib/auth";
import { Pet } from "@/lib/queries";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const petId = searchParams.get("petId");
  const userId = searchParams.get("userId");

  const auth = await getAuthUser();

  if (!petId && !userId) {
    return NextResponse.json(
      { error: "petId or userId required" },
      { status: 400 },
    );
  }

  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB);

  // By petId → single pet
  if (petId) {
    const pet = await db
      .collection("pets")
      .findOne({ _id: new ObjectId(petId) }, { projection: { password: 0 } });
    if (!pet) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(pet);
  }

  // By userId → all pets belonging to that user
  const ownerId = userId === "owner" ? auth?.userId : userId!;
  const pets = await db
    .collection("pets")
    .find({ ownerId: new ObjectId(ownerId!) }, { projection: { password: 0 } })
    .toArray();
  return NextResponse.json(pets);
}

export async function POST(req: Request) {
  const auth = await getAuthUser();
  const body: Omit<Pet, "_id"> = await req.json();

  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB);

  const petId = new ObjectId();
  await db.collection("pets").insertOne({
    _id: petId,
    ownerId: new ObjectId(auth!.userId),
    ...body,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return NextResponse.json({ success: true, petId });
}

export async function PATCH(req: Request) {
  const { searchParams } = new URL(req.url);
  const petId = searchParams.get("petId");

  const body: Omit<Pet, "_id"> = await req.json();

  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB);

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
