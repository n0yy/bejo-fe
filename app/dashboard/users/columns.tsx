export type User = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  division: string;
  status: "approved" | "pending" | "rejected";
};
