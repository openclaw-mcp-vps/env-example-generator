import type { NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";

const githubClientId = process.env.GITHUB_ID;
const githubClientSecret = process.env.GITHUB_SECRET;

export const isGithubAuthConfigured = Boolean(githubClientId && githubClientSecret);

export const authOptions: NextAuthOptions = {
  providers: isGithubAuthConfigured
    ? [
        GitHubProvider({
          clientId: githubClientId as string,
          clientSecret: githubClientSecret as string
        })
      ]
    : [],
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account?.provider === "github" && account.access_token) {
        token.githubAccessToken = account.access_token;
      }

      if (profile && typeof profile === "object" && "login" in profile) {
        token.login = String(profile.login);
      }

      return token;
    },
    async session({ session, token }) {
      session.githubAccessToken = token.githubAccessToken;
      if (session.user && token.login) {
        session.user.login = token.login;
      }
      return session;
    }
  },
  pages: {
    signIn: "/dashboard"
  }
};
