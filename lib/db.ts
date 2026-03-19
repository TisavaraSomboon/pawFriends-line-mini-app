import clientPromise from "./mongodb";
import { Db, Collection, ObjectId } from "mongodb";

export type UserDoc = {
  _id?: ObjectId;
  email: string;
  name?: string;
  password?: string;
  image?: string;
  locationName?: string;
  latitude?: number;
  longitude?: number;
  bio?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type DogDoc = {
  _id?: ObjectId;
  ownerId: ObjectId;
  name: string;
  breed: string;
  size: "small" | "medium" | "large";
  energyLevel: number; // 1–5
  vaccineStatus: "Up to Date" | "Due Soon";
  fleaTick: "Protected" | "Not Protected";
  bio?: string;
  image?: string;
  emotions: string[];
  goodWith: string[];
  behaviorTraits: string[];
  socialStyle?: string;
  considerNote?: string;
  createdAt: Date;
};

export type ActivityDoc = {
  _id?: ObjectId;
  hostId: ObjectId;
  title: string;
  description?: string;
  locationName: string;
  latitude?: number;
  longitude?: number;
  date: Date;
  type: string;
  dogSize: string;
  maxDogs: number;
  image?: string;
  status: "active" | "ended";
  createdAt: Date;
  updatedAt: Date;
};

export type JoinRequestDoc = {
  _id?: ObjectId;
  userId: ObjectId;
  activityId: ObjectId;
  status: "pending" | "approved" | "rejected";
  message?: string;
  createdAt: Date;
};

async function getDb(): Promise<Db> {
  const client = await clientPromise;
  return client.db(process.env.MONGODB_DB);
}

export async function usersCol(): Promise<Collection<UserDoc>> {
  const db = await getDb();
  return db.collection<UserDoc>("users");
}

export async function activitiesCol(): Promise<Collection<ActivityDoc>> {
  const db = await getDb();
  return db.collection<ActivityDoc>("activities");
}

export async function joinRequestsCol(): Promise<Collection<JoinRequestDoc>> {
  const db = await getDb();
  return db.collection<JoinRequestDoc>("joinRequests");
}
