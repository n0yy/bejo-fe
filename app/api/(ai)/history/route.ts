import { NextResponse, type NextRequest } from "next/server";
import {
  getChatHistoryByThreadId,
  getChatHistoryByUserId,
  insertChatHistory,
  deleteChatHistory,
} from "@/lib/db/actions";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const threadId = searchParams.get("threadId");
    const userId = searchParams.get("userId");

    if (!threadId && !userId) {
      return NextResponse.json(
        { message: "Invalid request." },
        { status: 400 }
      );
    }

    if (threadId && userId) {
      return NextResponse.json(
        { message: "Invalid request." },
        { status: 400 }
      );
    }

    let chatHistory;
    if (threadId) {
      chatHistory = await getChatHistoryByThreadId(threadId);
    }

    if (userId) {
      chatHistory = await getChatHistoryByUserId(userId);
    }

    return NextResponse.json({
      success: true,
      histories: chatHistory,
    });
  } catch (error) {
    console.error("Error getting chat history: ", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { threadId, userId, messages } = data;

    if (!threadId || !userId || !messages) {
      return NextResponse.json(
        { message: "Invalid request." },
        { status: 400 }
      );
    }

    const result = await insertChatHistory({
      threadId,
      userId,
      messages,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error inserting chat history: ", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const threadId = searchParams.get("threadId");

    if (!threadId) {
      return NextResponse.json(
        { message: "Invalid request." },
        { status: 400 }
      );
    }

    await deleteChatHistory(threadId);

    return NextResponse.json({
      success: true,
      data: "Chat history deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting chat history: ", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
