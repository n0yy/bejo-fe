import { type NextRequest, NextResponse } from "next/server";
import { pinata } from "@/lib/pinata/config";

export async function POST(request: NextRequest) {
  const { cid } = await request.json();

  if (!cid) {
    return NextResponse.json({ message: "We need CID" }, { status: 401 });
  }

  try {
    const url = await pinata.gateways.public.convert(cid);
    return NextResponse.json({ url }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 503 }
    );
  }
}
