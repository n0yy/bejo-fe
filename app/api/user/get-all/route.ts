import { NextRequest, NextResponse } from "next/server";
import { getUsers } from "@/lib/firebase/user";

export async function GET() {
  const users = await getUsers();
  return NextResponse.json(users);
}
