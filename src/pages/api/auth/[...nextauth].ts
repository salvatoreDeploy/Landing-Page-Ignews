import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";

import { query as q } from "faunadb";

import { fauna } from "../../../services/faunaDB";

export const authOptions = {
  // Configure one or more authentication providers
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
      authorization: { params: { scope: "read:user" } },
    }),
  ],
  jwt: {
    secret: process.env.JWT_SIGNING_KEY,
    signingAlgorithm: "HS512",
  },

  callbacks: {
    async signIn({ user, account, profile, credentials }) {
      const { email } = user;
      try {
        await fauna.query(
          q.If(
            q.Not(
              q.Exists(
                q.Match(q.Index("user_by_email"), q.Casefold(user.email))
              )
            ),
            q.Create(q.Collection("users"), { data: { email } }),
            q.Get(q.Match(q.Index("user_by_email"), q.Casefold(user.email)))
          )
        );
        return true;
      } catch {
        return false;
      }
    },
  },
};
export default NextAuth(authOptions);
