export interface User {
  id: string;
  email: string;
  password?: string;
  name: string;
  division: string;
  role?: string;
  category?: "1" | "2" | "3" | "4";
  status: "pending" | "approved" | "rejected";
  createdAt?: any;
  dbCreds?: {
    type: string;
    host: string;
    port: string;
    username: string;
    password: string;
    dbname: string;
  };
}
