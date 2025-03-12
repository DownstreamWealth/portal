import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      status: string
    } & DefaultSession["user"]
  }

  interface User {
    id: string
    status: string
  }
}
