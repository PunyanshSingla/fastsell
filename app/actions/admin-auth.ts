"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const ADMIN_COOKIE_NAME = "admin_session";
// In a real app, these should be environment variables.
// For this task, hardcoded as requested.
const ADMIN_USER = "admin";
const ADMIN_PASS = "admin123";

export async function loginAdmin(formData: FormData) {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  if (username === ADMIN_USER && password === ADMIN_PASS) {
    const cookieStore = await cookies();
    
    // Set cookie valid for 24 hours
    cookieStore.set(ADMIN_COOKIE_NAME, "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24,
      path: "/",
    });

    redirect("/admin");
  }

  return { error: "Invalid credentials" };
}

export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);
  redirect("/login");
}
