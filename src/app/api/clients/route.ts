import { NextResponse } from "next/server";
import { db } from "@/db";
import { clients } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  const allClients = await db.select().from(clients).orderBy(desc(clients.createdAt));
  return NextResponse.json(allClients);
}

export async function POST(req: Request) {
  const data = await req.json();
  const newClient = await db.insert(clients).values({
    name: data.name,
    clabe: data.clabe,
    bank: data.bank,
    notes: data.notes,
  }).returning();
  
  return NextResponse.json(newClient[0]);
}
