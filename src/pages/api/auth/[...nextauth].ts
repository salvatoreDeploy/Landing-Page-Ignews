import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";

import { Get, query as q } from "faunadb";

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
    async session({ session }) {
      try {
        const userActiveSubscription = await fauna.query(
          q.Get(
            q.Intersection([
              q.Match(
                q.Index("subscription_by_user_ref"),
                q.Select(
                  "ref",
                  q.Get(
                    q.Match(
                      q.Index("user_by_email"),
                      q.Casefold(session.user?.email)
                    )
                  )
                )
              ),
              q.Match(q.Index("subscription_by_status"), "active"),
            ])
          )
        );
        return {
          ...session,
          activeSubscription: userActiveSubscription,
        };
      } catch (error) {
        console.log(error);
        return {
          ...session,
          activeSubscription: null,
        };
      }
    },
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
