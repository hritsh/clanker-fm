import NextAuth from "next-auth";
import SpotifyProvider from "next-auth/providers/spotify";
import { JWT } from "next-auth/jwt";

// Extend the Session type to include accessToken and error
declare module "next-auth" {
    interface Session {
        accessToken?: string;
        error?: string;
        user?: import("next-auth").DefaultUser;
    }
}

async function refreshAccessToken(token: JWT) {
    try {
        const url =
            "https://accounts.spotify.com/api/token?" +
            new URLSearchParams({
                client_id: process.env.SPOTIFY_CLIENT_ID as string,
                client_secret: process.env.SPOTIFY_CLIENT_SECRET as string,
                grant_type: "refresh_token",
                refresh_token: token.refreshToken as string,
            });

        const response = await fetch(url, {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            method: "POST",
        });

        const refreshedTokens = await response.json();

        if (!response.ok) {
            throw refreshedTokens;
        }

        return {
            ...token,
            accessToken: refreshedTokens.access_token,
            accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
            refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
        };
    } catch (error) {
        console.log(error);

        return {
            ...token,
            error: "RefreshAccessTokenError",
        };
    }
}

export const authOptions = {
    providers: [
        SpotifyProvider({
            clientId: process.env.SPOTIFY_CLIENT_ID as string,
            clientSecret: process.env.SPOTIFY_CLIENT_SECRET as string,
            authorization: {
                params: {
                    scope: "user-read-email user-top-read user-read-recently-played user-read-playback-state user-read-currently-playing user-library-read",
                },
            },
        }),
    ],
    callbacks: {
        async jwt({ token, account }: { token: JWT; account?: any }) {
            if (account) {
                return {
                    accessToken: account.access_token,
                    accessTokenExpires: Date.now() + (account.expires_in as number) * 1000,
                    refreshToken: account.refresh_token,
                    user: token.user,
                };
            }

            if (Date.now() < (token.accessTokenExpires as number)) {
                return token;
            }

            return refreshAccessToken(token);
        },
        async session({ session, token }: { session: any; token: JWT }) {
            session.accessToken = typeof token.accessToken === "string" ? token.accessToken : undefined;
            session.error = typeof token.error === "string" ? token.error : undefined;
            session.user = token.user as import("next-auth").DefaultUser | undefined;
            return session;
        },
    },
    pages: {
        signIn: '/login',
    },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };