// app/api/users/update/route.ts
import { NextRequest, NextResponse } from "next/server";
import { updateUserStatuses } from "@/lib/db/actions";

export async function POST(request: NextRequest) {
  try {
    const { updates } = await request.json();

    if (!updates || !Array.isArray(updates)) {
      return NextResponse.json(
        { error: "Data update tidak valid" },
        { status: 400 }
      );
    }

    const result = await updateUserStatuses(updates);

    return NextResponse.json({
      success: true,
      message: `Berhasil update ${updates.length} pengguna`,
      data: result,
    });
  } catch (error) {
    console.error("Error updating users:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
