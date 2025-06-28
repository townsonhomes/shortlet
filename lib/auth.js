import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import bcrypt from "bcrypt";
import NextAuth from "next-auth";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        await dbConnect();
        const user = await User.findOne({ email: credentials.email });

        if (!user) throw new Error("No user found");
        if (!user.isEmailVerified) throw new Error("Please verify your email");

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        );
        if (!isValid) throw new Error("Invalid password");

        return {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      await dbConnect();

      // If user is signing in with Google, check if they exist in DB
      if (account.provider === "google") {
        let dbUser = await User.findOne({ email: user.email });

        if (!dbUser) {
          try {
            dbUser = await User.create({
              name: user.name,
              email: user.email,
              image: user.image,
              role: "user",
              isEmailVerified: true,
            });
          } catch (error) {
            console.error("Google sign-in user creation failed:", error);
            return false;
          }
        }

        // Attach DB user fields to the session via JWT callback later
        user.id = dbUser._id.toString();
        user.role = dbUser.role;
        user.isEmailVerified = dbUser.isEmailVerified;
      }

      return true;
    },
    async session({ session, token }) {
      session.user.id = token.sub; // token.sub is user's _id
      session.user.role = token.role;
      session.user.isEmailVerified = token.isEmailVerified;
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.isEmailVerified = user.isEmailVerified;
      }
      return token;
    },
  },

  pages: {
    signIn: "/login",
  },
  secret: process.env.JWT_SECRET,
};

export const { auth } = NextAuth(authOptions);
