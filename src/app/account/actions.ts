"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

import { createClient } from "@/utils/supabase/server";

export type ProfileFormState = {
  error: string | null;
  success: boolean;
};

export async function updateProfile(
  _prevState: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const supabase = createClient(await cookies());

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You are not signed in.", success: false };
  }

  const contactMethod = String(formData.get("contactMethod") || "both");

  const { error } = await supabase.auth.updateUser({
    data: {
      full_name: String(formData.get("fullName") || ""),
      phone: String(formData.get("phone") || ""),
      contact_method: ["whatsapp", "email", "both"].includes(contactMethod)
        ? contactMethod
        : "both",
    },
  });

  if (error) {
    return { error: error.message, success: false };
  }

  revalidatePath("/account/profile");
  return { error: null, success: true };
}
