import { pinata } from "@/lib/pinata/config";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const url = await pinata.upload.public.createSignedURL({ expires: 30 });
    return NextResponse.json({ url }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "Error creating API Key" },
      { status: 500 }
    );
  }
}
