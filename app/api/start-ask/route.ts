import { NextRequest, NextResponse } from "next/server";
import { v4 as uuid } from "uuid";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const userId = body.user_id;

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  return NextResponse.json({ userId: userId, sessionId: uuid() });
}
