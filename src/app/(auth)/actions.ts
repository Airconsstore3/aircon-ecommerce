"use server";

import { revalidatePath } from "next/cache";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";

export type AuthFormState = {
  error: string | null;
  success: boolean;
  needsConfirmation?: boolean;
  alreadyRegistered?: boolean;
};

const initialState: AuthFormState = { error: null, success: false };

async function getOrigin() {
  const headersList = await headers();
  const protocol = headersList.get("x-forwarded-proto") || "https";
  const host = headersList.get("host") || "airconsstore.co.za";
  return headersList.get("origin") || `${protocol}://${host}`;
}

// Only allow same-site relative redirects — prevents open-redirect abuse.
function safeNext(value: FormDataEntryValue | null, fallback: string) {
  if (typeof value === "string" && value.startsWith("/") && !value.startsWith("//")) {
    return value;
  }
  return fallback;
}

export async function login(
  _prevState: AuthFormState = initialState,
  formData: FormData,
): Promise<AuthFormState> {
  const supabase = createClient(await cookies());

  const { error } = await supabase.auth.signInWithPassword({
    email: String(formData.get("email") || ""),
    password: String(formData.get("password") || ""),
  });

  if (error) {
    // Supabase already returns a generic message for bad credentials —
    // pass it through without adding anything more specific.
    return { error: error.message, success: false };
  }

  revalidatePath("/", "layout");
  redirect(safeNext(formData.get("next"), "/account/orders"));
}

export async function signup(
  _prevState: AuthFormState = initialState,
  formData: FormData,
): Promise<AuthFormState> {
  const password = String(formData.get("password") || "");
  const confirmPassword = String(formData.get("confirmPassword") || "");

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters.", success: false };
  }
  if (password !== confirmPassword) {
    return { error: "Passwords do not match.", success: false };
  }

  const supabase = createClient(await cookies());
  const origin = await getOrigin();

  const { data, error } = await supabase.auth.signUp({
    email: String(formData.get("email") || ""),
    password,
    options: {
      data: {
        full_name: String(formData.get("fullName") || ""),
        phone: String(formData.get("phone") || ""),
      },
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message, success: false };
  }

  // Empty identities means the email is already registered — Supabase
  // returns a fake success (and sends no email) to prevent enumeration.
  if (data.user && data.user.identities?.length === 0) {
    return { error: null, success: true, alreadyRegistered: true };
  }

  // No session means email confirmation is required before sign-in.
  if (!data.session) {
    return { error: null, success: true, needsConfirmation: true };
  }

  revalidatePath("/", "layout");
  redirect(safeNext(formData.get("next"), "/account/orders"));
}

export async function requestPasswordReset(
  _prevState: AuthFormState = initialState,
  formData: FormData,
): Promise<AuthFormState> {
  const supabase = createClient(await cookies());
  const origin = await getOrigin();

  const { error } = await supabase.auth.resetPasswordForEmail(
    String(formData.get("email") || ""),
    { redirectTo: `${origin}/auth/callback?next=/reset-password` },
  );

  if (error) {
    return { error: error.message, success: false };
  }

  return { error: null, success: true };
}

export async function updatePassword(
  _prevState: AuthFormState = initialState,
  formData: FormData,
): Promise<AuthFormState> {
  const supabase = createClient(await cookies());

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: "Your reset link has expired or is invalid. Please request a new one.",
      success: false,
    };
  }

  const password = String(formData.get("password") || "");
  const confirmPassword = String(formData.get("confirmPassword") || "");

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters.", success: false };
  }
  if (password !== confirmPassword) {
    return { error: "Passwords do not match.", success: false };
  }

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { error: error.message, success: false };
  }

  revalidatePath("/", "layout");
  redirect("/account/orders");
}

export async function signOut() {
  const supabase = createClient(await cookies());
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
