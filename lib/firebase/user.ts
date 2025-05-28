import bcrypt from "bcryptjs";
import { User } from "../types/user";
import { db } from "./app";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  writeBatch,
} from "firebase/firestore";

// Helper function to safely convert Firestore timestamp to ISO string
const toISODateString = (timestamp?: any): string | null => {
  return timestamp?.toDate?.().toISOString() ?? null;
};

export const getUserDocRefById = (userId: string) => doc(db, "users", userId);

/**
 * Fetches all users from Firestore
 */
export async function getUsers(): Promise<User[]> {
  const snapshot = await getDocs(collection(db, "users"));
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    name: doc.data().name || "",
    username: doc.data().username || "",
    email: doc.data().email || "",
    role: doc.data().role || "user",
    password: doc.data().password || "",
    division: doc.data().division || "",
    status: doc.data().status || "pending",
    category: doc.data().category || null,
    dbCreds: doc.data().dbCreds || null,
    createdAt: toISODateString(doc.data().createdAt),
  }));
}

/**
 * Fetches user by email
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  if (!email?.trim()) throw new Error("Email is required");

  const normalizedEmail = email.toLowerCase().trim();
  const q = query(
    collection(db, "users"),
    where("email", "==", normalizedEmail)
  );
  const snapshot = await getDocs(q);

  if (snapshot.empty) return null;

  const doc = snapshot.docs[0];
  return {
    id: doc.id,
    name: doc.data().name || "",
    email: doc.data().email || "",
    role: doc.data().role || "user",
    password: doc.data().password || "",
    division: doc.data().division || "",
    category: doc.data().category || null,
    status: doc.data().status || "pending",
    dbCreds: doc.data().dbCreds || null,
    createdAt: toISODateString(doc.data().createdAt),
  };
}

/**
 * Fetches user by ID
 */
export async function getUserById(userId: string): Promise<User | null> {
  if (!userId) throw new Error("User ID is required");

  const docRef = doc(db, "users", userId);
  const snapshot = await getDoc(docRef);

  if (!snapshot.exists()) return null;

  const data = snapshot.data();
  return {
    id: snapshot.id,
    email: data.email || "",
    password: data.password || "",
    name: data.name || "",
    division: data.division || "",
    status: data.status || "pending",
    role: data.role || "user",
    category: data.category || null,
    dbCreds: data.dbCreds || null,
    createdAt: toISODateString(data.createdAt),
  };
}

/**
 * Updates basic user information
 */
export async function updateUser(
  userId: string,
  userData: Partial<Omit<User, "dbCreds">>
): Promise<void> {
  if (!userId) throw new Error("User ID is required");
  await updateDoc(doc(db, "users", userId), userData);
}

/**
 * Updates database credentials for a user
 */
export async function updateUserDbCreds(
  userId: string,
  dbCreds: Omit<User["dbCreds"], "password"> & { password: string }
): Promise<void> {
  if (!userId) throw new Error("User ID is required");

  const hashedPassword = await bcrypt.hash(dbCreds.password, 10);
  await updateDoc(doc(db, "users", userId), {
    dbCreds: { ...dbCreds, password: hashedPassword },
  });
}

/**
 * Updates multiple user statuses in Firestore using a batch operation
 * @param updates Array of user ID and new status pairs
 * @throws Error if updates are invalid or batch fails
 */
export async function updateUserStatuses(
  updates: {
    userId: string;
    status: User["status"];
    category?: User["category"];
    role?: User["role"];
  }[]
): Promise<void> {
  if (!updates?.length) throw new Error("No updates provided");

  const validStatuses: User["status"][] = ["approved", "pending", "rejected"];
  const batch = writeBatch(db);

  for (const { userId, status, category, role } of updates) {
    if (!userId) throw new Error("User ID is required");
    if (!validStatuses.includes(status))
      throw new Error(`Invalid status: ${status}`);

    const userRef = doc(db, "users", userId);
    const updateData: any = { status };
    if (category) {
      updateData.category = category;
    }

    if (role) {
      updateData.role = role;
    }

    batch.update(userRef, updateData);
  }

  try {
    await batch.commit();
  } catch (error) {
    throw new Error(`Failed to update statuses: ${(error as Error).message}`);
  }
}
