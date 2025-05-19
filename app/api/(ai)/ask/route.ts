import { NextResponse } from "next/server";
import { v4 as uuid } from "uuid";

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();

    if (typeof userId !== "string" || userId.trim() === "") {
      return NextResponse.json(
        { message: "Invalid User ID." },
        { status: 400 }
      );
    }

    const threadId = uuid();

    return NextResponse.json({ threadId }, { status: 201 });
  } catch (error) {
    console.error("Error creating thread:", error);
    return NextResponse.json(
      { message: "Internal Server Error." },
      { status: 500 }
    );
  }
}
