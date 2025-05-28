import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getUserByEmail } from "@/lib/firebase/user";
import { compare } from "bcryptjs";

interface FirebaseUser {
  id: string;
  email: string;
  name: string;
  division: string;
  role: string;
  status: string;
  password: string;
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

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error("Missing credentials");
          }

          const user = (await getUserByEmail(
            credentials.email
          )) as FirebaseUser;
          if (!user) {
            throw new Error("User not found");
          }

          if (user.status !== "approved") {
            throw new Error("Account not approved");
          }

          const isValid = await compare(credentials.password, user.password);
          if (!isValid) {
            throw new Error("Invalid password");
          }

          // Restrukturisasi dbCreds sesuai dengan format yang diharapkan
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            division: user.division,
            role: user.role,
            category: user.category,
            dbCreds: user.dbCreds
              ? {
                  type: user.dbCreds.type,
                  host: user.dbCreds.host,
                  port: user.dbCreds.port,
                  username: user.dbCreds.username,
                  password: user.dbCreds.password,
                  dbname: user.dbCreds.dbname,
                }
              : undefined,
          };
        } catch (error: Error | any) {
          console.error("Authorization error:", error);
          if (error.message === "Account not approved") {
            throw new Error("AccountNotApproved");
          }
          if (error.message === "Invalid password") {
            throw new Error("InvalidCredentials");
          }
          throw new Error("AuthenticationFailed");
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.division = user.division;
        token.role = user.role;
        token.dbCreds = user.dbCreds;
        token.category = user.category;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id && token.division) {
        session.user.id = token.id;
        session.user.division = token.division;
        session.user.role = token.role;
        session.user.dbCreds = token.dbCreds;
        session.user.category = token.category;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  debug: process.env.NODE_ENV === "development",
};
