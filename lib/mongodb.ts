import { MongoClient } from "mongodb";
import { attachDatabasePool } from "@vercel/functions";

const uri = process.env.pawFriends_MONGODB_URI!;
const options: ConstructorParameters<typeof MongoClient>[1] = {};

const client = new MongoClient(uri, options);
const clientPromise = client.connect();

attachDatabasePool(client);

export async function getDb() {
  const client = await clientPromise;
  return client.db(process.env.MONGODB_DB);
}
