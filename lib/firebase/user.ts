import { db } from "./app";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import type { User } from "@/types/user";

/**
 * Mengambil semua user
 * @returns Promise yang menyelesaikan array user
 */
export async function getUsers(): Promise<User[]> {
  const usersRef = collection(db, "users");
  const querySnapshot = await getDocs(usersRef);
  const users: User[] = [];

  querySnapshot.forEach((doc) => {
    const data = doc.data() as User & { createdAt?: any };
    users.push({
      ...data,
      createdAt: data.createdAt?.toDate?.().toISOString() ?? null,
    });
  });

  return users;
}

export async function updateUserStatus(id: string, status: string) {
  const userRef = doc(db, "users", id);
  await updateDoc(userRef, { status });
}

/**
 * Mengambil data pengguna berdasarkan email
 * @param email - Email pengguna yang dicari
 * @returns Promise yang menyelesaikan data pengguna atau null jika tidak ditemukan
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    // Memastikan email tidak kosong
    if (!email) {
      throw new Error("Email tidak boleh kosong");
    }

    // Siapkan query
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", email.toLowerCase().trim()));

    // Eksekusi query
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    // Ambil dokumen pertama
    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();

    // Kembalikan data user dengan format yang sesuai
    return {
      id: userDoc.id,
      name: userData.name || "",
      username: userData.username || "",
      email: userData.email || "",
      role: userData.role || "user",
      password: userData.password || "",
      division: userData.division || "",
      status: userData.status || "pending",
      createdAt: userData.createdAt,
    } as User;
  } catch (error) {
    console.error("Error saat mengambil user berdasarkan email:", error);
    throw error; // Re-throw error untuk penanganan di level atas
  }
}

/**
 * Mengambil data pengguna berdasarkan ID
 * @param userId - ID pengguna yang dicari
 * @returns Promise yang menyelesaikan data pengguna atau null jika tidak ditemukan
 */
export async function getUserById(userId: string): Promise<User | null> {
  try {
    // Memastikan userId tidak kosong
    if (!userId) {
      throw new Error("User ID tidak boleh kosong");
    }

    // Ambil dokumen menggunakan ID
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return null;
    }

    const userData = userSnap.data();

    // Kembalikan data user dengan format yang sesuai
    return {
      id: userSnap.id,
      email: userData.email || "",
      password: userData.password || "",
      name: userData.name || "",
      division: userData.division || "",
      status: userData.status || "pending",
      createdAt: userData.createdAt,
    } as User;
  } catch (error) {
    console.error("Error saat mengambil user berdasarkan ID:", error);
    throw error;
  }
}
