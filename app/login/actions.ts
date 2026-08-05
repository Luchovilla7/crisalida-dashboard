"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { checkCredentials, sessionCookieValue, SESSION_COOKIE } from "@/lib/auth";

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");
  const next = String(formData.get("next") || "/");

  const member = checkCredentials(email, password);
  if (!member) {
    redirect(`/login?error=1&next=${encodeURIComponent(next)}`);
  }

  const jar = await cookies();
  jar.set(SESSION_COOKIE, await sessionCookieValue(member.id), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  redirect(next || "/");
}
