import { NextRequest, NextResponse } from "next/server";
import { getAllUsers } from "@/lib/db/actions";

export async function GET() {
  const users = await getAllUsers();
  return NextResponse.json(users);
}

export async function PUT(request: NextRequest) {
  const data = await request.json();
  console.log(data);
}
