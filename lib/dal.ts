import "server-only";

import { headers } from "next/headers";
import { cache } from "react";
import { auth } from "./auth";
import { redirect } from "next/navigation";

export const verifySession = cache(async () => {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });

  if (!session) {
    redirect("/login");
  }

  return { isAuth: true, userId: session.user.id };
});
