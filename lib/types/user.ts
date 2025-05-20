export interface User {
  id: string;
  email: string;
  password?: string;
  name: string;
  division: string;
  role?: string;
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
