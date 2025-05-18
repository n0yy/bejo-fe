export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  role: "admin" | "user";
  division: string;
  status: "approved" | "pending" | "rejected";
  createdAt: string;
  password: string;
}
