import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAuth } from "@/lib/auth";
import { SignIn } from "@/components/sign-in";
export default async function Login() {
  const session = await getAuth().api.getSession({ headers: await headers() });
  if (session?.user.emailVerified) redirect("/");
  return <SignIn />;
}
