import NextAuth from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    name: string;
    division: string;
    role: string;
    category?: string;
    dbCreds?: {
      type: string;
      host: string;
      port: string;
      username: string;
      password: string;
      dbname: string;
    };
  }

  interface Session {
    user: User & {
      id: string;
      division: string;
      role: string;
      category?: string;
      dbCreds?: {
        type: string;
        host: string;
        port: string;
        username: string;
        password: string;
        dbname: string;
      };
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    division: string;
    role: string;
    category?: string;
    dbCreds?: {
      type: string;
      host: string;
      port: string;
      username: string;
      password: string;
      dbname: string;
    };
  }
}
