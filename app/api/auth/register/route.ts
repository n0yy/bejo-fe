import { NextResponse } from "next/server";
import { serverTimestamp } from "firebase/firestore";
import { hash } from "bcryptjs";
import { createUser, getUserByEmail } from "@/lib/db/actions";

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Validasi input dasar
    if (!data.email || !data.name || !data.password || !data.division) {
      return NextResponse.json(
        {
          status: 400,
          message: "Semua field wajib diisi",
        },
        { status: 400 }
      );
    }

    // Cek apakah email sudah ada
    try {
      const existingUser = await getUserByEmail(data.email);

      if (existingUser) {
        return NextResponse.json(
          {
            status: 409,
            message: "Email sudah terdaftar",
          },
          { status: 409 }
        );
      }
    } catch (error) {
      console.error("Error saat memeriksa email yang sudah ada:", error);
      return NextResponse.json(
        {
          status: 500,
          message: "Terjadi kesalahan saat memeriksa data",
        },
        { status: 500 }
      );
    }

    // Hash password
    const hashedPassword = await hash(data.password, 10);

    // Buat data user baru
    const newUser = {
      email: data.email,
      name: data.name,
      password: hashedPassword,
      division: data.division,
      status: "pending",
      role: "user",
      category: "1",
      createdAt: serverTimestamp(),
    };

    try {
      await createUser(newUser);

      return NextResponse.json(
        {
          success: true,
          message:
            "Registrasi berhasil! Silakan tunggu persetujuan dari admin.",
        },
        { status: 201 }
      );
    } catch (saveError) {
      console.error("Error saat menyimpan user baru:", saveError);
      return NextResponse.json(
        {
          status: 500,
          message: "Gagal menyimpan data pengguna",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error pada endpoint register:", error);
    return NextResponse.json(
      {
        status: 500,
        message: "Terjadi kesalahan saat memproses permintaan",
      },
      { status: 500 }
    );
  }
}
