import { NextResponse } from "next/server";
import { db } from "@/lib/firebase/app";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { hash } from "bcryptjs";
import { getUserByEmail } from "@/lib/firebase/user";

export async function POST(request: Request) {
  try {
    const data = await request.json();

    try {
      const result = await getUserByEmail(data.email);

      if (result) {
        return NextResponse.json(
          {
            status: 409,
            message: "Email already exists",
          },
          { status: 409 }
        );
      }
    } catch (error) {
      console.error("Error saat memeriksa user yang sudah ada:", error);
      return NextResponse.json(
        { error: "Something went wrong when checking data" },
        { status: 500 }
      );
    }

    // Hash password
    const hashedPassword = await hash(data.password, 10);

    // Buat data user baru
    const newUser = {
      email: data.email,
      name: data.name,
      username: data.username,
      password: hashedPassword,
      division: data.division || "",
      status: "pending", // Default
      role: "user", // Default
      createdAt: serverTimestamp(),
    };

    // Simpan user baru ke Firestore
    try {
      const usersRef = collection(db, "users");
      await addDoc(usersRef, newUser);

      return NextResponse.json(
        {
          success: true,
          message: "Register is succesfully, wait to approve by admin",
        },
        { status: 201 }
      );
    } catch (saveError) {
      console.error("Error saat menyimpan user baru:", saveError);
      return NextResponse.json(
        { error: "Gagal menyimpan data pengguna" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error pada endpoint register:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat memproses permintaan" },
      { status: 500 }
    );
  }
}
