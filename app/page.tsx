import { cookies } from "next/headers";
import TregexPage from "@/components/tregex";
import { decrypt } from "@/lib/session";
export default async function Page() {
  let isLoggedIn = false;
  let username: string | null = null;

  const cookie = (await cookies()).get('session')?.value
  const session = await decrypt(cookie)
  if (session?.username) {
    isLoggedIn = true;
    username = session.username as string;
  }
  
  console.log("isLoggedIn", isLoggedIn, "username", username);
  return <TregexPage isLoggedIn={isLoggedIn} username={username} />;
}